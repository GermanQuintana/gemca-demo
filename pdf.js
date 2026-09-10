import {refs, getOptions, VERSION} from './catalog.js';
import {metricDisplay,palette,formatScore} from './result-display.js';

// Pure text layout: searchable PDF, predictable page breaks, no HTML capture.
// jsPDF is vendored locally, so patient data never goes to an external service.
function clean(value) {return String(value??'').replace(/[–—−]/g,'-').replace(/[’‘]/g,"'").replace(/[“”]/g,'"').replace(/α/g,'alfa').replace(/≥/g,'>=').replace(/≤/g,'<=').replace(/→/g,'->').replace(/×/g,'x').replace(/[^\x20-\xFF\n\r\t]/g,'');}

export function createReport(JsPDF,test,session,result,metadata,clientMode=false) {
  const doc=new JsPDF({unit:'mm',format:'a4',compress:true});
  const left=18,width=174,bottom=276;let y=20;
  doc.setProperties({title:`GEMCA - ${test.short} - Informe`,subject:'Cuestionario de apoyo a la valoración veterinaria',author:'Propuesta de herramientas para GEMCA',creator:'GEMCA Cuestionarios'});
  function nextPage(){doc.addPage();doc.setFont('helvetica','bold');doc.setFontSize(8);doc.setTextColor(20,111,107);doc.text(`GEMCA / ${test.short}`,18,13);doc.setDrawColor(222,233,233);doc.line(18,16,192,16);y=25;}
  function ensure(height){if(y+height>bottom)nextPage();}
  function text(value,size=10,bold=false,color=[35,56,60],after=3) {
    doc.setFont('helvetica',bold?'bold':'normal');doc.setFontSize(size);doc.setTextColor(...color);
    const lines=doc.splitTextToSize(clean(value),width);
    const lineHeight=size*0.44;
    if(lines.length*lineHeight<=85)ensure(lines.length*lineHeight+after);
    for(const line of lines){ensure(lineHeight);doc.setFont('helvetica',bold?'bold':'normal');doc.setFontSize(size);doc.setTextColor(...color);doc.text(line,left,y);y+=lineHeight;}
    y+=after;
  }
  function heading(value){ensure(35);y+=5;text(value,13,true,[21,63,67],5);}
  function metricCard(m,index){
    const d=metricDisplay(test,result,index),x=left+6,w=width-12;
    doc.setFont('helvetica','bold');doc.setFontSize(10);
    const titleLines=doc.splitTextToSize(clean(m.label),w-45);
    doc.setFont('helvetica','normal');doc.setFontSize(9);
    const meaningLines=doc.splitTextToSize(clean(d.meaning),w);
    const legendLines=d.bands.map(b=>({color:b.color,lines:doc.splitTextToSize(clean(`${b.label}: ${b.meaning}`),w-5)}));
    const height=42+titleLines.length*4.5+meaningLines.length*4.1+legendLines.reduce((sum,b)=>sum+b.lines.length*3.8+3,0);
    ensure(height+5);const top=y;
    doc.setFillColor(248,251,251);doc.setDrawColor(218,229,229);doc.roundedRect(left,top,width,height,3,3,'FD');
    doc.setFillColor(palette[d.color]);doc.roundedRect(left,top,2,height,1,1,'F');
    let row=top+8;doc.setTextColor(23,58,61);doc.setFont('helvetica','bold');doc.setFontSize(10);doc.text(titleLines,x,row);
    doc.setFontSize(18);doc.text(clean(formatScore(m.value,m.max)),left+width-6,row+2,{align:'right'});
    row+=titleLines.length*4.5+4;doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(75,97,104);doc.text(clean(d.status),x,row);row+=6;
    doc.setFillColor(222,232,234);doc.roundedRect(x,row,w,5,2,2,'F');
    if(d.bands.length){d.bands.forEach(b=>{doc.setFillColor(palette[b.color]);doc.rect(x+(b.from-d.min)/(d.max-d.min)*w,row,(b.to-b.from)/(d.max-d.min)*w,5,'F');});}
    else {doc.setFillColor(palette[d.color]);if(d.position!==null)doc.roundedRect(x,row,Math.max(.01,d.position/100*w),5,1,1,'F');}
    if(d.position!==null){const mx=x+d.position/100*w;doc.setDrawColor(23,58,61);doc.setLineWidth(.65);doc.line(mx,row-1,mx,row+6);doc.setFillColor(23,58,61);doc.triangle(mx-1.5,row-3,mx+1.5,row-3,mx,row-1,'F');doc.setLineWidth(.2);}
    row+=11;doc.setFontSize(8);doc.setTextColor(75,97,104);doc.text(`Mínimo ${clean(formatScore(d.min,m.max))}`,x,row);doc.text(`Máximo ${clean(formatScore(d.max,m.max))}`,x+w,row,{align:'right'});row+=7;
    doc.setFontSize(9);doc.setTextColor(35,56,60);doc.text(meaningLines,x,row);row+=meaningLines.length*4.1+3;
    legendLines.forEach(b=>{doc.setFillColor(palette[b.color]);doc.circle(x+1,row-1,1,'F');doc.setFontSize(8);doc.setTextColor(75,97,104);doc.text(b.lines,x+5,row);row+=b.lines.length*3.8+3;});
    if(m.coverage||test.id==='disc'){doc.setFontSize(8);doc.setTextColor(75,97,104);doc.text(clean(test.id==='disc'?`${(m.value/30*100).toFixed(1).replace('.',',')} % de las elecciones`:`Cobertura: ${m.coverage}`),x,top+height-4);}
    y=top+height+5;
  }
  doc.setFillColor(20,111,107);doc.rect(0,0,210,4,'F');
  text('GEMCA / COMPORTAMIENTO Y BIENESTAR',9,true,[20,111,107]);
  text(`${test.short} - ${test.title}`,22,true,[21,63,67],5);
  text(clientMode?'Resumen para revisión veterinaria':'Informe de evaluación',11,false);
  text(`Versión ${VERSION} | ${test.id==='cfq'?(session.lang==='en'?'Original inglés':'Español: traducción de trabajo no validada'):'Español'} | ${result.count}/${result.total} respuestas evaluables`,9,false,[83,108,112]);
  text('Propuesta de trabajo para GEMCA. Pendiente de revisión institucional.',8,false,[83,108,112]);
  heading(test.id==='disc'?'Ficha de la actividad':'Ficha del paciente');
  if(!metadata.length)text('Sin datos de identificación.');
  for(const [label,value] of metadata) text(`${label}: ${value}`);
  heading('Resultados');
  text('El marcador sitúa el resultado entre su mínimo y máximo posibles. Los colores solo representan categorías clínicas cuando se indican bandas con respaldo.',9,false,[83,108,112]);
  result.metrics.forEach(metricCard);
  heading(result.status);
  text(result.interpretation);
  heading(test.id==='disc'?'Sugerencias para la conversación':'Orientaciones para la revisión clínica');
  result.guidance.forEach((g,i)=>text(`${i+1}. ${g}`));
  text(test.id==='disc'?'Actividad no validada. No usar para selección de personal o diagnóstico.':'Orientaciones generales, no un diagnóstico ni un tratamiento individualizado.',9,false,[83,108,112]);
  if(!clientMode) {
    [['notes',test.id==='disc'?'Observaciones de la actividad':'Valoración del veterinario'],['plan',test.id==='disc'?'Acuerdos':'Indicaciones individualizadas'],['followup','Seguimiento']].forEach(([key,title])=>{heading(title);text(session.data[key]||'Pendiente de completar.');});
  }
  ensure(90);heading('Evidencia y límites');text(test.evidence);text(test.method);
  heading('Referencias');
  if(!test.refs.length)text('Fuente: cuestionario aportado por el usuario. No se ha documentado validación de esta versión.');
  test.refs.forEach((key,i)=>{doc.setFont('helvetica','normal');doc.setFontSize(9);const citationHeight=doc.splitTextToSize(clean(refs[key].title),width).length*4;doc.setFontSize(8);const urlHeight=doc.splitTextToSize(refs[key].url,width).length*3.6;ensure(citationHeight+urlHeight+12);text(`${i+1}. ${refs[key].title}`,9);text(refs[key].url,8,false,[20,111,107],5);});
  text(test.license,8,false,[83,108,112]);
  if(test.questions.length>5||y>150)nextPage();else y+=8;
  heading('Anexo - cuestionario y respuestas');
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
