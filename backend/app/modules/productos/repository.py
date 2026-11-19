from sqlmodel import Session, select, func
from sqlalchemy.orm import selectinload
from app.core.base_repository import BaseRepository
from .models import Producto

class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session: Session):
        super().__init__(session, Producto)

    def search(self, skip: int = 0, limit: int = 20, search: str | None = None,
               categoria_id: int | None = None, disponible: bool | None = None):
        cond = [Producto.activo == True]
        if search:
            cond.append(Producto.nombre.ilike(f'%{search}%'))
        if categoria_id is not None:
            cond.append(Producto.categoria_id == categoria_id)
        if disponible is not None:
            cond.append(Producto.disponible == disponible)
        total = self.session.exec(select(func.count()).select_from(Producto).where(*cond)).one()
        rows = self.session.exec(select(Producto).options(selectinload(Producto.categoria))
                                 .where(*cond).order_by(Producto.id).offset(skip).limit(limit)).all()
        return int(total), list(rows)

    def lock_by_id(self, product_id: int) -> Producto | None:
        return self.session.exec(select(Producto).where(Producto.id == product_id).with_for_update()).first()
