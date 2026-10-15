/* instalacija i stanje offline aplikacije */
let pwaPrompt=null;
const pwaStandalone=()=>typeof matchMedia==="function"&&matchMedia("(display-mode: standalone)").matches||navigator.standalone===true;
function pwaStatus(){
 const status=$("pwa-status"),button=$("dpwa");if(!status||!button)return;
 if(pwaStandalone()){status.textContent="Aplikacija je instalirana i spremna za rad bez interneta.";button.hidden=true;return}
 status.textContent=navigator.onLine===false?"Offline režim je aktivan; lokalna stabla i uređivanje ostaju dostupni.":"Posle prvog učitavanja aplikacija i lokalna stabla rade i bez interneta.";
 button.hidden=false
}
window.addEventListener("beforeinstallprompt",event=>{event.preventDefault();pwaPrompt=event;pwaStatus()});
window.addEventListener("appinstalled",()=>{pwaPrompt=null;pwaStatus();msg("Rodoslov je instaliran")});
window.addEventListener("online",pwaStatus);window.addEventListener("offline",pwaStatus);
$("dpwa").onclick=async()=>{
 openDrawer(false);
 if(pwaPrompt){const prompt=pwaPrompt;pwaPrompt=null;await prompt.prompt();const choice=await prompt.userChoice;if(choice.outcome!=="accepted")pwaStatus();return}
 const apple=/iphone|ipad|ipod/i.test(navigator.userAgent||"");
 openModal("Instaliraj Rodoslov",`<div class="pwa-ready"><b>Aplikacija je spremna za offline rad.</b><br><small>Stabla ostaju u memoriji ovog uređaja. Za dodatnu sigurnost i dalje povremeno izvezi JSON rezervnu kopiju.</small></div><p>${apple?"U Safariju dodirni dugme za deljenje, pa izaberi „Dodaj na početni ekran”.":"Otvori meni browsera i izaberi „Instaliraj aplikaciju” ili „Dodaj na početni ekran”. Ako ta opcija još nije ponuđena, osveži stranicu posle nekoliko sekundi."}</p><p class="pdf-note">Netlify objavljivanje i otvaranje novih deljenih linkova zahtevaju internet; pregled i uređivanje lokalnih stabala ne zahtevaju ga.</p>`,()=>{},"Zatvori")
};
if("serviceWorker" in navigator&&location.protocol!=="file:")navigator.serviceWorker.register("/sw.js").then(pwaStatus).catch(()=>{$("pwa-status").textContent="Offline podrška nije dostupna u ovom načinu otvaranja."});else pwaStatus();
