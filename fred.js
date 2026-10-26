const axios = require('axios');

// Serie FRED usate dal cruscotto intermarket
const FRED_SERIES = {
  DGS5: 'Treasury USA 5 anni (giornaliero)',
  DGS10: 'Treasury USA 10 anni (giornaliero)',
  GS5: 'Treasury USA 5 anni (media mensile)',
  IRLTLT01DEM156N: 'Bund 10 anni (mensile)',
  IRLTLT01ITM156N: 'BTP 10 anni (mensile)',
  DCOILBRENTEU: 'Petrolio Brent ($/barile)',
  DTWEXBGS: 'Dollaro, indice ampio ponderato',
  CPIAUCSL: 'CPI USA (indice)',
  DFEDTARU: 'Tassi Fed, tetto della forchetta',
  ECBDFR: 'Tasso depositi BCE',
  CBBTCUSD: 'Bitcoin (Coinbase, $)',
};

// Scarica una serie dal CSV pubblico di FRED (non serve una API key)
async function getFredSeries(id, from) {
  const params = { id };
  if (from) params.cosd = from;

  try {
    const response = await axios.get('https://fred.stlouisfed.org/graph/fredgraph.csv', { params, responseType: 'text' });
    const lines = response.data.trim().split('\n').slice(1);
    // FRED segna i giorni senza dato con "." o con una cella vuota
    return lines
      .map(line => line.split(','))
      .filter(([, value]) => value && value !== '.')
      .map(([date, value]) => ({ date, value: parseFloat(value) }));
  } catch (error) {
    console.error(`Error fetching FRED series "${id}":`, error.message);
    return null;
  }
}

module.exports = {
  FRED_SERIES,
  getFredSeries,
};
