def test_allocate_seat_success(client, sample_employee, sample_seat):
    response = client.post("/api/v1/seats/allocate", json={
        "employee_id": sample_employee.id, "seat_id": sample_seat.id,
    })
    assert response.status_code == 200
    body = response.json()
    assert body["seat_number"] == sample_seat.seat_number
    assert body["employee_id"] == sample_employee.id


def test_allocate_occupied_seat_rejected(client, sample_employee, sample_seat, db_session):
    # First allocation succeeds
    client.post("/api/v1/seats/allocate", json={
        "employee_id": sample_employee.id, "seat_id": sample_seat.id,
    })

    # Create a second employee and try to take the same now-occupied seat
    from app.models.employee import Employee, EmployeeStatus
    from datetime import date
    emp2 = Employee(
        employee_code="EMP00002", name="Second Employee", email="second@ethara.ai",
        joining_date=date.today(), status=EmployeeStatus.PENDING_ALLOCATION,
    )
    db_session.add(emp2)
    db_session.commit()
    db_session.refresh(emp2)

    response = client.post("/api/v1/seats/allocate", json={
        "employee_id": emp2.id, "seat_id": sample_seat.id,
    })
    assert response.status_code == 409
    assert "OCCUPIED" in response.json()["message"] or "cannot be allocated" in response.json()["message"]


def test_allocate_reserved_seat_rejected(client, sample_employee, db_session):
    from app.models.seat import Seat, SeatStatus
    reserved_seat = Seat(floor=4, zone="D", seat_number="D4-01", status=SeatStatus.RESERVED)
    db_session.add(reserved_seat)
    db_session.commit()
    db_session.refresh(reserved_seat)

    response = client.post("/api/v1/seats/allocate", json={
        "employee_id": sample_employee.id, "seat_id": reserved_seat.id,
    })
    assert response.status_code == 409


def test_duplicate_active_allocation_for_same_employee_rejected(client, sample_employee, sample_seat, db_session):
    client.post("/api/v1/seats/allocate", json={
        "employee_id": sample_employee.id, "seat_id": sample_seat.id,
    })

    from app.models.seat import Seat, SeatStatus
    another_seat = Seat(floor=2, zone="B", seat_number="B4-24", status=SeatStatus.AVAILABLE)
    db_session.add(another_seat)
    db_session.commit()
    db_session.refresh(another_seat)

    response = client.post("/api/v1/seats/allocate", json={
        "employee_id": sample_employee.id, "seat_id": another_seat.id,
    })
    assert response.status_code == 409
    assert "already has an active seat" in response.json()["message"]


def test_release_seat_becomes_available(client, sample_employee, sample_seat):
    client.post("/api/v1/seats/allocate", json={
        "employee_id": sample_employee.id, "seat_id": sample_seat.id,
    })

    response = client.post("/api/v1/seats/release", json={"employee_id": sample_employee.id})
    assert response.status_code == 200

    check = client.get("/api/v1/seats/available")
    assert any(s["id"] == sample_seat.id for s in check.json())


def test_dashboard_updates_after_allocation(client, sample_employee, sample_seat):
    before = client.get("/api/v1/dashboard/summary").json()

    client.post("/api/v1/seats/allocate", json={
        "employee_id": sample_employee.id, "seat_id": sample_seat.id,
    })

    after = client.get("/api/v1/dashboard/summary").json()
    assert after["occupied_seats"] == before["occupied_seats"] + 1
    assert after["available_seats"] == before["available_seats"] - 1


def test_new_joiner_auto_allocation_uses_project_zone(client, sample_employee, sample_seat):
    # sample_seat is floor=2, zone=B — matches sample_project's preferred_floor/zone
    response = client.post("/api/v1/seats/allocate", json={"employee_id": sample_employee.id})
    assert response.status_code == 200
    assert response.json()["used_fallback_zone"] is False