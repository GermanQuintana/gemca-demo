import { supplied } from './supplied-data.js';
import {glasgowTests,glasgowRefs} from './glasgow.js';

export const VERSION = '2026.09.1';
export const refs = {
  ...glasgowRefs,
  dias: { title: 'Wright HF, Mills DS, Pollux PMJ. Development and Validation of a Psychometric Tool for Assessing Impulsivity in the Domestic Dog (Canis familiaris). International Journal of Comparative Psychology. 2011;24:210–225.', url: 'https://escholarship.org/content/qt7pb1j56q/qt7pb1j56q.pdf' },
  diasLicense: { title: 'University of Lincoln · K9 Metrics. Canine Impulsivity Profile: condiciones de uso y acceso al instrumento.', url: 'https://www.k9metrics.com/canine-assessment-tools/impulsivity-profile/' },
  eecc: { title: 'CAWEC para Purina. Escala de Evaluación Cognitiva Canina (EECC). Formulario original en español, 2 páginas; basado en Landsberg, Mad’ari y Zika (2017).', url: 'https://www.vetcenter.purina.es/sites/default/files/materials-pdfs/20.%20Escala%20CAWEC%20de%20Evaluacion%20Cognitiva.pdf' },
  cfq: { title: 'McPeake KJ, Collins LM, Zulch H, Mills DS. The Canine Frustration Questionnaire—Development of a New Psychometric Tool for Measuring Frustration in Domestic Dogs (Canis familiaris). Front Vet Sci. 2019;6:152. doi:10.3389/fvets.2019.00152.', url: 'https://www.frontiersin.org/journals/veterinary-science/articles/10.3389/fvets.2019.00152/full' },
  cfq2: { title: 'McPeake KJ et al. Behavioural and Physiological Correlates of the Canine Frustration Questionnaire. 2021. Estudio de correlatos conductuales y fisiológicos.', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8698056/' },
  fgs: { title: 'Evangelista MC et al. Facial expressions of pain in cats: the development and validation of a Feline Grimace Scale. Scientific Reports. 2019;9:19128. doi:10.1038/s41598-019-55693-8.', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6911058/' },
  fgsManual: { title: 'Université de Montréal. Feline Grimace Scale: formación, manual y criterios visuales oficiales.', url: 'https://www.felinegrimacescale.com/practice-your-skills' },
  fgsSpanish: { title: 'Feline Grimace Scale. Sitio oficial en español.', url: 'https://www.felinegrimacescale.com/es' },
  cbarq: { title: 'University of Pennsylvania. C-BARQ: instrumento desarrollado y validado por Hsu y Serpell (2003). Acceso y documentación oficial.', url: 'https://vetapps.vet.upenn.edu/cbarq/about.cfm' },
  febarq: { title: 'University of Pennsylvania. Fe-BARQ: descripción y acceso al cuestionario de comportamiento felino.', url: 'https://vetapps.vet.upenn.edu/febarq/about.cfm' },
  penn: { title: 'University of Pennsylvania, Powell Laboratory. Uso de C-BARQ y Fe-BARQ como cuestionarios validados en investigación.', url: 'https://www.vet.upenn.edu/research/research-laboratories/powell-laboratory/research/' },
  cognitive: { title: 'Haake JA et al. Comparing standard screening questionnaires of canine behavior for assessment of cognitive dysfunction. Front Vet Sci. 2024. doi:10.3389/fvets.2024.1374511.', url: 'https://www.frontiersin.org/journals/veterinary-science/articles/10.3389/fvets.2024.1374511/full' }
};

const agreement = [
  {value:1,text:'Totalmente en desacuerdo'}, {value:2,text:'Mayormente en desacuerdo'},
  {value:3,text:'En parte de acuerdo y en parte en desacuerdo'}, {value:4,text:'Mayormente de acuerdo'},
  {value:5,text:'Totalmente de acuerdo'}, {value:null,text:'No sé / No aplica'}
];
const eeccQuestions = supplied.eecc.map(q => ({text:q.text}));
eeccQuestions[4].text = '¿No responde a ciertos estímulos a los cuales acostumbraba a responder (p. ej., timbre de la puerta, ruidos fuertes)?';
eeccQuestions[8].text = '¿Muestra más signos de miedo (p. ej., orejas hacia atrás, cuerpo agachado, evitar contacto) o agresividad (p. ej., gruñir, enseñar los dientes, morder)?';
const eeccGroups = [[0,'Desorientación'],[6,'Interacción social'],[9,'Sueño y vigilia'],[11,'Aprendizaje y eliminación'],[13,'Actividad'],[16,'Ansiedad']];
eeccGroups.forEach(([i,group])=>eeccQuestions[i].group=group);

// Source: McPeake et al. 2019, Table 1, CC BY. Original retained item order,
// not the initial 33-item questionnaire. Spanish is a non-validated translation.
const cfqRows = [
  [1,3,'Mi perro parece inquieto cuando se retrasa su rutina (p. ej., paseo o comida más tarde de lo habitual).','My dog appears unsettled when there are delays in his/her routine (e.g., if walked or fed later than usual)'],
  [2,3,'A mi perro no le gusta quedar excluido de actividades con otros perros.','My dog does not like being left out of activities with other dogs'],
  [4,4,'Mi perro protege su territorio (casa, jardín o coche).','My dog is protective of his/her territory (house, garden, car)'],
  [6,2,'Con la correa puesta, mi perro insiste en tirar o abalanzarse hacia algo que quiere perseguir (p. ej., gato, conejo, pájaro o juguete).','When on lead my dog will persist in lunging/pulling toward something he/she would like to chase (e.g., a cat, rabbit, bird, toy)'],
  [10,5,'A mi perro le resulta fácil relajarse y acomodarse cuando no puede acceder a algo que quiere.','My dog finds it easy to relax and settle when unable to access something he/she wants'],
  [11,1,'Mi perro realiza una conducta repetitiva (p. ej., perseguirse la cola, ir de un lado a otro o dar vueltas) cuando no puede acceder a algo que quiere.','My dog engages in a repetitive behavior (e.g., tail chasing, pacing, circling) when unable to access something he/she wants'],
  [12,4,'Mi perro intenta escapar si trato de confinarlo (p. ej., en una habitación, transportín o chenil).','My dog will attempt to escape if I try to confine him/her (e.g., in a room, crate, or kennel)'],
  [13,4,'Mi perro muestra agresividad (gruñe, intenta morder o muerde) si intento quitarle un objeto que tiene (p. ej., juguete favorito o comida).','My dog becomes aggressive (i.e., growl, snap, or bite) if I try to remove an item he/she has (e.g., favorite toy or food)'],
  [14,5,'Mi perro parece llevar bien que se le niegue el acceso a cosas que a veces se le permiten (p. ej., sofá, cama o sobras de comida).','My dog appears to cope well when denied access to things he/she is occasionally allowed (e.g., access to the sofa/bed or provision of table scraps)'],
  [16,5,'Me resulta fácil interrumpir o distraer a mi perro cuando está haciendo algo que quiere hacer.','I find it easy to interrupt/distract my dog from doing things he/she wants to do'],
  [18,2,'A mi perro le cuesta responder a señales u órdenes (p. ej., sentarse, tumbarse o quedarse quieto) si quiere hacer otra cosa o acceder a algo.','My dog has difficulty in responding to cues/commands (e.g., sit, lie down, stay) if there is something else he/she wants to do or access'],
  [19,1,'Mi perro se frustra en una gran variedad de situaciones.','My dog becomes frustrated in a large range of situations'],
  [21,1,'Mi perro aumenta ciertas conductas (p. ej., lamerse los labios, bostezar, montar o sacudir todo el cuerpo) si no puede acceder inmediatamente a algo que quiere.','My dog shows increases in certain behaviors (e.g., lip licking, yawning, mounting, full body shake off) if he/she cannot immediately access something they want'],
  [22,1,'Hay días en que mi perro parece frustrarse con más facilidad que otros, sin motivo aparente.','There are days when my dog seems to become more easily frustrated than others for no apparent reason'],
  [23,4,'Cuando no está ocupado, mi perro puede lamerse, morderse o mordisquearse repetidamente partes de su cuerpo (p. ej., patas o costados).','When my dog is not kept busy, he/she can repeatedly lick, chew, or nibble their own body parts (e.g., paws, flanks/sides)'],
  [25,2,'Mi perro se altera si se le separa de las visitas con una puerta (p. ej., vocaliza o araña la puerta).','My dog gets upset if shut away from visitors (e.g., vocalizes or scratches/digs at the door)'],
  [26,2,'Mi perro sigue intentando acercarse a un perro o una persona a quien quiere saludar (p. ej., se abalanza o tira) cuando se le impide hacerlo, por ejemplo con la correa.','My dog shows continued efforts (e.g., lunging, pulling toward) to approach a dog/person they wish to greet, when being restrained from doing so (e.g., when on lead)'],
  [29,1,'Mi perro parece frustrarse con frecuencia (p. ej., al menos una vez al día).','My dog appears to become frustrated frequently (e.g., at least once daily)'],
  [30,3,'Mi perro se excita mucho o se inquieta (p. ej., camina, gime, ladra o salta) mientras espera una actividad que disfruta.','My dog becomes very excited/restless (e.g., pacing, whining, barking, jumping up) when waiting to take part in an enjoyable activity'],
  [32,3,'Mi perro parece agitado e inquieto cuando quiere algo que tiene otro perro (p. ej., un juguete o comida).','My dog appears agitated and unsettled when he/she wants something another dog has (e.g., a toy or food item)'],
  [33,4,'Mi perro parece molesto si recibe menos de lo que esperaba (p. ej., una caricia en vez de comida, menos cantidad o comida de menor calidad).','My dog appears annoyed/upset if given less than he/she was expecting (e.g., wants table scrap and gets a pat on the head; given less food/a lower quality of food than expecting)']
];

export const catalog = [
  ...glasgowTests,
  {id:'dias',short:'DIAS',title:'Impulsividad canina',category:'Conducta y emoción',kind:'behavior',species:'Perro',time:'5–8 min',badge:'Original validado',badgeType:'amber',
   summary:'Explora regulación conductual, respuesta a la novedad y capacidad de respuesta.',
   note:'Adaptación española aportada · validación de esta traducción no acreditada.',
   evidence:'Wright, Mills y Pollux (2011) estudiaron el instrumento original en 560 perros. Esta adaptación española no tiene una validación lingüística acreditada en los materiales revisados. Las subescalas no son diagnósticos; el factor 3 tiene una consistencia interna limitada (α = 0,44).',
   method:'OQS: suma corregida / (5 × ítems puntuables). Inversión de los ítems 10–15 en el total. Factores con su propia clave; F3 incluye el ítem 15. Se excluye «No aplica» y se informa la cobertura. Sin categorías clínicas derivadas de medias poblacionales.',
   license:'Adaptación aportada por Germán Quintana. El titular del original, University of Lincoln, indica uso personal gratuito y contacto para uso comercial. Revisar las condiciones antes de distribuir la adaptación para actividad profesional.',
   instructions:'Responde según el comportamiento habitual de tu perro, no solo según un episodio. No provoques situaciones para comprobar cómo reacciona. Utiliza «No sé / No aplica» si no puedes valorarlo.',
   refs:['dias','diasLicense'], options:agreement, questions:supplied.dias.map(text=>({text})),
   guidance:['Contrastar las respuestas con ejemplos, contexto, frecuencia y recuperación tras la excitación.','Valorar posibles causas médicas y la función de la conducta antes de formular un plan individual.','La puntuación describe respuestas del cuidador. No determina por sí sola agresividad, diagnóstico ni necesidad de medicación.']},
  {id:'eecc',short:'EECC',title:'Cambios cognitivos',category:'Cognición y envejecimiento',kind:'cognition',species:'Perro',time:'5–7 min',badge:'Validación limitada',badgeType:'amber',
   summary:'Registra cambios de orientación, interacción, sueño, aprendizaje, actividad y ansiedad.',
   note:'Ponderación corregida · máximo 69 puntos.',
   evidence:'El formulario CAWEC/Purina declara validación en 100 perros para distinguir envejecimiento normal y deterioro leve. No incluyó casos avanzados. No se ha localizado en esta revisión un artículo primario con los detalles psicométricos de esa muestra. No debe confundirse con CADES o CCDR.',
   method:'17 ítems, de 0 a 3. Los seis ítems de desorientación se multiplican por 2; el resto por 1. Total 0–69. Bandas del formulario: 0–7, 8–40 y 41–69. Con «No valorable» se muestra solo un subtotal y no se asigna banda.',
   license:'CAWEC para Purina. Integración revisada del formulario aportado; enlace al original. Los derechos del instrumento pertenecen a sus titulares.',
   instructions:'Valora los cambios observados en los últimos 6 meses. Si no puedes evaluar un comportamiento, marca «No valorable». El veterinario debe descartar otras causas de los cambios.',
   refs:['eecc'],options:[{value:0,text:'Nunca'},{value:1,text:'Una vez al mes'},{value:2,text:'Una vez a la semana'},{value:3,text:'Casi todos los días'},{value:null,text:'No valorable'}],questions:eeccQuestions,
   guidance:['Relacionar los cambios con su inicio, progresión, entorno y tratamientos actuales.','Explorar dolor, alteraciones sensoriales, enfermedad sistémica y causas neurológicas antes de atribuirlos a deterioro cognitivo.','Un cambio repentino, convulsiones o una alteración marcada de conciencia requieren atención clínica urgente, independientemente de la puntuación.']},
  {id:'cfq',short:'CFQ',title:'Frustración canina',category:'Conducta y emoción',kind:'behavior',species:'Perro',time:'7–10 min',badge:'Original validado',badgeType:'amber',
   summary:'Explora frustración ante barreras, expectativas incumplidas y dificultades para recuperar la calma.',
   note:'Nuevo · original inglés y traducción de trabajo identificada.',
   evidence:'McPeake et al. (2019) desarrollaron el CFQ con 2.348 respuestas y evaluaron fiabilidad temporal y entre cuidadores. Retuvieron 21 ítems y cinco componentes; α global = 0,792. El estudio de 2021 aporta correlatos conductuales y fisiológicos. La traducción de trabajo al español de esta web no está validada.',
   method:'21 ítems de 1 a 5. Inversión de los ítems originales 10, 14 y 16. OQS y cada componente: suma corregida / (5 × número de respuestas puntuables). Los N/A se excluyen del denominador. No hay umbrales diagnósticos en esta implementación.',
   license:'Ítems en inglés y estructura reproducidos de la tabla 1 de McPeake et al. (2019), bajo CC BY. Traducción española de trabajo realizada para esta propuesta; no es una versión validada. Los identificadores originales se conservan.',
   instructions:'Piensa en el comportamiento habitual de tu perro. No generes frustración ni retires comida u objetos para responder. Elige español (traducción de trabajo) o inglés (texto del estudio). Marca «No sé / No aplica» si no lo has observado.',
   refs:['cfq','cfq2'],options:agreement,questions:cfqRows.map(([originalId,component,text,en])=>({originalId,component,text,en})),
   guidance:['Documentar qué impide acceder al recurso, qué esperaba el perro y cuánto tarda en recuperarse.','Comprobar el contexto de los ítems destacados mediante entrevista y observaciones seguras. No realizar pruebas que provoquen agresión.','En perros menores de 2 años, interpretar con especial cautela el ítem de territorialidad: su estabilidad temporal se estudió excluyendo perros inmaduros.']},
  {id:'fgs',short:'FGS',title:'Dolor agudo felino',category:'Dolor y bienestar',kind:'pain',species:'Gato',time:'1–2 min',badge:'Escala validada',badgeType:'',
   summary:'Hoja de puntuación de las cinco unidades faciales de la Feline Grimace Scale.',
   note:'Nuevo · requiere consultar los criterios visuales oficiales.',
   evidence:'Evangelista et al. (2019) desarrollaron y validaron la escala para dolor agudo felino. Esta hoja calcula puntuaciones introducidas por el observador; no reconoce expresiones ni sustituye el entrenamiento con el manual.',
   method:'Cinco unidades de 0 a 2. Se informa suma/(2 × unidades observables). Umbral del estudio >0,39, equivalente a ≥4/10 con todas las unidades. Como decisión conservadora de esta web, con unidades no evaluables no se aplica el umbral automáticamente.',
   license:'Feline Grimace Scale © Université de Montréal. Esta web enlaza el manual oficial y ofrece una hoja de cálculo; no reproduce sus fotografías ni se presenta como aplicación oficial.',
   instructions:'Observa al gato sin molestarlo durante 30 segundos. Espera si duerme, come, se acicala o vocaliza. Consulta el manual oficial para asignar 0, 1 o 2 a cada unidad facial.',
   refs:['fgs','fgsManual','fgsSpanish'],options:[{value:0,text:'0 · Ausente'},{value:1,text:'1 · Moderada o incierta'},{value:2,text:'2 · Evidente'},{value:null,text:'No evaluable'}],
   questions:['Posición de las orejas','Estrechamiento orbital','Tensión del hocico','Posición de los bigotes','Posición de la cabeza'].map(text=>({text})),
   guidance:['Integrar esta observación con la exploración y el contexto clínico. El miedo, el sueño y otros factores pueden dificultar la valoración.','Si se alcanza el umbral, contactar con el veterinario para valorar dolor y analgesia. No administrar fármacos por cuenta propia.','Una puntuación inferior al umbral no descarta dolor ni sustituye una exploración.']},
  {id:'cbarq',short:'C-BARQ',title:'Perfil conductual canino',category:'Conducta y emoción',kind:'behavior',species:'Perro',time:'15–20 min',badge:'Recurso validado',badgeType:'',external:'https://vetapps.vet.upenn.edu/cbarq/',
   summary:'Evaluación amplia de conductas habituales y problemas de comportamiento del perro.',note:'Se completa en la plataforma de University of Pennsylvania.',
   evidence:'Desarrollado y validado por Hsu y Serpell (2003). Su plataforma permite recoger información estandarizada del cuidador. La versión utilizada y el idioma deben documentarse.',method:'Administración y puntuación en la plataforma oficial. Esta web no reconstruye sus baremos ni almacena allí respuestas automáticamente.',license:'Consultar las condiciones de University of Pennsylvania. Se enlaza el recurso original.',refs:['cbarq']},
  {id:'febarq',short:'Fe-BARQ',title:'Perfil conductual felino',category:'Conducta y emoción',kind:'behavior',species:'Gato',time:'10–15 min',badge:'Recurso validado',badgeType:'',external:'https://vetapps.vet.upenn.edu/febarq/',
   summary:'Una visión amplia del comportamiento del gato a partir de situaciones cotidianas.',note:'100 ítems · acceso a la plataforma oficial.',
   evidence:'University of Pennsylvania describe un cuestionario de 100 ítems y lo identifica entre sus instrumentos validados de investigación. Revisar la versión y disponibilidad de idioma en la plataforma oficial.',method:'Administración y resultados en el recurso original. No se calculan subescalas locales.',license:'Consultar las condiciones de University of Pennsylvania. Se enlaza el recurso original.',refs:['febarq','penn']},
  {id:'cognitive',short:'CADES',title:'CADES y CCDR',category:'Cognición y envejecimiento',kind:'cognition',species:'Perro',time:'Según escala',badge:'Recursos validados',badgeType:'',external:'https://www.frontiersin.org/journals/veterinary-science/articles/10.3389/fvets.2024.1374511/full',
   summary:'Dos instrumentos complementarios para investigar cambios cognitivos en perros mayores.',note:'Ficha comparativa y acceso a la publicación; sin calculadora local.',
   evidence:'El estudio comparativo de 2024 analiza CADES, CCAS y CCDR en la misma población. Las clasificaciones no son intercambiables y las escalas difieren en su sensibilidad a distintos grados de afectación.',method:'Consultar la publicación y los instrumentos originales. No aplicar las bandas de una escala a otra ni convertir puntuaciones entre ellas.',license:'Se enlaza la publicación. Para digitalizar íntegramente las escalas debe verificarse la versión, clave y condiciones de reproducción.',refs:['cognitive']},
  {id:'disc',short:'DISC',title:'Conversaciones de equipo',category:'Equipos veterinarios',kind:'teams',species:'Equipo',time:'8–12 min',badge:'Dinámica no validada',badgeType:'purple',
   summary:'Una actividad para conversar sobre preferencias de comunicación y colaboración en la clínica.',
   note:'Cuestionario aportado · uso formativo, sin diagnóstico ni selección de personal.',
   evidence:'El archivo aportado contiene 30 preguntas de elección única y no documenta autoría del instrumento, manual psicométrico ni estudio de validación. La evidencia de productos comerciales DISC no valida este cuestionario.',
   method:'Recuento y porcentaje de respuestas D, I, S y C. Se muestran todos los empates. Son preferencias elegidas en esta actividad, no rasgos estables, percentiles ni medidas de competencia.',
   license:'Adaptación aportada por el usuario. No se identifica como producto oficial DiSC ni se atribuyen sus estudios de validación a este material.',
   instructions:'Elige la opción que más se acerque a tu forma habitual de trabajar. No hay respuestas correctas. Participa voluntariamente y comparte los resultados solo si lo deseas.',
   refs:[],questions:supplied.disc.map(q=>({text:q.question.replace('measurables','medibles'),options:q.options.map(o=>({text:o.text.replace('measurables','medibles').replace('rapport','una buena relación'),value:o.type}))})),
   guidance:['Conversar sobre ejemplos concretos de comunicación, sin asignar etiquetas rígidas a las personas.','Acordar un cambio pequeño y observable en la colaboración del equipo y revisar su utilidad.','No usar el resultado para diagnosticar, seleccionar personal, evaluar rendimiento o decidir compatibilidades entre compañeros.']}
];
export function getTest(id) { return catalog.find(t=>t.id===id); }
export function getOptions(test,index) { return test.questions[index].options || test.options; }
export const cfqComponents = ['Frustración general','Barreras y perseverancia','Expectativas incumplidas','Control autónomo','Dificultad de afrontamiento'];
