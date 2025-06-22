const BACKEND_URL = "http://localhost:5001";

export async function fetchSpeakerNotes(
  slideText: string,
  tone: string,
  maxSeconds: number,
  options?: {
    language?: string;
    includeMainIdea?: boolean;
    includeTransitions?: boolean;
  }
) {
  const {
    language = "English",
    includeMainIdea = true,
    includeTransitions = true
  } = options || {};

  const res = await fetch(`${BACKEND_URL}/generate_notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      slide_text: slideText,
      tone,
      max_seconds: maxSeconds,
      language,
      include_main_idea: includeMainIdea,
      include_transitions: includeTransitions
    })
  });

  if (!res.ok) {
    throw new Error(`HTTP error: ${res.status}`);
  }

  return await res.json();
}

export async function fetchPreviewNote(slideText, tone) {
  const res = await fetch(`${BACKEND_URL}/preview_note`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slide_text: slideText, tone })
  });

  if (!res.ok) {
    throw new Error(`Preview fetch failed: ${res.status}`);
  }

  return await res.json();
}


export async function uploadAudioForBeats(
  audioFile: File
): Promise<{
  sync_points: { slide: string; time: number }[];
  estimated_total_duration: number;
}> {
  const formData = new FormData();
  formData.append("audio", audioFile);
  const response = await fetch(`${BACKEND_URL}/generate_beats`, {
    method: "POST",
    body: formData
  });
  if (!response.ok) throw new Error("Failed to analyze audio");
  return response.json();
}

export async function exportBeatsJson(beatsString: string): Promise<string> {
  const formData = new FormData();
  formData.append("beats", beatsString);
  const response = await fetch(`${BACKEND_URL}/export_json`, {
    method: "POST",
    body: formData
  });
  if (!response.ok) throw new Error("Failed to export JSON");
  return response.text();
}

export async function exportBeatsCsv(beatsString: string): Promise<string> {
  const formData = new FormData();
  formData.append("beats", beatsString);
  const response = await fetch(`${BACKEND_URL}/export_csv`, {
    method: "POST",
    body: formData
  });
  if (!response.ok) throw new Error("Failed to export CSV");
  return response.text();
}

export async function fetchSlideTimingSuggestion(beatsString: string): Promise<string> {
  const formData = new FormData();
  formData.append("beats", beatsString);
  const response = await fetch(`${BACKEND_URL}/auto_slide_timing`, {
    method: "POST",
    body: formData
  });
  if (!response.ok) throw new Error("Failed to get timing suggestion");
  const data = await response.json();
  return data.suggestion;
}

type VisualPromptOptions = {
  variant?: boolean;        // Whether to rephrase an existing prompt
  enhancePrompt?: boolean;  // Whether to enrich the prompt with more detail
};

export async function fetchVisualPrompt(
  slide_text: string,
  style: string,
  enhancePrompt: boolean = true,
  options: VisualPromptOptions = {}
) {
  const res = await fetch(`${BACKEND_URL}/generate_visual_prompt`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      slide_text,
      style,
      enhance_prompt: enhancePrompt,
      variant: options.variant || false
    })
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to fetch visual prompt: ${res.status} ${errorText}`);
  }

  return await res.json(); // expected: { visual_prompt: string }
}


export type EditSummary = {
  user: string;
  slide_id: string;
  edit_type: string;
  num_edits: number;
  duration_sec: number;
  timestamp: string;
  avatar_url?: string; // Optional field for avatar URL
};

export async function fetchEditSummaries(): Promise<EditSummary[]> {
  const res = await fetch("http://localhost:5001/fetch_edits");
  return await res.json();
}

export async function clearEditHistory(): Promise<void> {
  // Example stub (adjust this to call your backend)
  return new Promise(resolve => setTimeout(resolve, 500));
}
