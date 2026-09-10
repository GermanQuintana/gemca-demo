import { getTest, getOptions, cfqComponents } from './catalog.js';

export function validateAnswers(test, answers, requireComplete = true) {
  if (!Array.isArray(answers) || answers.length !== test.questions.length) throw new Error('Número de respuestas incorrecto.');
  const missing=[];
  Array.from(answers).forEach((a,i)=>{
    if(a===undefined) {missing.push(i); return;}
    if(!getOptions(test,i).some(o=>o.value===a)) throw new Error(`Respuesta no válida en la pregunta ${i+1}.`);
  });
  if(requireComplete && missing.length) throw new Error(`Faltan ${missing.length} respuestas.`);
  return missing;
}

function normalized(answers, indexes, reverse = []) {
  const scored=indexes.filter(i=>typeof answers[i]==='number');
  if(!scored.length) return null;
  return scored.reduce((sum,i)=>sum+(reverse.includes(i)?6-answers[i]:answers[i]),0)/(5*scored.length);
}
const range = n => Array.from({length:n},(_,i)=>i);
const tile = (label,value,max=1,coverage) => ({label,value,max,coverage});

export function calculate(id, answers) {
  const test=getTest(id);
  if(!test?.questions) throw new Error('Este recurso no admite cálculo local.');
  validateAnswers(test,answers);
  const count=answers.filter(a=>a!==null).length;
  if(!count) throw new Error('No hay respuestas evaluables. Revisa la observación antes de calcular.');
  const complete=count===answers.length;
  const result={count,total:answers.length,complete,metrics:[],status:'',interpretation:'',guidance:[...test.guidance]};
  if(id.startsWith('glasgow-')) {
    const omitted=id==='glasgow-dog'&&answers[2]==='omitted';
    const max=id==='glasgow-dog'&&!omitted?24:20;
    const threshold=max===24?6:5;
    const total=answers.reduce((s,a)=>s+(typeof a==='number'?a:0),0);
    result.count=answers.filter(a=>typeof a==='number').length;
    result.total=answers.length-(omitted?1:0);
    result.complete=result.count===result.total;
    if(!result.count)throw new Error('No hay respuestas evaluables.');
    result.metrics=[tile(result.complete?'Total Glasgow':'Subtotal Glasgow',total,max,`${result.count}/${result.total} apartados${omitted?' · movilidad omitida':''}`)];
    result.threshold=threshold;
    result.status=!result.complete?'Registro parcial · sin umbral automático':total>=threshold?'Umbral de intervención alcanzado':'Por debajo del umbral de intervención';
    result.interpretation=!result.complete?'Faltan apartados. No comparar este subtotal con el umbral ni reducir el denominador por ausencias distintas de la omisión permitida de movilidad.':`Puntuación ${total}/${max}. Umbral de intervención ≥${threshold}/${max}. ${total>=threshold?'Requiere valoración veterinaria de analgesia de rescate.':'No descarta dolor; integrar con la exploración clínica.'}${omitted?' Se utiliza la variante canina sin movilidad evaluable.':''}`;
  } else if(id==='dias') {
    const groups=[
      {label:'OQS · índice global',idx:range(18),rev:[9,10,11,12,13,14]},
      {label:'F1 · regulación conductual',idx:[0,1,2,6,7,9,12,13,16,17],rev:[9,12,13]},
      {label:'F2 · agresión / novedad',idx:[3,4,8,10,14],rev:[14]},
      {label:'F3 · capacidad de respuesta',idx:[5,9,11,14,15],rev:[]}
    ];
    result.metrics=groups.map(g=>tile(g.label,normalized(answers,g.idx,g.rev),1,`${g.idx.filter(i=>answers[i]!==null).length}/${g.idx.length} ítems`));
    result.status='Perfil descriptivo de impulsividad';
    result.interpretation='Los índices no son probabilidades ni porcentajes de enfermedad. Valores mayores en OQS y F1 reflejan más impulsividad informada; F2 y F3 describen dimensiones diferentes. F3 no mide por sí solo gravedad clínica. No se asignan etiquetas de normalidad ni puntos de corte diagnósticos.';
  } else if(id==='eecc') {
    const groups=[['Desorientación',0,6,2],['Interacción social',6,9,1],['Sueño y vigilia',9,11,1],['Aprendizaje / eliminación',11,13,1],['Actividad',13,16,1],['Ansiedad',16,17,1]];
    const subtotal=answers.reduce((s,a,i)=>s+(a??0)*(i<6?2:1),0);
    result.metrics=[tile(complete?'Total ponderado':'Subtotal · no clasificable',subtotal,69),...groups.map(([label,start,end,weight])=>tile(label,answers.slice(start,end).every(a=>a===null)?null:answers.slice(start,end).reduce((s,a)=>s+(a??0)*weight,0),(end-start)*3*weight,`${answers.slice(start,end).filter(a=>a!==null).length}/${end-start} ítems`))];
    if(!complete) { result.status='Evaluación parcial · sin banda interpretativa'; result.interpretation='Hay ítems no valorables. El subtotal no debe compararse con los puntos de corte de una evaluación completa. Completar la información mediante entrevista clínica.'; }
    else if(subtotal<=7) { result.status='Banda 0–7 · envejecimiento normal según el formulario';result.interpretation='La puntuación se sitúa en la banda inferior de EECC. Esto no excluye enfermedad ni explica por sí solo los cambios observados.'; }
    else if(subtotal<=40) { result.status='Banda 8–40 · posible deterioro cognitivo leve';result.interpretation='La puntuación se sitúa en la banda intermedia del formulario. Requiere evaluación clínica y exclusión de otras causas antes de establecer un diagnóstico.'; }
    else {result.status='Banda 41–69 · posible deterioro avanzado';result.interpretation='Banda superior propuesta por el formulario. La muestra de validación declarada no incluyó perros con deterioro avanzado: esta categoría tiene respaldo limitado y no confirma un diagnóstico.';}
  } else if(id==='cfq') {
    const reverse=test.questions.flatMap((q,i)=>[10,14,16].includes(q.originalId)?[i]:[]);
    result.metrics=[tile('OQS · frustración global',normalized(answers,range(21),reverse),1,`${count}/21 ítems`),...cfqComponents.map((label,c)=>{
      const idx=test.questions.flatMap((q,i)=>q.component===c+1?[i]:[]);
      return tile(`PC${c+1} · ${label}`,normalized(answers,idx,reverse),1,`${idx.filter(i=>answers[i]!==null).length}/${idx.length} ítems`);
    })];
    result.status='Perfil descriptivo de frustración';
    result.interpretation='Un valor mayor refleja mayor intolerancia a la frustración informada por el cuidador. PC5 está invertido: valores altos indican más dificultad de afrontamiento. No son porcentajes de enfermedad ni categorías diagnósticas. La versión española es una traducción de trabajo sin validación propia.';
  } else if(id==='fgs') {
    const sum=answers.reduce((s,a)=>s+(a??0),0), fraction=sum/(2*count);
    result.metrics=[tile('Índice facial',fraction,1),tile('Suma observada',sum,2*count,`${count}/5 unidades`)];
    result.status=!complete?'Observación parcial · sin umbral automático':fraction>0.39?'Umbral de intervención alcanzado':'Por debajo del umbral de intervención';
    result.interpretation=!complete?'Faltan unidades por evaluar. Se informa el índice normalizado de las observables, pero esta web no aplica el umbral a un registro parcial. Repetir la observación o solicitar valoración clínica.':fraction>0.39?'El resultado alcanza el umbral del estudio para valorar analgesia de rescate. Solicitar valoración veterinaria del dolor y de la intervención adecuada.':'El resultado queda por debajo del umbral del estudio en esta observación. No descarta dolor. Interpretar junto con el examen clínico.';
  } else if(id==='disc') {
    const labels={d:'D · Dirección',i:'I · Influencia',s:'S · Estabilidad',c:'C · Análisis'};
    result.metrics=Object.entries(labels).map(([k,label])=>tile(label,answers.filter(a=>a===k).length,30));
    const max=Math.max(...result.metrics.map(m=>m.value));
    const winners=result.metrics.filter(m=>m.value===max).map(m=>m.label);
    result.status=winners.length>1?`Preferencias empatadas: ${winners.join(', ')}`:`Preferencia más elegida: ${winners[0]}`;
    result.interpretation='Estos recuentos resumen elecciones en una dinámica no validada. No permiten deducir personalidad estable, capacidad profesional ni compatibilidad. Los porcentajes representan respuestas elegidas, no percentiles poblacionales.';
  }
  if(!complete && ['dias','cfq'].includes(id)) result.interpretation += ` Registro parcial: ${count}/${answers.length} ítems puntuables. Cobertura limitada; no comparar directamente con registros de distinta cobertura. Una subescala sin datos se muestra como no calculable.`;
  return result;
}

