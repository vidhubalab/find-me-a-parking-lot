/**
 * Health check endpoint for ParkSG API monitoring
 * Compatible with Vercel Serverless Functions (/api/health.js) and Express.
 */

export default async function handler(req, res) {
  const startTime = Date.now();
  const govAccountKey = process.env.GOV_ACCOUNT_KEY || process.env.LTA_DATAMALL_KEY || '';
  const isKeyConfigured = Boolean(govAccountKey && govAccountKey !== 'MY_LTA_DATAMALL_KEY');

  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
  };

  // Perform lightweight ping to the 3 government services
  const results = {
    ltaCarParkAvailability: { status: 'pending', latencyMs: 0 },
    hdbCarparkInfo: { status: 'pending', latencyMs: 0 },
    ltaEvcBatch: { status: 'pending', latencyMs: 0 },
  };

  // Check 1: LTA CarParkAvailabilityv2
  const checkLtaLots = async () => {
    const t0 = Date.now();
    try {
      const resp = await fetch('https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2', {
        headers: {
          AccountKey: govAccountKey,
          accept: 'application/json',
        },
        signal: AbortSignal.timeout(4000),
      });
      results.ltaCarParkAvailability = {
        status: resp.ok ? 'connected' : resp.status === 401 || resp.status === 403 ? 'auth_required' : `http_${resp.status}`,
        httpCode: resp.status,
        latencyMs: Date.now() - t0,
      };
    } catch (err) {
      results.ltaCarParkAvailability = {
        status: 'unreachable',
        error: err.message,
        latencyMs: Date.now() - t0,
      };
    }
  };

  // Check 2: data.gov.sg HDB dataset
  const checkHdbInfo = async () => {
    const t0 = Date.now();
    try {
      const resp = await fetch(
        'https://data.gov.sg/api/action/datastore_search?resource_id=d_23f946fa557947f93a8043bbef41dd09&limit=1',
        {
          headers: { accept: 'application/json' },
          signal: AbortSignal.timeout(4000),
        }
      );
      results.hdbCarparkInfo = {
        status: resp.ok ? 'connected' : `http_${resp.status}`,
        httpCode: resp.status,
        latencyMs: Date.now() - t0,
      };
    } catch (err) {
      results.hdbCarparkInfo = {
        status: 'unreachable',
        error: err.message,
        latencyMs: Date.now() - t0,
      };
    }
  };

  // Check 3: LTA EVCBatch
  const checkLtaEv = async () => {
    const t0 = Date.now();
    try {
      const resp = await fetch('https://datamall2.mytransport.sg/ltaodataservice/EVCBatch', {
        headers: {
          AccountKey: govAccountKey,
          accept: 'application/json',
        },
        signal: AbortSignal.timeout(4000),
      });
      results.ltaEvcBatch = {
        status: resp.ok ? 'connected' : resp.status === 401 || resp.status === 403 ? 'auth_required' : `http_${resp.status}`,
        httpCode: resp.status,
        latencyMs: Date.now() - t0,
      };
    } catch (err) {
      results.ltaEvcBatch = {
        status: 'unreachable',
        error: err.message,
        latencyMs: Date.now() - t0,
      };
    }
  };

  // Run all 3 checks concurrently
  await Promise.allSettled([checkLtaLots(), checkHdbInfo(), checkLtaEv()]);

  const totalDurationMs = Date.now() - startTime;
  const isHealthy = results.hdbCarparkInfo.status === 'connected' || results.ltaCarParkAvailability.status === 'connected';

  const payload = {
    status: isHealthy ? 'healthy' : 'degraded',
    service: 'ParkSG Live Carpark & EV Gateway',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime ? process.uptime() : 0),
    totalDurationMs,
    environment: {
      govAccountKeyConfigured: isKeyConfigured,
      keyMasked: isKeyConfigured ? `${govAccountKey.slice(0, 4)}...${govAccountKey.slice(-4)}` : 'NOT_SET',
      vercelRegion: process.env.VERCEL_REGION || 'local-dev',
    },
    endpoints: {
      carParkAvailabilityv2: {
        url: 'https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2',
        ...results.ltaCarParkAvailability,
      },
      hdbCarparkInfo: {
        url: 'https://data.gov.sg/api/action/datastore_search?resource_id=d_23f946fa557947f93a8043bbef41dd09',
        ...results.hdbCarparkInfo,
      },
      evcBatch: {
        url: 'https://datamall2.mytransport.sg/ltaodataservice/EVCBatch',
        ...results.ltaEvcBatch,
      },
    },
    message: isKeyConfigured
      ? 'GOV_ACCOUNT_KEY is configured. Live government data streaming active.'
      : 'GOV_ACCOUNT_KEY is not configured yet. Fallback cache enabled so app stays operational.',
  };

  if (res.setHeader) {
    Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));
  }

  return res.status ? res.status(200).json(payload) : res.json(payload);
}
