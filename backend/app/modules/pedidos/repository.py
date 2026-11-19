from datetime import datetime
from sqlmodel import Session, select, func
from sqlalchemy.orm import selectinload
from app.core.base_repository import BaseRepository
from .models import Pedido

class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session: Session):
        super().__init__(session, Pedido)

    def listar(self, usuario_id: int | None, skip: int, limit: int, estado: str | None):
        cond = []
        if usuario_id is not None:
            cond.append(Pedido.usuario_id == usuario_id)
        if estado:
            cond.append(Pedido.estado == estado)
        total = self.session.exec(select(func.count()).select_from(Pedido).where(*cond)).one()
        pedidos = self.session.exec(select(Pedido).options(selectinload(Pedido.items))
                                    .where(*cond).order_by(Pedido.created_at.desc(), Pedido.id.desc())
                                    .offset(skip).limit(limit)).all()
        return int(total), list(pedidos)

    def get_full(self, pid: int) -> Pedido | None:
        return self.session.exec(select(Pedido).options(selectinload(Pedido.items)).where(Pedido.id == pid)).first()

    def lock_full(self, pid: int) -> Pedido | None:
        # Bloqueo transaccional de la fila antes de comprobar estado y restituir stock.
        return self.session.exec(select(Pedido).options(selectinload(Pedido.items))
                                 .where(Pedido.id == pid).with_for_update()).first()

    def resumen(self, start: datetime, end: datetime):
        counts = self.session.exec(select(Pedido.estado, func.count(Pedido.id)).group_by(Pedido.estado)).all()
        hoy = self.session.exec(select(func.count()).select_from(Pedido).where(
            Pedido.created_at >= start, Pedido.created_at < end)).one()
        income = self.session.exec(select(func.coalesce(func.sum(Pedido.total), 0))
                                   .where(Pedido.estado == 'ENTREGADO')).one()
        return dict(counts), int(hoy), float(income)
