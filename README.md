# 🛡️ MNTRK Sovereign Neuro-Symbolic Bio-Intelligence Grid

---

## 🔬 Project Overview

The MNTRK project is a **Sovereign Biosurveillance Platform** built for:

- 🧠 **Hybrid Neuro-Symbolic Intelligence**
- 🔄 **Real-time Adaptive Learning**
- 📊 **Spatiotemporal Predictive Modeling**
- 🔐 **Secure Cloud-Native Deployment**
- 🚀 **True Sovereign Bio-Intelligence Operations**

---

## ⚙️ Core Technology Stack

| Layer | Technology |
| ----- | ---------- |
| 🔥 Realtime DB | Firebase Firestore |
| 🧬 Historical Archive | NeonDB (Postgres) |
| 🧠 Machine Learning | scikit-learn |
| 🔎 Symbolic Reasoning | experta + networkx |
| 🌐 API Framework | FastAPI (or Flask+Connexion) |
| 🐳 Deployment | Docker |
| 🔧 CI/CD | GitHub Actions |
| 🔐 Secure Config | python-dotenv |
| 🔬 Synthetic Data | MostlyAI SDK |

---

## 🌐 Architecture Summary

```plaintext
Field Data ➔ Firestore ➔ Cloud Functions ➔ Adaptive ML
         ➔ NeonDB ➔ Historical ML Fusion
         ➔ Neuro-Symbolic Inference Engine
         ➔ Fusion Decision Layer ➔ Explainable Predictions
```

---

## 🔑 Secure Configuration (.env)

Create `.env` file (NEVER commit this):

```env
DATABASE_URL=postgresql://your-user:your-password@your-neon-host.neon.tech:5432/mntrk_sovereign?sslmode=require
FIREBASE_CREDENTIALS=/absolute/path/to/firebase-credentials.json
MOSTLYAI_API_KEY=your-mostlyai-api-key
```

---

## 🔧 Installation & Setup

### 1️⃣ Install Dependencies

```bash
pip install -r requirements.txt
```

### 2️⃣ Create Database Schema (NeonDB)

```bash
python create_neon_schema.py
```

### 3️⃣ Bootstrap Firestore Collections

```bash
python create_firestore_collections.py
```

### 4️⃣ Test Real Connections

```bash
python setup/real_firebase_test.py
python setup/neon_db_test.py
```

---

## 🚀 Local Development

### 1️⃣ Launch API Server

```bash
python app.py
```

### 2️⃣ Hybrid Model Training Trigger

```bash
python orchestrator_hybrid_training.py
```

---

## 🔄 Sovereign Training Pipeline Flow

1. 🔥 Pull last 30 days from Firestore (Adaptive Data)
2. 🗄 Merge with full NeonDB historical archive
3. 🧠 Train ML model (Random Forest, etc.)
4. 🔎 Apply Symbolic Reasoning Layer (experta)
5. 🔬 Fuse ML + Symbolic outputs
6. 📂 Save model artifacts to Firebase Storage
7. 📊 Store metrics & version into Firestore model registry

---

## 🧬 Synthetic Data Bootstrap (MostlyAI)

```python
from mostlyai.sdk import MostlyAI

mostly = MostlyAI(api_key=os.getenv("MOSTLYAI_API_KEY"), base_url="https://app.mostly.ai")
dataset = mostly.synthetic_datasets.get('your-dataset-id')
df = dataset.data()
```

---

## 🐳 Docker Deployment

```bash
docker build -t mntrk-sovereign-grid .
docker run -p 5000:5000 --env-file .env mntrk-sovereign-grid
```

---

## ⚠️ Security Notes

- Do not commit `.env` to git
- Rotate credentials periodically
- Use CI/CD secrets management for production deployments

---

## 🔬 Sovereign Deployment Readiness

| Subsystem | Status |
| --------- | ------ |
| ✅ Firestore | Live |
| ✅ Neon Postgres | Live |
| ✅ Environment Config | Secure |
| ✅ Schema | Initialized |
| ✅ Model Training | Fully Operational |
| ✅ Neuro-Symbolic Grid | Fully Integrated |
| ✅ Docker Deployment | Containerized |

---

## 🛰 Operational Status

> 🟢 **MNTRK Sovereign Grid: LIVE & OPERATIONAL**

---

## 🫡 Overlord Control Panel

This system now operates in full Neuro-Symbolic Sovereign Intelligence Mode.
