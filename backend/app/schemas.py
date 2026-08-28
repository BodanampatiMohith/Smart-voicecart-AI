from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, field_validator

Action = Literal["add", "remove", "modify", "search", "complete"]
Category = Literal["dairy", "produce", "snacks", "grains", "household", "other"]


class ParseCommandRequest(BaseModel):
    transcript: str = Field(min_length=1, max_length=500)
    language_hint: str | None = None


class Intent(BaseModel):
    action: Action
    item: str | None = None
    quantity: int = 1
    category: Category = "other"
    original_language: str = "en"
    confidence: float = 0.0
    notes: str | None = None

    @field_validator("action", mode="before")
    @classmethod
    def coerce_action(cls, v: object) -> str:
        allowed = {"add", "remove", "modify", "search", "complete"}
        s = str(v).lower().strip()
        return s if s in allowed else "add"

    @field_validator("category", mode="before")
    @classmethod
    def coerce_category(cls, v: object) -> str:
        allowed = {"dairy", "produce", "snacks", "grains", "household", "other"}
        s = str(v).lower().strip()
        return s if s in allowed else "other"

    @field_validator("quantity", mode="before")
    @classmethod
    def coerce_qty(cls, v: object) -> int:
        try:
            return max(1, int(float(str(v))))
        except (TypeError, ValueError):
            return 1


class ParseCommandResponse(BaseModel):
    intent: Intent
    transcript: str
    applied: bool
    message: str
    items: list["ListItemOut"]
    parser: Literal["llm", "heuristic"]


class ListItemOut(BaseModel):
    id: str
    item: str
    quantity: int
    category: str
    added_at: datetime | None = None

    model_config = {"from_attributes": True}


class ListItemCreate(BaseModel):
    item: str
    quantity: int = 1
    category: str = "other"


class ListItemUpdate(BaseModel):
    quantity: int | None = None
    category: str | None = None
    item: str | None = None


class Suggestion(BaseModel):
    item: str
    category: str
    reason: str
    avg_interval_days: float | None = None
    days_since_last: float | None = None
    purchase_count: int
    substitutes: list[str] = []


class SuggestionsResponse(BaseModel):
    suggestions: list[Suggestion]
    method: str = "frequency-interval"


class SubstituteResponse(BaseModel):
    item: str
    substitutes: list[str]
