from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from prometheus_client import Gauge
import clickhouse_connect

app = FastAPI(title="GPU Token Throughput Monitor")

client = clickhouse_connect.get_client()  # assumes environment vars

tps_gauge = Gauge("gpu_api_tps", "Current TPS", ["gpu"])

class TPSResponse(BaseModel):
    gpu_uuid: str
    tps: float

@app.get("/gpu/{uuid}/tps", response_model=TPSResponse)
async def get_tps(uuid: str, range: str = "1h"):
    # use parameterized query with placeholders to avoid sql injection
    result = client.query(
        "SELECT avg(tps) FROM gpu_metrics WHERE gpu=%(uuid)s AND ts > now() - interval %(range)s",
        {"uuid": uuid, "range": range},
    )
    if not result.result_rows:
        raise HTTPException(status_code=404, detail="gpu not found")
    avg_tps = result.result_rows[0][0]
    tps_gauge.labels(gpu=uuid).set(avg_tps)
    return TPSResponse(gpu_uuid=uuid, tps=avg_tps)

class LeaderboardEntry(BaseModel):
    gpu_uuid: str
    tokens_total: int

@app.get("/gpu/leaderboard", response_model=list[LeaderboardEntry])
async def leaderboard(metric: str = "tokens_total", limit: int = 20):
    query = (
        f"SELECT gpu, sum({metric}) as value FROM gpu_metrics "
        "GROUP BY gpu ORDER BY value DESC LIMIT %(limit)s"
    )
    result = client.query(query, {"limit": limit})
    return [LeaderboardEntry(gpu_uuid=row[0], tokens_total=row[1]) for row in result.result_rows]
