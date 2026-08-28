import uuid
from datetime import datetime

from sqlalchemy import DateTime, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


def _uuid() -> str:
    return str(uuid.uuid4())


class ListItem(Base):
    __tablename__ = "list_items"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    item: Mapped[str] = mapped_column(String(120), nullable=False, index=True)
    quantity: Mapped[int] = mapped_column(Integer, default=1)
    category: Mapped[str] = mapped_column(String(40), default="other")
    added_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class PurchaseHistory(Base):
    __tablename__ = "purchase_history"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    item: Mapped[str] = mapped_column(String(120), nullable=False, index=True)
    category: Mapped[str] = mapped_column(String(40), default="other")
    quantity: Mapped[int] = mapped_column(Integer, default=1)
    purchased_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
