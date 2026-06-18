import os
from typing import List, Optional
from datetime import datetime, timedelta

from fastapi import FastAPI, HTTPException, Depends, Response, Cookie
from fastapi.middleware.cors import CORSMiddleware
from fastapi import status
from pydantic import BaseModel

from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

import cloudinary
import cloudinary.uploader

from dotenv import load_dotenv

from jose import JWTError, jwt

load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL')
CLOUDINARY_CLOUD_NAME = os.getenv('CLOUDINARY_CLOUD_NAME')
CLOUDINARY_API_KEY = os.getenv('CLOUDINARY_API_KEY')
CLOUDINARY_API_SECRET = os.getenv('CLOUDINARY_API_SECRET')

# Auth settings from .env
ADMIN_USERNAME = os.getenv('ADMIN_USERNAME')
ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD')
SECRET_KEY = os.getenv('SECRET_KEY')
ALGORITHM = os.getenv('ALGORITHM', 'HS256')
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv('ACCESS_TOKEN_EXPIRE_MINUTES', '60'))
FRONTEND_URL = os.getenv('FRONTEND_URL', 'https://newfacefurniture.co.ke')

if not DATABASE_URL:
    raise RuntimeError('Set DATABASE_URL in .env')
if not (CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET and CLOUDINARY_CLOUD_NAME):
    raise RuntimeError('Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env')
if not (ADMIN_USERNAME and ADMIN_PASSWORD and SECRET_KEY):
    raise RuntimeError('Set ADMIN_USERNAME, ADMIN_PASSWORD and SECRET_KEY in .env for admin auth')

cloudinary.config(
    cloud_name=CLOUDINARY_CLOUD_NAME,
    api_key=CLOUDINARY_API_KEY,
    api_secret=CLOUDINARY_API_SECRET,
)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()


class Image(Base):
    __tablename__ = 'images'
    id = Column(Integer, primary_key=True, index=True)
    public_id = Column(String(255), unique=True, nullable=False)
    secure_url = Column(String(1024), nullable=False)
    title = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


Base.metadata.create_all(bind=engine)

app = FastAPI(title='FastAPI Cloudinary Example')

# Allow CORS from frontend and allow cookies
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def get_current_admin(access_token: Optional[str] = Cookie(None), authorization: Optional[str] = None):
    token = None
    if access_token:
        token = access_token
    elif authorization and authorization.startswith('Bearer '):
        token = authorization.split(' ', 1)[1]
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Not authenticated')
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get('sub')
        if username is None or username != ADMIN_USERNAME:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid credentials')
        return username
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid token')


class ImageCreate(BaseModel):
    public_id: str
    secure_url: str
    title: str | None = None
    description: str | None = None


class ImageOut(BaseModel):
    id: int
    public_id: str
    secure_url: str
    title: str | None
    description: str | None

    class Config:
        orm_mode = True


@app.post('/images', response_model=ImageOut)
def create_image(payload: ImageCreate, current_admin: str = Depends(get_current_admin)):
    """Store an uploaded image record in Postgres.

    The frontend may upload directly to Cloudinary (unsigned) and then call this
    endpoint with the Cloudinary `public_id` and `secure_url` along with title/description.
    """
    db = SessionLocal()
    existing = db.query(Image).filter(Image.public_id == payload.public_id).first()
    if existing:
        raise HTTPException(status_code=400, detail='Image already exists')
    img = Image(public_id=payload.public_id, secure_url=payload.secure_url, title=payload.title, description=payload.description)
    db.add(img)
    db.commit()
    db.refresh(img)
    db.close()
    return img


@app.get('/images', response_model=List[ImageOut])
def list_images():
    db = SessionLocal()
    items = db.query(Image).order_by(Image.created_at.desc()).all()
    db.close()
    return items


@app.delete('/images/{public_id}')
def delete_image(public_id: str, current_admin: str = Depends(get_current_admin)):
    """Delete an image from Cloudinary and from the database.

    Cloudinary deletion uses your API secret and must be performed server-side.
    """
    db = SessionLocal()
    img = db.query(Image).filter(Image.public_id == public_id).first()
    if not img:
        db.close()
        raise HTTPException(status_code=404, detail='Image not found')

    # Delete from Cloudinary
    try:
        res = cloudinary.uploader.destroy(public_id, invalidate=True)
    except Exception as e:
        db.close()
        raise HTTPException(status_code=500, detail=f'Cloudinary delete failed: {e}')

    if res.get('result') not in ('ok', 'not found', 'deleted'):
        db.close()
        raise HTTPException(status_code=500, detail=f'Unexpected Cloudinary response: {res}')

    # Remove from DB
    db.delete(img)
    db.commit()
    db.close()
    return {'deleted': True, 'public_id': public_id}


class TokenRequest(BaseModel):
    username: str
    password: str


@app.post('/auth/login')
def login(req: TokenRequest, response: Response):
    if req.username != ADMIN_USERNAME or req.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid username or password')

    token = create_access_token({'sub': req.username})
    # set token as httpOnly cookie
    response.set_cookie(key='access_token', value=token, httponly=True, samesite='lax')
    return {'ok': True}


@app.post('/auth/logout')
def logout(response: Response):
    response.delete_cookie('access_token')
    return {'ok': True}


@app.get('/auth/me')
def me(current_admin: str = Depends(get_current_admin)):
    return {'username': current_admin}
