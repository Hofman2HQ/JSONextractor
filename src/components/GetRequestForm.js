import React, { useState, useCallback } from 'react';
import { processJsonData } from '../logic/extractor.js';

const GetRequestForm = ({ onDataReceived, onError }) => {
  const [token, setToken] = useState('');
  const [requestId, setRequestId] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenInfo, setTokenInfo] = useState(null);

  const getRegionFromUrl = useCallback((url) => {
    if (!url) return null;
    const regionMatch = url.match(/https:\/\/([a-zA-Z]+)-api/);
    return regionMatch ? regionMatch[1].toUpperCase() : null;
  }, []);

  const getEnvironmentFromUrl = useCallback((url) => {
    if (!url) return null;
    if (url.includes('au10tixservicesstaging.com')) return 'STG';
    if (url.includes('au10tixservices.com')) return 'PRD';
    return null;
  }, []);

  const buildEndpointUrl = useCallback((tokenData, requestId) => {
    if (!tokenData || !requestId) {
      throw new Error('Missing token data or request ID');
    }
    
    const { scope, apiUrl } = tokenData;
    const region = getRegionFromUrl(apiUrl);
    const env = getEnvironmentFromUrl(apiUrl);
    
    if (!region || !env) {
      throw new Error('Invalid API URL in token');
    }

    switch (scope) {
      case 'workflow:api':
        return `https://${region.toLowerCase()}-api.${env === 'PRD' ? 'au10tixservices.com' : 'au10tixservicesstaging.com'}/result/v2/results/person/${requestId}?includeDetailed=true`;
      case 'secure.me:request':
        return `https://${region.toLowerCase()}-api.${env === 'PRD' ? 'au10tixservices.com' : 'au10tixservicesstaging.com'}/cm/v2/documentprocessingrequests/${requestId}`;
      case 'bos':
        return `https://bos-${region.toLowerCase()}.${env === 'PRD' ? 'au10tixservices.com' : 'au10tixservicesstaging.com'}/Au10tixBos4/IdentityDocuments/Results/${requestId}?imageTypes=all&sasToken=true&sasLifetimeInSeconds=600`;
      default:
        throw new Error('Unsupported scope');
    }
  }, [getRegionFromUrl, getEnvironmentFromUrl]);

  const parseToken = useCallback(() => {
    try {
      if (!token || token.trim() === '') {
        throw new Error('Token is required');
      }

      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }

      // Use a more robust base64 decoding with fallback
      let payload;
      try {
        payload = JSON.parse(atob(parts[1]));
      } catch (decodeError) {
        // Fallback for browsers that don't support atob
        try {
          payload = JSON.parse(decodeURIComponent(escape(atob(parts[1]))));
        } catch (fallbackError) {
          throw new Error('Failed to decode token payload');
        }
      }
      
      const currentTime = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < currentTime) {
        throw new Error('Token has expired');
      }

      // Normalize scope
      let scope = payload.scp;
      if (Array.isArray(scope)) {
        scope = scope[0]; // Use the first scope for now
      }

      if (!scope) {
        throw new Error('No scope found in token');
      }

      if (!payload.apiUrl) {
        throw new Error('No API URL found in token');
      }

      // Extract required information
      const tokenData = {
        organization: {
          name: payload.clientOrganizationName || 'N/A',
          id: payload.clientOrganizationId || 'N/A'
        },
        region: getRegionFromUrl(payload.apiUrl),
        environment: getEnvironmentFromUrl(payload.apiUrl),
        scope: scope,
        apiUrl: payload.apiUrl
      };

      setTokenInfo(tokenData);
      return tokenData;
    } catch (error) {
      throw new Error('Failed to parse token: ' + error.message);
    }
  }, [token, getRegionFromUrl, getEnvironmentFromUrl]);

  const handleTokenSubmit = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await parseToken();
    } catch (error) {
      if (onError) onError(error.message);
      setTokenInfo(null);
    } finally {
      setLoading(false);
    }
  }, [parseToken, onError]);

  const handleRequestSubmit = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!tokenInfo) {
        throw new Error('Token information not available');
      }

      if (!requestId || requestId.trim() === '') {
        throw new Error('Request ID is required');
      }

      const endpointUrl = buildEndpointUrl(tokenInfo, requestId);
      const response = await fetch(endpointUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('API response:', data); // Debug log
      
      if (onDataReceived) onDataReceived(data);
    } catch (error) {
      console.error('Error in handleRequestSubmit:', error); // Debug log
      if (onError) onError(error.message);
    } finally {
      setLoading(false);
    }
  }, [tokenInfo, requestId, token, buildEndpointUrl, onDataReceived, onError]);

  const handleTokenChange = useCallback((e) => {
    setToken(e.target.value);
  }, []);

  const handleRequestIdChange = useCallback((e) => {
    setRequestId(e.target.value);
  }, []);

  const handleTogglePassword = useCallback(() => {
    const input = document.getElementById('token');
    if (input) {
      input.type = input.type === 'password' ? 'text' : 'password';
    }
  }, []);

  const handleChangeToken = useCallback(() => {
    setTokenInfo(null);
    setToken('');
    setRequestId('');
  }, []);

  if (!tokenInfo) {
    return (
      <form onSubmit={handleTokenSubmit} className="p-4 border rounded">
        <div className="mb-3">
          <label htmlFor="token" className="form-label">Authorization Token</label>
          <div className="input-group">
            <input
              type="password"
              className="form-control"
              id="token"
              value={token}
              onChange={handleTokenChange}
              required
              placeholder="Enter your JWT token"
            />
            <button 
              className="btn btn-outline-secondary" 
              type="button"
              onClick={handleTogglePassword}
            >
              <i className="bi bi-eye"></i>
            </button>
          </div>
          <div className="form-text">Enter your RS256 JWT token</div>
        </div>
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Parsing Token...
            </>
          ) : (
            'Parse Token'
          )}
        </button>
      </form>
    );
  }

  return (
    <div>
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">Token Information</h5>
          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <h6 className="text-muted">Organization</h6>
                <p className="mb-1">
                  <span className="badge bg-primary me-2">Name</span>
                  {tokenInfo.organization.name}
                </p>
                <p>
                  <span className="badge bg-secondary me-2">ID</span>
                  {tokenInfo.organization.id}
                </p>
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <h6 className="text-muted">Environment</h6>
                <p className="mb-1">
                  <span className="badge bg-info me-2">Region</span>
                  {tokenInfo.region}
                </p>
                <p className="mb-1">
                  <span className="badge bg-warning me-2">Environment</span>
                  {tokenInfo.environment}
                </p>
                <p>
                  <span className="badge bg-success me-2">Scope</span>
                  {tokenInfo.scope}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleRequestSubmit} className="p-4 border rounded">
        <div className="mb-3">
          <label htmlFor="requestId" className="form-label">Request ID</label>
          <input
            type="text"
            className="form-control"
            id="requestId"
            value={requestId}
            onChange={handleRequestIdChange}
            required
            placeholder="Enter request ID"
          />
        </div>
        <div className="d-flex gap-2">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Loading...
              </>
            ) : (
              'Get Data'
            )}
          </button>
          <button 
            type="button" 
            className="btn btn-outline-secondary"
            onClick={handleChangeToken}
          >
            Change Token
          </button>
        </div>
      </form>
    </div>
  );
};

export default GetRequestForm; 