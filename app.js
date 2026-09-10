import {catalog, getTest, getOptions, refs, VERSION} from './catalog.js?v=3d67a1b791ab';
import {calculate, validateAnswers, validateRecord} from './scoring.js?v=3d67a1b791ab';
import {downloadReport} from './pdf.js?v=3d67a1b791ab';
import {metricDisplay,palette,formatScore} from './result-display.js?v=3d67a1b791ab';

const main=document.querySelector('#main');
const sessions=new Map();
let filter='Todos',query='',currentId=null,clientMode=false,toastTimer;
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dateToday=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
const link=(url,label)=>`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)} ↗</a>`;
const badge=t=>`<span class="badge ${t.badgeType}">${t.badge}</span>`;
const refList=t=>t.refs.length?`<ol class="references">${t.refs.map(key=>`<li>${link(refs[key].url,refs[key].title)}</li>`).join('')}</ol>`:'<p class="muted">Fuente: cuestionario DISC aportado por el usuario. No se ha aportado un estudio que valide esta versión.</p>';
const plainSession=t=>({answers:Array(t.questions.length).fill(undefined),data:{date:dateToday()},lang:'es',manualAcknowledged:false,remember:false});
const sessionKey=t=>`${t.id}:${clientMode?'cliente':'consulta'}`;
function getSession(t) {const key=sessionKey(t);if(!sessions.has(key)) sessions.set(key,plainSession(t));return sessions.get(key);}
function toast(text) {const e=document.querySelector('#toast');e.textContent=text;e.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>e.classList.remove('visible'),4500);}
function setNav(key) {document.querySelectorAll('[data-nav]').forEach(a=>{a.classList.toggle('active',a.dataset.nav===key);if(a.dataset.nav===key)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});}

