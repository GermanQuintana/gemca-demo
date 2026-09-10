import {refs, getOptions, VERSION} from './catalog.js';

// Pure text layout: searchable PDF, predictable page breaks, no HTML capture.
// jsPDF is vendored locally, so patient data never goes to an external service.
function clean(value) {return String(value??'').replace(/[–—−]/g,'-').replace(/[’‘]/g,"'").replace(/[“”]/g,'"').replace(/α/g,'alfa').replace(/≥/g,'>=').replace(/≤/g,'<=').replace(/→/g,'->').replace(/×/g,'x').replace(/[^\x20-\xFF\n\r\t]/g,'');}

export function createReport(JsPDF,test,session,result,metadata,clientMode=false) {
  const doc=new JsPDF({unit:'mm',format:'a4',compress:true});
  const left=18,width=174,bottom=276;let y=20;
  doc.setProperties({title:`GEMCA - ${test.short} - Informe`,subject:'Cuestionario de apoyo a la valoración veterinaria',author:'Propuesta de herramientas para GEMCA',creator:'GEMCA Cuestionarios'});
  function nextPage(){doc.addPage();y=22;}
  function ensure(height){if(y+height>bottom)nextPage();}
  function text(value,size=10,bold=false,color=[35,56,60],after=3) {
    doc.setFont('helvetica',bold?'bold':'normal');doc.setFontSize(size);doc.setTextColor(...color);
    const lines=doc.splitTextToSize(clean(value),width);
    const lineHeight=size*0.44;
    for(const line of lines){ensure(lineHeight);doc.text(line,left,y);y+=lineHeight;}
    y+=after;
  }
  function heading(value){ensure(22);y+=5;text(value,13,true,[21,63,67],5);}
  text('GEMCA / COMPORTAMIENTO Y BIENESTAR',9,true,[20,111,107]);
  text(`${test.short} - ${test.title}`,22,true,[21,63,67],5);
  text(clientMode?'Resumen para revisión veterinaria':'Informe de evaluación',11,false);
  text(`Versión ${VERSION} | ${test.id==='cfq'?(session.lang==='en'?'Original inglés':'Español: traducción de trabajo no validada'):'Español'} | ${result.count}/${result.total} respuestas evaluables`,9,false,[83,108,112]);
  text('Propuesta de trabajo para GEMCA. Pendiente de revisión institucional.',8,false,[83,108,112]);
  heading(test.id==='disc'?'Ficha de la actividad':'Ficha del paciente');
  if(!metadata.length)text('Sin datos de identificación.');
  for(const [label,value] of metadata) text(`${label}: ${value}`);
  heading('Resultados');
  result.metrics.forEach(m=>{
    const value=m.value===null?'No calculable':m.max===1?m.value.toFixed(3).replace('.',','):`${m.value} / ${m.max}`;
    const extra=test.id==='disc'?` (${(m.value/30*100).toFixed(1).replace('.',',')} % de elecciones)`:m.coverage?` (${m.coverage})`:'';
    text(`${m.label}: ${value}${extra}`,10,true);
  });
  heading(result.status);
  text(result.interpretation);
  heading(test.id==='disc'?'Sugerencias para la conversación':'Orientaciones para la revisión clínica');
  result.guidance.forEach((g,i)=>text(`${i+1}. ${g}`));
  text(test.id==='disc'?'Actividad no validada. No usar para selección de personal o diagnóstico.':'Orientaciones generales, no un diagnóstico ni un tratamiento individualizado.',9,false,[83,108,112]);
  if(!clientMode) {
    [['notes',test.id==='disc'?'Observaciones de la actividad':'Valoración del veterinario'],['plan',test.id==='disc'?'Acuerdos':'Indicaciones individualizadas'],['followup','Seguimiento']].forEach(([key,title])=>{heading(title);text(session.data[key]||'Pendiente de completar.');});
  }
  heading('Evidencia y límites');text(test.evidence);text(test.method);
  heading('Referencias');
  if(!test.refs.length)text('Fuente: cuestionario aportado por el usuario. No se ha documentado validación de esta versión.');
  test.refs.forEach((key,i)=>{text(`${i+1}. ${refs[key].title}`,9);text(refs[key].url,8,false,[20,111,107],5);});
  text(test.license,8,false,[83,108,112]);
  nextPage();heading('Anexo - cuestionario y respuestas');
  test.questions.forEach((q,i)=>{
    const question=test.id==='cfq'&&session.lang==='en'?q.en:q.text;
    const option=getOptions(test,i).find(o=>o.value===session.answers[i]);
    const answer=test.id==='cfq'&&session.lang==='en'?(session.answers[i]===null?'Don’t know / not applicable':['','Strongly disagree','Mainly disagree','Partly agree, partly disagree','Mainly agree','Strongly agree'][session.answers[i]]):option?.text||'No respondida';
    doc.setFontSize(10);doc.setFont('helvetica','bold');
    const estimated=doc.splitTextToSize(clean(question),width).length*4.4+16;
    ensure(Math.min(estimated,70));
    text(`${i+1}. ${question}`,10,true);text(`Respuesta: ${answer}`,10,false,[83,108,112],6);
  });
  const count=doc.getNumberOfPages();
  for(let i=1;i<=count;i++){doc.setPage(i);doc.setDrawColor(210,224,224);doc.line(18,282,192,282);doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(83,108,112);doc.text(`GEMCA | ${test.short} | v${VERSION}`,18,288);doc.text(`${i} / ${count}`,192,288,{align:'right'});}
  return doc;
}

let loader;
function loadJsPDF(){
  if(globalThis.jspdf?.jsPDF)return Promise.resolve(globalThis.jspdf.jsPDF);
  if(!loader)loader=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=new URL('./vendor/jspdf.umd.min.js',import.meta.url).href;script.onload=()=>globalThis.jspdf?.jsPDF?resolve(globalThis.jspdf.jsPDF):reject(new Error('Biblioteca PDF no disponible'));script.onerror=()=>{loader=null;script.remove();reject(new Error('No se pudo cargar la biblioteca PDF'));};document.head.append(script);});
  return loader;
}
export async function downloadReport(test,session,result,metadata,clientMode) {
  const JsPDF=await loadJsPDF();
  const doc=createReport(JsPDF,test,session,result,metadata,clientMode);
  doc.save(`GEMCA-${test.short}-${session.data.date||'informe'}.pdf`);
}
