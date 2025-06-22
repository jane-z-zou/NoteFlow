import nltk
import wordninja
nltk.download("punkt")
import re
from fpdf import FPDF
from pathlib import Path

# ================= 📝 Speaker Notes Generation =================
# --- Postprocessing helpers ---

def clean_spacing(text):
    # Remove "Paragraph", slide numbers, and hyphens
    text = re.sub(r'^\s*(Paragraph\s*:?|-+)+\s*', '', text, flags=re.IGNORECASE)
    text = re.sub(r"Slide\s*\d+\s*[:\-]?\s*", "", text, flags=re.IGNORECASE)
    text = text.replace("-", "")

    # Remove leading letters at the start of lines
    text = re.sub(r'^\s*[a-zA-Z]\.(?!\w)', '', text, flags=re.MULTILINE)

    # Normalize spacing
    text = re.sub(r'\s+', ' ', text).strip()

    # Tokenize with punctuation preserved
    tokens = re.findall(r'\w+|[.,!?;:]', text)
    split_tokens = []
    for token in tokens:
        if re.match(r'\w+', token):
            split_tokens.extend(wordninja.split(token))
        else:
            split_tokens.append(token)

    # Rebuild with correct spacing
    result = ""
    for i, token in enumerate(split_tokens):
        if token in '.,!?;:':
            result = result.rstrip() + token  # No space before punctuation
        else:
            result += ' ' + token

    # Remove unwanted spaces before punctuation
    result = re.sub(r'\s+([.,!?;:])', r'\1', result).strip()

    # Split into sentences and convert to bullet points
    sentences = re.split(r'(?<=[.!?])\s+', result)
    bullets = "\n".join(f"- {s.strip()}" for s in sentences if s.strip())

    return bullets

def add_newlines_between_sentences(text):
    # Adds a newline after each sentence-ending punctuation
    return re.sub(r'(?<=[.!?])\s+', '\n\n', text).strip()

def format_for_display(text):
    # Split on sentence boundaries and insert newlines
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    return '\n\n'.join(sentence.strip() for sentence in sentences if sentence)

def estimate_duration(text, wpm=160):
    word_count = len(nltk.word_tokenize(text))
    return word_count // wpm, round((word_count % wpm) / wpm * 60)

def finish_last_sentence(text):
    text = text.strip()
    sentences = re.findall(r'[^.!?]*[.!?]', text)

    if not sentences:
        return text  # No punctuation found

    return '\n'.join(s.strip() for s in sentences).strip()

def remove_loops(text):
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    seen = set()
    unique = []
    for sentence in sentences:
        normalized = sentence.strip().lower()
        if normalized and normalized not in seen:
            seen.add(normalized)
            unique.append(sentence.strip())
    return " ".join(unique)

# --- Prompt template builder ---

def build_prompt(slide_text, tone, include_main_idea=True, include_transitions=True):
    prompt_parts = [f"Write speaker notes."]

    if tone:
        prompt_parts.append(f"Use a '{tone}' tone.")

    if include_main_idea:
        prompt_parts.append("Start with a one-sentence main idea summary.")

    prompt_parts.append("Then explain each point as concise speaking bullets.")

    if include_transitions:
        prompt_parts.append("Add a transition sentence at the end to lead into the next slide.")

    prompt_parts.append("Use bolded keywords (e.g. **keyword**) for emphasis.")

    prompt_parts.append("Here is the slide content:")
    prompt_parts.append(slide_text.strip())

    return "\n".join(prompt_parts)


def format_notes(title, subtitle, number, notes, duration):
    return f"### Slide {number}: {title}\n**{subtitle}**\n{duration}\n\n{notes.strip()}"

def export_as_txt(title, subtitle, number, notes, duration):
    content = format_notes(title, subtitle, number, notes, duration)
    downloads_path = Path.home() / "Downloads"
    txt_path = downloads_path / f"slide_{number}_notes.txt"
    txt_path.write_text(content, encoding="utf-8")
    return str(txt_path)

def preview_notes(title, subtitle, number, notes, duration):
    return format_notes(title, subtitle, number, notes, duration)
