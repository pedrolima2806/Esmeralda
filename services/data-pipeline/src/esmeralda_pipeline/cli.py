import argparse

from esmeralda_pipeline.repositories.database import build_engine, is_database_available
from esmeralda_pipeline.settings import get_settings


def main() -> None:
    parser = argparse.ArgumentParser(description="Pipeline de dados do Esmeralda")
    parser.add_argument("command", choices=["health"])
    args = parser.parse_args()

    if args.command == "health":
        settings = get_settings()
        engine = build_engine(settings.database_url)
        available = is_database_available(engine)
        print("database=ok" if available else "database=unavailable")
