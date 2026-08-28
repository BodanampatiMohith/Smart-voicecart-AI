import json
import re
from typing import Literal

from groq import Groq

from app.config import settings
from app.schemas import Intent

SYSTEM_PROMPT = """You extract grocery shopping intents from voice transcripts.
Transcripts may be in English, Hindi, Telugu, or mixed (Hinglish/Tenglish).

Return ONLY valid JSON with these keys:
- action: one of add, remove, modify, search, complete
- item: grocery name normalized to concise English lowercase (e.g. "doodh"/"పాలు"/"paalu" → "milk"). null if no item.
- quantity: integer, default 1. Parse spoken numbers including Hindi/Telugu numerals ("do", "rendu", "moodu" → 2, 3).
- category: dairy | produce | snacks | grains | household | other
- original_language: ISO-ish code like en, hi, te, mixed
- confidence: 0.0-1.0
- notes: short English paraphrase of what the user asked

Rules:
- "I bought X" / "got X" / "le liya" / "konnanu" / "thesukunnanu" → action complete (purchased, leave the list)
- "add/buy/need/chahiye/kavali/jodinchu/pettandi" → add
- "remove/delete/hatado/teeseyyi/vaddu" → remove
- "change quantity / make it 3 / marchu" → modify
- "find/show/search/chupinchu/vetuku" → search
- Never invent items that were not mentioned.
- If the transcript is noise or unintelligible, action=search, item=null, confidence=0.
"""

_NUMBER_WORDS = {
    "one": 1, "two": 2, "three": 3, "four": 4, "five": 5, "six": 6,
    "seven": 7, "eight": 8, "nine": 9, "ten": 10, "dozen": 12,
    "ek": 1, "do": 2, "teen": 3, "char": 4, "paanch": 5,
    "okati": 1, "rendu": 2, "moodu": 3, "nalugu": 4, "aidu": 5, "aaru": 6,
    "yedu": 7, "enimidi": 8, "thommidi": 9, "padi": 10,
}

# Minimal glossary so hi/te still work if GROQ_API_KEY is unset.
_GLOSSARY = {
    "दूध": "milk",
    "दही": "curd",
    "रोटी": "roti",
    "चावल": "rice",
    "अंडा": "eggs",
    "अंडे": "eggs",
    "केले": "bananas",
    "केला": "bananas",
    "टमाटर": "tomato",
    "प्याज": "onion",
    "आलू": "potato",
    "ब्रेड": "bread",
    "चीनी": "sugar",
    "doodh": "milk",
    "పాలు": "milk",
    "paalu": "milk",
    "పెరుగు": "curd",
    "perugu": "curd",
    "బియ్యం": "rice",
    "biyyam": "rice",
    "గుడ్లు": "eggs",
    "గుడ్డు": "eggs",
    "gudlu": "eggs",
    "అరటిపండ్లు": "bananas",
    "arati": "bananas",
    "టమోటా": "tomato",
    "ఉల్లిపాయలు": "onion",
    "ullipaya": "onion",
    "బంగాళాదుంపలు": "potato",
    "రొట్టె": "bread",
    "చక్కెర": "sugar",
    "నూనె": "oil",
}


def _heuristic_parse(transcript: str) -> Intent:
    raw = transcript.strip()
    text = raw.lower()
    action: Literal["add", "remove", "modify", "search", "complete"] = "add"
    if any(w in text for w in ("remove", "delete", "hatado", "hata do", "don't need", "teeseyyi", "vaddu", "తీసివేయి", "హటావో")):
        action = "remove"
    elif any(w in text for w in ("bought", "purchased", "got the", "le liya", "konnanu", "కొన్నాను", "తీసుకున్నాను")):
        action = "complete"
    elif any(w in text for w in ("find", "search", "show", "where", "chupinchu", "vetuku", "చూపించు")):
        action = "search"
    elif any(w in text for w in ("change", "make it", "update", "modify", "marchu", "మార్చు")):
        action = "modify"

    qty = 1
    m = re.search(r"\b(\d+)\b", text)
    if m:
        qty = int(m.group(1))
    else:
        for word, n in _NUMBER_WORDS.items():
            if re.search(rf"\b{word}\b", text):
                qty = n
                break

    item: str | None = None
    for native, english in _GLOSSARY.items():
        if native in raw or native in text:
            item = english
            break

    if item is None:
        cleaned = re.sub(
            r"\b(add|buy|get|need|please|to|the|a|an|my|list|some|of|i|want|remove|delete|bought|litres|liter|kg)\b",
            " ",
            text,
        )
        for word in _NUMBER_WORDS:
            cleaned = re.sub(rf"\b{word}\b", " ", cleaned)
        cleaned = re.sub(r"\d+", " ", cleaned)
        item = re.sub(r"[^a-z\s]", "", cleaned)
        item = re.sub(r"\s+", " ", item).strip() or None
        if item in {"banana", "bananas"}:
            item = "bananas"

    category = "other"
    dairy = {"milk", "curd", "yogurt", "butter", "cheese", "paneer", "ghee"}
    produce = {"banana", "bananas", "apple", "tomato", "onion", "potato", "spinach"}
    grains = {"rice", "bread", "atta", "flour", "roti"}
    if item:
        if item in dairy:
            category = "dairy"
        elif item in produce:
            category = "produce"
        elif item in grains:
            category = "grains"

    lang = "en"
    if re.search(r"[\u0900-\u097F]", transcript):
        lang = "hi"
    elif re.search(r"[\u0B80-\u0BFF]", transcript):
        lang = "ta"
    elif re.search(r"[\u0C00-\u0C7F]", transcript):
        lang = "te"

    return Intent(
        action=action,
        item=item,
        quantity=qty,
        category=category,
        original_language=lang,
        confidence=0.45,
        notes="heuristic fallback (no LLM key or LLM error)",
    )


def parse_transcript(transcript: str, language_hint: str | None = None) -> tuple[Intent, Literal["llm", "heuristic"]]:
    if not settings.groq_api_key:
        return _heuristic_parse(transcript), "heuristic"

    client = Groq(api_key=settings.groq_api_key)
    user = transcript
    if language_hint:
        user = f"[speech recognition language={language_hint}]\n{transcript}"

    try:
        completion = client.chat.completions.create(
            model=settings.groq_model,
            temperature=0.1,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user},
            ],
            response_format={"type": "json_object"},
        )
        raw = completion.choices[0].message.content or "{}"
        data = json.loads(raw)
        intent = Intent.model_validate(data)
        if intent.item:
            intent.item = intent.item.strip().lower()
        if intent.quantity < 1:
            intent.quantity = 1
        return intent, "llm"
    except Exception:
        return _heuristic_parse(transcript), "heuristic"
