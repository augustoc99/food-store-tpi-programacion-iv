from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from app.core.deps import require_role
from app.core.errors import DominioError
from .schemas import ProductoCreate, ProductoUpdate, ProductoStockUpdate, ProductoRead, ProductosPaginados
from .service import ProductoService

router = APIRouter(prefix='/productos', tags=['Productos'])
def get_producto_service(): return ProductoService()
Service = Annotated[ProductoService, Depends(get_producto_service)]
Admin = Depends(require_role(['admin']))

def run(fn):
    try: return fn()
    except DominioError as exc: raise HTTPException(exc.status_code, str(exc)) from exc

@router.get('', response_model=ProductosPaginados)
def listar(service: Service, skip: int = Query(0, ge=0), limit: int = Query(20, ge=1, le=100),
           search: str | None = None, categoria_id: int | None = None, disponible: bool | None = None):
    return run(lambda: service.listar(skip, limit, search, categoria_id, disponible))

@router.get('/{pid}', response_model=ProductoRead)
def detalle(pid: int, service: Service): return run(lambda: service.obtener(pid))

@router.post('', response_model=ProductoRead, status_code=201, dependencies=[Admin])
def crear(data: ProductoCreate, service: Service): return run(lambda: service.crear(data))

@router.put('/{pid}', response_model=ProductoRead, dependencies=[Admin])
def editar(pid: int, data: ProductoUpdate, service: Service): return run(lambda: service.actualizar(pid, data))

@router.patch('/{pid}/stock', response_model=ProductoRead, dependencies=[Admin])
def cambiar_stock(pid: int, data: ProductoStockUpdate, service: Service): return run(lambda: service.cambiar_stock(pid, data))

@router.delete('/{pid}', status_code=204, dependencies=[Admin])
def eliminar(pid: int, service: Service):
    run(lambda: service.eliminar(pid))
    return Response(status_code=204)
