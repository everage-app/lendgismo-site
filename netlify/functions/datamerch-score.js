// netlify/functions/datamerch-score.js
// Get real-time alternative credit score from DataMerch

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
    const { businessName, taxId, quickCheck = false } = body;

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
          score: {
            businessName,
            taxId: taxId.replace(/\d(?=\d{4})/g, '*'),
            creditScore: 715,
            riskScore: 690,
            riskLevel: 'medium-low',
            scoreDate: new Date().toISOString(),
            confidence: 'high',
            factors: [
              { name: 'Payment History', impact: 'positive', weight: 35 },
              { name: 'Credit Utilization', impact: 'neutral', weight: 25 },
              { name: 'Business Age', impact: 'positive', weight: 20 },
              { name: 'Public Records', impact: 'positive', weight: 15 },
              { name: 'Industry Risk', impact: 'neutral', weight: 5 }
            ],
            quickCheck: quickCheck
          },
          provider: 'datamerch'
        })
      };
    }

    // Call DataMerch API
    const endpoint = quickCheck ? '/score/quick' : '/score';
    const response = await fetch(`${DATAMERCH_API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DATAMERCH_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        businessName,
        taxId,
        includeFactors: true
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
        score: data,
        provider: 'datamerch'
      })
    };

  } catch (error) {
    console.error('DataMerch score error:', error);
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
