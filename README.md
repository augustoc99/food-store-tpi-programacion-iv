# Food Store — Trabajo Práctico Integrador de Programación IV

Aplicación web para administrar un negocio de comidas: catálogo, usuarios, carrito, pedidos y panel de administración. El backend expone una API REST con **FastAPI, SQLModel y PostgreSQL**; el frontend utiliza **React, TypeScript y Vite**.

## 1. Enlaces de la entrega

- **Repositorio público de GitHub:** https://github.com/augustoc99/food-store-tpi-programacion-iv
- **Video de demostración:** https://drive.google.com/file/d/1DCvgKJsVGW--twNxV3H3HX1Ao4h43Xcv/view?usp=drive_link


## 2. Tecnologías y requisitos

| Tecnología | Versión requerida o utilizada |
| --- | --- |
| Python | 3.11–3.13 |
| FastAPI / SQLModel | 0.128.0 / 0.0.31 |
| PostgreSQL | 15 o superior (base de datos principal) |
| psycopg2-binary | 2.9.11 |
| Autenticación | JWT con `python-jose`, cookies HttpOnly y bcrypt |
| Node.js | 20.19 o superior |
| pnpm | 9 o superior (probado con 10.33.0) |
| React / React Router DOM | 19 / 7 |
| TypeScript / Vite / Tailwind CSS | 5.9 / 7 / 4 |
| TanStack Query / Form / Table | 5 / 1 / 8 |
| Zustand / Axios | 5 / 1 |

Las versiones exactas de las dependencias constan en `backend/requirements.txt` y `frontend/package.json`.

## 3. Estructura

```text
backend/
  app/
    core/                # Configuración, persistencia, seguridad, dependencias y Unit of Work
    modules/
      auth/              # Registro, inicio/cierre de sesión y perfil
      usuarios/          # Usuarios, roles y activación/desactivación
      categorias/        # Gestión de categorías y baja lógica
      productos/         # Gestión de productos, stock y disponibilidad
      pedidos/           # Pedidos, estados y reglas RN-01 a RN-06
    db/seed.py           # Administrador y catálogo inicial
    main.py              # Aplicación FastAPI y rutas /api/v1
  tests/                 # Pruebas de integración
  requirements.txt
  requirements-dev.txt
  .env.example
frontend/
  src/
    features/            # Funcionalidades por dominio
    shared/              # Componentes y utilidades compartidos
    routes/              # Navegación y protección por roles
    store/               # Sesión y carrito con Zustand
  package.json
  .env.example
README.md                 # Documentación principal de la entrega
.gitignore
```

La API sigue la arquitectura **Router → Service → Unit of Work → Repository → Model**. El modelo de dominio contiene las cinco entidades `Usuario`, `Categoria`, `Producto`, `Pedido` y `DetallePedido`, con relaciones 1:N.

## 4. Configurar y ejecutar el backend

### 4.1. Base de datos

Crear una base de datos en PostgreSQL 15 o superior. Por ejemplo, con un usuario con permisos para crear roles y bases:

```sql
CREATE USER foodstore WITH PASSWORD 'CAMBIAR_PASSWORD';
CREATE DATABASE foodstore_db OWNER foodstore;
```

Para desarrollo local, el enunciado permite SQLite cambiando `DATABASE_URL`, pero **PostgreSQL es la opción principal del proyecto**.

### 4.2. Entorno Python

Abrir una terminal en la carpeta `backend/`, crear un entorno virtual e instalar los paquetes:

```bash
python -m venv .venv
```

Activar el entorno: en **PowerShell**, `.\.venv\Scripts\Activate.ps1`; en **Linux/macOS**, `source .venv/bin/activate`.

```bash
pip install -r requirements.txt
```

Copiar `.env.example` como `.env` dentro de `backend/` y establecer las variables:

```dotenv
DATABASE_URL=postgresql://foodstore:CAMBIAR_PASSWORD@localhost:5432/foodstore_db
SECRET_KEY=REEMPLAZAR_POR_CADENA_ALEATORIA_LARGA_Y_PRIVADA
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
FRONTEND_ORIGIN=http://localhost:5173
COOKIE_SECURE=false
```

Usar una clave secreta aleatoria de al menos 32 caracteres. La contraseña de PostgreSQL debe coincidir con la configurada. Los archivos `.env` contienen secretos y **no deben subirse a GitHub**. Para HTTPS de producción, configurar correctamente las cookies seguras y el origen permitido.

### 4.3. Seed y arranque

Ejecutar los comandos **desde `backend/`**:

```bash
python -m app.db.seed
uvicorn app.main:app --reload
```

