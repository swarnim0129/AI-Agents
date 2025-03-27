import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.metrics import accuracy_score, mean_squared_error, classification_report

def train_model(df: pd.DataFrame, target_col: str, task_type: str = "classification") -> tuple:
    """
    Train a machine learning model based on the specified task type.
    
    Args:
        df (pd.DataFrame): Input DataFrame containing features and target
        target_col (str): Name of the target column
        task_type (str): Type of ML task ('classification' or 'regression')
    
    Returns:
        tuple: (trained_model, evaluation_metrics, feature_names)
    """
    if target_col not in df.columns:
        raise ValueError(f"Target column '{target_col}' not found!")

    X = df.drop(columns=[target_col])
    y = df[target_col]
    X = pd.get_dummies(X, drop_first=True)
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = RandomForestClassifier(n_estimators=100, random_state=42) if task_type == "classification" \
            else RandomForestRegressor(n_estimators=100, random_state=42)
    
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    
    metrics = evaluate_model(y_test, y_pred, model, X_test, task_type)
    
    return model, metrics, X.columns

def evaluate_model(y_test, y_pred, model, X_test, task_type: str) -> dict:
    """
    Evaluate the trained model and return relevant metrics.
    
    Args:
        y_test: True target values
        y_pred: Predicted target values
        model: Trained model
        X_test: Test features
        task_type: Type of ML task
    
    Returns:
        dict: Dictionary containing evaluation metrics
    """
    if task_type == "classification":
        return {
            "accuracy": accuracy_score(y_test, y_pred),
            "classification_report": classification_report(y_test, y_pred, output_dict=True)
        }
    return {
        "mse": mean_squared_error(y_test, y_pred),
        "r2_score": model.score(X_test, y_test)
    } 