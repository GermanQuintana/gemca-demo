// Shared presentation metadata: the screen and PDF use the same ranges.
export const palette={green:'#299367',amber:'#d69a20',red:'#ce5964',blue:'#428fbb',teal:'#198e91',purple:'#8970b5',neutral:'#86979f'};
export const formatScore=(n,max=1)=>n===null?'No calculable':max===1?n.toFixed(3).replace('.',','):String(n);
export function metricDisplay(test,result,index){
  const m=result.metrics[index];
  const d={min:['dias','cfq'].includes(test.id)?0.2:0,max:m.max,color:'teal',bands:[],status:'Perfil descriptivo',low:'Menor puntuación',high:'Mayor puntuación',meaning:'La posición muestra la puntuación dentro del intervalo posible, no un porcentaje de enfermedad.'};
  if(test.id.startsWith('glasgow-')){
    d.low='Menor puntuación';d.high='Mayor puntuación';
    if(result.complete){const cut=result.threshold;d.bands=[{from:0,to:cut-.5,label:`0–${cut-1} · Bajo umbral`,color:'green',meaning:'No descarta dolor. Mantener valoración clínica.'},{from:cut-.5,to:m.max,label:`${cut}–${m.max} · Valorar analgesia`,color:'red',meaning:'Umbral de intervención alcanzado: valorar analgesia de rescate por el veterinario.'}];const b=d.bands[m.value>=cut?1:0];d.color=b.color;d.status=b.label;d.meaning=b.meaning;}
  }else if(test.id==='dias'){
    const meanings=['Mayor índice: más impulsividad informada por el cuidador.','Mayor puntuación: más dificultades de regulación conductual.','Mayor puntuación: más respuestas de agresión o rechazo de la novedad informadas.','Mayor puntuación: mayor capacidad de respuesta e interés. No equivale a mayor gravedad; la consistencia de este factor es limitada.'];
    d.meaning=meanings[index];d.low=index===3?'Menor respuesta':'Menor puntuación';d.high=index===3?'Mayor respuesta':'Mayor puntuación';d.color=index===3?'purple':'blue';
  }else if(test.id==='cfq'){
    d.meaning=['Mayor índice: mayor intolerancia a la frustración informada.','Mayor puntuación: frustración en más situaciones cotidianas.','Mayor puntuación: más persistencia ante barreras que impiden acceder a algo.','Mayor puntuación: más dificultad cuando no se cumplen las expectativas.','Mayor puntuación: más respuestas relacionadas con pérdida de control o acceso a recursos.','Mayor puntuación: más dificultad para afrontar la frustración; estos ítems se puntúan a la inversa.'][index];d.color='blue';
  }else if(test.id==='eecc'){
    d.meaning='Mayor puntuación: mayor frecuencia de cambios informados en este dominio. No existen bandas clínicas específicas para esta subescala.';
    if(index===0&&result.complete){
      d.bands=[{from:0,to:7.5,label:'0–7 · Banda inferior',color:'green',meaning:'Compatible con envejecimiento normal según el formulario; no descarta enfermedad.'},{from:7.5,to:40.5,label:'8–40 · Alerta',color:'amber',meaning:'Posible deterioro leve: requiere valoración clínica y descartar otras causas.'},{from:40.5,to:69,label:'41–69 · Mayor afectación',color:'red',meaning:'Posible deterioro avanzado. Esta banda no contó con casos avanzados en la muestra de validación declarada.'}];
      const b=d.bands[m.value<=7?0:m.value<=40?1:2];d.color=b.color;d.status=b.label;d.meaning=b.meaning;d.low='Menos cambios';d.high='Más cambios';
    }
  }else if(test.id==='fgs'){
    d.low='Menor expresión facial';d.high='Mayor expresión facial';
    if(result.complete){
      const threshold=index===0?0.39:3.9;
      d.bands=[{from:0,to:threshold,label:index===0?'≤0,39 · Bajo umbral':'0–3 · Bajo umbral',color:'green',meaning:'No descarta dolor. Interpretar con la exploración clínica.'},{from:threshold,to:m.max,label:index===0?'>0,39 · Valorar analgesia':'4–10 · Valorar analgesia',color:'red',meaning:'Se alcanza el umbral para valoración veterinaria del dolor y de analgesia.'}];
      const b=d.bands[m.value>threshold?1:0];d.color=b.color;d.status=b.label;d.meaning=b.meaning;
    }
  }else if(test.id==='disc'){
    d.color=['red','amber','teal','purple'][index];d.status='Preferencia de comunicación';d.low='0 elecciones';d.high='30 elecciones';d.meaning='El color identifica un estilo, no si es bueno o malo. Más elecciones no significan mayor competencia ni un rasgo estable.';
  }
  if(!result.complete){d.status='Registro parcial';d.bands=[];if(['eecc','fgs'].includes(test.id))d.meaning='Hay respuestas no valorables. Se muestra la puntuación disponible sin clasificación por umbrales.';}
  if(m.value===null){d.status='Sin datos evaluables';d.color='neutral';d.bands=[];d.meaning='No se puede situar un resultado en la escala sin respuestas evaluables.';}
  d.position=m.value===null?null:Math.max(0,Math.min(100,(m.value-d.min)/(d.max-d.min)*100));
  return d;
}
