// netlify/functions/quickbooks-auth.js
// Initiate QuickBooks OAuth 2.0 flow

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const {
      QUICKBOOKS_CLIENT_ID,
      QUICKBOOKS_REDIRECT_URI,
      QUICKBOOKS_ENV = 'sandbox'
    } = process.env;

    // Return mock response if credentials not configured
    if (!QUICKBOOKS_CLIENT_ID) {
      return {
        statusCode: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          mock: true,
          message: 'QuickBooks not configured - returning mock auth URL',
          authUrl: 'https://sandbox.quickbooks.com/oauth2/authorize?mock=true',
          state: 'mock-state-token',
          provider: 'quickbooks'
        })
      };
    }

    // Generate state token for CSRF protection
    const state = Math.random().toString(36).substring(2, 15);
    
    // QuickBooks OAuth 2.0 authorization URL
    const baseUrl = QUICKBOOKS_ENV === 'production' 
      ? 'https://appcenter.intuit.com/connect/oauth2'
      : 'https://appcenter.intuit.com/connect/oauth2';

    const scope = 'com.intuit.quickbooks.accounting';
    
    const authUrl = `${baseUrl}?client_id=${QUICKBOOKS_CLIENT_ID}&response_type=code&scope=${encodeURIComponent(scope)}&redirect_uri=${encodeURIComponent(QUICKBOOKS_REDIRECT_URI)}&state=${state}`;

    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        authUrl,
        state,
        provider: 'quickbooks',
        environment: QUICKBOOKS_ENV
      })
    };

  } catch (error) {
    console.error('QuickBooks auth error:', error);
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: error.message,
        provider: 'quickbooks'
      })
    };
  }
};
