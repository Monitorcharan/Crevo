def test_list_creators(client):
    response = client.get("/api/creators")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert len(data["items"]) >= 1


def test_search_creators(client):
    response = client.get("/api/creators?search=Elena")
    assert response.status_code == 200
    data = response.json()
    assert any("Elena" in c["display_name"] for c in data["items"])


def test_filter_creators_specialization(client):
    response = client.get("/api/creators?specialization=AI+Filmmaking")
    assert response.status_code == 200
    data = response.json()
    assert all(c["specialization"] == "AI Filmmaking" for c in data["items"])


def test_get_creator_by_id_success(client):
    response = client.get("/api/creators/elena-vance")
    assert response.status_code == 200
    data = response.json()
    assert data["display_name"] == "Elena Vance"
    assert "portfolio_items" in data


def test_get_creator_by_id_not_found(client):
    response = client.get("/api/creators/non-existent-creator")
    assert response.status_code == 404
    data = response.json()
    assert "detail" in data


def test_update_my_creator_profile_unauthorized(client):
    response = client.patch(
        "/api/creators/me",
        json={"headline": "Updated Headline without auth"},
    )
    assert response.status_code == 401


def test_update_my_creator_profile_authorized(client, creator_headers):
    response = client.patch(
        "/api/creators/me",
        headers=creator_headers,
        json={"headline": "Master AI Narrative Filmmaker"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["headline"] == "Master AI Narrative Filmmaker"
