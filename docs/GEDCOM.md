# GEDCOM podrška

Rodoslov uvozi tekstualne GEDCOM fajlove verzije 5.5, 5.5.1 i 7.x (`.ged` ili `.gedcom`) kodirane kao UTF-8. ANSEL se namerno odbija uz poruku da fajl treba ponovo izvesti kao UTF-8. Izvoz je GEDCOM 5.5.1 sa UTF-8 kodiranjem radi kompatibilnosti sa većim brojem postojećih programa.

## Podržani podaci

- osobe: `INDI`, glavno i alternativna imena (`NAME`, `GIVN`, `SURN`, `NICK`) i pol (`SEX`);
- rođenje i smrt: tekst datuma iz `BIRT.DATE` i `DEAT.DATE`;
- jedno mesto po osobi: prvo mesto rođenja, zatim prebivalište, pa mesto smrti (`PLAC`);
- napomene sa nastavcima `CONT`/`CONC`;
- porodice, partneri i najviše dva roditelja (`FAM`, `HUSB`, `WIFE`, `CHIL`, `FAMC`);
- slava kroz prilagođenu GEDCOM oznaku `_SLAVA`.

## Svesna ograničenja

Trenutni JSON v3 model nema posebna polja za izvore i citate, medije, adrese, zanimanja, više mesta/događaja, datum braka, vrstu roditeljstva niti proizvoljan broj roditelja. Ti podaci se pri uvozu ne preslikavaju u napomenu i ne izmišljaju se. Uvoz prijavljuje oznake koje je preskočio. GEDZIP arhive i ANSEL kodiranje još nisu podržani.

JSON ostaje potpuna rezervna kopija aplikacije; GEDCOM služi za razmenu osnovnih genealoških podataka sa drugim programima.
