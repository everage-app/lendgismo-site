// netlify/functions/decisionlogic-verify.js
// Perform identity and credit verification via DecisionLogic

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
      firstName,
      lastName,
      dateOfBirth,
      ssn,
      address,
      phone,
      email,
      verificationLevel = 'standard'
    } = body;

    if (!firstName || !lastName || !dateOfBirth) {
      return {
        statusCode: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          error: 'Missing required fields: firstName, lastName, dateOfBirth',
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
          verificationId: `mock-verify-${Date.now()}`,
          status: 'verified',
          results: {
            identityMatch: 'confirmed',
            identityScore: 92,
            addressVerified: true,
            phoneVerified: true,
            emailVerified: true,
            ssnVerified: ssn ? true : false,
            creditBureauMatch: true,
            watchlistCheck: 'clear',
            sanctions: 'clear',
            pep: false,
            adverseMedia: 'none',
            riskLevel: 'low',
            verificationLevel: verificationLevel,
            completedAt: new Date().toISOString()
          },
          warnings: [],
          provider: 'decisionlogic'
        })
      };
    }

    // Call DecisionLogic API
    const response = await fetch(`${DECISIONLOGIC_API_URL}/verify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DECISIONLOGIC_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        applicant: {
          firstName,
          lastName,
          dateOfBirth,
          ssn,
          address,
          phone,
          email
        },
        options: {
          verificationLevel,
          includeCredit: true,
          includeWatchlist: true,
          includeSanctions: true,
          includeAdverseMedia: true
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
        verificationId: data.verificationId,
        status: data.status,
        results: data.results,
        warnings: data.warnings || [],
        provider: 'decisionlogic'
      })
    };

  } catch (error) {
    console.error('DecisionLogic verify error:', error);
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
