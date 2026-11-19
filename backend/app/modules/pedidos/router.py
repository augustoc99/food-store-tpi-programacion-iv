from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Query
from app.core.deps import get_current_active_user, require_role
from app.core.errors import DominioError
from app.modules.usuarios.models import Usuario
from .schemas import PedidoCreate, PedidoRead, PedidosPaginados, CambioEstado, Estado, ResumenPedidos
from .service import PedidoService

router = APIRouter(prefix='/pedidos', tags=['Pedidos'])
def get_pedido_service(): return PedidoService()
Service = Annotated[PedidoService, Depends(get_pedido_service)]
Current = Annotated[Usuario, Depends(get_current_active_user)]
Admin = Annotated[Usuario, Depends(require_role(['admin']))]

def run(fn):
    try: return fn()
    except DominioError as exc: raise HTTPException(exc.status_code, str(exc)) from exc

@router.post('', response_model=PedidoRead, status_code=201)
def crear(data: PedidoCreate, user: Current, service: Service):
    return run(lambda: service.crear(data, user))

@router.get('', response_model=PedidosPaginados)
def listar(user: Current, service: Service, skip: int = Query(0, ge=0),
           limit: int = Query(20, ge=1, le=100), estado: Estado | None = None):
    return run(lambda: service.listar(user, skip, limit, estado))

# Ruta estática siempre antes de la dinámica.
@router.get('/resumen', response_model=ResumenPedidos)
def resumen(admin: Admin, service: Service): return run(service.resumen)

@router.get('/{pid}', response_model=PedidoRead)
def detalle(pid: int, user: Current, service: Service):
    return run(lambda: service.obtener(pid, user))

@router.patch('/{pid}/estado', response_model=PedidoRead)
def cambiar_estado(pid: int, data: CambioEstado, admin: Admin, service: Service):
    return run(lambda: service.cambiar_estado(pid, data.estado))

@router.patch('/{pid}/cancelar', response_model=PedidoRead)
def cancelar(pid: int, user: Current, service: Service):
    return run(lambda: service.cancelar(pid, user))
