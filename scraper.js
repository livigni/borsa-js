const axios = require('axios');
const cheerio = require('cheerio');

async function getBorsaItalianaSymbols(query) {
  const url = `https://www.borsaitaliana.it/borsa/searchengine/all/json/search.html?lang=it&q=${query}`;
  const headers = {
    "sec-ch-ua-platform": "macOS",
    "X-Requested-With": "XMLHttpRequest",
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Accept": "application/json, text/javascript, */*; q=0.01",
    "sec-ch-ua": "\"Google Chrome\";v=\"131\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
    "sec-ch-ua-mobile": "?0"
  };

  try {
    const response = await axios.get(url, { headers });
    const data = response.data;
    let results = [];
    if (data.quotes && Array.isArray(data.quotes)) {
      results = data.quotes.map(item => ({
        symbol: item.symbol,
        subtype: item.subtype
      }));
    }
    return results;
  } catch (error) {
    console.error(`Error fetching symbols for query "${query}":`, error);
    return null;
  }
}

async function getBorsaItalianaPrice(isin, type) {
  let url;
  switch (type) {
    case "MOT":
      url = `https://www.borsaitaliana.it/borsa/obbligazioni/mot/btp/dati-completi.html?isin=${isin}`;
      break;
     
    case "ETF":
      url = `https://www.borsaitaliana.it/borsa/etf/dettaglio.html?isin=${isin}`;
      break;
    case "MTA":
    case "TAH":
    case "TAA":
      url = `https://www.borsaitaliana.it/borsa/azioni/dati-completi.html?isin=${isin}`;
      break;
    default:
      console.error("Invalid type: " + type);
      return null;
  }

  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const priceText = $('main section div:nth-child(4) div:nth-child(1) article div div div:nth-child(2) div span:nth-child(1) strong').text();
    if (priceText) {
      return parseFloat(priceText.replace(',', '.'));
    }
    return 0;
  } catch (error) {
    console.error(`Error fetching price for isin "${isin}":`, error);
    return 0;
  }
}

async function getHistoricalData(isin, ticker) {
  console.log(`Fetching historical data for isin: ${isin}, ticker: ${ticker}`);
  const url = "https://charts.borsaitaliana.it/charts/services/ChartWService.asmx/GetPrices";
  const headers = {
    "accept": "application/json, text/javascript, */*; q=0.01",
    "accept-language": "it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7",
    "content-type": "application/json; charset=UTF-8",
    "x-requested-with": "XMLHttpRequest",
  };

  const symbols = await getBorsaItalianaSymbols(isin);
  console.log('Symbols found:', symbols);

  let key = "";
  if (symbols && symbols.length > 0) {
    const subtype = symbols[0].subtype;
    console.log('Subtype found:', subtype);
    if (subtype === "MOT") {
      key = isin + ".MOT";
    } else if (subtype === "MTA" || subtype === "TAH" || subtype === "TAA") {
      key = ticker + ".MTA";
    } else if (subtype === "ETF") {
      key = ticker + ".ETF";
    } else {
      key = ticker + ".???";
      console.error("key error: unknown subtype");
    }
  } else {
    console.error("error getting symbols");
    return;
  }

  console.log(`Generated key: ${key}`);

  const data = {
    "request": {
      "SampleTime": "1d",
      "TimeFrame": "5y",
      "RequestedDataSetType": "ohlc",
      "ChartPriceType": "price",
      "Key": key,
      "OffSet": 0,
      "FromDate": null,
      "ToDate": null,
      "UseDelay": false,
      "KeyType": "Topic",
      "KeyType2": "Topic",
      "Language": "it-IT",
    }
  };

  try {
    const response = await axios.post(url, data, { headers });
    const result = response.data.d.map(row => [row[0], row[1]]);
    if (result.length === 0) {
      console.log(`No historical data found for ${ticker}/${isin}, returning default value...`);
      return [[0, 0]];
    }
    return result;
  } catch (error) {
    console.error(`Error fetching historical data for ${ticker}/${isin}:`, error);
    return [[0, 0]];
  }
}

module.exports = {
  getBorsaItalianaSymbols,
  getBorsaItalianaPrice,
  getHistoricalData,
};
