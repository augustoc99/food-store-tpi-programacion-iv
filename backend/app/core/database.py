from sqlmodel import SQLModel, Session, create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import get_settings

url = get_settings().DATABASE_URL
engine = create_engine(url, connect_args={'check_same_thread': False} if url.startswith('sqlite') else {}, pool_pre_ping=True)
session_factory = sessionmaker(bind=engine, class_=Session, expire_on_commit=False)

def create_all_tables() -> None:
    from app.modules.usuarios.models import Usuario  # noqa: F401
    from app.modules.categorias.models import Categoria  # noqa: F401
    from app.modules.productos.models import Producto  # noqa: F401
    from app.modules.pedidos.models import Pedido, DetallePedido  # noqa: F401
    SQLModel.metadata.create_all(engine)

def get_session():
    with session_factory() as session:
        yield session
