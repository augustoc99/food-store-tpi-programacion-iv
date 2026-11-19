from sqlalchemy.exc import IntegrityError
from app.core.errors import NoEncontrado, Duplicado
from .models import Categoria
from .schemas import CategoriaCreate, CategoriaUpdate, CategoriaRead
from .unit_of_work import CategoriaUnitOfWork

class CategoriaService:
    def __init__(self, uow: CategoriaUnitOfWork | None = None):
        self.uow = uow or CategoriaUnitOfWork()

    def listar(self):
        with self.uow as uow:
            return [CategoriaRead.model_validate(c) for c in uow.categorias.activas()]

    def obtener(self, cid: int):
        with self.uow as uow:
            c = uow.categorias.get_by_id(cid)
            if not c or not c.activo:
                raise NoEncontrado('Categoría inexistente')
            return CategoriaRead.model_validate(c)

    def crear(self, data: CategoriaCreate):
        with self.uow as uow:
            if uow.categorias.get_by_nombre(data.nombre):
                raise Duplicado('Nombre de categoría duplicado')
            try:
                c = uow.categorias.add(Categoria(**data.model_dump()))
            except IntegrityError as exc:
                raise Duplicado('Nombre de categoría duplicado') from exc
            return CategoriaRead.model_validate(c)

    def actualizar(self, cid: int, data: CategoriaUpdate):
        with self.uow as uow:
            c = uow.categorias.get_by_id(cid)
            if not c or not c.activo:
                raise NoEncontrado('Categoría inexistente')
            changes = data.model_dump(exclude_unset=True)
            if 'nombre' in changes and changes['nombre'] != c.nombre and uow.categorias.get_by_nombre(changes['nombre']):
                raise Duplicado('Nombre de categoría duplicado')
            for key, value in changes.items():
                setattr(c, key, value)
            try:
                uow.session.flush()
            except IntegrityError as exc:
                raise Duplicado('Nombre de categoría duplicado') from exc
            return CategoriaRead.model_validate(c)

    def eliminar(self, cid: int):
        with self.uow as uow:
            c = uow.categorias.get_by_id(cid)
            if not c or not c.activo:
                raise NoEncontrado('Categoría inexistente')
            c.activo = False
