from typing import Optional, List, Dict
from datetime import datetime, timedelta
from fastapi import Depends, FastAPI, Query, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, BaseSettings, EmailStr
import pymongo
import json

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


class Settings(BaseSettings):
    secret_key: str
    mongo_user: str = ''
    mongo_pwd: str = ''
    mongo_host: str
    mongo_port: int

    class Config:
        env_file = ".env"


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
    categories: List[str] = []

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


settings = Settings()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
app = FastAPI()


def get_mongo_db():
    if settings.mongo_user != '':
        mongo_server = f'mongodb+srv://{settings.mongo_user}:{settings.mongo_pwd}@{settings.mongo_host}'
    else:
        mongo_server = f'{settings.mongo_host}'

    client = pymongo.MongoClient(host=mongo_server, port=settings.mongo_port)
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

        if 'title' in doc.keys():
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

    db.places.create_index([("name", pymongo.DESCENDING)])
    db.places.insert_many(places)


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
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
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


@app.post("/user/categories", response_model=User)
async def add_user_categories(categories: List[str], user: User = Depends(get_current_user)):
    db = get_mongo_db()
    db.users.update({'email': user.email}, {'$addToSet': {'categories': {'$each': categories}}})
    result = User(**db.users.find_one({'email': user.email}))
    return result


@app.get('/categories', response_model=List[str])
def get_categories():
    db = get_mongo_db()
    categories = db.places.distinct('categories')
    return categories


@app.get('/places', response_model=List[Place])
def get_places_list(categories: Optional[List[str]] = Query(None)):
    db = get_mongo_db()
    if categories:
        items = [Place(**i) for i in db.places.find({'categories': {'$in': categories}})]
    else:
        items = [Place(**i) for i in db.places.find()]
    return items


@app.get('/places/{name}', response_model=Place)
def get_place(name: str):
    db = get_mongo_db()
    result = db.places.find_one({'name': name})

    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Name not found",
        )

    return Place(**result)


@app.post('/places/{name}/fav')
def make_place_favourite(name: str, user: User = Depends(get_current_user)):
    db = get_mongo_db()
    result = db.places.find_one({'name': name})

    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Name not found",
        )

    db.users.update({'email': user.email}, {'$addToSet': {'fav_places': result['_id']}})


@app.get("/fav/places", response_model=List[Place])
async def get_fav_places(user: User = Depends(get_current_user)):
    db = get_mongo_db()
    ids = db.users.find_one({'email': user.email})['fav_places']
    places = [i for i in db.places.find({'_id': {'$in': ids}})]

    return places


if __name__ == '__main__':
    import uvicorn

    if get_mongo_db().list_collection_names().__len__() == 0:
        load_db()

    uvicorn.run("main:app", host="127.0.0.1", port=8000, log_level="info")
