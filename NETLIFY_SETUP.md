# Netlify podešavanje

## 1. Proveri plan

Pošto je nalog napravljen pre 4. septembra 2025, u Netlify kontrolnoj tabli otvori **Team settings → Billing/Usage** i proveri da li piše `Legacy Free`, `Starter` ili drugi legacy plan. Nemoj dobrovoljno prelaziti na credit-based plan dok ne uporediš limite koji su prikazani na tvom nalogu.

## 2. Napravi projekat

Folder `DEV` je pripremljen kao zaseban Git repozitorijum. Kada ga povežeš sa GitHub-om, Netlify podešavanja iz `netlify.toml` koriste:

- build command: `npm run build`
- publish directory: `dist`
- functions directory: `netlify/functions`

Alternativa preko Netlify CLI iz foldera `DEV`:

```powershell
npm install
npx netlify login
npx netlify init
npx netlify deploy --prod
```

Lokalna provera pre push-a:

```powershell
npm run check
```

Netlify koristi cross-platform `tools/build.mjs`. PowerShell build ostaje samo kao lokalna pomoćna varijanta.

## 3. Administratorski ključ

Napravi dugu nasumičnu vrednost (najmanje 32 znaka). Nemoj je upisivati u `netlify.toml`, Git ili HTML.

U Netlify UI otvori **Project configuration → Environment variables** i dodaj:

```text
RODOSLOV_ADMIN_KEY = tvoja-duga-nasumicna-vrednost
```

Ako UI nudi opciju **Contains secret values**, uključi je. Posle dodavanja promenljive uradi novi deploy da bi je Functions dobile.

CLI alternativa:

```powershell
npx netlify env:set RODOSLOV_ADMIN_KEY "tvoja-duga-nasumicna-vrednost" --secret
```

## 4. Poveži aplikaciju

U aplikaciji otvori **Meni → Netlify objave…** i unesi:

- adresu sajta, npr. `https://moj-rodoslov.netlify.app`
- istu vrednost `RODOSLOV_ADMIN_KEY`
- broj dana važenja linka (1–365)

Adresa sajta se čuva lokalno. Administratorski ključ se čuva samo u `sessionStorage` i uklanja se zatvaranjem browser sesije.

## 5. Objavi stablo

Otvori **Napravi stablo za deljenje…**, izaberi osobe i privatnost, pa kao odredište izaberi **Netlify link**. Link možeš kasnije pregledati ili povući kroz **Netlify objave…**.

## Bezbednosne napomene

- Ne šalji administratorski ključ rođacima; njima šalješ samo `/s/...` link.
- Link radi kao tajna adresa: ko ga ima može da vidi pripremljenu kopiju.
- Podrazumevano zadrži uključeno skrivanje podataka verovatno živih osoba.
- Povlačenje linka briše online kopiju, ali ne lokalno stablo.
- Trenutni backend ograničava jednu objavu na 2 MB i trajanje na najviše 365 dana.
