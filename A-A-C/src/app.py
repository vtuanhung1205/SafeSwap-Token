# src/app.py

from flask import Flask, request, jsonify
import joblib
import requests
import os

# IMPORT CÁC HÀM TỪ FILE UTILS.PY
try:
    from src.utils import create_feature_dataframe, cyclical_encoder
except ImportError:
    from utils import create_feature_dataframe, cyclical_encoder

app = Flask(__name__)

# Đường dẫn tới pipeline - thử nhiều đường dẫn có thể
PIPELINE_PATHS = [
    '../models/aptos_pro_pipeline.joblib',
    'models/aptos_pro_pipeline.joblib',
    './models/aptos_pro_pipeline.joblib',
    'A-A-C/models/aptos_pro_pipeline.joblib'
]

pipeline = None

# Dùng try-except để xử lý việc tải mô hình một cách an toàn
for path in PIPELINE_PATHS:
    try:
        pipeline = joblib.load(path)
        print(f"✅ AI Model loaded successfully from: {path}")
        break
    except Exception as e:
        print(f"❌ Failed to load from {path}: {e}")
        continue

if pipeline is None:
    print("❌ ERROR: Could not load model from any path")


@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'message': 'SafeSwap AI Service',
        'status': 'running',
        'version': '1.0.0',
        'model_loaded': pipeline is not None,
        'endpoints': {
            'health': '/health',
            'predict': '/predict (POST)'
        }
    })


@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'OK',
        'service': 'SafeSwap AI Service',
        'model_loaded': pipeline is not None,
        'version': '1.0.0'
    })


@app.route('/predict', methods=['POST'])
def predict():
    if pipeline is None:
        return jsonify({'error': 'Model is not available'}), 500

    data = request.get_json()
    if not data or 'wallet_address' not in data:
        return jsonify({'error': 'Missing wallet_address in request body'}), 400

    wallet_address = data['wallet_address']

    try:
        session = requests.Session()
        # Dùng hàm đã import
        features_df = create_feature_dataframe(session, wallet_address)

        prediction = pipeline.predict(features_df)
        prediction_proba = pipeline.predict_proba(features_df)

        result = {
            'wallet_address': wallet_address,
            'prediction': 'Sybil' if prediction[0] == 1 else 'Normal',
            'is_sybil': int(prediction[0]),
            'confidence': float(prediction_proba[0][prediction[0]]),
            'sybil_probability': float(prediction_proba[0][1])
        }

        return jsonify(result)

    except Exception as e:
        return jsonify({'error': f'An error occurred during prediction: {str(e)}'}), 500


if __name__ == '__main__':
    # Chạy ứng dụng trên cổng từ environment hoặc 5000
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)  # Tắt debug khi chạy thật