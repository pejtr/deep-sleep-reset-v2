/*
 * Spanish translations — Deep Sleep Reset
 * Targeted at South American Spanish (neutral Latin American)
 * All user-facing text strings organized by page/component
 */

import type { Translations } from "./en";

const es: Translations = {
  // Common / Shared
  common: {
    brandName: "Deep Sleep Reset",
    currency: "$",
    ctaPrice: "Obtener el Reset — $5",
    privacyPolicy: "Política de Privacidad",
    termsOfService: "Términos de Servicio",
    contact: "Contacto",
    affiliates: "Afiliados",
    copyright: "Deep Sleep Reset. Todos los derechos reservados.",
    disclaimer: "Aviso: Los resultados pueden variar. Este producto no está destinado a diagnosticar, tratar, curar o prevenir ninguna enfermedad. Consulte a su médico antes de comenzar cualquier nuevo programa de salud.",
    secureCheckout: "Pago seguro. Acceso digital instantáneo.",
    moneyBackGuarantee: "Garantía de devolución de 30 días",
  },

  // Header
  header: {
    ctaButton: "Cambia Mi Sueño — $5",
  },

  // Hero Section
  hero: {
    protocol: "LA TRANSFORMACIÓN DE 7 NOCHES",
    ctaButton: "Sí — Quiero Despertar Así",
    variants: {
      a: {
        main: "¿Cómo Sería Tu Vida Si Te Despertaras ",
        highlight: "Verdaderamente Descansado",
        continuation: " — Cada Mañana?",
        sub: "Más energía, mente más clara, mejor humor — todo por arreglar lo que afecta todo lo demás. El Reset de Sueño Profundo de 7 Noches. Menos que el precio de un café.",
      },
      b: {
        main: "Cambia Tu Sueño. ",
        highlight: "Cambia Tu Vida.",
        continuation: " Por el Precio de un Café.",
        sub: "10,000+ personas descubrieron qué pasa cuando finalmente duermes profundo. El protocolo de 7 noches que lo hace permanente. Solo $5.",
      },
      c: {
        main: "Por Esto Te ",
        highlight: "Despiertas a las 3AM",
        continuation: " — Y Cómo Pararlo",
        sub: "Tu cerebro no está roto. Está atrapado en un bucle. El Reset de Sueño Profundo de 7 Noches reconfigura tu ciclo de sueño en una semana. Menos que un café.",
      },
      // Variant D — Fear of Loss Frame
      d: {
        main: "Cada Noche Sin Dormir Te Está ",
        highlight: "Costando Más",
        continuation: " Que $5.",
        sub: "Productividad perdida, salud dañada, relaciones rotas — el precio real del insomnio es enorme. La solución cuesta menos que un café.",
      },
    },
  },

  // Pain Section
  pain: {
    intro1: "Es la mitad de la noche. La casa está en silencio. Todos los demás están dormidos.",
    intro2: "Pero tú no.",
    intro3: "Estás completamente despierto, tu mente acelerada con un cóctel tóxico de la lista de pendientes de mañana, los arrepentimientos de ayer y una ansiedad constante y zumbante que simplemente no se apaga.",
    triedEverything: "Ya probaste de todo, ¿verdad?",
    painPoints: [
      "Gomitas de melatonina que te dejan aturdido y te dan sueños extraños.",
      "Pastillas para dormir caras que sabes que no son una solución a largo plazo.",
      "Té \"para dormir\" que no hace absolutamente nada.",
      "Videos interminables de YouTube con sonidos de lluvia que solo te dan ganas de ir al baño.",
      "El clásico consejo inútil: \"Solo relájate,\" \"Despeja tu mente,\" \"No mires el celular.\"",
    ],
    clockLabel: "3:17 AM — Otra noche sin dormir",
  },

  // Brutal Truth Section
  brutalTruth: {
    main: "La cruda verdad es que no solo estás cansado. ",
    highlight: "Te están robando.",
    body: "Robándote tu energía. Robándote tu concentración. Robándote tu salud. Robándote tu capacidad de estar presente con tu familia y amigos.",
    worst: "¿Y lo peor? Empiezas a creer que esto es simplemente... cómo son las cosas ahora.",
    whatIf: "¿Pero qué pasaría si no fuera así?",
  },

  // Product Introduction
  product: {
    introducing: "Presentamos",
    title: "El Reset de Sueño Profundo de ",
    titleHighlight: "7 Noches",
    desc1: "El protocolo paso a paso, respaldado por la ciencia, diseñado para arreglar tu ciclo de sueño roto y devolverte tus noches — ",
    desc1Bold: "para siempre.",
    desc2: "Esto no es otro PDF flojo lleno de consejos genéricos. Este es un programa estructurado e interactivo de 7 días que te da ",
    desc2Bold: "una acción simple y poderosa para hacer cada noche.",
    desc2End: " — cada una apuntando a una causa raíz diferente de tu sueño roto.",
    desc3: "Hemos tomado las técnicas más efectivas y clínicamente probadas de la Terapia Cognitivo-Conductual para el Insomnio (TCC-I) — el método que médicos y científicos del sueño llaman el \"estándar de oro\" para tratar problemas de sueño — y las destilamos en un reset fácil de seguir, noche por noche.",
  },

  // 7-Night Modules
  modules: {
    sectionLabel: "Tu Viaje de 7 Noches",
    sectionTitle: "Esto Es Exactamente Lo Que Harás",
    conclusion: "Al final de las 7 noches, no solo habrás tenido una buena semana de sueño. Habrás instalado un ",
    conclusionHighlight: "nuevo sistema operativo para dormir",
    conclusionEnd: " en tu cerebro.",
    nights: [
      { title: "El Reset de Presión de Sueño", desc: "Aprende el método contraintuitivo para construir un impulso de sueño natural y poderoso, haciendo que tu cuerpo desee dormir." },
      { title: "El Apagón de la Mente Acelerada", desc: "Una técnica de \"descarga cognitiva\" de 10 minutos para soltar tus ansiedades y detener la charla mental." },
      { title: "La Disolución del Escaneo Corporal", desc: "Un audio guiado que sistemáticamente derrite la tensión de tu cuerpo, haciendo físicamente imposible aferrarse al estrés." },
      { title: "El Cambio de Patrón de Respiración", desc: "Domina la técnica de respiración 4-7-8 usada por los Navy SEALs para calmar instantáneamente el sistema nervioso." },
      { title: "El Protocolo de Luz y Oscuridad", desc: "Aprende cómo usar la luz para resetear tu reloj interno para que sientas sueño en el momento correcto." },
      { title: "El Método de Control de Estímulos", desc: "Una técnica psicológica poderosa para re-entrenar tu cerebro a asociar tu cama con un sueño profundo y reparador." },
      { title: "El Bloqueo de Confianza del Sueño", desc: "Combina todo en un ritual nocturno simple y personalizado que hace que el sueño profundo sea automático." },
    ],
  },

  // Social Proof
  socialProof: {
    title1: "No Estás Solo.",
    title2: "Y Esto No Es Tu Culpa.",
    stats: [
      { stat: "30%+", label: "de los adultos en el mundo sufren de insomnio" },
      { stat: "$65B+", label: "mercado global de ayudas para dormir" },
      { stat: "#1", label: "TCC-I es el tratamiento estándar de oro" },
    ],
    forYouTitle: "Este programa es para ti si:",
    forYouItems: [
      "No puedes dormirte, sin importar lo cansado que estés.",
      "Te despiertas varias veces en la noche y no puedes volver a dormir.",
      "Te despiertas sintiéndote como si no hubieras dormido nada.",
      "Dependes de la cafeína para pasar el día.",
      "Estás harto de sentirte cansado, ansioso e irritable.",
      "Quieres una solución real y duradera, no otro parche temporal.",
    ],
  },

  // Testimonials
  testimonials: {
    sectionLabel: "Personas Reales. Resultados Reales.",
    sectionTitle: "Escucha a Personas Que ",
    sectionTitleHighlight: "Finalmente Duermen",
    sectionDesc: "Miles de personas han usado el Reset de Sueño Profundo de 7 Noches para transformar sus noches. Aquí hay solo algunas de sus historias.",
    videoTitle: "Mira la Historia de Sarah",
    videoDesc: "Cómo arregló 10 años de insomnio en solo 7 noches",
    resultsDisclaimer: "* Los resultados pueden variar. Las experiencias individuales difieren.",
    reviews: [
      {
        name: "Sarah M.",
        location: "Austin, TX",
        text: "Luché con el insomnio por más de 10 años. Para la Noche 4, me dormía en 15 minutos. Lloré la primera mañana que desperté sintiéndome descansada. Este programa cambió mi vida.",
      },
      {
        name: "James K.",
        location: "Londres, UK",
        text: "Era escéptico — ¿$5 por algo que realmente funciona? Pero la técnica de respiración de la Noche 4 fue un cambio total. Dejé de tomar melatonina por completo. Mi esposa notó la diferencia antes que yo.",
      },
      {
        name: "Maria L.",
        location: "Toronto, CA",
        text: "Como enfermera trabajando turnos nocturnos, mi sueño estaba destruido. El Protocolo de Luz y Oscuridad de la Noche 5 me ayudó a resetear mi ritmo circadiano. Ahora duermo 7+ horas incluso después de un turno nocturno. Increíble.",
      },
    ],
    trustBar: {
      happySleepers: "10,000+ Personas Durmiendo Mejor",
      avgRating: "4.9/5 Calificación Promedio",
      guarantee: "Garantía de Devolución de 30 Días",
    },
  },

  // Offer Section
  offer: {
    label: "Oferta Por Tiempo Limitado",
    title: "Obtén El Reset de Sueño Profundo de 7 Noches Completo Hoy Por Solo...",
    originalPrice: "$47",
    salePrice: "$5",
    desc: "¿Por qué tan bajo? Porque sé que eres escéptico. Te han decepcionado antes. Quiero eliminar cualquier riesgo para que pruebes esto. Por el precio de una sola taza de café, puedes obtener las herramientas para recuperar tus noches, tu energía y tu vida.",
    whatYouGet: "Esto Es Todo Lo Que Recibes:",
    items: [
      { item: "El Programa Completo de Reset de Sueño Profundo de 7 Noches", value: "$47" },
      { item: "Módulos Interactivos Basados en Web (acceso desde cualquier lugar)", value: "$27" },
      { item: "Sesiones de Audio Guiadas Diarias (para relajación y técnicas)", value: "$19" },
      { item: "BONUS: La Plantilla Imprimible de Diario de Sueño", value: "$17" },
    ],
    totalValue: "Valor Total:",
    yourPrice: "Tu Precio Hoy:",
    justPrice: "Solo $5 — Menos que un Café",
    ctaButton: "¡SÍ — CAMBIA MI SUEÑO POR $5!",
  },

  // Guarantee
  guarantee: {
    title: "La Garantía \"Duerme Bien o Es Gratis\" ",
    titleHighlight: "Garantía",
    desc1: "Prueba el Reset de Sueño Profundo de 7 Noches completo. Si no experimentas una mejora dramática en tu sueño dentro de 30 días, solo envíanos un email y te devolveremos tus $5. Sin preguntas.",
    desc2: "Así de seguros estamos de este programa. O obtienes los resultados que buscas, o no pagas nada.",
  },

  // FAQ
  faq: {
    title: "Preguntas Frecuentes",
    items: [
      {
        q: "¿Es esto solo otro ebook con consejos genéricos para dormir?",
        a: "No. Este es un programa estructurado e interactivo de 7 noches basado en la Terapia Cognitivo-Conductual para el Insomnio (TCC-I) — el tratamiento clínicamente probado como \"estándar de oro\" recomendado por médicos y científicos del sueño. Cada noche te da una acción específica y poderosa.",
      },
      {
        q: "¿Cómo es diferente de la melatonina o las pastillas para dormir?",
        a: "La melatonina y las pastillas para dormir enmascaran los síntomas sin arreglar la causa raíz. El Deep Sleep Reset re-entrena los mecanismos naturales de sueño de tu cerebro para que puedas dormirte y permanecer dormido sin ayudas externas. Los resultados son permanentes, no temporales.",
      },
      {
        q: "¿Qué pasa si ya probé todo y nada funciona?",
        a: "Exactamente para eso está diseñado este programa. Se ha demostrado que la TCC-I es efectiva incluso para personas con insomnio crónico que han probado múltiples otros tratamientos. Las técnicas trabajan con la biología de tu cuerpo, no en contra.",
      },
      {
        q: "¿Qué tan rápido veré resultados?",
        a: "Muchas personas reportan mejoras notables para la Noche 3 o 4. Al final del protocolo de 7 noches, la mayoría de los usuarios experimentan un sueño significativamente más profundo y reparador. Los beneficios completos se acumulan durante las semanas siguientes.",
      },
      {
        q: "¿Necesito algún equipo especial o apps?",
        a: "No. Todo lo que necesitas está incluido en el programa. Solo necesitas un espacio tranquilo, una cama y 15-20 minutos antes de acostarte cada noche. Las sesiones de audio guiadas se pueden reproducir en cualquier dispositivo.",
      },
      {
        q: "¿Qué pasa si no funciona para mí?",
        a: "Estás cubierto por nuestra garantía de 30 días \"Duerme Bien o Es Gratis\". Si no experimentas una mejora dramática en tu sueño, solo envíanos un email y te devolveremos cada centavo. Sin preguntas.",
      },
      {
        q: "¿Es seguro mi pago?",
        a: "Absolutamente. Usamos encriptación SSL de 256 bits estándar de la industria para todas las transacciones. Tu información de pago nunca se almacena en nuestros servidores.",
      },
    ],
  },

  // Final CTA
  finalCta: {
    title: "Un Café. Siete Noches. Una Vida Diferente.",
    desc1: "Imagina despertar mañana y pensar: \"Realmente descansé\".",
    desc2: "Más energía. Mente más clara. Mejor humor. La versión de ti mismo que aparece cuando no estás agotado.",
    desc2Highlight: "Todo por $5.",
    ctaButton: "CAMBIA MI SUEÑO — $5",
    ps: "Has gastado más de $5 en un café que te puso más ansioso. Esto es $5 para cambiar permanentemente cómo duermes — y cómo se siente cada día después. La única pregunta es: ¿tienes suficiente curiosidad para descubrirlo?",
    psItalic1: "",
    psMid: "",
    psItalic2: "",
    psEnd: "",
  },

  // Exit Intent Popup
  exitPopup: {
    badge: "ESPERA — Descuento Exclusivo",
    title: "No Te Vayas Sin Tu ",
    titleHighlight: "Código 20% Off",
    subtitle: "Usa el código SLEEP20 en el pago para ahorrar 20%. Menos que un café. Garantía de 30 días.",
    regularPrice: "Precio regular: $5",
    yourPriceNow: "Tu precio ahora: $4",
    couponCode: "SLEEP20",
    couponLabel: "Tu código de descuento exclusivo:",
    couponCopied: "¡Copiado al portapapeles!",
    offerExpires: "Esta oferta expira en:",
    items: [
      "Programa Completo de Reset de Sueño de 7 Noches",
      "5 Sesiones de Audio Guiadas",
      "Diario de Sueño + Seguimiento de Progreso",
      "Garantía de Devolución de 30 Días",
    ],
    ctaButton: "Sí — Tengo Curiosidad. Dame Acceso por $4.",
    savings: "Ahorra 20% — menos que un café",
    decline: "No gracias, seguiré despertándome cansado",
  },

  // Sticky Mobile CTA
  stickyCta: {
    button: "Arreglar Mi Sueño",
    text: "Arreglar Mi Sueño — ",
    price: "$5",
    subtext: "Garantía 30 Días · Acceso Instantáneo",
  },

  // Upsell 1
  upsell1: {
    step: "Paso 1",
    stepOf: "2",
    completeOrder: "Completa Tu Pedido",
    badge: "¡ESPERA! Tu Pedido Está Casi Completo...",
    headline: "Acabas de Dar un Paso Poderoso Para Arreglar Tu Sueño. ",
    headlineHighlight: "Pero Si la Ansiedad Es la Verdadera Razón Por la Que No Puedes Dormir, Absolutamente Necesitas Esto...",
    congrats: "Primero que nada, ¡felicitaciones!",
    congratsText: " Acabas de asegurar El Reset de Sueño Profundo de 7 Noches y ya estás en camino a recuperar tus noches.",
    question: "Pero déjame hacerte una pregunta rápida y honesta...",
    realReason: "Cuando estás acostado en la cama, ¿cuál es la verdadera razón por la que no puedes desconectarte?",
    anxiety: "¿Es solo una mente ocupada... o es esa sensación familiar de opresión en el pecho de ",
    anxietyHighlight: "ansiedad",
    anxietyQuestion: "?",
    anxietyDesc: "¿Ese zumbido constante y bajo de preocupación por el trabajo, las finanzas, la salud o tu familia? ¿Ese sobresalto repentino de pánico justo cuando estás a punto de quedarte dormido?",
    statistic: "Para 9 de cada 10 personas con problemas de sueño, la ansiedad es la causa raíz. El problema de sueño es solo un síntoma.",
    supercharge: "Y aunque el Reset de 7 Noches es increíble para reconstruir tus hábitos de sueño, puedes ",
    superchargeHighlight: "potenciar tus resultados",
    superchargeEnd: " atacando directamente la ansiedad que alimenta el fuego.",
    oneTimeOffer: "Por eso quiero ofrecerte una ",
    oneTimeOfferHighlight: "oportunidad única",
    oneTimeOfferEnd: " de agregar...",
    productTitle: "El Pack de Audio ",
    productTitleHighlight: "Disuelve Ansiedad",
    productDesc: "Una colección curada de 5 poderosas sesiones de audio guiadas diseñadas para derretir el estrés y la ansiedad bajo demanda.",
    productNote: "Estos no son solo \"sonidos relajantes.\" Cada audio usa técnicas específicas de meditación guiada y PNL para calmar tu sistema nervioso y aquietar tu mente en minutos.",
    audioSessions: [
      { title: "El Audio \"Calma de Emergencia\"", duration: "5 min", desc: "Para cuando sientes un ataque de pánico o una ola de ansiedad. Este es tu freno de emergencia." },
      { title: "La Meditación \"Inicio del Sueño\"", duration: "15 min", desc: "Escúchalo EN LA CAMA para pasar sin esfuerzo de la vigilia ansiosa a un sueño profundo y pacífico." },
      { title: "El \"Escudo Anti-Ansiedad Matutino\"", duration: "10 min", desc: "Comienza tu día centrado y calmado, creando un escudo contra el estrés que dura hasta la noche." },
      { title: "El \"Reset de la Tarde\"", duration: "10 min", desc: "Previene la acumulación diaria de estrés y tensión con esta sesión rápida y poderosa a mitad del día." },
      { title: "El \"Reset Profundo del Domingo\"", duration: "20 min", desc: "Un reset completo del sistema nervioso para prepararte para una semana calmada y productiva." },
    ],
    priceLabel: "Normalmente, vendemos este pack de audio por ",
    priceOriginal: "$37",
    priceDesc: "Pero como acabas de invertir en el Deep Sleep Reset, aquí tienes una oferta especial y única:",
    addToOrder: "Agregar a tu pedido",
    ctaButton: "¡SÍ! AGREGAR EL PACK DE AUDIO POR SOLO $10",
    oneClick: "Upsell de un clic. No se te pedirán tus datos de pago nuevamente.",
    decline: "No gracias, no quiero atacar la causa raíz de mis problemas de sueño. Llévame a mi compra.",
    offerCloses: "La oferta cierra en:",
  },

  // Upsell 2
  upsell2: {
    step: "Paso 2",
    stepOf: "2",
    finalStep: "Paso Final",
    badge: "ÚLTIMA OPORTUNIDAD — Una Mejora Más Disponible",
    headline: "¡Ya Casi Terminas! Pero Hay Una Cosa Más Que Podría ",
    headlineHighlight: "Duplicar Tus Resultados...",
    intro: "Tienes el reset de sueño. Tienes las herramientas para combatir la ansiedad. Ahora déjame mostrarte cómo ",
    introHighlight: "optimizar todo tu entorno de sueño",
    introEnd: " para que cada noche sea tu mejor noche.",
    productTitle: "El Kit de Herramientas ",
    productTitleHighlight: "Optimizador de Sueño",
    productDesc: "Un sistema completo para transformar tu dormitorio en un santuario del sueño y asegurar tus resultados permanentemente.",
    items: [
      { title: "La Lista de Auditoría del Dormitorio", desc: "Una guía habitación por habitación para eliminar cada disruptor oculto del sueño — desde filtraciones de luz hasta fuentes de EMF y optimización de temperatura." },
      { title: "La Guía de Nutrición y Suplementos", desc: "Los alimentos, bebidas y suplementos (opcionales) exactos que promueven el sueño profundo — y los que secretamente te mantienen despierto." },
      { title: "El Constructor de Rutina Nocturna", desc: "Una plantilla personalizable de rutina de relajación que señala a tu cerebro que es hora de dormir — adaptada a tu estilo de vida." },
      { title: "La Plantilla de Seguimiento del Sueño", desc: "Un rastreador simple e imprimible para monitorear tu progreso e identificar patrones durante 30 días." },
    ],
    priceLabel: "Este kit normalmente se vende por ",
    priceOriginal: "$29",
    ctaButton: "¡SÍ! AGREGAR EL KIT POR SOLO $10",
    oneClick: "Última mejora. No se necesitan datos de pago adicionales.",
    decline: "No gracias, llévame a mi compra.",
    offerCloses: "La oferta cierra en:",
  },

  // Thank You
  thankYou: {
    badge: "PEDIDO CONFIRMADO",
    title: "Bienvenido a Tu ",
    titleHighlight: "Nueva Vida de Sueño",
    desc: "Tu compra está completa. Esto es lo que sigue:",
    steps: [
      { title: "Revisa Tu Email", desc: "Hemos enviado los detalles de acceso a tu dirección de email. Revisa tu bandeja de entrada (y la carpeta de spam, por si acaso)." },
      { title: "Comienza Esta Noche", desc: "Empieza con la Noche 1 — El Reset de Presión de Sueño. Solo toma 15 minutos antes de acostarte." },
      { title: "Registra Tu Progreso", desc: "Usa el Diario de Sueño incluido para registrar tus mejoras durante las 7 noches." },
    ],
    reminderTitle: "Recordatorio Rápido",
    reminderText: "El programa funciona mejor cuando sigues cada noche en orden. No te adelantes — cada técnica se construye sobre la anterior.",
    supportTitle: "¿Necesitas Ayuda?",
    supportText: "Si tienes alguna pregunta o necesitas soporte, envíanos un email a ",
    backHome: "Volver al Inicio",
  },

  // Chatbot
  chatbot: {
    name: "Lucie",
    title: "Experta en Sueño",
    status: "En línea",
    placeholder: "Escribe tu mensaje...",
    proactiveMessages: [
      "¡Hola! ¿No puedes dormir? No estás solo — he ayudado a miles de personas a arreglar su sueño. ¿Quieres hablar sobre lo que te mantiene despierto?",
      "Noté que sigues aquí... ¿el insomnio te mantiene despierto esta noche también? Tal vez pueda ayudar.",
      "¿Sigues navegando? Lo entiendo — cuando no puedes dormir, terminas scrolleando. ¿Quieres que comparta un consejo rápido que realmente funciona?",
    ],
    // Persona-specific greeting messages
    lucyGreeting: "¡Hola! Soy Lucy 🌙 He ayudado a cientos de personas a arreglar su sueño. ¿Qué te mantiene despierto por las noches?",
    petraGreeting: "Hola. Soy Petra. Sin rodeos — ¿cuál es tu problema de sueño y cuánto tiempo llevas con él?",
    errorMessage: "Lo siento, tuve un pequeño problema. ¿Podrías intentar de nuevo?",
  },

  // FOMO Notification
  fomo: {
    messages: [
      "Alguien de Buenos Aires acaba de iniciar el programa",
      "Sarah de México completó la Noche 7 — está durmiendo 8 horas",
      "47 personas iniciaron el reset en las últimas 24 horas",
      "Alguien de Bogotá acaba de agregar el Pack de Audio",
      "James de Madrid acaba de dejar una reseña de 5 estrellas",
      "Una enfermera de Lima acaba de arreglar su horario de sueño nocturno",
      "Alguien de Santiago acaba de obtener su reembolso... espera, no — enviaron un email diciendo que funcionó",
    ],
  },
} as const;

export default es;
