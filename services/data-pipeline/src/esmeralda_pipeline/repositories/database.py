from collections.abc import Iterator
from contextlib import contextmanager

from sqlalchemy import create_engine, text
from sqlalchemy.engine import Connection, Engine
from sqlalchemy.engine.url import make_url


def build_engine(database_url: str) -> Engine:
    """Cria o pool de conexões sem abrir uma conexão imediatamente."""
    sqlalchemy_url = database_url.replace("postgresql://", "postgresql+psycopg://", 1)
    url = make_url(sqlalchemy_url).difference_update_query(["schema"])
    return create_engine(url, pool_pre_ping=True)


@contextmanager
def database_connection(engine: Engine) -> Iterator[Connection]:
    with engine.begin() as connection:
        yield connection


def is_database_available(engine: Engine) -> bool:
    with database_connection(engine) as connection:
        result: object = connection.execute(text("SELECT 1")).scalar_one()
        return result == 1
