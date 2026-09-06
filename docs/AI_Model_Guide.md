# AI Scam Detection Service Guide

The SafeSwap AI Scam Detection Service is a dedicated Python application located in the `A-A-C/` directory. It uses a Machine Learning model (XGBoost/LightGBM) to analyze Aptos wallet addresses and predict if they belong to a "Sybil" or scammer.

## Directory Structure (`./A-A-C`)
- **`src/app.py`**: The main Flask API server.
- **`src/utils.py`**: Feature engineering scripts (e.g., pulling on-chain data to feed into the model).
- **`models/`**: Contains the pre-trained `.joblib` machine learning pipeline (`aptos_pro_pipeline.joblib`).
- **`requirements.txt`**: Python dependencies needed to run the service.
- **`data/` & `notebooks/`**: Research data and Jupyter notebooks used for training the model.

## How It Works
When the SafeSwap Backend wants to evaluate the risk of a swap or a wallet, it makes an HTTP POST request to this Python Flask service (`/predict`). The Python service:
1. Extracts historical transaction features for that wallet.
2. Runs the features through the `.joblib` model.
3. Returns a risk score/probability and a "Sybil" vs "Normal" classification back to the Node.js backend.

## How to Run the AI Service Locally

To spin up the Python Flask service, open a **new terminal window** and follow these steps:

### 1. Navigate to the folder
```bash
cd A-A-C
```

### 2. Create a Virtual Environment (Recommended)
Creating a virtual environment ensures that the Python packages don't conflict with your system packages.
```bash
python3 -m venv venv

# On Mac/Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Start the Server
```bash
python src/app.py
```

*By default, the Flask API will start running on port **5000**. (If your Node.js backend is already using port 5000, you can change the Python port by setting the environment variable: `export PORT=5001 && python src/app.py`)*

## API Endpoints

### `GET /health`
Verifies that the service is running and the model is successfully loaded.

### `POST /predict`
Analyzes a wallet address.
**Request Body:**
```json
{
  "wallet_address": "0x123abc..."
}
```
**Response:**
```json
{
  "wallet_address": "0x123abc...",
  "prediction": "Sybil",
  "is_sybil": 1,
  "confidence": 0.98,
  "sybil_probability": 0.98
}
```