function home() {
  setNav('catalog');currentId=null;clientMode=false;
  main.innerHTML=`<section class="hero"><div><div class="eyebrow">HERRAMIENTAS PARA LA CONSULTA</div><h1>Comprender su conducta.<br><em>Cuidar su bienestar.</em></h1><p>Cuestionarios de apoyo a la medicina del comportamiento. Recoge lo que observa la familia, interpreta los resultados y construye una valoración clínica mejor documentada.</p><div class="hero-actions"><a class="btn" href="#biblioteca" id="jump-library">Explorar cuestionarios <span aria-hidden="true">↓</span></a><a href="#/guia" class="text-button">Cómo utilizar la plataforma</a></div></div><aside class="feature-panel pain-feature" aria-labelledby="pain-heading"><div class="eyebrow">NUEVO EN LA BIBLIOTECA</div><h2 id="pain-heading">Escalas de dolor</h2><p>Acceso directo para la valoración de perros y gatos.</p><div class="pain-shortcuts"><a href="#/cuestionario/glasgow-dog"><span class="pain-icon" aria-hidden="true">P</span><span><strong>Glasgow canina</strong><small>CMPS-SF · registro veterinario</small></span><span aria-hidden="true">↗</span></a><a href="#/cuestionario/glasgow-cat"><span class="pain-icon" aria-hidden="true">G</span><span><strong>Glasgow felina</strong><small>CMPS-F · registro veterinario</small></span><span aria-hidden="true">↗</span></a><a href="#/cuestionario/fgs"><span class="pain-icon" aria-hidden="true">G</span><span><strong>Feline Grimace Scale</strong><small>Expresión facial · gato</small></span><span aria-hidden="true">↗</span></a></div><div class="panel-bottom">Puntuación · interpretación · informe PDF</div></aside></section>
  <div class="science-strip"><div><span class="symbol" aria-hidden="true">⌘</span><strong>Evidencia y límites a la vista</strong></div><div><span class="symbol" aria-hidden="true">↗</span><strong>Cuestionarios para compartir</strong></div><div><span class="symbol" aria-hidden="true">▤</span><strong>Informe clínico en PDF</strong></div></div>
  <section id="biblioteca"><div class="catalog-heading"><div><div class="eyebrow">BIBLIOTECA CLÍNICA</div><h2>Elige por dónde empezar</h2><p>${catalog.filter(t=>t.questions).length} herramientas integradas y ${catalog.filter(t=>t.external).length} recursos externos.</p></div><label class="search"><span aria-hidden="true">⌕</span><span class="screen-reader">Buscar cuestionarios</span><input id="search" type="search" placeholder="Buscar por nombre, especie…" value="${esc(query)}"></label></div>
  <div class="filters" aria-label="Filtrar cuestionarios">${['Todos','Conducta y emoción','Cognición y envejecimiento','Dolor y bienestar','Equipos veterinarios'].map(f=>`<button class="chip" data-filter="${f}" aria-pressed="${f===filter}">${f}</button>`).join('')}</div><div id="catalog-count" class="screen-reader" role="status"></div><div class="catalog-grid" id="catalog-grid"></div></section>
  <div class="help-band"><div><h3>La evidencia también tiene matices.</h3><p>Una escala validada no convierte automáticamente su traducción en una versión validada.</p></div><a class="btn secondary" href="#/evidencia">Revisar bibliografía ↗</a></div>`;
  renderCards();
  document.querySelector('#search').addEventListener('input',e=>{query=e.target.value;renderCards();});
  document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;document.querySelectorAll('[data-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));renderCards();});
  document.querySelector('#jump-library').onclick=e=>{e.preventDefault();document.querySelector('#biblioteca').scrollIntoView({behavior:'smooth'});document.querySelector('#search').focus({preventScroll:true});};
}
function renderCards() {
  const norm=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const tests=catalog.filter(t=>(filter==='Todos'||t.category===filter)&&norm([t.short,t.title,t.species,t.category,t.summary].join(' ')).includes(norm(query)));
  document.querySelector('#catalog-grid').innerHTML=tests.map((t,i)=>`<article class="card ${t.kind}" style="animation-delay:${i*30}ms"><div class="card-top"><span class="monogram">${t.short}</span>${badge(t)}</div><div class="category">${t.category}</div><h3>${t.title}</h3><p>${t.summary}</p><p class="card-note">${t.note}</p><div class="card-meta"><span>${t.species}</span><span>${t.time}</span><span>${t.questions?`${t.questions.length} ${t.id==='fgs'?'unidades':'ítems'}`:'Externo'}</span></div><div class="card-bottom"><a href="${t.external?`#/recurso/${t.id}`:`#/cuestionario/${t.id}`}">${t.external?'Consultar recurso':'Abrir cuestionario'} <span aria-hidden="true">↗</span></a><a class="more" href="#/evidencia/${t.id}">Ver evidencia</a></div></article>`).join('')||'<div class="empty"><h3>No hay coincidencias</h3><p>Prueba otro término o selecciona «Todos».</p></div>';
  document.querySelector('#catalog-count').textContent=`${tests.length} cuestionarios encontrados.`;
}

function evidence(id) {
  setNav('evidence');currentId=null;
  const items=id?catalog.filter(t=>t.id===id):catalog;
  main.innerHTML=`<a href="#/" class="back">← Volver a cuestionarios</a><div class="page-intro"><div class="eyebrow">MÉTODO & FUENTES</div><h1>La evidencia, con contexto.</h1><p>La validez corresponde a un instrumento, una versión, un idioma y una población. Aquí puedes consultar qué está respaldado, cómo se puntúa y qué sigue pendiente de revisión.</p><span class="badge">Revisión documental · 11 septiembre 2026</span></div>
  ${items.map(t=>`<article class="evidence-card"><div><h3>${t.short}</h3>${badge(t)}<p class="muted">${t.title}</p><a class="btn secondary" href="#/${t.external?'recurso':'cuestionario'}/${t.id}">${t.external?'Consultar recurso':'Abrir herramienta'}</a></div><div><h3>Qué respalda el instrumento</h3><p>${t.evidence}</p><h3>Puntuación y límites</h3><p>${t.method}</p><h3>Versión y condiciones de uso</h3><p>${t.license}</p><h3>Bibliografía</h3>${refList(t)}</div></article>`).join('')}
  <div class="note"><strong>Antes de utilizar la plataforma como herramienta institucional</strong><p>Revisión clínica de los textos y de las traducciones por GEMCA, verificación de las condiciones de reproducción y aprobación de la versión de uso. Esta propuesta no acredita una validación institucional del software.</p></div>`;
}
function guide() {
  currentId=null;setNav('guide');
  main.innerHTML=`<div class="page-intro"><div class="eyebrow">UNA CONSULTA MEJOR DOCUMENTADA</div><h1>De las respuestas<br>a una conversación útil.</h1><p>Para veterinarios, familias y equipos. El cuestionario ordena la observación; la valoración clínica da sentido al resultado.</p></div><div class="guide-grid"><section class="section-box"><span class="number">01</span><h2>Elige la herramienta</h2><p>Selecciona el motivo de evaluación y revisa la evidencia, la especie y las instrucciones. Los recursos externos se completan en sus plataformas oficiales.</p></section><section class="section-box"><span class="number">02</span><h2>Recoge la información</h2><p>Completa la ficha y las respuestas en consulta, o comparte un enlace vacío con la familia. Las preguntas no contestadas se señalan sin convertirlas en ceros.</p></section><section class="section-box"><span class="number">03</span><h2>Interpreta y documenta</h2><p>Consulta el perfil, incorpora tu valoración y descarga un PDF con la ficha, respuestas, resultados y fuentes.</p></section></div>
  <section class="section-box"><h2>Compartir con la familia</h2><p>En cada herramienta, «Compartir» prepara un enlace en modo cliente sin datos del paciente. Al terminar, la familia descarga el archivo de respuestas y lo devuelve al veterinario por el canal acordado. El veterinario usa «Importar respuestas» y añade su valoración.</p><div class="note">Esta primera versión no recibe formularios automáticamente ni tiene una bandeja de entrada. El enlace debe apuntar a una web publicada para funcionar en otro dispositivo; una dirección localhost solo funciona en el equipo donde se ejecuta.</div></section>
  <section class="section-box"><h2>Preguntas prácticas</h2><details open><summary>¿Dónde quedan guardados los datos?</summary><p>Las respuestas se mantienen en la memoria de esta pestaña. Solo si activas «Guardar borrador en este dispositivo» se conservan en el navegador. En un ordenador compartido, descarga el archivo y borra el borrador al terminar. No se envían fichas ni respuestas a un servidor de esta aplicación.</p></details><details><summary>¿Puedo descargar un PDF directamente?</summary><p>Sí. «Descargar PDF» genera un documento en el dispositivo. También puedes imprimir el informe o elegir «Guardar como PDF» en el diálogo de impresión. El informe incorpora la versión del cuestionario, respuestas, puntuación y bibliografía.</p></details><details><summary>¿Qué significa «Original validado»?</summary><p>El instrumento original tiene evidencia publicada, pero eso no valida automáticamente una traducción o una adaptación. DIAS conserva el texto aportado en español; CFQ ofrece además los ítems originales en inglés. Sus traducciones de trabajo se identifican como tales.</p></details><details><summary>¿Se puede hacer seguimiento?</summary><p>Descarga un archivo de respuestas por visita. Puedes importarlo para revisar la ficha, cambiar la fecha y registrar una nueva evaluación. Conserva los informes anteriores. Compara siempre la misma versión, idioma, cuidador y cobertura de respuestas; no existe aquí un historial compartido automático.</p></details><details><summary>¿Cómo se usa DISC en el equipo?</summary><p>Como actividad voluntaria para conversar sobre preferencias de comunicación. Esta versión no es un test validado y no debe emplearse para selección de personal o diagnóstico. Cada persona decide si comparte su resultado.</p></details><details><summary>¿Es una plataforma oficial de GEMCA?</summary><p>Es una propuesta de trabajo para los compañeros del grupo, pendiente de revisión institucional. GEMCA es el Grupo de Especialidad en Medicina del Comportamiento y Bienestar Animal de AVEPA. ${link('https://gemca.org/','Visitar la web de GEMCA')}</p></details></section><a href="#/" class="btn">Ir a los cuestionarios →</a>`;
}

function resource(t) {
  setNav('catalog');currentId=null;
  main.innerHTML=`<a class="back" href="#/">← Volver a cuestionarios</a><div class="page-intro">${badge(t)}<h1>${t.short}<br>${t.title}</h1><p>${t.summary}</p></div><section class="section-box"><h2>Acceso al recurso original</h2><p>${t.evidence}</p><p>${t.method}</p><a class="btn" href="${t.external}" target="_blank" rel="noopener noreferrer">${t.id==='cognitive'?'Abrir publicación comparativa':'Abrir plataforma oficial'} ↗</a><p class="muted" style="margin-top:20px">Se abrirá una web externa. Sus condiciones de acceso, idioma, privacidad e informes son propias.</p></section><section class="section-box"><h2>Fuentes</h2>${refList(t)}</section>`;
}

const clinicalFields=[['patient','Nombre del paciente'],['record','Código de historia'],['breed','Raza'],['dob','Fecha de nacimiento','date'],['sex','Sexo','select',['No indicado','Macho','Hembra']],['neutered','Estado reproductivo','select',['No indicado','Entero/a','Esterilizado/a']],['weight','Peso (kg)'],['chip','Microchip (opcional)'],['guardian','Responsable del animal'],['respondent','Persona que responde'],['professional','Veterinario/a'],['clinic','Centro veterinario'],['date','Fecha de evaluación','date'],['reason','Motivo de consulta','textarea'],['medical','Antecedentes, enfermedades y medicación actual','textarea'],['context','Contexto y ejemplos observados','textarea']];
const teamFields=[['patient','Nombre o código de participante'],['role','Rol en el equipo'],['clinic','Centro o equipo'],['date','Fecha','date'],['context','Situación de trabajo que tienes en mente','textarea']];
function fieldHtml([key,label,type='text',options],s) {
  const val=s.data[key]||'';
  const control=type==='textarea'?`<textarea name="${key}" maxlength="8000">${esc(val)}</textarea>`:type==='select'?`<select name="${key}">${options.map(o=>`<option${val===o?' selected':''}>${esc(o)}</option>`).join('')}</select>`:`<input type="${type}" name="${key}" value="${esc(val)}" maxlength="300"${key==='weight'?' inputmode="decimal"':''}>`;
  return `<label class="field${type==='textarea'?' full':''}">${label}${control}</label>`;
}
function renderEditor(t) {
  if(t.professionalOnly) clientMode=false;
  setNav('catalog');currentId=t.id;
  const s=getSession(t),team=t.id==='disc';
  const fields=(team?teamFields:clinicalFields).filter(f=>!clientMode||!['professional','clinic'].includes(f[0]));
  main.innerHTML=`<a href="#/" class="back">← Biblioteca de cuestionarios</a><div class="workspace-head"><div><div class="eyebrow">${clientMode?'PARA COMPLETAR EN CASA':t.category} · ${t.species}</div>${badge(t)}<h1>${t.short} · ${t.title}</h1><p>${t.summary}</p></div><div class="button-row"><button class="btn secondary" id="share">Compartir ↗</button>${!clientMode?'<button class="btn secondary" id="import">Importar respuestas</button>':''}</div></div>
  <div class="workspace-layout"><div><div class="note ${t.badgeType==='amber'||team?'amber':''}"><strong>${t.note}</strong><p>${t.instructions}</p><a href="#/evidencia/${t.id}">Consultar evidencia y método</a></div>
  ${clientMode?'<div class="note"><strong>Tu observación ayuda al veterinario.</strong><p>Al terminar, descarga tus respuestas y devuélvelas por el canal que te haya indicado. Esta página no las envía automáticamente.</p></div>':''}
  <form id="assessment" autocomplete="off" novalidate><section class="section-box"><h2>01 · ${team?'Datos de la actividad':'Ficha del paciente'}</h2><p class="muted">Datos opcionales para identificar el informe. Puedes utilizar un código en lugar de un nombre.</p><div class="form-grid">${fields.map(f=>fieldHtml(f,s)).join('')}</div></section>
  <section class="section-box"><h2>02 · ${t.id==='fgs'?'Observación facial':'Cuestionario'}</h2>
  ${t.id==='cfq'?`<label class="field">Idioma de administración<select id="language"><option value="es"${s.lang==='es'?' selected':''}>Español · traducción de trabajo no validada</option><option value="en"${s.lang==='en'?' selected':''}>English · original items</option></select></label>`:''}
  ${(t.id==='fgs'||t.manualRef)?`<div class="note">${link(refs[t.manualRef||'fgsManual'].url,'Abrir formulario o manual original')}<p>${t.manualRef?'Uso veterinario. Traslada las puntuaciones del original, incluida su versión e idioma en las notas. No asignes números sin aplicar sus descriptores.':'Usa sus criterios para puntuar cada unidad facial.'}</p></div><label class="checkline"><input type="checkbox" id="manual"${s.manualAcknowledged?' checked':''}>He aplicado el protocolo del formulario o manual original para esta evaluación.</label>`:''}
  <div id="questions">${questionsHtml(t,s)}</div></section>
  ${!clientMode?`<section class="section-box"><h2>03 · ${team?'Reflexión y acuerdos':'Valoración profesional'}</h2><div class="form-grid">${[['notes',team?'Observaciones de la actividad':'Valoración clínica e hipótesis','textarea'],['plan',team?'Acuerdos del equipo':'Indicaciones individualizadas','textarea'],['followup','Seguimiento previsto','textarea']].map(f=>fieldHtml(f,s)).join('')}</div></section>`:''}
  <div class="form-actions"><p id="form-error" role="alert" class="muted"></p><button type="submit" class="btn">${clientMode?'Revisar mis respuestas':'Calcular y ver informe'} →</button></div></form></div>
  <aside class="side-panel"><section class="section-box"><h3>Tu evaluación</h3><p>${t.questions.length} ${t.id==='fgs'?'unidades faciales':'preguntas'} · ${t.time}</p><div class="progress-label"><span>Progreso</span><strong id="progress-text"></strong></div><progress id="progress" max="${t.questions.length}" value="0" aria-label="Preguntas respondidas"></progress><p id="coverage"></p><label class="checkline"><input type="checkbox" id="remember"${s.remember?' checked':''}>Guardar borrador en este dispositivo</label><button type="button" class="btn secondary" id="restore">Recuperar borrador</button><button type="button" class="btn secondary" id="export-draft">Descargar respuestas</button><button type="button" class="text-button" id="clear-draft">Borrar borrador guardado</button></section><section class="section-box side-help"><h3>${team?'Una conversación, no una etiqueta':'Observación + contexto'}</h3><p>${team?'Usa los resultados para explorar cómo colaborar mejor.':'No provoques una conducta para completar el cuestionario. Si no puedes evaluarla, indica que no es valorable.'}</p><a href="#/guia">Ayuda de uso</a></section></aside></div>`;
  updateProgress(t,s);
  document.querySelector('#share').onclick=()=>share(t);
  if(t.professionalOnly)document.querySelector('#share').hidden=true;
  document.querySelector('#import')?.addEventListener('click',()=>document.querySelector('#import-file').click());
  document.querySelector('#assessment').addEventListener('input',e=>{
    if(e.target.name.startsWith('q-')) return;
    if(e.target.name) s.data[e.target.name]=e.target.value;
    persist(t,s);
  });
  document.querySelector('#assessment').addEventListener('change',e=>{
    if(e.target.name.startsWith('q-')) {const i=Number(e.target.name.slice(2));s.answers[i]=getOptions(t,i)[Number(e.target.value)].value;e.target.closest('fieldset').classList.remove('invalid');updateProgress(t,s);}
    if(e.target.name && !e.target.name.startsWith('q-')) s.data[e.target.name]=e.target.value;
    if(e.target.id==='manual')s.manualAcknowledged=e.target.checked;
    persist(t,s);
  });
  document.querySelector('#language')?.addEventListener('change',e=>{s.lang=e.target.value;document.querySelector('#questions').innerHTML=questionsHtml(t,s);persist(t,s);});
  document.querySelector('#remember').onchange=e=>{s.remember=e.target.checked;if(!s.remember){try{localStorage.removeItem(storageKey(t));}catch{}}else persist(t,s);};
  document.querySelector('#restore').onclick=()=>restore(t);
  document.querySelector('#export-draft').onclick=()=>downloadAnswers(t,s);
  document.querySelector('#clear-draft').onclick=()=>{try{localStorage.removeItem(storageKey(t));s.remember=false;document.querySelector('#remember').checked=false;toast('Borrador guardado eliminado. La evaluación abierta se conserva.');}catch{toast('El navegador no permite acceder al almacenamiento.');}};
  document.querySelector('#assessment').onsubmit=e=>{e.preventDefault();submit(t,s);};
}
function questionsHtml(t,s) {
  return t.questions.map((q,i)=>`${q.group?`<h3 class="group-title">${q.group}</h3>`:''}<fieldset class="question" id="question-${i}"><legend><span class="qnum">${String(i+1).padStart(2,'0')}</span> ${esc(t.id==='cfq'&&s.lang==='en'?q.en:q.text)}</legend>${t.id==='cfq'?`<div class="english">Ítem original ${q.originalId}${s.lang==='es'?` · <span lang="en">${esc(q.en)}</span>`:''}</div>`:''}<div class="options">${getOptions(t,i).map((o,j)=>{const text=t.id==='cfq'&&s.lang==='en'?['Strongly disagree','Mainly disagree','Partly agree, partly disagree','Mainly agree','Strongly agree','Don’t know / not applicable'][j]:o.text;return `<label class="answer-option${o.value===null?' na':''}"><input type="radio" name="q-${i}" value="${j}"${s.answers[i]===o.value?' checked':''}>${esc(text)}</label>`;}).join('')}</div></fieldset>`).join('');
}
function updateProgress(t,s) {const done=s.answers.filter(a=>a!==undefined).length,na=s.answers.filter(a=>a===null).length;document.querySelector('#progress').value=done;document.querySelector('#progress-text').textContent=`${done}/${t.questions.length}`;document.querySelector('#coverage').textContent=na?`${na} marcadas como no valorables.`:'Las respuestas solo se guardan en el navegador si lo activas.';}
function submit(t,s) {
  const missing=validateAnswers(t,s.answers,false);
  const error=document.querySelector('#form-error');
  if(missing.length) {error.textContent=`Faltan ${missing.length} respuestas. Revisa las preguntas marcadas.`;missing.forEach(i=>document.querySelector(`#question-${i}`).classList.add('invalid'));const first=document.querySelector(`#question-${missing[0]}`);first.scrollIntoView({behavior:'smooth',block:'center'});first.querySelector('input').focus({preventScroll:true});return;}
  if((t.id==='fgs'||t.manualRef)&&!s.manualAcknowledged){error.textContent='Consulta y aplica el protocolo original, y marca la casilla antes de calcular.';document.querySelector('#manual').focus();return;}
  try {calculate(t.id,s.answers);location.hash=`#/resultado/${t.id}${clientMode?'?cliente=1':''}`;}catch(e){error.textContent=e.message;}
}

function metadata(t,s) {
  const fields=t.id==='disc'?teamFields:clinicalFields;
  return [...(t.id!=='disc'?[['Especie',t.species]]:[]),...fields.filter(([key])=>s.data[key]&&(!clientMode||!['professional','clinic'].includes(key))).map(([key,label])=>[label,s.data[key]])];
}
function metricsHtml(result,t) {
  return `<div class="result-key"><strong>Tu resultado, de un vistazo</strong><p>El marcador sitúa tu puntuación entre el mínimo y el máximo posibles. ${['dias','cfq'].includes(t.id)?'El intervalo de estos índices es 0,200–1,000; no hay puntos de corte clínicos acreditados.':t.id==='disc'?'Los colores representan estilos de comunicación, sin jerarquía entre ellos.':(t.id==='fgs'||t.manualRef)?'Esta escala tiene dos zonas; no se añade una alerta intermedia sin respaldo.':'El semáforo corresponde al total completo. Las subescalas muestran frecuencia de cambios.'}</p></div><div class="visual-scores">${result.metrics.map((m,i)=>{
    const d=metricDisplay(t,result,i),value=formatScore(m.value,m.max);
    return `<section class="visual-score${i===0&&t.id!=='disc'?' lead-score':''}" style="--score-color:${palette[d.color]}"><div class="score-heading"><h3>${esc(m.label)}</h3><span class="score-state">${esc(d.status)}</span></div><div class="score-reading"><strong>${value}</strong><span>${t.id==='disc'?`${(m.value/30*100).toFixed(1).replace('.',',')} % de elecciones`:m.coverage|| (m.max===1?'Índice normalizado':'Puntos')}</span></div><div class="range-visual" role="img" aria-label="${esc(`${m.label}: ${value}. Mínimo ${formatScore(d.min,m.max)}, máximo ${formatScore(d.max,m.max)}. ${d.status}`)}"><div class="range-track ${d.bands.length?'banded':'continuous'}">${d.bands.map(b=>`<span style="width:${(b.to-b.from)/(d.max-d.min)*100}%;background:${palette[b.color]}"></span>`).join('')}</div>${d.position===null?'':`<span class="range-marker" style="left:${d.position}%" aria-hidden="true"></span>`}</div><div class="range-extremes"><span><b>${formatScore(d.min,m.max)}</b> mínimo</span><span><b>${formatScore(d.max,m.max)}</b> máximo</span></div>${d.bands.length?`<div class="range-legend">${d.bands.map(b=>`<div><i style="background:${palette[b.color]}" aria-hidden="true"></i><span><b>${b.label}</b>${b.meaning}</span></div>`).join('')}</div>`:`<div class="range-direction"><span>${d.low}</span><span>${d.high}</span></div>`}<p class="score-meaning">${esc(d.meaning)}</p></section>`;
  }).join('')}</div>`;
}
function renderResults(t) {
  if(t.professionalOnly) clientMode=false;
  setNav('catalog');currentId=t.id;
  const s=getSession(t);let r;
  try {r=calculate(t.id,s.answers);if((t.id==='fgs'||t.manualRef)&&!s.manualAcknowledged)throw new Error();}catch {renderEditor(t);toast('Completa el cuestionario antes de abrir el informe.');return;}
  const modeQuery=clientMode?'?cliente=1':'';
  main.innerHTML=`<a class="back" href="#/cuestionario/${t.id}${modeQuery}">← Revisar respuestas</a><div class="workspace-head"><div><div class="eyebrow">${clientMode?'RESUMEN PARA COMPARTIR CON EL VETERINARIO':'INFORME DE EVALUACIÓN'}</div><h1>${t.short} · ${t.title}</h1><p>${clientMode?'Descarga el archivo de respuestas y devuélvelo por el canal acordado. No se ha enviado automáticamente.':'Revisa el resultado junto con la historia y la observación clínica.'}</p></div><div class="button-row"><button class="btn" id="pdf">Descargar PDF ↓</button><button class="btn secondary" id="print">Imprimir</button></div></div><div class="workspace-layout"><div class="section-box report" id="report"><div class="print-only"><div class="eyebrow">GEMCA · PROPUESTA DE TRABAJO</div><h1>${t.short} · ${t.title}</h1></div><p class="muted">Versión ${VERSION} · ${t.id==='cfq'?(s.lang==='en'?'Ítems originales en inglés':'Traducción española de trabajo'):'Español'} · ${r.count}/${r.total} respuestas evaluables</p>
  <h2>${t.id==='disc'?'Ficha de la actividad':'Ficha del paciente'}</h2><dl>${metadata(t,s).map(([label,value])=>`<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl>
  <h2>${clientMode?'Resumen del cuestionario':'Resultado'}</h2>${metricsHtml(r,t)}<div class="note${!r.complete?' amber':''}"><strong>${esc(r.status)}</strong><p>${esc(r.interpretation)}</p></div>
  <h2>${t.id==='disc'?'Sugerencias para la conversación':'Orientaciones para la revisión clínica'}</h2><ul>${r.guidance.map(g=>`<li>${esc(g)}</li>`).join('')}</ul><p class="muted">${t.id==='disc'?'Actividad formativa, no evaluación psicométrica.':'Orientaciones generales de apoyo. No constituyen un diagnóstico ni un tratamiento individualizado.'}</p>
  ${!clientMode?['notes','plan','followup'].map((key,i)=>`<h2>${[t.id==='disc'?'Observaciones':'Valoración del veterinario',t.id==='disc'?'Acuerdos':'Indicaciones individualizadas','Seguimiento'][i]}</h2><p style="white-space:pre-wrap">${esc(s.data[key]||'Pendiente de completar.')}</p>`).join(''):''}
  <h2>Evidencia y límites</h2><p>${esc(t.evidence)}</p><p>${esc(t.method)}</p><h3>Referencias</h3>${refList(t)}<p class="muted">${esc(t.license)}</p>
  <h2 class="print-break">Anexo · respuestas</h2>${t.questions.map((q,i)=>`<div class="report-answer"><p><strong>${i+1}.</strong> ${esc(t.id==='cfq'&&s.lang==='en'?q.en:q.text)}</p><span>${esc(getOptions(t,i).find(o=>o.value===s.answers[i])?.text)}</span></div>`).join('')}</div>
  <aside class="side-panel no-print"><section class="section-box"><h3>${clientMode?'Entregar al veterinario':'Guardar esta evaluación'}</h3><p>El PDF es el informe legible. El archivo de respuestas permite volver a abrir esta evaluación.</p><button class="btn secondary" id="export">Descargar respuestas</button><a class="btn secondary" href="#/cuestionario/${t.id}${modeQuery}">${clientMode?'Editar respuestas':'Editar ficha e indicaciones'}</a><button class="btn secondary" id="share-result">Compartir cuestionario vacío</button></section><section class="section-box side-help"><h3>Datos bajo tu control</h3><p>No se envían respuestas a un servidor de la aplicación. El archivo descargado contiene los datos que has introducido; compártelo solo con el destinatario previsto.</p></section></aside></div>`;
  document.querySelector('#pdf').onclick=async e=>{const b=e.currentTarget;b.disabled=true;try{await downloadReport(t,s,r,metadata(t,s),clientMode);toast('PDF generado.');}catch(err){toast('No se pudo generar el PDF. Puedes usar Imprimir → Guardar como PDF.');console.error(err);}finally{b.disabled=false;}};
  document.querySelector('#print').onclick=()=>window.print();
  document.querySelector('#export').onclick=()=>downloadAnswers(t,s);
  document.querySelector('#share-result').onclick=()=>share(t);
  if(t.professionalOnly)document.querySelector('#share-result').hidden=true;
}

function record(t,s) {
  const data={...s.data};
  if(clientMode) for(const k of ['notes','plan','followup','professional','clinic'])delete data[k];
  return {format:'gemca-respuestas',schema:1,instrumentVersion:VERSION,testId:t.id,createdAt:new Date().toISOString(),lang:s.lang,data,answers:s.answers.map(a=>a===undefined?'pending':a),manualAcknowledged:s.manualAcknowledged};
}
function saveBlob(blob,name) {const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);}
function downloadAnswers(t,s) {saveBlob(new Blob([JSON.stringify(record(t,s),null,2)],{type:'application/json'}),`GEMCA-${t.short}-respuestas-${s.data.date||dateToday()}.json`);toast('Archivo descargado. Devuélvelo por el canal acordado.');}
const storageKey=t=>`gemca-draft-${VERSION}-${t.id}-${clientMode?'cliente':'consulta'}`;
function persist(t,s) {if(!s.remember)return;try{localStorage.setItem(storageKey(t),JSON.stringify(record(t,s)));}catch{s.remember=false;const cb=document.querySelector('#remember');if(cb)cb.checked=false;toast('No se pudo guardar el borrador. Descarga tus respuestas para conservarlas.');}}
function restore(t) {try{const raw=localStorage.getItem(storageKey(t));if(!raw){toast('No hay un borrador guardado para este cuestionario y modo.');return;}const saved=validateRecord(JSON.parse(raw));sessions.set(sessionKey(t),{...saved,remember:true});renderEditor(t);toast('Borrador recuperado.');}catch{toast('No se pudo recuperar un borrador compatible.');}}

function share(t) {
  if(t.professionalOnly){toast('Esta escala requiere evaluación veterinaria y no dispone de modo cliente.');return;}
  const url=new URL(location.href);url.hash=`/cuestionario/${t.id}?cliente=1`;url.search='';
  const local=['localhost','127.0.0.1',''].includes(url.hostname)||url.protocol==='file:';
  document.querySelector('#share-content').innerHTML=`<p>Envía este enlace para que ${t.id==='disc'?'un compañero':'la familia'} complete <strong>${t.short}</strong>. No incluye datos del paciente, respuestas ni notas clínicas.</p>${local?'<div class="note amber">Esta es una vista local. El enlace solo funcionará en este equipo. Para enviarlo a otra persona, primero hay que publicar la web.</div>':''}<label class="field">Enlace al cuestionario vacío<textarea readonly class="link-output" id="share-link">${esc(url.href)}</textarea></label><button class="btn" id="copy-link">Copiar enlace</button><p class="muted" style="margin-top:18px">Al terminar, el destinatario descarga sus respuestas y te devuelve el archivo. No existe envío automático.</p>`;
  document.querySelector('#copy-link').onclick=async()=>{try{await navigator.clipboard.writeText(url.href);toast('Enlace copiado.');}catch{const area=document.querySelector('#share-link');area.select();toast('Selecciona y copia el enlace con el menú de tu dispositivo.');}};
  document.querySelector('#share-dialog').showModal();
}
document.querySelector('#close-share').onclick=()=>document.querySelector('#share-dialog').close();
document.querySelector('#import-file').onchange=async e=>{
  const file=e.target.files[0];if(!file)return;
  try {if(file.size>250000)throw new Error('El archivo supera el tamaño permitido (250 KB).');const saved=validateRecord(JSON.parse(await file.text()));sessions.set(`${saved.testId}:consulta`,{...saved,remember:false});const dest=`#/cuestionario/${saved.testId}`;if(location.hash===dest)renderEditor(getTest(saved.testId));else location.hash=dest;toast('Respuestas importadas. Los resultados se recalculan desde las respuestas.');}catch(err){toast(err.message||'No se pudo importar el archivo.');}finally{e.target.value='';}
};
function route() {
  const [path,params='']=(location.hash.slice(1)||'/').split('?');
  const parts=path.split('/').filter(Boolean);clientMode=new URLSearchParams(params).get('cliente')==='1';
  if(parts[0]==='evidencia')evidence(parts[1]);
  else if(parts[0]==='guia')guide();
  else if(['cuestionario','resultado','recurso'].includes(parts[0])) {const t=getTest(parts[1]);if(!t){home();toast('No se encuentra ese cuestionario.');}else if(t.external)resource(t);else if(parts[0]==='resultado')renderResults(t);else renderEditor(t);}
  else home();
  document.title=currentId?`${getTest(currentId).short} · GEMCA`:'GEMCA · Cuestionarios de comportamiento';
  window.scrollTo({top:0,behavior:'instant'});
}
window.addEventListener('hashchange',()=>{route();main.focus({preventScroll:true});});
route();
