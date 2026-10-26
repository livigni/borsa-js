const axios = require('axios');

// Simboli Yahoo Finance usati dal cruscotto intermarket (valori del giorno)
const YAHOO_SYMBOLS = {
  'GC=F': 'Oro, future COMEX ($/oncia)',
  'DX-Y.NYB': 'Dollaro (DXY)',
  'BZ=F': 'Petrolio Brent, future ($/barile)',
  '^TNX': 'Treasury USA 10 anni (%)',
  '^FVX': 'Treasury USA 5 anni (%)',
  'BTC-USD': 'Bitcoin ($)',
  'EURUSD=X': 'Euro/dollaro',
};

// Yahoo risponde 429 a uno user agent Chrome completo, ma accetta quello corto
const headers = {
  "User-Agent": "Mozilla/5.0",
  "Accept": "application/json",
};

// Ultimo prezzo e chiusure giornaliere dall'API chart di Yahoo (non ufficiale, senza chiave)
async function getYahooChart(symbol, from) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}`;
  const params = { interval: '1d' };
  if (from) {
    params.period1 = Math.floor(new Date(from).getTime() / 1000);
    params.period2 = Math.floor(Date.now() / 1000);
  } else {
    params.range = '5d';
  }

  try {
    const response = await axios.get(url, { params, headers });
    const result = response.data.chart.result[0];
    const meta = result.meta;
    const closes = result.indicators.quote[0].close;
    const data = (result.timestamp || [])
      .map((ts, i) => ({ date: new Date(ts * 1000).toISOString().slice(0, 10), value: closes[i] }))
      .filter(row => row.value != null)
      .map(row => ({ ...row, value: Math.round(row.value * 1e4) / 1e4 }));
    return {
      currency: meta.currency,
      price: meta.regularMarketPrice,
      time: new Date(meta.regularMarketTime * 1000).toISOString(),
      data,
    };
  } catch (error) {
    console.error(`Error fetching Yahoo symbol "${symbol}":`, error.message);
    return null;
  }
}

module.exports = {
  YAHOO_SYMBOLS,
  getYahooChart,
};
