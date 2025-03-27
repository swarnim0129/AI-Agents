import pandas as pd
import numpy as np

def preprocess_data(df: pd.DataFrame, 
                   columns_to_drop: list = None,
                   threshold_missing: float = 0.7) -> pd.DataFrame:
    """
    Preprocess the data by handling missing values and dropping specified columns.
    
    Args:
        df (pd.DataFrame): Input DataFrame
        columns_to_drop (list): List of columns to drop
        threshold_missing (float): Threshold for dropping columns with missing values
        
    Returns:
        pd.DataFrame: Preprocessed DataFrame
    """
    print("Initial shape:", df.shape)
    
    # 1. Drop specified columns
    if columns_to_drop:
        df = df.drop(columns=columns_to_drop)
        print(f"Shape after dropping specified columns: {df.shape}")
    
    # 2. Drop columns with high missing values
    missing_percentages = df.isnull().mean()
    columns_to_drop_missing = missing_percentages[missing_percentages > threshold_missing].index
    df = df.drop(columns=columns_to_drop_missing)
    print(f"Shape after dropping columns with >{threshold_missing*100}% missing values: {df.shape}")
    
    # 3. Handle remaining missing values
    numeric_columns = df.select_dtypes(include=[np.number]).columns
    categorical_columns = df.select_dtypes(exclude=[np.number]).columns
    
    # Fill numeric missing values with median
    df[numeric_columns] = df[numeric_columns].fillna(df[numeric_columns].median())
    
    # Fill categorical missing values with mode
    df[categorical_columns] = df[categorical_columns].fillna(df[categorical_columns].mode().iloc[0])
    
    print("Final shape:", df.shape)
    print("\nMissing values after preprocessing:")
    print(df.isnull().sum().sum())
    
    return df 