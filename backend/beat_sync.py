import json
import librosa

def export_json(beats_str):
    beats = [float(b.strip("s")) for b in beats_str.splitlines() if b.strip()]
    return json.dumps({"beats": beats}, indent=2)

def export_csv(beats_str):
    beats = [float(b.strip("s")) for b in beats_str.splitlines() if b.strip()]
    return "timestamp\n" + "\n".join(f"{b:.2f}" for b in beats)

def auto_slide_timing(beats_str):
    beats = [float(b.strip("s")) for b in beats_str.splitlines() if b.strip()]
    if len(beats) < 2:
        return "Not enough beats to calculate timing."
    intervals = [round(beats[i+1] - beats[i], 2) for i in range(len(beats)-1)]
    avg_time = sum(intervals) / len(intervals)
    return f"{avg_time:.2f}s"

def detect_beats_from_audio(file_path, num_beats=None, even_spacing=False, start=0.0, end=0.0):
    y, sr = librosa.load(file_path, offset=start, duration=(end - start) if end > 0 else None)

    if even_spacing and num_beats:
        duration = librosa.get_duration(y=y, sr=sr)
        return [round(i * duration / num_beats, 2) for i in range(num_beats)]

    tempo, beat_frames = librosa.beat.beat_track(y=y, sr=sr)
    beat_times = librosa.frames_to_time(beat_frames, sr=sr)
    return [round(t, 2) for t in beat_times]