// netlify/functions/datamerch-report.js
// Retrieve alternative credit analysis report from DataMerch

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
    const { analysisId } = body;

    if (!analysisId) {
      return {
        statusCode: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          error: 'Missing analysisId',
          provider: 'datamerch'
        })
      };
    }

    // Return mock response if API key not configured or mock analysis ID
    if (!DATAMERCH_API_KEY || analysisId.startsWith('mock-analysis-')) {
      return {
        statusCode: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          mock: true,
          analysisId: analysisId,
          status: 'completed',
          completedAt: new Date().toISOString(),
          report: {
            businessRiskScore: 725,
            creditScore: 680,
            riskLevel: 'medium',
            recommendedCreditLimit: 50000,
            paymentBehavior: {
              avgDaysToPayment: 28,
              latePaymentRate: 0.05,
              totalTransactions: 247
            },
            publicRecords: {
              bankruptcies: 0,
              liens: 0,
              judgments: 0,
              uccFilings: 2
            },
            insights: [
              'Strong payment history with minimal late payments',
              'Active UCC filings indicate existing credit relationships',
              'Revenue trends show consistent growth over 24 months',
              'Industry benchmark: Above average for sector'
            ],
            dataPoints: {
              bankruptcyChecked: true,
              liensChecked: true,
              paydexScore: 78,
              delinquencyRate: 'Low'
            }
          },
          provider: 'datamerch'
        })
      };
    }

    // Call DataMerch API
    const response = await fetch(`${DATAMERCH_API_URL}/reports/${analysisId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${DATAMERCH_API_KEY}`,
        'Accept': 'application/json'
      }
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
        completedAt: data.completedAt,
        report: data.report,
        provider: 'datamerch'
      })
    };

  } catch (error) {
    console.error('DataMerch report error:', error);
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
