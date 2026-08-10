"""
Handles actual OTP delivery. Controlled by settings.OTP_MODE:

  mock    - doesn't send a real SMS at all. Logs the code to the console
            and returns it in the API response for local testing.

  sparrow - calls the real Sparrow SMS API (Nepal SMS Gateway).
            Requires SPARROW_SMS_TOKEN and SPARROW_SMS_FROM in .env.

  twilio  - calls the Twilio REST API for global SMS delivery.
            Requires TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER.
"""
import logging
import httpx
from datetime import datetime, timedelta

from app.core.config import settings

logger = logging.getLogger("sms_service")


class SMSDeliveryError(Exception):
    pass


async def send_otp_sms(phone_number: str, otp_code: str) -> None:
    message = f"Your Jhyaap Station verification code is {otp_code}. Valid for 5 minutes."

    # Format phone number for Nepal standard
    clean_phone = phone_number.replace(" ", "").replace("-", "")
    if not clean_phone.startswith("+"):
        if clean_phone.startswith("977"):
            clean_phone = "+" + clean_phone
        else:
            clean_phone = "+977" + clean_phone

    mode = (settings.OTP_MODE or "mock").lower()

    if mode == "mock":
        logger.info(f"[MOCK SMS] To: {clean_phone} | Code: {otp_code} | Message: {message}")
        return

    if mode == "sparrow":
        await _send_via_sparrow(clean_phone, message)
        return

    if mode == "twilio":
        await _send_via_twilio(clean_phone, message)
        return

    logger.warning(f"Unknown OTP_MODE '{mode}', falling back to mock delivery.")
    logger.info(f"[MOCK SMS] To: {clean_phone} | Code: {otp_code} | Message: {message}")


async def _send_via_sparrow(phone_number: str, message: str) -> None:
    # Sparrow SMS requires 10-digit mobile number without +977 or 977
    raw_mobile = phone_number.replace("+977", "").replace("977", "").strip()

    token = getattr(settings, "SPARROW_SMS_TOKEN", "") or ""
    sender_identity = getattr(settings, "SPARROW_SMS_FROM", "") or "Jhyaap Station"

    if not token:
        raise SMSDeliveryError(
            "Sparrow SMS token is missing. Set SPARROW_SMS_TOKEN in backend/.env to send real SMS."
        )

    params = {
        "token": token,
        "from": sender_identity,
        "to": raw_mobile,
        "text": message,
    }

    base_url = getattr(settings, "SPARROW_SMS_BASE_URL", "https://api.sparrowsms.com/v2/sms/")

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await client.get(base_url, params=params)
            response.raise_for_status()
            data = response.json()
        except httpx.HTTPError as exc:
            logger.error(f"Sparrow SMS HTTP request failed: {exc}")
            raise SMSDeliveryError("Failed to reach Sparrow SMS API") from exc

    if data.get("response_code") != 200:
        logger.error(f"Sparrow SMS rejected message: {data}")
        raise SMSDeliveryError(f"Sparrow SMS Error: {data.get('response', 'Rejected')}")

    logger.info(f"Real OTP sent via Sparrow SMS to {raw_mobile}")


async def _send_via_twilio(phone_number: str, message: str) -> None:
    account_sid = getattr(settings, "TWILIO_ACCOUNT_SID", "")
    auth_token = getattr(settings, "TWILIO_AUTH_TOKEN", "")
    from_number = getattr(settings, "TWILIO_FROM_NUMBER", "")

    if not account_sid or not auth_token or not from_number:
        raise SMSDeliveryError(
            "Twilio credentials missing. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER."
        )

    url = f"https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Messages.json"
    data = {
        "To": phone_number,
        "From": from_number,
        "Body": message,
    }

    async with httpx.AsyncClient(timeout=10.0, auth=(account_sid, auth_token)) as client:
        try:
            response = await client.post(url, data=data)
            response.raise_for_status()
            res_data = response.json()
        except httpx.HTTPError as exc:
            logger.error(f"Twilio SMS request failed: {exc}")
            raise SMSDeliveryError("Failed to send SMS via Twilio") from exc

    logger.info(f"Real OTP sent via Twilio SMS to {phone_number} (SID: {res_data.get('sid')})")


async def send_order_notification_sms(phone_number: str, order_id: str, status: str, eta_minutes: int = None) -> None:
    """Send SMS notification to customer about order status update"""
    
    # Get current time in UTC Kathmandu (Nepal time is UTC+5:45)
    utc_now = datetime.utcnow()
    kathmandu_time = utc_now + timedelta(hours=5, minutes=45)
    time_str = kathmandu_time.strftime("%I:%M %p")
    
    # Calculate ETA time if provided
    eta_str = ""
    if eta_minutes:
        eta_time = kathmandu_time + timedelta(minutes=eta_minutes)
        eta_str = eta_time.strftime("%I:%M %p")
    
    status_messages = {
        "preparing": f"Your Jhyaap Station order #{order_id} is being prepared. It will be ready for delivery soon. Order time: {time_str} (Kathmandu).",
        "out_for_delivery": f"Your Jhyaap Station order #{order_id} is out for delivery. Expected arrival: {eta_str} (Kathmandu). Track your order live in the app!",
        "picked_up": f"Your Jhyaap Station order #{order_id} has been picked up by the rider and is on its way. Expected arrival: {eta_str} (Kathmandu).",
        "delivered": f"Your Jhyaap Station order #{order_id} has been delivered at {time_str} (Kathmandu). Thank you for ordering with us!",
    }
    
    message = status_messages.get(status, f"Your Jhyaap Station order #{order_id} status has been updated to: {status} at {time_str} (Kathmandu).")
    
    # Format phone number for Nepal standard
    clean_phone = phone_number.replace(" ", "").replace("-", "")
    if not clean_phone.startswith("+"):
        if clean_phone.startswith("977"):
            clean_phone = "+" + clean_phone
        else:
            clean_phone = "+977" + clean_phone

    mode = (settings.OTP_MODE or "mock").lower()

    if mode == "mock":
        logger.info(f"[MOCK SMS] To: {clean_phone} | Order: {order_id} | Status: {status} | Message: {message}")
        return

    if mode == "sparrow":
        await _send_via_sparrow(clean_phone, message)
        return

    if mode == "twilio":
        await _send_via_twilio(clean_phone, message)
        return

    logger.warning(f"Unknown OTP_MODE '{mode}', falling back to mock delivery.")
    logger.info(f"[MOCK SMS] To: {clean_phone} | Order: {order_id} | Status: {status} | Message: {message}")