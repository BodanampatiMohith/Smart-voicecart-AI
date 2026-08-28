from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.config import settings
from app.crud import apply_intent, create_item, delete_item, list_items, update_item
from app.database import Base, engine, get_db
from app.nlp import parse_transcript
from app.schemas import (
    Intent,
    ListItemCreate,
    ListItemOut,
    ListItemUpdate,
    ParseCommandRequest,
    ParseCommandResponse,
    SubstituteResponse,
    SuggestionsResponse,
)
from app.seed import seed_if_empty
from app.substitutes import get_substitutes
from app.suggestions import compute_suggestions

@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    from app.database import SessionLocal

    db = SessionLocal()
    try:
        seed_if_empty(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="Voice Shopping Assistant",
    description="Parse multilingual voice transcripts into grocery-list mutations.",
    version="1.0.0",
    lifespan=lifespan,
)

origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict:
    return {
        "status": "ok",
        "llm": bool(settings.groq_api_key),
        "db": settings.database_url.split("://")[0],
    }


@app.post("/parse-command", response_model=ParseCommandResponse)
def parse_command(body: ParseCommandRequest, db: Session = Depends(get_db)) -> ParseCommandResponse:
    intent, parser = parse_transcript(body.transcript, body.language_hint)
    applied, message = apply_intent(db, intent)
    items = [ListItemOut.model_validate(r) for r in list_items(db)]
    return ParseCommandResponse(
        intent=intent,
        transcript=body.transcript,
        applied=applied,
        message=message,
        items=items,
        parser=parser,
    )


@app.get("/items", response_model=list[ListItemOut])
def get_items(db: Session = Depends(get_db)) -> list[ListItemOut]:
    return [ListItemOut.model_validate(r) for r in list_items(db)]


@app.post("/items", response_model=ListItemOut)
def post_item(body: ListItemCreate, db: Session = Depends(get_db)) -> ListItemOut:
    return ListItemOut.model_validate(create_item(db, body))


@app.patch("/items/{item_id}", response_model=ListItemOut)
def patch_item(item_id: str, body: ListItemUpdate, db: Session = Depends(get_db)) -> ListItemOut:
    row = update_item(db, item_id, body)
    if not row:
        raise HTTPException(404, "Item not found")
    return ListItemOut.model_validate(row)


@app.delete("/items/{item_id}")
def remove_item(item_id: str, db: Session = Depends(get_db)) -> dict:
    if not delete_item(db, item_id):
        raise HTTPException(404, "Item not found")
    return {"ok": True}


@app.post("/items/{item_id}/complete")
def mark_bought(item_id: str, db: Session = Depends(get_db)) -> dict:
    from app.models import ListItem

    row = db.get(ListItem, item_id)
    if not row:
        raise HTTPException(404, "Item not found")
    intent = Intent(action="complete", item=row.item, quantity=row.quantity, category=row.category)
    _, message = apply_intent(db, intent)
    return {"ok": True, "message": message, "items": [ListItemOut.model_validate(r) for r in list_items(db)]}


@app.get("/suggestions", response_model=SuggestionsResponse)
def suggestions(db: Session = Depends(get_db)) -> SuggestionsResponse:
    return SuggestionsResponse(
        suggestions=compute_suggestions(db),
        method="avg purchase interval; flag when gap ≥ 80% of mean cycle",
    )


@app.get("/substitutes/{item}", response_model=SubstituteResponse)
def substitutes(item: str) -> SubstituteResponse:
    return SubstituteResponse(item=item.lower(), substitutes=get_substitutes(item))
