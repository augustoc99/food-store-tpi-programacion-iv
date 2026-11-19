from sqlmodel import Session
from app.modules.usuarios.service import UsuarioService

class AuthService:
    def __init__(self, session: Session):
        self.usuarios = UsuarioService(session)

    def login(self, username: str, password: str):
        return self.usuarios.authenticate(username, password)
