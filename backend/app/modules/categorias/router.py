from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Response, status
from app.core.deps import require_role
from app.core.errors import DominioError
from .schemas import CategoriaCreate, CategoriaUpdate, CategoriaRead
from .service import CategoriaService

router = APIRouter(prefix='/categorias', tags=['Categorías'])
def get_categoria_service(): return CategoriaService()
Service = Annotated[CategoriaService, Depends(get_categoria_service)]
Admin = Depends(require_role(['admin']))

def run(fn):
    try: return fn()
    except DominioError as e: raise HTTPException(e.status_code, str(e)) from e

@router.get('', response_model=list[CategoriaRead])
def listar(service: Service): return run(service.listar)

@router.get('/{cid}', response_model=CategoriaRead)
def detalle(cid: int, service: Service): return run(lambda: service.obtener(cid))

@router.post('', response_model=CategoriaRead, status_code=201, dependencies=[Admin])
def crear(data: CategoriaCreate, service: Service): return run(lambda: service.crear(data))

@router.put('/{cid}', response_model=CategoriaRead, dependencies=[Admin])
def editar(cid: int, data: CategoriaUpdate, service: Service): return run(lambda: service.actualizar(cid, data))

@router.delete('/{cid}', status_code=204, dependencies=[Admin])
def borrar(cid: int, service: Service):
    run(lambda: service.eliminar(cid))
    return Response(status_code=status.HTTP_204_NO_CONTENT)
