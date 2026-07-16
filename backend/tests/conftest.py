import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from app.core.database import Base
# Routes depend on app.api.deps.get_db — override THAT one (there is also a
# separate app.core.database.get_db, which the routes do NOT use).
from app.api.deps import get_db
from app.main import app

# Separate test DB — never run tests against your seeded dev/demo database
TEST_DATABASE_URL = "postgresql://ethara_user:ethara_pass@localhost:5432/ethara_test_db"

engine = create_engine(TEST_DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)  # clean slate every test


@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    # Authenticate every request as an ADMIN so role-protected write endpoints
    # (create/update/delete/allocate/release) can be exercised in tests.
    from app.api.deps import get_current_user
    from app.models.user import User, UserRole

    def override_current_user():
        return User(id=1, email="admin@ethara.ai", role=UserRole.ADMIN)

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = override_current_user
    yield TestClient(app)
    app.dependency_overrides.clear()


@pytest.fixture
def sample_project(db_session):
    from app.models.project import Project
    project = Project(name="Talos", preferred_floor=2, preferred_zone="B")
    db_session.add(project)
    db_session.commit()
    db_session.refresh(project)
    return project


@pytest.fixture
def sample_employee(db_session, sample_project):
    from app.models.employee import Employee, EmployeeStatus
    from datetime import date
    employee = Employee(
        employee_code="EMP00001", name="Amit Kumar", email="amit@ethara.ai",
        joining_date=date.today(), project_id=sample_project.id,
        status=EmployeeStatus.PENDING_ALLOCATION,
    )
    db_session.add(employee)
    db_session.commit()
    db_session.refresh(employee)
    return employee


@pytest.fixture
def sample_seat(db_session):
    from app.models.seat import Seat, SeatStatus
    seat = Seat(floor=2, zone="B", bay="Bay4", seat_number="B4-23", status=SeatStatus.AVAILABLE)
    db_session.add(seat)
    db_session.commit()
    db_session.refresh(seat)
    return seat