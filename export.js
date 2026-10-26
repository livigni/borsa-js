// Genera borsa.json con le serie FRED e gli storici di Borsa Italiana
// usati dal cruscotto intermarket. Uso: npm run export
const fs = require('fs');
const path = require('path');
const scraper = require('./scraper');
const fred = require('./fred');

// Titoli di Borsa Italiana da esportare: isin -> { ticker, type }
const BORSA_ITALIANA = {
  IT0005707614: { ticker: 'IT0005707614', type: 'MOT', name: 'BTP 3,15% giu 2031' },
};

const MONTHS_BACK = 13;

async function main() {
  const fromDate = new Date();
  fromDate.setMonth(fromDate.getMonth() - MONTHS_BACK);
  const from = fromDate.toISOString().slice(0, 10);

  const out = { generato: new Date().toISOString(), da: from, fred: {}, borsaitaliana: {} };

  for (const [id, title] of Object.entries(fred.FRED_SERIES)) {
    const data = await fred.getFredSeries(id, from);
    out.fred[id] = { titolo: title, ultimo: data && data.length ? data[data.length - 1] : null, dati: data || [] };
    console.log(`${id}: ${data ? data.length : 'errore'}`);
  }

  for (const [isin, { ticker, type, name }] of Object.entries(BORSA_ITALIANA)) {
    const price = await scraper.getBorsaItalianaPrice(isin, type);
    const history = (await scraper.getHistoricalData(isin, ticker)) || [];
    out.borsaitaliana[isin] = {
      nome: name,
      prezzo: price,
      dati: history
        .filter(([ts]) => ts > 0)
        .map(([ts, close]) => ({ date: new Date(ts).toISOString().slice(0, 10), value: close })),
    };
    console.log(`${isin}: prezzo ${price}, ${out.borsaitaliana[isin].dati.length} chiusure`);
  }

  const file = path.join(__dirname, 'borsa.json');
  fs.writeFileSync(file, JSON.stringify(out, null, 1));
  console.log(`Scritto ${file}`);
}

main();
