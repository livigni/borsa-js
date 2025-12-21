const express = require('express');
const path = require('path');
const scraper = require('./scraper');

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

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
