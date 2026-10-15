# UI smernice i plan

## Cilj

Interfejs treba da ostane miran, brz i razumljiv na telefonu i računaru. Ikone pomažu prepoznavanju, ali tekst ostaje uz sve akcije osim univerzalnih komandi kao što su zatvaranje, zoom, undo/redo i strelice redosleda.

## Kontrole

- Binarne postavke koriste nativni checkbox stilizovan kao prekidač: godine, patronimik, zaštita živih osoba i napomene.
- Izbor jedne od 2–4 vrednosti koristi nativnu radio-grupu stilizovanu kao segmentirana dugmad.
- Broj generacija koristi `− / broj / + / Sve`; slider se ne koristi jer mora da podrži preciznu vrednost i „Sve“.
- Vrsta dijagrama (`Standardno`, `Peščani sat`, `Lepeza`) odvojena je od obima standardnog prikaza (`Sve`, `Porodica`, `Potomci`, `Preci`).
- Ređe opcije mogu da budu u sekciji „Napredno“, ali trenutno izabrana vrednost mora ostati vidljiva.

## Panel osobe

Tri primarne akcije su `Dodaj`, `Podaci` i `Fokus`. Sekundarne su `Veze`, `Redosled`, `Srodstvo` i `Idi na`. Retke ili opasne akcije ostaju u `Više`: skupljanje potomaka, označavanje ogranka, loza po ocu, spajanje duplikata i brisanje.

Panel je responzivni donji inspector, ne draggable bottom sheet, da se ne sukobljava sa pan/pinch gestovima stabla. Na telefonu dodirne mete ciljaju najmanje 44 px.

## Redosled porodice

Redosled se uređuje u jednom dijalogu sa pregledom braće/sestara i partnera. Strelice ostaju osnovna kontrola zbog tastature i preciznosti; drag-and-drop se može dodati samo kao pomoćna mogućnost.

## Generacije

- Broj dostupnih generacija računa se iz stvarnih predaka i potomaka izabrane osobe; nema fiksnog maksimuma za standardni prikaz i peščani sat.
- „Sve“ prikazuje i izračunatu dubinu, a minus iz tog režima polazi od najveće stvarne dubine.
- Lepeza ostaje na najviše osam prstenova jer svaki prsten udvostručava broj segmenata i iznad toga prestaje da bude čitljiva.
- Izabrana osoba zauzima unutrašnji polukružni segment lepeze, umesto zasebne pravougaone kartice, tako da svi nivoi čine jednu mirnu geometrijsku celinu.
- Poznati preci u lepezi prikazuju ime i prezime u odvojenim redovima; svaki red se zasebno skraćuje i ostaje unutar svog segmenta.

## Veze u peščanom satu

- Dva prikazana roditelja povezuju se kao roditeljski par, a iz sredine njihove veze izlazi jedna zajednička grana koja se račva ka zajedničkoj deci.
- Svako partnerstvo koristi svoju diskretnu boju za partnersku liniju, porodični čvor i grane dece; struktura ostaje razumljiva i bez boje.
- Kada je prikazan samo jedan eksplicitni roditelj, dete dobija jednu neutralnu direktnu porodičnu granu. Prikaz nikada ne izvodi roditeljstvo iz samog partnerstva.

## Deljenje i pomoćne alatke

- Deljenje je istaknuta akcija, sa Netlify linkom kao prvim odredištem.
- Kada link nastane, aplikacija odmah pokušava da otvori sistemski Share panel dok korisnički gest još važi. Dugme „Podeli preko aplikacije“ ostaje pouzdana rezerva; ako API nije podržan, link se kopira.
- Administratorski ključ ostaje zaštita od javnog neograničenog uploada, ali korisnik može izabrati da ga browser zapamti samo na tom uređaju.
- Upravljanje postojećim objavama ostaje neposredno uz akciju deljenja.
- Fajl/izvoz i štampa/provera su sklopljene grupe jer se koriste ređe od prikaza i deljenja.

## Ikone

Ikone su interni SVG sprite (`20×20`, `stroke=currentColor`), bez fonta, CDN-a ili spoljne biblioteke. Kada stoje uz tekst imaju `aria-hidden=true`; ikonice bez teksta moraju imati `aria-label` i `title`.

Planirani simboli: dodavanje osobe, olovka/podaci, veza, meta/fokus, putanja/srodstvo, redosled, navigacija, spajanje, štit/privatnost, deljenje, izvoz, brisanje, teme, peščani sat i lepeza.

## Tipografija

Osnovni interfejs koristi sistemski varijabilni sans-serif (`Segoe UI Variable Text`, `Aptos`, pa sistemski fallback), bez spoljnog font servisa. Tako aplikacija ostaje brza i privatna, a tekst je mirniji i čitljiviji na Windowsu i telefonu. Tema karata zadržava serifni karakter.

## Pristupačnost

- Menu dugmad koriste `aria-haspopup`, `aria-expanded` i vraćaju fokus po zatvaranju.
- Popup meni podržava Escape, strelice, Home/End, Enter i Space.
- Rezultati pretrage podržavaju strelice gore/dole, Enter za izbor i Escape za zatvaranje, dok fokus ostaje u polju za unos.
- Radio-grupe i checkbox kontrole ostaju nativni inputi ispod vizuelnog stila.
- Fokus mora biti jasno vidljiv u svim temama.
- Boja nikada nije jedini indikator stanja.

## Sledeći UI zahvati

1. Dosledno primeniti isti sistem kontrola u onboarding, deljenje i Netlify dijalozima.
2. Dodati opcionu kompaktnu gustinu za velike ekrane.
3. Uskladiti tabelu sa novim ikonama i jasnijim bulk toolbarom.
4. Dodati testove tastaturne navigacije kroz sve popup menije.
5. Posle stabilizacije izdvojiti zajedničke funkcije za dugmad, menije i SVG ikone, bez uvođenja frameworka.
