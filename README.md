# Borsa Italiana Scraper

Questo progetto fornisce una serie di funzioni JavaScript per effettuare lo scraping di dati dal sito di Borsa Italiana. Include un server Express di esempio per esporre queste funzioni come API e una pagina HTML per testarle.

## Funzionalità

Le principali funzioni di scraping implementate in `scraper.js` sono:

- `getBorsaItalianaSymbols(query)`: Cerca un ISIN o un ticker e restituisce i simboli corrispondenti.
- `getBorsaItalianaPrice(isin, type)`: Ottiene il prezzo attuale di uno strumento finanziario.
- `getHistoricalData(isin, ticker)`: Recupera i dati storici (prezzo di chiusura giornaliero) per uno strumento finanziario.

## Installazione

Per utilizzare questo progetto, è necessario avere Node.js e npm installati.

1.  Clona il repository:
    ```bash
    git clone <URL_DEL_TUO_REPOSITORY>
    ```
2.  Entra nella directory del progetto:
    ```bash
    cd borsa-js
    ```
3.  Installa le dipendenze:
    ```bash
    npm install
    ```

## Utilizzo

Per avviare il server di esempio, esegui il seguente comando dalla directory `borsa-js`:

```bash
npm start
```

Il server si avvierà su `http://localhost:3000`.

Apri il tuo browser e naviga su `http://localhost:3000` per accedere alla pagina di test (`index.html`). Da qui potrai interagire con le API per ottenere prezzi e dati storici.

## API

Il server (`server.js`) espone i seguenti endpoint:

- **GET /api/symbols/:query**
  - Recupera i simboli per un dato ISIN o ticker.
  - `:query`: La stringa di ricerca.

- **GET /api/price/:isin/:type**
  - Ottiene il prezzo attuale per un dato ISIN e tipo di strumento.
  - `:isin`: L'ISIN dello strumento.
  - `:type`: Il tipo di strumento (es. `MOT`, `MTA`, `ETF`).

- **GET /api/historical/:isin/:ticker**
  - Recupera i dati storici.
  - `:isin`: L'ISIN dello strumento.
  - `:ticker`: Il ticker dello strumento.
