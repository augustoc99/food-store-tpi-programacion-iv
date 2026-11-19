"""Carga idempotente de datos de demostración. Ejecutar: python -m app.db.seed."""
from sqlmodel import Session, select
from app.core.database import create_all_tables, session_factory
from app.core.security import hash_password
from app.modules.usuarios.models import Usuario
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto

CATALOGO = {
    'Hamburguesas': [
        ('Hamburguesa clásica', 'Carne, lechuga, tomate y queso', 8900, 20, '/images/hamburguesa-clasica.webp'),
        ('Hamburguesa doble', 'Doble carne y cheddar', 11900, 15, '/images/hamburguesa-doble.webp'),
        ('Hamburguesa veggie', 'Medallón de legumbres', 9200, 10, '/images/hamburguesa-veggie.webp'),
    ],
    'Pizzas': [
        ('Pizza muzzarella', 'Salsa de tomate y muzzarella', 13200, 12, '/images/pizza-muzzarella.webp'),
        ('Pizza napolitana', 'Tomate fresco y ajo', 14900, 14, '/images/pizza-napolitana.webp'),
        ('Pizza especial', 'Jamón, morrones y queso', 15900, 11, '/images/pizza-especial.webp'),
    ],
    'Bebidas': [
        ('Limonada', 'Limonada natural', 3200, 35, '/images/limonada.webp'),
        ('Agua mineral', 'Botella de agua sin gas', 2300, 60, '/images/agua-mineral.webp'),
        ('Gaseosa', 'Gaseosa individual', 2900, 40, '/images/gaseosa.webp'),
    ],
}

def seed():
    create_all_tables()
    with session_factory() as db:
        admin = db.exec(select(Usuario).where(Usuario.username == 'admin')).first()
        if not admin:
            db.add(Usuario(username='admin', email='admin@foodstore.local', full_name='Administrador',
                           hashed_password=hash_password('Admin1234!'), role='admin'))
        for cat_name, products in CATALOGO.items():
            cat = db.exec(select(Categoria).where(Categoria.nombre == cat_name)).first()
            if not cat:
                cat = Categoria(nombre=cat_name, descripcion=f'Productos de {cat_name.lower()}')
                db.add(cat)
                db.flush()
            for name, description, price, stock, imagen in products:
                exists = db.exec(select(Producto).where(Producto.nombre == name, Producto.categoria_id == cat.id)).first()
                if not exists:
                    db.add(Producto(categoria_id=cat.id, nombre=name, descripcion=description,
                                   precio_base=price, stock=stock, disponible=True, imagen_url=imagen))
                elif not exists.imagen_url:
                    # Solo completa datos antiguos; no pisa fotos que haya configurado el administrador.
                    exists.imagen_url = imagen
        db.commit()
    print('Seed finalizado: admin, catálogo e imágenes (sin duplicados)')

if __name__ == '__main__':
    seed()
