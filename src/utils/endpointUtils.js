// Define endpoint arrays
const PRD_URLS = [
  "https://weu-api.au10tixservices.com",
  "https://eus-api.au10tixservices.com",
  "https://ejp-api.au10tixservices.com",
  "https://wus-api.au10tixservices.com"
];

const STG_URLS = [
  "https://weu-api.au10tixservicesstaging.com",
  "https://eus-api.au10tixservicesstaging.com"
];

const BOS_URLS = [
  "https://bos-weu.au10tixservices.com",
  "https://bos-eus.au10tixservices.com",
  "https://bos-ejp.au10tixservices.com",
  "https://bos-wus.au10tixservices.com",
  "https://bos-weu.au10tixservicesstaging.com",
  "https://bos-eus.au10tixservicesstaging.com"
];

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
  if (process.env.NODE_ENV !== 'production') console.error('Error parsing JWT:', e);
    return null;
  }
}

function determineApiTypeFromToken(token) {
  const decoded = parseJwt(token);
  if (!decoded) return null;

  // Check scope for API type
  if (decoded.scp) {
    if (decoded.scp.includes('workflow:api')) {
      return 'workflow';
    }
    if (decoded.scp.includes('secure.me:request')) {
      return 'secureme';
    }
    if (decoded.scp.includes('bos')) {
      return 'bos';
    }
  }
  return null;
}

function getRegionFromToken(token) {
  const decoded = parseJwt(token);
  if (!decoded) return null;

  // Try to get region from various possible fields
  const regionSources = [
    decoded.region,
    decoded.apiUrl?.match(/API\.([A-Z]+)\./)?.[1],
    decoded.securemeUrl?.match(/api\.([^.]+)\./)?.[1],
    decoded.bosUrl?.match(/bos-([^.]+)\./)?.[1]
  ];

  for (const source of regionSources) {
    if (source) {
      return source.toUpperCase();
    }
  }
  return null;
}

function getEnvironmentFromToken(token) {
  const decoded = parseJwt(token);
  if (!decoded) return null;

  // Check various fields for staging indication
  const stagingIndicators = [
    decoded.apiUrl?.includes('STAGING'),
    decoded.securemeUrl?.includes('staging'),
    decoded.bosUrl?.includes('staging')
  ];

  return stagingIndicators.some(Boolean) ? 'STG' : 'PRD';
}

function getBaseUrlFromToken(token) {
  const apiType = determineApiTypeFromToken(token);
  const region = getRegionFromToken(token);
  const environment = getEnvironmentFromToken(token);

  if (!apiType || !region || !environment) {
    return null;
  }

  // For BOS API type
  if (apiType === 'bos') {
    const bosUrls = environment === 'STG' 
      ? BOS_URLS.filter(url => url.includes('staging'))
      : BOS_URLS.filter(url => !url.includes('staging'));
    
    return bosUrls.find(url => url.includes(region.toLowerCase())) || null;
  }

  // For Workflow or Secureme API type
  const urls = environment === 'STG' ? STG_URLS : PRD_URLS;
  return urls.find(url => url.includes(region.toLowerCase())) || null;
}

function getOrganizationInfo(token) {
  const decoded = parseJwt(token);
  if (!decoded) return null;

  return {
    name: decoded.clientOrganizationName,
    id: decoded.clientOrganizationId
  };
}

function getTokenInfo(token) {
  const apiType = determineApiTypeFromToken(token);
  const region = getRegionFromToken(token);
  const environment = getEnvironmentFromToken(token);
  const baseUrl = getBaseUrlFromToken(token);
  const organization = getOrganizationInfo(token);

  return {
    apiType,
    region,
    environment,
    baseUrl,
    organization,
    isValid: !!(apiType && region && environment && baseUrl)
  };
}

// Export functions to global scope
window.getTokenInfo = getTokenInfo; 