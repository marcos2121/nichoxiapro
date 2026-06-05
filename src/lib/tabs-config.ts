import type { TabId } from "./research-store";

export type FieldDef = {
  id: string;
  label: string;
  placeholder: string;
  multiline?: boolean;
  group?: string;
};

export type TabDef = {
  id: TabId;
  label: string;
  icon: string;
  color: "pink" | "cyan" | "lime" | "yellow" | "purple";
  xp: number;
  description: string;
  fields: FieldDef[];
  multiAvatar?: boolean;
};

// Buyer avatar fields (used per-avatar, not on the global data object)
export const BUYER_FIELDS: FieldDef[] = [
  // Identidad
  { id: "nombre", label: "Nombre ficticio", placeholder: "Laura, la fundadora", group: "Identidad" },
  { id: "ocupacion", label: "Ocupación / rol", placeholder: "Dueña de tienda online", group: "Identidad" },
  { id: "nivel_consciencia", label: "Nivel de consciencia", placeholder: "consciente del problema / solución / producto / escéptico / impulsivo", group: "Identidad" },
  // Psicológico
  { id: "personalidad", label: "Personalidad", placeholder: "Ambiciosa, perfeccionista...", multiline: true, group: "Psicológico" },
  { id: "frustraciones", label: "Frustraciones", placeholder: "Lo que la enoja día a día", multiline: true, group: "Psicológico" },
  { id: "inseguridades", label: "Inseguridades", placeholder: "Lo que oculta", multiline: true, group: "Psicológico" },
  { id: "aspiraciones", label: "Aspiraciones / ego", placeholder: "Cómo quiere ser vista", multiline: true, group: "Psicológico" },
  // Digital
  { id: "influencers", label: "Influencers que sigue", placeholder: "Nombres concretos", multiline: true, group: "Digital" },
  { id: "plataformas", label: "Plataformas que consume", placeholder: "TikTok, IG, YT, podcasts...", group: "Digital" },
  { id: "contenido", label: "Tipo de contenido que ve", placeholder: "Reels educativos, lives...", multiline: true, group: "Digital" },
  { id: "lenguaje", label: "Palabras / hashtags que usa", placeholder: "#emprendedora, 'mindset'...", multiline: true, group: "Digital" },
  // Económico
  { id: "ingresos", label: "Ingresos mensuales", placeholder: "USD 1.5k - 4k", group: "Económico" },
  { id: "ticket", label: "Ticket promedio", placeholder: "Cuánto suele gastar", group: "Económico" },
  { id: "objecion_dinero", label: "Objeción financiera", placeholder: "'No tengo presupuesto ahora'", multiline: true, group: "Económico" },
  // Emocional
  { id: "miedo_oculto", label: "Miedo oculto", placeholder: "Lo que no admite en voz alta", multiline: true, group: "Emocional" },
  { id: "deseo_secreto", label: "Deseo secreto", placeholder: "Lo que sueña pero calla", multiline: true, group: "Emocional" },
  { id: "pensamiento_nocturno", label: "Pensamiento a las 3am", placeholder: "Qué la mantiene despierta", multiline: true, group: "Emocional" },
  // Compra
  { id: "estilo_compra", label: "Estilo de compra", placeholder: "Rápido / lento, emocional / lógico", group: "Compra" },
  { id: "que_lo_hace_confiar", label: "Qué lo hace confiar", placeholder: "Casos, testimonios, autoridad...", multiline: true, group: "Compra" },
];

