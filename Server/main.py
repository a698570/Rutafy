from typing import Optional, List, Dict
from datetime import datetime, timedelta
from fastapi import Depends, FastAPI, Query, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from jose import JWTError, jwt
from passlib.context import CryptContext
import hashlib
from pydantic import BaseModel, BaseSettings, EmailStr
import pymongo
import json
from geopy.distance import geodesic

ALGORITHM = 'HS256'
ACCESS_TOKEN_EXPIRE_MINUTES = 30


class Settings(BaseSettings):
    secret_key: str
    mongo_user: str = ''
    mongo_pwd: str = ''
    mongo_host: str
    mongo_port: int

    class Config:
        env_file = '.env'


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


class Location(BaseModel):
    type: str = 'Point'
    coordinates: List[float]

    class Config:
        schema_extra = {
            'example': {
                'type': 'Point',
                'coordinates': [-73.856077, 40.848447]
            }
        }


class Place(BaseModel):
    name: str
    location: Location
    description: str = ''
    municipality: str = ''
    categories: List[str] = []

    class Config:
        schema_extra = {
            'example': {
                'name': 'Castillo',
                'location': {
                    'type': 'Point',
                    'coordinates': [-73.856077, 40.848447]
                },
                'description': 'A very nice castle',
                'municipality': 'Teruel',
                'categories': ['Castillo', 'Teruel', 'Ruinas']
            }
        }


class Route(BaseModel):
    id: str
    minutes: int
    categories: List[str] = []
    places: List[Place] = []

    class Config:
        schema_extra = {
            'example': {
                'id': 'jjhbyybkiu2342',
                'minutes': 300,
                'categories': ['Castillo', 'Teruel', 'Ruinas'],
                'places': [{
                    'name': 'Castillo',
                    'location': {
                        'type': 'Point',
                        'coordinates': [-73.856077, 40.848447]
                    },
                    'description': 'A very nice castle',
                    'municipality': 'Teruel',
                    'categories': ['Castillo', 'Teruel', 'Ruinas']
                }]
            }
        }


settings = Settings()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
app = FastAPI()

origins = [
    'http://localhost:3000',
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


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
            location = Location(**location)

        if 'description' in doc.keys():
            description = doc['description']

        if 'municipio' in doc.keys():
            municipality = doc['municipio']

        if 'assetCategoryNames' in doc.keys():
            categories = doc['assetCategoryNames']

        place = Place(
            name=name,
            location=location,
            description=description,
            municipality=municipality,
            categories=categories
        )

        places += [place.dict()]

    db.places.create_index([('name', pymongo.ASCENDING)])
    db.places.create_index([('location', pymongo.GEOSPHERE)])
    db.places.insert_many(places)

    db.routes.create_index([('id', pymongo.ASCENDING)], unique=True)


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
        detail='Could not validate credentials',
        headers={'WWW-Authenticate': 'Bearer'},
    )
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
        email: str = payload.get('sub')
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    user = get_user_from_db(token_data.email)
    if user is None:
        raise credentials_exception
    return user


# Returns minutes
def route_time(places: List[Place]) -> int:
    time = 0
    speed = 1.5  # km/min
    time_visit_place = 30  # minutes

    # Time spent walking around each place visited
    time += len(places) * time_visit_place

    # Estimated time spent traveling between places
    for place_1, place_2 in zip(places, places[1:]):
        pos_1 = place_1.location.coordinates
        pos_2 = place_2.location.coordinates
        distance = geodesic(pos_1, pos_2).kilometers
        time += int(distance / speed)

    return time


