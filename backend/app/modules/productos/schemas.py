from pydantic import model_validator, field_validator
from math import isfinite
from sqlmodel import SQLModel, Field
from app.modules.categorias.schemas import CategoriaRead

class ProductoCreate(SQLModel):
    categoria_id: int = Field(ge=1)
    nombre: str = Field(min_length=1, max_length=150)
    descripcion: str = ''
    precio_base: float = Field(ge=0)
    imagen_url: str = ''
    stock: int = Field(default=0, ge=0)
    disponible: bool = True

    @field_validator('precio_base')
    @classmethod
    def precio_finito(cls, value: float) -> float:
        if not isfinite(value):
            raise ValueError('El precio debe ser finito')
        return value

    @field_validator('nombre')
    @classmethod
    def nombre_no_blanco(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError('El nombre del producto no puede estar vacío')
        return value

class ProductoUpdate(SQLModel):
    categoria_id: int | None = Field(default=None, ge=1)
    nombre: str | None = Field(default=None, min_length=1, max_length=150)
    descripcion: str | None = None
    precio_base: float | None = Field(default=None, ge=0)
    imagen_url: str | None = None
    stock: int | None = Field(default=None, ge=0)
    disponible: bool | None = None

    @field_validator('precio_base')
    @classmethod
    def precio_finito(cls, value: float | None) -> float | None:
        if value is not None and not isfinite(value):
            raise ValueError('El precio debe ser finito')
        return value

    @model_validator(mode='after')
    def no_nulos_explicitos(self):
        for campo in ('categoria_id', 'nombre', 'descripcion', 'precio_base', 'imagen_url', 'stock', 'disponible'):
            if campo in self.model_fields_set and getattr(self, campo) is None:
                raise ValueError(f'{campo} no admite null: omitilo si no querés modificarlo')
        return self

    @field_validator('nombre')
    @classmethod
    def nombre_no_blanco(cls, value: str | None) -> str | None:
        if value is None:
            return value
        value = value.strip()
        if not value:
            raise ValueError('El nombre del producto no puede estar vacío')
        return value

class ProductoStockUpdate(SQLModel):
    stock: int | None = Field(default=None, ge=0)
    disponible: bool | None = None

    @model_validator(mode='after')
    def no_nulos_explicitos(self):
        for campo in ('stock', 'disponible'):
            if campo in self.model_fields_set and getattr(self, campo) is None:
                raise ValueError(f'{campo} no admite null: omitilo si no querés modificarlo')
        return self

class ProductoRead(SQLModel):
    id: int
    categoria_id: int
    nombre: str
    descripcion: str
    precio_base: float
    imagen_url: str
    stock: int
    disponible: bool
    activo: bool
    categoria: CategoriaRead

class ProductosPaginados(SQLModel):
    total: int
    items: list[ProductoRead]
