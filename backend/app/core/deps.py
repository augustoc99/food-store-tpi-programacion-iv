from collections.abc import Callable
from typing import Annotated
from fastapi import Depends, HTTPException, Request
from sqlmodel import Session
from app.core.database import get_session
from app.core.security import decode_access_token
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.repository import UsuarioRepository

def get_current_user(request: Request, db: Annotated[Session, Depends(get_session)]) -> Usuario:
    token = request.cookies.get('access_token')
    username = decode_access_token(token) if token else None
    if not username:
        raise HTTPException(401, 'Sesión no válida o vencida')
    user = UsuarioRepository(db).get_by_username(username)
    if user is None:
        raise HTTPException(401, 'Sesión no válida o vencida')
    return user

def get_current_active_user(user: Annotated[Usuario, Depends(get_current_user)]) -> Usuario:
    if user.disabled:
        raise HTTPException(400, 'Cuenta de usuario desactivada')
    return user

def require_role(roles: list[str]) -> Callable:
    def guard(user: Annotated[Usuario, Depends(get_current_active_user)]) -> Usuario:
        if user.role not in roles:
            raise HTTPException(403, 'Permisos insuficientes')
        return user
    return guard
