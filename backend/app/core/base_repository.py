from typing import Generic, TypeVar
from sqlmodel import SQLModel, Session, select

T = TypeVar('T', bound=SQLModel)

class BaseRepository(Generic[T]):
    def __init__(self, session: Session, model: type[T]):
        self.session, self.model = session, model

    def get_by_id(self, obj_id: int) -> T | None:
        return self.session.get(self.model, obj_id)

    def get_all(self) -> list[T]:
        return list(self.session.exec(select(self.model)).all())

    def add(self, obj: T) -> T:
        self.session.add(obj)
        self.session.flush()
        return obj

    def delete(self, obj: T) -> None:
        self.session.delete(obj)
