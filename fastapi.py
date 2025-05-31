from fastapi import FastAPI, UploadFile, File
import pandas as pd
from orchestrator import enrich_and_train
import io

app = FastAPI()

@app.post("/enrich/")
def enrich_data(file: UploadFile = File(...)):
    df = pd.read_csv(file.file)
    return enrich_and_train(df)