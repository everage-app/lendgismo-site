// netlify/functions/datamerch-analyze.js
// Submit business data for alternative credit analysis via DataMerch

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
      DATAMERCH_API_KEY,
      DATAMERCH_API_URL = 'https://api.datamerch.com/v1'
    } = process.env;

    const body = JSON.parse(event.body || '{}');
    const {
      businessName,
      taxId,
      address,
      revenue,
      employees,
      industry,
      yearsInBusiness,
      creditScore
    } = body;

    if (!businessName || !taxId) {
      return {
        statusCode: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          error: 'Missing required fields: businessName and taxId',
          provider: 'datamerch'
        })
      };
    }

    // Return mock response if API key not configured
    if (!DATAMERCH_API_KEY) {
      return {
        statusCode: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          mock: true,
          message: 'DataMerch not configured - returning mock analysis',
          analysisId: `mock-analysis-${Date.now()}`,
          status: 'processing',
          estimatedCompletionTime: '2-5 minutes',
          businessProfile: {
            businessName,
            taxId: taxId.replace(/\d(?=\d{4})/g, '*'),
            industry: industry || 'Not specified',
            yearsInBusiness: yearsInBusiness || 'Unknown'
          },
          provider: 'datamerch'
        })
      };
    }

    // Call DataMerch API
    const response = await fetch(`${DATAMERCH_API_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DATAMERCH_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        business: {
          name: businessName,
          taxId: taxId,
          address: address,
          revenue: revenue,
          employees: employees,
          industry: industry,
          yearsInBusiness: yearsInBusiness,
          creditScore: creditScore
        },
        options: {
          includeBankruptcy: true,
          includeLiens: true,
          includeJudgments: true,
          includeUCC: true,
          includePaymentData: true
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`DataMerch API error: ${errorData}`);
    }

    const data = await response.json();

    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        analysisId: data.analysisId,
        status: data.status,
        estimatedCompletionTime: data.estimatedCompletionTime,
        provider: 'datamerch'
      })
    };

  } catch (error) {
    console.error('DataMerch analyze error:', error);
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: error.message,
        provider: 'datamerch'
      })
    };
  }
};
