def test_auth_rejection_missing_header(client):
    response = client.get("/api/users/me")
    assert response.status_code == 401
    assert "Missing Authorization header" in response.json()["detail"]


def test_auth_rejection_malformed_token(client):
    response = client.get("/api/users/me", headers={"Authorization": "Bearer not-a-valid-jwt"})
    assert response.status_code == 401


def test_auth_success_creator(client, creator_headers):
    response = client.get("/api/users/me", headers=creator_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["role"] == "creator"
    assert data["email"] == "elena@crevo.ai"


def test_creator_endpoint_forbidden_for_brand(client, brand_headers):
    # Brand accounts cannot perform write actions reserved for creators
    response = client.post(
        "/api/portfolio",
        headers=brand_headers,
        json={
            "title": "Brand Attempt Piece",
            "media_url": "/creators/cyber_city.jpg",
            "media_type": "video",
        },
    )
    assert response.status_code == 403
    assert "restricted to Creator" in response.json()["detail"]
