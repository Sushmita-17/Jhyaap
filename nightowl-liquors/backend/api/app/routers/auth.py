import secrets
import uuid

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from ..config import get_settings
from ..database import get_db
from ..deps import create_otp_record, user_to_schema
from ..models import Customer, OTPVerification, User
from ..schemas import OTPSendRequest, OTPSendResponse, OTPVerifyRequest, TokenResponse
from ..security import create_access_token, create_refresh_token, revoke_refresh_token, store_refresh_token


router = APIRouter(prefix='/auth', tags=['Auth'])
settings = get_settings()
REFRESH_COOKIE = 'jhyaap_refresh'


@router.post('/otp/send', response_model=OTPSendResponse)
def send_otp(payload: OTPSendRequest, db: Session = Depends(get_db)):
    record = create_otp_record(db, payload.phone)
    response = OTPSendResponse(
        message='OTP sent successfully',
        expires_in_minutes=settings.otp_expire_minutes,
    )
    if settings.debug:
        response.dev_otp = record.code
        print(f'[DEV OTP] {payload.phone} -> {record.code}')
    return response


@router.post('/otp/verify', response_model=TokenResponse)
def verify_otp(payload: OTPVerifyRequest, response: Response, db: Session = Depends(get_db)):
    from datetime import datetime, timezone

    record = (
        db.query(OTPVerification)
        .filter(OTPVerification.phone == payload.phone, OTPVerification.is_verified.is_(False))
        .order_by(OTPVerification.created_at.desc())
        .first()
    )
    if not record:
        raise HTTPException(status_code=400, detail='No OTP found. Request a new one.')
    if record.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail='OTP expired. Request a new one.')
    if record.locked_until and record.locked_until.replace(tzinfo=timezone.utc) > datetime.now(timezone.utc):
        raise HTTPException(status_code=429, detail='Account temporarily locked.')

    if record.code != payload.otp:
        record.attempts += 1
        if record.attempts >= settings.otp_max_attempts:
            from datetime import timedelta

            record.locked_until = datetime.now(timezone.utc) + timedelta(minutes=settings.otp_lockout_minutes)
        db.commit()
        raise HTTPException(status_code=400, detail='Invalid OTP.')

    record.is_verified = True
    db.commit()

    user = db.query(User).filter(User.phone == payload.phone).first()
    if not user:
        user = User(
            id=uuid.uuid4(),
            phone=payload.phone,
            role='customer',
            is_active=True,
            is_staff=False,
            password='!',
        )
        db.add(user)
        db.flush()
        customer = Customer(
            id=uuid.uuid4(),
            user_id=user.id,
            name=payload.name or 'Customer',
            referral_code=secrets.token_hex(4).upper(),
        )
        db.add(customer)
        db.commit()
        db.refresh(user)
    elif payload.name:
        customer = db.query(Customer).filter(Customer.user_id == user.id).first()
        if customer:
            customer.name = payload.name
            db.commit()

    access = create_access_token(str(user.id), {'role': user.role, 'phone': user.phone})
    refresh = create_refresh_token()
    store_refresh_token(db, user.id, refresh)

    response.set_cookie(
        key=REFRESH_COOKIE,
        value=refresh,
        httponly=True,
        secure=not settings.debug,
        samesite='lax',
        max_age=settings.jwt_refresh_token_expire_days * 86400,
    )

    return TokenResponse(
        access_token=access,
        expires_in=settings.jwt_access_token_expire_minutes * 60,
        user=user_to_schema(db, user),
    )


@router.post('/refresh', response_model=TokenResponse)
def refresh_access_token(
    response: Response,
    db: Session = Depends(get_db),
    jhyaap_refresh: str | None = __import__('fastapi').Cookie(None),
):
    from app.security import verify_refresh_token

    if not jhyaap_refresh:
        raise HTTPException(status_code=401, detail='Refresh token missing')
    user = verify_refresh_token(db, jhyaap_refresh)
    if not user:
        raise HTTPException(status_code=401, detail='Invalid or expired refresh token')

    access = create_access_token(str(user.id), {'role': user.role, 'phone': user.phone})
    new_refresh = create_refresh_token()
    revoke_refresh_token(db, jhyaap_refresh)
    store_refresh_token(db, user.id, new_refresh)
    response.set_cookie(
        key=REFRESH_COOKIE,
        value=new_refresh,
        httponly=True,
        secure=not settings.debug,
        samesite='lax',
        max_age=settings.jwt_refresh_token_expire_days * 86400,
    )
    return TokenResponse(
        access_token=access,
        expires_in=settings.jwt_access_token_expire_minutes * 60,
        user=user_to_schema(db, user),
    )


@router.delete('/logout', status_code=status.HTTP_204_NO_CONTENT)
def logout(response: Response, db: Session = Depends(get_db), jhyaap_refresh: str | None = __import__('fastapi').Cookie(None)):
    if jhyaap_refresh:
        revoke_refresh_token(db, jhyaap_refresh)
    response.delete_cookie(REFRESH_COOKIE)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
