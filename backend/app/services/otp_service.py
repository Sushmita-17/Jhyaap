"""OTP generation, storage, expiry, and attempt limiting."""
import random
import string
import time

from app.core.config import settings
from app.db.redis_client import get_redis

# Development-only fallback when OTP_MODE=mock and Redis is not running.
_memory_codes: dict[str, tuple[str, float]] = {}
_memory_attempts: dict[str, int] = {}
_memory_cooldowns: dict[str, float] = {}


def _normalize_phone_number(phone_number: str) -> str:
    """Normalize phone number by removing country code and special characters."""
    # Remove +977 country code if present
    if phone_number.startswith("+977"):
        phone_number = phone_number[4:]
    # Remove any other + prefix
    elif phone_number.startswith("+"):
        phone_number = phone_number[1:]
    # Remove any non-digit characters
    phone_number = ''.join(c for c in phone_number if c.isdigit())
    return phone_number


def _otp_key(phone_number: str) -> str:
    return f"otp:{_normalize_phone_number(phone_number)}"


def _attempts_key(phone_number: str) -> str:
    return f"otp_attempts:{_normalize_phone_number(phone_number)}"


def _cooldown_key(phone_number: str) -> str:
    return f"otp_cooldown:{_normalize_phone_number(phone_number)}"


def _mock_mode() -> bool:
    return (settings.OTP_MODE or "mock").lower() == "mock"


def generate_otp_code() -> str:
    return "".join(random.choices(string.digits, k=settings.OTP_LENGTH))


async def is_on_cooldown(phone_number: str) -> bool:
    normalized = _normalize_phone_number(phone_number)
    # Always use in-memory storage in mock mode
    if _mock_mode():
        return _memory_cooldowns.get(normalized, 0) > time.monotonic()
    
    try:
        return await get_redis().exists(_cooldown_key(phone_number)) == 1
    except Exception:
        raise


async def store_otp(phone_number: str, otp_code: str) -> None:
    normalized = _normalize_phone_number(phone_number)
    # Always use in-memory storage in mock mode
    if _mock_mode():
        now = time.monotonic()
        _memory_codes[normalized] = (otp_code, now + settings.OTP_EXPIRE_SECONDS)
        _memory_cooldowns[normalized] = now + settings.OTP_RESEND_COOLDOWN_SECONDS
        _memory_attempts.pop(normalized, None)
        print(f"🔍 Stored OTP in memory - Phone: {normalized}, Code: {otp_code}, Expires: {now + settings.OTP_EXPIRE_SECONDS}")
        return
    
    try:
        r = get_redis()
        await r.set(_otp_key(phone_number), otp_code, ex=settings.OTP_EXPIRE_SECONDS)
        await r.set(_cooldown_key(phone_number), "1", ex=settings.OTP_RESEND_COOLDOWN_SECONDS)
        await r.delete(_attempts_key(phone_number))
    except Exception:
        raise


async def verify_otp(phone_number: str, submitted_code: str) -> tuple[bool, str]:
    """Return (success, reason) and enforce expiry, single-use, and max attempts."""
    normalized = _normalize_phone_number(phone_number)
    print(f"🔍 OTP Verification - Phone: {phone_number} (normalized: {normalized}), Code: {submitted_code}, Mock Mode: {_mock_mode()}")
    
    # Always use in-memory storage in mock mode
    if _mock_mode():
        record = _memory_codes.get(normalized)
        print(f"🔍 In-memory record: {record}")
        if not record or record[1] <= time.monotonic():
            _memory_codes.pop(normalized, None)
            print(f"🔍 OTP expired or not found")
            return False, "expired_or_not_found"
        attempts = _memory_attempts.get(normalized, 0) + 1
        _memory_attempts[normalized] = attempts
        if attempts > settings.OTP_MAX_ATTEMPTS:
            _memory_codes.pop(normalized, None)
            print(f"🔍 Too many attempts")
            return False, "too_many_attempts"
        if submitted_code != record[0]:
            print(f"🔍 Incorrect code - expected: {record[0]}, got: {submitted_code}")
            return False, "incorrect"
        _memory_codes.pop(normalized, None)
        _memory_attempts.pop(normalized, None)
        print(f"🔍 OTP verification successful")
        return True, ""
    
    try:
        r = get_redis()
        stored_code = await r.get(_otp_key(phone_number))
        if stored_code is None:
            return False, "expired_or_not_found"
        attempts = await r.incr(_attempts_key(phone_number))
        if attempts == 1:
            await r.expire(_attempts_key(phone_number), settings.OTP_EXPIRE_SECONDS)
        if attempts > settings.OTP_MAX_ATTEMPTS:
            await r.delete(_otp_key(phone_number))
            return False, "too_many_attempts"
        if submitted_code != stored_code:
            return False, "incorrect"
        await r.delete(_otp_key(phone_number))
        await r.delete(_attempts_key(phone_number))
        return True, ""
    except Exception:
        raise
