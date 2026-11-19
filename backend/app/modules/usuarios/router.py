from typing import Annotated
from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.core.database import get_session
from app.core.deps import require_role
from .models import Usuario
from .schemas import UserPublic
from .repository import UsuarioRepository
from .service import UsuarioService

router = APIRouter(prefix='/admin/usuarios', tags=['Usuarios'])
Admin = Annotated[Usuario, Depends(require_role(['admin']))]
DB = Annotated[Session, Depends(get_session)]

@router.get('', response_model=list[UserPublic])
def listar(admin: Admin, db: DB):
    return [UserPublic.model_validate(u) for u in UsuarioRepository(db).get_all()]

@router.post('/{user_id}/activar', response_model=UserPublic)
def activar(user_id: int, admin: Admin, db: DB):
    return UsuarioService(db).change_disabled(user_id, False, admin.id)

@router.post('/{user_id}/desactivar', response_model=UserPublic)
def desactivar(user_id: int, admin: Admin, db: DB):
    return UsuarioService(db).change_disabled(user_id, True, admin.id)
