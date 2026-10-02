/**
 * Endpoint for HDB Carpark Information
 * Source: https://data.gov.sg/api/action/datastore_search?resource_id=d_23f946fa557947f93a8043bbef41dd09
 */

export default async function handler(req, res) {
  const datasetId = 'd_23f946fa557947f93a8043bbef41dd09';
  const limit = req.query?.limit || 50;

  try {
    const url = `https://data.gov.sg/api/action/datastore_search?resource_id=${datasetId}&limit=${limit}`;
    const resp = await fetch(url, {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(6000),
    });

    if (resp.ok) {
      const json = await resp.json();
      if (json.success && json.result) {
        return res.status(200).json({
          source: 'datagovsg_live',
          total: json.result.total || json.result.records?.length || 0,
          records: json.result.records || [],
        });
      }
    }
  } catch (err) {
    console.warn('[ParkSG API] data.gov.sg HDB fetch error:', err.message);
  }

  // Fallback representative HDB records
  return res.status(200).json({
    source: 'fallback_cache',
    total: 3,
    records: [
      {
        car_park_no: 'JLD135',
        address: 'BLK 135 JURONG GATEWAY ROAD',
        car_park_type: 'MULTI-STOREY CAR PARK',
        type_of_parking_system: 'ELECTRONIC PARKING SYSTEM',
        short_term_parking: 'WHOLE DAY',
        free_parking: 'SUN & PH FR 7AM-10.30PM',
        night_parking: 'YES',
        car_park_decks: 5,
        gantry_height: 2.15,
        car_park_basement: 'N',
      },
      {
        car_park_no: 'SEAHIM',
        address: 'SEAH IM ROAD SURFACE CARPARK',
        car_park_type: 'SURFACE CAR PARK',
        type_of_parking_system: 'ELECTRONIC PARKING SYSTEM',
        short_term_parking: 'WHOLE DAY',
        free_parking: 'NO',
        night_parking: 'YES',
        car_park_decks: 1,
        gantry_height: 4.5,
        car_park_basement: 'N',
      },
      {
        car_park_no: 'ORCH01',
        address: 'ORCHARD ROAD VICINITY MULTI-STOREY',
        car_park_type: 'BASEMENT CAR PARK',
        type_of_parking_system: 'ELECTRONIC PARKING SYSTEM',
        short_term_parking: 'WHOLE DAY',
        free_parking: 'NO',
        night_parking: 'YES',
        car_park_decks: 3,
        gantry_height: 1.9,
        car_park_basement: 'Y',
      },
    ],
  });
}
