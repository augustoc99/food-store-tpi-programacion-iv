from typing import Annotated
from fastapi import APIRouter, Depends, Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session
from app.core.config import get_settings
from app.core.database import get_session
from app.core.deps import get_current_active_user
from app.core.security import create_access_token
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.service import UsuarioService
from .schemas import LoginResult
from .service import AuthService

router = APIRouter(prefix='/auth', tags=['Autenticación'])
DB = Annotated[Session, Depends(get_session)]

@router.post('/register', status_code=201, response_model=UserPublic)
def register(data: UserCreate, db: DB):
    return UsuarioService(db).register(data)

@router.post('/token', response_model=LoginResult)
def login(form: Annotated[OAuth2PasswordRequestForm, Depends()], response: Response, db: DB):
    user = AuthService(db).login(form.username, form.password)
    cfg = get_settings()
    response.set_cookie('access_token', create_access_token(user.username), httponly=True,
                        secure=cfg.COOKIE_SECURE, samesite='lax',
                        max_age=cfg.ACCESS_TOKEN_EXPIRE_MINUTES * 60, path='/')
    return LoginResult(message='Login exitoso')

@router.post('/logout', response_model=LoginResult)
def logout(response: Response):
    response.delete_cookie('access_token', path='/', httponly=True,
                           secure=get_settings().COOKIE_SECURE, samesite='lax')
    return LoginResult(message='Sesión cerrada')

@router.get('/me', response_model=UserPublic)
def me(user: Annotated[Usuario, Depends(get_current_active_user)]):
    return UserPublic.model_validate(user)
