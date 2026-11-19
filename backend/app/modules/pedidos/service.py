from datetime import datetime, timedelta, timezone
from decimal import Decimal
from app.core.errors import NoEncontrado, PedidoAjeno, ReglaInvalida
from app.modules.usuarios.models import Usuario
from .models import Pedido, DetallePedido, now
from .schemas import PedidoCreate, PedidoRead, PedidosPaginados, ResumenPedidos
from .unit_of_work import PedidoUnitOfWork

class ProductoNoEncontrado(NoEncontrado): pass
class PedidoNoEncontrado(NoEncontrado): pass
class StockInsuficiente(ReglaInvalida): pass
class ProductoNoDisponible(ReglaInvalida): pass
class ProductoRepetido(ReglaInvalida): pass
class TransicionInvalida(ReglaInvalida): pass

TRANSICIONES: dict[str, set[str]] = {
    'PENDIENTE': {'EN_PREPARACION', 'CANCELADO'},
    'EN_PREPARACION': {'ENTREGADO', 'CANCELADO'},
    'ENTREGADO': set(), 'CANCELADO': set(),
}

class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork | None = None):
        self.uow = uow or PedidoUnitOfWork()

    @staticmethod
    def serializar(pedido: Pedido) -> PedidoRead:
        return PedidoRead.model_validate(pedido)

    def crear(self, data: PedidoCreate, user: Usuario):
        with self.uow as uow:
            ids = [item.producto_id for item in data.items]
            if len(ids) != len(set(ids)):
                raise ProductoRepetido('Un producto no puede repetirse en el pedido')
            pedido = uow.pedidos.add(Pedido(usuario_id=user.id, forma_pago=data.forma_pago,
                                           direccion_entrega=data.direccion_entrega, notas=data.notas,
                                           estado='PENDIENTE', total=0))
            total = Decimal('0')
            for item in sorted(data.items, key=lambda i: i.producto_id):
                producto = uow.productos.lock_by_id(item.producto_id)
                if not producto or not producto.activo:
                    raise ProductoNoEncontrado(f'Producto {item.producto_id} no encontrado')
                if not producto.disponible:
                    raise ProductoNoDisponible(f'Producto {producto.nombre} no disponible')
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(f'Stock insuficiente de {producto.nombre}')
                producto.stock -= item.cantidad
                precio = Decimal(str(producto.precio_base))
                subtotal = float(precio * item.cantidad)
                detalle = DetallePedido(pedido_id=pedido.id, producto_id=producto.id,
                                        cantidad=item.cantidad, nombre_producto=producto.nombre,
                                        precio_unitario=producto.precio_base, subtotal=subtotal)
                uow.session.add(detalle)
                total += Decimal(str(subtotal))
            pedido.total = float(total)
            uow.session.flush()
            # Se refresca la colección para serializarla dentro de la sesión.
            uow.session.expire(pedido, ['items'])
            return self.serializar(pedido)

    def listar(self, user: Usuario, skip: int, limit: int, estado: str | None):
        with self.uow as uow:
            total, rows = uow.pedidos.listar(None if user.role == 'admin' else user.id, skip, limit, estado)
            return PedidosPaginados(total=total, items=[self.serializar(p) for p in rows])

    def obtener(self, pid: int, user: Usuario):
        with self.uow as uow:
            p = uow.pedidos.get_full(pid)
            if p is None:
                raise PedidoNoEncontrado('Pedido inexistente')
            if user.role != 'admin' and p.usuario_id != user.id:
                raise PedidoAjeno('No podés acceder a pedidos ajenos')
            return self.serializar(p)

    def cambiar_estado(self, pid: int, estado: str):
        with self.uow as uow:
            p = uow.pedidos.lock_full(pid)
            if p is None:
                raise PedidoNoEncontrado('Pedido inexistente')
            if estado not in TRANSICIONES[p.estado]:
                raise TransicionInvalida(f'Transición {p.estado} → {estado} no permitida')
            if estado == 'CANCELADO':
                self._restituir(uow, p)
            p.estado = estado
            p.updated_at = now()
            uow.session.flush()
            return self.serializar(p)

    @staticmethod
    def _restituir(uow, pedido: Pedido):
        for detail in sorted(pedido.items, key=lambda d: d.producto_id):
            p = uow.productos.lock_by_id(detail.producto_id)
            if p is None:
                raise ProductoNoEncontrado('Producto del pedido inexistente')
            p.stock += detail.cantidad

    def cancelar(self, pid: int, user: Usuario):
        with self.uow as uow:
            p = uow.pedidos.lock_full(pid)
            if p is None:
                raise PedidoNoEncontrado('Pedido inexistente')
            if p.usuario_id != user.id:
                raise PedidoAjeno('No podés cancelar pedidos ajenos')
            if p.estado != 'PENDIENTE':
                raise TransicionInvalida('Solo se pueden cancelar pedidos pendientes')
            self._restituir(uow, p)
            p.estado = 'CANCELADO'
            p.updated_at = now()
            uow.session.flush()
            return self.serializar(p)

    def resumen(self):
        with self.uow as uow:
            # Fronteras UTC: almacenamiento y conteos reproducibles independientemente del host.
            today = datetime.now(timezone.utc).date()
            start = datetime.combine(today, datetime.min.time(), tzinfo=timezone.utc)
            counts, today_count, income = uow.pedidos.resumen(start, start + timedelta(days=1))
            return ResumenPedidos(pendientes=counts.get('PENDIENTE', 0),
                                  en_preparacion=counts.get('EN_PREPARACION', 0),
                                  entregados=counts.get('ENTREGADO', 0), cancelados=counts.get('CANCELADO', 0),
                                  pedidos_hoy=today_count, ingresos_entregados=income)
