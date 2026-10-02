/**
 * Endpoint for Singapore EV Charging Stations Batch Data
 * Source: https://datamall2.mytransport.sg/ltaodataservice/EVCBatch
 */

export default async function handler(req, res) {
  const govAccountKey = process.env.GOV_ACCOUNT_KEY || process.env.LTA_DATAMALL_KEY || '';

  try {
    if (govAccountKey && govAccountKey !== 'MY_LTA_DATAMALL_KEY') {
      const resp = await fetch('https://datamall2.mytransport.sg/ltaodataservice/EVCBatch', {
        headers: {
          AccountKey: govAccountKey,
          accept: 'application/json',
        },
        signal: AbortSignal.timeout(6000),
      });

      if (resp.ok) {
        const batchMetadata = await resp.json();
        const s3Link = batchMetadata.value?.[0]?.Link;

        if (s3Link) {
          // Download actual batch content from AWS S3 pre-signed link
          try {
            const s3Resp = await fetch(s3Link, { signal: AbortSignal.timeout(6000) });
            if (s3Resp.ok) {
              const evData = await s3Resp.json();
              return res.status(200).json({
                source: 'lta_s3_batch_live',
                batchLink: s3Link,
                stations: evData,
              });
            }
          } catch (s3Err) {
            console.warn('[ParkSG API] Failed downloading S3 EV batch link:', s3Err.message);
          }
        }

        return res.status(200).json({
          source: 'lta_evcbatch_meta',
          value: batchMetadata.value || [],
        });
      }
    }
  } catch (err) {
    console.warn('[ParkSG API] LTA EVCBatch fetch error:', err.message);
  }

  // Fallback EV Charging Hubs in key Singapore destinations
  return res.status(200).json({
    source: 'fallback_cache',
    note: govAccountKey ? 'EVCBatch service error, serving cached EV hubs' : 'GOV_ACCOUNT_KEY not set yet, serving fallback EV hubs',
    stations: [
      {
        operator: 'SP Group',
        location: 'ION Orchard B3/B4',
        chargersCount: 6,
        powerKw: 50,
        plugTypes: ['Type 2', 'CCS 2'],
      },
      {
        operator: 'Shell Recharge',
        location: 'Takashimaya Basement',
        chargersCount: 8,
        powerKw: 50,
        plugTypes: ['Type 2', 'CCS 2'],
      },
      {
        operator: 'Tesla / SP Group',
        location: 'Marina Bay Sands Central Carpark',
        chargersCount: 14,
        powerKw: 120,
        plugTypes: ['Tesla Supercharger', 'CCS 2', 'Type 2'],
      },
      {
        operator: 'SP Group',
        location: 'Suntec City Mall Zone Yellow',
        chargersCount: 12,
        powerKw: 50,
        plugTypes: ['Type 2', 'CCS 2'],
      },
      {
        operator: 'SP Group',
        location: 'VivoCity Level 2 Multi-Storey',
        chargersCount: 10,
        powerKw: 50,
        plugTypes: ['Type 2', 'CCS 2'],
      },
      {
        operator: 'SP Group',
        location: 'JEM Shopping Mall Level B2',
        chargersCount: 6,
        powerKw: 50,
        plugTypes: ['Type 2', 'CCS 2'],
      },
      {
        operator: 'Shell Recharge',
        location: 'Westgate Carpark B1',
        chargersCount: 8,
        powerKw: 50,
        plugTypes: ['Type 2', 'CCS 2'],
      },
      {
        operator: 'SP Group',
        location: 'IMM Building Basement',
        chargersCount: 10,
        powerKw: 50,
        plugTypes: ['Type 2', 'CCS 2'],
      },
    ],
  });
}
