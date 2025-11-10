// netlify/functions/quickbooks-reports.js
// Retrieve financial reports from QuickBooks

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
    
    const body = JSON.parse(event.body || '{}');
    const { realmId, accessToken, reportType = 'ProfitAndLoss', startDate, endDate } = body;

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
          report: {
            reportType: reportType,
            startDate: startDate || '2024-01-01',
            endDate: endDate || '2024-12-31',
            Header: {
              ReportName: reportType === 'ProfitAndLoss' ? 'Profit and Loss' : 'Balance Sheet',
              DateMacro: 'This Fiscal Year',
              ReportBasis: 'Accrual',
              Currency: 'USD'
            },
            summary: {
              totalRevenue: 125000.00,
              totalExpenses: 85000.00,
              netIncome: 40000.00,
              grossProfit: 95000.00,
              operatingIncome: 42000.00
            }
          },
          provider: 'quickbooks'
        })
      };
    }

    // Call QuickBooks API
    const baseUrl = QUICKBOOKS_ENV === 'production'
      ? 'https://quickbooks.api.intuit.com'
      : 'https://sandbox-quickbooks.api.intuit.com';

    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    params.append('accounting_method', 'Accrual');

    const apiUrl = `${baseUrl}/v3/company/${realmId}/reports/${reportType}?${params.toString()}`;

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
        report: data,
        provider: 'quickbooks',
        environment: QUICKBOOKS_ENV
      })
    };

  } catch (error) {
    console.error('QuickBooks reports error:', error);
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
