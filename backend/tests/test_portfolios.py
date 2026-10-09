def test_get_creator_portfolio(client):
    response = client.get("/api/creators/elena-vance/portfolio")
    assert response.status_code == 200
    items = response.json()
    assert isinstance(items, list)
    assert len(items) >= 1


def test_create_portfolio_item_unauthorized(client):
    response = client.post(
        "/api/portfolio",
        json={
            "title": "Unauthorized Piece",
            "media_url": "/creators/cyber_city.jpg",
            "media_type": "video",
        },
    )
    assert response.status_code == 401


def test_create_and_delete_portfolio_item(client, creator_headers):
    # 1. Create
    create_payload = {
        "title": "Quantum Horizon: Kinetic Short",
        "description": "Exploratory generative test sequence.",
        "media_url": "/creators/cyber_city.jpg",
        "media_type": "video",
        "tools_used": ["Runway Gen-3", "ComfyUI"],
        "workflow_description": "Custom prompt graph and depth map interpolation.",
        "commercial_use_status": "cleared",
    }
    response = client.post("/api/portfolio", headers=creator_headers, json=create_payload)
    assert response.status_code == 201
    item = response.json()
    assert item["title"] == "Quantum Horizon: Kinetic Short"
    item_id = item["id"]

    # 2. Update
    patch_response = client.patch(
        f"/api/portfolio/{item_id}",
        headers=creator_headers,
        json={"title": "Quantum Horizon (Director's Cut)"},
    )
    assert patch_response.status_code == 200
    assert patch_response.json()["title"] == "Quantum Horizon (Director's Cut)"

    # 3. Delete
    delete_response = client.delete(f"/api/portfolio/{item_id}", headers=creator_headers)
    assert delete_response.status_code == 204
