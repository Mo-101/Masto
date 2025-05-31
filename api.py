
from fastapi import FastAPI, UploadFile, File
import pandas as pd
from orchestrator import enrich_and_train
import io

app = FastAPI()

@app.post("/enrich/")
def enrich_data(file: UploadFile = File(...)):
    df = pd.read_csv(io.BytesIO(file.file.read()))
    enriched_df, _ = enrich_and_train(df)
    output = io.StringIO()
    enriched_df.to_csv(output, index=False)
    return {"enriched_data": output.getvalue()}

@app.get("/health")
def health():
    return {"status": "ok"}
