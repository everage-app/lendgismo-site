// netlify/functions/quickbooks-company.js
// Retrieve company information from QuickBooks

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { QUICKBOOKS_ENV = 'sandbox' } = process.env;
    
    // Get access token and realmId from request
    const authHeader = event.headers.authorization || event.headers.Authorization;
    const body = JSON.parse(event.body || '{}');
    const { realmId, accessToken } = body;

    if (!accessToken || !realmId) {
      return {
        statusCode: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          error: 'Missing accessToken or realmId',
          provider: 'quickbooks'
        })
      };
    }

    // Return mock data if using mock token
    if (accessToken === 'mock-access-token') {
      return {
        statusCode: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          mock: true,
          company: {
            CompanyName: 'Mock Company Inc',
            LegalName: 'Mock Company Incorporated',
            CompanyAddr: {
              Line1: '123 Main Street',
              City: 'San Francisco',
              CountrySubDivisionCode: 'CA',
              PostalCode: '94102',
              Country: 'USA'
            },
            Email: 'contact@mockcompany.com',
            WebAddr: 'www.mockcompany.com',
            FiscalYearStartMonth: 'January',
            Country: 'US',
            SupportedLanguages: 'en'
          },
          provider: 'quickbooks'
        })
      };
    }

    // Call QuickBooks API
    const baseUrl = QUICKBOOKS_ENV === 'production'
      ? 'https://quickbooks.api.intuit.com'
      : 'https://sandbox-quickbooks.api.intuit.com';

    const apiUrl = `${baseUrl}/v3/company/${realmId}/companyinfo/${realmId}`;

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`QuickBooks API error: ${errorData}`);
    }

    const data = await response.json();

    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        company: data.CompanyInfo,
        provider: 'quickbooks',
        environment: QUICKBOOKS_ENV
      })
    };

  } catch (error) {
    console.error('QuickBooks company error:', error);
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
