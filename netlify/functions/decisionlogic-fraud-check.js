// netlify/functions/decisionlogic-fraud-check.js
// Perform fraud and risk analysis via DecisionLogic

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
    const {
      applicationId,
      applicant,
      loan,
      device,
      checkLevel = 'comprehensive'
    } = body;

    if (!applicant || !applicant.firstName || !applicant.lastName) {
      return {
        statusCode: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          error: 'Missing required applicant information',
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
          fraudCheckId: `mock-fraud-${Date.now()}`,
          applicationId: applicationId || `app-${Date.now()}`,
          status: 'completed',
          results: {
            fraudScore: 125,
            riskLevel: 'low',
            decision: 'approve',
            confidence: 0.94,
            checks: {
              identityTheft: 'clear',
              syntheticIdentity: 'clear',
              firstPartyFraud: 'clear',
              deviceFingerprint: device ? 'verified' : 'not_checked',
              velocityChecks: 'pass',
              emailRisk: 'low',
              phoneRisk: 'low',
              addressRisk: 'low',
              behavioralAnalysis: 'normal'
            },
            flags: [],
            indicators: [
              { type: 'positive', name: 'Consistent identity data', severity: 'info' },
              { type: 'positive', name: 'No velocity alerts', severity: 'info' },
              { type: 'positive', name: 'Valid contact information', severity: 'info' }
            ],
            checkLevel: checkLevel,
            completedAt: new Date().toISOString()
          },
          recommendations: [
            'Applicant presents low fraud risk',
            'Standard underwriting process recommended',
            'No additional verification required'
          ],
          provider: 'decisionlogic'
        })
      };
    }

    // Call DecisionLogic API
    const response = await fetch(`${DECISIONLOGIC_API_URL}/fraud/check`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DECISIONLOGIC_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        applicationId,
        applicant,
        loan,
        device,
        options: {
          checkLevel,
          includeDeviceFingerprint: !!device,
          includeVelocityChecks: true,
          includeBehavioralAnalysis: true,
          includeEmailRisk: true,
          includePhoneRisk: true
        }
      })
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
        fraudCheckId: data.fraudCheckId,
        applicationId: data.applicationId,
        status: data.status,
        results: data.results,
        recommendations: data.recommendations,
        provider: 'decisionlogic'
      })
    };

  } catch (error) {
    console.error('DecisionLogic fraud check error:', error);
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
