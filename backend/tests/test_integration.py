"""Pruebas de integración end-to-end de la API con SQLite (desarrollo).
Desde backend/: DATABASE_URL=sqlite:///./test_foodstore.db pytest -q
"""
import os
os.environ['DATABASE_URL'] = 'sqlite:///./test_foodstore.db'

import pytest
from fastapi.testclient import TestClient
from sqlmodel import SQLModel, select
from app.core.database import engine, session_factory, create_all_tables
from app.main import app
from app.db.seed import seed
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.pedidos.models import Pedido

@pytest.fixture()
def client():
    create_all_tables()
    SQLModel.metadata.drop_all(engine)
    create_all_tables()
    seed()
    with TestClient(app) as client:
        yield client
    SQLModel.metadata.drop_all(engine)


def register(client, username):
    r=client.post('/api/v1/auth/register', json={
        'username': username, 'full_name': username, 'email': f'{username}@test.com', 'password': 'Password123!'})
    assert r.status_code == 201, r.text
    return r.json()


def login(client, username, password):
    r=client.post('/api/v1/auth/token', data={'username':username,'password':password})
    assert r.status_code == 200, r.text
    assert 'access_token' in r.cookies
    assert 'token' not in r.json()


def pedido(productos):
    return {'items': productos, 'direccion_entrega':'Calle Central 123', 'forma_pago':'EFECTIVO'}


def stock(product_id):
    with session_factory() as db:
        return db.get(Producto,product_id).stock


def test_seed_auth_and_catalog(client):
    seed()
    with session_factory() as db:
        assert len(db.exec(select(Categoria)).all()) >= 3
        assert len(db.exec(select(Producto)).all()) >= 8
    assert client.get('/api/v1/productos').json()['total'] >= 8
    assert client.post('/api/v1/categorias',json={'nombre':'Prohibida'}).status_code == 401
    register(client,'cliente')
    assert client.post('/api/v1/auth/register',json={
        'username':'cliente','full_name':'cliente','email':'otro@test.com','password':'Password123!'}).status_code==409
    login(client,'cliente','Password123!')
    assert client.get('/api/v1/admin/usuarios').status_code == 403
    assert client.get('/api/v1/auth/me').status_code == 200
    client.post('/api/v1/auth/logout')
    assert client.get('/api/v1/auth/me').status_code == 401


def test_order_rollback_cancel_prices_roles(client):
    register(client,'cliente')
    login(client,'cliente','Password123!')
    product_id = client.get('/api/v1/productos').json()['items'][0]['id']
    other_id = client.get('/api/v1/productos').json()['items'][1]['id']
    before = stock(product_id)
    assert client.post('/api/v1/pedidos',json=pedido([{'producto_id':product_id,'cantidad':1},
        {'producto_id':product_id,'cantidad':1}])).status_code==400
    assert stock(product_id)==before
    assert client.post('/api/v1/pedidos',json=pedido([{'producto_id':product_id,'cantidad':1},
        {'producto_id':9999999,'cantidad':1}])).status_code==404
    assert stock(product_id)==before
    assert client.post('/api/v1/pedidos',json=pedido([{'producto_id':product_id,'cantidad':before+1}])).status_code==400
    assert stock(product_id)==before
    response=client.post('/api/v1/pedidos',json=pedido([{'producto_id':product_id,'cantidad':2},
                                                       {'producto_id':other_id,'cantidad':1}]))
    assert response.status_code==201, response.text
    data=response.json()
    assert data['estado']=='PENDIENTE'
    assert data['total']==sum(x['subtotal'] for x in data['items'])
    assert stock(product_id)==before-2
    order_id=data['id']
    register(client,'otro')
    login(client,'otro','Password123!')
    assert client.get(f'/api/v1/pedidos/{order_id}').status_code==403
    assert client.patch(f'/api/v1/pedidos/{order_id}/cancelar').status_code==403
    login(client,'cliente','Password123!')
    assert client.patch(f'/api/v1/pedidos/{order_id}/cancelar').status_code==200
    assert client.patch(f'/api/v1/pedidos/{order_id}/cancelar').status_code==400
    assert stock(product_id)==before


