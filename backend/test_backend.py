from main import app
from fastapi.testclient import TestClient

client = TestClient(app)

def test_api():
    res_health = client.get("/api/health")
    print("Health Check:", res_health.status_code, res_health.json())

    res_stations = client.get("/api/stations")
    print("Stations Count:", len(res_stations.json()))

    res_predict = client.post("/api/predict", json={
        "rainfall24h": 85,
        "rainfall72h": 190,
        "temperature": 25,
        "humidity": 82,
        "elevation": 900
    })
    print("Predict Status:", res_predict.status_code)
    print("Prediction Result:", res_predict.json())

if __name__ == "__main__":
    test_api()
