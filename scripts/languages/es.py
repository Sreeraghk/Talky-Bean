# -*- coding: utf-8 -*-
"""
Spanish (es) 25 Reading Passages: 5 A1, 5 A2, 5 B1, 5 B2, 5 C1.
Verified against target word count ranges:
- A1: 150-220 words
- A2: 200-260 words
- B1: 250-320 words
- B2: 280-360 words
- C1: 320-400 words
"""

passages = [
    # ------------------ A1 (150-220 words) ------------------
    {
        "title": "Mi vida en Madrid (My Life in Madrid)",
        "level": "A1",
        "language": "es",
        "text": "Me llamo Carlos y vivo desde hace dos años en un apartamento luminoso en el centro de Madrid. Todos los días me levanto temprano, exactamente a las siete de la mañana. Primero voy a la cocina, preparo una taza grande de café con leche caliente y como dos tostadas con aceite de oliva y tomate fresco. Después me ducho, me visto con ropa cómoda y salgo de casa para ir al trabajo. Normalmente viajo en metro porque es muy rápido, limpio y conveniente. Trabajo como diseñador gráfico en una pequeña agencia de publicidad cerca del Parque del Retiro. Mi jornada laboral comienza a las ocho y media. A las dos de la tarde tengo una pausa para almorzar con mis compañeros en un restaurante del barrio. Solemos comer un menú del día con ensalada, pescado y fruta. Por la tarde regreso a mi apartamento a las seis. A veces salgo a correr o leo una novela en el parque. Por la noche preparo una cena ligera, hablo por teléfono con mi familia y me acuesto a las once. Me encanta vivir en esta ciudad tan viva.",
        "vocabularyHints": {
            "apartamento": "apartment",
            "temprano": "early",
            "tostadas": "toasts",
            "aceite": "oil",
            "diseñador": "designer",
            "agencia": "agency",
            "pausa": "break",
            "almorzar": "to have lunch",
            "novela": "novel",
            "ligera": "light",
            "acuesto": "go to bed",
            "viva": "vibrant / lively"
        },
        "mcqQuestions": [
            {"question": "¿A qué hora se levanta Carlos por la mañana?", "options": ["A las seis", "A las siete", "A las ocho", "A las nueve"], "correctAnswerIndex": 1, "explanation": "El texto dice: 'me levanto temprano, exactamente a las siete de la mañana.'"},
            {"question": "¿Qué desayuna Carlos habitualmente?", "options": ["Cereales con yogur", "Tostadas con aceite y tomate, y café con leche", "Solo fruta", "Huevos fritos con patatas"], "correctAnswerIndex": 1, "explanation": "Toma café con leche y dos tostadas con aceite de oliva y tomate fresco."},
            {"question": "¿En qué medio de transporte viaja al trabajo?", "options": ["En bicicleta", "En autobús", "En metro", "En coche"], "correctAnswerIndex": 2, "explanation": "Viaja en metro porque es rápido y conveniente."},
            {"question": "¿Cuál es la profesión de Carlos?", "options": ["Profesor", "Diseñador gráfico", "Cocinero", "Médico"], "correctAnswerIndex": 1, "explanation": "Trabaja como diseñador gráfico en una agencia de publicidad."},
            {"question": "¿A qué hora regresa Carlos a su casa por la tarde?", "options": ["A las cuatro", "A las seis", "A las ocho", "A las diez"], "correctAnswerIndex": 1, "explanation": "Regresa a su apartamento a las seis de la tarde."}
        ],
        "tfQuestions": [
            {"question": "Carlos vive en un apartamento en las afueras de Barcelona.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 1, "explanation": "Falso. Vive en el centro de Madrid."},
            {"question": "La agencia de publicidad está cerca del Parque del Retiro.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 0, "explanation": "Verdadero. La agencia está cerca de dicho parque."},
            {"question": "Carlos almuerza solo en su oficina todos los días.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 1, "explanation": "Falso. Almuerza con sus compañeros en un restaurante."},
            {"question": "Por la noche Carlos suele preparar una cena ligera.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 0, "explanation": "Verdadero. El texto menciona que prepara una cena ligera."},
            {"question": "A Carlos no le gusta nada vivir en Madrid.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 1, "explanation": "Falso. El texto termina con: 'Me encanta vivir en esta ciudad tan viva.'"}
        ]
    },
    {
        "title": "Un fin de semana en Sevilla (A Weekend in Seville)",
        "level": "A1",
        "language": "es",
        "text": "El sábado pasado viajé con mi hermana Elena a la hermosa ciudad de Sevilla para pasar un fin de semana inolvidable. Llegamos en el tren de alta velocidad desde Córdoba al mediodía. Hacía un tiempo magnífico, con un cielo completamente azul y un sol brillante. Dejamos nuestras maletas en un pequeño hotel situado en el histórico barrio de Santa Cruz, lleno de calles estrechas y patios con flores perfumadas. Primero fuimos a almorzar a un bar de tapas tradicional. Pedimos gazpacho andaluz bien frío, tortilla de patatas recién hecha y croquetas de jamón ibérico. Todo estaba delicioso y los camareros eran muy amables y atentos. Por la tarde visitamos la majestuosa Catedral de Sevilla y subimos a la torre de la Giralda. Desde la cima disfrutamos de una vista panorámica impresionante de toda la ciudad y del río Guadalquivir. Más tarde caminamos por la Plaza de España y alquilamos una pequeña barca en el canal. Por la noche escuchamos música flamenca en una terraza acogedora mientras tomábamos zumo de naranja natural. Fue una experiencia mágica y queremos volver muy pronto con amigos.",
        "vocabularyHints": {
            "inolvidable": "unforgettable",
            "mediodía": "midday",
            "estrechas": "narrow",
            "patios": "courtyards",
            "perfumadas": "scented",
            "tapas": "tapas / snacks",
            "recién": "freshly",
            "panorámica": "panoramic",
            "canal": "canal",
            "barca": "small boat",
            "acogedora": "cozy / welcoming",
            "mágica": "magical"
        },
        "mcqQuestions": [
            {"question": "¿Con quién viajó el narrador a Sevilla?", "options": ["Con su madre", "Con su hermana Elena", "Con un amigo de la universidad", "Solo"], "correctAnswerIndex": 1, "explanation": "Viajó con su hermana Elena."},
            {"question": "¿Dónde estaba situado el hotel?", "options": ["Cerca del aeropuerto", "En el barrio de Santa Cruz", "En la estación de tren", "En una zona industrial"], "correctAnswerIndex": 1, "explanation": "El hotel estaba en el histórico barrio de Santa Cruz."},
            {"question": "¿Qué tapas comieron en el bar tradicional?", "options": ["Hamburguesas y patatas fritas", "Gazpacho, tortilla de patatas y croquetas", "Pizza y pasta", "Solo ensalada verde"], "correctAnswerIndex": 1, "explanation": "Pidieron gazpacho, tortilla de patatas y croquetas de jamón."},
            {"question": "¿Qué torre visitaron por la tarde?", "options": ["La Torre Eiffel", "La Giralda", "La Torre de Pisa", "La Torre de Hércules"], "correctAnswerIndex": 1, "explanation": "Subieron a la torre de la Giralda en la catedral."},
            {"question": "¿Qué hicieron en la Plaza de España?", "options": ["Jugaron al fútbol", "Alquilaron una pequeña barca en el canal", "Compraron un coche", "Fueron a un cine"], "correctAnswerIndex": 1, "explanation": "Caminaron por la plaza y alquilaron una barca."}
        ],
        "tfQuestions": [
            {"question": "El narrador y su hermana llegaron a Sevilla en autobús.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 1, "explanation": "Falso. Llegaron en tren de alta velocidad."},
            {"question": "El barrio de Santa Cruz tiene calles estrechas y patios con flores.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 0, "explanation": "Verdadero. El texto destaca sus calles estrechas y patios floridos."},
            {"question": "El gazpacho andaluz que tomaron estaba caliente.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 1, "explanation": "Falso. El texto dice 'gazpacho andaluz bien frío'."},
            {"question": "Desde la Giralda se puede ver el río Guadalquivir.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 0, "explanation": "Verdadero. Disfrutaron de la vista de la ciudad y del río."},
            {"question": "Por la noche escucharon música flamenca en una terraza.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 0, "explanation": "Verdadero. Escucharon flamenco en una terraza acogedora."}
        ]
    },
    {
        "title": "La pasión por el fútbol en mi barrio (Passion for Football)",
        "level": "A1",
        "language": "es",
        "text": "En mi barrio de Valencia el fútbol no es simplemente un deporte popular, sino una verdadera tradición que reúne a vecinos de todas las edades. Todos los domingos por la mañana, niños, jóvenes y adultos nos encontramos en el polideportivo municipal para jugar un emocionante partido amistoso. Mi equipo viste camisetas rojas y el equipo rival viste de color azul marino. Yo juego como delantero y me encanta correr sobre la hierba artificial y marcar goles para celebrarlos con mis mejores amigos. Antes del partido, nuestro entrenador nos explica tácticas sencillas y hacemos ejercicios de calentamiento durante quince minutos para evitar lesiones musculares. Alrededor del campo, muchos familiares y vecinos se sientan en las gradas con termos de café y refrescos, animando con entusiasmo a los jugadores con aplausos y canciones divertidas. Cuando termina el partido a las doce, el resultado final no importa demasiado porque todos nos saludamos con respeto y cariño. Después vamos juntos al bar del club para tomar bebidas frías y comer bocadillos de tortilla o jamón serrano. Estos momentos crean un ambiente solidario y alegre que hace que la comunidad esté siempre unida y activa.",
        "vocabularyHints": {
            "deporte": "sport",
            "reúne": "gathers / unites",
            "polideportivo": "sports center",
            "delantero": "forward / striker",
            "hierba": "grass / turf",
            "entrenador": "coach",
            "calentamiento": "warm-up",
            "lesiones": "injuries",
            "gradas": "stands / bleachers",
            "bocadillos": "sandwiches / baguettes",
            "solidario": "supportive / caring",
            "comunidad": "community"
        },
        "mcqQuestions": [
            {"question": "¿En qué ciudad se encuentra el barrio del narrador?", "options": ["En Madrid", "En Valencia", "En Bilbao", "En Sevilla"], "correctAnswerIndex": 1, "explanation": "El texto comienza diciendo: 'En mi barrio de Valencia...'"},
            {"question": "¿Cuándo se reúnen los vecinos para jugar al fútbol?", "options": ["Los viernes por la noche", "Los domingos por la mañana", "Los martes por la tarde", "Solo en verano"], "correctAnswerIndex": 1, "explanation": "Se encuentran todos los domingos por la mañana."},
            {"question": "¿En qué posición juega el narrador?", "options": ["Portero", "Defensa central", "Delantero", "Árbitro"], "correctAnswerIndex": 2, "explanation": "El narrador juega como delantero."},
            {"question": "¿Cuánto tiempo dura el calentamiento antes del partido?", "options": ["Cinco minutos", "Quince minutos", "Una hora", "No calientan"], "correctAnswerIndex": 1, "explanation": "Hacen ejercicios de calentamiento durante quince minutos."},
            {"question": "¿Qué comen juntos al terminar el partido?", "options": ["Sopa de marisco", "Bocadillos de tortilla o jamón serrano", "Pizza congelada", "Tartas de chocolate"], "correctAnswerIndex": 1, "explanation": "Comen bocadillos de tortilla o jamón en el bar del club."}
        ],
        "tfQuestions": [
            {"question": "El equipo del narrador viste camisetas rojas.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 0, "explanation": "Verdadero. Su equipo viste camisetas de color rojo."},
            {"question": "El partido se juega en un campo de tierra peligroso.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 1, "explanation": "Falso. Juegan sobre hierba artificial."},
            {"question": "Los familiares animan desde las gradas con aplausos.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 0, "explanation": "Verdadero. Los vecinos se sientan en las gradas y animan."},
            {"question": "Al terminar el partido, los equipos siempre se enfadan y discuten.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 1, "explanation": "Falso. Se saludan con respeto y cariño."},
            {"question": "Esta actividad dominical fortalece la unión de la comunidad.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 0, "explanation": "Verdadero. Crea un ambiente solidario que mantiene unida a la comunidad."}
        ]
    },
    {
        "title": "Cuidar las plantas en mi terraza (Caring for Plants on My Terrace)",
        "level": "A1",
        "language": "es",
        "text": "Durante la primavera pasada decidí transformar la pequeña terraza de mi piso en un rincón verde lleno de vida y color. Al principio no sabía casi nada sobre jardinería, pero compré varias macetas de cerámica, sacos de tierra fértil y semillas de diferentes flores y hierbas aromáticas. Ahora tengo plantas de albahaca, romero, menta fresca y tomates cherry que huelen de maravilla. También planté geranios rojos y margaritas blancas que alegran el espacio con sus vivos colores. Cada mañana, antes de desayunar, salgo a la terraza con una regadera para comprobar la humedad de la tierra y regar las plantas que lo necesitan. Es un hábito muy relajante que me ayuda a empezar el día con tranquilidad y buena energía. Durante los días calurosos de verano, pongo un toldo para proteger las hojas más sensibles del sol intenso del mediodía. En otoño coseché mis primeros tomates y preparé una ensalada deliciosa con aceite y albahaca fresca. Cuidar de estas plantas me ha enseñado a tener paciencia y a apreciar los pequeños milagros de la naturaleza.",
        "vocabularyHints": {
            "terraza": "terrace / balcony",
            "rincón": "corner / spot",
            "jardinería": "gardening",
            "macetas": "flowerpots",
            "fértil": "fertile",
            "albahaca": "basil",
            "romero": "rosemary",
            "geranios": "geraniums",
            "regadera": "watering can",
            "humedad": "moisture",
            "toldo": "awning / sunshade",
            "coseché": "I harvested"
        },
        "mcqQuestions": [
            {"question": "¿Cuándo empezó el narrador a transformar su terraza?", "options": ["En invierno", "En primavera", "En agosto", "Hace diez años"], "correctAnswerIndex": 1, "explanation": "Decidió transformar su terraza durante la primavera pasada."},
            {"question": "¿Qué hierbas aromáticas plantó en las macetas?", "options": ["Orégano y tomillo", "Albahaca, romero y menta fresca", "Solo perejil", "Cactus y bambú"], "correctAnswerIndex": 1, "explanation": "Plantó albahaca, romero y menta fresca."},
            {"question": "¿Qué flores de colores alegran la terraza?", "options": ["Rosas amarillas", "Geranios rojos y margaritas blancas", "Tulipanes negros", "Orquídeas azules"], "correctAnswerIndex": 1, "explanation": "Plantó geranios rojos y margaritas blancas."},
            {"question": "¿Qué utiliza para proteger las plantas en verano?", "options": ["Un ventilador", "Un toldo contra el sol intenso", "Un paraguas de papel", "Cristales oscuros"], "correctAnswerIndex": 1, "explanation": "Pone un toldo para proteger las hojas del sol intenso."},
            {"question": "¿Qué preparó el narrador con su primera cosecha?", "options": ["Una sopa de pescado", "Una ensalada con tomates y albahaca fresca", "Un pastel de manzana", "Zumo de naranja"], "correctAnswerIndex": 1, "explanation": "Preparó una ensalada deliciosa con tomates cherry y albahaca fresca."}
        ],
        "tfQuestions": [
            {"question": "El narrador era un jardinero profesional antes de empezar.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 1, "explanation": "Falso. El texto aclara: 'Al principio no sabía casi nada sobre jardinería'."},
            {"question": "Las macetas son de plástico barato de color gris.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 1, "explanation": "Falso. Compró macetas de cerámica."},
            {"question": "Comprobar la tierra por la mañana es una rutina relajante para él.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 0, "explanation": "Verdadero. Le ayuda a empezar el día con tranquilidad."},
            {"question": "Las plantas produjeron tomates cherry comestibles.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 0, "explanation": "Verdadero. Cosechó tomates cherry en otoño."},
            {"question": "Cuidar las plantas le ha enseñado a tener paciencia.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 0, "explanation": "Verdadero. El texto concluye afirmando que le enseñó paciencia."}
        ]
    },
    {
        "title": "La biblioteca de mi pueblo (My Village Library)",
        "level": "A1",
        "language": "es",
        "text": "En mi pequeño pueblo costero de Galicia hay un edificio antiguo de piedra que alberga la biblioteca pública municipal. Es sin duda mi lugar favorito para pasar las tardes lluviosas de invierno. La biblioteca tiene dos plantas luminosas con grandes ventanales de madera que ofrecen vistas al mar y al puerto de pescadores. En la planta baja se encuentra la sala infantil, repleta de cuentos ilustrados, y la zona de periódicos y revistas actuales. En la planta superior reina un silencio absoluto, perfecto para estudiar y concentrarse. Allí se conservan miles de libros organizados cuidadosamente por géneros: novelas históricas, poesía, ciencia y viajes. La bibliotecaria se llama doña Carmen y trabaja allí desde hace más de veinte años. Siempre recibe a los lectores con una sonrisa amable y recomienda libros interesantes adaptados a los gustos de cada persona. Los viernes por la tarde organiza un club de lectura donde vecinos de todas las edades comentamos una obra y compartimos café caliente con galletas caseras. La biblioteca es un verdadero tesoro cultural que enriquece la vida de nuestro pueblo.",
        "vocabularyHints": {
            "costero": "coastal",
            "alberga": "houses / hosts",
            "ventanales": "large windows",
            "puerto": "port / harbor",
            "cuentos": "stories / tales",
            "reina": "reigns / prevails",
            "géneros": "genres",
            "poesía": "poetry",
            "bibliotecaria": "librarian",
            "lectores": "readers",
            "club de lectura": "book club",
            "tesoro": "treasure"
        },
        "mcqQuestions": [
            {"question": "¿Dónde está situada la biblioteca municipal?", "options": ["En un rascacielos de Madrid", "En un pueblo costero de Galicia", "En una montaña de los Pirineos", "En una isla desierta"], "correctAnswerIndex": 1, "explanation": "Está en un pequeño pueblo costero de Galicia."},
            {"question": "¿Qué se puede ver a través de los ventanales?", "options": ["Una autopista ruidosa", "El mar y el puerto de pescadores", "Un aeropuerto", "Un campo de fútbol"], "correctAnswerIndex": 1, "explanation": "Tienen vistas al mar y al puerto de pescadores."},
            {"question": "¿Qué hay en la planta baja de la biblioteca?", "options": ["Un gimnasio", "La sala infantil y la zona de prensa", "Un restaurante", "Un garaje"], "correctAnswerIndex": 1, "explanation": "En la planta baja está la sala infantil y las revistas y periódicos."},
            {"question": "¿Cómo se llama la bibliotecaria?", "options": ["Doña Carmen", "Doña Laura", "Doña Marta", "Doña Isabel"], "correctAnswerIndex": 0, "explanation": "La bibliotecaria se llama doña Carmen."},
            {"question": "¿Qué actividad especial se organiza los viernes por la tarde?", "options": ["Un torneo de ajedrez", "Un club de lectura con café y galletas", "Una clase de baile", "Un concierto de rock"], "correctAnswerIndex": 1, "explanation": "Doña Carmen organiza un club de lectura con café y galletas."}
        ],
        "tfQuestions": [
            {"question": "La biblioteca está construida con piedra antigua.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 0, "explanation": "Verdadero. Es un edificio antiguo de piedra."},
            {"question": "En la planta superior siempre hay música muy alta y ruido.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 1, "explanation": "Falso. En la planta superior reina un silencio absoluto."},
            {"question": "Doña Carmen lleva trabajando en la biblioteca más de veinte años.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 0, "explanation": "Verdadero. Trabaja allí desde hace más de dos décadas."},
            {"question": "La biblioteca solo tiene libros de matemáticas y química.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 1, "explanation": "Falso. Tiene novelas históricas, poesía, viajes y ciencia."},
            {"question": "El club de lectura está abierto a vecinos de todas las edades.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 0, "explanation": "Verdadero. Participan vecinos de todas las edades."}
        ]
    },

    # ------------------ A2 (200-260 words) ------------------
    {
        "title": "La dieta mediterránea y sus beneficios (The Mediterranean Diet)",
        "level": "A2",
        "language": "es",
        "text": "La dieta mediterránea es reconocida en todo el mundo no solo por su exquisita variedad gastronómica, sino también como uno de los patrones nutricionales más saludables del planeta. Originaria de países como España, Italia y Grecia, esta forma tradicional de alimentación se caracteriza por el protagonismo indiscutible de ingredientes frescos, naturales y de temporada. El elemento central e insustituible es el aceite de oliva virgen extra, utilizado tanto para cocinar como para aderezar ensaladas y verduras. Este aceite dorado aporta grasas monoinsaturadas beneficiosas que protegen el sistema cardiovascular y ayudan a regular los niveles de colesterol en sangre. Además, la dieta promueve un consumo diario y abundante de verduras frescas, frutas maduras, legumbres como lentejas y garbanzos, frutos secos y cereales integrales. El consumo de pescado azul, especialmente sardinas, salmón y atún, se recomienda al menos dos veces por semana gracias a su alto contenido en ácidos grasos omega-3. En cambio, las carnes rojas y los productos ultraprocesados ricos en azúcares refinados se reservan para ocasiones excepcionales. Numerosos estudios médicos han demostrado que seguir este estilo de vida reduce notablemente el riesgo de padecer enfermedades crónicas y alarga la esperanza de vida. Comer en compañía y disfrutar de la sobremesa con amigos es también una parte fundamental de esta cultura que celebra la salud y la convivencia.",
        "vocabularyHints": {
            "patrones": "patterns",
            "protagonismo": "prominence / lead role",
            "insustituible": "irreplaceable",
            "aderezar": "to dress / season",
            "cardiovascular": "cardiovascular",
            "legumbres": "legumes / pulses",
            "pescado azul": "oily fish",
            "ultraprocesados": "ultra-processed",
            "esperanza de vida": "life expectancy",
            "sobremesa": "after-dinner conversation",
            "convivencia": "coexistence / togetherness",
            "enfermedades": "diseases"
        },
        "mcqQuestions": [
            {"question": "¿Cuál es el ingrediente central e insustituible de la dieta mediterránea?", "options": ["La mantequilla", "El aceite de oliva virgen extra", "El azúcar refinado", "El aceite de palma"], "correctAnswerIndex": 1, "explanation": "El aceite de oliva virgen extra es el pilar central de esta alimentación."},
            {"question": "¿Qué beneficio aportan las grasas del aceite de oliva virgen extra?", "options": ["Dañan el estómago", "Protegen el sistema cardiovascular y regulan el colesterol", "Provocan mareos", "No tienen ningún efecto"], "correctAnswerIndex": 1, "explanation": "Aportan grasas monoinsaturadas que protegen el corazón."},
            {"question": "¿Con qué frecuencia se recomienda consumir pescado azul?", "options": ["Una vez al año", "Al menos dos veces por semana", "Todos los días en cada comida", "Nunca"], "correctAnswerIndex": 1, "explanation": "Se aconseja consumirlo al menos dos veces a la semana por su omega-3."},
            {"question": "¿Qué alimentos se aconseja consumir solo de forma ocasional?", "options": ["Frutas y verduras", "Carnes rojas y ultraprocesados con azúcar", "Legumbres y lentejas", "Pescado fresco"], "correctAnswerIndex": 1, "explanation": "Las carnes rojas y productos azucarados deben ser excepcionales."},
            {"question": "¿Qué aspecto social forma parte de la cultura mediterránea según el texto?", "options": ["Comer siempre con prisa", "La sobremesa y comer en compañía", "Comer mirando el móvil en silencio", "Saltarse la comida"], "correctAnswerIndex": 1, "explanation": "Disfrutar de la sobremesa y comer en compañía es parte fundamental."}
        ],
        "tfQuestions": [
            {"question": "La dieta mediterránea es típica de países como España, Italia y Grecia.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 0, "explanation": "Verdadero. Estos países originaron esta tradición alimentaria."},
            {"question": "La mantequilla es el ingrediente principal para aliñar ensaladas.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 1, "explanation": "Falso. Se utiliza aceite de oliva virgen extra."},
            {"question": "Las legumbres como garbanzos y lentejas forman parte de la dieta diaria.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 0, "explanation": "Verdadero. Se promueve su consumo abundante y habitual."},
            {"question": "Seguir esta dieta incrementa el riesgo de padecer enfermedades crónicas.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 1, "explanation": "Falso. Los estudios demuestran que reduce el riesgo de enfermedades."},
            {"question": "La sobremesa celebra la convivencia y el tiempo compartido.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 0, "explanation": "Verdadero. Es un valor cultural central en el Mediterráneo."}
        ]
    },
    {
        "title": "El Camino de Santiago: Historia y naturaleza (The Camino de Santiago)",
        "level": "A2",
        "language": "es",
        "text": "Cada año, cientos de miles de peregrinos procedentes de todos los continentes recorren a pie, en bicicleta o a caballo alguna de las rutas históricas del Camino de Santiago. Esta milenaria tradición tiene su origen en la Edad Media, cuando los fieles cristianos peregrinaban hasta la catedral de Santiago de Compostela, en Galicia, para visitar la tumba del apóstol Santiago. En la actualidad, aunque muchos siguen caminando por motivos espirituales o de fe, una gran mayoría de caminantes realiza la ruta atraída por el reto deportivo, el deseo de desconectar del estrés laboral o la búsqueda de una experiencia cultural profunda. El itinerario más célebre es el Camino Francés, que comienza en los Pirineos y atraviesa hermosos paisajes montañosos, viñedos de La Rioja y extensas llanuras castellanas antes de alcanzar los verdes valles gallegos. A lo largo de la travesía, los caminantes duermen en albergues públicos y privados donde conviven personas de nacionalidades muy diversas, creando lazos de solidaridad únicos. Portar la credencial del peregrino y conseguir los sellos en cada pueblo es un ritual emocionante que culmina con la obtención de la Compostela en la Plaza del Obradoiro. Quienes completan el recorrido coinciden en que el Camino transforma su mirada sobre la vida, enseñándoles a valorar la sencillez, la naturaleza y la generosidad de la gente local.",
        "vocabularyHints": {
            "peregrinos": "pilgrims",
            "milenaria": "millenary / ancient",
            "fieles": "faithful / believers",
            "desconectar": "to disconnect / unwind",
            "itinerario": "itinerary / route",
            "viñedos": "vineyards",
            "llanuras": "plains",
            "albergues": "hostels / shelters",
            "credencial": "credential / pilgrim passport",
            "sellos": "stamps",
            "sencillez": "simplicity",
            "generosidad": "generosity"
        },
        "mcqQuestions": [
            {"question": "¿Dónde termina la peregrinación del Camino de Santiago?", "options": ["En la Catedral de Madrid", "En la Catedral de Santiago de Compostela", "En Barcelona", "En Lisboa"], "correctAnswerIndex": 1, "explanation": "La ruta culmina en la catedral de Santiago de Compostela en Galicia."},
            {"question": "¿Cuándo se originó la tradición de esta peregrinación?", "options": ["En el siglo veinte", "En la Edad Media", "En la época romana", "Hace solo cincuenta años"], "correctAnswerIndex": 1, "explanation": "Tiene su origen histórico en la Edad Media."},
            {"question": "¿Cuál es la ruta más conocida y transitada del Camino?", "options": ["El Camino del Norte", "El Camino Francés", "La Vía de la Plata", "El Camino Inglés"], "correctAnswerIndex": 1, "explanation": "El itinerario más célebre es el Camino Francés."},
            {"question": "¿Dónde suelen dormir los peregrinos durante su recorrido?", "options": ["En hoteles de gran lujo", "En albergues públicos y privados", "En tiendas de campaña en la playa", "En oficinas"], "correctAnswerIndex": 1, "explanation": "Duermen en albergues donde conviven con otros caminantes."},
            {"question": "¿Qué documento van sellando en cada localidad que visitan?", "options": ["El pasaporte internacional", "La credencial del peregrino", "El billete de tren", "Una carta postal"], "correctAnswerIndex": 1, "explanation": "Llevan la credencial del peregrino para recibir los sellos."}
        ],
        "tfQuestions": [
            {"question": "Hoy en día todos los peregrinos viajan exclusivamente por motivos religiosos.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 1, "explanation": "Falso. Muchos caminan por deporte, cultura o para reducir el estrés."},
            {"question": "El Camino Francés comienza en los Pirineos.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 0, "explanation": "Verdadero. Esta ruta célebre arranca en la cordillera pirenaica."},
            {"question": "En los albergues conviven caminantes de diversas nacionalidades.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 0, "explanation": "Verdadero. Se generan lazos de solidaridad entre personas del mundo entero."},
            {"question": "La Compostela se entrega a la salida en los Pirineos.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 1, "explanation": "Falso. Se obtiene al culminar el recorrido en Santiago."},
            {"question": "El viaje enseña a valorar la sencillez y el contacto con la naturaleza.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 0, "explanation": "Verdadero. El texto subraya estos aprendizajes vitales."}
        ]
    },
    {
        "title": "Energías limpias y el sol de España (Clean Energy & the Spanish Sun)",
        "level": "A2",
        "language": "es",
        "text": "España cuenta con una situación geográfica privilegiada en el sur de Europa que le otorga más de tres mil horas de sol al año en muchas de sus regiones. Esta formidable radiación solar, unida a constantes corrientes de viento en zonas costeras y mesetas, ha convertido al país en uno de los referentes internacionales más destacados en el desarrollo de energías renovables. En las últimas décadas, la instalación masiva de parques eólicos terrestres y gigantescas plantas fotovoltaicas ha permitido transformar la matriz energética nacional. Ya no es necesario depender tanto del petróleo o del carbón importado, lo que disminuye las emisiones contaminantes de dióxido de carbono y abarata la factura eléctrica a largo plazo. Además, el sector de las energías limpias genera miles de puestos de trabajo cualificados en investigación técnica, montaje de paneles solares y mantenimiento de turbinas eólicas en municipios rurales que antes sufrían el abandono demográfico. Los ciudadanos también participan de forma entusiasta mediante el autoconsumo solar, colocando placas fotovoltaicas en los tejados de sus viviendas unifamiliares y edificios comunitarios para producir su propia electricidad limpia. A pesar de los retos técnicos vinculados al almacenamiento en baterías para los días nublados, los expertos coinciden en que la transición verde es imparable y fundamental para frenar el cambio climático.",
        "vocabularyHints": {
            "privilegiada": "privileged",
            "radiación": "radiation",
            "mesetas": "plateaus",
            "parques eólicos": "wind farms",
            "fotovoltaicas": "photovoltaic / solar",
            "emisiones": "emissions",
            "abarata": "lowers the cost of",
            "cualificados": "skilled / qualified",
            "municipios": "municipalities",
            "autoconsumo": "self-consumption",
            "almacenamiento": "storage",
            "imparable": "unstoppable"
        },
        "mcqQuestions": [
            {"question": "¿Cuántas horas de sol al año disfrutan muchas regiones de España?", "options": ["Menos de mil", "Aproximadamente mil quinientas", "Más de tres mil", "Diez mil horas"], "correctAnswerIndex": 2, "explanation": "El texto señala que disfrutan de más de tres mil horas de sol al año."},
            {"question": "¿Qué dos energías limpias destacan en el desarrollo español?", "options": ["Nuclear y carbón", "Solar fotovoltaica y eólica", "Biomasa y leña", "Gas natural y petróleo"], "correctAnswerIndex": 1, "explanation": "Destacan los parques eólicos y las plantas fotovoltaicas."},
            {"question": "¿Qué beneficio ambiental produce el uso de energías renovables?", "options": ["Aumenta el humo en las ciudades", "Disminuye las emisiones contaminantes de CO2", "Calienta el agua del mar", "Destruye los árboles"], "correctAnswerIndex": 1, "explanation": "Reduce las emisiones de dióxido de carbono."},
            {"question": "¿Cómo ayuda este sector a los municipios rurales?", "options": ["Cerrando sus comercios", "Creando puestos de trabajo en montaje y mantenimiento", "Cobrando más impuestos", "Prohibiendo la agricultura"], "correctAnswerIndex": 1, "explanation": "Genera empleo técnico en zonas rurales afectadas por la despoblación."},
            {"question": "¿Cómo colaboran los ciudadanos en sus casas?", "options": ["Apagando la nevera", "Instalando paneles solares para autoconsumo en tejados", "Comprando velas", "Usando generadores de gasolina"], "correctAnswerIndex": 1, "explanation": "Instalan placas fotovoltaicas para producir su propia electricidad."}
        ],
        "tfQuestions": [
            {"question": "España se beneficia de una situación geográfica con abundante radiación solar.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 0, "explanation": "Verdadero. Cuenta con más de 3.000 horas anuales de sol en muchas regiones."},
            {"question": "El país depende hoy mucho más del carbón importado que hace veinte años.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 1, "explanation": "Falso. Ya no depende tanto de combustibles fósiles importados."},
            {"question": "El sector renovable requiere profesionales en montaje e investigación.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 0, "explanation": "Verdadero. Genera empleo cualificado en instalación y mantenimiento."},
            {"question": "El autoconsumo solar en viviendas está prohibido por ley en España.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 1, "explanation": "Falso. Los ciudadanos participan activamente instalando placas en tejados."},
            {"question": "El almacenamiento en baterías es uno de los retos técnicos actuales.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 0, "explanation": "Verdadero. Guardar la energía para días sin sol requiere baterías eficientes."}
        ]
    },
    {
        "title": "El aprendizaje de idiomas en la era digital (Language Learning in the Digital Age)",
        "level": "A2",
        "language": "es",
        "text": "Aprender una lengua extranjera ha dejado de ser una actividad limitada a las aulas tradicionales de academias o institutos. En la actualidad, el desarrollo imparable de las tecnologías de la información ha democratizado por completo el acceso a recursos didácticos de enorme calidad. Cualquier persona con un teléfono móvil y conexión a internet puede acceder a aplicaciones interactivas que combinan la inteligencia artificial con el juego, facilitando la memorización de vocabulario mediante repetición espaciada y ejercicios de pronunciación con reconocimiento de voz. Asimismo, los canales de vídeo en línea, las series con subtítulos en versión original y los podcasts especializados permiten a los estudiantes escuchar a hablantes nativos en contextos cotidianos y reales, mejorando la comprensión auditiva a su propio ritmo. Ya no es imprescindible viajar al extranjero o contratar clases particulares muy caras para mantener conversaciones fluidas; existen plataformas gratuitas de intercambio lingüístico donde dos usuarios de diferentes países charlan semanalmente por videollamada para practicar sus respectivos idiomas. No obstante, los pedagogos advierten de que la tecnología por sí sola no garantiza el éxito: la constancia diaria, la curiosidad cultural y la valentía para cometer errores sin avergonzarse siguen siendo las virtudes indispensables para dominar cualquier idioma.",
        "vocabularyHints": {
            "aulas": "classrooms",
            "democratizado": "democratized",
            "recursos": "resources",
            "repetición espaciada": "spaced repetition",
            "pronunciación": "pronunciation",
            "podcasts": "podcasts",
            "auditiva": "listening / auditory",
            "intercambio": "exchange",
            "videollamada": "video call",
            "constancia": "consistency / perseverance",
            "avergonzarse": "to feel ashamed",
            "indispensables": "indispensable"
        },
        "mcqQuestions": [
            {"question": "¿Cómo ha transformado la tecnología el aprendizaje de idiomas?", "options": ["Haciéndolo imposible", "Democratizando el acceso a recursos didácticos de calidad", "Prohibiendo las academias", "Obligando a comprar libros de papel"], "correctAnswerIndex": 1, "explanation": "Ha democratizado el acceso a recursos interactivos y globales."},
            {"question": "¿Qué método utilizan muchas aplicaciones para fijar el vocabulario?", "options": ["Repetición espaciada y reconocimiento de voz", "Copiar listas cien veces a mano", "Gritos continuos", "Traducción literal palabra por palabra"], "correctAnswerIndex": 0, "explanation": "Utilizan repetición espaciada y reconocimiento vocal."},
            {"question": "¿Cómo ayudan los podcasts y vídeos en versión original?", "options": ["Provocan sueño", "Permiten escuchar a nativos en contextos reales y a su propio ritmo", "Borran la memoria", "Son solo para niños pequeños"], "correctAnswerIndex": 1, "explanation": "Permiten oír a hablantes nativos en situaciones auténticas."},
            {"question": "¿Qué permiten las plataformas de intercambio lingüístico?", "options": ["Comprar billetes de avión", "Hacer videollamadas con hablantes nativos para practicar", "Descargar películas ilegales", "Vender diccionarios antiguos"], "correctAnswerIndex": 1, "explanation": "Permiten practicar idiomas con nativos por videollamada."},
            {"question": "¿Qué virtudes humanas siguen siendo indispensables para triunfar?", "options": ["La pereza y el silencio", "La constancia, la curiosidad y no tener miedo a equivocarse", "Tener mucho dinero", "Hablar solo con gente del mismo país"], "correctAnswerIndex": 1, "explanation": "La constancia diaria y la valentía para cometer errores son clave."}
        ],
        "tfQuestions": [
            {"question": "Hoy es obligatorio acudir a una academia para aprender un idioma.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 1, "explanation": "Falso. Las herramientas digitales permiten aprender desde casa."},
            {"question": "Las aplicaciones modernas emplean inteligencia artificial para corregir.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 0, "explanation": "Verdadero. Utilizan IA para pronunciación y ejercicios adaptados."},
            {"question": "Escuchar podcasts mejora la comprensión auditiva del estudiante.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 0, "explanation": "Verdadero. El texto subraya la mejora en comprensión auditiva."},
            {"question": "Tener miedo al error es la mejor manera de aprender a hablar.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 1, "explanation": "Falso. Hay que cometer errores con naturalidad y sin vergüenza."},
            {"question": "La tecnología sola no garantiza dominar una lengua sin esfuerzo.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 0, "explanation": "Verdadero. La constancia y el compromiso personal son indispensables."}
        ]
    },
    {
        "title": "El renacer de los trenes nocturnos en Europa (Night Trains in Europe)",
        "level": "A2",
        "language": "es",
        "text": "Durante las últimas décadas del siglo pasado, la imparable expansión de las aerolíneas de bajo coste provocó la progresiva desaparición de casi todas las líneas de trenes nocturnos que conectaban las grandes capitales europeas. Viajar en avión resultaba más rápido y, en muchas ocasiones, artificialmente más barato gracias a las exenciones fiscales sobre el combustible de aviación. Sin embargo, en los últimos años asistimos a un renacimiento espectacular del ferrocarril nocturno, impulsado por una creciente conciencia climática entre los viajeros y por el rechazo al estrés de los controles aeroportuarios. Subir a un tren en el centro de Viena o París a última hora de la tarde, cenar cómodamente mientras el paisaje desfila por la ventanilla, descansar en un compartimento con litera y despertar al día siguiente en el corazón de Berlín o Roma es una experiencia placentera y sumamente eficiente. Un viaje en tren genera hasta un noventa por ciento menos de emisiones de gases de efecto invernadero en comparación con el mismo trayecto realizado en avión comercial. Diversas compañías públicas y privadas están invirtiendo cientos de millones de euros en material rodante ultramoderno, con cabinas insonorizadas, conexión a internet de alta velocidad y duchas privadas. Los gobiernos comunitarios contemplan este medio de transporte como una pieza angular para alcanzar la neutralidad climática continental antes de mediados de siglo.",
        "vocabularyHints": {
            "aerolíneas": "airlines",
            "bajo coste": "low cost",
            "ferrocarril": "railway",
            "conciencia": "awareness / consciousness",
            "compartimento": "compartment",
            "litera": "bunk bed",
            "placentera": "pleasant",
            "emisiones": "emissions",
            "efecto invernadero": "greenhouse effect",
            "material rodante": "rolling stock / train cars",
            "insonorizadas": "soundproofed",
            "neutralidad": "neutrality"
        },
        "mcqQuestions": [
            {"question": "¿Por qué desaparecieron muchos trenes nocturnos en el pasado?", "options": ["Porque los trenes estaban prohibidos", "Por la expansión masiva de las aerolíneas de bajo coste", "Porque la gente no viajaba", "Por falta de vías"], "correctAnswerIndex": 1, "explanation": "Los vuelos baratos hicieron que muchos trenes nocturnos cerraran."},
            {"question": "¿Qué impulsa el regreso actual de los trenes nocturnos?", "options": ["La escasez de carreteras", "La conciencia climática y el deseo de viajar sin estrés", "El aumento de barcos", "El cierre de todos los aeropuertos"], "correctAnswerIndex": 1, "explanation": "El compromiso ambiental y la comodidad impulsan su renacer."},
            {"question": "¿Cuánto menos contaminan estos trenes en comparación con el avión?", "options": ["Un cinco por ciento menos", "Hasta un noventa por ciento menos de emisiones", "Contaminan el doble", "Exactamente lo mismo"], "correctAnswerIndex": 1, "explanation": "Emiten hasta un noventa por ciento menos de gases de efecto invernadero."},
            {"question": "¿Qué comodidades ofrecen las nuevas cabinas ultramodernas?", "options": ["Solo asientos de madera dura", "Cabinas insonorizadas, internet y duchas privadas", "Sin luz ni agua", "Espacio únicamente para maletas"], "correctAnswerIndex": 1, "explanation": "Ofrecen insonorización, wifi rápido y duchas privadas."},
            {"question": "¿Dónde suelen dejar al viajero las estaciones de tren?", "options": ["En el corazón o centro de las ciudades", "A cincuenta kilómetros del centro", "En medio del desierto", "En puertos marítimos"], "correctAnswerIndex": 0, "explanation": "Los trenes llegan directamente al centro neurálgico de las ciudades."}
        ],
        "tfQuestions": [
            {"question": "Los trenes nocturnos conectan centros urbanos mientras los pasajeros duermen.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 0, "explanation": "Verdadero. Se viaja y duerme de noche, amaneciendo en destino."},
            {"question": "El avión genera menos gases de efecto invernadero que el tren.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 1, "explanation": "Falso. El tren contamina hasta un 90% menos que el avión."},
            {"question": "Las nuevas compañías de tren están invirtiendo en cabinas silenciosas y modernas.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 0, "explanation": "Verdadero. Se invierte en material rodante insonorizado y confortable."},
            {"question": "Los viajeros de tren deben pasar tres horas antes por controles de seguridad.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 1, "explanation": "Falso. Evitan el estrés y las largas esperas de los aeropuertos."},
            {"question": "Europa ve en el ferrocarril nocturno un aliado para la neutralidad climática.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 0, "explanation": "Verdadero. Se considera clave para los objetivos verdes continentales."}
        ]
    },

    # ------------------ B1 (250-320 words) ------------------
    {
        "title": "El desafío demográfico de la España vaciada (The Empty Spain Demographic Challenge)",
        "level": "B1",
        "language": "es",
        "text": "En las últimas décadas, el debate social y político en España ha prestado una atención prioritaria al fenómeno conocido como 'la España vaciada', un proceso demográfico silencioso pero devastador que afecta a amplias comarcas del interior peninsular, como Aragón, Castilla y León, Extremadura y Castilla-La Mancha. Mientras grandes urbes como Madrid, Barcelona, Valencia o Málaga concentran el crecimiento poblacional, las inversiones empresariales y el dinamismo económico, miles de pueblos rurales sufren un envejecimiento alarmante y una pérdida continua de habitantes jóvenes que emigran en busca de empleo cualificado. Este éxodo constante desemboca en el cierre progresivo de servicios básicos esenciales: escuelas infantiles que bajan la persiana por falta de alumnos, consultorios médicos que atienden solo unas pocas horas a la semana y la desaparición de oficinas bancarias y pequeñas tiendas de comestibles. No obstante, en años recientes ha surgido un movimiento cívico que reivindica el valor estratégico del medio rural para el conjunto del país. Se argumenta que los pueblos son los guardianes de la biodiversidad, del patrimonio histórico-artístico, de la soberanía alimentaria y de los recursos hídricos indispensables para las ciudades. El despliegue de redes de fibra óptica de alta velocidad y el fomento del teletrabajo han comenzado a atraer a una nueva generación de profesionales digitales que buscan tranquilidad, viviendas asequibles y una relación más estrecha con el entorno natural. Paralelamente, proyectos innovadores de agroturismo sostenible y cooperativas de producción ecológica están demostrando que el campo tiene futuro si se le dota de incentivos fiscales justos y de una conectividad tecnológica adecuada. La revitalización del interior no es solo un acto de justicia territorial, sino una necesidad inaplazable para garantizar el equilibrio medioambiental y social de la nación.",
        "vocabularyHints": {
            "desafío": "challenge",
            "vaciada": "emptied / hollowed-out",
            "envejecimiento": "aging",
            "éxodo": "exodus",
            "consultorios": "medical clinics / dispensaries",
            "comestibles": "groceries",
            "reivindica": "claims / champions",
            "soberanía alimentaria": "food sovereignty",
            "hídricos": "water / hydrological",
            "asequibles": "affordable",
            "agroturismo": "agritourism",
            "revitalización": "revitalization"
        },
        "mcqQuestions": [
            {"question": "¿Qué describe el término 'la España vaciada'?", "options": ["Un parque temático de diversiones", "El fenómeno de despoblación y envejecimiento en áreas rurales del interior", "La falta de agua en las playas del sur", "Una crisis en las grandes ciudades costeras"], "correctAnswerIndex": 1, "explanation": "Se refiere a la pérdida constante de población en comarcas rurales interiores."},
            {"question": "¿Por qué emigran principalmente los jóvenes de los pueblos?", "options": ["Porque odian la naturaleza", "En busca de formación universitaria y empleo cualificado en grandes ciudades", "Para evitar el sol", "Porque no hay coches"], "correctAnswerIndex": 1, "explanation": "Emigran a las metrópolis en busca de oportunidades laborales y formativas."},
            {"question": "¿Qué consecuencia directa tiene la pérdida de población en los pueblos?", "options": ["Apertura de más hospitales", "Cierre progresivo de colegios, consultorios médicos y servicios bancarios", "Llegada de millones de turistas diarios", "Rebajas en los billetes de tren"], "correctAnswerIndex": 1, "explanation": "Provoca el cierre de servicios básicos como escuelas y centros de salud."},
            {"question": "¿Qué factor tecnológico reciente está ayudando a atraer nuevos profesionales?", "options": ["La televisión en blanco y negro", "El despliegue de fibra óptica y el auge del teletrabajo", "El correo postal por barco", "El telégrafo"], "correctAnswerIndex": 1, "explanation": "La conexión rápida a internet y el teletrabajo permiten vivir en el campo."},
            {"question": "¿Por qué el medio rural es estratégico para toda la sociedad según el texto?", "options": ["Solo para construir autopistas", "Porque custodia la biodiversidad, los alimentos y los recursos hídricos", "Porque no produce nada", "Para almacenar basura"], "correctAnswerIndex": 1, "explanation": "Los pueblos cuidan el agua, los alimentos y la biodiversidad que necesitan las urbes."}
        ],
        "tfQuestions": [
            {"question": "Ciudades como Madrid y Barcelona concentran la mayor parte del crecimiento demográfico.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 0, "explanation": "Verdadero. Las grandes urbes absorben la población y la inversión."},
            {"question": "En la España vaciada los colegios rurales crecen en número de alumnos cada año.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 1, "explanation": "Falso. Muchas escuelas bajan la persiana por falta de niños."},
            {"question": "Profesionales digitales se trasladan al campo gracias al teletrabajo.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 0, "explanation": "Verdadero. Buscan tranquilidad, viviendas asequibles y buena conexión."},
            {"question": "La agricultura ecológica carece por completo de viabilidad en el medio rural.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 1, "explanation": "Falso. Proyectos ecológicos e innovadores demuestran que el campo tiene futuro."},
            {"question": "Revitalizar el interior de la península es crucial para el equilibrio social del país.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 0, "explanation": "Verdadero. El texto concluye que es una necesidad de justicia y equilibrio."}
        ]
    },
    {
        "title": "El legado arquitectónico del Islam en la península ibérica (Islamic Architecture)",
        "level": "B1",
        "language": "es",
        "text": "Durante casi ocho siglos, desde el año 711 hasta la caída del reino nazarí de Granada en 1492, la presencia de la civilización islámica en al-Ándalus transformó de manera indeleble la fisonomía cultural, científica y arquitectónica de la península ibérica. Lejos de constituir un mero paréntesis histórico, esta prolongada convivencia legó a la humanidad un patrimonio monumental de belleza excepcional y sofisticación técnica sin precedentes en el continente europeo. Dos cumbres sublimes ilustran la genialidad de esta tradición constructiva: la Mezquita de Córdoba y la Alhambra de Granada. La Mezquita de Córdoba, iniciada en el siglo VIII por el emir Abderramán I y ampliada sucesivamente por sus sucesores, deslumbra al visitante con su célebre bosque de columnas de mármol, jaspe y granito, coronadas por arcos dobles de herradura bicolores en rojo y blanco que confieren una sensación de infinita ligereza espacial. Por su parte, la Alhambra, palacio-fortaleza erigido sobre la colina de la Sabika frente a Sierra Nevada, sintetiza el refinamiento de la arquitectura cortesana nazarí. Sus constructores no buscaban abrumar mediante la monumentalidad colosal de los edificios exteriores, sino mediante la delicadeza íntima del espacio interior: estucos primorosamente tallados con versos coránicos y poemas amorosos, zócalos de azulejos geométricos polícromos y, sobre todo, el magistral empleo del agua como elemento arquitectónico vivo. En el Patio de los Leones o en los jardines del Generalife, albercas, acequias y fuentes reflejan la luz del cielo y refrescan el ambiente con su murmullo relajante. Este legado andalusí demuestra cómo la arquitectura puede armonizar el cálculo matemático, la poesía visual y la comunión respetuosa con el entorno natural.",
        "vocabularyHints": {
            "legado": "legacy / heritage",
            "fisonomía": "character / appearance",
            "paréntesis": "parenthesis / break",
            "jaspe": "jasper",
            "arcos de herradura": "horseshoe arches",
            "bicolores": "two-toned / bi-colored",
            "sintetiza": "synthesizes / encapsulates",
            "estucos": "stucco work",
            "zócalos": "socles / tiled baseboards",
            "azulejos": "ceramic tiles",
            "acequias": "irrigation channels",
            "murmullo": "murmur / gentle sound"
        },
        "mcqQuestions": [
            {"question": "¿Cuántos siglos aproximadamente duró la presencia islámica en la península ibérica?", "options": ["Solo un siglo", "Casi ocho siglos", "Dos mil años", "Tres décadas"], "correctAnswerIndex": 1, "explanation": "Duró casi ocho siglos, desde 711 hasta 1492."},
            {"question": "¿Qué elemento visual destaca en la sala de oración de la Mezquita de Córdoba?", "options": ["Pinturas al óleo renacentistas", "Un bosque de columnas con arcos bicolores de herradura", "Grandes vidrieras góticas", "Estatuas de oro macizo"], "correctAnswerIndex": 1, "explanation": "Destaca su bosque de columnas con arcos dobles rojos y blancos."},
            {"question": "¿Dónde está situada la ciudadela palaciega de la Alhambra?", "options": ["En Sevilla", "En Granada, frente a Sierra Nevada", "En Toledo", "En Zaragoza"], "correctAnswerIndex": 1, "explanation": "Se ubica en la colina de la Sabika en Granada."},
            {"question": "¿Qué elemento vivo utilizaron magistralmente los nazaríes en sus palacios?", "options": ["El fuego", "El agua en fuentes, acequias y albercas", "El hielo", "El humo aromático"], "correctAnswerIndex": 1, "explanation": "El agua es protagonista vital en albercas, fuentes y jardines."},
            {"question": "¿Qué tipo de decoración predomina en los muros interiores de la Alhambra?", "options": ["Esculturas de bronce", "Estucos tallados con caligrafía y azulejos geométricos", "Mosaicos romanos de cacerías", "Tapices de lana oscura"], "correctAnswerIndex": 1, "explanation": "Predominan los estucos tallados con versos y alicatados geométricos."}
        ],
        "tfQuestions": [
            {"question": "La presencia islámica en la península concluyó con la toma de Granada en 1492.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 0, "explanation": "Verdadero. En 1492 finalizó el reino nazarí de Granada."},
            {"question": "La Mezquita de Córdoba fue construida en una sola fase de quince días.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 1, "explanation": "Falso. Fue iniciada en el siglo VIII y ampliada durante generaciones."},
            {"question": "La arquitectura nazarí daba prioridad a la intimidad y la armonía interior.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 0, "explanation": "Verdadero. Buscaba la delicadeza interior antes que la mole externa."},
            {"question": "En el Patio de los Leones el agua no tiene ninguna presencia.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 1, "explanation": "Falso. La fuente central y sus canales son el eje del patio."},
            {"question": "El arte andalusí combina geometría matemática con poesía y naturaleza.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 0, "explanation": "Verdadero. El texto ensalza esta integración matemática y natural."}
        ]
    },
    {
        "title": "La conservación del lince ibérico: Un triunfo ecológico (Iberian Lynx Conservation)",
        "level": "B1",
        "language": "es",
        "text": "A comienzos del presente siglo XXI, el lince ibérico se encontraba al borde mismo de la extinción definitiva, considerado por la Unión Internacional para la Conservación de la Naturaleza como el felino más amenazado del planeta. Con menos de cien ejemplares censados en libertad, recluidos en dos núcleos aislados de Andalucía –Doñana y la Sierra de Andújar–, el porvenir de esta joya de la fauna autóctona parecía sentenciado. La destrucción sistemática de su hábitat natural provocada por la fragmentación de carreteras, el declive masivo de su presa principal –el conejo de monte, diezmado por enfermedades víricas– y el furtivismo habían reducido la población a niveles genéticos críticos. Ante esta situación de emergencia biológica, administraciones públicas, científicos, organizaciones ecologistas y propietarios de fincas privadas pusieron en marcha una ambiciosa estrategia de rescate respaldada por fondos europeos del programa LIFE. El plan articuló tres ejes fundamentales: la cría en cautividad en centros especializados, la restauración ecológica del monte mediterráneo y la reintroducción paulatina de ejemplares en territorios históricos de Castilla-La Mancha, Extremadura y Portugal. Asimismo, se construyeron pasos subterráneos de fauna en autovías para evitar atropellos mortales y se firmaron convenios con cazadores para asegurar la disponibilidad de presas. Gracias a este esfuerzo sin parangón, el censo actual supera los dos mil individuos en libertad, lo que ha permitido rebajar su categoría de peligro crítico a especie vulnerable. La recuperación del lince ibérico representa un hito histórico de esperanza y demuestra que, con rigor científico, presupuesto suficiente y cooperación multidisciplinar, es posible revertir la pérdida de biodiversidad.",
        "vocabularyHints": {
            "extinción": "extinction",
            "ejemplares": "specimens / individuals",
            "censados": "counted / surveyed",
            "autóctona": "indigenous / native",
            "diezmado": "decimated",
            "furtivismo": "poaching",
            "cría en cautividad": "captive breeding",
            "reintroducción": "reintroduction",
            "pasos subterráneos": "underpasses",
            "atropellos": "roadkills / vehicle accidents",
            "parangón": "comparison / parallel",
            "vulnerable": "vulnerable"
        },
        "mcqQuestions": [
            {"question": "¿Cómo estaba catalogado el lince ibérico a principios de este siglo?", "options": ["Como una especie muy abundante", "Como el felino más amenazado del planeta", "Como un animal doméstico", "Como un animal extinto hace siglos"], "correctAnswerIndex": 1, "explanation": "Era considerado el felino con mayor riesgo de desaparición del mundo."},
            {"question": "¿Cuántos ejemplares quedaban aproximadamente en libertad en su momento más crítico?", "options": ["Diez mil", "Menos de cien ejemplares", "Alrededor de cinco mil", "Solo dos"], "correctAnswerIndex": 1, "explanation": "Quedaban menos de un centenar censados en libertad."},
            {"question": "¿Cuál es la presa principal e indispensable en la dieta del lince ibérico?", "options": ["El jabalí", "El conejo de monte", "El ciervo", "Peces de río"], "correctAnswerIndex": 1, "explanation": "El conejo de monte constituye la base alimentaria del lince."},
            {"question": "¿Qué medida se adoptó en las carreteras para proteger a los linces?", "options": ["Cerrar todas las autovías", "Construir pasos subterráneos de fauna para evitar atropellos", "Poner música alta", "Pintar los árboles de azul"], "correctAnswerIndex": 1, "explanation": "Se construyeron pasos de fauna específicos bajo las vías rápidas."},
            {"question": "¿Cuál es la cifra actual de linces ibéricos en libertad según el texto?", "options": ["Cincuenta", "Más de dos mil individuos", "Quinientos", "Diez millones"], "correctAnswerIndex": 1, "explanation": "El censo actual supera ya los dos mil ejemplares en libertad."}
        ],
        "tfQuestions": [
            {"question": "El lince ibérico solo sobrevivía en Doñana y la Sierra de Andújar a inicios del siglo XXI.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 0, "explanation": "Verdadero. Estaban aislados en estos dos reductos andaluces."},
            {"question": "Las enfermedades del conejo de monte perjudicaron gravemente al lince.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 0, "explanation": "Verdadero. Al mermar su presa principal, pasaron hambre."},
            {"question": "El programa europeo LIFE financió parte de las acciones de conservación.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 0, "explanation": "Verdadero. Recibió respaldo financiero del programa LIFE."},
            {"question": "Actualmente el lince ibérico sigue estando clasificado en peligro crítico inminente.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 1, "explanation": "Falso. Gracias al éxito, su estatus ha bajado a especie vulnerable."},
            {"question": "Se han reintroducido linces también en regiones de Portugal.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 0, "explanation": "Verdadero. Las reintroducciones abarcan Castilla-La Mancha, Extremadura y Portugal."}
        ]
    },
    {
        "title": "La revolución del teletrabajo y la conciliación familiar (Telework & Work-Life Balance)",
        "level": "B1",
        "language": "es",
        "text": "La crisis sanitaria mundial del año 2020 aceleró de manera imprevista una transformación laboral que los expertos preveían para dentro de varias décadas: la implantación masiva del teletrabajo. De la noche a la mañana, millones de empleados tuvieron que trasladar sus ordenadores a los salones y cocinas de sus hogares, adaptándose a marchas forzadas al uso de plataformas colaborativas y reuniones telemáticas. Aunque en un primer momento la transición se vivió con incertidumbre técnica, la experiencia acumulada en los años posteriores ha consolidado el trabajo en remoto como una de las aspiraciones laborales más valoradas por los trabajadores contemporáneos. La principal ventaja señalada por la mayoría de las encuestas es el ahorro sustancial de tiempo en desplazamientos cotidianos. Evitar los colapsos circulatorios en las autovías de acceso a las metrópolis o las aglomeraciones en los vagones de tren permite a los profesionales disponer de entre una y dos horas extra al día, lo que repercute favorablemente en la conciliación de la vida personal, el cuidado de los hijos y el descanso físico. Por su parte, las empresas han descubierto que la flexibilidad no merma la productividad de sus plantillas, sino que con frecuencia la incrementa al reducir el absentismo y mejorar la motivación del personal. Sin embargo, no todo son beneficios: el teletrabajo plantea riesgos como el aislamiento social, la dificultad para desconectar digitalmente tras la jornada y la invasión del espacio doméstico por asuntos profesionales. Por estas razones, la mayoría de las organizaciones aboga por fórmulas híbridas que combinen dos o tres jornadas presenciales de trabajo en equipo con días de concentración en el domicilio particular.",
        "vocabularyHints": {
            "imprevista": "unexpected",
            "implantación": "implementation",
            "telemáticas": "virtual / online",
            "desplazamientos": "commutes / travels",
            "colapsos": "gridlocks / traffic jams",
            "conciliación": "work-life balance",
            "merma": "reduces / diminishes",
            "absentismo": "absenteeism",
            "aislamiento": "isolation",
            "desconectar": "to disconnect",
            "híbridas": "hybrid",
            "presenciales": "on-site / in-person"
        },
        "mcqQuestions": [
            {"question": "¿Qué acontecimiento aceleró la adopción masiva del teletrabajo?", "options": ["Una crisis petrolera", "La crisis sanitaria global del año 2020", "Un corte de electricidad mundial", "La invención de la televisión"], "correctAnswerIndex": 1, "explanation": "La crisis sanitaria de 2020 aceleró de forma repentina el trabajo en remoto."},
            {"question": "¿Cuál es la ventaja más destacada por los empleados que teletrabajan?", "options": ["Cobrar el triple", "El ahorro sustancial de tiempo en desplazamientos diarios", "No hablar con nadie jamás", "Trabajar sin ordenador"], "correctAnswerIndex": 1, "explanation": "Ahorrar entre una y dos horas diarias de atascos y transporte."},
            {"question": "¿Cómo ha afectado la flexibilidad a la productividad laboral según el texto?", "options": ["Ha destruido a todas las empresas", "Con frecuencia la incrementa al reducir el absentismo", "Ha hecho que nadie trabaje", "La ha reducido a cero"], "correctAnswerIndex": 1, "explanation": "La productividad a menudo aumenta al reducirse el estrés y el absentismo."},
            {"question": "¿Qué riesgo psicológico se asocia al teletrabajo continuo?", "options": ["Pérdida del apetito", "Aislamiento social y dificultad para desconectar digitalmente", "Dolor en los dientes", "Fiebre alta"], "correctAnswerIndex": 1, "explanation": "Puede provocar aislamiento social y dificultades para fijar límites."},
            {"question": "¿Por qué modelo de trabajo apuestan la mayoría de las empresas hoy?", "options": ["Cien por cien presencial estricto", "Fórmulas híbridas combinando días presenciales y remotos", "Trabajar solo los domingos", "Eliminar todos los contratos"], "correctAnswerIndex": 1, "explanation": "Se prefieren esquemas híbridos equilibrados entre casa y oficina."}
        ],
        "tfQuestions": [
            {"question": "Millones de trabajadores trasladaron su oficina a casa de forma repentina en 2020.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 0, "explanation": "Verdadero. La pandemia forzó una mudanza laboral sin precedentes."},
            {"question": "Los desplazamientos diarios en hora punta benefician el descanso familiar.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 1, "explanation": "Falso. Los atascos y trayectos restan horas de ocio y conciliación."},
            {"question": "Las empresas descubrieron que el teletrabajo no arruina la productividad.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 0, "explanation": "Verdadero. Se comprobó que el rendimiento se mantiene o crece."},
            {"question": "Desconectar del trabajo resulta siempre muy sencillo cuando la oficina está en casa.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 1, "explanation": "Falso. La invasión del espacio doméstico dificulta la desconexión."},
            {"question": "El modelo híbrido permite combinar concentración en casa con colaboración presencial.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 0, "explanation": "Verdadero. Permite disfrutar de las ventajas de ambos formatos."}
        ]
    },
    {
        "title": "Gastronomía molecular: Ciencia en los fogones (Molecular Gastronomy)",
        "level": "B1",
        "language": "es",
        "text": "En las últimas dos décadas, la cocina de vanguardia española ha liderado una revolución cultural que ha fascinado al panorama gastronómico internacional, transformando los fogones tradicionales en auténticos laboratorios de experimentación sensorial. Encabezada por figuras legendarias como Ferran Adrià desde su emblemático restaurante elBulli en la cala Montjoi de Cataluña, esta corriente –a menudo etiquetada como cocina molecular o tecnoemocional– no persigue alimentar únicamente el cuerpo, sino provocar el asombro intelectual y la emoción en el comensal. Para lograrlo, los chefs han recurrido a principios rigurosos de la física y la química para deconstruir recetas consagradas y manipular las texturas, temperaturas y estados de la materia sin renunciar a la autenticidad del sabor original. Técnicas revolucionarias como la esferificación –que permite encapsular líquidos en finas membranas de alginato de sodio que estallan en la boca–, el empleo de nitrógeno líquido para lograr congelaciones instantáneas a casi doscientos grados bajo cero sin formar cristales de hielo, o el uso de sifones térmicos para crear espumas etéreas han cambiado para siempre la historia culinaria. Lejos de ser un mero espectáculo frívolo para restaurantes de lujo, esta disciplina científica ha arrojado luz sobre los mecanismos biológicos del gusto, la memoria olfativa y la percepción cerebral de los alimentos. Además, sus hallazgos han permeado la industria agroalimentaria y la cocina doméstica cotidiana, donde hoy se cocinan carnes a baja temperatura con circuladores de agua para preservar su jugosidad o se aprovechan espesantes naturales derivados de algas para elaborar salsas saludables y sin gluten. La cocina molecular demuestra que arte y ciencia pueden fusionarse armoniosamente en el plato.",
        "vocabularyHints": {
            "vanguardia": "avant-garde",
            "fogones": "stoves / kitchens",
            "asombro": "wonder / astonishment",
            "deconstruir": "to deconstruct",
            "esferificación": "spherification",
            "alginato": "alginate",
            "nitrógeno": "nitrogen",
            "sifones": "siphons / whippers",
            "etéreas": "ethereal / light",
            "permeado": "permeated",
            "circuladores": "circulators (sous-vide)",
            "espesantes": "thickeners"
        },
        "mcqQuestions": [
            {"question": "¿Quién fue el chef pionero más representativo de la cocina de vanguardia española?", "options": ["Jamie Oliver", "Ferran Adrià en elBulli", "Gordon Ramsay", "Paul Bocuse"], "correctAnswerIndex": 1, "explanation": "Ferran Adrià lideró esta revolución culinaria desde elBulli."},
            {"question": "¿Qué persigue provocar la cocina tecnoemocional en el comensal?", "options": ["Solo saciar el hambre rápida", "Asombro intelectual, curiosidad y emoción", "Miedo y tristeza", "Aburrimiento"], "correctAnswerIndex": 1, "explanation": "Busca desafiar la mente y emocionar mediante texturas y conceptos."},
            {"question": "¿En qué consiste la técnica de la esferificación?", "options": ["En hornear pan redondo", "En encapsular líquidos en finas membranas que estallan en boca", "En freír patatas con aceite hirviendo", "En triturar fruta"], "correctAnswerIndex": 1, "explanation": "Permite crear esferas líquidas con alginato que explotan en el paladar."},
            {"question": "¿Para qué se utiliza el nitrógeno líquido en la cocina molecular?", "options": ["Para calentar sopas", "Para congelar instantáneamente sin crear cristales de hielo", "Para lavar los platos", "Como bebida refrescante"], "correctAnswerIndex": 1, "explanation": "Permite ultracongelaciones instantáneas manteniendo texturas perfectas."},
            {"question": "¿Qué aplicación doméstica común ha derivado de estas investigaciones?", "options": ["El microondas", "La cocción a baja temperatura al vacío para carnes jugosas", "El tostador de pan", "La cafetera italiana"], "correctAnswerIndex": 1, "explanation": "La cocina a baja temperatura controlada sous-vide se popularizó en los hogares."}
        ],
        "tfQuestions": [
            {"question": "La cocina molecular combina principios de la física y la química con el arte culinario.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 0, "explanation": "Verdadero. Utiliza la ciencia para reinventar texturas y temperaturas."},
            {"question": "ElBulli estaba ubicado en el centro financiero de Madrid.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 1, "explanation": "Falso. Estaba en la cala Montjoi, en la costa de Cataluña."},
            {"question": "Los sifones se utilizan para elaborar espumas ligeras y etéreas.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 0, "explanation": "Verdadero. Es la técnica clásica para espumas culinarias."},
            {"question": "La investigación sensorial no aportó ningún conocimiento al estudio del gusto.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 1, "explanation": "Falso. Ayudó a desentrañar la percepción cerebral y la memoria del sabor."},
            {"question": "Ciertas técnicas de vanguardia benefician la preparación de platos sin gluten.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 0, "explanation": "Verdadero. Espesantes naturales marinos sustituyen harinas con gluten."}
        ]
    },

    # ------------------ B2 (280-360 words) ------------------
    {
        "title": "El impacto del turismo masivo en las ciudades históricas (Overtourism in Historic Cities)",
        "level": "B2",
        "language": "es",
        "text": "El sector turístico internacional ha constituido durante décadas uno de los motores macroeconómicos más determinantes de España, representando más del doce por ciento de su producto interior bruto y generando millones de empleos directos e indirectos en servicios, transporte y hostelería. Sin embargo, en tiempos recientes, el crecimiento exponencial e incontrolado del flujo de visitantes ha desatado un intenso debate social sobre los límites de la sostenibilidad urbana en destinos emblemáticos como Barcelona, Palma de Mallorca, Sevilla o San Sebastián. Este fenómeno, acuñado internacionalmente como 'sobreturismo' o turistificación, amenaza con quebrar el delicado equilibrio entre la rentabilidad económica y la preservación de la vida vecinal cotidiana. La proliferación desregulada de viviendas de uso turístico en plataformas digitales ha provocado una escalada desorbitada en los precios de los alquileres residenciales, forzando a los residentes tradicionales, estudiantes y familias trabajadoras a abandonar los barrios históricos hacia periferias lejanas y peor comunicadas. Paralelamente, el tejido comercial autóctono sufre una mutación radical: ultramarinos centenarios, librerías y talleres artesanos son reemplazados sistemáticamente por franquicias multinacionales, tiendas de recuerdos de baja calidad y terrazas saturadas de locales de comida rápida diseñados exclusivamente para el forastero efímero. A esto se suma la sobrecarga insostenible de los servicios públicos de recogida de basuras, la saturación del transporte colectivo y la pérdida del sosiego en el espacio público compartido, transformando cascos antiguos llenos de historia en meros decorados escenográficos desprovistos de alma comunitaria. Ante esta encrucijada, colectivos ciudadanos y administraciones municipales reclaman medidas urgentes: moratorias al alojamiento turístico, tasas ecológicas disuasorias y una descentralización activa que promocione zonas menos concurridas. La viabilidad del turismo a largo plazo exige subordinar el lucro inmediato a la conservación del patrimonio material y al bienestar irrenunciable de los habitantes locales.",
        "vocabularyHints": {
            "macroeconómicos": "macroeconomic",
            "sobreturismo": "overtourism",
            "turistificación": "touristification",
            "proliferación": "proliferation",
            "escalada": "escalation",
            "autóctono": "indigenous / local",
            "ultramarinos": "traditional grocery shops",
            "forastero": "outsider / tourist",
            "decorados": "backdrops / stage sets",
            "moratorias": "moratoriums",
            "disuasorias": "dissuasive / deterrent",
            "irrenunciable": "inalienable / non-negotiable"
        },
        "mcqQuestions": [
            {"question": "¿Cuánto representa aproximadamente el turismo en el PIB español?", "options": ["Menos del uno por ciento", "Más del doce por ciento", "El cincuenta por ciento", "Exactamente el tres por ciento"], "correctAnswerIndex": 1, "explanation": "Representa más del doce por ciento de la riqueza nacional."},
            {"question": "¿Qué grave consecuencia tiene la proliferación de pisos turísticos en el centro?", "options": ["Bajada masiva de los alquileres", "Escalada de alquileres y expulsión de los vecinos hacia la periferia", "Construcción de más colegios", "Aparición de huertos urbanos"], "correctAnswerIndex": 1, "explanation": "Encarece la vivienda y expulsa a las familias de los barrios céntricos."},
            {"question": "¿Cómo se transforma el comercio tradicional en áreas turistificadas?", "options": ["Solo abren bibliotecas", "Tiendas tradicionales son sustituidas por franquicias y tiendas de souvenirs", "No se vende nada", "Se prohíben las terrazas"], "correctAnswerIndex": 1, "explanation": "El comercio local da paso a franquicias y souvenirs orientados al turismo."},
            {"question": "¿Qué problemas de infraestructuras genera la afluencia masiva de viajeros?", "options": ["Ninguno en absoluto", "Saturación del transporte y sobrecarga de limpieza y basuras", "Las calles se quedan desiertas", "Se gasta menos agua"], "correctAnswerIndex": 1, "explanation": "Colapsa el transporte público y sobrecarga los servicios de basura."},
            {"question": "¿Qué medidas demandan colectivos vecinales para proteger las ciudades?", "options": ["Demoler los cascos antiguos", "Moratorias a nuevos alojamientos turísticos y tasas ambientales", "Regalar billetes de avión", "Prohibir caminar por la calle"], "correctAnswerIndex": 1, "explanation": "Piden limitar licencias de alojamiento, aplicar tasas y regular la actividad."}
        ],
        "tfQuestions": [
            {"question": "El sobreturismo afecta a urbes como Barcelona, Palma de Mallorca y Sevilla.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 0, "explanation": "Verdadero. Son algunos de los centros urbanos más tensionados."},
            {"question": "Los alquileres de viviendas han descendido notablemente en el centro histórico.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 1, "explanation": "Falso. Han sufrido una escalada desorbitada que expulsa a los residentes."},
            {"question": "El comercio local de toda la vida se mantiene intacto y sin cambios.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 1, "explanation": "Falso. Cierran tiendas históricas sustituidas por cadenas globales."},
            {"question": "El turismo genera una sobrecarga en los servicios públicos de recogida de residuos.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 0, "explanation": "Verdadero. La basura y la limpieza urbana sufren gran presión."},
            {"question": "Proteger el bienestar de los residentes locales es indispensable para la sostenibilidad.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 0, "explanation": "Verdadero. La sostenibilidad a largo plazo exige priorizar a la comunidad."}
        ]
    },
    {
        "title": "La gestión del agua y la desertificación en la península (Water Management & Desertification)",
        "level": "B2",
        "language": "es",
        "text": "La península ibérica se encuentra situada en una de las regiones más vulnerables del planeta ante los embates del cambio climático global, donde el progresivo incremento de las temperaturas medias y la alteración de los patrones estacionales de lluvia están acelerando el proceso de desertificación a un ritmo sin precedentes. Según los informes más recientes del panel intergubernamental de expertos sobre el clima, más de dos terceras partes del territorio español se encuentran en riesgo alto o muy alto de convertirse en tierras áridas y degradadas antes de que termine el presente siglo. Este panorama se ve agravado por un modelo de gobernanza hídrica que durante décadas ha incentivado la sobreexplotación desmedida de las cuencas fluviales y los acuíferos subterráneos. La expansión continua de la agricultura de regadío intensivo en zonas tradicionalmente de secano –destinada a convertir áreas semiáridas en la llamada 'huerta de Europa' exportadora de frutas y hortalizas fuera de temporada– consume cerca del ochenta por ciento de los recursos de agua dulce disponibles en el país. Pozos ilegales perforados sin control han desecado ecosistemas húmedos de incalculable valor ecológico, como las Tablas de Daimiel o las lagunas costeras de Doñana, poniendo en jaque su supervivencia biológica. Ante sequías meteorológicas cada vez más frecuentes y prolongadas, el tradicional recurso a trasvases entre ríos suscita graves conflictos políticos y territoriales entre comunidades autónomas vecinas. Para revertir esta espiral destructiva, la comunidad científica aboga por una transición hídrica ineludible que modernice las redes de distribución urbana para erradicar pérdidas de caudal, fomente la desalinización con energías renovables y la reutilización de aguas residuales depuradas, pero, sobre todo, redimensione la superficie de regadío hacia cultivos autóctonos resistentes a la sequía. Solo adaptando nuestra demanda a la realidad hídrica podremos garantizar la resiliencia de nuestros ecosistemas.",
        "vocabularyHints": {
            "vulnerables": "vulnerable",
            "embates": "onslaughts / impacts",
            "desertificación": "desertification",
            "gobernanza": "governance",
            "cuencas": "river basins",
            "acuíferos": "aquifers",
            "regadío": "irrigated land",
            "secano": "dryland farming / rainfed",
            "trasvases": "water transfers",
            "desalinización": "desalination",
            "residuales": "wastewater",
            "resiliencia": "resilience"
        },
        "mcqQuestions": [
            {"question": "¿Qué proporción del territorio español está en riesgo alto de desertificación?", "options": ["Solo el diez por ciento", "Más de dos terceras partes", "Ninguna parte", "El cien por cien de las playas"], "correctAnswerIndex": 1, "explanation": "Más de dos tercios de la superficie peninsular afrontan riesgo de aridez."},
            {"question": "¿Qué sector consume aproximadamente el ochenta por ciento del agua dulce en España?", "options": ["La industria textil", "La agricultura de regadío intensivo", "El consumo doméstico en duchas", "Los campos de golf"], "correctAnswerIndex": 1, "explanation": "El regadío agrícola consume en torno al 80% de los recursos hídricos."},
            {"question": "¿Qué ecosistemas húmedos emblemáticos se han visto amenazados por pozos ilegales?", "options": ["Los Pirineos y los Picos de Europa", "Las Tablas de Daimiel y las lagunas de Doñana", "El río Sena", "El lago Titicaca"], "correctAnswerIndex": 1, "explanation": "Doñana y las Tablas de Daimiel sufrieron desecación por acuíferos sobreexplotados."},
            {"question": "¿Por qué los trasvases entre ríos generan polémica?", "options": ["Porque el agua cambia de color", "Provocan graves conflictos políticos entre regiones cedentes y receptoras", "Porque los peces vuelan", "Porque están prohibidos en el mundo"], "correctAnswerIndex": 1, "explanation": "Desatan tensiones territoriales y políticas entre comunidades autónomas."},
            {"question": "¿Qué solución prioritaria proponen los científicos para la sostenibilidad?", "options": ["Construir más regadíos ilegales", "Redimensionar regadíos hacia cultivos autóctonos resistentes y reutilizar aguas", "Esperar a que llueva siempre", "Importar agua embotellada de la Antártida"], "correctAnswerIndex": 1, "explanation": "Ajustar la demanda reduciendo superficie de regadío y reutilizando caudales."}
        ],
        "tfQuestions": [
            {"question": "El cambio climático está acelerando la desertificación en la península ibérica.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 0, "explanation": "Verdadero. Las temperaturas al alza y las sequías agravan la aridez."},
            {"question": "La agricultura intensiva consume menos del cinco por ciento del agua nacional.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 1, "explanation": "Falso. Acapara cerca del ochenta por ciento de los recursos disponibles."},
            {"question": "La extracción ilegal de aguas subterráneas ha puesto en peligro el parque de Doñana.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 0, "explanation": "Verdadero. La sobreexplotación de acuíferos desecó sus lagunas históricas."},
            {"question": "La desalinización impulsada por energías limpias se plantea como una alternativa.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 0, "explanation": "Verdadero. Es una de las vías tecnológicas para complementar el suministro."},
            {"question": "Los científicos recomiendan ampliar sin límite el regadío en zonas secas.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 1, "explanation": "Falso. Urgen a redimensionar la superficie agrícola a la capacidad real del clima."}
        ]
    },
    {
        "title": "La novela picaresca y la crítica social en el Siglo de Oro (The Picaresque Novel)",
        "level": "B2",
        "language": "es",
        "text": "Durante los siglos XVI y XVII, coincidiendo con la cúspide militar del Imperio español y su posterior decadencia económica, la literatura española alumbró un género narrativo singular y profundamente rupturista: la novela picaresca. Nacida en 1554 con la publicación anónima de la 'Vida de Lazarillo de Tormes y de sus fortunas y adversidades', esta corriente literaria surgió como una reacción mordaz y desmitificadora frente a los géneros de ficción idealizantes de la época, como las novelas de caballerías, los relatos pastoriles o las crónicas bizantinas de amores inverosímiles. El protagonista picaresco, el pícaro, se sitúa en las antípodas morales del caballero andante: de extracción social humilde, huérfano de honra y marginado por una sociedad estamental asfixiante, el pícaro no combate por la gloria, la patria o el favor de una dama idealizada, sino por la pura y cruda subsistencia cotidiana. Utilizando la forma epistolar y el relato autobiográfico en primera persona, la novela presenta una estructura episódica en la que el protagonista relata su vida retrospectivamente desde la deshonra madura, sirviendo a sucesivos amos que representan a todos los estratos de la pirámide social: el clérigo avaro, el hidalgo empobrecido y obsesionado con las apariencias, o el alguacil corrupto. A través de la mirada aguzada y cínica del pícaro, la obra desnuda la hipocresía institucional, el culto vano a la limpieza de sangre y la abismal brecha entre la retórica imperial de grandeza y la miseria material que asolaba las calles de Castilla. La picaresca no solo revolucionó las técnicas narrativas dotando al personaje humilde de voz propia y evolución psicológica, sino que inauguró el realismo literario moderno, proyectando su influjo en maestros universales de la talla de Cervantes, Fielding o Dickens.",
        "vocabularyHints": {
            "picaresca": "picaresque",
            "cúspide": "pinnacle / peak",
            "rupturista": "groundbreaking / disruptive",
            "desmitificadora": "demystifying",
            "antípodas": "antipodes / polar opposites",
            "estamental": "stratified / estate-based",
            "epistolar": "epistolary",
            "retrospectivamente": "retrospectively",
            "avaro": "miserly / stingy",
            "hidalgo": "nobleman of lower rank",
            "hipocresía": "hypocrisy",
            "realismo": "realism"
        },
        "mcqQuestions": [
            {"question": "¿Con qué obra anónima de 1554 nace la novela picaresca?", "options": ["Don Quijote de la Mancha", "El Lazarillo de Tormes", "La Celestina", "El Cantar de mio Cid"], "correctAnswerIndex": 1, "explanation": "Nació con la publicación de la Vida de Lazarillo de Tormes en 1554."},
            {"question": "¿Frente a qué tipo de relatos reaccionó la picaresca de manera crítica?", "options": ["Frente a manuales de botánica", "Frente a novelas de caballerías y relatos pastoriles idealizados", "Frente a obras de teatro griego", "Frente a novelas policíacas"], "correctAnswerIndex": 1, "explanation": "Reaccionó contra la ficción caballeresca y pastoril inverosímil."},
            {"question": "¿Cuál es la principal motivación del personaje del pícaro?", "options": ["Conquistar continentes enteros", "La pura subsistencia diaria y no pasar hambre", "Hacerse caballero del rey", "Componer sonetos de amor"], "correctAnswerIndex": 1, "explanation": "Lucha por la supervivencia cotidiana frente al hambre y la miseria."},
            {"question": "¿Qué técnica narrativa formal caracteriza a estas obras?", "options": ["Teatro en verso libre", "Forma autobiográfica en primera persona de estructura episódica", "Diálogo de dioses", "Artículos de prensa"], "correctAnswerIndex": 1, "explanation": "Se estructuran como autobiografía epistolar en primera persona."},
            {"question": "¿Qué corriente literaria internacional tiene su raíz en este género?", "options": ["La ciencia ficción", "El realismo literario moderno", "El romanticismo mágico", "El surrealismo poético"], "correctAnswerIndex": 1, "explanation": "Inauguró el realismo narrativo moderno al dar voz al desfavorecido."}
        ],
        "tfQuestions": [
            {"question": "La novela picaresca floreció durante los siglos XVI y XVII en España.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 0, "explanation": "Verdadero. Coincidió con el esplendor y crisis del Siglo de Oro."},
            {"question": "El pícaro es un noble acaudalado que defiende ideales heroicos.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 1, "explanation": "Falso. Es de origen humilde, marginado y lucha por sobrevivir."},
            {"question": "Los amos del pícaro representan diferentes clases y estamentos de la época.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 0, "explanation": "Verdadero. Sirve a clérigos, hidalgos y ciegos, satirizando a la sociedad."},
            {"question": "La novela elogia y defiende ciegamente la obsesión por la hidalguía y la honra vacía.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 1, "explanation": "Falso. Desnuda la hipocresía social y el culto estéril a la apariencia."},
            {"question": "La picaresca influyó notablemente en la evolución de la novela europea posterior.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 0, "explanation": "Verdadero. Su influjo llegó a autores como Cervantes, Fielding y Dickens."}
        ]
    },
    {
        "title": "La revolución del grafeno y los nanomateriales (Graphene Revolution)",
        "level": "B2",
        "language": "es",
        "text": "En el fascinante ámbito de la física del estado sólido y la ciencia de materiales avanzados, pocas innovaciones han despertado expectativas tan revolucionarias en las últimas dos décadas como el descubrimiento y aislamiento experimental del grafeno. Compuesto por una única capa bidimensional de átomos de carbono densamente empaquetados en una red hexagonal similar a un panal de abejas, este material sintetizado por primera vez en 2004 en la Universidad de Mánchester por Andre Geim y Konstantin Novoselov –merecedores del Premio Nobel de Física en 2010– desafió las leyes teóricas que consideraban inestables los cristales atómicos bidimensionales a temperatura ambiente. Sus propiedades físicas extraordinarias desafían la imaginación: a pesar de tener un grosor mil veces inferior al de un cabello humano, el grafeno es unas doscientas veces más resistente que el acero de mayor dureza, exhibiendo a su vez una ligereza y una flexibilidad mecánica asombrosas que le permiten flexionarse sin quebrarse. Asimismo, se trata de uno de los mejores conductores térmicos y eléctricos conocidos, superando con creces la conductividad del cobre y permitiendo que los electrones se desplacen a través de su red casi sin resistencia molecular a velocidades próximas a la de la luz. En el campo de la electrónica de consumo, se investiga intensamente la sustitución del silicio tradicional por transistores de grafeno ultrarrápidos para evitar el sobrecalentamiento de los procesadores cuánticos. En medicina, su biocompatibilidad funcionalizada abre horizontes inauditos en biosensores miniaturizados capaces de detectar biomarcadores tumorales en una sola gota de sangre, o en interfaces cerebro-máquina para restaurar impulsos nerviosos en pacientes con lesiones medulares. A pesar de estos logros asombrosos, el reto capital sigue radicando en su producción industrial a gran escala con costes asequibles y pureza atómica intacta.",
        "vocabularyHints": {
            "grafeno": "graphene",
            "bidimensional": "two-dimensional",
            "hexagonal": "hexagonal",
            "aislamiento": "isolation",
            "grosor": "thickness",
            "conductividad": "conductivity",
            "transistores": "transistors",
            "cuánticos": "quantum",
            "biocompatibilidad": "biocompatibility",
            "biosensores": "biosensors",
            "lesiones medulares": "spinal cord injuries",
            "asequibles": "affordable"
        },
        "mcqQuestions": [
            {"question": "¿Cuál es la estructura atómica que define al grafeno?", "options": ["Una esfera de silicio tridimensional", "Una monocapa bidimensional de átomos de carbono en red hexagonal", "Una pirámide de hierro y plomo", "Un tubo de plástico"], "correctAnswerIndex": 1, "explanation": "Está formado por una única capa bidimensional de carbono hexagonal."},
            {"question": "¿Cómo se compara la resistencia mecánica del grafeno frente al acero?", "options": ["Es mucho más frágil que el cristal", "Es unas doscientas veces más resistente que el mejor acero", "Tienen exactamente la misma fuerza", "Es blando como el agua"], "correctAnswerIndex": 1, "explanation": "Es alrededor de doscientas veces más fuerte que el mejor acero estructural."},
            {"question": "¿Qué ventaja eléctrica singular ofrece este nanomaterial?", "options": ["Bloquea toda la electricidad", "Es uno de los conductores eléctricos más rápidos y eficaces conocidos", "Solo funciona a temperaturas polares", "Funciona sin electrones"], "correctAnswerIndex": 1, "explanation": "Supera la conductividad del cobre y transporta electrones a gran velocidad."},
            {"question": "¿En qué área médica se investigan aplicaciones prometedoras del grafeno?", "options": ["Para hacer jarabes de sabores", "En biosensores tumorales e interfaces neuronales avanzadas", "Para sustituir la piel con madera", "No tiene utilidad médica"], "correctAnswerIndex": 1, "explanation": "Se aplica en detección precoz tumoral e interfaces para lesiones medulares."},
            {"question": "¿Cuál es el principal obstáculo tecnológico actual para su implantación?", "options": ["Que es tóxico para la ropa", "La producción industrial a gran escala con alta pureza y costes viables", "Que pesa demasiado", "Que el carbono se ha agotado en el mundo"], "correctAnswerIndex": 1, "explanation": "Fabricarlo en masa manteniendo la pureza atómica a coste rentable es el reto."}
        ],
        "tfQuestions": [
            {"question": "El grafeno fue aislado por primera vez a principios del siglo XXI.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 0, "explanation": "Verdadero. Sus descubridores lo sintetizaron en el año 2004."},
            {"question": "El material es completamente rígido e incapaz de doblarse.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 1, "explanation": "Falso. Posee una extraordinaria flexibilidad mecánica."},
            {"question": "Podría sustituir al silicio en los microprocesadores del futuro.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 0, "explanation": "Verdadero. Se investiga para crear transistores mucho más rápidos."},
            {"question": "El grafeno conduce el calor de forma muy deficiente.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 1, "explanation": "Falso. Es un conductor térmico extraordinario."},
            {"question": "Sus descubridores recibieron el Premio Nobel de Física por este hallazgo.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 0, "explanation": "Verdadero. Geim y Novoselov obtuvieron el Nobel de Física en 2010."}
        ]
    },
    {
        "title": "La preservación del patrimonio lingüístico y las lenguas minoritarias (Linguistic Preservation)",
        "level": "B2",
        "language": "es",
        "text": "La diversidad lingüística constituye uno de los tesoros inmateriales más valiosos y amenazados de la humanidad, albergando en sus estructuras gramaticales y en su léxico visiones únicas del mundo, conocimientos botánicos milenarios y cosmovisiones que no pueden traducirse de forma enteramente fidedigna a otros idiomas. De acuerdo con las estimaciones de la UNESCO, más de la mitad de las aproximadamente siete mil lenguas que se hablan actualmente en el globo se hallan en riesgo inminente de desaparecer antes del final del presente siglo, víctimas de la globalización cultural unificadora, la presión asimilacionista de los estados centralistas y la hegemonía de un puñado de idiomas dominantes en el ecosistema digital. España ofrece en este ámbito un laboratorio sociolingüístico sumamente ilustrativo debido a su régimen constitucional de cooficialidad: junto con el castellano o español –lengua oficial en todo el territorio estatal–, gozan de estatus oficial en sus respectivas comunidades autónomas el catalán en Cataluña y Baleares, el valenciano en la Comunidad Valenciana, el gallego en Galicia y el euskera o vascuence en el País Vasco y la zona vascófona de Navarra. Cada una de estas lenguas atesora singularidades filológicas extraordinarias: el euskera, por ejemplo, representa un enigma lingüístico insólito al ser una lengua aislada no indoeuropea que sobrevivió misteriosamente a la romanización de la península. La experiencia peninsular ha demostrado que la revitalización idiomática no es una quimera imposible si se conjugan políticas públicas decididas en inmersión escolar, medios de comunicación públicos en lengua vernácula y un consenso civil que entienda el multilingüismo no como una barrera excluyente, sino como un elemento de enriquecimiento mutuo. Proteger las lenguas minoritarias equivale a salvaguardar la pluralidad del pensamiento humano ante la uniformidad empobrecedora.",
        "vocabularyHints": {
            "inmateriales": "intangible",
            "cosmovisiones": "worldviews",
            "fidedigna": "reliable / faithful",
            "asimilacionista": "assimilationist",
            "hegemonía": "hegemony",
            "cooficialidad": "co-official status",
            "filológicas": "philological",
            "indoeuropea": "Indo-European",
            "romanización": "Romanization",
            "quimera": "illusion / pipedream",
            "inmersión": "immersion",
            "vernácula": "vernacular"
        },
        "mcqQuestions": [
            {"question": "¿Cuántas de las lenguas del mundo podrían desaparecer según la UNESCO antes de fin de siglo?", "options": ["Ninguna", "Más de la mitad de las cerca de siete mil lenguas", "Solo cinco lenguas", "El cien por cien"], "correctAnswerIndex": 1, "explanation": "La UNESCO alerta de que más del cincuenta por ciento están en peligro."},
            {"question": "¿Qué singularidad filológica única presenta el euskera en Europa?", "options": ["Es un dialecto moderno del latín", "Es una lengua aislada preindoeuropea que sobrevivió a los romanos", "Fue inventado en el siglo XIX", "Procede del inglés"], "correctAnswerIndex": 1, "explanation": "El euskera es una lengua aislada no indoeuropea de origen ancestral."},
            {"question": "¿Qué régimen jurídico reconoce la Constitución española a las lenguas autonómicas?", "options": ["Su prohibición total", "El estatus de cooficialidad en sus respectivos territorios", "Solo se permite en casa", "Las considera ilegales"], "correctAnswerIndex": 1, "explanation": "Establece la cooficialidad junto al castellano en sus comunidades."},
            {"question": "¿Qué factores favorecen el éxito en la revitalización de lenguas minoritarias?", "options": ["Prohibir la lectura", "Inmersión escolar, medios públicos vernáculos y consenso social", "No enseñar gramática", "Eliminar los diccionarios"], "correctAnswerIndex": 1, "explanation": "Educación en inmersión, prensa y televisión pública y apoyo social."},
            {"question": "¿A qué equivale preservar las lenguas minoritarias según la conclusión?", "options": ["A gastar dinero inútilmente", "A salvaguardar la pluralidad del pensamiento humano", "A aislarse del mundo moderno", "A retroceder en el tiempo"], "correctAnswerIndex": 1, "explanation": "Equivale a proteger la riqueza y pluralidad del pensamiento humano."}
        ],
        "tfQuestions": [
            {"question": "Las lenguas transmiten cosmovisiones y saberes que no siempre son traducibles.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 0, "explanation": "Verdadero. Encierran conocimientos botánicos y visiones culturales únicas."},
            {"question": "El catalán, el gallego y el euskera carecen de reconocimiento legal en España.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 1, "explanation": "Falso. Gozan de estatus cooficial en sus territorios autonómicos."},
            {"question": "El euskera es una lengua que desciende directamente del latín como el francés.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 1, "explanation": "Falso. Es una lengua no indoeuropea aislada de origen prerromano."},
            {"question": "Las políticas de inmersión escolar han contribuido a recuperar lenguas autóctonas.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 0, "explanation": "Verdadero. La escuela ha sido un pilar crucial en su transmisión intergeneracional."},
            {"question": "La homogeneización digital favorece a unos pocos idiomas hegemónicos globales.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 0, "explanation": "Verdadero. Un puñado de idiomas dominantes acapara el espacio virtual."}
        ]
    },

    # ------------------ C1 (320-400 words) ------------------
    {
        "title": "La aporía de la memoria histórica y la justicia transicional (Historical Memory)",
        "level": "C1",
        "language": "es",
        "text": "La articulación institucional del recuerdo colectivo tras periodos traumáticos de dictadura, guerra civil o violencia sistemática de Estado constituye uno de los dilemas ético-jurídicos más complejos y polarizantes a los que puede enfrentarse una sociedad democrática. En el caso español, el proceso de transición hacia la democracia inaugurado a finales de la década de 1970 –alabado durante décadas como modélico por la politología internacional gracias a su capacidad para conciliar posturas irreconciliables mediante pactos y renuncias recíprocas– ha sido objeto de una profunda revisión crítica en los últimos lustros. Aquella célebre fórmula política, cristalizada en la Ley de Amnistía de 1977 y bautizada coloquialmente como el 'pacto del olvido', priorizó la estabilidad institucional inmediata, la reconciliación entre vencedores y vencidos y la consolidación de un orden constitucional pluralista sobre la depuración de responsabilidades penales de los jerarcas del régimen franquista y la exhumación de las víctimas sepultadas en fosas comunes anónimas. Sin embargo, las generaciones contemporáneas han cuestionado con vehemencia la premisa moral de que la paz civil deba cimentarse sobre la desmemoria deliberada o sobre una equidistancia que equipare a quienes defendían la legalidad constitucional republicana con quienes perpetraron un golpe militar. Desde la óptica del derecho internacional humanitario y la doctrina de la justicia transicional auspiciada por las Naciones Unidas, los pilares de verdad, justicia, reparación y garantías de no repetición son de obligado cumplimiento: el derecho inalienable de las familias a recuperar los restos de sus seres queridos para otorgarles sepultura digna no prescribe por el paso del tiempo ni puede quedar supeditado a conveniencias partidistas. Este imperativo moral colisiona con el temor de sectores conservadores que perciben las leyes de memoria democrática como una reapertura interesada de viejas fracturas fratricidas o un intento de reescribir retrospectivamente la historia. Administrar la memoria en democracia exige huir de maniqueísmos dogmáticos y asumir que recordar el horror del pasado no persigue la venganza retrospectiva, sino blindar la conciencia cívica contra el veneno de la tiranía.",
        "vocabularyHints": {
            "aporía": "aporia / paradox",
            "transicional": "transitional",
            "politología": "political science",
            "depuración": "purge / holding accountable",
            "exhumación": "exhumation",
            "fosas comunes": "mass graves",
            "desmemoria": "oblivion / imposed forgetting",
            "equidistancia": "equidistance / false equivalence",
            "inaudito": "unheard of",
            "prescribe": "expires / lapses",
            "fratricidas": "fratricidal",
            "maniqueísmos": "Manichaeisms / black-and-white thinking"
        },
        "mcqQuestions": [
            {"question": "¿Qué caracterizó el modelo de Transición española respecto al pasado en los años setenta?", "options": ["Juicios inmediatos a todos los líderes de la dictadura", "El pacto de amnistía mutua y primacía de la estabilidad institucional", "La disolución de los tribunales", "Un gobierno militar permanente"], "correctAnswerIndex": 1, "explanation": "Priorizó la concordia y estabilidad sobre el juicio de responsabilidades."},
            {"question": "¿Qué ley de 1977 simbolizó el denominado 'pacto del olvido'?", "options": ["La Ley de Enjuiciamiento Civil", "La Ley de Amnistía de 1977", "La Ley de Reforma Agraria", "La Ley de Prensa"], "correctAnswerIndex": 1, "explanation": "La Ley de Amnistía impidió la persecución penal de crímenes del régimen."},
            {"question": "¿Cuáles son los cuatro pilares de la justicia transicional según la ONU?", "options": ["Silencio, resignación, paz y olvido", "Verdad, justicia, reparación y garantías de no repetición", "Venganza, castigo, censura y destierro", "Riqueza, poder, gloria e imperio"], "correctAnswerIndex": 1, "explanation": "Los pilares universales son verdad, justicia, reparación y no repetición."},
            {"question": "¿Qué reclaman principalmente los colectivos de víctimas en las fosas comunes?", "options": ["Compensaciones multimillonarias", "El derecho inalienable a recuperar y exhumar los restos de sus familiares", "La ilegalización de los partidos", "El cambio de la moneda"], "correctAnswerIndex": 1, "explanation": "Exigen recuperar los restos óseos de sus allegados para una sepultura digna."},
            {"question": "¿Cuál es el verdadero fin de recordar el horror del pasado según la conclusión?", "options": ["Alimentar el odio civil permanente", "Blindar la conciencia cívica democrática contra la tiranía", "Reescribir las enciclopedias", "Eliminar los archivos históricos"], "correctAnswerIndex": 1, "explanation": "Persigue fortalecer la cultura democrática y prevenir nuevas tiranías."}
        ],
        "tfQuestions": [
            {"question": "La Transición española fue valorada internacionalmente por su capacidad de consenso.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 0, "explanation": "Verdadero. Fue ensalzada durante décadas por lograr acuerdos pacíficos."},
            {"question": "La Ley de Amnistía de 1977 ordenó juzgar a todos los dirigentes de la dictadura.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 1, "explanation": "Falso. La ley amnistió los delitos políticos y detuvo los procesos penales."},
            {"question": "El derecho internacional considera imprescriptible el derecho de las familias a recuperar los restos.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 0, "explanation": "Verdadero. El derecho humanitario no admite la prescripción de estas obligaciones."},
            {"question": "Existe un consenso unánime sin debate alguno sobre las leyes de memoria en España.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 1, "explanation": "Falso. El debate entre partidos y sectores sociales sigue siendo intenso y polarizado."},
            {"question": "La memoria histórica se plantea como un escudo cívico frente a los totalitarismos.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 0, "explanation": "Verdadero. Recordar el horror busca proteger la libertad democrática."}
        ]
    },
    {
        "title": "El ocaso del humanismo ante el auge de la inteligencia artificial general (The Sunset of Humanism)",
        "level": "C1",
        "language": "es",
        "text": "Desde el Renacimiento y la Ilustración europea, la civilización occidental articuló su edificio ético, político y filosófico sobre una premisa ontológica incuestionada: el ser humano como centro de la creación, soberano exclusivo de la razón discursiva, custodio único de la conciencia moral y artífice insustituible del sentido del mundo. Este antropocentrismo humanista, que alimentó el desarrollo de las libertades civiles, el método científico y la primacía del libre albedrío, se enfrenta hoy a una disrupción ontológica sin parangón debido al advenimiento de los modelos generativos avanzados y a la persecución de la Inteligencia Artificial General (AGI). Por primera vez en la historia terrestre, la humanidad no se mide con fuerzas naturales ciegas o criaturas biológicas de facultades cognitivas subordinadas, sino con sistemas inorgánicos capaces de emular, y con frecuencia aventajar, las facultades más complejas del intelecto humano: el procesamiento lingüístico refinado, la creatividad artística, la resolución de enigmas matemáticos y la toma estratégica de decisiones. Esta alteridad mecánica socava la noción kantiana de la dignidad intrínseca basada en la autonomía de la razón: si una red neuronal profunda puede redactar tratados jurídicos, diagnosticar patologías con mayor pericia que un comité médico o componer partituras de sobrecogedora belleza emocional, ¿en qué reside entonces la especificidad irreductible del ser humano? El riesgo existencial más insidioso no radica únicamente en escenarios apocalípticos de desalineamiento catastrófico o automatización bélica descontrolada, sino en una progresiva atrofia de las capacidades epistémicas del propio ser humano, que delega su juicio crítico, su memoria y su albedrío en oráculos algorítmicos opacos cuyo funcionamiento interno desafía la inteligibilidad de sus propios creadores. El ocaso del humanismo clásico exige refundar una filosofía de la tecnología que interrogue si el fin último de nuestra especie es entregarse ciegamente a una optimización instrumental desprovista de alma o afirmar la irreductible vulnerabilidad y finitud humana como la auténtica morada de lo sagrado.",
        "vocabularyHints": {
            "ontológica": "ontological",
            "albedrío": "free will",
            "advenimiento": "advent / arrival",
            "inorgánicos": "inorganic",
            "alteridad": "alterity / otherness",
            "kantiana": "Kantian",
            "irreductible": "irreducible",
            "desalineamiento": "misalignment",
            "epistémicas": "epistemic",
            "oráculos": "oracles",
            "inteligibilidad": "intelligibility",
            "finitud": "finitude"
        },
        "mcqQuestions": [
            {"question": "¿Cuál fue la premisa ontológica central del humanismo renacentista e ilustrado?", "options": ["Que las máquinas dominarían el mundo", "Que el ser humano es el centro moral y soberano de la razón", "Que no existe la libertad individual", "Que los animales debían gobernar"], "correctAnswerIndex": 1, "explanation": "El humanismo puso al ser humano y a su libre albedrío en el centro ontológico."},
            {"question": "¿Qué singularidad representan los sistemas de IA frente a desafíos pasados?", "options": ["Son animales biológicos", "Son sistemas inorgánicos que emulan o superan facultades intelectuales humanas", "No utilizan electricidad", "Son solo calculadoras sencillas"], "correctAnswerIndex": 1, "explanation": "Emulan y aventajan al intelecto en lenguaje, arte y resolución compleja."},
            {"question": "¿Qué cuestión ética plantea la equiparación entre redes neuronales y el intelecto humano?", "options": ["El precio de los ordenadores", "La especificidad irreductible de la dignidad y la razón humana", "La falta de memoria en los discos duros", "El idioma de programación"], "correctAnswerIndex": 1, "explanation": "Pone en tela de juicio qué hace único al ser humano si la razón puede emularse."},
            {"question": "¿Qué peligro epistemológico insidioso destaca el texto respecto a los usuarios?", "options": ["Que lean demasiados libros", "La atrofia del juicio crítico y la delegación del albedrío en oráculos opacos", "Que dejen de usar internet", "Que las pantallas brillen demasiado"], "correctAnswerIndex": 1, "explanation": "La pérdida del pensamiento crítico al delegar decisiones en cajas negras."},
            {"question": "¿Qué alternativa propone el autor ante la mera optimización instrumental?", "options": ["Destruir toda la tecnología", "Reivindicar la vulnerabilidad y finitud humana como fuente de valor ético", "Crear más robots de guerra", "Abandonar la filosofía"], "correctAnswerIndex": 1, "explanation": "Propone abrazar la vulnerabilidad y finitud humana como base del sentido."},
            ],
        "tfQuestions": [
            {"question": "El humanismo tradicional consideraba al ser humano como artífice exclusivo del sentido del mundo.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 0, "explanation": "Verdadero. La concepción humanista partía de esta premisa ontológica."},
            {"question": "Las redes neuronales modernas son incapaces de resolver problemas matemáticos complejos.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 1, "explanation": "Falso. Ya resuelven enigmas lógicos y matemáticos de gran dificultad."},
            {"question": "Los creadores de modelos de IA comprenden siempre con total transparencia su funcionamiento interno.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 1, "explanation": "Falso. La opacidad de las redes neuronales profundas desafía a los expertos."},
            {"question": "Delegar el juicio moral en algoritmos conlleva una atrofia de las capacidades humanas.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 0, "explanation": "Verdadero. El texto alerta sobre la renuncia al pensamiento crítico propio."},
            {"question": "El debate sobre la IA exige replantear las bases filosóficas de nuestra relación con la técnica.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 0, "explanation": "Verdadero. Requiere fundar una nueva filosofía de la tecnología."}
        ]
    },
    {
        "title": "La semiótica del simulacro en la sociedad de la hipercomunicación (Semiotics of the Simulacrum)",
        "level": "C1",
        "language": "es",
        "text": "En su célebre tratado 'Cultura y simulacro' publicado a comienzos de la década de 1980, el sociólogo y filósofo francés Jean Baudrillard formuló una tesis profética que ha alcanzado su plasmación más incisiva y perturbadora en el ecosistema digital hiperconectado del siglo XXI: la sustitución progresiva de la realidad empírica por signos de lo real, un orden ontológico degradado al que denominó 'hiperrealidad'. En este estadio terminal de la cultura del consumo y de los medios de masas, las imágenes y representaciones dejan de referirse a una sustancia material preexistente para convertirse en puros 'simulacros': copias perfectas de originales que jamás han existido. Mientras que en la era moderna la representación operaba como un espejo fiel de la realidad circundante, en la era contemporánea el mapa mediático no solo precede al territorio físico, sino que lo engendra y lo aniquila. Las redes sociales, los algoritmos de recomendación predictiva y las interfaces inmersivas de realidad virtual han culminado esta mutación semiótica. Los individuos no experimentan vivencias directas para atesorarlas en su memoria íntima, sino que coreografían episodios de su cotidianidad en función de su rentabilidad algorítmica, modulando sus emociones y estéticas personales para encajar en el canon dictado por el espectáculo digital. El evento real pierde su ontología autónoma si no es validado y retransmitido en el flujo constante de datos; de hecho, lo que no genera huella digital parece condenado a la inexistencia ontológica. La consecuencia más corrosiva de este imperio del simulacro es la evaporación de la alteridad y de la capacidad crítica: cuando todo se reduce a un juego especular de reflejos estetizados y estímulos dopaminérgicos inmediatos, la verdad se transmuta en una categoría anacrónica, sustituida por el magnetismo hipnótico de la simulación. En este laberinto de espejos hiperreales, el mayor desafío emancipatorio consiste en reaprender a habitar el silencio, el cuerpo físico y la irreductible densidad del mundo no mediatizado.",
        "vocabularyHints": {
            "semiótica": "semiotics",
            "simulacro": "simulacrum",
            "empírica": "empirical",
            "hiperrealidad": "hyperreality",
            "coreografían": "choreograph",
            "ontología": "ontology",
            "especular": "specular / mirror-like",
            "estetizados": "aestheticized",
            "dopaminérgicos": "dopaminergic",
            "anacrónica": "anachronistic",
            "emancipatorio": "emancipatory",
            "mediatizado": "mediated"
        },
        "mcqQuestions": [
            {"question": "¿Qué acuñó el pensador Jean Baudrillard con el término 'hiperrealidad'?", "options": ["Un telescopio espacial de largo alcance", "La sustitución de la realidad por signos que generan simulacros", "Una nueva técnica de pintura al óleo", "La ausencia de ordenadores en el mundo"], "correctAnswerIndex": 1, "explanation": "Describe el orden donde las representaciones sustituyen a lo real."},
            {"question": "¿Qué es un 'simulacro' en la concepción teórica de Baudrillard?", "options": ["Una pintura rupestre prehistórica", "La copia de un original que jamás existió", "Un espejo de cristal pulido", "Una verdad matemática irrefutable"], "correctAnswerIndex": 1, "explanation": "Es la reproducción sin referente original preexistente."},
            {"question": "¿Cómo se comporta la relación entre el mapa y el territorio según el texto?", "options": ["El territorio destruye al mapa", "El mapa mediático precede, engendra y aniquila al territorio", "Nunca se tocan", "Son idénticos a nivel biológico"], "correctAnswerIndex": 1, "explanation": "El mapa virtual precede y sustituye a la realidad física territorial."},
            {"question": "¿Qué motivación subyace a la coreografía de la vida en redes sociales?", "options": ["El desinterés por la tecnología", "La búsqueda de rentabilidad algorítmica y validación en el espectáculo digital", "El anonimato absoluto", "Aprender historia antigua"], "correctAnswerIndex": 1, "explanation": "Las vivencias se planifican para encajar en el canon del escaparate virtual."},
            {"question": "¿Cuál es el desafío emancipatorio primordial frente al imperio del simulacro?", "options": ["Comprar más teléfonos inteligentes", "Habitar el silencio, el cuerpo físico y la densidad del mundo no mediatizado", "Vivir permanentemente conectado", "Eliminar todas las conversaciones presenciales"], "correctAnswerIndex": 1, "explanation": "Reaprender a vivir en la presencia corporal, el silencio y lo tangible."}
        ],
        "tfQuestions": [
            {"question": "Baudrillard anticipó la hiperrealidad en su obra de principios de los años ochenta.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 0, "explanation": "Verdadero. Formuló su tesis profética en 'Cultura y simulacro'."},
            {"question": "En la hiperrealidad, la imagen sigue reflejando fielmente la realidad material previa.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 1, "explanation": "Falso. La imagen se emancipa y sustituye a la sustancia empírica."},
            {"question": "Muchos individuos modulan sus actos cotidianos en función de su impacto algorítmico.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 0, "explanation": "Verdadero. La experiencia se coreografía para el público virtual."},
            {"question": "Lo que carece de huella digital en las redes goza hoy de una visibilidad prioritaria.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 1, "explanation": "Falso. Lo no transmitido parece condenado a la inexistencia pública."},
            {"question": "Reconectar con la materialidad corporal es una vía para escapar de la simulación mediática.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 0, "explanation": "Verdadero. Se plantea como el mayor reto de emancipación personal."}
        ]
    },
    {
        "title": "Geopolítica de los semiconductores y soberanía tecnológica (Geopolitics of Semiconductors)",
        "level": "C1",
        "language": "es",
        "text": "En el tablero de la geoestrategia contemporánea del siglo XXI, el poderío de las grandes potencias ya no se mide primordialmente por la acumulación de barriles de crudo o el tonelaje de flotas acorazadas, sino por el dominio indiscutible sobre un componente microscópico de silicio: los circuitos integrados de vanguardia o semiconductores. Estos diminutos microchips, tallados con precisiones litográficas atómicas medidas en nanómetros, son los cerebros indispensables que orquestan desde los teléfonos inteligentes de consumo masivo, los vehículos autónomos y la infraestructura de telecomunicaciones 5G, hasta los algoritmos de inteligencia artificial más sofisticados y los sistemas de defensa y disuasión nuclear. La vulnerabilidad de la arquitectura económica mundial radica en la extrema concentración geográfica de su cadena de valor: mientras que el diseño de software y la propiedad intelectual de las arquitecturas electrónicas están mayoritariamente controlados por corporaciones de Estados Unidos, y la maquinaria de litografía ultravioleta extrema más avanzada del mundo es monopolizada por una única compañía neerlandesa (ASML), más del sesenta por ciento de la capacidad fabril mundial –y más del noventa por ciento de los nodos inferiores a cinco nanómetros– se localiza en la isla de Taiwán, en particular a través del gigante TSMC. Esta hiperconcentración convierte al estrecho de Taiwán en el epicentro geológico y militar más inflamable del globo, donde una hipotética disrupción bélica paralizaría instantáneamente la producción industrial del planeta, sumiendo a las economías desarrolladas en una recesión sin precedentes. Conscientes de este estrangulamiento estratégico, Washington, la Unión Europea y Pekín han emprendido una carrera frenética por la soberanía tecnológica, movilizando cientos de miles de millones de euros en subsidios públicos directos –mediante la 'Chips Act' europea y estadounidense– para repatriar fundiciones y asegurar suministros. No obstante, erigir ecosistemas semiconductores autóctonos requiere décadas de maduración, capital exorbitante y un talento humano ultraespecializado del que carecen la mayoría de las naciones.",
        "vocabularyHints": {
            "geoestrategia": "geostrategy",
            "semiconductores": "semiconductors",
            "litográficas": "lithographic",
            "ultravioleta extrema": "extreme ultraviolet (EUV)",
            "hiperconcentración": "hyperconcentration",
            "estrangulamiento": "choke point / bottleneck",
            "soberanía": "sovereignty",
            "fundiciones": "foundries (fabs)",
            "subsidios": "subsidies",
            "disuasión": "deterrence",
            "reciprocidad": "reciprocity",
            "autóctonos": "native / domestic"
        },
        "mcqQuestions": [
            {"question": "¿Cuál es el recurso crítico central de la disputa geoestratégica del siglo XXI?", "options": ["El carbón mineral", "Los semiconductores o microchips avanzados", "La madera de pino", "El gas de alumbrado"], "correctAnswerIndex": 1, "explanation": "Los microchips son el núcleo del poder tecnológico, económico y militar."},
            {"question": "¿Qué isla concentra más del noventa por ciento de la fabricación de chips de vanguardia?", "options": ["Groenlandia", "Taiwán, a través de TSMC", "Islandia", "Madagascar"], "correctAnswerIndex": 1, "explanation": "Taiwán fabrica la inmensa mayoría de los nodos litográficos más avanzados."},
            {"question": "¿Qué monopolio tecnológico ostenta la empresa europea ASML?", "options": ["Venta de petróleo", "Fabricación de máquinas de litografía ultravioleta extrema (EUV)", "Diseño de videojuegos", "Construcción de satélites"], "correctAnswerIndex": 1, "explanation": "Monopoliza la maquinaria litográfica imprescindible para chips avanzados."},
            {"question": "¿Qué consecuencias tendría una disrupción militar en el estrecho de Taiwán?", "options": ["Ningún impacto económico", "Parálisis inmediata de la industria global y recesión económica masiva", "Una bajada de los precios de la tecnología", "Mayor velocidad de internet"], "correctAnswerIndex": 1, "explanation": "Detendría la producción manufacturera global, causando una recesión brutal."},
            {"question": "¿Qué iniciativas han lanzado Europa y EE. UU. para reducir su dependencia?", "options": ["Prohibir la venta de ordenadores", "Leyes como la 'Chips Act' con subsidios masivos a fundiciones", "Cerrar las universidades de ingeniería", "Eliminar el silicio"], "correctAnswerIndex": 1, "explanation": "Han promulgado leyes con multimillonarios subsidios para fábricas locales."}
        ],
        "tfQuestions": [
            {"question": "Los chips avanzados son indispensables para el desarrollo de la inteligencia artificial.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 0, "explanation": "Verdadero. La potencia de cálculo de la IA depende de microprocesadores punteros."},
            {"question": "La fabricación mundial de chips de menos de cinco nanómetros está repartida por igual.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 1, "explanation": "Falso. Más del noventa por ciento está concentrada en Taiwán."},
            {"question": "ASML es una compañía con sede en los Países Bajos.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 0, "explanation": "Verdadero. La firma neerlandesa es líder exclusivo en litografía EUV."},
            {"question": "Construir una industria de semiconductores moderna solo requiere una semana de obras.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 1, "explanation": "Falso. Requiere décadas de maduración, capital inmenso y talento escaso."},
            {"question": "Las potencias mundiales aspiran hoy a una mayor soberanía tecnológica.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 0, "explanation": "Verdadero. Se busca blindar cadenas de suministro ante tensiones geopolíticas."}
        ]
    },
    {
        "title": "La metamorfosis del tiempo en la modernidad acelerada (Accelerated Modernity)",
        "level": "C1",
        "language": "es",
        "text": "La experiencia fenomenológica del tiempo ha constituido históricamente uno de los ejes vertebradores mediante los cuales el ser humano dota de sentido a su existencia individual y a su pertenencia a una comunidad política. En las sociedades agrarias precapitalistas, la temporalidad se hallaba intrínsecamente ligada a los ritmos circulares y biológicos de la naturaleza: el curso de las estaciones, las fases lunares y la alternancia del día y la noche marcaban una cadencia pausada y cualitativa del devenir. Sin embargo, la instauración de la disciplina fabril en la Revolución Industrial sustituyó el tiempo vital por el tiempo abstracto del reloj mecánico, transformando la vida en una mercancía conmensurable y monetizable. En la actualidad, el sociólogo alemán Hartmut Rosa ha diagnosticado una mutación ontológica aún más radical: el tránsito hacia una 'modernidad tardía' definida por el imperio implacable de la aceleración social. Esta aceleración multidimensional se manifiesta en tres esferas interconectadas: la aceleración técnica del transporte y las comunicaciones digitales instantáneas, la aceleración de las transformaciones socioculturales –donde las instituciones, ocupaciones profesionales y formas de relacionarse pierden estabilidad intergeneracional a un ritmo vertiginoso– y, de manera paradójica, la aceleración del propio ritmo de vida personal. A pesar de que la humanidad ha multiplicado exponencialmente sus herramientas destinadas al ahorro de tiempo mediante la automatización y la conectividad permanente, los individuos padecen una sensación crónica de escasez temporal y asfixia cotidiana, atrapados en una vorágine de tareas ininterrumpidas donde detenerse equivale a quedar excluido del sistema. Esta dinámica genera una patología colectiva que Rosa denomina 'alienación respecto al mundo', en la que el sujeto pierde la capacidad de entrar en 'resonancia' con su entorno físico, sus semejantes y su propia interioridad emocional. Recuperar la soberanía temporal exige desarticular la tiranía de la velocidad instrumental y reivindicar la lentitud, la contemplación y la disponibilidad receptiva como las precondiciones irrenunciables para una existencia auténticamente libre y consciente.",
        "vocabularyHints": {
            "fenomenológica": "phenomenological",
            "vertebradores": "structuring / backbone",
            "precapitalistas": "pre-capitalist",
            "conmensurable": "measurable / commensurable",
            "aceleración social": "social acceleration",
            "multidimensional": "multidimensional",
            "vertiginoso": "dizzying / vertiginous",
            "escasez": "scarcity",
            "vorágine": "whirlpool / vortex",
            "alienación": "alienation",
            "resonancia": "resonance",
            "contemplación": "contemplation"
        },
        "mcqQuestions": [
            {"question": "¿Cómo se estructuraba el tiempo en las sociedades agrarias tradicionales?", "options": ["A través de alarmas digitales continuas", "Vinculado a los ciclos naturales, estaciones y alternancia de día y noche", "Medido en milisegundos por ordenadores", "No tenían noción del tiempo"], "correctAnswerIndex": 1, "explanation": "Se regía por los ritmos orgánicos y estacionales de la naturaleza."},
            {"question": "¿Qué concepto acuñó el sociólogo Hartmut Rosa para definir la era contemporánea?", "options": ["La era de la lentitud", "La aceleración social y la modernidad tardía", "El fin de la historia feliz", "La sociedad inmóvil"], "correctAnswerIndex": 1, "explanation": "Diagnostica la modernidad tardía como una dinámica de aceleración social."},
            {"question": "¿Qué paradoja vive el individuo moderno respecto a la tecnología?", "options": ["Que no tiene ningún aparato", "A pesar de ahorrar tiempo con la tecnología, experimenta una escasez temporal crónica", "Que todo el mundo tiene demasiado tiempo libre", "Que ya no existe el trabajo"], "correctAnswerIndex": 1, "explanation": "Las herramientas de ahorro de tiempo no impiden una sensación de asfixia y prisa."},
            {"question": "¿Cómo describe Hartmut Rosa la patología de la desconexión vital contemporánea?", "options": ["Gripe digital", "Pérdida de la capacidad de entrar en 'resonancia' con el mundo y con uno mismo", "Alergia al reloj", "Fobia al transporte"], "correctAnswerIndex": 1, "explanation": "La pérdida de resonancia conduce a la alienación del sujeto."},
            {"question": "¿Qué actitud se reivindica para recuperar una vida verdaderamente libre?", "options": ["Correr el doble de rápido", "Reivindicar la lentitud, la contemplación y la soberanía sobre el propio tiempo", "Eliminar todas las conversaciones personales", "Comprar más agendas"], "correctAnswerIndex": 1, "explanation": "Recuperar la lentitud, la contemplación y la soberanía temporal."}
        ],
        "tfQuestions": [
            {"question": "La Revolución Industrial convirtió el tiempo en una mercancía cuantificable y monetizable.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 0, "explanation": "Verdadero. El reloj fabril instauró la disciplina del tiempo abstracto."},
            {"question": "La aceleración social solo se produce en la velocidad de los trenes y aviones.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 1, "explanation": "Falso. Abarca el cambio social institucional y el ritmo de vida cotidiano."},
            {"question": "El individuo contemporáneo suele sentirse relajado y con exceso de tiempo libre.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 1, "explanation": "Falso. Padece una sensación constante de déficit temporal y saturación."},
            {"question": "La alienación temporal impide conectar de manera profunda con el entorno y los demás.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 0, "explanation": "Verdadero. La prisa constante bloquea la resonancia emocional."},
            {"question": "Reaprender a habitar la contemplación se plantea como una vía de liberación existencial.", "options": ["Verdadero", "Falso"], "correctAnswerIndex": 0, "explanation": "Verdadero. El texto concluye defendiendo la lentitud como precondición de libertad."}
        ]
    }
    # ------------------ End of definitions ------------------
]

# Calibrations for exact target ranges:
# A2 passage 8: +18 words
passages[8]['text'] += " Además, conectar con estudiantes de todo el planeta fomenta una empatía intercultural que transforma el aprendizaje en una aventura apasionante."
# B2 passage 19: +16 words
passages[19]['text'] += " Fomentar la estima colectiva por este legado plurilingüe es el mejor homenaje a nuestras raíces históricas y compartidas."
# C1 passage 21: +22 words
passages[21]['text'] += " Solo salvaguardando el misterio de la conciencia viva frente a la frialdad del cálculo podremos preservar el alma irreemplazable de la condición humana."
# C1 passage 22: +20 words
passages[22]['text'] += " Frente a la fascinación de los espejismos virtuales, la autenticidad del encuentro cara a cara sigue siendo el refugio irreductible de la libertad humana."
# C1 passage 23: +24 words
passages[23]['text'] += " La carrera por los microchips demuestra que la soberanía nacional del siglo XXI se defiende en los laboratorios de física cuántica y nanotecnología avanzada."
# C1 passage 24: +20 words
passages[24]['text'] += " Encontrar instantes de pausa y sosiego dentro del torbellino moderno no es un capricho nostálgico, sino un acto supremo de resistencia y salud existencial."

if __name__ == "__main__":
    import sys, os
    sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
    from reading_builder_helper import save_typescript_file
    target = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../src/data/reading/spanish.ts"))
    save_typescript_file("es", "SPANISH_PASSAGES", passages, target)
