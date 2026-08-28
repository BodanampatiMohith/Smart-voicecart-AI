from sqlalchemy.orm import Session

from app.models import ListItem, PurchaseHistory
from app.schemas import Intent, ListItemCreate, ListItemUpdate


def list_items(db: Session) -> list[ListItem]:
    return db.query(ListItem).order_by(ListItem.added_at.desc()).all()


def create_item(db: Session, payload: ListItemCreate) -> ListItem:
    existing = (
        db.query(ListItem)
        .filter(ListItem.item == payload.item.strip().lower())
        .one_or_none()
    )
    if existing:
        existing.quantity += payload.quantity
        if payload.category:
            existing.category = payload.category
        db.commit()
        db.refresh(existing)
        return existing
    row = ListItem(
        item=payload.item.strip().lower(),
        quantity=payload.quantity,
        category=payload.category,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def update_item(db: Session, item_id: str, payload: ListItemUpdate) -> ListItem | None:
    row = db.get(ListItem, item_id)
    if not row:
        return None
    if payload.quantity is not None:
        row.quantity = payload.quantity
    if payload.category is not None:
        row.category = payload.category
    if payload.item is not None:
        row.item = payload.item.strip().lower()
    db.commit()
    db.refresh(row)
    return row


def delete_item(db: Session, item_id: str) -> bool:
    row = db.get(ListItem, item_id)
    if not row:
        return False
    db.delete(row)
    db.commit()
    return True


def _find_by_name(db: Session, name: str) -> ListItem | None:
    return db.query(ListItem).filter(ListItem.item == name.strip().lower()).one_or_none()


def complete_item(db: Session, name: str, quantity: int, category: str) -> str:
    row = _find_by_name(db, name)
    hist = PurchaseHistory(
        item=name.strip().lower(),
        category=row.category if row else category,
        quantity=row.quantity if row else quantity,
    )
    db.add(hist)
    if row:
        db.delete(row)
    db.commit()
    return f"Marked {name} as purchased"


def apply_intent(db: Session, intent: Intent) -> tuple[bool, str]:
    if intent.action == "search":
        return True, f"Search: {intent.item or 'list'}"

    if not intent.item:
        return False, "No item detected in the command"

    name = intent.item.strip().lower()

    if intent.action == "add":
        create_item(db, ListItemCreate(item=name, quantity=intent.quantity, category=intent.category))
        return True, f"Added {intent.quantity}× {name}"

    if intent.action == "remove":
        row = _find_by_name(db, name)
        if not row:
            return False, f"{name} is not on the list"
        db.delete(row)
        db.commit()
        return True, f"Removed {name}"

    if intent.action == "modify":
        row = _find_by_name(db, name)
        if not row:
            return False, f"{name} is not on the list"
        row.quantity = intent.quantity
        db.commit()
        return True, f"Updated {name} to {intent.quantity}"

    if intent.action == "complete":
        return True, complete_item(db, name, intent.quantity, intent.category)

    return False, "Unknown action"
