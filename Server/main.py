from typing import Optional, List, Dict, Mapping
from datetime import datetime, timedelta
from fastapi import Depends, FastAPI, Query, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr, SecretStr
import pymongo
import json

SECRET_KEY = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None


class LoginUser(BaseModel):
    email: EmailStr
    password: str

    class Config:
        schema_extra = {
            'example': {
                'email': 'me@mail.com',
                'password': 'secret'
            }
        }


class User(BaseModel):
    email: EmailStr
    categories: Optional[List[str]]

    class Config:
        schema_extra = {
            'example': {
                'email': 'me@mail.com',
                'categories': ['Castillo', 'HUESCA']
            }
        }


class UserInDB(User):
    hashed_password: str


class Place(BaseModel):
    name: str
    location: Dict
    description: str = ''
    municipality: str = ''
    categories: List[str] = []

    class Config:
        schema_extra = {
            'example': {
                'name': 'Castillo',
                'location':  '{\'type\': \'Point\', \'coordinates\': [-73.856077, 40.848447]}',
                'description': 'A very nice castle',
                'municipality': 'Teruel',
                'categories': ['Castillo', 'Teruel', 'Ruinas']
            }
        }


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
app = FastAPI()


def get_mongo_db():
    client = pymongo.MongoClient('localhost', 27017)
    db = client.rutafy_db
    return db


def load_db():
    db = get_mongo_db()

    with open('data/bienes_inmuebles.json') as fp:
        docs = json.load(fp)['response']['docs']

    with open('data/bienes_paleontologia.json') as fp:
        docs += json.load(fp)['response']['docs']

    places = []

    for doc in docs:
        place = {}

        name = ''
        location = {'type': 'Point', 'coordinates': [0.0, 0.0]}
        description = ''
        municipality = ''
        categories = []

        if 'location' in doc.keys():
            name = doc['title']

        if 'location' in doc.keys():
            coordinates = [float(i) for i in doc['location'].split(',')]
            location['coordinates'] = coordinates

        if 'description' in doc.keys():
            description = doc['description']

        if 'municipio' in doc.keys():
            municipality = doc['municipio']

        if 'assetCategoryNames' in doc.keys():
            categories = doc['assetCategoryNames']

        place['location'] = location
        place['name'] = name
        place['description'] = description
        place['municipality'] = municipality
        place['categories'] = categories

        places += [place]

    db.bienes.insert_many(places)


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str):
    return pwd_context.hash(password)


def get_user_from_db(email: str) -> UserInDB:
    db = get_mongo_db()
    user = db.users.find_one({'email': email})
    if user:
        return UserInDB(**user)


def authenticate_user(email: str, password: str):
    user = get_user_from_db(email)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    user = get_user_from_db(token_data.email)
    if user is None:
        raise credentials_exception
    return user


@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@app.post('/user', response_model=User)
def add_user(user: LoginUser):
    db = get_mongo_db()
    new_user = UserInDB(email=user.email, hashed_password=get_password_hash(user.password))
    insert = db.users.insert_one(new_user.dict())
    result = User(**db.users.find_one({'_id': insert.inserted_id}))
    return result


@app.get("/user", response_model=User)
async def get_user(current_user: User = Depends(get_current_user)):
    return current_user


@app.get('/categories', response_model=List[str])
def get_categories():
    db = get_mongo_db()
    categories = db.bienes.distinct('categories')
    return categories


@app.get('/places', response_model=List[Place])
def get_places_by_category(category: Optional[List[str]] = Query(None)):
    db = get_mongo_db()
    items = [Place(**i) for i in db.bienes.find({'categories': {'$in': category}})]
    return items


if __name__ == '__main__':
    import uvicorn

    if get_mongo_db().list_collection_names().__len__() == 0:
        load_db()

    uvicorn.run("main:app", host="127.0.0.1", port=8000, log_level="info")
