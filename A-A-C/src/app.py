from flask import Flask, request, jsonify
import pandas as pd
import joblib
import numpy as np
import lime
import lime.lime_tabular
import os
import logging # Thêm import logging
from logging.handlers import RotatingFileHandler # Thêm import này

app = Flask(__name__)
app.config['JSON_AS_ASCII'] = False # QUAN TRỌNG: Để hiển thị emoji đúng

# Load model & scaler
MODEL_PATH = 'RugPullDetectionModel/isolation_forest_model_new_data.joblib'
SCALER_PATH = 'RugPullDetectionModel/scaler_new_data.pkl'

model = joblib.load(MODEL_PATH)
scaler = joblib.load(SCALER_PATH)

OPTIMAL_THRESHOLD = 0.2059 # found in code


try:
    feature_names_for_lime = scaler.feature_names_in_.tolist()
except AttributeError:
    print("Warning: scaler.feature_names_in_ not available. Manually defining feature names based on notebook context.")
    num_features_from_notebook = 19 # Giả sử đây là số lượng features từ notebook của bạn
    feature_names_for_lime = [f"feature_{i+1}" for i in range(num_features_from_notebook)]

num_training_features = len(feature_names_for_lime)

# Tạo dữ liệu huấn luyện giả lập cho LIME, nên thay thế bằng dữ liệu thực hoặc mẫu từ dữ liệu huấn luyện gốc nếu có
dummy_training_data_for_lime = np.random.rand(100, num_training_features)
print(f"LIME Explainer initialized with {num_training_features} features: {feature_names_for_lime[:5]}...")


class_names_for_lime = ['Anomaly', 'Normal'] # 0: Anomaly (-1 model), 1: Normal (1 model)

explainer = lime.lime_tabular.LimeTabularExplainer(
    training_data=dummy_training_data_for_lime, # Nên là dữ liệu huấn luyện đã được scale
    feature_names=feature_names_for_lime,
    class_names=class_names_for_lime,
    mode='classification', # 'regression' nếu model dự đoán giá trị liên tục, 'classification' cho nhãn
    verbose=False,
    random_state=42 # Để kết quả có thể tái tạo
)

# Hàm dự đoán cho LIME
# Input: X_lime_input_np (numpy array)
# Output: numpy array có shape (n_samples, n_classes) với xác suất cho mỗi lớp
def lime_predict_fn(X_lime_input_np):

    decision_scores = model.decision_function(X_lime_input_np)
    prob_normal = 1 / (1 + np.exp(-decision_scores)) # Sigmoid, score dương -> prob_normal cao
    prob_anomaly = 1 - prob_normal                   # prob_anomaly cao khi score âm

    return np.vstack((prob_anomaly, prob_normal)).T


@app.route('/')
def home():
    return "Liquidity Anomaly Detection API - Optimized Threshold with LIME"

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No input data provided"}), 400

        try:
            df = pd.DataFrame([data], columns=feature_names_for_lime)
        except ValueError as ve:
            return jsonify({"error": f"Input data error or incorrect columns: {str(ve)}"}), 400

        missing_features = [feature for feature in feature_names_for_lime if feature not in data]
        if missing_features:
            return jsonify({"error": f"Missing features in input data: {', '.join(missing_features)}"}), 400

        df = df[feature_names_for_lime]
        df_scaled = scaler.transform(df.values)

        anomaly_score = model.decision_function(df_scaled)
        score_value = anomaly_score[0]

        if score_value < OPTIMAL_THRESHOLD:
            prediction_label = -1
            prediction_string = "Anomaly"
            warning = "Anomaly - Rug Pull Project! 🚨"
        else:
            prediction_label = 1
            prediction_string = "Normal"
            warning = "Normal - Quite safe project."

        lime_explanation_list = []
        try:
            instance_to_explain_np = df_scaled[0]
            predicted_class_index_lime = 0 if prediction_label == -1 else 1
            explanation = explainer.explain_instance(
                data_row=instance_to_explain_np,
                predict_fn=lime_predict_fn,
                num_features=10,
                labels=(predicted_class_index_lime,)
            )
            lime_explanation_list = explanation.as_list(label=predicted_class_index_lime)
        except Exception as lime_e:
            app.logger.error(f"LIME explanation error: {str(lime_e)}")
            lime_explanation_list = [{"error": f"Could not generate LIME explanation: {str(lime_e)}"}]

        return jsonify({
            "prediction_label_code": prediction_label,
            "prediction_label_string": prediction_string,
            "prediction_message": warning,
            "anomaly_score": float(score_value),
            "lime_explanation": lime_explanation_list
        })

    except KeyError as ke:
        return jsonify({"error": f"Missing feature in input data: {str(ke)}"}), 400
    except Exception as e:
        app.logger.error(f"Error during prediction: {str(e)}")
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500

