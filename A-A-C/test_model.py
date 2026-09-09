import joblib
import pandas as pd

pipeline = joblib.load('models/aptos_pro_pipeline.joblib')

profile1 = {
    'wallet_age_days': 0, 'apt_balance': 0, 'other_token_count': 0,
    'total_transaction_count': 0, 'successful_transaction_count': 0, 'failed_transaction_count': 0,
    'unique_interacted_contracts': 0, 'unique_interacted_addresses': 0,
    'avg_time_between_tx_seconds': -1, 'std_dev_time_between_tx_seconds': -1,
    'most_active_hour': -1, 'is_self_funded': 1,
    'tx_day_of_week': -1, 'tx_month': -1, 'tx_day_of_month': -1,
    'success_rate': 0, 'new_contract_rate': 0, 'balance_per_tx': 0
}

profile2 = {
    'wallet_age_days': 100, 'apt_balance': 1000, 'other_token_count': 5,
    'total_transaction_count': 500, 'successful_transaction_count': 490, 'failed_transaction_count': 10,
    'unique_interacted_contracts': 50, 'unique_interacted_addresses': 100,
    'avg_time_between_tx_seconds': 3600, 'std_dev_time_between_tx_seconds': 1000,
    'most_active_hour': 14, 'is_self_funded': 0,
    'tx_day_of_week': 3, 'tx_month': 6, 'tx_day_of_month': 15,
    'success_rate': 0.98, 'new_contract_rate': 0.1, 'balance_per_tx': 2
}

df = pd.DataFrame([profile1, profile2])
try:
    from src.utils import cyclical_encoder
except ImportError:
    from utils import cyclical_encoder

print("Proba:")
print(pipeline.predict_proba(df))