def test_admin_state_catalog_and_summary(client):
    register(client,'cliente')
    login(client,'cliente','Password123!')
    p=client.get('/api/v1/productos').json()['items'][0]
    r=client.post('/api/v1/pedidos',json=pedido([{'producto_id':p['id'],'cantidad':1}]))
    assert r.status_code==201, r.text
    order=r.json()
    login(client,'admin','Admin1234!')
    users=client.get('/api/v1/admin/usuarios').json()
    admin=next(u for u in users if u['username']=='admin')
    assert client.post(f"/api/v1/admin/usuarios/{admin['id']}/desactivar").status_code==400
    # Precio histórico: cambios del catálogo no modifican el detalle ya creado.
    assert client.put(f"/api/v1/productos/{p['id']}",
                      json={'precio_base':p['precio_base']+1000}).status_code==200
    after_price=client.get(f"/api/v1/pedidos/{order['id']}").json()
    assert after_price['items'][0]['precio_unitario']==order['items'][0]['precio_unitario']
    assert after_price['total']==order['total']
    assert client.patch(f"/api/v1/pedidos/{order['id']}/estado",json={'estado':'ENTREGADO'}).status_code==400
    assert client.patch(f"/api/v1/pedidos/{order['id']}/estado",json={'estado':'EN_PREPARACION'}).status_code==200
    assert client.patch(f"/api/v1/pedidos/{order['id']}/estado",json={'estado':'ENTREGADO'}).status_code==200
    assert client.patch(f"/api/v1/pedidos/{order['id']}/estado",json={'estado':'CANCELADO'}).status_code==400
    assert client.get('/api/v1/pedidos/resumen').json()['ingresos_entregados']==order['total']
    assert client.delete(f"/api/v1/productos/{p['id']}").status_code == 204
    assert client.get(f"/api/v1/productos/{p['id']}").status_code==404


def test_admin_cancellation_restores_stock_and_is_terminal(client):
    register(client, 'comprador')
    login(client, 'comprador', 'Password123!')
    prod = client.get('/api/v1/productos').json()['items'][0]
    initial = stock(prod['id'])
    created = client.post('/api/v1/pedidos', json=pedido([{'producto_id': prod['id'], 'cantidad': 3}]))
    assert created.status_code == 201, created.text
    order_id = created.json()['id']
    assert stock(prod['id']) == initial - 3
    login(client, 'admin', 'Admin1234!')
    changed = client.patch(f'/api/v1/pedidos/{order_id}/estado', json={'estado': 'EN_PREPARACION'})
    assert changed.status_code == 200, changed.text
    cancelled = client.patch(f'/api/v1/pedidos/{order_id}/estado', json={'estado': 'CANCELADO'})
    assert cancelled.status_code == 200, cancelled.text
    assert stock(prod['id']) == initial
    assert client.patch(f'/api/v1/pedidos/{order_id}/estado', json={'estado': 'CANCELADO'}).status_code == 400
    assert stock(prod['id']) == initial


def test_catalog_soft_delete_does_not_free_unique_name(client):
    login(client, 'admin', 'Admin1234!')
    created = client.post('/api/v1/categorias', json={'nombre': 'Temporal', 'descripcion': 'Baja lógica'})
    assert created.status_code == 201, created.text
    cid = created.json()['id']
    assert client.delete(f'/api/v1/categorias/{cid}').status_code == 204
    assert client.get(f'/api/v1/categorias/{cid}').status_code == 404
    assert client.delete(f'/api/v1/categorias/{cid}').status_code == 404
    assert client.post('/api/v1/categorias', json={'nombre': 'Temporal'}).status_code == 409


def test_invalid_updates_reject_null_and_negative_stock(client):
    login(client, 'admin', 'Admin1234!')
    product = client.get('/api/v1/productos').json()['items'][0]
    cat = client.get('/api/v1/categorias').json()[0]
    assert client.put(f"/api/v1/categorias/{cat['id']}", json={'nombre': None}).status_code == 422
    assert client.put(f"/api/v1/productos/{product['id']}", json={'precio_base': None}).status_code == 422
    assert client.patch(f"/api/v1/productos/{product['id']}/stock", json={'stock': -1}).status_code == 422
    assert client.post('/api/v1/auth/register', json={
        'username': '  ', 'full_name': 'X', 'email': 'x@example.com', 'password': 'Password123!'
    }).status_code == 422
