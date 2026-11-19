from app.core.errors import NoEncontrado
from .models import Producto
from .schemas import ProductoCreate, ProductoUpdate, ProductoStockUpdate, ProductoRead, ProductosPaginados
from .unit_of_work import ProductoUnitOfWork

class ProductoService:
    def __init__(self, uow: ProductoUnitOfWork | None = None):
        self.uow = uow or ProductoUnitOfWork()

    @staticmethod
    def to_read(p: Producto) -> ProductoRead:
        return ProductoRead.model_validate(p)

    def listar(self, skip=0, limit=20, search=None, categoria_id=None, disponible=None):
        with self.uow as uow:
            count, rows = uow.productos.search(skip, limit, search, categoria_id, disponible)
            return ProductosPaginados(total=count, items=[self.to_read(p) for p in rows])

    def obtener(self, pid):
        with self.uow as uow:
            p = uow.productos.get_by_id(pid)
            if not p or not p.activo:
                raise NoEncontrado('Producto inexistente')
            return self.to_read(p)

    @staticmethod
    def categoria_activa(uow, cid):
        c = uow.categorias.get_by_id_for_update(cid)
        if c is None or not c.activo:
            raise NoEncontrado('Categoría inexistente o inactiva')
        return c

    def crear(self, data: ProductoCreate):
        with self.uow as uow:
            self.categoria_activa(uow, data.categoria_id)
            p = uow.productos.add(Producto(**data.model_dump()))
            return self.to_read(p)

    def actualizar(self, pid, data: ProductoUpdate):
        with self.uow as uow:
            p = uow.productos.lock_by_id(pid)
            if p is None or not p.activo:
                raise NoEncontrado('Producto inexistente')
            changes = data.model_dump(exclude_unset=True)
            if 'categoria_id' in changes:
                self.categoria_activa(uow, changes['categoria_id'])
            for key, value in changes.items():
                setattr(p, key, value)
            uow.session.flush()
            return self.to_read(p)

    def cambiar_stock(self, pid, data: ProductoStockUpdate):
        with self.uow as uow:
            p = uow.productos.lock_by_id(pid)
            if p is None or not p.activo:
                raise NoEncontrado('Producto inexistente')
            for key, value in data.model_dump(exclude_unset=True).items():
                setattr(p, key, value)
            uow.session.flush()
            return self.to_read(p)

    def eliminar(self, pid):
        with self.uow as uow:
            p = uow.productos.lock_by_id(pid)
            if p is None or not p.activo:
                raise NoEncontrado('Producto inexistente')
            p.activo = False
