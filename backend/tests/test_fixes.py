"""Regression tests for the reported bug fixes."""


def _make_employee(client, project_id, code="EMP90001", email="newjoiner@ethara.ai"):
    return client.post("/api/v1/employees", json={
        "employee_code": code,
        "name": "New Joiner",
        "email": email,
        "department": "Engineering",
        "role": "Engineer",
        "joining_date": "2026-07-14",
        "project_id": project_id,
    })


def test_delete_employee_hard_deletes_and_decrements_dashboard(client, sample_project):
    created = _make_employee(client, sample_project.id).json()

    before = client.get("/api/v1/dashboard/summary").json()["total_employees"]

    resp = client.delete(f"/api/v1/employees/{created['id']}")
    assert resp.status_code == 200
    assert "deleted" in resp.json()["message"].lower()

    # Gone entirely (hard delete), not just marked inactive
    assert client.get(f"/api/v1/employees/{created['id']}").status_code == 404

    after = client.get("/api/v1/dashboard/summary").json()["total_employees"]
    assert after == before - 1


def test_delete_employee_releases_their_seat(client, sample_project, sample_seat):
    created = _make_employee(client, sample_project.id).json()
    client.post("/api/v1/seats/allocate", json={"employee_id": created["id"], "seat_id": sample_seat.id})

    client.delete(f"/api/v1/employees/{created['id']}")

    # Seat is free again after the occupant is deleted
    seat = next(s for s in client.get("/api/v1/seats").json()["items"] if s["id"] == sample_seat.id)
    assert seat["status"] == "AVAILABLE"
    assert seat["employee_id"] is None


def test_seat_list_shows_occupant(client, sample_project, sample_seat):
    created = _make_employee(client, sample_project.id).json()
    client.post("/api/v1/seats/allocate", json={"employee_id": created["id"], "seat_id": sample_seat.id})

    seat = next(s for s in client.get("/api/v1/seats").json()["items"] if s["id"] == sample_seat.id)
    assert seat["status"] == "OCCUPIED"
    assert seat["employee_id"] == created["id"]
    assert seat["employee_name"] == "New Joiner"
    assert seat["project_name"] == sample_project.name


def test_pending_filter_returns_new_joiners(client, sample_project):
    _make_employee(client, sample_project.id)
    resp = client.get("/api/v1/employees", params={"status": "PENDING_ALLOCATION"})
    assert resp.status_code == 200
    names = [e["name"] for e in resp.json()["items"]]
    assert "New Joiner" in names
