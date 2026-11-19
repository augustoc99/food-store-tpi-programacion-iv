from pydantic import field_validator, model_validator
from sqlmodel import SQLModel, Field

class CategoriaCreate(SQLModel):
    nombre: str = Field(min_length=2, max_length=100)
    descripcion: str = ''

    @field_validator('nombre')
    @classmethod
    def nombre_no_blanco(cls, value: str) -> str:
        value = value.strip()
        if len(value) < 2:
            raise ValueError('El nombre debe tener entre 2 y 100 caracteres efectivos')
        return value

class CategoriaUpdate(SQLModel):
    nombre: str | None = Field(default=None, min_length=2, max_length=100)
    descripcion: str | None = None

    @model_validator(mode='after')
    def no_nulos_explicitos(self):
        for campo in ('nombre', 'descripcion'):
            if campo in self.model_fields_set and getattr(self, campo) is None:
                raise ValueError(f'{campo} no admite null: omitilo si no querés modificarlo')
        return self

    @field_validator('nombre')
    @classmethod
    def nombre_no_blanco(cls, value: str | None) -> str | None:
        if value is None:
            return value
        value = value.strip()
        if len(value) < 2:
            raise ValueError('El nombre debe tener entre 2 y 100 caracteres efectivos')
        return value

class CategoriaRead(SQLModel):
    id: int
    nombre: str
    descripcion: str
    activo: bool
