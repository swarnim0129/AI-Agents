from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
import pandas as pd
from ml_functions import ModelTrainer

app = FastAPI()
model_trainer = ModelTrainer()

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        df = pd.read_csv(contents)
        return JSONResponse({"message": "File uploaded successfully", "columns": df.columns.tolist()})
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=400)

@app.post("/train")
async def train_model(target_column: str):
    try:
        results = model_trainer.train_models(df, target_column)
        return JSONResponse(results)
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=400)

@app.post("/predict")
async def make_prediction(feature_values: dict):
    try:
        predictions = model_trainer.make_prediction(feature_values)
        return JSONResponse(predictions)
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=400) 