# -*- coding: utf-8 -*-
"""
Appends A2, B1, B2, and C1 passages to Italian and writes src/data/reading/italian.ts.
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from passage_factory import make_passage
from reading_builder_helper import save_typescript_file
import build_italian

passages = build_italian.passages

# =========================================================================
# A2 (200-260 words)
# =========================================================================
passages.append(make_passage(
    "La tradizione della pizza napoletana (Neapolitan Pizza Tradition)", "A2", "it",
    "La pizza napoletana non è semplicemente un piatto squisito e famoso in tutto il mondo, ma rappresenta un simbolo culturale autentico dell'identità campana e dell'arte culinaria italiana, riconosciuto ufficialmente dall'UNESCO come patrimonio immateriale dell'umanità. Secondo la tradizione popolare più celebre, la pizza Margherita nacque nel giugno del 1889 a Napoli, quando il talentuoso pizzaiolo Raffaele Esposito creò una pietanza speciale in onore della regina d'Italia Margherita di Savoia, componendo i colori della bandiera nazionale: il rosso del pomodoro campano, il bianco della mozzarella fresca e il verde delle foglie di basilico profumato. La vera pizza napoletana deve seguire regole disciplinari molto rigorose: l'impasto viene preparato esclusivamente con farina di grano tenero, acqua pura, lievito naturale di birra e sale marino, senza alcuna aggiunta di grassi o zuccheri artificiali. La pasta deve lievitare lentamente per molte ore a temperatura ambiente per risultare leggera, elastica e perfettamente digeribile. La stesura del disco di pasta avviene esclusivamente a mano con movimenti rotatori esperti dal centro verso l'esterno, creando il caratteristico cornicione alto e soffice con alveolature pronunciate. La cottura avviene in un forno a legna caldissimo a quasi cinquecento gradi per soli sessanta o novanta secondi. Il risultato è un capolavoro morbido, fragrante e succulento che regala un'emozione indimenticabile a chiunque lo assaggi.",
    {"squisito": "delicious / exquisite", "immateriale": "intangible", "pietanza": "dish / course", "disciplinari": "guidelines / specifications", "farina": "flour", "lievitare": "to rise / ferment", "digeribile": "digestible", "cornicione": "crust / rim", "alveolature": "air pockets (in dough)", "fragrante": "fragrant / crisp", "legna": "firewood", "succulento": "juicy / succulent"},
    [
        ("In quale anno è nata la famosa pizza Margherita a Napoli ?", ["Nel 1750", "Nel 1889 in onore della regina", "Nel 1945 dopo la guerra", "Nel 2000"], 1, "Nacque nel 1889 per rendere omaggio alla regina Margherita."),
        ("Quali ingredienti rappresentano i colori della bandiera italiana sulla pizza ?", ["Zucchine, patate e formaggio", "Pomodoro, mozzarella fresca e basilico profumato", "Carne, cipolla e funghi", "Tonno, mais e olive"], 1, "Pomodoro (rosso), mozzarella (bianco) e basilico (verde)."),
        ("Come deve essere stesa la pasta secondo il disciplinare tradizionale ?", ["Con il mattarello di legno pesante", "A macchina in modo industriale", "Esclusivamente a mano con movimenti rotatori esperti", "Premendo con una bottiglia"], 2, "La pasta si stende solo a mano creando il cornicione."),
        ("A quale temperatura e per quanto tempo cuoce la pizza nel forno a legna ?", ["A cento gradi per mezz'ora", "A quasi cinquecento gradi per soli sessanta o novanta secondi", "A duecento gradi per quaranta minuti", "A fuoco lento tutta la notte"], 1, "Cuoce a quasi 500 gradi per appena 60-90 secondi."),
        ("Quale riconoscimento internazionale ha ottenuto l'arte del pizzaiuolo napoletano ?", ["La medaglia d'oro olimpica", "Il riconoscimento come patrimonio immateriale UNESCO", "Un premio commerciale privato", "Nessun riconoscimento ufficiale"], 1, "È stata riconosciuta patrimonio immateriale dall'UNESCO.")
    ],
    [
        ("La vera pizza napoletana contiene grandi quantità di burro nell'impasto.", ["Vero", "Falso"], 1, "Falso. Contiene solo farina, acqua, lievito e sale senza grassi aggiunti."),
        ("L'impasto deve lievitare molte ore per risultare leggero e digeribile.", ["Vero", "Falso"], 0, "Vero. La lunga lievitazione garantisce digeribilità."),
        ("Il cornicione della pizza napoletana deve essere basso, secco e piatto.", ["Vero", "Falso"], 1, "Falso. Deve essere alto, gonfio e soffice."),
        ("La cottura avviene rapidamente in un forno a legna caldissimo.", ["Vero", "Falso"], 0, "Vero. La temperatura sfiora i 500 gradi centigradi."),
        ("La pizza Margherita è nata a Roma nel ventesimo secolo.", ["Vero", "Falso"], 1, "Falso. È nata a Napoli nel 1889 creata da Raffaele Esposito.")
    ]
))

passages.append(make_passage(
    "Il Carnevale di Venezia e le sue maschere (Venice Carnival & Masks)", "A2", "it",
    "Ogni anno a febbraio, la laguna di Venezia si trasforma in un palcoscenico magico e senza tempo grazie alle celebri celebrazioni del Carnevale, una delle feste più affascinanti e antiche dell'intero continente europeo. Le origini di questo evento risalgono a molti secoli fa, quando la Repubblica Serenissima concedeva ai cittadini e ai nobili un periodo di totale libertà e spensieratezza prima dell'inizio austero della Quaresima. La caratteristica principale del Carnevale veneziano risiede nelle sue splendide maschere artistiche e nei costumi sontuosi in stile settecentesco, arricchiti da sete pregiate, velluti ricamati, pizzi dorati e piume colorate. Indossare una maschera come la classica Bauta o la raffinata Moretta permetteva storicamente di celare completamente la propria identità, eliminando ogni barriera sociale, economica o di genere: patrizi e popolani potevano mescolarsi liberamente tra le calli e i campielli della città senza temere giudizi. Durante i giorni di festa, piazza San Marco ospita il suggestivo spettacolo del Volo dell'Angelo, in cui una fanciulla scende dolcemente dal campanile fino al centro della piazza sospesa a una corda d'acciaio tra gli applausi entusiasti della folla. Gli artigiani mascareri continuano ancora oggi a fabbricare maschere a mano con la tradizionale cartapesta dipinta e dorata a foglia d'oro. Passeggiare lungo i canali avvolti dalla nebbia invernale ammirando queste figure misteriose regala ai visitatori un'emozione fiabesca e indimenticabile che celebra la fantasia e la storia.",
    {"palcoscenico": "stage", "spensieratezza": "carefreeness / lightheartedness", "austero": "austere", "sontuosi": "sumptuous / lavish", "pregiate": "fine / precious", "velluti": "velvets", "pizzi": "lace", "celare": "to conceal / hide", "patrizi": "patricians / nobles", "popolani": "commoners", "campanile": "bell tower", "cartapesta": "papier-mâché"},
    [
        ("In quale mese dell'anno si celebra tradizionalmente il Carnevale di Venezia ?", ["A luglio sotto il sole caldo", "A febbraio prima della Quaresima", "A ottobre per Halloween", "A dicembre per Natale"], 1, "Si festeggia a febbraio nei giorni prima della Quaresima."),
        ("Qual era la funzione sociale storica delle maschere a Venezia ?", ["Spaventare i bambini", "Celare l'identità per annullare le differenze tra ricchi e poveri", "Proteggere dal freddo estremo", "Lavorare nei cantieri navali"], 1, "Nascondevano l'identità, permettendo a tutti di mescolarsi liberamente."),
        ("Quale famoso spettacolo apre i festeggiamenti in piazza San Marco ?", ["La corsa dei cavalli", "Il suggestivo Volo dell'Angelo dal campanile", "Il concerto di chitarra rock", "La regata dei motoscafi veloci"], 1, "Il Volo dell'Angelo dal campanile è l'evento clou."),
        ("Come vengono ancora fabbricate le maschere tradizionali dagli artigiani ?", ["Con plastica stampata in serie", "A mano con cartapesta dipinta e decorata con cura", "Con metallo pesante arrugginito", "Con corteccia di pino"], 1, "Vengono realizzate a mano in cartapesta dipinta."),
        ("Che tipo di costumi indossano molti partecipanti al Carnevale ?", ["Abiti sportivi moderni", "Costumi sontuosi settecenteschi con velluti e sete", "Tute spaziali argentate", "Uniformi militari"], 1, "Indossano abiti storici con ricami e sete preziose.")
    ],
    [
        ("Le origini del Carnevale di Venezia risalgono all'epoca della Serenissima.", ["Vero", "Falso"], 0, "Vero. La festa ha radici storiche secolari nella Repubblica."),
        ("Durante il Carnevale i cittadini non potevano mai coprirsi il viso.", ["Vero", "Falso"], 1, "Falso. La maschera era proprio l'elemento centrale per nascondersi."),
        ("Il Volo dell'Angelo parte dal campanile di San Marco.", ["Vero", "Falso"], 0, "Vero. La fanciulla scende sospesa a una corda verso la piazza."),
        ("Tutte le maschere veneziane oggi sono importate e fatte di cartone semplice.", ["Vero", "Falso"], 1, "Falso. I maestri mascareri continuano la nobile arte della cartapesta."),
        ("L'atmosfera del Carnevale unisce mistero, eleganza e tradizione storica.", ["Vero", "Falso"], 0, "Vero. Le figure misteriose creano un ambiente fiabesco unico.")
    ]
))

passages.append(make_passage(
    "Viaggiare in treno tra le città d'arte (Train Travel Across Art Cities)", "A2", "it",
    "Negli ultimi anni viaggiare in treno attraverso l'Italia è diventato il mezzo preferito da milioni di turisti e cittadini per esplorare le meraviglie culturali della penisola in modo comodo, rapido e sostenibile. Grazie alla moderna rete ferroviaria ad alta velocità, collegata dai convogli delle Frecce e di Italo, le principali metropoli storiche sono ormai vicinissime tra loro, trasformando lunghi tragitti autostradali in piacevoli trasferimenti di poche decine di minuti. Un viaggiatore può fare una ricca colazione a Milano vicino al maestoso Duomo gotico, salire su un treno veloce e raggiungere Bologna in appena un'ora per gustare un delizioso piatto di tagliatelle al ragù. Da Bologna, attraversando i tunnel dell'Appennino tosco-emiliano in soli quaranta minuti, si giunge a Firenze per ammirare i capolavori rinascimentali degli Uffizi e la cupola del Brunelleschi. Proseguendo verso sud, il treno impiega soltanto un'ora e mezza per arrivare alla stazione di Roma Termini, permettendo di visitare il Colosseo prima del tramonto. A bordo delle carrozze moderne i passeggeri possono rilassarsi sui sedili spaziosi, utilizzare la connessione wireless gratuita per navigare o lavorare al computer, e osservare dal finestrino il panorama mutevole della campagna italiana, punteggiata da vigneti ordinati, castelli medievali e dolci colline alberate. Questo modo di viaggiare riduce notevolmente l'inquinamento atmosferico rispetto all'aereo o all'automobile, promuovendo un turismo responsabile che valorizza il territorio nel pieno rispetto dell'ambiente naturale.",
    {"sostenibile": "sustainable", "ferroviaria": "railway", "convogli": "trains / trainsets", "tragitti": "journeys / routes", "trasferimenti": "transfers / trips", "tagliatelle": "tagliatelle (pasta)", "rinascimentali": "Renaissance-era", "carrozze": "railway carriages", "finestrino": "train window", "mutevole": "changing / shifting", "vigneti": "vineyards", "alberate": "tree-lined"},
    [
        ("Perché molti viaggiatori scelgono il treno ad alta velocità in Italia ?", ["Perché è lento e noioso", "Perché è comodo, veloce ed ecologico", "Perché non ci sono strade", "Perché costa milioni di euro"], 1, "È un mezzo rapido, confortevole e a basso impatto ambientale."),
        ("Quanto tempo impiega il treno veloce tra Bologna e Firenze ?", ["Circa cinque ore", "Soltanto quaranta minuti attraverso gli Appennini", "Tre giorni interi", "Quindici minuti a piedi"], 1, "Impiega appena 40 minuti attraversando l'Appennino."),
        ("Quale famosa cupola rinascimentale si trova a Firenze ?", ["La cupola di San Pietro", "La cupola del Brunelleschi", "La cupola di Londra", "La cupola di Berlino"], 1, "A Firenze si ammira la straordinaria cupola del Brunelleschi."),
        ("Cosa possono fare i passeggeri a bordo delle moderne carrozze ?", ["Guidare la locomotiva", "Rilassarsi, navigare su internet e guardare il paesaggio", "Cucinare la pasta al fuoco", "Dormire sul pavimento"], 1, "Possono usare il wi-fi, lavorare o ammirare le colline."),
        ("Quale vantaggio ambientale offre il treno rispetto all'auto o all'aereo ?", ["Inquina molto di più", "Riduce notevolmente le emissioni inquinanti nell'aria", "Distrugge i vigneti", "Consuma tutta l'acqua"], 1, "Abbatte le emissioni climalteranti rispetto all'aereo o all'auto.")
    ],
    [
        ("L'alta velocità collega comodamente Milano, Bologna, Firenze e Roma.", ["Vero", "Falso"], 0, "Vero. Le principali città d'arte sono collegate dalla rete veloce."),
        ("Da Milano a Bologna in treno ci vogliono più di sei ore di viaggio.", ["Vero", "Falso"], 1, "Falso. Ci vuole appena un'ora di tragitto rapido."),
        ("I treni moderni offrono prese elettriche e connessione internet ai viaggiatori.", ["Vero", "Falso"], 0, "Vero. I convogli dispongono di wi-fi e servizi a bordo."),
        ("Il panorama dal treno mostra solo grattacieli e fabbriche abbandonate.", ["Vero", "Falso"], 1, "Falso. Mostra colline, vigneti ordinati e borghi storici."),
        ("Il viaggio su rotaia è considerato una scelta di turismo ecologico e virtuoso.", ["Vero", "Falso"], 0, "Vero. Favorisce una mobilità sostenibile e responsabile.")
    ]
))

passages.append(make_passage(
    "La vita tranquilla in un borgo toscano (Life in a Tuscan Village)", "A2", "it",
    "Lontano dal rumore assordante, dal traffico caotico e dai ritmi frenetici delle grandi metropoli moderne, i piccoli borghi storici della Toscana offrono uno stile di vita sereno e autentico a misura d'uomo. Adagiati sulla sommità di verdi colline coltivate a vigneti e argentati uliveti, questi paesi medievali sembrano essere rimasti immutati nel corso dei secoli. Le strade lastricate in pietra serena sono così strette che le automobili non possono circolare, permettendo ai residenti di camminare in piena tranquillità e ai bambini di giocare all'aria aperta senza alcun pericolo. Il cuore pulsante della comunità locale è la piazza centrale, dove sorgono la chiesa romanica con il suo orologio antico e il municipio storico. Qui la mattina gli anziani del paese si ritrovano sulle panchine all'ombra dei platani per discutere animatamente del raccolto delle olive, del tempo meteorologico o delle ultime partite di campionato, scambiandosi notizie e ricordi d'infanzia con grande affetto. Nel borgo tutti si conoscono per nome, si salutano calorosamente quando si incrociano nei vicoli e si aiutano reciprocamente nei momenti di difficoltà familiare. Nelle botteghe artigianali si possono acquistare prodotti genuini a chilometro zero: formaggio pecorino fresco, miele di castagno dei boschi vicini, vino rosso Chianti e pane cotto a legna. Vivere in un borgo antico riscopre la bellezza dei ritmi lenti, la solidarietà umana e il legame profondo con le tradizioni del territorio.",
    {"assordante": "deafening", "frenetici": "frenetic / hectic", "sommità": "top / summit", "immutati": "unchanged", "lastricate": "paved (with stones)", "romanica": "Romanesque", "platani": "plane trees", "raccolto": "harvest", "reciprocamente": "mutually / each other", "botteghe": "workshops / small shops", "chilometro zero": "locally sourced (zero km)", "castagno": "chestnut tree"},
    [
        ("Dove sorgono molti borghi storici della Toscana ?", ["Sulla sommità di verdi colline tra vigneti e uliveti", "In fondo a canyon bui", "In mezzo al mare aperto", "Sulle piste degli aeroporti"], 0, "Sorgono in cima a colline panoramiche coltivate a vigneti."),
        ("Perché nei vicoli di questi paesi non circolano le automobili ?", ["Perché è vietato comprare macchine", "Perché le stradine lastricate in pietra sono troppo strette", "Perché non ci sono strade", "Perché mancano i semafori"], 1, "Le vie medievali sono molto strette e pedonali."),
        ("Dove si riuniscono gli anziani per chiacchierare la mattina ?", ["Nel centro commerciale sotterraneo", "Sulle panchine della piazza centrale all'ombra dei platani", "Sui tetti delle case", "In stazione ferroviaria"], 1, "Si incontrano nella piazza centrale del paese."),
        ("Che tipo di prodotti si acquistano nelle botteghe del borgo ?", ["Cibi industriali surgelati dall'estero", "Prodotti genuini a chilometro zero come formaggio, vino e miele", "Computer e telefoni usati", "Abbigliamento di plastica"], 1, "Si comprano cibi genuini locali come pecorino, vino e miele."),
        ("Quale valore umano caratterizza la comunità di questi piccoli borghi ?", ["L'isolamento egoistico totale", "La conoscenza reciproca, la solidarietà e i ritmi sereni", "Il litigio continuo tra vicini", "La fretta esasperata"], 1, "La solidarietà, la vicinanza umana e la calma quotidiana.")
    ],
    [
        ("Nei borghi toscani il ritmo di vita è caotico e stressante come a Milano.", ["Vero", "Falso"], 1, "Falso. Lo stile di vita è sereno, lento e a misura d'uomo."),
        ("La piazza centrale ospita la chiesa con l'orologio antico e il municipio.", ["Vero", "Falso"], 0, "Vero. È il punto di riferimento civico e religioso."),
        ("Nessuno si conosce e gli abitanti non si parlano mai per strada.", ["Vero", "Falso"], 1, "Falso. Tutti si conoscono per nome e si salutano calorosamente."),
        ("I prodotti delle botteghe locali provengono dal territorio circostante.", ["Vero", "Falso"], 0, "Vero. Sono prodotti a chilometro zero genuini."),
        ("I bambini possono giocare sicuri all'aperto grazie all'assenza di traffico.", ["Vero", "Falso"], 0, "Vero. Le strade pedonali consentono di giocare all'aria aperta.")
    ]
))

passages.append(make_passage(
    "La passione per il calcio e la domenica italiana (Sunday Football Culture)", "A2", "it",
    "In Italia il calcio è molto più di una semplice attività sportiva: per milioni di appassionati tifosi di ogni età, rappresenta una vera e propria fede collettiva, un rito laico domenicale che scandisce il ritmo delle settimane e crea legami generazionali indissolubili. Fin dai primi decenni del Novecento, con la nascita delle storiche squadre di club come la Juventus, l'Inter, il Milan, la Roma, la Lazio e il Napoli, la passione per il pallone si è radicata profondamente nel costume e nella cultura popolare del paese. Tradizionalmente, la domenica cominciava con il pranzo in famiglia consumato tutti insieme attorno alla grande tavola, seguito dall'ascolto trepidante della trasmissione radiofonica 'Tutto il calcio minuto per minuto', con le voci inconfondibili dei radiocronisti che descrivevano i gol e i rigori dai campi di tutta Italia. Oggi, nonostante i diritti televisivi abbiano frazionato le partite in anticipi e posticipi durante l'intero fine settimana, l'emozione di recarsi allo stadio con il padre, la madre o i nonni rimane un momento carico di entusiasmo. I tifosi indossano sciarpe con i colori sociali della loro squadra del cuore, cantano cori melodiosi, sventolano bandiere variopinte e trattengono il respiro durante le azioni decisive sotto la porta avversaria. Nelle scuole, negli uffici e nei bar, il lunedì mattina non si parla d'altro che delle decisioni dell'arbitro e delle prodezze dei campioni, dimostrando come lo sport sappia unire persone diverse in un'unica travolgente passione.",
    {"fede": "faith", "laico": "secular", "scandisce": "punctuates / marks", "indissolubili": "indissoluble / unbreakable", "radicata": "rooted", "trepidante": "anxious / trembling with excitement", "frazionato": "split / divided", "anticipi": "early matches", "posticipi": "late matches", "sciarpe": "scarves", "arbitro": "referee", "prodezze": "feats / masterstrokes"},
    [
        ("Cosa rappresenta il calcio per molti italiani secondo il testo ?", ["Un gioco noioso da dimenticare", "Una passione collettiva e un rito che unisce le generazioni", "Un obbligo militare dello Stato", "Solo una perdita di denaro"], 1, "Rappresenta una passione profonda e un rito sociale condiviso."),
        ("Quale storica trasmissione radiofonica teneva incollati i tifosi alla radio ?", ["Radio Notizie Sera", "'Tutto il calcio minuto per minuto'", "Il Giornale di Borsa", "Musica Leggera Oggi"], 1, "La celebre trasmissione 'Tutto il calcio minuto per minuto'."),
        ("Cosa indossano e sventolano i tifosi quando vanno allo stadio ?", ["Giacche scure senza colori", "Sciarpe con i colori della squadra e bandiere variopinte", "Bandiere bianche di resa", "Uniformi grigie"], 1, "Indossano sciarpe colorate e sventolano bandiere festose."),
        ("Di cosa si discute spesso il lunedì mattina nei bar e negli uffici ?", ["Delle condizioni del tempo polare", "Delle partite, delle decisioni arbitrali e dei gol della domenica", "Di fisica quantistica", "Solo di vacanze estive"], 1, "Si commentano i gol, le giocate dei campioni e le decisioni dell'arbitro."),
        ("Quali squadre storiche sono menzionate tra le più note in Italia ?", ["Squadre straniere", "Juventus, Inter, Milan, Roma, Lazio e Napoli", "Solo club minori di periferia", "Squadre di hockey"], 1, "Il testo cita i grandi club storici italiani.")
    ],
    [
        ("Il calcio in Italia è seguito con passione solo dagli uomini anziani.", ["Vero", "Falso"], 1, "Falso. Coinvolge persone di ogni età, famiglie e giovani."),
        ("Le partite di campionato oggi sono distribuite in vari giorni del fine settimana.", ["Vero", "Falso"], 0, "Vero. La tv ha frazionato le gare in anticipi e posticipi."),
        ("Andare allo stadio con i familiari è un'esperienza ricca di entusiasmo e tradizione.", ["Vero", "Falso"], 0, "Vero. Tramanda la passione sportiva di padre in figlio."),
        ("I tifosi non cantano mai cori e rimangono in silenzio assoluto durante la partita.", ["Vero", "Falso"], 1, "Falso. Cantano cori melodiosi e sventolano bandiere colorate."),
        ("Il dibattito calcistico del lunedì è un classico momento di conversazione sociale.", ["Vero", "Falso"], 0, "Vero. Nei bar e negli uffici si commentano le prodezze del weekend.")
    ]
))

# Save first 10 Italian passages test
print(f"Italian passages so far: {len(passages)}")
