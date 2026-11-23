const $ = id => document.getElementById(id);
const load = key => { try{return JSON.parse(localStorage.getItem(key)||"[]")}catch{return []} };
let notes=load("baraka-notes"), tasks=load("baraka-tasks");
const save=()=>{localStorage.setItem("baraka-notes",JSON.stringify(notes));localStorage.setItem("baraka-tasks",JSON.stringify(tasks));render()};
function esc(s){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function render(){
 $("noteCount").textContent=notes.length;
 $("taskCount").textContent=tasks.filter(t=>!t.done).length;
 $("notesList").innerHTML=notes.map((n,i)=>`<li><span>${esc(n)}</span><button data-note="${i}" aria-label="Supprimer">×</button></li>`).join("");
 $("tasksList").innerHTML=tasks.map((t,i)=>`<li class="${t.done?"done":""}"><input type="checkbox" data-task="${i}" ${t.done?"checked":""} aria-label="Terminer"><span>${esc(t.text)}</span><button data-delete="${i}" aria-label="Supprimer">×</button></li>`).join("");
 $("notesEmpty").hidden=notes.length>0;$("tasksEmpty").hidden=tasks.length>0;
}
document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x===b));document.querySelectorAll(".panel").forEach(p=>p.classList.toggle("hidden",p.id!==b.dataset.tab))}));
$("noteForm").addEventListener("submit",e=>{e.preventDefault();let v=$("noteInput").value.trim();if(v){notes.unshift(v);$("noteInput").value="";save()}});
$("taskForm").addEventListener("submit",e=>{e.preventDefault();let v=$("taskInput").value.trim();if(v){tasks.unshift({text:v,done:false});$("taskInput").value="";save()}});
document.addEventListener("click",e=>{if(e.target.dataset.note!==undefined){notes.splice(+e.target.dataset.note,1);save()}if(e.target.dataset.delete!==undefined){tasks.splice(+e.target.dataset.delete,1);save()}});
document.addEventListener("change",e=>{if(e.target.dataset.task!==undefined){tasks[+e.target.dataset.task].done=e.target.checked;save()}});
function say(text){if("speechSynthesis"in window){speechSynthesis.cancel();speechSynthesis.speak(new SpeechSynthesisUtterance(text))}}
function reply(message){
 const m=message.toLowerCase();let answer;
 if(m.includes("ajoute une note")||m.startsWith("note ")){let v=message.replace(/^note\s*|ajoute une note\s*/i,"").trim();if(v){notes.unshift(v);save();answer="C’est noté. J’ai ajouté cette note dans Baraka."}else answer="Dis-moi le texte de la note à ajouter."}
 else if(m.includes("ajoute une tâche")||m.startsWith("tâche ")){let v=message.replace(/^tâche\s*|ajoute une tâche\s*/i,"").trim();if(v){tasks.unshift({text:v,done:false});save();answer="C’est ajouté à ta liste de tâches."}else answer="Quelle tâche veux-tu ajouter ?"}
 else if(m.includes("combien")||m.includes("résumé")) answer=`Tu as ${notes.length} note(s) et ${tasks.filter(t=>!t.done).length} tâche(s) à faire.`;
 else answer="Je suis en mode démonstration pour le moment. Tu peux me dire « ajoute une note … » ou « ajoute une tâche … ». La connexion à une véritable IA sera ajoutée dans une prochaine étape.";
 addBubble(answer,"bot");
}
function addBubble(text,who){let d=document.createElement("div");d.className="bubble "+who;d.textContent=text;$("chatLog").appendChild(d);$("chatLog").scrollTop=$("chatLog").scrollHeight}
$("chatForm").addEventListener("submit",e=>{e.preventDefault();let v=$("chatInput").value.trim();if(!v)return;addBubble(v,"user");$("chatInput").value="";reply(v)});
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
$("voiceBtn").addEventListener("click",()=>{
 if(!SR){$("voiceHint").textContent="La dictée vocale n’est pas disponible ici. Utilise le champ de message ou le micro du clavier de l’iPhone.";return}
 const rec=new SR();rec.lang="fr-FR";rec.interimResults=false;
 $("voiceLabel").textContent="Je t’écoute…";rec.onresult=e=>{let v=e.results[0][0].transcript;$("chatInput").value=v;addBubble(v,"user");reply(v);$("voiceLabel").textContent="Parler à Baraka"};
 rec.onerror=()=>{$("voiceLabel").textContent="Parler à Baraka";$("voiceHint").textContent="Le micro n’a pas démarré. Vérifie l’autorisation du navigateur."};
 rec.onend=()=>{$("voiceLabel").textContent="Parler à Baraka"};try{rec.start()}catch{$("voiceLabel").textContent="Parler à Baraka"}
});
if("serviceWorker"in navigator && location.protocol.startsWith("http"))navigator.serviceWorker.register("./sw.js").catch(()=>{});
render();