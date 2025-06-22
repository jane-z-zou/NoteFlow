import { useState } from "react";
import {
  Box,
  Button,
  MultilineInput,
  Text,
  TextInput,
  Select,
  Switch
} from "@canva/app-ui-kit";
import {
  uploadAudioForBeats,
  fetchSlideTimingSuggestion
} from "../utils/my_api";

const genres = [
  {
    label: "🤖 Auto (Best Guess)",
    value: "auto",
    description:
      "Smart pacing based on detected beat intensity and density. Good for most use cases."
  },
  {
    label: "🎵 Vocal Ballad",
    value: "classical",
    description:
      "Smooth and slow transitions, ideal for storytelling or vocals. Uses every 2nd beat."
  },
  {
    label: "🎬 Trailer / Cinematic",
    value: "pop",
    description:
      "Bold, balanced pacing for general media, trailers, or punchy transitions. Uses full beat list."
  },
  {
    label: "🌙 Chill / Ambient",
    value: "lofi",
    description:
      "Relaxed, longer slide durations. Picks every 3rd beat for a spacious, minimal flow."
  },
  {
    label: "⚡ Energetic / Hype",
    value: "hiphop",
    description:
      "Rhythmic bursts with occasional beat stacking for fast-paced visuals. Adds syncopation."
  }
];

function calculateMaxBeats(start: number, end: number, minGap: number): number {
  return Math.floor((end - start) / minGap);
}

function formatTime(t: number): string {
  const mins = Math.floor(t / 60).toString().padStart(2, "0");
  const secs = (t % 60).toFixed(2).padStart(5, "0");
  return `${mins}:${secs}`;
}