El seed es idempotente y carga un administrador, tres categorías y nueve productos con stock. La aplicación crea las tablas faltantes al iniciarse; utilizar una **base nueva** para este TPI en lugar de una base de entregas anteriores.

- API: `http://localhost:8000/api/v1`
- Documentación Swagger: `http://localhost:8000/docs`
- Documentación ReDoc: `http://localhost:8000/redoc`

**Usuario administrador del seed (solo para demostración):**

- Usuario: `admin`
- Contraseña: `Admin1234!`
- Rol: `admin`

Cambiar estas credenciales si se expone la aplicación públicamente.

## 5. Configurar y ejecutar el frontend

Abrir **otra terminal** en `frontend/`. Requiere Node.js 20.19 o superior y pnpm 9 o superior. En Windows se verificó el proyecto con Node.js 24.15.0 y pnpm 10.33.0.

Copiar `frontend/.env.example` como `frontend/.env` y configurar:

```dotenv
VITE_API_URL=http://localhost:8000/api/v1
```

Con el backend iniciado, ejecutar desde `frontend/`:

```bash
pnpm install
pnpm build
pnpm dev
```

Abrir **`http://localhost:5173`**. El frontend envía las cookies de sesión con Axios `withCredentials: true` y usa TanStack Query para las consultas al servidor.

## 6. Funcionalidades

### Cliente (`user`)

- Registro e inicio de sesión por JWT en cookie HttpOnly.
- Catálogo público con búsqueda, filtros por categoría, paginación y estados de carga y error.
- Carrito de compras persistente con Zustand.
- Checkout con dirección de entrega, forma de pago (`EFECTIVO` o `TRANSFERENCIA`) y notas.
- Consulta de pedidos, detalle, precios históricos y cancelación de pedidos propios en estado `PENDIENTE`.

### Administrador (`admin`)

- Resumen de pedidos e ingresos entregados.
- Altas, modificaciones y bajas lógicas de categorías y productos.
- Administración de stock y disponibilidad.
- Gestión de pedidos y transiciones de estado.
- Consulta de usuarios y activación o desactivación de cuentas.

### Reglas de negocio principales

- Un pedido exige al menos un producto, sin repeticiones, activo, disponible y con stock suficiente.
- El pedido y el descuento de stock se ejecutan dentro de la misma transacción (rollback ante errores).
- Cada detalle conserva copia del nombre y precio del producto al comprar.
- Estados: `PENDIENTE → EN_PREPARACION → ENTREGADO`, con cancelación posible en estados no terminales según el rol.
- Cancelar restituye stock en la misma transacción y no se permite duplicar la restitución.
- Las líneas y el total histórico de los pedidos son inmutables; no se implementa borrado físico de pedidos.
- El cliente solo accede a sus pedidos y el administrador puede operar según sus permisos.

## 7. Verificaciones antes de presentar

**Backend:** instalar dependencias, ejecutar el seed dos veces para verificar que no duplica datos, iniciar Uvicorn y comprobar `/docs`, permisos, errores HTTP, bajas lógicas y operaciones de pedidos.

**Pruebas de integración:** instalar las dependencias de prueba con `pip install -r requirements-dev.txt`. Desde `backend/`, utilizar una base aislada para las pruebas (por ejemplo, en PowerShell):

```powershell
$env:DATABASE_URL='sqlite:///./test_foodstore.db'
python -m pytest -q
```

No ejecutar pruebas sobre una base con información importante. Se recomienda repetir la comprobación de operaciones críticas sobre PostgreSQL.

**Frontend:** ejecutar `pnpm install`, `pnpm build` y `pnpm dev` sin errores y verificar manualmente registro, login, carrito, compra, cancelación con restitución de stock y todas las pantallas administrativas.

**Estado de verificación (19/11/2026):** se comprobó en Windows la instalación de dependencias, el arranque de FastAPI y Swagger, `pnpm build` (213 módulos transformados), el funcionamiento manual de catálogo, login, checkout, pedidos y panel administrativo. Se ejecutó `python -m pytest -q` con resultado **6 passed, 1 warning**. Según las pruebas manuales realizadas, el proyecto también funcionó con PostgreSQL 17. Estas comprobaciones no sustituyen una auditoría exhaustiva de todas las combinaciones de errores, permisos y concurrencia.

## 8. Publicación en GitHub

**Repositorio:** https://github.com/augustoc99/food-store-tpi-programacion-iv


**Fecha límite:** 24 de noviembre de 2026, 23:59.

## 9. Video de explicación y demostración

https://drive.google.com/file/d/1DCvgKJsVGW--twNxV3H3HX1Ao4h43Xcv/view?usp=drive_link