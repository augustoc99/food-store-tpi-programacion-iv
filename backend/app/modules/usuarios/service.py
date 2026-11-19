from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session
from .models import Usuario
from .schemas import UserCreate, UserPublic
from .repository import UsuarioRepository
from app.core.security import hash_password, verify_password

class UsuarioService:
    def __init__(self, session: Session):
        self.session = session
        self.repo = UsuarioRepository(session)

    def register(self, data: UserCreate) -> UserPublic:
        username, email = data.username.strip(), str(data.email).lower()
        if self.repo.get_by_username(username) or self.repo.get_by_email(email):
            raise HTTPException(409, 'Usuario o correo duplicado')
        user = Usuario(username=username, email=email, full_name=data.full_name.strip(),
                       hashed_password=hash_password(data.password), role='user')
        self.session.add(user)
        try:
            self.session.commit()
            self.session.refresh(user)
        except IntegrityError as exc:
            self.session.rollback()
            raise HTTPException(409, 'Usuario o correo duplicado') from exc
        return UserPublic.model_validate(user)

    def authenticate(self, username: str, password: str) -> Usuario:
        user = self.repo.get_by_username(username)
        if not user or not verify_password(password, user.hashed_password):
            raise HTTPException(401, 'Credenciales incorrectas')
        if user.disabled:
            raise HTTPException(400, 'Cuenta de usuario desactivada')
        return user

    def change_disabled(self, user_id: int, disabled: bool, actor_id: int) -> UserPublic:
        user = self.repo.get_by_id(user_id)
        if not user:
            raise HTTPException(404, 'Usuario no encontrado')
        if disabled and user_id == actor_id:
            raise HTTPException(400, 'El administrador no puede desactivarse a sí mismo')
        user.disabled = disabled
        self.session.add(user)
        self.session.commit()
        self.session.refresh(user)
        return UserPublic.model_validate(user)
