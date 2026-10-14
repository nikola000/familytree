# Pravila rada na projektu

- Aktivni projekat je ovaj `DEV` folder; ne menjati `../RSv8.html` bez izričitog zahteva.
- Pre izmene pročitati samo relevantne delove `docs/PROJECT_STATE.md`, ne celu istoriju projekta.
- Kanonski izvor su `index.html`, `src/`, `netlify/` i `tools/`; `dist/` generiše `npm run build` i nije izvor.
- Pre commita obavezno pokrenuti `npm run check`.
- Ne ugrađivati stvarne porodične podatke, administratorske ključeve niti `.env` vrednosti u kod, testove ili dokumentaciju.
- Nova instalacija mora početi svetlom temom i jednom generičkom osobom.
- Podeljeni `/s/...` prikaz je read-only; uređivanje je moguće tek posle „Sačuvaj u moja stabla“.
- Sačuvati JSON v3 kompatibilnost i automatsko upisivanje izabranih roditelja pri dodavanju deteta.
- Manje, kompatibilne izmene mogu direktno; za promenu modela podataka, sinhronizaciju ili destruktivnu migraciju prvo tražiti potvrdu.
- Posle završene faze ažurirati samo relevantne odeljke u `docs/PROJECT_STATE.md`.
