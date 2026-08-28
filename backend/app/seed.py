from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.models import PurchaseHistory


SEED_PURCHASES = [
    # item, category, days_ago offsets — enough repeats to compute intervals
    ("milk", "dairy", [28, 21, 14, 7]),
    ("bread", "grains", [18, 12, 6]),
    ("eggs", "dairy", [24, 12]),
    ("bananas", "produce", [16, 9, 2]),
    ("rice", "grains", [40, 10]),
    ("onions", "produce", [20, 5]),
    ("tea", "household", [30, 3]),
]


def seed_if_empty(db: Session) -> None:
    if db.query(PurchaseHistory).count() > 0:
        return
    now = datetime.now(timezone.utc)
    for item, category, offsets in SEED_PURCHASES:
        for days in offsets:
            db.add(
                PurchaseHistory(
                    item=item,
                    category=category,
                    quantity=1,
                    purchased_at=now - timedelta(days=days),
                )
            )
    db.commit()
