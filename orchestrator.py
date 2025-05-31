
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import MinMaxScaler

# --- Symbolic Rule Engine ---
def apply_rule_engine(df):
    df['rule_high_risk_flag'] = ((df['temperature'] > 30) & (df['humidity'] < 30)).astype(int)
    df['rule_risk_level'] = df['rule_high_risk_flag'].replace({1: 'High', 0: 'Low'})
    return df

# --- ML Model Prediction ---
def apply_ml_model(df, model):
    X = df[['temperature', 'humidity', 'rainfall', 'vegetation_index', 'soil_moisture']]
    df['ml_probability'] = model.predict_proba(X)[:, 1]
    df['ml_predicted_class'] = model.predict(X)
    return df

# --- Neutrosophic ---
def compute_neutrosophic(df):
    df['neutro_truth'] = np.clip(df['ml_probability'], 0, 1)
    df['neutro_indeterminacy'] = np.abs(0.5 - df['ml_probability'])
    df['neutro_falsity'] = 1 - df['neutro_truth']
    return df

# --- AHP ---
def compute_ahp(df):
    df['ahp_priority_score'] = (
        0.3 * df['temperature'] +
        0.2 * df['humidity'] +
        0.2 * df['rainfall'] +
        0.2 * df['vegetation_index'] +
        0.1 * df['soil_moisture']
    )
    return df

# --- TOPSIS ---
def compute_topsis(df):
    features = ['temperature', 'humidity', 'rainfall', 'vegetation_index', 'soil_moisture']
    scaler = MinMaxScaler()
    normalized = scaler.fit_transform(df[features])
    ideal_best = normalized.max(axis=0)
    ideal_worst = normalized.min(axis=0)
    df['topsis_distance_best'] = np.linalg.norm(normalized - ideal_best, axis=1)
    df['topsis_distance_worst'] = np.linalg.norm(normalized - ideal_worst, axis=1)
    df['topsis_score'] = df['topsis_distance_worst'] / (df['topsis_distance_best'] + df['topsis_distance_worst'])
    return df

# --- Grey Relational Analysis ---
def compute_grey(df):
    features = ['temperature', 'humidity', 'rainfall', 'vegetation_index', 'soil_moisture']
    ref = df[features].mean()
    df['grey_relation_grade'] = df[features].apply(lambda row: 1 / (1 + np.abs(row - ref).sum()), axis=1)
    return df

# --- Unified Enrichment & Training ---
def enrich_and_train(df, model=None):
    df = apply_rule_engine(df)
    if model is not None:
        df = apply_ml_model(df, model)
    else:
        df['ml_probability'] = np.random.rand(len(df))
        df['ml_predicted_class'] = np.random.randint(0, 2, len(df))
    df = compute_neutrosophic(df)
    df = compute_ahp(df)
    df = compute_topsis(df)
    df = compute_grey(df)
    feature_cols = [
        'temperature', 'humidity', 'rainfall', 'vegetation_index', 'soil_moisture',
        'ml_probability', 'rule_high_risk_flag',
        'neutro_truth', 'neutro_indeterminacy', 'neutro_falsity',
        'ahp_priority_score', 'topsis_score', 'grey_relation_grade'
    ]
    y = df['outbreak_risk'] if 'outbreak_risk' in df.columns else None
    if y is not None:
        model = RandomForestClassifier(n_estimators=300, max_depth=10)
        model.fit(df[feature_cols], y)
    return df, model

def main():
    # Example: Load data
    df = pd.read_csv('data.csv')
    # Optionally, load a pre-trained model
    model = None
    enriched_df, trained_model = enrich_and_train(df, model)
    enriched_df.to_csv('enriched_data.csv', index=False)
    print('Enrichment and training complete. Outputs saved.')

if __name__ == '__main__':
    main()
