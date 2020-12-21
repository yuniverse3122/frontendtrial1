from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel  # pylint: disable=no-name-in-module
import importlib

app = FastAPI()
models = {}

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

for model in ['classifier']:
    models[model] = getattr(importlib.import_module(
        f'py.{model}'), model.capitalize())()


class AI(BaseModel):
    model: str
    data: str


@app.post("/rp/encode")
async def encode():
    return 0


@app.post("/rp/decode")
async def decode():
    return 1


@app.post("/ai/run")
async def run(ai: AI):
    model = models[ai.model]
    return model.run(ai.data)
