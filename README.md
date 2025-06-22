# 🎤 NoteFlow – AI-Powered Speaker Notes in Canva

**NoteFlow** is a Canva AI agent that transforms slide content into confident, time-aware speaker notes. Built for students, educators, and creators, it adapts your input into polished delivery — matching tone, pacing, and structure instantly.

> ⚠️ **Note:** This README focuses solely on the **NoteFlow (Speaker Notes Generator)** feature. Other features such as Edit Tracking and Beat Syncing are part of the broader extension project but are not part of this submission.

---

## 🔍 Problem Understanding

Slide decks are only half the story. What really matters is how you speak to them. But most people write speaker notes manually — or skip them altogether.

This leads to poor pacing, off-tone delivery, or rambling intros.

**NoteFlow solves this** by:

* Turning slide text into spoken-friendly notes
* Matching output length to your speaking time
* Adapting tone (e.g., Academic, TED-style, Explainer)
* Providing live previews, WPM analysis, and structure helpers

---

## 🧠 System Design

The system is designed as a modular React app running inside Canva’s App SDK, with a Flask-based Python backend and a Hugging Face inference integration.

### Components

* **`speakernotes_tab.tsx`** – Main UI logic with tone selector, sliders, and generation output
* **`agent.tsx`** – Registers the NoteFlow panel with Canva
* **`my_api.ts`** – Handles request to Hugging Face inference API via Flask
* **`canva_server.py`** – Flask server to build prompts and relay responses from Hugging Face
* **`speaker_notes.py`** – Core logic for prompt construction and post-processing

---

## 🧑‍💻 Code & Design Quality

* Typed with TypeScript for maintainability
* Uses Canva’s UI Kit for a native feel
* Supports five tones and multiple add-ons (Main Idea, Transitions)
* Keyword bolding for better delivery
* Word count and WPM checks for realism
* Reactively previews tone effect before generation

---

## 🎯 Impact

* **Reduces prep time** for presenters
* **Improves pacing and clarity** with structured notes
* **Boosts confidence** for students and creators
* **Encourages natural delivery** over robotic scripts

---

## ⚙️ Setup Instructions

This project includes both a **frontend** (React + Canva SDK) and a **backend** (Flask + Hugging Face API integration). Follow these instructions to run NoteFlow locally.

---

### 🖼️ Frontend (React + Canva App UI Kit)

#### 1. Install Node.js

```bash
node -v
```

#### 2. Install dependencies

```bash
git clone https://github.com/jane-z-zou/noteflow.git
cd noteflow
npm install
```

#### 3. Start the frontend server

```bash
npm start
```

Expected output:

```
Frontend running on http://localhost:8080
```

#### 4. Register the app in Canva Developer Console

Use the following `manifest.json` setup:

```json
{
  "base_url": "http://localhost:8080",
  "entry_point": "agent.tsx"
}
```

---

### 🧠 Backend (Flask + Hugging Face Inference)

> The Flask backend runs on **port 5001**

#### 1. Set up environment

```bash
python -m venv venv
source venv/bin/activate        # macOS/Linux
venv\Scripts\activate           # Windows
```

#### 2. Install dependencies

```bash
pip install flask flask-cors requests
```

Or:

```bash
pip install -r requirements.txt
```

#### 3. Start the Flask server

```bash
python canva_server.py
```

Expected output:

```
* Running on http://localhost:5001
```

---

### 🔗 Connecting Frontend & Backend

In `my_api.ts`, verify:

```ts
const BASE_API = "http://localhost:5001"; // Flask API
```

System ports:

| Component        | Port                    |
| ---------------- | ----------------------- |
| Frontend (React) | `http://localhost:8080` |
| Backend (Flask)  | `http://localhost:5001` |

---

## 🛠 Future Improvements

* Multi-slide batching
* Speaker note version history
* Voice style presets with AI preview playback
* Support for multiple model endpoints

---

## 🔗 Demo and Repo

* 🔗 **GitHub Repo:** [https://github.com/jane-z-zou/noteflow](https://github.com/jane-z-zou/noteflow)
* 🎬 Demo Video: [NoteFlow Video Demo](https://www.youtube.com/watch?v=fg9b5twAIu8)

---

## 📣 Credits

* Built by **Jane Zou** – PM in Big 4 Tax & Data Science
* Created for **Folioworks Challenge for Canva Extensions**
* Powered by **TinyLlama via Hugging Face** and custom prompt logic
