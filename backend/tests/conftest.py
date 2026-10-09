import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def creator_headers():
    return {"Authorization": "Bearer test-creator-token"}


@pytest.fixture
def brand_headers():
    return {"Authorization": "Bearer test-brand-token"}
