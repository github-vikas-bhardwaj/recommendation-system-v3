from fastapi import FastAPI
from langserve import add_routes

from chains.recommend import recommend_chain

app = FastAPI(title="Recommendation System V3 API", version="0.1.0")


@app.get("/health")
def health():
    return {"status": "ok"}


add_routes(app, recommend_chain, path="/recommend")
