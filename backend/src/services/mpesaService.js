const axios = require('axios');

const getMpesaConfig = () => {
  const environment = process.env.MPESA_ENVIRONMENT || 'sandbox';
  const sandboxBaseUrl = 'https://sandbox.safaricom.co.ke';
  const liveBaseUrl = 'https://api.safaricom.co.ke';

  return {
    environment,
    baseUrl: process.env.MPESA_BASE_URL || (environment === 'live' ? liveBaseUrl : sandboxBaseUrl),
    consumerKey: process.env.MPESA_CONSUMER_KEY,
    consumerSecret: process.env.MPESA_CONSUMER_SECRET,
    businessShortCode: process.env.MPESA_BUSINESS_SHORT_CODE || '174379',
    passkey: process.env.MPESA_PASSKEY,
    transactionType: process.env.MPESA_TRANSACTION_TYPE || 'CustomerPayBillOnline',
    callbackUrl: process.env.MPESA_CALLBACK_URL,
    accountReferencePrefix: process.env.MPESA_ACCOUNT_REFERENCE_PREFIX || 'AFRIADS'
  };
};

const assertConfigured = (config) => {
  const missing = [];

  if (!config.consumerKey) missing.push('MPESA_CONSUMER_KEY');
  if (!config.consumerSecret) missing.push('MPESA_CONSUMER_SECRET');
  if (!config.passkey) missing.push('MPESA_PASSKEY');
  if (!config.callbackUrl) missing.push('MPESA_CALLBACK_URL');

  if (missing.length > 0) {
    const error = new Error(`M-Pesa is not configured. Missing: ${missing.join(', ')}`);
    error.statusCode = 503;
    throw error;
  }
};

const getConfigStatus = () => {
  const config = getMpesaConfig();
  const missing = [];

  if (!config.consumerKey) missing.push('MPESA_CONSUMER_KEY');
  if (!config.consumerSecret) missing.push('MPESA_CONSUMER_SECRET');
  if (!config.passkey) missing.push('MPESA_PASSKEY');
  if (!config.callbackUrl) missing.push('MPESA_CALLBACK_URL');

  return {
    environment: config.environment,
    base_url: config.baseUrl,
    business_short_code: config.businessShortCode,
    transaction_type: config.transactionType,
    callback_url: config.callbackUrl || null,
    configured: missing.length === 0,
    missing
  };
};

const formatTimestamp = (date = new Date()) => {
  const pad = (value) => String(value).padStart(2, '0');
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds())
  ].join('');
};

const normalizePhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return null;

  const digits = String(phoneNumber).replace(/\D/g, '');

  if (digits.startsWith('254') && digits.length === 12) return digits;
  if (digits.startsWith('0') && digits.length === 10) return `254${digits.slice(1)}`;
  if ((digits.startsWith('7') || digits.startsWith('1')) && digits.length === 9) return `254${digits}`;

  return null;
};

const getAccessToken = async () => {
  const config = getMpesaConfig();
  assertConfigured(config);

  const auth = Buffer
    .from(`${config.consumerKey}:${config.consumerSecret}`)
    .toString('base64');

  const response = await axios.get(
    `${config.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
    {
      headers: {
        Authorization: `Basic ${auth}`
      },
      timeout: 15000
    }
  );

  return response.data.access_token;
};

const initiateSTKPush = async ({ amount, phoneNumber, accountReference, transactionDescription }) => {
  const config = getMpesaConfig();
  assertConfigured(config);

  const normalizedPhone = normalizePhoneNumber(phoneNumber);
  if (!normalizedPhone) {
    const error = new Error('Use a valid Kenyan M-Pesa phone number, for example 254712345678');
    error.statusCode = 400;
    throw error;
  }

  const token = await getAccessToken();
  const timestamp = formatTimestamp();
  const password = Buffer
    .from(`${config.businessShortCode}${config.passkey}${timestamp}`)
    .toString('base64');
  const roundedAmount = Math.ceil(Number(amount));
  const reference = String(accountReference || config.accountReferencePrefix).slice(0, 12);

  const payload = {
    BusinessShortCode: config.businessShortCode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: config.transactionType,
    Amount: roundedAmount,
    PartyA: normalizedPhone,
    PartyB: config.businessShortCode,
    PhoneNumber: normalizedPhone,
    CallBackURL: config.callbackUrl,
    AccountReference: reference,
    TransactionDesc: String(transactionDescription || 'AfriAds wallet top up').slice(0, 100)
  };

  const response = await axios.post(
    `${config.baseUrl}/mpesa/stkpush/v1/processrequest`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 20000
    }
  );

  return {
    request: {
      amount: roundedAmount,
      phone_number: normalizedPhone,
      account_reference: reference,
      callback_url: config.callbackUrl,
      environment: config.environment
    },
    response: response.data
  };
};

const extractCallbackItems = (callbackMetadata) => {
  const items = callbackMetadata?.Item || [];
  return items.reduce((acc, item) => {
    acc[item.Name] = item.Value;
    return acc;
  }, {});
};

module.exports = {
  getMpesaConfig,
  getConfigStatus,
  assertConfigured,
  normalizePhoneNumber,
  initiateSTKPush,
  extractCallbackItems
};
