from sqlmodel import Session, select
from app.core.base_repository import BaseRepository
from .models import Categoria

class CategoriaRepository(BaseRepository[Categoria]):
    def __init__(self, session: Session):
        super().__init__(session, Categoria)

    def activas(self) -> list[Categoria]:
        return list(self.session.exec(select(Categoria).where(Categoria.activo == True).order_by(Categoria.nombre)).all())

    def get_by_nombre(self, nombre: str):
        return self.session.exec(select(Categoria).where(Categoria.nombre == nombre)).first()

    def get_by_id_for_update(self, categoria_id: int) -> Categoria | None:
        """Bloquea la categoría al asignar productos (PostgreSQL)."""
        return self.session.exec(select(Categoria).where(Categoria.id == categoria_id).with_for_update()).first()
