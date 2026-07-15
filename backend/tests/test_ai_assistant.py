def test_ai_seat_lookup(client, sample_employee, sample_seat):
    client.post("/api/v1/seats/allocate", json={
        "employee_id": sample_employee.id, "seat_id": sample_seat.id,
    })

    response = client.post("/api/v1/ai/query", json={
        "query": f"Where is {sample_employee.name} seated?"
    })
    assert response.status_code == 200
    assert sample_seat.seat_number in response.json()["answer"]


def test_ai_unallocated_employee_seat_lookup(client, sample_employee):
    response = client.post("/api/v1/ai/query", json={
        "query": f"Where is {sample_employee.name} seated?"
    })
    assert response.status_code == 200
    assert "does not currently have a seat" in response.json()["answer"]


def test_ai_available_seats_query(client, sample_seat):
    response = client.post("/api/v1/ai/query", json={
        "query": f"Show available seats on Floor {sample_seat.floor}"
    })
    assert response.status_code == 200
    assert "available" in response.json()["answer"].lower()


def test_ai_unrecognized_query_returns_fallback_message(client):
    response = client.post("/api/v1/ai/query", json={"query": "asdkjaskdj random text"})
    assert response.status_code == 200
    assert response.json()["intent_detected"] == "unknown"