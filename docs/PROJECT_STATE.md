# Stanje projekta

Poslednje ažuriranje: 14. oktobar 2026.

## Cilj

Samostalna web aplikacija za pravljenje, proveru, čuvanje i kontrolisano deljenje porodičnih stabala. Glavni podaci su lokalni u browseru; Netlify služi aplikaciju i vremenski ograničene read-only kopije.

## Arhitektura

- `index.html` — razvojni HTML omotač.
- `src/js/00-family-data.js` — čist model, validacija, migracija i normalizovana ćirilično-latinična pretraga.
- `src/js/01-core.js` — stanje stabla, indeksi, generacije i SVG raspored.
- `src/js/01-tree-library.js` — više lokalnih stabala i uvoz podeljene kopije.
- `src/js/02-storage.js` — lokalne verzije, statistika, tabela i render ciklus.
- `src/js/03-shell-ui.js` do `11-io-bootstrap.js` — UI, akcije, veze, deljenje, srodstvo, štampa i pokretanje.
- `netlify/functions/` — objava, čitanje i upravljanje deljenim stablima preko Netlify Blobs.
- `tools/build.mjs` — spaja module u `dist/index.html` i `dist/RSv9-dev.html`.
- `tests/` — testovi modela i simulirani browser UI testovi (`jsdom`).

Kod je modularan po fajlovima, ali browser moduli namerno dele globalno stanje. Ne uvoditi framework bez konkretnog razloga. Ako se uvedu nalozi i sinhronizacija, tada odvojiti domain, storage/share servise i UI kontrolere.

## Trenutno ponašanje

- JSON format je verzija 3 sa eksplicitnim roditeljima; v2 se migrira.
- Nova instalacija: svetla tema, „Moje porodično stablo“, jedna „Nova osoba“.
- Postojeća stabla, tema i verzije ostaju u `localStorage` konkretnog origin-a/browsera.
- Pretraga imena i prezimena radi između srpske ćirilice i latinice, uključujući česte oblike bez dijakritike.
- Podeljeni link je read-only. Dugme „Sačuvaj u moja stabla“ pravi nezavisnu lokalnu kopiju i sprečava ponovni uvoz istog linka.
- Netlify objave zahtevaju `RODOSLOV_ADMIN_KEY`, ograničene su na 2 MB i najviše 365 dana.
- Važeći produkcioni sajt: `https://porodicnostablo.netlify.app/`.

## Provera

Iz `DEV` foldera:

```powershell
npm install
npm run check
```

`npm run check` prvo pravi build, zatim pokreće testove modela i UI regresione testove. Pre objave oba moraju proći.

## Privatnost i Git

- `main` istorija je 14. oktobra 2026. očišćena i ponovo započeta privacy-safe commitom.
- U repozitorijum ne vraćati stvarna imena ili porodični seed čak ni kao test fixture.
- Stari klonovi, ranije sačuvani commit URL-ovi i već napravljeni Netlify deploy/link mogu postojati van aktuelne Git istorije; korisnik njima upravlja kroz GitHub/Netlify.
- `RODOSLOV_ADMIN_KEY` postoji samo u Netlify environment variables i korisnikovom `sessionStorage`.

## Sledeće faze

1. Onboarding: „Napravi novo stablo“ / „Uvezi postojeće“, ime prve osobe i objašnjenje lokalnog čuvanja.
2. Upravljanje deljenjem: automatsko čišćenje isteklih zapisa, produženje roka i pregled prostora; zatim opciona lozinka i QR kod.
3. GEDCOM: prvo dokumentovati podržani podskup, zatim uvoz, test fixtures i izvoz.
4. Bogatiji podaci: događaji, izvori, alternativna imena i duplikati.
5. Nalozi/sinhronizacija samo kao posebna, unapred odobrena promena arhitekture.

## Važne odluke

- Lokalna biblioteka ostaje osnovni način rada; deljeni link nije zajednički editor.
- Podeljena kopija ne sinhronizuje naknadne izmene originala.
- Node build je kanonski za lokalni rad i Netlify; PowerShell skripte su samo pomoćne.
- `dist/` se ne commit-uje jer ga Netlify generiše.
