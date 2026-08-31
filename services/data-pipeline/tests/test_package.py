from esmeralda_pipeline import __version__
from esmeralda_pipeline.repositories.database import build_engine


def test_package_has_version() -> None:
    assert __version__ == "0.1.0"


def test_database_url_uses_psycopg_driver() -> None:
    engine = build_engine("postgresql://user:password@localhost/database?schema=public")

    assert engine.url.drivername == "postgresql+psycopg"
    assert "schema" not in engine.url.query
