import pandas as pd
import numpy as np
import os

def generate_messy_data(output_path):
    np.random.seed(42)
    n_rows = 1000
    
    data = {
        'id': range(1, n_rows + 1),
        'name': [f"User_{i}" for i in range(1, n_rows + 1)],
        'age': np.random.choice([20, 30, 40, np.nan], n_rows),
        'email': [f"user_{i}@example.com" if i % 10 != 0 else np.nan for i in range(1, n_rows + 1)],
        'signup_date': pd.date_range(start='2023-01-01', periods=n_rows, freq='D'),
        'revenue': np.random.uniform(0, 1000, n_rows)
    }
    
    # Add some messy bits
    df = pd.DataFrame(data)
    df.loc[0:5, 'revenue'] = -100  # Invalid negative values
    df.loc[10:15, 'revenue'] = 1000000  # Outliers
    df.loc[20:25, 'email'] = "invalid_email"
    
    # Add duplicates
    df = pd.concat([df, df.head(5)], ignore_index=True)
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_csv(output_path, index=False)
    print(f"Sample data generated at {output_path}")

if __name__ == "__main__":
    generate_messy_data("backend/sample_data/messy_dataset.csv")
