// netlify/functions/decisionlogic-report.js
// Retrieve comprehensive risk and verification report from DecisionLogic

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
      DECISIONLOGIC_API_KEY,
      DECISIONLOGIC_API_URL = 'https://api.decisionlogic.com/v1'
    } = process.env;

    const body = JSON.parse(event.body || '{}');
    const { reportId, applicationId } = body;

    if (!reportId && !applicationId) {
      return {
        statusCode: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          error: 'Missing reportId or applicationId',
          provider: 'decisionlogic'
        })
      };
    }

    // Return mock response if API key not configured
    if (!DECISIONLOGIC_API_KEY) {
      return {
        statusCode: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          mock: true,
          reportId: reportId || `mock-report-${Date.now()}`,
          applicationId: applicationId,
          status: 'completed',
          generatedAt: new Date().toISOString(),
          report: {
            summary: {
              overallRisk: 'low',
              decision: 'approve',
              confidence: 0.92,
              creditScore: 720,
              fraudScore: 135,
              identityScore: 92
            },
            identity: {
              status: 'verified',
              nameMatch: 'exact',
              addressMatch: 'confirmed',
              ssnMatch: 'valid',
              dobMatch: 'exact',
              phoneMatch: 'active',
              emailMatch: 'valid'
            },
            credit: {
              score: 720,
              tradelines: 12,
              openAccounts: 8,
              totalBalance: 45000,
              utilization: 0.28,
              oldestAccount: '12 years',
              recentInquiries: 2,
              delinquencies: 0,
              collections: 0,
              bankruptcies: 0
            },
            fraud: {
              fraudScore: 135,
              syntheticIdentity: 'clear',
              identityTheft: 'clear',
              firstPartyFraud: 'clear',
              velocityRisk: 'low',
              deviceRisk: 'low',
              emailRisk: 'low',
              phoneRisk: 'low'
            },
            compliance: {
              ofac: 'clear',
              sanctions: 'clear',
              pep: false,
              adverseMedia: 'none',
              watchlist: 'clear'
            },
            recommendations: [
              'Applicant presents low overall risk',
              'Identity verification successful',
              'No fraud indicators detected',
              'Credit profile is acceptable',
              'Recommend approval with standard terms'
            ],
            riskFactors: [
              { category: 'credit', factor: 'Credit utilization above 25%', severity: 'low', impact: 'negative' },
              { category: 'identity', factor: 'All identity checks passed', severity: 'info', impact: 'positive' }
            ]
          },
          provider: 'decisionlogic'
        })
      };
    }

    // Call DecisionLogic API
    const endpoint = reportId 
      ? `${DECISIONLOGIC_API_URL}/reports/${reportId}`
      : `${DECISIONLOGIC_API_URL}/reports?applicationId=${applicationId}`;

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${DECISIONLOGIC_API_KEY}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`DecisionLogic API error: ${errorData}`);
    }

    const data = await response.json();

    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        reportId: data.reportId,
        applicationId: data.applicationId,
        status: data.status,
        generatedAt: data.generatedAt,
        report: data.report,
        provider: 'decisionlogic'
      })
    };

  } catch (error) {
    console.error('DecisionLogic report error:', error);
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: error.message,
        provider: 'decisionlogic'
      })
    };
  }
};
