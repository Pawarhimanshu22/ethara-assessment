def test_create_seat_success(client):
    response = client.post("/api/v1/seats", json={
        "floor": 3, "zone": "C", "bay": "Bay1", "seat_number": "C3-01",
    })
    assert response.status_code == 201


def test_duplicate_seat_same_floor_zone_rejected(client, sample_seat):
    response = client.post("/api/v1/seats", json={
        "floor": sample_seat.floor, "zone": sample_seat.zone,
        "bay": "Bay4", "seat_number": sample_seat.seat_number,
    })
    assert response.status_code in (409, 422)


def test_filter_seats_by_status(client, sample_seat):
    response = client.get("/api/v1/seats", params={"status": "AVAILABLE"})
    assert response.status_code == 200
    assert response.json()["total"] >= 1


def test_available_seats_endpoint(client, sample_seat):
    response = client.get("/api/v1/seats/available")
    assert response.status_code == 200
    assert any(s["id"] == sample_seat.id for s in response.json())