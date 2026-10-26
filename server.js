const express = require('express');
const path = require('path');
const scraper = require('./scraper');
const fred = require('./fred');
const yahoo = require('./yahoo');

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname)));

app.get('/api/symbols/:query', async (req, res) => {
  const query = req.params.query;
  const symbols = await scraper.getBorsaItalianaSymbols(query);
  res.json(symbols);
});

app.get('/api/price/:isin/:type', async (req, res) => {
  const isin = req.params.isin;
  const type = req.params.type;
  const price = await scraper.getBorsaItalianaPrice(isin, type);
  res.json({ price });
});

app.get('/api/historical/:isin/:ticker', async (req, res) => {
  const isin = req.params.isin;
  const ticker = req.params.ticker;
  const data = await scraper.getHistoricalData(isin, ticker);
  res.json(data);
});

app.get('/api/fred', (req, res) => {
  res.json(fred.FRED_SERIES);
});

app.get('/api/fred/:series', async (req, res) => {
  const series = req.params.series;
  const data = await fred.getFredSeries(series, req.query.from);
  if (!data) {
    return res.status(502).json({ error: `FRED series "${series}" not available` });
  }
  res.json(data);
});

app.get('/api/yahoo', (req, res) => {
  res.json(yahoo.YAHOO_SYMBOLS);
});

app.get('/api/yahoo/:symbol', async (req, res) => {
  const symbol = req.params.symbol;
  const data = await yahoo.getYahooChart(symbol, req.query.from);
  if (!data) {
    return res.status(502).json({ error: `Yahoo symbol "${symbol}" not available` });
  }
  res.json(data);
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
