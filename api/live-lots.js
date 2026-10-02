/**
 * Endpoint for Live Carpark Lots (HDB + LTA + URA)
 * Source: https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2
 */

export default async function handler(req, res) {
  const govAccountKey = process.env.GOV_ACCOUNT_KEY || process.env.LTA_DATAMALL_KEY || '';

  try {
    if (govAccountKey && govAccountKey !== 'MY_LTA_DATAMALL_KEY') {
      const resp = await fetch('https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2', {
        headers: {
          AccountKey: govAccountKey,
          accept: 'application/json',
        },
        signal: AbortSignal.timeout(6000),
      });

      if (resp.ok) {
        const data = await resp.json();
        return res.status(200).json({
          source: 'datamall2_live',
          count: data.value ? data.value.length : 0,
          value: data.value || [],
        });
      }
    }
  } catch (error) {
    console.warn('[ParkSG API] LTA CarParkAvailabilityv2 live fetch error:', error.message);
  }

  // Fallback high-fidelity sample records for key hubs (Orchard, Marina, HarbourFront, Jurong Lake)
  return res.status(200).json({
    source: 'fallback_cache',
    note: govAccountKey ? 'LTA server responded with error, serving cached data' : 'GOV_ACCOUNT_KEY not set yet, serving fallback data',
    count: 14,
    value: [
      {
        CarParkID: 'orchard-ion',
        Area: 'Orchard',
        Development: 'ION Orchard',
        Location: '1.3040 103.8318',
        AvailableLots: 38,
        LotType: 'C',
        Agency: 'LTA',
      },
      {
        CarParkID: 'orchard-wisma',
        Area: 'Orchard',
        Development: 'Wisma Atria',
        Location: '1.3038 103.8333',
        AvailableLots: 124,
        LotType: 'C',
        Agency: 'LTA',
      },
      {
        CarParkID: 'orchard-takashimaya',
        Area: 'Orchard',
        Development: 'Ngee Ann City (Takashimaya)',
        Location: '1.3025 103.8344',
        AvailableLots: 285,
        LotType: 'C',
        Agency: 'LTA',
      },
      {
        CarParkID: 'orchard-paragon',
        Area: 'Orchard',
        Development: 'Paragon Shopping Centre',
        Location: '1.3039 103.8358',
        AvailableLots: 8,
        LotType: 'C',
        Agency: 'LTA',
      },
      {
        CarParkID: 'marina-mbs',
        Area: 'Marina',
        Development: 'Marina Bay Sands',
        Location: '1.2834 103.8607',
        AvailableLots: 42,
        LotType: 'C',
        Agency: 'LTA',
      },
      {
        CarParkID: '1',
        Area: 'Marina',
        Development: 'Suntec City',
        Location: '1.29375 103.85718',
        AvailableLots: 840,
        LotType: 'C',
        Agency: 'LTA',
      },
      {
        CarParkID: '2',
        Area: 'Marina',
        Development: 'Marina Square',
        Location: '1.29115 103.85728',
        AvailableLots: 512,
        LotType: 'C',
        Agency: 'LTA',
      },
      {
        CarParkID: '4',
        Area: 'Marina',
        Development: 'The Esplanade',
        Location: '1.29011 103.85561',
        AvailableLots: 412,
        LotType: 'C',
        Agency: 'LTA',
      },
      {
        CarParkID: '5',
        Area: 'Marina',
        Development: 'Millenia Singapore',
        Location: '1.29251 103.86009',
        AvailableLots: 310,
        LotType: 'C',
        Agency: 'LTA',
      },
      {
        CarParkID: 'hf-vivocity',
        Area: 'HarbourFront',
        Development: 'VivoCity',
        Location: '1.2642 103.8223',
        AvailableLots: 19,
        LotType: 'C',
        Agency: 'LTA',
      },
      {
        CarParkID: 'hf-centre',
        Area: 'HarbourFront',
        Development: 'HarbourFront Centre',
        Location: '1.2647 103.8202',
        AvailableLots: 390,
        LotType: 'C',
        Agency: 'LTA',
      },
      {
        CarParkID: 'jld-jem',
        Area: 'JurongLake',
        Development: 'JEM Shopping Mall',
        Location: '1.3331 103.7436',
        AvailableLots: 31,
        LotType: 'C',
        Agency: 'LTA',
      },
      {
        CarParkID: 'jld-westgate',
        Area: 'JurongLake',
        Development: 'Westgate Carpark',
        Location: '1.3340 103.7425',
        AvailableLots: 145,
        LotType: 'C',
        Agency: 'LTA',
      },
      {
        CarParkID: 'jld-imm',
        Area: 'JurongLake',
        Development: 'IMM Building',
        Location: '1.3349 103.7468',
        AvailableLots: 520,
        LotType: 'C',
        Agency: 'LTA',
      },
    ],
  });
}
