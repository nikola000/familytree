# Stanje projekta

Poslednje ažuriranje: 15. oktobar 2026.

## Cilj

Samostalna web aplikacija za pravljenje, proveru, čuvanje i kontrolisano deljenje porodičnih stabala. Glavni podaci su lokalni u browseru; Netlify služi aplikaciju i vremenski ograničene read-only kopije.

## Arhitektura

- `index.html` — razvojni HTML omotač.
- `src/js/00-family-data.js` — čist model, validacija, migracija i normalizovana ćirilično-latinična pretraga.
- `src/js/01-core.js` — stanje stabla, indeksi, generacije i SVG raspored.
- `src/js/01-tree-library.js` — više lokalnih stabala i uvoz podeljene kopije.
- `src/js/02-storage.js` — lokalne verzije, statistika, tabela i render ciklus.
- `src/js/03-ui-controls.js` — pristupačne vizuelne kontrole koje sinhronizuju postojeće opcije prikaza.
- `src/js/03-shell-ui.js` do `11-io-bootstrap.js` — UI, akcije, veze, deljenje, srodstvo, štampa i pokretanje.
- `netlify/functions/` — objava, čitanje i upravljanje deljenim stablima preko Netlify Blobs.
- `tools/build.mjs` — spaja module u `dist/index.html` i `dist/RSv9-dev.html`.
- `tests/` — testovi modela i simulirani browser UI testovi (`jsdom`).

Kod je modularan po fajlovima, ali browser moduli namerno dele globalno stanje. Ne uvoditi framework bez konkretnog razloga. Ako se uvedu nalozi i sinhronizacija, tada odvojiti domain, storage/share servise i UI kontrolere.

## Trenutno ponašanje

- JSON format je verzija 3 sa eksplicitnim roditeljima; v2 se migrira.
- Nova instalacija prikazuje izbor novog stabla ili JSON uvoza, unos prve osobe i objašnjenje lokalnog čuvanja; početna tema je „Porodični album“, dok je prethodna svetla tema dostupna kao „Klasična“.
- Postojeća stabla, tema i verzije ostaju u `localStorage` konkretnog origin-a/browsera.
- Pretraga imena i prezimena radi između srpske ćirilice i latinice, uključujući česte oblike bez dijakritike; rezultati se mogu birati strelicama i tasterom Enter.
- Podeljeni link je read-only. Dugme „Sačuvaj u moja stabla“ pravi nezavisnu lokalnu kopiju i sprečava ponovni uvoz istog linka.
- Fokusirani SVG prikazi „Peščani sat“ i „Lepeza predaka“ koriste izabranu osobu kao centar, imaju ograničenje generacija, zoom/pan i rade i u read-only podeljenom prikazu. Peščani sat vodi zasebnu putanju od roditeljskog para do jednog deteta, a zajedničku razgranatu sabirnicu koristi samo kada par ima više prikazane dece; paralelni koridori i pozadinska kontura sprečavaju vizuelno spajanje različitih porodica. Centar lepeze je unutrašnji polukružni segment iste geometrije kao prstenovi.
- JSON v3 opciono čuva alternativna imena u `aliases`; ona ulaze u pretragu i deljene kopije. Redosled partnera prati ručno promenljiv redosled postojećeg `unions` niza.
- GEDCOM uvoz prihvata tekstualne 5.5, 5.5.1 i 7.x UTF-8 fajlove, a izvoz pravi široko kompatibilan GEDCOM 5.5.1 UTF-8. Podržani podskup i svesna ograničenja su u `docs/GEDCOM.md`; JSON ostaje potpuna rezervna kopija.
- Dijalog deljenja pre objave prikazuje pregled verovatno živih osoba i tačno opisuje koje godine, mesta i napomene će biti izostavljene.
- Ručno spajanje duplikata čuva jedinstvene podatke i veze, nudi izbor konfliktnih polja, pravi prethodnu verziju i blokira rizična spajanja predaka, partnera ili više od dva roditelja.
- Netlify objave zahtevaju `RODOSLOV_ADMIN_KEY`, ograničene su na 2 MB i najviše 365 dana. Ključ može važiti samo tokom sesije ili, uz izričit izbor, ostati u lokalnom skladištu tog uređaja; nikada ne ulazi u deljeni link. Upravljački pregled prikazuje prostor i rokove, omogućava otvaranje, sistemsko deljenje, kopiranje, QR kod, produženje i povlačenje linka; istekli zapisi se čiste pri otvaranju pregleda.
- Opcije prikaza koriste prekidače za binarne vrednosti, segmentirane izbore za male skupove i steper čiji maksimum prati stvarnu dubinu predaka i potomaka. Panel izabrane osobe razdvaja glavne i pomoćne akcije, a zajednički dijalog upravlja redosledom braće/sestara i partnera. Fajl i štampa su sklopljene grupe; deljenje prvo nudi Netlify link, pa sistemski Share panel podržanog uređaja. Odluke i naredne UI ideje vode se u `docs/UI_DESIGN.md`.
- PDF izvoz pravi direktno preuzimljiv dokument bez spoljnog servisa, sa velikom stranicom za pregled ili A3/A4 formatom i izborom 220/300 dpi. Svi dijalozi koriste zajedničko zaglavlje, footer, zatvaranje i upravljanje fokusom, a onboarding jasnije objašnjava lokalno i offline čuvanje.
- Produkcioni build je instalabilni PWA sa verzionisanim offline kešom, 192/512 PNG ikonama, zasebnom maskable ikonom, Apple touch ikonom i faviconom. Lokalno pregledanje i uređivanje radi bez mreže posle prvog učitavanja; Netlify objave i novi deljeni linkovi namerno ostaju mrežne funkcije i `/s/...` odgovori se ne keširaju kao lokalna aplikacija.
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
- `RODOSLOV_ADMIN_KEY` postoji u Netlify environment variables; browser ga čuva u `sessionStorage`, ili opciono u `localStorage` samo kada korisnik uključi „Zapamti ključ na ovom uređaju“.

## Sledeće faze

1. GEDCOM: opciono dodati ANSEL/GEDZIP i bogatiji model događaja/izvora.
2. Deljenje: opciona zaštita linka lozinkom.
3. Bogatiji podaci: događaji, izvori i citati.
4. Nalozi/sinhronizacija samo kao posebna, unapred odobrena promena arhitekture.

## Važne odluke

- Lokalna biblioteka ostaje osnovni način rada; deljeni link nije zajednički editor.
- Podeljena kopija ne sinhronizuje naknadne izmene originala.
- Kod složenih partnerstava peščani sat prikazuje dete jednom, povezano samo sa eksplicitnim roditeljima iz njegovog `parents` niza; partner bez zajedničkog deteta prikazuje se uz osobu bez izvedene roditeljske veze.
- Lepeza čuva binarne slotove za nepoznate pretke, tako da očinska i majčinska strana ostaju na stabilnim polovinama prikaza.
- Spajanje duplikata nikada se ne pokreće automatski; korisnik bira glavnu karticu, mogući duplikat i vrednost svakog konfliktnog polja.
- Node build je kanonski za lokalni rad i Netlify; PowerShell skripte su samo pomoćne.
- `dist/` se ne commit-uje jer ga Netlify generiše.