export function validateRecord(raw) {
  if(!raw || typeof raw!=='object' || raw.format!=='gemca-respuestas' || raw.schema!==1) throw new Error('El archivo no es un registro GEMCA compatible.');
  const test=getTest(raw.testId);
  if(!test?.questions) throw new Error('Cuestionario desconocido.');
  if(raw.instrumentVersion!=='2026.09.1') throw new Error('La versión del cuestionario no coincide. No se importarán puntuaciones de otra versión.');
  if(!Array.isArray(raw.answers)) throw new Error('El archivo no contiene una lista de respuestas válida.');
  validateAnswers(test,raw.answers.map(a=>a==='pending'?undefined:a),false);
  if(!raw.data || typeof raw.data!=='object' || Array.isArray(raw.data)) throw new Error('Datos de ficha no válidos.');
  const allowed=['patient','record','breed','dob','sex','neutered','weight','chip','guardian','respondent','professional','clinic','date','reason','medical','context','notes','plan','followup','role'];
  const data={};
  for(const k of allowed) { if(raw.data[k]!==undefined) {if(typeof raw.data[k]!=='string'||raw.data[k].length>8000) throw new Error('El archivo contiene un campo demasiado largo o inválido.');data[k]=raw.data[k];} }
  return {testId:raw.testId,answers:raw.answers.map(a=>a==='pending'?undefined:a),data,lang:raw.lang==='en'?'en':'es',manualAcknowledged:raw.manualAcknowledged===true};
}