def plan_route(time_limit: int, places: List[Place], categories: List[str]) -> Route:
    db = get_mongo_db()

    time = route_time(places)

    # Keep adding intermediate places to visit until the route is long enough
    while time < time_limit:
        big_i = 0
        big_distance = 0

        # Select the pair of consecutive places in the route with bigger distance
        for i in range(len(places) - 1):
            pos_1 = places[i].location.coordinates
            pos_2 = places[i+1].location.coordinates
            distance = geodesic(pos_1, pos_2).meters
            if distance > big_distance:
                big_distance = distance
                big_i = i

        # Find a new place between the selected places and insert it
        pos_1 = places[big_i].location.coordinates
        pos_2 = places[big_i + 1].location.coordinates
        middle = [(pos_1[0] + pos_2[0]) / 2, (pos_1[1] + pos_2[1]) / 2]
        radius = (big_distance / 2) * 0.8

        result = db.places.find_one(
            {
                'location': {
                    '$near': {
                        '$geometry': {
                            'type': 'Point',
                            'coordinates': middle
                        },
                        '$maxDistance': radius  # meters
                    }
                },
                'categories': {'$in': categories}
            }
        )

        if result:
            new_place = Place(**result)
        else:
            # TODO: add a better way to handle not finding a new place between a pair
            break

        places = places[:big_i+1] + [new_place] + places[big_i+1:]

        time = route_time(places)

    route_categories = set()

    for p in places:
        route_categories.update(p.categories)

    route = Route(
        id=hashlib.sha1(''.join([i.name for i in places]).encode('utf8')).hexdigest(),
        minutes=route_time(places),
        categories=list(route_categories),
        places=places
    )

    return route


@app.post('/token', response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Incorrect username or password',
            headers={'WWW-Authenticate': 'Bearer'},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={'sub': user.email}, expires_delta=access_token_expires
    )
    return {'access_token': access_token, 'token_type': 'bearer'}


@app.post('/user', response_model=User)
def add_user(user: LoginUser):
    db = get_mongo_db()
    new_user = UserInDB(email=user.email, hashed_password=get_password_hash(user.password))
    insert = db.users.insert_one(new_user.dict())
    result = User(**db.users.find_one({'_id': insert.inserted_id}))
    return result


@app.get('/user', response_model=User)
async def get_user(current_user: User = Depends(get_current_user)):
    return current_user


@app.post('/user/categories', response_model=User)
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
            detail='Name not found',
        )

    return Place(**result)


@app.post('/places/{name}/fav')
def make_place_favourite(name: str, user: User = Depends(get_current_user)):
    db = get_mongo_db()
    result = db.places.find_one({'name': name})

    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Name not found',
        )

    db.users.update({'email': user.email}, {'$addToSet': {'fav_places': result['_id']}})


@app.get('/routes', response_model=List[Route])
def get_routes(
        minutes: int,
        places_names: Optional[List[str]] = Query(None),
        categories: Optional[List[str]] = Query(None)):
    db = get_mongo_db()
    time_margin = 30  # minutes

    if not categories:
        categories = []

    if not places_names:
        places_names = []
        places = []
    else:
        places = [Place(**i) for i in db.places.find({'name': {'$in': places_names}})]

    # TODO: implement a better way to handle not receiving initial places
    if len(places) < 2:
        return []

    routes = [i for i in db.routes.find(
        {
            'minutes': {'$elemMatch': {'$lte': minutes + time_margin, '$gte': minutes - time_margin}},
            'places.name': {'$all': places_names},
            'categories': {'$all': categories}
        })]

    if len(routes) == 0:
        route = plan_route(minutes, places, categories)
        try:
            db.routes.insert(route.dict())
        except pymongo.errors.DuplicateKeyError:
            pass

        routes = [route]

    return routes


@app.post('/routes/{route_id}/fav')
def make_place_favourite(route_id: str, user: User = Depends(get_current_user)):
    db = get_mongo_db()
    result = db.routes.find_one({'id': route_id})

    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Name not found',
        )

    db.users.update({'email': user.email}, {'$addToSet': {'fav_routes': result['id']}})


@app.get('/fav/places', response_model=List[Place])
async def get_fav_places(user: User = Depends(get_current_user)):
    db = get_mongo_db()
    ids = db.users.find_one({'email': user.email})['fav_places']
    places = [Place(**i) for i in db.places.find({'_id': {'$in': ids}})]

    return places


@app.get('/fav/routes', response_model=List[Route])
async def get_fav_routes(user: User = Depends(get_current_user)):
    db = get_mongo_db()
    ids = db.users.find_one({'email': user.email})['fav_routes']
    routes = [Route(**i) for i in db.routes.find({'id': {'$in': ids}})]

    return routes

if __name__ == '__main__':
    import uvicorn

    if len(get_mongo_db().list_collection_names()) == 0:
        load_db()

    uvicorn.run('main:app', host='127.0.0.1', port=8000, log_level='info')
