"""Purchase-interval suggestions — computed, not hardcoded copy."""

from datetime import datetime, timezone

import pandas as pd
from sqlalchemy.orm import Session

from app.models import PurchaseHistory
from app.substitutes import get_substitutes
from app.schemas import Suggestion


def compute_suggestions(db: Session, threshold: float = 0.8) -> list[Suggestion]:
    rows = db.query(PurchaseHistory).all()
    if not rows:
        return []

    df = pd.DataFrame(
        [
            {
                "item": r.item.lower(),
                "category": r.category,
                "purchased_at": r.purchased_at.replace(tzinfo=None)
                if r.purchased_at.tzinfo
                else r.purchased_at,
            }
            for r in rows
        ]
    )

    now = datetime.now(timezone.utc).replace(tzinfo=None)
    ranked: list[Suggestion] = []

    for item, group in df.groupby("item"):
        group = group.sort_values("purchased_at")
        times = group["purchased_at"].tolist()
        count = len(times)
        last = times[-1]
        days_since = (now - last).total_seconds() / 86400
        category = str(group["category"].iloc[-1])

        avg_interval = None
        if count >= 2:
            deltas = [(times[i] - times[i - 1]).total_seconds() / 86400 for i in range(1, len(times))]
            avg_interval = sum(deltas) / len(deltas)
            due = days_since >= (avg_interval * threshold)
            reason = (
                f"Usually every {avg_interval:.1f} days; last bought {days_since:.1f} days ago"
                if due
                else f"Last bought {days_since:.1f} days ago (typical cycle {avg_interval:.1f}d)"
            )
            if not due:
                continue
        else:
            # Single observation: flag if more than 10 days old (weak prior, disclosed).
            if days_since < 10:
                continue
            reason = f"Bought once {days_since:.0f} days ago — may be due again"
            due = True

        if not due:
            continue

        ranked.append(
            Suggestion(
                item=str(item),
                category=category,
                reason=reason,
                avg_interval_days=round(avg_interval, 2) if avg_interval is not None else None,
                days_since_last=round(days_since, 2),
                purchase_count=count,
                substitutes=get_substitutes(str(item)),
            )
        )

    ranked.sort(key=lambda s: (s.days_since_last or 0), reverse=True)
    return ranked[:12]
