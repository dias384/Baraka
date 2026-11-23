(() => {
  const KEY = "baraka.v2.data";
  const $ = (id) => document.getElementById(id);
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {notes:[],tasks:[],projects:[]}; } catch { return {notes:[],tasks:[],projects:[]}; } };
  let data = load();
  const save = () => { localStorage.setItem(KEY, JSON.stringify(data)); render(); };
  const esc = (s) => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const stamp = () => new Date().toLocaleString("fr-FR",{dateStyle:"medium",timeStyle:"short"});
  const id = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()+Math.random()));
  const show = (view) => {
    document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b.dataset.view===view));
    document.querySelectorAll(".view").forEach(v=>v.classList.add("hidden"));
    $(view+"View").classList.remove("hidden");
  };
  document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>show(b.dataset.view)));
  document.querySelectorAll("[data-jump]").forEach(b=>b.addEventListener("click",()=>show(b.dataset.jump)));

  function addCapture(text, type) {
    const clean=text.trim(); if(!clean) return;
    const entry={id:id(),text:clean,created:stamp()};
    if(type==="task") data.tasks.unshift({...entry,done:false});
    else data.notes.unshift(entry);
    $("quickInput").value=""; save();
  }
  $("captureBtn").addEventListener("click",()=>addCapture($("quickInput").value,$("captureType").value));
  $("quickInput").addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();addCapture($("quickInput").value,$("captureType").value);}});

  $("projectBtn").addEventListener("click",()=>{
    const name=$("projectInput").value.trim(); if(!name)return;
    data.projects.unshift({id:id(),name,created:stamp(),status:"En cours"});
    $("projectInput").value="";save();
  });
  $("projectInput").addEventListener("keydown",e=>{if(e.key==="Enter")$("projectBtn").click();});

  function itemHTML(item, kind) {
    if(kind==="task") return `<article class="item"><input class="check" type="checkbox" data-done="${item.id}" ${item.done?"checked":""} aria-label="Tâche terminée"><div class="item-main"><strong>${esc(item.text)}</strong><small>${esc(item.created)}</small></div><button class="icon-btn" data-delete="${kind}:${item.id}" aria-label="Supprimer">✕</button></article>`;
    const title=kind==="project"?item.name:item.text;
    return `<article class="item"><div class="item-main"><strong>${esc(title)}</strong><small>${kind==="project"?"Projet · ":""}${esc(item.created)}</small></div><button class="icon-btn" data-delete="${kind}:${item.id}" aria-label="Supprimer">✕</button></article>`;
  }
  function bindActions(){
    document.querySelectorAll("[data-delete]").forEach(b=>b.addEventListener("click",()=>{
      const [kind,itemId]=b.dataset.delete.split(":"); data[kind]=data[kind].filter(x=>x.id!==itemId);save();
    }));
    document.querySelectorAll("[data-done]").forEach(c=>c.addEventListener("change",()=>{
      const t=data.tasks.find(x=>x.id===c.dataset.done);if(t){t.done=c.checked;save();}
    }));
  }
  function render(){
    $("noteCount").textContent=data.notes.length;
    $("taskCount").textContent=data.tasks.filter(t=>!t.done).length;
    $("projectCount").textContent=data.projects.length;
    $("notesList").innerHTML=data.notes.map(n=>itemHTML(n,"note")).join("");
    $("tasksList").innerHTML=data.tasks.map(t=>itemHTML(t,"task")).join("");
    $("projectsList").innerHTML=data.projects.map(p=>itemHTML(p,"project")).join("");
    $("notesEmpty").classList.toggle("hidden",data.notes.length>0);
    $("tasksEmpty").classList.toggle("hidden",data.tasks.length>0);
    $("projectsEmpty").classList.toggle("hidden",data.projects.length>0);
    const recent=[...data.notes.map(x=>({...x,kind:"Note"})),...data.tasks.map(x=>({...x,kind:"Tâche"})),...data.projects.map(x=>({...x,text:x.name,kind:"Projet"}))].slice(0,4);
    $("recentList").innerHTML=recent.length?recent.map(x=>`<article class="item"><div class="item-main"><strong>${esc(x.text)}</strong><small>${esc(x.kind)} · ${esc(x.created)}</small></div></article>`).join(""):`<p class="empty">Tes ajouts récents apparaîtront ici.</p>`;
    bindActions();
  }
  $("todayLabel").textContent=new Date().toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"});
  render();

  const voiceBtn=$("voiceBtn"), voiceStatus=$("voiceStatus");
  const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SpeechRecognition){voiceBtn.disabled=true;voiceBtn.style.opacity=".45";voiceStatus.textContent="La dictée vocale n'est pas disponible dans ce navigateur. Tu peux toujours écrire ici.";}
  else {
    const rec=new SpeechRecognition();rec.lang="fr-FR";rec.interimResults=false;rec.maxAlternatives=1;
    voiceBtn.addEventListener("click",()=>{
      try{rec.start();voiceBtn.classList.add("listening");voiceStatus.textContent="J'écoute…";}catch{voiceStatus.textContent="La dictée est déjà en cours.";}
    });
    rec.onresult=e=>{const words=e.results[0][0].transcript;$("quickInput").value=words;$("quickInput").focus();voiceStatus.textContent="Texte reconnu. Vérifie-le puis ajoute-le comme note ou tâche.";};
    rec.onerror=()=>voiceStatus.textContent="La dictée n'a pas fonctionné. Vérifie l'autorisation du micro ou écris ton idée.";
    rec.onend=()=>voiceBtn.classList.remove("listening");
  }
  if("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
  }

  // BARAKA INITIATIVE — suggestions locales basées sur les données déjà enregistrées.
  const initiativeMessage = $("initiativeMessage");
  const initiativeStatus = $("initiativeStatus");
  const suggestionPool = [
    "Choisis une seule petite action qui ferait avancer un de tes projets.",
    "Relis une note récente : y a-t-il une idée que tu peux transformer en tâche ?",
    "Prends un instant pour vérifier si tes priorités correspondent toujours à ce qui compte pour toi.",
    "Tu peux avancer sans tout faire aujourd'hui : sélectionne la prochaine étape la plus simple."
  ];

  function buildInitiative() {
    const openTasks = data.tasks.filter(t => !t.done);
    const recentNote = data.notes[0];
    const project = data.projects[0];

    if (openTasks.length) {
      return `Tu as ${openTasks.length} tâche${openTasks.length > 1 ? "s" : ""} en attente. Une bonne prochaine étape serait : « ${openTasks[0].text} ». Veux-tu commencer par celle-ci ?`;
    }
    if (project) {
      return `Ton projet « ${project.name} » est enregistré. Quelle est la plus petite action concrète pour le faire avancer aujourd'hui ?`;
    }
    if (recentNote) {
      return `Tu as récemment noté : « ${recentNote.text} ». Souhaites-tu en faire une tâche ou approfondir cette idée ?`;
    }
    return suggestionPool[new Date().getDate() % suggestionPool.length];
  }

  function refreshInitiative() {
    if (initiativeMessage) initiativeMessage.textContent = buildInitiative();
  }

  $("refreshInitiative")?.addEventListener("click", refreshInitiative);
  refreshInitiative();

  $("enableNotifications")?.addEventListener("click", async () => {
    if (!("Notification" in window)) {
      initiativeStatus.textContent = "Les notifications ne sont pas prises en charge par ce navigateur.";
      return;
    }
    if (!("serviceWorker" in navigator)) {
      initiativeStatus.textContent = "Le service worker est indisponible dans ce navigateur.";
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        initiativeStatus.textContent = "Autorisation non accordée. Tu peux la modifier dans les réglages de ton iPhone.";
        return;
      }
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification("Baraka Initiative", {
        body: buildInitiative(),
        icon: "./icon-192.png",
        badge: "./icon-192.png",
        tag: "baraka-initiative-test"
      });
      initiativeStatus.textContent = "Autorisation accordée. Une notification de test vient d'être envoyée.";
    } catch (error) {
      initiativeStatus.textContent = "Impossible d'afficher la notification. Vérifie que Baraka est installé sur l'écran d'accueil et réessaie.";
    }
  });

})();