from fastapi.testclient import TestClient
from app import app

client = TestClient(app)

def test_cors():
    response = client.options("/api/process", 
        headers={
            "Origin": "http://localhost:5174",
            "Access-Control-Request-Method": "POST"
        }
    )
    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:5174" 