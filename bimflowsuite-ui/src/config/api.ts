// src/config/api.ts
export const APS_CONFIG = {
  clientId: '9klPrZWrHBSt2PQ4QP4XlPYQ1fu2bX7yeVrvA2KlUrI25bZl',
  clientSecret: '14J9n1MVmHkqV3P4sCbSe2ZnKiBf5NWN1gLERTsGhq4efZlpd5oeMhVddG9JyVP1',
  baseUrl: 'https://developer.api.autodesk.com',
  scope: 'data:read data:write data:create bucket:read bucket:create viewables:read',
};

// We guarantee these will be string + number or undefined (never null)
let accessToken: string | undefined = undefined;
let tokenExpiry: number | undefined = undefined;

export const getAuthHeaders = async (): Promise<HeadersInit> => {
  const token = await getAccessToken();
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export const getAccessToken = async (): Promise<string> => {
  // Reuse token if not expired
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken;
  }

  try {
    const response = await fetch(`${APS_CONFIG.baseUrl}/authentication/v2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: APS_CONFIG.clientId,
        client_secret: APS_CONFIG.clientSecret,
        grant_type: 'client_credentials',
        scope: APS_CONFIG.scope,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to get APS access token: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    // Fully assign correct types
    accessToken = data.access_token as string;
    tokenExpiry = Date.now() + data.expires_in * 1000 - 60000; // renew 1 min early

    return accessToken;
  } catch (error) {
    console.error('Error getting APS access token:', error);
    throw new Error('Authentication failed. Check your APS credentials.');
  }
};