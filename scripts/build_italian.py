# -*- coding: utf-8 -*-
"""
Generates complete Italian reading library (25 passages, 5 per level A1-C1).
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from passage_factory import make_passage
from reading_builder_helper import save_typescript_file

passages = []

# =========================================================================
# A1 (150-220 words)
# =========================================================================
passages.append(make_passage(
    "Una giornata a Roma (A Day in Rome)", "A1", "it",
    "Marco vive a Roma da tre anni. Ogni mattina si sveglia presto, verso le sette, e apre la finestra della sua camera per guardare il cielo azzurro. Fa una doccia veloce, si veste con cura ed esce di casa con passo svelto. Alle sette e mezzo entra nel suo bar preferito vicino a piazza Navona. Ordina sempre un cappuccino caldo con una schiuma morbida e un cornetto alla marmellata di albicocche. Saluta il barista Giovanni con un grande sorriso e parla del tempo e delle notizie del giorno. Poi cammina verso l'ufficio nel centro storico della città. Durante il tragitto a piedi, Marco vede molti monumenti antichi, fontane storiche e turisti curiosi che scattano fotografie. Lavora come grafico in una piccola agenzia creativa fino alle diciotto. A pranzo mangia un piatto leggero di pasta al pomodoro fresco e basilico con un collega. La sera ama passeggiare sul lungotevere mentre il sole tramonta dietro la cupola di San Pietro. È felice della sua vita nella capitale italiana.",
    {"sveglia": "wakes up", "finestra": "window", "svelto": "quick / brisk", "schiuma": "foam", "albicocche": "apricots", "barista": "bartender / café worker", "tragitto": "route / commute", "fontane": "fountains", "tramonta": "sets (sun)", "cupola": "dome"},
    [
        ("A che ora si sveglia Marco ogni mattina ?", ["Alle nove", "Verso le sette", "A mezzogiorno", "Alle cinque"], 1, "Marco si sveglia verso le sette ogni giorno."),
        ("Cosa ordina sempre al bar per colazione ?", ["Un tè verde e biscotti", "Un cappuccino caldo e un cornetto all'albicocca", "Una pizza e una birra", "Solo un bicchiere d'acqua"], 1, "Prende un cappuccino e un cornetto alla marmellata."),
        ("Quale lavoro fa Marco a Roma ?", ["Fa il cameriere", "Lavora come grafico in un'agenzia creativa", "Fa il tassista", "È un poliziotto"], 1, "Lavora come grafico fino alle diciotto."),
        ("Cosa mangia Marco a pranzo con il collega ?", ["Un hamburger con patatine", "Pasta al pomodoro fresco e basilico", "Pesce fritto", "Solo frutta"], 1, "Mangia un piatto leggero di pasta al pomodoro."),
        ("Dove passeggia Marco la sera al tramonto ?", ["Nel centro commerciale", "Sul lungotevere vicino a San Pietro", "In aeroporto", "In stazione"], 1, "Passeggia sul lungotevere guardando la cupola di San Pietro.")
    ],
    [
        ("Marco abita a Roma da tre anni.", ["Vero", "Falso"], 0, "Vero. Vive nella capitale italiana da tre anni."),
        ("Il bar preferito di Marco si trova vicino al mare.", ["Vero", "Falso"], 1, "Falso. Si trova vicino a piazza Navona nel centro storico."),
        ("Marco va sempre al lavoro in bicicletta.", ["Vero", "Falso"], 1, "Falso. Cammina a piedi verso l'ufficio."),
        ("Il barista Giovanni è un amico cordiale di Marco.", ["Vero", "Falso"], 0, "Vero. Marco lo saluta sempre con un grande sorriso."),
        ("A Marco piace molto vivere e lavorare a Roma.", ["Vero", "Falso"], 0, "Vero. La sera è felice della sua vita nella capitale.")
    ]
))

passages.append(make_passage(
    "La colazione al bar italiano (Breakfast at an Italian Café)", "A1", "it",
    "In Italia la colazione al bar è un rito quotidiano molto amato da milioni di persone. Quasi tutti gli italiani iniziano la giornata fermandosi qualche minuto nel loro bar di fiducia sotto casa o vicino al posto di lavoro. L'atmosfera del mattino è vivace, con il profumo intenso del caffè tostato che riempie tutta la stanza. I clienti entrano frettolosi, ordinano al bancone e consumano la colazione in piedi, parlando ad alta voce con il barista o leggendo le prime pagine della Gazzetta dello Sport. La bevanda più richiesta è il classico caffè espresso, servito in una tazzina calda di porcellana bianca. Molti preferiscono il cappuccino o il caffè macchiato con un goccio di latte caldo. Per accompagnare la bevanda, si sceglie una pasta dolce, solitamente un cornetto ripieno di crema pasticcera, cioccolato fondente o miele. In pochi minuti la colazione è finita, si paga alla cassa e si riparte con energia verso gli impegni della giornata. Questo semplice momento sociale unisce tutto il paese in un'abitudine calorosa e rilassante.",
    {"rito": "ritual", "fiducia": "trust", "profumo": "aroma / scent", "tostato": "roasted", "bancone": "counter", "tazzina": "small cup", "porcellana": "porcelain", "goccio": "drop / splash", "ripieno": "filled / stuffed", "impegni": "commitments / duties"},
    [
        ("Come consumano la colazione la maggior parte dei clienti al bar ?", ["Seduti a lungo a tavola", "In piedi al bancone in pochi minuti", "In macchina", "A letto"], 1, "I clienti consumano solitamente la colazione in piedi al bancone."),
        ("Quale bevanda è la più ordinata la mattina nei bar italiani ?", ["Il succo di mela", "Il classico caffè espresso in tazzina calda", "La cioccolata fredda", "La tisana alla menta"], 1, "L'espresso classico è la bevanda più richiesta."),
        ("Che tipo di dolce si mangia comunemente a colazione ?", ["Una fetta di torta salata", "Un cornetto dolce ripieno di crema o cioccolato", "Un panino con prosciutto", "Un gelato grande"], 1, "Si sceglie un cornetto ripieno di crema, cioccolato o miele."),
        ("Quale giornale sportivo viene spesso sfogliato al bar ?", ["Il Corriere della Sera", "La Gazzetta dello Sport", "La Repubblica", "Il Sole 24 Ore"], 1, "La Gazzetta dello Sport è molto letta al bar."),
        ("Cosa rappresenta questo momento per gli italiani ?", ["Un obbligo fastidioso", "Un rito quotidiano caloroso che dona energia", "Una perdita di tempo", "Un lavoro faticoso"], 1, "È un rito amato che dona energia e convivialità.")
    ],
    [
        ("La colazione al bar in Italia dura solitamente molte ore.", ["Vero", "Falso"], 1, "Falso. Dura solo pochi minuti prima di andare al lavoro."),
        ("Il profumo del caffè tostato accoglie i clienti nei bar.", ["Vero", "Falso"], 0, "Vero. L'aroma intenso riempie la stanza ogni mattina."),
        ("Tutti gli italiani bevono solo tè freddo al mattino.", ["Vero", "Falso"], 1, "Falso. Ordinano caffè espresso, cappuccino o macchiato."),
        ("I cornetti possono essere farciti con crema o cioccolato.", ["Vero", "Falso"], 0, "Vero. Ci sono vari ripieni dolci e gustosi."),
        ("La colazione al bar è considerata un'esperienza piacevole e sociale.", ["Vero", "Falso"], 0, "Vero. È un'abitudine calorosa che unisce le persone.")
    ]
))

passages.append(make_passage(
    "La mia famiglia e la nostra casa in collina (My Family in the Hills)", "A1", "it",
    "Mi chiamo Chiara e abito con la mia famiglia in una bella casa di pietra sulle colline dell'Umbria. La nostra casa è antica ma ristrutturata con cura, circondata da un grande giardino verde e da molti alberi di ulivo secolari. La mia famiglia è composta da quattro persone: mio padre Roberto, mia madre Elena, mio fratello minore Matteo e io. Abbiamo anche un cane vivace di nome Pippo e due gatti bianchi che dormono sempre al sole. Mio padre lavora come agronomo e si prende cura dell'orto dove coltiviamo pomodori, insalata fresca e zucchine saporite. Mia madre insegna matematica nella scuola media del paese vicino ed è sempre molto paziente con tutti. Durante il fine settimana ci piace cucinare insieme piatti tradizionali e pranzare all'aperto sotto la pergola di vite. Matteo ama giocare a pallone nel prato con il cane, mentre io preferisco leggere libri d'avventura o dipingere paesaggi all'acquerello. La sera la collina è silenziosa e dalle finestre si possono ammirare migliaia di stelle luminose. Adoro la serenità della nostra vita a contatto con la natura.",
    {"pietra": "stone", "ristrutturata": "renovated", "ulivo": "olive tree", "agronomo": "agronomist", "orto": "vegetable garden", "zucchine": "zucchini", "pergola": "pergola / arbor", "vite": "grapevine", "acquerello": "watercolor", "serenità": "serenity / peace"},
    [
        ("Dove si trova la casa di Chiara e della sua famiglia ?", ["Vicino al porto di Napoli", "Sulle colline dell'Umbria tra gli ulivi", "In un grattacielo a Milano", "Su un'isola deserta"], 1, "La casa si trova sulle colline verdi dell'Umbria."),
        ("Quante persone compongono la famiglia di Chiara ?", ["Due persone", "Quattro persone", "Sette persone", "Nove persone"], 1, "La famiglia è composta da quattro persone."),
        ("Cosa insegna la mamma di Chiara a scuola ?", ["Storia dell'arte", "Matematica nella scuola media", "Lingua inglese", "Educazione fisica"], 1, "Insegna matematica nella scuola del paese."),
        ("Cosa fa il fratello minore Matteo nel tempo libero ?", ["Suona il violino", "Gioca a pallone nel prato con il cane", "Guarda la televisione tutto il giorno", "Dorme sempre"], 1, "Matteo gioca a pallone nel prato con Pippo."),
        ("Cosa si vede di notte dalle finestre della casa ?", ["Il traffico della città", "Migliaia di stelle luminose nel silenzio", "Solo fumo e nebbia", "Le luci dei treni veloci"], 1, "Si ammirano migliaia di stelle nel cielo notturno.")
    ],
    [
        ("La casa di Chiara è un appartamento moderno in centro.", ["Vero", "Falso"], 1, "Falso. È una casa di pietra sulle colline dell'Umbria."),
        ("La famiglia possiede un cane di nome Pippo e due gatti.", ["Vero", "Falso"], 0, "Vero. Hanno un cane vivace e due gatti bianchi."),
        ("Il padre di Chiara coltiva verdure fresche nell'orto.", ["Vero", "Falso"], 0, "Vero. Coltiva pomodori, insalata e zucchine saporite."),
        ("Nel fine settimana la famiglia non mangia mai insieme.", ["Vero", "Falso"], 1, "Falso. Pranzano insieme all'aperto sotto la pergola."),
        ("Chiara ama dipingere e leggere libri nella tranquillità.", ["Vero", "Falso"], 0, "Vero. Le piace leggere e dipingere paesaggi.")
    ]
))

passages.append(make_passage(
    "Fare la spesa al mercato di Firenze (Shopping at Florence Market)", "A1", "it",
    "Il sabato mattina vado sempre al mercato centrale di Firenze per fare la spesa settimanale con mia nonna Lucia. Il mercato è un edificio storico coperto, pieno di colori vivaci, profumi deliziosi e voci allegre dei commercianti che invitano la gente ad assaggiare i loro prodotti freschi. Iniziamo la visita dal banco delle verdure di Giovanni, un contadino gentile che vende ortaggi biologici coltivati nei campi vicino alla città. Compriamo due chili di pomodori maturi, un cespo di lattuga verde, tre carote dolci e un mazzo di basilico profumato. Poi andiamo dal fornaio a prendere una pagnotta grande di pane toscano senza sale, perfetto per fare le bruschette con l'olio extravergine d'oliva. Mia nonna sceglie anche un pezzo saporito di formaggio pecorino stagionato e qualche etto di prosciutto toscano crudo tagliato sottile. Il mercato è sempre affollato di residenti e turisti che scattano fotografie e chiedono consigli sulle ricette tradizionali. Prima di tornare a casa, ci fermiamo al piccolo chiosco all'uscita per bere una spremuta d'arancia fresca. Fare la spesa al mercato è un'esperienza divertente che rispetta la tradizione del cibo genuino.",
    {"coperto": "covered / indoor", "ortaggi": "vegetables / produce", "cespo": "head (of lettuce)", "pagnotta": "loaf of bread", "senza sale": "unsalted", "bruschette": "bruschettas", "pecorino": "pecorino cheese", "stagionato": "aged / seasoned", "spremuta": "freshly squeezed juice", "genuino": "genuine / wholesome"},
    [
        ("Con chi va al mercato centrale il protagonista ?", ["Con un compagno di scuola", "Con sua nonna Lucia", "Da solo con il cane", "Con una guida turistica"], 1, "Va al mercato insieme a sua nonna Lucia."),
        ("Quale particolarità ha il pane tradizionale toscano ?", ["È fatto senza sale", "È ripieno di cioccolato", "È di colore blu", "È molto piccante"], 0, "Il pane toscano è tradizionalmente senza sale."),
        ("Quali verdure comprano al banco di Giovanni ?", ["Cipolle e patate fritte", "Pomodori maturi, lattuga, carote e basilico", "Solo funghi secchi", "Nessuna verdura"], 1, "Comprano pomodori, lattuga, carote e basilico fresco."),
        ("Che tipo di formaggio acquista la nonna ?", ["Gorgonzola piccante", "Pecorino stagionato saporito", "Ricotta industriale", "Formaggio svizzero"], 1, "Sceglie un pezzo di pecorino stagionato."),
        ("Cosa bevono prima di tornare a casa ?", ["Un caffè corretto", "Una spremuta d'arancia fresca", "Una bibita gassata", "Un bicchiere di latte caldo"], 1, "Bevono una spremuta d'arancia fresca al chiosco.")
    ],
    [
        ("Il mercato centrale di Firenze è un edificio storico all'aperto senza tetto.", ["Vero", "Falso"], 1, "Falso. È un edificio storico coperto con molti banchi."),
        ("I commercianti offrono assaggi dei loro prodotti tipici.", ["Vero", "Falso"], 0, "Vero. Invitano la gente ad assaggiare i prodotti freschi."),
        ("Il pane toscano si accompagna bene con l'olio extravergine d'oliva.", ["Vero", "Falso"], 0, "Vero. È ideale per fare le bruschette saporite."),
        ("La nonna non compra mai formaggio al mercato.", ["Vero", "Falso"], 1, "Falso. Sceglie del pecorino stagionato saporito."),
        ("Il mercato è frequentato sia da cittadini locali che da visitatori.", ["Vero", "Falso"], 0, "Vero. È affollato da residenti e turisti curiosi.")
    ]
))

passages.append(make_passage(
    "Un pomeriggio in spiaggia a Rimini (An Afternoon at Rimini Beach)", "A1", "it",
    "Durante l'estate molti giovani e famiglie italiane trascorrono le vacanze sulla riviera adriatica, nella famosa città balneare di Rimini. La spiaggia è lunghissima, coperta di sabbia fine e dorata, con file ordinate di ombrelloni colorati e comodi lettini da sole. Oggi è una calda giornata di luglio con il sole splendente e una leggera brezza marina rinfrescante. Luca e i suoi amici arrivano allo stabilimento balneare verso le due del pomeriggio. Posano gli zaini, mettono la crema solare protettiva e corrono subito verso il mare per fare una bella nuotata nell'acqua calma. Più tardi organizzano una partita divertente di beach volley con altri ragazzi conosciuti sul campo di sabbia. Alle diciassette fanno una sosta per mangiare una rinfrescante fetta di anguria dolce e bere acqua minerale fresca al bar della spiaggia. Alcuni bambini costruiscono castelli di sabbia vicino alla riva mentre ascoltano la musica allegra della radio. Verso il tramonto il cielo si tinge di sfumature rosa e arancioni spettacolari. Tutti si preparano per una passeggiata sul lungomare e per mangiare una deliziosa piadina romagnola calda.",
    {"balneare": "seaside / beach resort", "ombrelloni": "beach umbrellas", "lettini": "sun loungers", "stabilimento": "beach club / lido", "nuotata": "swim", "anguria": "watermelon", "riva": "shore / water's edge", "tramonto": "sunset", "sfumature": "shades / hues", "piadina": "flatbread (piadina)"},
    [
        ("In quale città balneare si trova la spiaggia descritta ?", ["A Venezia", "A Rimini sulla riviera adriatica", "A Genova", "A Palermo"], 1, "Si trova a Rimini, famosa città balneare."),
        ("Come si presenta la spiaggia di Rimini ?", ["Piena di rocce scure e alte", "Lunga, con sabbia fine dorata e ombrelloni ordinati", "Completamente vuota e stretta", "Coperta di fango"], 1, "La spiaggia ha sabbia fine dorata e file di ombrelloni."),
        ("Cosa fanno Luca e i suoi amici appena arrivano al mare ?", ["Dormono subito sotto l'ombrellone", "Fanno una bella nuotata nell'acqua calma", "Tornano subito a casa", "Accendono il computer"], 1, "Corrono subito a fare una nuotata rinfrescante."),
        ("Quale frutto mangiano per merenda al bar ?", ["Una fetta di anguria dolce e fresca", "Delle mele cotte", "Un'arancia amara", "Solo banane"], 0, "Mangiano una rinfrescante fetta di anguria dolce."),
        ("Quale cibo tipico mangeranno la sera sul lungomare ?", ["Sushi giapponese", "Una calda piadina romagnola", "Solo pane secco", "Couscous"], 1, "Mangeranno la tipica piadina romagnola calda.")
    ],
    [
        ("La giornata estiva a Rimini è caratterizzata da pioggia e temporali.", ["Vero", "Falso"], 1, "Falso. C'è il sole splendente e una brezza piacevole."),
        ("I ragazzi giocano a beach volley sulla sabbia con altri giovani.", ["Vero", "Falso"], 0, "Vero. Organizzano una partita divertente di pallavolo."),
        ("L'acqua del mare è calma e piacevole per nuotare.", ["Vero", "Falso"], 0, "Vero. Nuotano nell'acqua calma del litorale adriatico."),
        ("I bambini non possono giocare vicino alla riva.", ["Vero", "Falso"], 1, "Falso. Costruiscono castelli di sabbia ascoltando musica."),
        ("Al tramonto il cielo si colora di meravigliose tonalità calde.", ["Vero", "Falso"], 0, "Vero. Il cielo si tinge di rosa e arancione.")
    ]
))

# Save first 5 Italian passages test
print(f"Italian passages so far: {len(passages)}")

target_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../src/data/reading/italian.ts"))
print("A1 Italian passages completed successfully!")
