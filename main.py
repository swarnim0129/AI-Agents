import pandas as pd
from ml_functions import train_model, plot_feature_importance, plot_model_diagnostics

# Example usage
def run_ml_analysis(data_path: str, target_col: str, save_dir: str = None):
    """
    Run complete machine learning analysis pipeline.
    
    Args:
        data_path (str): Path to the input dataset
        target_col (str): Name of the target column
        save_dir (str, optional): Directory to save plots
    """
    # Load data
    df = pd.read_csv(data_path)
    
    # Determine task type
    task_type = "classification" if df[target_col].nunique() < 10 else "regression"
    
    # Train model
    model, metrics, feature_names = train_model(df, target_col, task_type)
    
    # Print analysis
    print("\nModel Evaluation Metrics:")
    print("------------------------")
    for metric, value in metrics.items():
        print(f"{metric}: {value}")
    
    # Generate visualizations
    plot_feature_importance(model, feature_names, 
                          save_path=f"{save_dir}/feature_importance.png" if save_dir else None)
    plot_model_diagnostics(df, target_col, save_dir)

if __name__ == "__main__":
    # Example usage
    run_ml_analysis(
        data_path="your_data.csv",
        target_col="your_target_column",
        save_dir="output/plots"
    ) 