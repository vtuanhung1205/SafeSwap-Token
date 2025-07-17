# src/app.py

from flask import Flask, request, jsonify
import joblib
import requests

# IMPORT CÁC HÀM TỪ FILE UTILS.PY
from utils import create_feature_dataframe, cyclical_encoder

app = Flask(__name__)

# Đường dẫn tới pipeline
# Lưu ý: Đường dẫn này là tương đối so với thư mục gốc của dự án, không phải thư mục src
PIPELINE_PATH = '../models/aptos_pro_pipeline.joblib'
pipeline = None

# Dùng try-except để xử lý việc tải mô hình một cách an toàn
try:
    pipeline = joblib.load(PIPELINE_PATH)
    print("✅ AI Model loaded successfully!")
except Exception as e:
    print(f"❌ ERROR: Could not load model. {e}")


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
    # Chạy ứng dụng trên cổng 5000
    app.run(host='0.0.0.0', port=5000, debug=False)  # Tắt debug khi chạy thật