/**
 * API Health & Diagnostics Handler
 * Monitors:
 * 1. URA Live Car Park Availability: https://eservice.ura.gov.sg/uraDataService/invokeUraDS/v1?service=Car_Park_Availability
 * 2. URA Car Park List & Rates: https://eservice.ura.gov.sg/uraDataService/invokeUraDS/v1?service=Car_Park_Details
 * 3. LTA DataMall EV Charging Data: https://datamall2.mytransport.sg/ltaodataservice/EVCBatch
 */

const startTime = Date.now();

export default async function handler(req, res) {
  const uraAccountKey = process.env.URA_ACCOUNT_KEY || process.env.URA_ACCESS_KEY || '';
  const govAccountKey = process.env.GOV_ACCOUNT_KEY || process.env.LTA_DATAMALL_KEY || '';

  const results = {
    status: 'healthy',
    service: 'ParkSG URA & LTA Gateway',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
    environment: {
      uraAccountKeyConfigured: Boolean(uraAccountKey && uraAccountKey !== 'MY_URA_ACCOUNT_KEY'),
      uraKeyMasked: uraAccountKey ? `${uraAccountKey.slice(0, 4)}...${uraAccountKey.slice(-3)}` : 'NOT_SET',
      govAccountKeyConfigured: Boolean(govAccountKey && govAccountKey !== 'MY_LTA_DATAMALL_KEY'),
      govKeyMasked: govAccountKey ? `${govAccountKey.slice(0, 4)}...${govAccountKey.slice(-3)}` : 'NOT_SET',
      vercelRegion: process.env.VERCEL_REGION || process.env.AWS_REGION || 'local-dev',
    },
    endpoints: {
      uraCarParkAvailability: {
        url: 'https://eservice.ura.gov.sg/uraDataService/invokeUraDS/v1?service=Car_Park_Availability',
        status: 'pending',
        httpCode: null,
        latencyMs: 0,
      },
      uraCarParkDetails: {
        url: 'https://eservice.ura.gov.sg/uraDataService/invokeUraDS/v1?service=Car_Park_Details',
        status: 'pending',
        httpCode: null,
        latencyMs: 0,
      },
      ltaEvcBatch: {
        url: 'https://datamall2.mytransport.sg/ltaodataservice/EVCBatch',
        status: 'pending',
        httpCode: null,
        latencyMs: 0,
      },
    },
  };

  const pingStart = Date.now();

  // Test 1: URA Car_Park_Availability
  try {
    const t0 = Date.now();
    const headers = {
      'User-Agent': 'ParkSG-API/1.0',
    };
    if (uraAccountKey && uraAccountKey !== 'MY_URA_ACCOUNT_KEY') {
      headers['AccessKey'] = uraAccountKey;
    }
    const resp = await fetch('https://eservice.ura.gov.sg/uraDataService/invokeUraDS/v1?service=Car_Park_Availability', {
      headers,
      signal: AbortSignal.timeout(6000),
    });
    results.endpoints.uraCarParkAvailability.latencyMs = Date.now() - t0;
    results.endpoints.uraCarParkAvailability.httpCode = resp.status;
    results.endpoints.uraCarParkAvailability.status = resp.ok ? 'connected' : `http_${resp.status}`;
  } catch (err) {
    results.endpoints.uraCarParkAvailability.status = 'unreachable';
    results.endpoints.uraCarParkAvailability.error = err.message;
  }

  // Test 2: URA Car_Park_Details
  try {
    const t0 = Date.now();
    const headers = {
      'User-Agent': 'ParkSG-API/1.0',
    };
    if (uraAccountKey && uraAccountKey !== 'MY_URA_ACCOUNT_KEY') {
      headers['AccessKey'] = uraAccountKey;
    }
    const resp = await fetch('https://eservice.ura.gov.sg/uraDataService/invokeUraDS/v1?service=Car_Park_Details', {
      headers,
      signal: AbortSignal.timeout(6000),
    });
    results.endpoints.uraCarParkDetails.latencyMs = Date.now() - t0;
    results.endpoints.uraCarParkDetails.httpCode = resp.status;
    results.endpoints.uraCarParkDetails.status = resp.ok ? 'connected' : `http_${resp.status}`;
  } catch (err) {
    results.endpoints.uraCarParkDetails.status = 'unreachable';
    results.endpoints.uraCarParkDetails.error = err.message;
  }

  // Test 3: LTA EVCBatch
  try {
    const t0 = Date.now();
    const headers = {
      accept: 'application/json',
    };
    if (govAccountKey && govAccountKey !== 'MY_LTA_DATAMALL_KEY') {
      headers['AccountKey'] = govAccountKey;
    }
    const resp = await fetch('https://datamall2.mytransport.sg/ltaodataservice/EVCBatch', {
      headers,
      signal: AbortSignal.timeout(6000),
    });
    results.endpoints.ltaEvcBatch.latencyMs = Date.now() - t0;
    results.endpoints.ltaEvcBatch.httpCode = resp.status;
    results.endpoints.ltaEvcBatch.status = resp.ok ? 'connected' : `http_${resp.status}`;
  } catch (err) {
    results.endpoints.ltaEvcBatch.status = 'unreachable';
    results.endpoints.ltaEvcBatch.error = err.message;
  }

  results.totalDurationMs = Date.now() - pingStart;

  const allKeysMissing = !results.environment.uraAccountKeyConfigured && !results.environment.govAccountKeyConfigured;
  if (allKeysMissing) {
    results.status = 'healthy_cache_fallback';
    results.message = 'URA_ACCOUNT_KEY and GOV_ACCOUNT_KEY are not configured yet. Fallback cache enabled so app stays operational.';
  } else {
    results.message = 'Government API keys active and ready.';
  }

  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Content-Type', 'application/json');
  return res.status(200).json(results);
}
