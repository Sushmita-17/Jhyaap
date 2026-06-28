import hashlib
import secrets
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Optional

from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.config import get_settings
from app.models import RefreshToken, User

settings = get_settings()
pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')

ALGORITHM = 'HS256'


def create_access_token(subject: str, extra: Optional[dict[str, Any]] = None) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_access_token_expire_minutes)
    payload = {'sub': subject, 'exp': expire, 'type': 'access'}
    if extra:
        payload.update(extra)
    return jwt.encode(payload, settings.api_secret_key, algorithm=ALGORITHM)


def create_refresh_token() -> str:
    return secrets.token_urlsafe(48)


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def decode_access_token(token: str) -> dict[str, Any]:
    return jwt.decode(token, settings.api_secret_key, algorithms=[ALGORITHM])


def store_refresh_token(db: Session, user_id: uuid.UUID, raw_token: str) -> RefreshToken:
    expires = datetime.now(timezone.utc) + timedelta(days=settings.jwt_refresh_token_expire_days)
    record = RefreshToken(
        id=uuid.uuid4(),
        user_id=user_id,
        token_hash=hash_token(raw_token),
        expires_at=expires,
        revoked=False,
    )
    db.add(record)
    db.commit()
    return record


def verify_refresh_token(db: Session, raw_token: str) -> Optional[User]:
    token_hash = hash_token(raw_token)
    record = (
        db.query(RefreshToken)
        .filter(RefreshToken.token_hash == token_hash, RefreshToken.revoked.is_(False))
        .first()
    )
    if not record or record.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        return None
    return db.query(User).filter(User.id == record.user_id, User.is_active.is_(True)).first()


def revoke_refresh_token(db: Session, raw_token: str) -> None:
    token_hash = hash_token(raw_token)
    record = db.query(RefreshToken).filter(RefreshToken.token_hash == token_hash).first()
    if record:
        record.revoked = True
        db.commit()


def get_user_from_token(db: Session, token: str) -> Optional[User]:
    try:
        payload = decode_access_token(token)
        if payload.get('type') != 'access':
            return None
        user_id = payload.get('sub')
        if not user_id:
            return None
        return db.query(User).filter(User.id == uuid.UUID(user_id), User.is_active.is_(True)).first()
    except (JWTError, ValueError):
        return None
