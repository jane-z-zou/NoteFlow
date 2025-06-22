from flask import Flask, request, jsonify
from flask_cors import CORS
import re
import difflib
import io
from datetime import datetime, timedelta
from collections import defaultdict
from fpdf import FPDF
import random

from speaker_notes import (
    build_prompt,
    estimate_duration,
    clean_spacing,
    remove_loops,
    finish_last_sentence
)

from beat_sync import export_json, export_csv, auto_slide_timing, detect_beats_from_audio
from llama_wrapper import generate_local_llm_response  # Your LLM wrapper

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, allow_headers=["Content-Type", "Authorization"])
# 🎙 Speaker Notes
@app.route('/generate_notes', methods=['POST'])
def generate_notes():
    try:
        data = request.get_json()
        slide_text = data.get("slide_text")
        tone = data.get("tone", "academic")
        max_seconds = data.get("max_seconds", 60)
        include_main_idea = data.get("include_main_idea", True)
        include_transitions = data.get("include_transitions", True)

        if not slide_text:
            return jsonify({"error": "Missing 'slide_text'"}), 400

        approx_words = int(max_seconds * 2.4)
        max_tokens = int(approx_words * 1.33)

        prompt = build_prompt(
            slide_text=slide_text,
            tone=tone,
            include_main_idea=include_main_idea,
            include_transitions=include_transitions
        )

        notes = generate_local_llm_response(prompt, max_tokens=max_tokens)

        notes = finish_last_sentence(notes)
        notes = remove_loops(notes)
        bullets = clean_spacing(notes)
        minutes, seconds = estimate_duration(notes)

        return jsonify({
            "speaker_notes": bullets,
            "estimated_duration": {
                "minutes": minutes,
                "seconds": seconds
            }
        })
    except Exception as e:
        print("❌ Backend error (generate_notes):", e)
        return jsonify({"error": str(e)}), 500
    
@app.route('/preview_note', methods=['POST', 'OPTIONS'])
def preview_note():
    if request.method == 'OPTIONS':
        # CORS preflight
        return '', 200

    try:
        data = request.get_json()
        slide_text = data.get("slide_text", "").strip()
        tone = data.get("tone", "Academic")

        if not slide_text:
            return jsonify({"error": "Missing slide_text"}), 400

        preview_prompt = f"""
You are a presentation assistant.

Give a 1–2 sentence preview of how you would begin speaker notes based on the content below.
Use a "{tone}" tone. Do not label it as a preview.

Slide content:
{slide_text}
"""

        preview = generate_local_llm_response(preview_prompt, max_tokens=60)
        return jsonify({"preview": preview.strip()})

    except Exception as e:
        print("❌ Error in /preview_note:", e)
        return jsonify({"error": str(e)}), 500

# 🎧 Audio Beat Sync
@app.route('/generate_beats', methods=['POST'])
def generate_beats():
    try:
        audio_file = request.files.get("audio")
        if not audio_file:
            return jsonify({"error": "Missing audio file"}), 400

        num_beats = int(request.form.get("num_beats", 0))
        even_spacing = request.form.get("even_spacing", "false").lower() == "true"
        start_time = float(request.form.get("start_time", 0))
        end_time = float(request.form.get("end_time", 0))

        audio_path = f"/tmp/{audio_file.filename}"
        audio_file.save(audio_path)

        beat_times = detect_beats_from_audio(
            audio_path, num_beats=num_beats or None,
            even_spacing=even_spacing, start=start_time, end=end_time
        )

        sync_points = [{"slide": f"Slide {i+1}", "time": t} for i, t in enumerate(beat_times)]

        return jsonify({
            "sync_points": sync_points,
            "estimated_total_duration": round(beat_times[-1] if beat_times else 0, 2)
        })
    except Exception as e:
        print("❌ Backend error (real beat sync):", e)
        return jsonify({"error": str(e)}), 500

# # 📁 Export JSON
# @app.route("/export_json", methods=["POST"])
# def export_json_route():
#     try:
#         beats_str = request.form.get("beats", "")
#         if not beats_str.strip():
#             return jsonify({"error": "Missing 'beats' data"}), 400
#         return export_json(beats_str), 200, {"Content-Type": "application/json"}
#     except Exception as e:
#         print("❌ Backend error (export_json):", e)
#         return jsonify({"error": str(e)}), 500

# # 📄 Export CSV
# @app.route("/export_csv", methods=["POST"])
# def export_csv_route():
#     try:
#         beats_str = request.form.get("beats", "")
#         if not beats_str.strip():
#             return jsonify({"error": "Missing 'beats' data"}), 400
#         return export_csv(beats_str), 200, {"Content-Type": "text/plain"}
#     except Exception as e:
#         print("❌ Backend error (export_csv):", e)
#         return jsonify({"error": str(e)}), 500

# 📏 Slide Timing Suggestion
@app.route("/auto_slide_timing", methods=["POST"])
def auto_slide_timing_route():
    try:
        beats_str = request.form.get("beats", "")
        if not beats_str.strip():
            return jsonify({"error": "Missing 'beats' data"}), 400
        suggestion = auto_slide_timing(beats_str)
        return jsonify({"suggestion": suggestion})
    except Exception as e:
        print("❌ Backend error (auto_slide_timing):", e)
        return jsonify({"error": str(e)}), 500

@app.route("/generate_visual_prompt", methods=["POST"])
def generate_visual_prompt():
    try:
        data = request.get_json()
        slide_text = data.get("slide_text", "")
        style = data.get("style", "Infographic")

        prompt = f"""Write a short visual prompt for an AI image generator based on the slide content below.

Include:
- Key visual elements (objects, people, actions, etc.)
- The exact phrase: "in {style} style"

Do not write full sentences. Keep it under 280 characters.

Slide content:
{slide_text}
"""

        raw = generate_local_llm_response(prompt, max_tokens=80).strip()
        result = raw[:280].strip()
        trimmed = clean_spacing(result)
        trimmed = trimmed.replace("- ", "")
        return jsonify({"visual_prompt": trimmed})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Edit Tracker

# Dummy user actions to simulate edit types
EDIT_TYPES = ["text", "image", "transition"]

@app.route("/fetch_edits", methods=["GET"])
def fetch_edits():
    users = ["Seth Tran", "Jane Doe", "Leo Kim"]
    slides = [f"slide-{i}" for i in range(1, 6)]
    fake_edits = []

    for _ in range(15):
        user = random.choice(users)
        slide = random.choice(slides)
        edit_type = random.choice(EDIT_TYPES)
        num_edits = random.randint(1, 5)
        duration_sec = random.randint(30, 300)
        timestamp = (datetime.utcnow() - timedelta(seconds=random.randint(0, 3600))).isoformat()

        fake_edits.append({
            "user": user,
            "slide_id": slide,
            "edit_type": edit_type,
            "num_edits": num_edits,
            "duration_sec": duration_sec,
            "timestamp": timestamp,
        })

    return jsonify(fake_edits)

if __name__ == "__main__":
    app.run(port=5001)