export default function BeatSyncTab() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState<number | null>(null);
  const [timestampError, setTimestampError] = useState("");
  const [mode, setMode] = useState<"manual" | "auto">("manual");
  const [beatsInput, setBeatsInput] = useState("5");
  const [startTimeInput, setStartTimeInput] = useState("0");
  const [endTimeInput, setEndTimeInput] = useState("");
  const [minBeatDuration, setMinBeatDuration] = useState("1.0");
  const [genre, setGenre] = useState("auto");
  const [genreAffectsTiming, setGenreAffectsTiming] = useState(true);

  const [autoBeats, setAutoBeats] = useState<number[]>([]);
  const [beatTimestamps, setBeatTimestamps] = useState("");
  const [slideSuggestion, setSlideSuggestion] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAudioUpload = async (file: File) => {
    const url = URL.createObjectURL(file);
    setAudioFile(file);
    setAudioUrl(url);

    const tempAudio = new Audio();
    tempAudio.src = url;
    tempAudio.onloadedmetadata = () => {
      setAudioDuration(tempAudio.duration);
      setEndTimeInput(tempAudio.duration.toFixed(2));
    };

    setLoading(true);
    try {
      const res = await uploadAudioForBeats(file);
      const beats = res.sync_points.map((p: { time: number }) => p.time);
      setAutoBeats(beats);
    } catch (err) {
      console.error("❌ Error uploading audio:", err);
    } finally {
      setLoading(false);
    }
  };

  const getCropRange = () => {
    const start = parseFloat(startTimeInput);
    const end = parseFloat(endTimeInput);
    if (isNaN(start) || isNaN(end) || end <= start) {
      alert("Please enter a valid start and end time.");
      return null;
    }
    return { start, end };
  };

  const getGenreAdjustedBeats = (beats: number[], genre: string): number[] => {
    if (genre === "classical") return beats.filter((_, i) => i % 2 === 0);
    if (genre === "pop") return beats;
    if (genre === "lofi") return beats.filter((_, i) => i % 3 === 0);
    if (genre === "hiphop")
      return beats.flatMap(t => [t, t + 0.25]).filter((t, i, arr) => i === 0 || t > arr[i - 1]);
    return beats;
  };

  const renderSlideDurations = (timestamps: number[]) => {
    return timestamps.slice(0, -1)
      .map((start, i) => `Slide ${i + 1}: ${formatTime(start)}–${formatTime(timestamps[i + 1])}`)
      .join("\n");
  };

  const handleManualBeatGenerate = () => {
    const crop = getCropRange();
    if (!crop) return;

    const requestedBeats = parseInt(beatsInput);
    const minGap = parseFloat(minBeatDuration);
    const cropDuration = crop.end - crop.start;

    let finalBeatsCount = requestedBeats;
    if (!isNaN(minGap) && minGap > 0) {
      const maxBeats = calculateMaxBeats(crop.start, crop.end, minGap);
      if (requestedBeats > maxBeats) {
        finalBeatsCount = maxBeats;
      }
    }

    if (finalBeatsCount <= 1) {
      setTimestampError("❌ Not enough space for beats with the given gap.");
      return;
    }

    const interval = cropDuration / finalBeatsCount;
    const beats = Array.from({ length: finalBeatsCount + 1 }, (_, i) =>
      parseFloat((crop.start + i * interval).toFixed(2))
    );

    setBeatTimestamps(renderSlideDurations(beats));
    setSlideSuggestion(`📏 ${beats.length - 1} beats generated, ${interval.toFixed(2)}s each`);
    setTimestampError("");
  };

  const handleAutoBeatGenerate = async () => {
    const crop = getCropRange();
    const requestedBeats = parseInt(beatsInput);
    const minGap = parseFloat(minBeatDuration);
    if (!crop || isNaN(requestedBeats)) return;

    let slicedBeats = autoBeats.filter(t => t >= crop.start && t <= crop.end);
    let adjusted = genreAffectsTiming ? getGenreAdjustedBeats(slicedBeats, genre) : slicedBeats;

    if (!genreAffectsTiming) {
      let finalBeatsCount = requestedBeats;
      if (!isNaN(minGap) && minGap > 0) {
        const maxBeats = calculateMaxBeats(crop.start, crop.end, minGap);
        if (requestedBeats > maxBeats) {
          finalBeatsCount = maxBeats;
        }
      }

      if (finalBeatsCount <= 1) {
        setTimestampError("❌ Not enough space for beats with the given gap.");
        return;
      }

      const interval = (crop.end - crop.start) / finalBeatsCount;
      const finalBeats = Array.from({ length: finalBeatsCount + 1 }, (_, i) =>
        parseFloat((crop.start + i * interval).toFixed(2))
      );

      setBeatTimestamps(renderSlideDurations(finalBeats));
      setTimestampError("");

      const suggestion = await fetchSlideTimingSuggestion(finalBeats.join("\n"));
      setSlideSuggestion(`📏 ${finalBeats.length - 1} beats generated, approx. ${suggestion} each`);
      return;
    }

    if (!isNaN(minGap) && minGap > 0) {
      const filtered: number[] = [];
      for (const t of adjusted) {
        if (filtered.length === 0 || t - filtered[filtered.length - 1] >= minGap) {
          filtered.push(t);
        }
      }
      adjusted = filtered;
    }

    if (adjusted.length < 2) {
      setTimestampError("❌ Not enough beats after genre + gap filtering.");
      return;
    }

    setBeatTimestamps(renderSlideDurations(adjusted));
    setTimestampError("");

    const suggestion = await fetchSlideTimingSuggestion(adjusted.join("\n"));
    setSlideSuggestion(`📏 ${adjusted.length - 1} beats generated, approx. ${suggestion} each`);
  };

  return (
    <Box padding="2u" display="flex" flexDirection="column">
      <Text variant="bold" size="large">🎵 Beat Sync to Music</Text>
      <Text size="medium" tone="secondary">
        Upload an audio file and select a time range. We'll generate beat-based timestamps
        that can sync not only slides, but also transitions, animations, or any timed visual elements.
      </Text>

      <Box paddingTop="2u" display="flex" gap="1u">
        <Button variant={mode === "manual" ? "primary" : "tertiary"} onClick={() => setMode("manual")} fullWidth>🛠 Manual</Button>
        <Button variant={mode === "auto" ? "primary" : "tertiary"} onClick={() => setMode("auto")} fullWidth>⏱ Auto-Detect</Button>
      </Box>

      <Box paddingTop="2u">
        <Text variant="bold" size="large">📂 Upload Audio File</Text>
        <input type="file" accept="audio/*" onChange={e => {
          const file = e.target.files?.[0];
          if (file) handleAudioUpload(file);
        }} />
        {audioUrl && (
          <Box paddingTop="1u">
            <audio controls src={audioUrl} style={{ width: "100%" }} />
          </Box>
        )}
      </Box>

      {mode === "auto" && (
        <Box paddingTop="2u" display="flex" gap="2u">
          <Box flex="1">
            <Text variant="bold" size="medium">🎼 Genre Hint</Text>
            <Select options={genres.map(g => ({ label: g.label, value: g.value }))} value={genre} onChange={setGenre} />
            <Box paddingTop="1u">
              <Text size="small" tone="secondary">{genres.find(g => g.value === genre)?.description || ""}</Text>
            </Box>
            <Box paddingTop="1u" display="flex" alignItems="center" gap="2u">
              <Box paddingEnd="1u">
                <Switch value={genreAffectsTiming} onChange={setGenreAffectsTiming} />
              </Box>
              <Text size="small" tone="secondary">Let genre influence number & timing of beats</Text>
            </Box>
          </Box>
        </Box>
      )}

      <Box paddingTop="2u">
        <Text variant="bold" size="large">⚙️ Beat Configuration</Text>
      </Box>
      <Box paddingTop="1.5u" display="flex" gap="2u">
        <Box flex="1">
          <Text variant="bold" size="medium">🎯 Slide Count</Text>
          <TextInput value={beatsInput} onChange={setBeatsInput} placeholder="e.g. 5" width="100%" />
        </Box>
        <Box flex="1">
          <Text variant="bold" size="medium">🔄 Min Beat Gap (s)</Text>
          <TextInput value={minBeatDuration} onChange={setMinBeatDuration} placeholder="e.g. 1.0" width="100%" />
        </Box>
      </Box>

      <Box paddingTop="1.5u" display="flex" gap="2u">
        <Box flex="1">
          <Text variant="bold" size="medium">🔁 Start (s)</Text>
          <TextInput value={startTimeInput} onChange={setStartTimeInput} placeholder="e.g. 0.00" width="100%" />
        </Box>
        <Box flex="1">
          <Text variant="bold" size="medium">✂️ End (s)</Text>
          <TextInput value={endTimeInput} onChange={setEndTimeInput} placeholder="e.g. 30.00" width="100%" />
        </Box>
      </Box>

      <Box paddingTop="2u">
        <Button variant="primary" onClick={mode === "manual" ? handleManualBeatGenerate : handleAutoBeatGenerate} fullWidth loading={loading}>
          {mode === "manual" ? "🛠 Generate Manual Beats" : "⏱ Auto-Detect Beats"}
        </Button>
      </Box>

      {beatTimestamps && (
        <Box paddingTop="2u">
          <Text variant="bold" size="large">🎶 Your Beat Timestamps</Text>
          <MultilineInput value={beatTimestamps} onChange={setBeatTimestamps} rows={6} />
          {timestampError && <Text tone="critical" size="small" paddingTop="1u">{timestampError}</Text>}
        </Box>
      )}

      {beatTimestamps && slideSuggestion && (
        <Box paddingTop="1.5u">
          <Text tone="secondary" size="medium">{slideSuggestion}</Text>
        </Box>
      )}

      <Box paddingTop="1.5u">
        <Button variant="secondary" onClick={() => {
          setBeatsInput("5");
          setStartTimeInput("0");
          setEndTimeInput(audioDuration ? audioDuration.toFixed(2) : "");
          setMinBeatDuration("1.0");
          setGenre("auto");
          setGenreAffectsTiming(true);
          setBeatTimestamps("");
          setSlideSuggestion("");
          setTimestampError("");
        }}>🔄 Reset</Button>
      </Box>
    </Box>
  );
}
