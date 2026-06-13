# M-Pesa Sandbox Setup

AfriAds uses Safaricom Daraja STK Push in sandbox mode before live credentials.

## 1. Create Daraja Sandbox App

Create an app in the Safaricom developer portal and copy:

- Consumer Key
- Consumer Secret
- Lipa Na M-Pesa Online Passkey

Use the sandbox shortcode:

```env
MPESA_BUSINESS_SHORT_CODE=174379
MPESA_TRANSACTION_TYPE=CustomerPayBillOnline
```

Official developer portal: https://developer.safaricom.co.ke/

## 2. Configure Backend

Add these values to `backend/.env`:

```env
MPESA_ENVIRONMENT=sandbox
MPESA_BASE_URL=https://sandbox.safaricom.co.ke
MPESA_CONSUMER_KEY=your_sandbox_consumer_key
MPESA_CONSUMER_SECRET=your_sandbox_consumer_secret
MPESA_BUSINESS_SHORT_CODE=174379
MPESA_PASSKEY=your_sandbox_lipa_na_mpesa_passkey
MPESA_TRANSACTION_TYPE=CustomerPayBillOnline
MPESA_CALLBACK_URL=https://your-public-url/api/payments/mpesa/callback
MPESA_ACCOUNT_REFERENCE_PREFIX=AFRIADS
```

`MPESA_CALLBACK_URL` must be publicly reachable. For local testing, expose the backend with a tunnel such as ngrok and use:

```text
https://your-ngrok-url/api/payments/mpesa/callback
```

## 3. Test Flow

1. Start the backend.
2. Start the frontend.
3. Log in as an advertiser.
4. Open Payment History.
5. Choose M-Pesa, enter amount and a sandbox test phone.
6. Submit payment.
7. The backend calls Daraja STK Push.
8. Safaricom posts the result to `/api/payments/mpesa/callback`.
9. On success, the advertiser balance is credited once.

## 4. Going Live Later

Switch only the environment values:

```env
MPESA_ENVIRONMENT=live
MPESA_BASE_URL=https://api.safaricom.co.ke
MPESA_CONSUMER_KEY=your_live_consumer_key
MPESA_CONSUMER_SECRET=your_live_consumer_secret
MPESA_BUSINESS_SHORT_CODE=your_live_shortcode
MPESA_PASSKEY=your_live_passkey
MPESA_CALLBACK_URL=https://your-production-domain/api/payments/mpesa/callback
```

Do not hard-code live credentials in source control.
