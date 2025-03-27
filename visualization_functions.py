import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

def plot_feature_importance(model, feature_names: list, save_path: str = None):
    """
    Plot feature importance from the trained model.
    
    Args:
        model: Trained model with feature_importances_ attribute
        feature_names (list): List of feature names
        save_path (str, optional): Path to save the plot
    """
    importance = model.feature_importances_
    feature_df = pd.DataFrame({
        "Feature": feature_names,
        "Importance": importance
    }).sort_values(by="Importance", ascending=False)

    plt.figure(figsize=(12, 6))
    sns.barplot(x="Importance", y="Feature", data=feature_df, palette="Blues_r")
    plt.title("Feature Importance Analysis", fontsize=14, pad=20)
    plt.xlabel("Importance Score", fontsize=12)
    plt.ylabel("Feature", fontsize=12)
    
    if save_path:
        plt.savefig(save_path, bbox_inches='tight', dpi=300)
    plt.show()

def plot_model_diagnostics(df: pd.DataFrame, target_col: str, save_dir: str = None):
    """
    Generate comprehensive model diagnostic plots.
    
    Args:
        df (pd.DataFrame): Input DataFrame
        target_col (str): Name of target column
        save_dir (str, optional): Directory to save plots
    """
    # Correlation Heatmap
    plt.figure(figsize=(12, 10))
    sns.heatmap(df.corr(), annot=True, cmap="coolwarm", fmt=".2f")
    plt.title("Feature Correlation Analysis", fontsize=14, pad=20)
    if save_dir:
        plt.savefig(f"{save_dir}/correlation_heatmap.png", bbox_inches='tight', dpi=300)
    plt.show()

    # Pairplot
    sns.pairplot(df, hue=target_col, diag_kind="kde")
    if save_dir:
        plt.savefig(f"{save_dir}/pairplot.png", bbox_inches='tight', dpi=300)
    plt.show()

    # Boxplots
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    for col in numeric_cols:
        if col != target_col:
            plt.figure(figsize=(10, 6))
            sns.boxplot(x=df[target_col], y=df[col])
            plt.title(f"Distribution of {col} by {target_col}", fontsize=12, pad=20)
            if save_dir:
                plt.savefig(f"{save_dir}/boxplot_{col}.png", bbox_inches='tight', dpi=300)
            plt.show() 