export const TABS: TabDef[] = [
  {
    id: "producto",
    label: "Producto",
    icon: "📦",
    color: "pink",
    xp: 200,
    description: "Anatomía estratégica de lo que vendes",
    fields: [
      { id: "nombre", label: "Nombre", placeholder: "Ej: Nixoia Pro" },
      { id: "que_es", label: "¿Qué es en una frase?", placeholder: "Una herramienta que..." },
      { id: "mecanismo_unico", label: "Mecanismo único", placeholder: "El cómo diferente: 'Sistema X de 3 pasos...'", multiline: true },
      { id: "promesa", label: "Promesa principal", placeholder: "El gran resultado prometido", multiline: true },
      { id: "resultado_tangible", label: "Resultado tangible", placeholder: "Lo medible (ventas, tiempo, kg...)", multiline: true },
      { id: "resultado_emocional", label: "Resultado emocional", placeholder: "Cómo se va a sentir", multiline: true },
      { id: "resultado_social", label: "Resultado social", placeholder: "Cómo lo verán los demás", multiline: true },
      { id: "resultado_economico", label: "Resultado económico", placeholder: "Cuánto ahorra o genera", multiline: true },
      { id: "tiempo_transformacion", label: "Tiempo de transformación", placeholder: "Días / semanas / meses" },
      { id: "tipo_mercado", label: "Tipo de mercado", placeholder: "B2B / B2C / nicho / masivo" },
      { id: "nivel_consciencia", label: "Nivel de consciencia del mercado", placeholder: "Inconsciente / consciente del problema / solución / producto" },
      { id: "categoria_psicologica", label: "Categoría psicológica que activa", placeholder: "Status, miedo, placer, urgencia, seguridad, dinero, transformación", multiline: true },
      { id: "diferencial", label: "Diferencial vs competencia", placeholder: "A diferencia de los demás...", multiline: true },
    ],
  },
  {
    id: "buyer",
    label: "Buyer Persona",
    icon: "🎯",
    color: "cyan",
    xp: 250,
    description: "Genera 1, 3, 5 o 10 avatares con perfiles completos",
    multiAvatar: true,
    fields: BUYER_FIELDS,
  },
  {
    id: "geografia",
    label: "Geografía",
    icon: "🌎",
    color: "lime",
    xp: 150,
    description: "Micro geografía y comportamiento por región",
    fields: [
      { id: "pais", label: "País principal", placeholder: "México, Colombia..." },
      { id: "ciudades", label: "Ciudades clave", placeholder: "CDMX, Monterrey, Guadalajara" },
      { id: "micro_geografia", label: "Micro geografía / distritos", placeholder: "Polanco, Roma Norte, Zapopan...", multiline: true },
      { id: "poder_adquisitivo", label: "Poder adquisitivo por zona", placeholder: "Medio-alto en X, medio en Y", multiline: true },
      { id: "velocidad_compra", label: "Velocidad de compra", placeholder: "Rápida / cauta según región", multiline: true },
      { id: "confianza_online", label: "Confianza en compra online", placeholder: "Alta / media / baja por región", multiline: true },
      { id: "adopcion_tech", label: "Adopción tecnológica", placeholder: "Early / mainstream / tardía", multiline: true },
      { id: "horarios_ads", label: "Mejores horarios para ads", placeholder: "Lun-Vie 19-22h..." },
      { id: "horarios_tiktok", label: "Mejores horarios TikTok / IG", placeholder: "12-14h y 20-23h" },
      { id: "horarios_webinar", label: "Mejores horarios para webinars", placeholder: "Mar-Jue 20h LATAM" },
      { id: "lugares_fisicos", label: "Lugares físicos que frecuenta", placeholder: "Coworkings, gimnasios, cafés, universidades, malls", multiline: true },
      { id: "diferencias_culturales", label: "Diferencias psicológicas por ciudad/país", placeholder: "CDMX vs Monterrey vs Bogotá...", multiline: true },
      { id: "idioma", label: "Idioma / dialecto", placeholder: "Español neutro / regional" },
    ],
  },
  {
    id: "edad",
    label: "Edad y Género",
    icon: "👥",
    color: "yellow",
    xp: 150,
    description: "Demografía con mentalidad y gatillos",
    fields: [
      { id: "rango", label: "Rango de edad principal", placeholder: "25-40 años" },
      { id: "genero", label: "Distribución de género", placeholder: "70% mujeres, 30% hombres" },
      { id: "mentalidad_18_24", label: "Mentalidad 18-24", placeholder: "Identidad, rapidez, libertad...", multiline: true },
      { id: "mentalidad_25_34", label: "Mentalidad 25-34", placeholder: "Dinero, posicionamiento, crecimiento...", multiline: true },
      { id: "mentalidad_35_44", label: "Mentalidad 35-44", placeholder: "Estabilidad, autoridad, eficiencia...", multiline: true },
      { id: "gatillos_emocionales", label: "Gatillos emocionales por edad", placeholder: "Qué dispara la compra en cada rango", multiline: true },
      { id: "diferencias_genero", label: "Diferencias de compra hombre vs mujer", placeholder: "Motivaciones, miedos, lenguaje", multiline: true },
      { id: "ingresos", label: "Nivel de ingresos típico", placeholder: "Clase media / media-alta" },
      { id: "estilo_vida", label: "Estilo de vida", placeholder: "Urbano, digital, ocupado", multiline: true },
    ],
  },
  {
    id: "fomo",
    label: "FOMO + FODA",
    icon: "🔥",
    color: "pink",
    xp: 250,
    description: "Tendencia, urgencia y matriz estratégica",
    fields: [
      { id: "tendencia", label: "Tendencia emergente que aprovechas", placeholder: "IA, sostenibilidad, creator economy...", multiline: true },
      { id: "urgencia", label: "¿Por qué AHORA?", placeholder: "Ventana de oportunidad...", multiline: true },
      { id: "si_actua", label: "Qué pasa si actúa hoy", placeholder: "Beneficio temprano", multiline: true },
      { id: "si_no_actua", label: "Qué pasa si NO actúa", placeholder: "Costo de inacción", multiline: true },
      { id: "social_proof", label: "Prueba social disponible", placeholder: "+1000 clientes, casos...", multiline: true },
      { id: "escasez", label: "Elemento de escasez real", placeholder: "Cupos, lanzamiento, precio..." },
      { id: "fortalezas", label: "FODA · Fortalezas", placeholder: "Lo que haces mejor", multiline: true },
      { id: "oportunidades", label: "FODA · Oportunidades", placeholder: "Lo que el mercado pide y nadie da", multiline: true },
      { id: "debilidades", label: "FODA · Debilidades", placeholder: "Donde eres vulnerable", multiline: true },
      { id: "amenazas", label: "FODA · Amenazas", placeholder: "Riesgos externos", multiline: true },
      { id: "saturacion", label: "Saturación del mercado", placeholder: "Baja / media / alta + por qué" },
      { id: "barrera_entrada", label: "Barrera de entrada", placeholder: "Capital, know-how, marca..." },
      { id: "potencial_economico", label: "Potencial económico", placeholder: "Tamaño y ticket promedio" },
    ],
  },
  {
    id: "competencia",
    label: "Competencia Real",
    icon: "⚔️",
    color: "purple",
    xp: 250,
    description: "Análisis profundo de quién más juega",
    fields: [
      { id: "directos", label: "Top 3 competidores directos", placeholder: "Nombres + propuesta de cada uno", multiline: true },
      { id: "indirectos", label: "Competidores indirectos / sustitutos", placeholder: "Excel, métodos manuales, alternativas baratas", multiline: true },
      { id: "influencers", label: "Influencers / referentes del nicho", placeholder: "Quién marca tendencia", multiline: true },
      { id: "contenido_gratis", label: "Contenido gratuito que compite", placeholder: "YouTube, blogs, comunidades", multiline: true },
      { id: "hooks_usados", label: "Hooks que están usando", placeholder: "Frases ganchos repetidas", multiline: true },
      { id: "promesas_repetidas", label: "Promesas que todos repiten", placeholder: "Lo saturado del nicho", multiline: true },
      { id: "estilo_visual", label: "Estilo visual dominante", placeholder: "Minimal, gurú, científico...", multiline: true },
      { id: "precios", label: "Rango de precios del mercado", placeholder: "$20 - $500 USD" },
      { id: "comentarios_positivos", label: "Qué aman los clientes de ellos", placeholder: "Lo que repite la audiencia feliz", multiline: true },
      { id: "comentarios_negativos", label: "Quejas reales de sus clientes", placeholder: "Reviews, comentarios, refunds", multiline: true },
      { id: "debilidades", label: "Debilidades = tu oportunidad", placeholder: "Lo que ellos hacen mal", multiline: true },
      { id: "angulo_no_saturado", label: "Ángulo NO saturado que detectaste", placeholder: "Lo que NADIE está diciendo", multiline: true },
    ],
  },
  {
    id: "dolores",
    label: "Dolores y Objeciones",
    icon: "💢",
    color: "cyan",
    xp: 250,
    description: "Capa por capa: visible, oculto, emocional, social",
    fields: [
      { id: "dolor_visible", label: "Dolor visible (lo que dice)", placeholder: "Lo que verbaliza", multiline: true },
      { id: "dolor_invisible", label: "Dolor invisible (lo que NO dice)", placeholder: "Lo que oculta incluso a sí mismo", multiline: true },
      { id: "dolor_emocional", label: "Dolor emocional", placeholder: "Vergüenza, miedo, ansiedad", multiline: true },
      { id: "dolor_financiero", label: "Dolor financiero", placeholder: "Cuánto le cuesta no resolverlo", multiline: true },
      { id: "dolor_social", label: "Dolor social", placeholder: "Cómo lo ven los demás", multiline: true },
      { id: "dolor_interno", label: "Dolor interno / identidad", placeholder: "Quién cree que es por esto", multiline: true },
      { id: "frases_reales", label: "Frases EXACTAS que diría el cliente", placeholder: "Citas tipo testimonio, en sus palabras", multiline: true },
      { id: "pensamiento_3am", label: "Pensamiento silencioso a las 3am", placeholder: "Lo que piensa y no comparte", multiline: true },
      { id: "objeciones_racionales", label: "Objeciones racionales", placeholder: "'No tengo tiempo', 'es caro'", multiline: true },
      { id: "objeciones_emocionales", label: "Objeciones emocionales", placeholder: "'No soy capaz', 'ya fallé antes'", multiline: true },
      { id: "objeciones_ocultas", label: "Objeciones ocultas / no admitidas", placeholder: "Las que no dice pero frenan", multiline: true },
      { id: "respuestas", label: "Cómo respondes a cada objeción", placeholder: "Garantía, demo, prueba social...", multiline: true },
    ],
  },
  {
    id: "resumen",
    label: "Dashboard Final",
    icon: "🏆",
    color: "yellow",
    xp: 0,
    description: "Tu investigación completa",
    fields: [],
  },
];

export const TOTAL_XP = TABS.reduce((s, t) => s + t.xp, 0);
