def test_create_employee_success(client, sample_project):
    response = client.post("/api/v1/employees", json={
        "employee_code": "EMP00099",
        "name": "Priya Singh",
        "email": "priya@ethara.ai",
        "department": "Engineering",
        "role": "Software Engineer",
        "joining_date": "2026-07-14",
        "project_id": sample_project.id,
    })
    assert response.status_code == 201
    assert response.json()["email"] == "priya@ethara.ai"


def test_create_employee_duplicate_email_rejected(client, sample_employee, sample_project):
    response = client.post("/api/v1/employees", json={
        "employee_code": "EMP00100",
        "name": "Another Amit",
        "email": sample_employee.email,  # duplicate
        "joining_date": "2026-07-14",
        "project_id": sample_project.id,
    })
    assert response.status_code == 409
    assert "already exists" in response.json()["message"]


def test_get_employee_not_found(client):
    response = client.get("/api/v1/employees/99999")
    assert response.status_code == 404


def test_search_employee_by_name(client, sample_employee):
    response = client.get("/api/v1/employees", params={"search": "Amit"})
    assert response.status_code == 200
    assert response.json()["total"] >= 1


def test_search_nonexistent_employee_returns_empty(client):
    response = client.get("/api/v1/employees", params={"search": "Zzzznotreal"})
    assert response.status_code == 200
    assert response.json()["total"] == 0
    assert response.json()["items"] == []