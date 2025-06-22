import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Select,
  Text,
  MultilineInput,
  TextInput,
  Switch
} from "@canva/app-ui-kit";
import { fetchVisualPrompt } from "../utils/my_api";

const styles = [
  { emoji: "📊", title: "Infographic", desc: "Charts & data visuals", value: "Infographic" },
  { emoji: "🎨", title: "Cartoon diagram", desc: "Fun, simplified art", value: "Cartoon diagram" },
  { emoji: "🧽", title: "Chalkboard sketch", desc: "Hand-drawn look", value: "Chalkboard sketch" },
  { emoji: "🧑‍🏫", title: "Flat educational", desc: "Clean & modern", value: "Flat educational illustration" },
  { emoji: "🧱", title: "Isometric map", desc: "3D-style layout", value: "Isometric concept map" }
];

const examplePool = [
  {
    title: "The Water Cycle",
    slideText:
      "The water cycle includes evaporation, condensation, precipitation, and collection. These steps circulate water through Earth's systems."
  },
  {
    title: "Ancient Egyptian Society",
    slideText:
      "Ancient Egypt had a hierarchical society. Pharaohs were at the top, followed by priests, scribes, and farmers at the base."
  },
  {
    title: "Photosynthesis Explained",
    slideText:
      "Photosynthesis is how plants convert sunlight, carbon dioxide, and water into glucose and oxygen using chlorophyll."
  }
];

const suggestStyleFromText = (text: string): string => {
  const lower = text.toLowerCase();
  const styleKeywords: { value: string; keywords: string[] }[] = [
    {
      value: "Isometric concept map",
      keywords: ["map", "system", "workflow", "network", "architecture", "layout"]
    },
    {
      value: "Chalkboard sketch",
      keywords: ["timeline", "history", "chalkboard", "blackboard", "lesson", "hand-drawn"]
    },
    {
      value: "Cartoon diagram",
      keywords: ["ecosystem", "diagram", "cycle", "life", "process", "fun", "playful"]
    },
    {
      value: "Flat educational illustration",
      keywords: ["minimal", "concept", "educational", "explanation", "flat", "modern"]
    },
    {
      value: "Infographic",
      keywords: ["data", "statistics", "percentage", "steps", "flowchart", "facts"]
    }
  ];

  for (const style of styleKeywords) {
    if (style.keywords.some(keyword => lower.includes(keyword))) {
      return style.value;
    }
  }

  return "Infographic";
};

export default function VisualPromptTab() {
  const [slideText, setSlideText] = useState("");
  const [style, setStyle] = useState("Infographic");
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [autoSuggestedStyle, setAutoSuggestedStyle] = useState("");
  const [enhancePrompt, setEnhancePrompt] = useState(true);
  const [variantPrompt, setVariantPrompt] = useState("");

  useEffect(() => {
    setAutoSuggestedStyle(suggestStyleFromText(slideText));
  }, [slideText]);

  const handleExample = () => {
    const example = examplePool[Math.floor(Math.random() * examplePool.length)];
    setTitle(example.title);
    setSlideText(example.slideText);
  };

  const handleGeneratePrompt = async () => {
    if (!slideText.trim()) {
      alert("Please enter slide content.");
      return;
    }

    setLoading(true);
    try {
      const result = await fetchVisualPrompt(slideText.trim(), style, enhancePrompt, { variant: false });
      setPrompt(result.visual_prompt);
      setVariantPrompt(""); // Reset alt
    } catch (err) {
      console.error("❌ Error generating prompt:", err);
      setPrompt("⚠️ Failed to generate prompt.");
    } finally {
      setLoading(false);
    }
  };

  const handleRephrasePrompt = async () => {
    if (!prompt) return;
    setLoading(true);
    try {
      const result = await fetchVisualPrompt(slideText.trim(), style, enhancePrompt, { variant: true });
      setVariantPrompt(result.visual_prompt);
    } catch (err) {
      console.error("❌ Failed to rephrase prompt:", err);
      setVariantPrompt("⚠️ Failed to rephrase.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPrompt = async () => {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = variantPrompt || prompt;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 5000);
    } catch (err) {
      console.error("❌ Fallback copy failed:", err);
    }
  };

  return (
    <Box padding="2u" display="flex" flexDirection="column">
      <Text variant="bold" size="large">🖼️ Auto-Generate Visual Prompts</Text>

      <Box paddingTop="1u">
        <Text size="medium" tone="secondary">
          Paste your slide idea below and choose a visual style. We'll create a detailed prompt for Canva’s AI image generator.
          Ideal for diagrams, infographics, or themed illustrations for student presentations.
        </Text>
      </Box>

      <Box paddingTop="2u">
        <Button variant="secondary" onClick={handleExample}>✨ Try an Example</Button>
      </Box>

      <Box paddingTop="2u">
        <MultilineInput
          placeholder="🌍 Describe your topic..."
          value={slideText}
          onChange={setSlideText}
          rows={6}
        />
      </Box>

      <Box paddingTop="1u">
        <Text
          tone="info"
          onClick={() => setStyle(autoSuggestedStyle)}
          style={{ cursor: "pointer", textDecoration: "underline" }}
        >
          💡 Suggested Style: {autoSuggestedStyle}
        </Text>
      </Box>

      <Box paddingTop="2u">
        <Text variant="bold" size="large">🎨 Choose a Visual Style</Text>
        <Select
          label="🎨 Visual Style"
          value={style}
          onChange={setStyle}
          options={styles.map(s => ({
            label: `${s.emoji} ${s.title} – ${s.desc}`,
            value: s.value
          }))}
        />
      </Box>

      <Box paddingTop="1u" display="flex" alignItems="center" paddingBottom="1u">
          <Box paddingEnd="1u">
          <Switch
            checked={enhancePrompt}
            onChange={setEnhancePrompt}
          />
          </Box>
        <Text>✨ Enrich Prompt with Details</Text>
      </Box>

      <Box paddingTop="2u">
        <Button
          variant="primary"
          size="large"
          onClick={handleGeneratePrompt}
          loading={loading}
          fullWidth
        >
          🪄 Generate Visual Prompt
        </Button>
      </Box>

      {prompt && (
        <Box paddingTop="3u" display="flex" flexDirection="column" gap="1.5u">
          <Text variant="bold" size="large">📝 Your Visual Prompt</Text>
          <MultilineInput value={variantPrompt || prompt} readOnly rows={8} />

          <Box paddingTop="2u" display="block" gap="1u">
            <Box paddingBottom="1u">
            
            <Button variant="secondary" onClick={handleRephrasePrompt}>
              🔄 Rephrase Prompt
            </Button>
            </Box>

            <Button variant="primary" onClick={handleCopyPrompt}>
              📋 Copy to Clipboard
            </Button>
          </Box>

          {copied && (
            <Box paddingTop="1u">
              <Text tone="info" size="small">
                ✅ Copied! Open{" "}
                <a
                  href="https://www.canva.com/ai-image-generator/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: "underline", color: "#0066cc" }}
                >
                  Canva’s AI Image Generator
                </a>{" "}
                and paste your prompt.
              </Text>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
