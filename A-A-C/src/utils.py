# src/utils.py
# This file contains utility functions for the Aptos Sybil detection project.
# It handles data fetching from the blockchain and feature engineering.

import pandas as pd
import numpy as np
import requests
import time
from datetime import datetime, timezone
import collections

# --- Constants ---
NODE_URL = "https://fullnode.mainnet.aptoslabs.com/v1"


# ==============================================================================
# SECTION 1: CUSTOM FUNCTIONS FOR THE ML PIPELINE
# ==============================================================================

def cyclical_encoder(X):
    """
    Encodes cyclical features (like hour or day of the week) using sine and
    cosine transformations. This function is required by the scikit-learn
    pipeline when loading the model.
    """
    X_encoded = np.array([])
    # Max values for: hour (0-23), day_of_week (0-6), month (1-12)
    max_vals = [23, 6, 12]
    for i in range(X.shape[1]):
        col_data = X[:, i:i + 1]
        max_val = max_vals[i]
        # Sine and Cosine transformation
        X_sin = np.sin(2 * np.pi * col_data / (max_val + 1))
        X_cos = np.cos(2 * np.pi * col_data / (max_val + 1))
        if X_encoded.size == 0:
            X_encoded = np.concatenate([X_sin, X_cos], axis=1)
        else:
            X_encoded = np.concatenate([X_encoded, X_sin, X_cos], axis=1)
    return X_encoded


# ==============================================================================
# SECTION 2: BLOCKCHAIN DATA FETCHING FUNCTIONS
# ==============================================================================

def get_all_transactions(session, address):
    """Fetches all transactions for a given address from the Aptos fullnode."""
    all_transactions = []
    start = 0
    limit = 100
    while True:
        params = {'start': start, 'limit': limit}
        try:
            response = session.get(f"{NODE_URL}/accounts/{address}/transactions", params=params)
            response.raise_for_status()
            transactions = response.json()
            if not transactions:
                break
            all_transactions.extend(transactions)
            start += len(transactions)
            if len(transactions) < limit:
                break
            time.sleep(0.1)  # Be respectful to the API
        except requests.exceptions.RequestException:
            print(f"Warning: Could not fetch all transactions for {address}.")
            break
    return all_transactions


def get_wallet_resources(session, address):
    """Fetches all on-chain resources for a given address."""
    try:
        response = session.get(f"{NODE_URL}/accounts/{address}/resources")
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException:
        return []


# ==============================================================================
# SECTION 3: MAIN FEATURE ENGINEERING FUNCTION
# ==============================================================================

def create_feature_dataframe(session, address):
    """
    Orchestrates data fetching and feature creation for a single wallet address.
    Returns a pandas DataFrame ready for the prediction pipeline.
    """
    print(f"  - Fetching transactions and resources for {address[:10]}...")
    all_transactions = get_all_transactions(session, address)
    resources = get_wallet_resources(session, address)

    # Initialize a dictionary with default values for all features
    profile = {
        'wallet_age_days': 0, 'apt_balance': 0, 'other_token_count': 0,
        'total_transaction_count': 0, 'successful_transaction_count': 0, 'failed_transaction_count': 0,
        'unique_interacted_contracts': 0, 'unique_interacted_addresses': 0,
        'avg_time_between_tx_seconds': -1, 'std_dev_time_between_tx_seconds': -1,
        'most_active_hour': -1, 'is_self_funded': 1,
        'tx_day_of_week': -1, 'tx_month': -1, 'tx_day_of_month': -1,
        'success_rate': 0, 'new_contract_rate': 0, 'balance_per_tx': 0
    }

    if not all_transactions:
        print(f"  - WARNING: No transactions found for wallet {address}. Returning default profile.")
        return pd.DataFrame([profile])

    # --- Start Feature Calculation ---
    profile['total_transaction_count'] = len(all_transactions)
    profile['successful_transaction_count'] = sum(1 for tx in all_transactions if tx.get('success'))
    profile['failed_transaction_count'] = profile['total_transaction_count'] - profile['successful_transaction_count']

    # Temporal features
    first_tx = all_transactions[-1]
    first_tx_timestamp = int(first_tx['timestamp']) // 1000000
    creation_datetime = datetime.fromtimestamp(first_tx_timestamp, tz=timezone.utc)
    profile['wallet_age_days'] = (datetime.now(timezone.utc) - creation_datetime).days
    profile['tx_day_of_week'] = creation_datetime.weekday()  # Monday=0, Sunday=6
    profile['tx_month'] = creation_datetime.month
    profile['tx_day_of_month'] = creation_datetime.day

    timestamps = sorted([int(tx['timestamp']) // 1000000 for tx in all_transactions])
    if len(timestamps) > 1:
        time_diffs = np.diff(timestamps)
        profile['avg_time_between_tx_seconds'] = float(np.mean(time_diffs))
        profile['std_dev_time_between_tx_seconds'] = float(np.std(time_diffs))

    hours = [datetime.fromtimestamp(ts, tz=timezone.utc).hour for ts in timestamps]
    if hours:
        profile['most_active_hour'] = collections.Counter(hours).most_common(1)[0][0]

    # Funding and balance features
    if first_tx.get('sender') != address:
        profile['is_self_funded'] = 0

    apt_balance = 0
    other_token_count = 0
    for resource in resources:
        if resource.get('type') == '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>':
            apt_balance = int(resource['data']['coin']['value']) / 10 ** 8
        elif resource.get('type', '').startswith('0x1::coin::CoinStore<'):
            other_token_count += 1
    profile['apt_balance'] = apt_balance
    profile['other_token_count'] = other_token_count

    # Interaction features
    interacted_contracts = {tx['payload']['function'].split('::')[0] for tx in all_transactions if
                            tx.get('payload') and tx['payload'].get('function')}
    profile['unique_interacted_contracts'] = len(interacted_contracts)

    interacted_addresses = {arg for tx in all_transactions if tx.get('payload') and tx['payload'].get('arguments') for
                            arg in tx['payload']['arguments'] if
                            isinstance(arg, str) and arg.startswith('0x') and len(arg) > 40}
    profile['unique_interacted_addresses'] = len(interacted_addresses - {address})

    # Ratio features
    profile['success_rate'] = profile['successful_transaction_count'] / (profile['total_transaction_count'] + 1e-6)
    profile['new_contract_rate'] = profile['unique_interacted_contracts'] / (profile['total_transaction_count'] + 1e-6)
    profile['balance_per_tx'] = profile['apt_balance'] / (profile['total_transaction_count'] + 1e-6)

    print(f"  - Successfully created feature profile for {address[:10]}...")
    return pd.DataFrame([profile])