"""
Startup bootstrap for deployment:
  1. Ensure all tables exist (the initial Alembic migration is a stub, so we
     create tables from the SQLAlchemy metadata directly — idempotent).
  2. Seed demo data ONLY if the database is empty, so restarts / cold-starts
     on free hosting don't wipe existing data.

Run before the web server:  python -m scripts.bootstrap
"""
import sys
import os

sys.path.append(os.getcwd())

from app.core.database import Base, engine, SessionLocal  # noqa: E402
from app.models.user import User  # noqa: E402


def bootstrap() -> None:
    print("[bootstrap] ensuring tables exist...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        if db.query(User).count() == 0:
            print("[bootstrap] empty database — seeding demo data...")
            from scripts.seed_db import seed
            seed()
        else:
            print("[bootstrap] database already populated — skipping seed.")
    finally:
        db.close()


if __name__ == "__main__":
    bootstrap()
