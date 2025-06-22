// Enhanced SpeakerNotesTab with live tone preview support
import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Select,
  Slider,
  Text,
  Switch,
  TextInput,
  MultilineInput
} from "@canva/app-ui-kit";
import { fetchSpeakerNotes, fetchPreviewNote } from "../utils/my_api";

const tones = [
  { label: "🎓 Academic – Formal, informative", value: "Academic" },
  { label: "💼 Persuasive – Convincing, assertive", value: "Persuasive" },
  { label: "📖 Storytelling – Narrative-driven, engaging", value: "Storytelling" },
  { label: "💡 Explainer – Clear, beginner-friendly", value: "Explainer" },
  { label: "🎤 TED-style – Inspirational, concise", value: "TED-style" }
];

export default function SpeakerNotesTab() {
  const [slideText, setSlideText] = useState("");
  const [tone, setTone] = useState("Academic");
  const [maxSeconds, setMaxSeconds] = useState(60);
  const [includeMainIdea, setIncludeMainIdea] = useState(true);
  const [includeTransitions, setIncludeTransitions] = useState(true);
  const [notes, setNotes] = useState("");
  const [preview, setPreview] = useState("");
  const [duration, setDuration] = useState("");
  const [wpm, setWpm] = useState(0);
  const [speedRating, setSpeedRating] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [warnTooLong, setWarnTooLong] = useState(false);

  useEffect(() => {
    const wc = slideText.trim().split(/\s+/).length;
    setWordCount(wc);
    const estSec = wc / 2.5;
    setWarnTooLong(estSec > maxSeconds);
  }, [slideText, maxSeconds]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (slideText.length > 20) {
        fetchPreviewNote(slideText, tone)
          .then((res) => setPreview(res.preview || ""))
          .catch(() => setPreview(""));
      } else {
        setPreview("");
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [slideText, tone]);

  const emphasizeKeywords = (text) => {
    const weakCapitalWords = new Set(["The", "This", "That", "These", "Those", "It", "Its", "He", "She", "They", "We", "You", "I"]);
    return text.replace(/\b([A-Z][a-z]{3,})\b/g, (match, word, offset) => {
      const isStartOfSentence = offset === 0 || /[\.!?]\s*$/.test(text.slice(0, offset));
      if (isStartOfSentence || weakCapitalWords.has(match)) return match;
      return `**${match}**`;
    });
  };

  const renderWithBold = (text) => {
    const bullets = text.split(/\n?- (?=\S)/g).filter(Boolean);
    return bullets.map((bullet, index) => {
      const parts = bullet.split(/(\*\*[^*]+\*\*)/g);
      return (
        <Box key={index} paddingBottom="1u">
          <Box display="flex">
            <Text as="span" paddingRight="0.5u">•</Text>
            <Text as="span" size="medium">
              {parts.map((part, i) =>
                part.startsWith("**") && part.endsWith("**") ? (
                  <strong key={i}>{part.slice(2, -2)}</strong>
                ) : (
                  <span key={i}>{part}</span>
                )
              )}
            </Text>
          </Box>
        </Box>
      );
    });
  };

  const handleGenerate = async () => {
    setCopied(false);
    setLoading(true);
    try {
      const result = await fetchSpeakerNotes(slideText, tone, maxSeconds, {
        includeMainIdea,
        includeTransitions
      });
      const emphasized = emphasizeKeywords(result.speaker_notes || "");
      setNotes(emphasized);

      const { minutes, seconds } = result.estimated_duration;
      const totalSeconds = minutes * 60 + seconds;
      setDuration(`${minutes}m ${seconds}s`);

      const noteWords = result.speaker_notes?.trim().split(/\s+/).length || 0;
      const wpmCalc = totalSeconds > 0 ? Math.round((noteWords / totalSeconds) * 60) : 0;
      setWpm(wpmCalc);

      setSpeedRating(wpmCalc < 90 ? "📉 Too Slow" : wpmCalc <= 150 ? "✅ Good Pace" : "⚠️ Too Fast");
    } catch (err) {
      console.error("❌ Error generating notes:", err);
      setNotes("❌ Failed to generate notes.");
    } finally {
      setLoading(false);
    }
  };

  const handleExample = () => {
    setSlideText(
      "The Industrial Revolution marked a major turning point in history. Nearly every aspect of daily life was influenced in some way. It began in the late 18th century in Britain and spread across Europe and North America. Key innovations included the steam engine, mechanized textile production, and improved transportation infrastructure."
    );
  };

  const handleCopy = async () => {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = notes.replace(/\*\*/g, "");
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error("❌ Fallback copy failed:", err);
    }
  };

  return (
    <Box padding="2u" display="flex" flexDirection="column">
      <Text variant="bold" size="large">📝 Auto-Generate Speaker Notes</Text>
      <Text size="medium" tone="secondary" paddingTop="1u">
  Enter your slide content to get AI speaker notes with <strong>bolded keywords</strong>, <strong>live tone preview</strong>, timing, summaries, and optional transitions.
</Text>


      <Box paddingTop="2u">
        <Button variant="secondary" onClick={handleExample}>✨ Try an Example</Button>
      </Box>

      <Box paddingTop="2u">
        <MultilineInput
          placeholder={`• Causes of WWII\n• Key Battles\n• Treaty of Versailles`}
          value={slideText}
          onChange={setSlideText}
          rows={5}
        />
        <Text tone="secondary" paddingTop="0.5u">📝 Word Count: {wordCount} (⏱ ~{Math.round(wordCount / 2.5)} sec)</Text>
        {warnTooLong && <Text tone="critical" paddingTop="0.5u">⚠️ This may exceed your speaking time. Consider trimming or extending time.</Text>}
      </Box>

      <Box paddingTop="2u">
        <Text variant="bold" size="large">🎤 Choose a Speaking Tone</Text>
        <Select label="Tone" value={tone} onChange={setTone} options={tones} />
        {preview && (
          <Box paddingTop="1u" background="neutralLow" padding="1u">
          <Text size="medium" tone="secondary" style={{ whiteSpace: 'pre-line' }}>
            <strong>🪄 Live Preview:</strong>
            {"\n"}
            {preview
              .split("- ")
              .map((line, idx) => (idx === 0 ? line : `\n- ${line}`))
              .join("")}
          </Text>
        </Box>
        )}
      </Box>

      <Box paddingTop="2u">
        <Text variant="bold" size="large">⏱️ Set Max Speaking Time</Text>
        <Slider label="Max Time (up to 5 min)" min={15} max={300} step={15} value={maxSeconds} onChange={setMaxSeconds} />
        <Text tone="secondary" paddingTop="0.5u">Limit output length (default: 60 sec, max: 5 min).</Text>
      </Box>

      <Box paddingTop="2u">
        <Box paddingBottom="1u">
          <Text variant="bold" size="large">🧩 Optional Add-ons</Text>
        </Box>
        <Box display="flex" gap="2u" flexWrap="wrap">
            <Box display="flex" alignItems="center" gap="1u" paddingBottom="1u">
            <Box paddingEnd="1u">
            <Switch checked={includeMainIdea} onChange={setIncludeMainIdea} />
            </Box>
            <Text>🧠 Include Main Idea</Text>
            </Box>

            <Box display="flex" alignItems="center" gap="1u">
            
            <Box paddingEnd="1u">
            <Switch checked={includeTransitions} onChange={setIncludeTransitions} />
            </Box>
            <Text>🔄 Add Slide Transitions</Text>
            </Box>
        </Box>
      </Box>

      <Box paddingTop="2u">
        <Button variant="primary" size="large" onClick={handleGenerate} loading={loading} fullWidth>
          🧠 Generate Speaker Notes
        </Button>
      </Box>

      {notes && (
        <Box paddingTop="3u" display="flex" flexDirection="column" gap="1.5u">
          <Text variant="bold" size="large">🗣️ Your Speaker Notes</Text>
          <Box
            id="notes-preview"
            padding="1u"
            style={{ maxHeight: "320px", overflowY: "auto", whiteSpace: "pre-wrap", lineHeight: 1.6, transition: "opacity 0.3s ease" }}
          >
            {renderWithBold(notes)}
          </Box>

          <Text tone="secondary" size="medium">⏳ Estimated Speaking Time: {duration}</Text>
          <Text tone="secondary" size="medium">🧮 WPM: {wpm} — {speedRating}</Text>

          <Box display="flex" paddingTop="1.5u">
            <Button variant="secondary" onClick={handleCopy}>{copied ? "✅ Copied!" : "📋 Copy to Clipboard"}</Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}
