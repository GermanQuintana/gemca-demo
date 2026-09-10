const options=(max,mobility=false)=>[...Array.from({length:max+1},(_,value)=>({value,text:`${value} puntos · según formulario original`})),{value:null,text:'No evaluado'},...(mobility?[{value:'omitted',text:'Movilidad imposible de evaluar · usar variante /20'}]:[])];
const common={category:'Dolor y bienestar',kind:'pain',time:'Según evaluación clínica',badge:'Escala validada · registro',badgeType:'',professionalOnly:true,
  note:'Uso veterinario · trasladar puntuaciones del formulario original.',
  instructions:'Abre el formulario original, sigue su protocolo y traslada aquí la puntuación de cada apartado. Los números no sustituyen sus descriptores. La evaluación interactiva corresponde a personal veterinario; no pedir a la familia que palpe zonas dolorosas. Indica en el contexto la hora, la sedación y la analgesia administrada.',
  license:'Glasgow CMPS: derechos de sus titulares; las hojas originales indican condiciones para uso personal y educativo y permisos adicionales para otros usos. Se enlazan los originales y se registran valores numéricos; no se reproducen descriptores completos ni imágenes. Esta calculadora no es una nueva versión española validada.',
  guidance:['Interpretar junto con la exploración, el contexto y el nivel de conciencia. Sedación, miedo o déficits motores pueden alterar la evaluación.','Al alcanzar el umbral, valorar analgesia de rescate por el veterinario y reevaluar la respuesta según el protocolo clínico. El resultado no prescribe fármacos ni dosis.','Por debajo del umbral no se descarta dolor. Registrar fecha, hora, tratamiento y observador para comparar evaluaciones.']};
export const glasgowTests=[
  {...common,id:'glasgow-dog',short:'CMPS-SF',title:'Glasgow · dolor canino',species:'Perro',manualRef:'glasgowDogForm',
    summary:'Registro de Glasgow canina: seis dominios y umbral de intervención, con o sin movilidad evaluable.',
    evidence:'CMPS-SF fue desarrollada y validada para dolor agudo canino. La guía WSAVA documenta seis categorías y las variantes /24 y /20. La calculadora requiere aplicar el formulario original; no valida una administración modificada.',
    method:'Máximos por dominio: 3, 4, 4, 5, 4 y 4. Total /24, umbral ≥6. Solo si la movilidad es imposible de evaluar se omite ese dominio: total /20, umbral ≥5. Otras ausencias generan un subtotal sin umbral; no se imputan ceros.',
    refs:['glasgowDogGuide','glasgowDogForm'],questions:[['Vocalización',3],['Atención a la zona dolorosa',4],['Movilidad',4],['Respuesta al contacto',5],['Actitud general',4],['Postura y actividad',4]].map(([text,max],i)=>({text,options:options(max,i===2)}))},
  {...common,id:'glasgow-cat',short:'CMPS-F',title:'Glasgow · dolor felino',species:'Gato',manualRef:'glasgowCatForm',
    summary:'Registro de CMPS-Feline /20, incluyendo las dos puntuaciones faciales del formulario original.',
    evidence:'CMPS-Feline incorpora siete categorías, con dos puntuaciones faciales en la pregunta 4. El formulario y su guía señalan un máximo de 20 y un umbral de intervención de 5. No confundir esta versión con escalas felinas anteriores de distinto máximo.',
    method:'Trasladar Q1, Q2, Q3, Q4a, Q4b, Q5, Q6 y Q7, con máximos 1, 4, 1, 2, 2, 2, 4 y 4. Suma /20; umbral ≥5. Las unidades faciales se valoran con las imágenes originales, no con FGS. Con algún apartado no evaluado se informa subtotal sin umbral.',
    refs:['glasgowCatForm','glasgowCatGuide'],questions:[['Q1 · Vocalización',1],['Q2 · Postura y conducta',4],['Q3 · Atención a zona dolorosa',1],['Q4a · Orejas (imagen original)',2],['Q4b · Hocico (imagen original)',2],['Q5 · Respuesta a la interacción',2],['Q6 · Respuesta a la exploración',4],['Q7 · Impresión general',4]].map(([text,max])=>({text,options:options(max)}))}
];
export const glasgowRefs={
  glasgowDogGuide:{title:'WSAVA. Measuring Acute Pain in the Dog with the Glasgow Composite Measure Pain Scale (CMPS-SF). Guía de puntuación y umbrales.',url:'https://wsava.org/wp-content/uploads/2020/01/WSAVA-Glasgow-SF-Dog-Tool-Guidance.pdf'},
  glasgowDogForm:{title:'University of Glasgow. CMPS-SF: formulario original y protocolo para perros (en inglés).',url:'https://www.gla.ac.uk/media/Media_62508_smxx.pdf'},
  glasgowCatForm:{title:'Universities of Glasgow & Edinburgh Napier. CMPS-Feline. Formulario original alojado por WSAVA (en inglés).',url:'https://wsava.org/wp-content/uploads/2020/01/Feline-CMPS-SF.pdf'},
  glasgowCatGuide:{title:'CMPS-Feline: formulario y guía de uso, reproducidos con permiso por Zoetis Australia. Máximo 20 y umbral 5.',url:'https://www2.zoetis.com.au/content/en/pages/Microsites/Expert-Lounge/Assets/Glasgow-Composite-Pain-Score-Feline_DIGITAL.pdf'}
};