@app.route('/test-sample', methods=['GET'])
def test_sample():
    sample_input = {
        'TOTAL_ADDED_LIQUIDITY':  50000,
        'TOTAL_REMOVED_LIQUIDITY': 50000,
        'NUM_LIQUIDITY_ADDS': 5,
        'NUM_LIQUIDITY_REMOVES': 2,
        'ADD_TO_REMOVE_RATIO': 2.5,
        'LAST_POOL_ACTIVITY_TIMESTAMP_hour': 14,
        'LAST_POOL_ACTIVITY_TIMESTAMP_day': 20,
        'LAST_POOL_ACTIVITY_TIMESTAMP_weekday': 1,
        'LAST_POOL_ACTIVITY_TIMESTAMP_month': 5,
        'FIRST_POOL_ACTIVITY_TIMESTAMP_hour': 9,
        'FIRST_POOL_ACTIVITY_TIMESTAMP_day': 18,
        'FIRST_POOL_ACTIVITY_TIMESTAMP_weekday': 6,
        'FIRST_POOL_ACTIVITY_TIMESTAMP_month': 4,
        'LAST_SWAP_TIMESTAMP_hour': 13,
        'LAST_SWAP_TIMESTAMP_day': 20,
        'LAST_SWAP_TIMESTAMP_weekday': 1,
        'LAST_SWAP_TIMESTAMP_month': 5,
        'INACTIVITY_STATUS_Active': 1,
        'INACTIVITY_STATUS_Inactive': 0
    }

    for feature in feature_names_for_lime:
        if feature not in sample_input:
            sample_input[feature] = 0

    df = pd.DataFrame([sample_input], columns=feature_names_for_lime)
    df = df[feature_names_for_lime]
    df_scaled = scaler.transform(df.values)

    anomaly_score_test = model.decision_function(df_scaled)
    score_value_test = anomaly_score_test[0]

    if score_value_test < OPTIMAL_THRESHOLD:
        prediction_label_test = -1
        prediction_string_test = "Anomaly"
        warning_test = "Anomaly - Rug Pull Project! 🚨"
    else:
        prediction_label_test = 1
        prediction_string_test = "Normal"
        warning_test = "Normal - Quite safe project."

    lime_explanation_list_test = []
    try:
        instance_to_explain_np = df_scaled[0]
        predicted_class_index_lime = 0 if prediction_label_test == -1 else 1
        explanation = explainer.explain_instance(
            data_row=instance_to_explain_np,
            predict_fn=lime_predict_fn,
            num_features=10,
            labels=(predicted_class_index_lime,)
        )
        lime_explanation_list_test = explanation.as_list(label=predicted_class_index_lime)
    except Exception as lime_e:
        app.logger.error(f"LIME explanation error for test sample: {str(lime_e)}")
        lime_explanation_list_test = [{"error": f"Could not generate LIME explanation: {str(lime_e)}"}]

    return jsonify({
        "input_sample": sample_input,
        "prediction_label_code": prediction_label_test,
        "prediction_label_string": prediction_string_test,
        "prediction_message": warning_test,
        "anomaly_score": float(score_value_test),
        "lime_explanation": lime_explanation_list_test
    })

# ... (phần định nghĩa feature_names_for_lime, explainer, lime_predict_fn) ...
# Tôi sẽ giả định phần này đã có ở trên và đúng
try:
    feature_names_for_lime = scaler.feature_names_in_.tolist()
except AttributeError:
    print("Warning: scaler.feature_names_in_ not available. Manually defining feature names based on notebook context.")
    num_features_from_notebook = 19
    feature_names_for_lime = [f"feature_{i+1}" for i in range(num_features_from_notebook)]

num_training_features = len(feature_names_for_lime)
dummy_training_data_for_lime = np.random.rand(100, num_training_features)
print(f"LIME Explainer initialized with {num_training_features} features: {feature_names_for_lime[:5]}...")
class_names_for_lime = ['Anomaly', 'Normal']

explainer = lime.lime_tabular.LimeTabularExplainer(
    training_data=dummy_training_data_for_lime,
    feature_names=feature_names_for_lime,
    class_names=class_names_for_lime,
    mode='classification',
    verbose=False,
    random_state=42
)

def lime_predict_fn(X_lime_input_np):
    decision_scores = model.decision_function(X_lime_input_np)
    prob_normal = 1 / (1 + np.exp(-decision_scores))
    prob_anomaly = 1 - prob_normal
    return np.vstack((prob_anomaly, prob_normal)).T


if __name__ == '__main__':
    if not app.debug:
        file_handler = RotatingFileHandler('flask_app.log', maxBytes=1024 * 1024 * 100, backupCount=20)
        file_handler.setLevel(logging.ERROR)
        formatter = logging.Formatter("[%(asctime)s] {%(pathname)s:%(lineno)d} %(levelname)s - %(message)s")
        file_handler.setFormatter(formatter)
        app.logger.addHandler(file_handler)
        # Quan trọng: đặt level cho logger của app để file_handler có tác dụng
        app.logger.setLevel(logging.INFO) # Hoặc logging.ERROR tùy nhu cầu

    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)