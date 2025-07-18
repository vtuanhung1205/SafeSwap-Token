import requests
import json
import time
from datetime import datetime, timezone
import numpy as np
import collections
import pandas as pd
import os

# ==============================================================================
# CẤU HÌNH - CHỈ CẦN THAY ĐỔI Ở ĐÂY
# ==============================================================================

# 1. ĐIỀN ĐỊA CHỈ VÍ BẠN MUỐN XỬ LÝ
WALLET_ADDRESS = "0x66cb05df2d855fbae92cdb2dfac9a0b29c969a03998fa817735d27391b52b189"  # Thay bằng ví bạn muốn

# 2. ĐÁNH DẤU NHÃN CHO VÍ NÀY (0 = Thường, 1 = Đáng nghi)
LABEL = 0

NODE_URL = "https://fullnode.mainnet.aptoslabs.com/v1"
OUTPUT_CSV_FILE = "../data/raw/aptos_wallet_features.csv"


# ==============================================================================
# CÁC HÀM HỖ TRỢ (Giữ nguyên)
# ==============================================================================

def get_all_transactions(session, address):
    all_transactions = []
    start = 0
    limit = 100
    print("\n--- Bắt đầu lấy lịch sử giao dịch ---")
    while True:
        params = {'start': start, 'limit': limit}
        try:
            response = session.get(f"{NODE_URL}/accounts/{address}/transactions", params=params)
            response.raise_for_status()
            transactions = response.json()
            if not transactions:
                print("Đã lấy hết giao dịch.")
                break
            print(f"Đã lấy {len(transactions)} giao dịch, bắt đầu từ vị trí {start}...")
            all_transactions.extend(transactions)
            start += len(transactions)
            if len(transactions) < limit:
                print("Đã lấy hết giao dịch.")
                break
            time.sleep(0.2)
        except requests.exceptions.RequestException as e:
            print(f"Lỗi khi lấy giao dịch: {e}")
            break
    return all_transactions


def get_wallet_resources(session, address):
    try:
        response = session.get(f"{NODE_URL}/accounts/{address}/resources")
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException:
        return []


# ==============================================================================
# HÀM XỬ LÝ CHÍNH (ĐÃ BỔ SUNG ĐẦY ĐỦ)
# ==============================================================================

def create_wallet_profile(session, address, label):
    """Tạo một hàng dữ liệu (dictionary) cho một ví."""

    all_transactions = get_all_transactions(session, address)
    resources = get_wallet_resources(session, address)

    # Dữ liệu mặc định nếu không có giao dịch
    profile = {
        'wallet_address': address,
        'label': label,
        'first_transaction_date': None,  # Bổ sung
        'wallet_age_days': 0,
        'apt_balance': 0,
        'other_token_count': 0,
        'total_transaction_count': 0,
        'successful_transaction_count': 0,
        'failed_transaction_count': 0,
        'unique_interacted_contracts': 0,
        'unique_interacted_addresses': 0,
        'avg_time_between_tx_seconds': -1,
        'std_dev_time_between_tx_seconds': -1,
        'most_active_hour': -1,
        'most_active_weekday': "N/A",  # Bổ sung
        'is_self_funded': 1
    }

    if not all_transactions:
        print(f"!!! CẢNH BÁO: Không tìm thấy giao dịch nào cho ví {address}")
        return profile

    # --- Tính toán các feature nếu có giao dịch ---
    profile['total_transaction_count'] = len(all_transactions)
    profile['successful_transaction_count'] = sum(1 for tx in all_transactions if tx['success'])
    profile['failed_transaction_count'] = profile['total_transaction_count'] - profile['successful_transaction_count']

    first_tx = all_transactions[-1]
    first_tx_timestamp = int(first_tx['timestamp']) // 1000000
    creation_datetime = datetime.fromtimestamp(first_tx_timestamp, tz=timezone.utc)

    # Bổ sung dữ liệu vào profile
    profile['first_transaction_date'] = creation_datetime.strftime('%Y-%m-%d %H:%M:%S UTC')
    profile['wallet_age_days'] = (datetime.now(timezone.utc) - creation_datetime).days

    if first_tx.get('sender') != address:
        profile['is_self_funded'] = 0

    apt_balance = 0
    other_token_count = 0
    for resource in resources:
        if resource['type'] == '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>':
            apt_balance = int(resource['data']['coin']['value']) / 10 ** 8
        elif resource['type'].startswith('0x1::coin::CoinStore<'):
            other_token_count += 1
    profile['apt_balance'] = apt_balance
    profile['other_token_count'] = other_token_count

    interacted_addresses = set()
    interacted_contracts = set()
    for tx in all_transactions:
        if tx['payload'].get('function'):
            interacted_contracts.add(tx['payload']['function'].split('::')[0])
        if tx['payload'].get('arguments'):
            for arg in tx['payload']['arguments']:
                if isinstance(arg, str) and arg.startswith('0x') and len(arg) > 40:
                    interacted_addresses.add(arg)
    profile['unique_interacted_contracts'] = len(interacted_contracts)
    profile['unique_interacted_addresses'] = len(interacted_addresses - {address})

    timestamps = sorted([int(tx['timestamp']) // 1000000 for tx in all_transactions])
    if len(timestamps) > 1:
        time_diffs = np.diff(timestamps)
        profile['avg_time_between_tx_seconds'] = float(np.mean(time_diffs))
        profile['std_dev_time_between_tx_seconds'] = float(np.std(time_diffs))

    hours = [datetime.fromtimestamp(ts, tz=timezone.utc).hour for ts in timestamps]
    weekdays = [datetime.fromtimestamp(ts, tz=timezone.utc).strftime('%A') for ts in
                timestamps]  # Lấy tên đầy đủ của ngày

    # Bổ sung dữ liệu vào profile
    if hours:
        profile['most_active_hour'] = collections.Counter(hours).most_common(1)[0][0]
    if weekdays:
        profile['most_active_weekday'] = collections.Counter(weekdays).most_common(1)[0][0]

    return profile


# ==============================================================================
# HÀM MAIN ĐỂ CHẠY VÀ GHI THÊM VÀO FILE (Giữ nguyên)
# ==============================================================================

def main():
    """Xử lý một ví và ghi thêm (append) vào file CSV."""
    session = requests.Session()

    print(f"Bắt đầu xử lý ví: {WALLET_ADDRESS} với nhãn: {LABEL}")

    profile = create_wallet_profile(session, WALLET_ADDRESS, LABEL)

    print("\n--- HỒ SƠ VÍ ---")
    print(json.dumps(profile, indent=4, ensure_ascii=False))
    print("------------------")

    df_new_row = pd.DataFrame([profile])

    file_exists = os.path.isfile(OUTPUT_CSV_FILE)

    df_new_row.to_csv(OUTPUT_CSV_FILE, mode='a', header=not file_exists, index=False)

    print(f"\n✅ Đã ghi thêm dữ liệu của ví vào file: {OUTPUT_CSV_FILE}")


if __name__ == "__main__":
    main()