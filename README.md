# DEV verzija rodoslova

Kratka pravila za budući rad nalaze se u `AGENTS.md`, a trenutno stanje, arhitektura, odluke i roadmap u `docs/PROJECT_STATE.md`. Time buduće sesije ne moraju da rekonstruišu projekat iz istorije razgovora.

Ovaj folder je modularna razvojna verzija aplikacije. Stabilni `../RSv8.html` se ne menja kada se radi u ovom folderu.

## Struktura

- `index.html` — razvojna stranica koja učitava odvojene CSS/JS fajlove.
- `src/styles/app.css` — stilovi.
- `src/js/00-family-data.js` — testabilan model, validacija, v2→v3 migracija i serijalizacija.
- `src/js/01-core.js` — model, indeksi, pravila generacija i SVG raspored.
- `src/js/02-storage.js` — backup stanje, renderovanje i istorija izmena.
- `src/js/03-shell-ui.js` — meniji, drawer, modal i Undo/Redo kontrole.
- `src/js/04-people-actions.js` — izmene osoba i veza.
- `src/js/05-input-search.js` — unos, zoom i pretraga.
- `src/js/06-table.js` — tabela.
- `src/js/07-bulk-actions.js` — masovne izmene i tema.
- `src/js/08-links.js` — povezivanje postojećih osoba.
- `src/js/09-sharing.js` — izdvajanje stabla za deljenje.
- `src/js/10-kinship-print.js` — srodstvo, provere i štampa.
- `src/js/11-io-bootstrap.js` — uvoz, izvoz i pokretanje aplikacije.
- `src/js/12-pwa.js` i `pwa/` — instalacija, offline rad, manifest i ikone aplikacije.
- `dist/RSv9-dev.html` — izgrađena samostalna verzija.

## Build

Iz foldera projekta pokrenuti:

```powershell
npm run build
```

Ako komandu pokrećeš iz glavnog foldera, prvo pređi u `DEV` sa `cd .\DEV`.

## Testovi

```powershell
node .\DEV\tests\family-data.test.js
```

Za ponovno pravljenje DEV strukture iz stabilnog `RSv8.html` koristi se `setup-dev.ps1`. To prepisuje DEV izvorne module i zato ga ne treba pokretati nakon ručnih DEV izmena.

DEV koristi JSON verziju 3 sa eksplicitno upisanim roditeljima. Uvoz verzije 2 je podržan i automatski se migrira; tok dodavanja deteta ostaje isti i oba izabrana roditelja upisuju se automatski.

## Zaštita podataka

- Glavno stablo se i dalje automatski čuva u `localStorage`.
- Pre značajnih izmena pravi se automatska verzija, najviše jednom u tri minuta.
- Čuva se poslednjih 10 verzija; mogu se pregledati, vratiti, izvesti ili obrisati iz menija „Prethodne verzije”.
- Pre vraćanja stare verzije trenutno stanje se čuva kao nova sigurnosna kopija.
- Deljenje može automatski ukloniti godine, mesta i napomene verovatno živih osoba.
- Dugmad ‹ i › vode kroz istoriju posećenih osoba, a meni „Idi na” otvara njihove roditelje, partnere i decu.
- „Stabla i prostor” upravlja sa više odvojenih lokalnih stabala, prikazuje veličinu podataka i verzija i, kada browser podržava, procenu ukupne kvote origin-a.
- Deljenje iz trenutnog prikaza ili izbora može napraviti i novo lokalno stablo u biblioteci.
- Netlify Functions i Blobs podrška može napraviti vremenski ograničen link i kasnije ga povući; podešavanje je opisano u `NETLIFY_SETUP.md`.
