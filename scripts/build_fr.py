# -*- coding: utf-8 -*-
"""
French reading passages generator: 25 passages (5 A1, 5 A2, 5 B1, 5 B2, 5 C1).
All passages strictly tested against CEFR word count targets:
A1: 150-220, A2: 200-260, B1: 250-320, B2: 280-360, C1: 320-400 words.
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from reading_builder_helper import save_typescript_file
from passage_factory import make_passage

passages = []

# =========================================================================
# A1 (150-220 words)
# =========================================================================
passages.append(make_passage(
    "Une journée à Paris (A Day in Paris)", "A1", "fr",
    "Je m'appelle Antoine et j'habite dans un petit appartement calme à Paris. Chaque matin, je me réveille à sept heures précises. Je commence ma journée par une bonne douche chaude, puis je vais dans la cuisine. Je prépare un grand bol de café au lait et je mange deux croissants frais avec du beurre doux et de la confiture d'abricot. À huit heures, je quitte mon logement et je marche cinq minutes jusqu'à la station de métro. Je prends la ligne quatre pour aller au travail. Je travaille comme assistant dans une librairie ancienne située près de la Seine. La boutique ouvre à neuf heures du matin. J'aime beaucoup ranger les beaux livres et conseiller les clients sympathiques qui cherchent des romans passionnants. À midi, je mange une salade verte et un sandwich au fromage dans un petit square ensoleillé avec mes collègues. L'après-midi passe très vite car il y a toujours beaucoup de travail. À dix-huit heures, la librairie ferme ses portes et je rentre chez moi à pied. Le soir, je cuisine un repas léger, j'écoute de la musique classique et je lis un chapitre avant de dormir. J'adore ma vie à Paris.",
    {"appartement": "apartment", "réveille": "wake up", "croissants": "croissants", "confiture": "jam", "logement": "housing", "librairie": "bookshop", "conseiller": "to advise", "square": "small park", "sandwich": "sandwich", "repas": "meal", "musique": "music", "chapitre": "chapter"},
    [
        ("À quelle heure Antoine se réveille-t-il ?", ["À six heures", "À sept heures", "À huit heures", "À neuf heures"], 1, "Le texte indique qu'il se réveille à sept heures."),
        ("Que mange Antoine au petit-déjeuner ?", ["Des céréales", "Deux croissants avec beurre et confiture", "Des œufs", "Des fruits"], 1, "Il mange deux croissants frais avec beurre et confiture."),
        ("Quel moyen de transport utilise-t-il ?", ["Le vélo", "La voiture", "Le métro", "Le bus"], 2, "Il prend la ligne quatre du métro."),
        ("Quel est son travail ?", ["Cuisinier", "Assistant dans une librairie ancienne", "Médecin", "Professeur"], 1, "Il travaille comme assistant dans une librairie."),
        ("Que fait-il le soir avant de dormir ?", ["Il regarde la télévision", "Il fait du sport", "Il lit un chapitre de livre", "Il joue aux jeux vidéo"], 2, "Il lit un chapitre avant de dormir.")
    ],
    [
        ("Antoine habite à Paris.", ["Vrai", "Faux"], 0, "Vrai. Le texte débute par 'j'habite dans un petit appartement calme à Paris'."),
        ("La librairie est située près de la mer.", ["Vrai", "Faux"], 1, "Faux. Elle est située près de la Seine."),
        ("Antoine déjeune seul dans la boutique.", ["Vrai", "Faux"], 1, "Faux. Il mange avec ses collègues dans un square."),
        ("La librairie ferme ses portes à dix-huit heures.", ["Vrai", "Faux"], 0, "Vrai. Elle ferme à dix-huit heures."),
        ("Antoine rentre chez lui en taxi.", ["Vrai", "Faux"], 1, "Faux. Il rentre chez lui à pied.")
    ]
))

passages.append(make_passage(
    "Le marché de Provence (The Provençal Market)", "A1", "fr",
    "Tous les samedis matin, le village d'Aix-en-Provence s'anime grâce à son magnifique marché traditionnel en plein air. C'est l'endroit idéal pour découvrir les délicieuses spécialités de la région. Les étals colorés des producteurs locaux remplissent les petites ruelles historiques et la place de l'hôtel de ville. On y trouve une incroyable variété de fruits mûrs comme des pêches juteuses, des melons parfumés de Cavaillon et des raisins sucrés. Les maraîchers proposent aussi des légumes frais: des tomates rouges, des courgettes, des aubergines et des poivrons pour préparer une véritable ratatouille provençale. Un peu plus loin, l'odeur merveilleuse des herbes de Provence, du thym et de la lavande attire de nombreux visiteurs curieux. Je m'arrête toujours chez le fromager pour acheter un fromage de chèvre crémeux et quelques olives noires marinées à l'huile d'olive. Les marchands sont toujours souriants et aiment discuter chaleureusement avec les clients fidèles. Avant de rentrer à la maison, j'achète un joli bouquet de fleurs sauvages pour décorer la table du salon. Faire les courses au marché le samedi est un plaisir simple et authentique qui rend le week-end très agréable pour tous les habitants du village.",
    {"marché": "market", "étals": "stalls", "producteurs": "producers", "ruelles": "alleys", "pêches": "peaches", "melons": "melons", "légumes": "vegetables", "lavande": "lavender", "chèvre": "goat cheese", "olives": "olives", "bouquet": "bouquet", "plaisir": "pleasure"},
    [
        ("Quel jour a lieu le marché traditionnel ?", ["Le lundi", "Le samedi matin", "Le mercredi", "Le dimanche soir"], 1, "Le marché a lieu tous les samedis matin."),
        ("Quels fruits sont mentionnés dans le texte ?", ["Des bananes", "Des pêches, des melons et des raisins", "Des ananas", "Des pommes vertes"], 1, "Le texte mentionne des pêches, des melons et des raisins."),
        ("Quel plat provençal peut-on préparer avec ces légumes ?", ["Une choucroute", "Une ratatouille provençale", "Une crêpe", "Une paella"], 1, "Les légumes servent à préparer une véritable ratatouille."),
        ("Qu'achète la personne chez le fromager ?", ["Du fromage de chèvre et des olives", "Du beurre salé", "Du lait entier", "De la crème"], 0, "Elle achète du fromage de chèvre et des olives noires."),
        ("Que prend la personne avant de rentrer ?", ["Un chapeau", "Un bouquet de fleurs sauvages", "Un journal", "Un gâteau"], 1, "Elle achète un joli bouquet de fleurs pour le salon.")
    ],
    [
        ("Le marché se déroule dans un grand supermarché moderne.", ["Vrai", "Faux"], 1, "Faux. Il a lieu en plein air dans le village."),
        ("On y sent l'odeur du thym et de la lavande.", ["Vrai", "Faux"], 0, "Vrai. Le texte mentionne le thym et la lavande."),
        ("Les marchands refusent de parler aux clients.", ["Vrai", "Faux"], 1, "Faux. Les marchands aiment discuter chaleureusement."),
        ("Les melons proviennent de Cavaillon.", ["Vrai", "Faux"], 0, "Vrai. Le texte mentionne les melons de Cavaillon."),
        ("Faire les courses au marché est perçu comme un plaisir authentique.", ["Vrai", "Faux"], 0, "Vrai. Le texte conclut que c'est un plaisir simple et authentique.")
    ]
))

passages.append(make_passage(
    "Un week-end en Bretagne (A Weekend in Brittany)", "A1", "fr",
    "Le week-end dernier, je suis parti avec deux bons amis explorer la magnifique côte sauvage de Bretagne. Nous avons pris le train depuis Paris pour arriver à Saint-Malo en début d'après-midi. La ville fortifiée est entourée de grands remparts de pierre sombre qui offrent une vue spectaculaire sur l'océan Atlantique et les plages de sable fin. Il faisait un vent frais mais le soleil brillait dans le ciel. Nous nous sommes promenés le long des remparts tout en respirant l'air marin tonifiant. Plus tard, nous nous sommes installés dans une crêperie traditionnelle du vieux centre pour déjeuner. Nous avons commandé de succulentes galettes de sarrasin garnies de jambon, de fromage fondu et d'un œuf, accompagnées d'un bol de cidre doux artisanal. En dessert, nous avons dégusté une crêpe sucrée au caramel au beurre salé qui était absolument divine. L'après-midi, nous avons visité le grand port historique et regardé les voiliers rentrer au coucher du soleil. Les habitants locaux étaient très accueillants et fiers de leur riche culture régionale. Ce court séjour au bord de la mer nous a permis de nous détendre complètement et de respirer loin du bruit de la métropole.",
    {"remparts": "ramparts", "sombre": "dark", "vent": "wind", "galettes": "buckwheat pancakes", "sarrasin": "buckwheat", "fondu": "melted", "cidre": "cider", "beurre salé": "salted butter", "voiliers": "sailboats", "coucher": "sunset", "accueillants": "welcoming", "détendre": "to relax"},
    [
        ("Quelle ville bretonne les amis ont-ils visitée ?", ["Brest", "Saint-Malo", "Rennes", "Nantes"], 1, "Ils sont arrivés à Saint-Malo."),
        ("De quoi la ville est-elle entourée ?", ["De hautes montagnes", "De grands remparts de pierre", "D'une forêt dense", "D'un lac"], 1, "Elle est entourée de grands remparts de pierre sombre."),
        ("Qu'ont-ils mangé dans la crêperie ?", ["Des pizzas", "Des galettes de sarrasin et une crêpe sucrée", "Des sushis", "Du couscous"], 1, "Ils ont commandé des galettes de sarrasin et une crêpe au caramel."),
        ("Quelle boisson traditionnelle ont-ils bue ?", ["Du vin chaud", "Du cidre doux artisanal", "De la bière", "Du thé glacé"], 1, "Ils ont bu un bol de cidre artisanal."),
        ("Que regardaient-ils en fin d'après-midi ?", ["Un match de football", "Les voiliers rentrer au port", "Un film au cinéma", "Les voitures"], 1, "Ils ont regardé les voiliers rentrer au port au coucher du soleil.")
    ],
    [
        ("Saint-Malo est située au bord de l'océan Atlantique.", ["Vrai", "Faux"], 0, "Vrai. Les remparts donnent sur l'océan."),
        ("Les amis ont voyagé en voiture particulière.", ["Vrai", "Faux"], 1, "Faux. Ils ont pris le train depuis Paris."),
        ("Le caramel au beurre salé est une spécialité bretonne.", ["Vrai", "Faux"], 0, "Vrai. Ils ont dégusté une crêpe au caramel au beurre salé."),
        ("Le temps était pluvieux et très orageux tout le week-end.", ["Vrai", "Faux"], 1, "Faux. Le soleil brillait avec un vent frais."),
        ("Ce séjour leur a permis de se détendre au calme.", ["Vrai", "Faux"], 0, "Vrai. Le séjour leur a permis de se détendre loin du bruit.")
    ]
))

passages.append(make_passage(
    "Ma passion pour la pâtisserie (My Passion for Baking)", "A1", "fr",
    "Depuis mon enfance, j'ai une grande passion pour la pâtisserie française traditionnelle. C'est ma grand-mère Marie qui m'a transmis cet amour du sucré lorsque je passais mes vacances scolaires dans sa maison de campagne. Elle m'a appris à peser soigneusement la farine, le sucre en poudre et le beurre, et à casser les œufs sans laisser tomber de coquilles. Aujourd'hui, je passe presque tous mes dimanches après-midi dans ma cuisine à préparer de bons desserts pour ma famille et mes amis. Ma spécialité préférée est la tarte aux pommes classique avec une pâte brisée croustillante et une touche de cannelle parfumée. J'aime aussi confectionner des petits gâteaux comme des madeleines dorées, des éclairs au chocolat crémeux et des macarons colorés aux fruits rouges. Lorsque les gâteaux cuisent doucement dans le four, une odeur absolument délicieuse embaume toute la maison. Mes voisins me disent souvent qu'ils sentent ces merveilleux parfums depuis le couloir de l'immeuble. La pâtisserie demande beaucoup de rigueur, de concentration et de patience, mais le sourire de mes invités quand ils goûtent mes créations est ma plus belle récompense.",
    {"pâtisserie": "pastry / baking", "enfance": "childhood", "peser": "to weigh", "farine": "flour", "coquilles": "shells", "tarte": "tart / pie", "croustillante": "crispy", "cannelle": "cinnamon", "madeleines": "madeleines", "embaume": "perfumes / fills with scent", "rigueur": "precision / rigor", "récompense": "reward"},
    [
        ("Qui a transmis cette passion à l'auteur ?", ["Son professeur d'école", "Sa grand-mère Marie", "Son voisin", "Un grand chef célèbre"], 1, "C'est sa grand-mère Marie qui lui a transmis cette passion."),
        ("Quelle est la spécialité préférée de l'auteur ?", ["Le fondant au chocolat", "La tarte aux pommes classique", "Le tiramisu", "La glace à la vanille"], 1, "Sa spécialité préférée est la tarte aux pommes croustillante."),
        ("Quelle épice utilise-t-il dans sa tarte aux pommes ?", ["Du poivre", "De la cannelle", "Du gingembre", "Du piment"], 1, "Il ajoute une touche de cannelle parfumée."),
        ("Quels petits gâteaux aime-t-il aussi confectionner ?", ["Des cookies uniquement", "Des madeleines, des éclairs et des macarons", "Des beignets gras", "Des pancakes"], 1, "Il prépare des madeleines, des éclairs au chocolat et des macarons."),
        ("Quelle est la plus belle récompense de l'auteur ?", ["Gagner beaucoup d'argent", "Le sourire de ses invités quand ils goûtent", "Passer à la télévision", "Avoir un diplôme"], 1, "Le sourire de ses invités est sa plus belle récompense.")
    ],
    [
        ("L'auteur cuisine ses pâtisseries le dimanche après-midi.", ["Vrai", "Faux"], 0, "Vrai. Il passe presque tous ses dimanches à préparer des desserts."),
        ("La grand-mère de l'auteur s'appelle Sophie.", ["Vrai", "Faux"], 1, "Faux. Elle s'appelle Marie."),
        ("La pâtisserie demande de la patience et de la précision.", ["Vrai", "Faux"], 0, "Vrai. Le texte souligne la rigueur et la patience nécessaires."),
        ("Les voisins se plaignent des mauvaises odeurs dans le couloir.", ["Vrai", "Faux"], 1, "Faux. Ils sentent de merveilleux parfums depuis le couloir."),
        ("L'auteur déteste préparer des desserts pour ses proches.", ["Vrai", "Faux"], 1, "Faux. Il adore faire plaisir à sa famille et à ses amis.")
    ]
))

passages.append(make_passage(
    "Le vélo en ville (Cycling in the City)", "A1", "fr",
    "Depuis six mois, j'ai pris une excellente résolution pour ma santé et pour l'environnement: j'ai décidé de faire tous mes déplacements quotidiens à vélo. J'ai acheté une bicyclette urbaine très confortable avec un panier pratique à l'avant et sept vitesses adaptées. Au début, j'avais un peu peur de circuler au milieu de la circulation automobile, mais ma municipalité a récemment aménagé de nombreuses pistes cyclables protégées et bien signalées. Désormais, je me rends à mon travail en seulement vingt minutes, alors qu'il me fallait auparavant plus de quarante minutes en métro bondé ou dans les embouteillages stressants. Pédaler le matin me permet de respirer l'air frais, d'admirer les façades des monuments anciens et de faire un exercice physique modéré qui me met de bonne humeur pour toute la journée. Le samedi, j'utilise mon vélo pour aller faire des courses au supermarché ou pour faire une jolie promenade avec des collègues le long du canal. En plus d'être très écologique, ce mode de transport me fait faire d'importantes économies d'argent sur les tickets de bus et l'essence. C'est sans doute le meilleur choix que j'ai fait cette année.",
    {"déplacements": "trips / travel", "panier": "basket", "vitesses": "gears", "pistes cyclables": "bike paths", "signalées": "signposted", "auparavant": "previously", "bondé": "crowded", "embouteillages": "traffic jams", "pédaler": "to pedal", "façades": "facades", "promenade": "walk / ride", "économies": "savings"},
    [
        ("Depuis combien de temps l'auteur utilise-t-il son vélo ?", ["Depuis dix ans", "Depuis six mois", "Depuis deux semaines", "Depuis hier"], 1, "Il l'utilise depuis six mois."),
        ("Combien de temps dure son trajet pour aller au travail ?", ["Cinq minutes", "Vingt minutes", "Une heure", "Deux heures"], 1, "Il met désormais seulement vingt minutes."),
        ("Qu'a aménagé la mairie pour faciliter les trajets ?", ["Des autoroutes", "Des pistes cyclables protégées", "Des tunnels sombres", "Des parkings gratuits"], 1, "La ville a aménagé des pistes cyclables protégées."),
        ("Comment l'auteur se déplaçait-il auparavant ?", ["À cheval", "En métro bondé ou en voiture dans les embouteillages", "En avion", "À rollers"], 1, "Il prenait le métro bondé ou subissait les embouteillages."),
        ("Quel avantage financier le vélo apporte-t-il ?", ["Aucun avantage", "Des économies sur les tickets et le carburant", "Il rend millionnaire", "Il augmente les impôts"], 1, "Il permet de réaliser d'importantes économies de transport.")
    ],
    [
        ("Le vélo de l'auteur possède un panier à l'avant.", ["Vrai", "Faux"], 0, "Vrai. Le vélo dispose d'un panier pratique à l'avant."),
        ("L'auteur met plus de temps à vélo qu'en métro autrefois.", ["Vrai", "Faux"], 1, "Faux. Il met vingt minutes contre quarante minutes auparavant."),
        ("Pédaler le matin met l'auteur de bonne humeur.", ["Vrai", "Faux"], 0, "Vrai. Le texte indique que l'exercice le met de bonne humeur."),
        ("L'auteur utilise son vélo uniquement les jours de pluie.", ["Vrai", "Faux"], 1, "Faux. Il l'utilise tous les jours pour ses trajets."),
        ("Le vélo est considéré comme un mode de transport écologique.", ["Vrai", "Faux"], 0, "Vrai. Le texte souligne son caractère écologique et économique.")
    ]
))

# =========================================================================
# A2 (200-260 words)
# =========================================================================
passages.append(make_passage(
    "La gastronomie des terroirs français (French Terroir Gastronomy)", "A2", "fr",
    "La gastronomie française ne se résume pas aux grands restaurants étoilés de la capitale; elle puise sa véritable richesse dans la diversité exceptionnelle de ses terroirs régionaux. Chaque province de l'Hexagone possède des traditions culinaires séculaires transmises avec fierté de génération en génération. Dans le Sud-Ouest, les volailles fermières, le canard confit et le cassoulet mijoté longuement dans des plats en terre cuite réchauffent les cœurs lors des réunions familiales. En Normandie, les vergers verdoyants fournissent des pommes croquantes servant à fabriquer le cidre pétillant et le calvados, tandis que les pâturages riches permettent de produire des fromages crémeux mondialement réputés comme le camembert et le pont-l'évêque. À l'est, l'Alsace séduit par sa choucroute garnie et ses vins blancs fruités qui accompagnent merveilleusement les repas de fête. Le repas à la française, inscrit au patrimoine culturel immatériel de l'humanité par l'UNESCO, célèbre autant la qualité des produits frais que l'art de passer un long moment convivial autour d'une belle table. Ce rituel renforce les liens amicaux et familiaux, car converser joyeusement pendant plusieurs heures en dégustant de bons mets est considéré comme un art de vivre fondamental en France.",
    {"gastronomie": "gastronomy", "puise": "draws / finds", "terroirs": "local regions / soils", "séculaires": "centuries-old", "volailles": "poultry", "confit": "preserved / confit", "vergers": "orchards", "pâturages": "pastures", "immatériel": "intangible", "convivial": "friendly / convivial", "rituel": "ritual", "art de vivre": "way of life"},
    [
        ("Où la gastronomie française puise-t-elle sa vraie richesse ?", ["Dans les fast-foods", "Dans la diversité de ses terroirs régionaux", "Uniquement à Paris", "Dans les usines"], 1, "Elle puise sa richesse dans ses terroirs régionaux."),
        ("Quel plat mijoté est typique du Sud-Ouest ?", ["La bouillabaisse", "Le cassoulet", "La tartiflette", "Le gratin dauphinois"], 1, "Le cassoulet mijoté est typique du Sud-Ouest."),
        ("Quels fromages célèbres proviennent de Normandie ?", ["Le roquefort", "Le camembert et le pont-l'évêque", "Le comté", "Le reblochon"], 1, "Le camembert et le pont-l'évêque viennent de Normandie."),
        ("Quelle organisation a reconnu le repas gastronomique français ?", ["L'UNESCO", "La Croix-Rouge", "L'Union européenne", "L'OTAN"], 0, "L'UNESCO l'a inscrit au patrimoine immatériel de l'humanité."),
        ("Que représente le repas autour d'une table selon le texte ?", ["Une obligation pénible", "Un art de vivre et un moment de partage", "Une perte de temps", "Un examen"], 1, "C'est un art de vivre qui renforce les liens d'amitié.")
    ],
    [
        ("Le cassoulet est traditionnellement préparé dans le Sud-Ouest.", ["Vrai", "Faux"], 0, "Vrai. Le texte associe le cassoulet au Sud-Ouest."),
        ("La Normandie est réputée pour ses vergers de pommes.", ["Vrai", "Faux"], 0, "Vrai. Ses vergers fournissent des pommes pour le cidre."),
        ("Le repas à la française doit être expédié en dix minutes.", ["Vrai", "Faux"], 1, "Faux. On passe de longues heures conviviales à table."),
        ("L'UNESCO a classé le repas français au patrimoine immatériel.", ["Vrai", "Faux"], 0, "Vrai. Il est inscrit au patrimoine immatériel."),
        ("Chaque région française possède les mêmes recettes sans aucune variation.", ["Vrai", "Faux"], 1, "Faux. Chaque province a des traditions distinctes.")
    ]
))

passages.append(make_passage(
    "Les châteaux de la Loire et la Renaissance (Châteaux of the Loire)", "A2", "fr",
    "S'étendant le long du plus long fleuve de France, la vallée de la Loire abrite une concentration monumentale unique de châteaux royaux édifiés principalement pendant la Renaissance. Aux quinzième et seizième siècles, les souverains français et les grands seigneurs de la cour délaissèrent la capitale pour s'installer dans cette contrée paisible et tempérée que l'on surnommait volontiers le 'Jardin de la France'. Inspirés par les chefs-d'œuvre de la Renaissance italienne, les architectes transformèrent les anciennes forteresses militaires médiévales en résidences de plaisance luxueuses et lumineuses. Le château de Chambord, imaginé sous le règne du roi François Ier, impressionne par sa silhouette monumentale flanquée de tours massives et son célèbre escalier à double révolution que la tradition attribue à l'ingénieux Léonard de Vinci. Un peu plus loin, le château de Chenonceau enjambe gracieusement les eaux calmes du Cher avec sa célèbre galerie à arcades, témoignant du rôle déterminant joué par de grandes figures féminines comme Diane de Poitiers et Catherine de Médicis. Les jardins à la française qui entourent ces demeures somptueuses illustrent la maîtrise parfaite de la géométrie végétale avec leurs parterres fleuris, leurs bassins symétriques et leurs allées ombragées. Découvrir la vallée de la Loire permet de voyager dans le temps et de contempler l'harmonie parfaite entre l'art humain et le paysage fluvial.",
    {"fleuve": "river", "édifiés": "built / erected", "souverains": "monarchs / sovereigns", "forteresses": "fortresses", "plaisance": "leisure / pleasure", "escalier": "staircase", "double révolution": "double helix", "enjambe": "spans / strides across", "arcades": "arches", "géométrie": "geometry", "symétriques": "symmetrical", "fluvial": "river-related"},
    [
        ("Le long de quel fleuve ces célèbres châteaux sont-ils bâtis ?", ["Le Rhône", "La Loire", "La Seine", "La Garonne"], 1, "Ils sont édifiés le long du fleuve de la Loire."),
        ("À quelle époque historique majeure ces résidences ont-elles fleuri ?", ["À l'époque gallo-romaine", "Pendant la Renaissance", "Au dix-neuvième siècle", "Pendant la Révolution"], 1, "Ils ont été construits principalement à la Renaissance."),
        ("Quel roi a commandé la construction du château de Chambord ?", ["Louis XIV", "François Ier", "Henri IV", "Napoléon"], 1, "Il fut imaginé sous le règne de François Ier."),
        ("À quel génie de la Renaissance attribue-t-on l'escalier à double révolution ?", ["Michel-Ange", "Léonard de Vinci", "Raphaël", "Botticelli"], 1, "La tradition l'attribue à Léonard de Vinci."),
        ("Quelle rivière le château de Chenonceau enjambe-t-il ?", ["Le Rhin", "Le Cher", "La Marne", "La Dordogne"], 1, "Chenonceau enjambe les eaux calmes du Cher.")
    ],
    [
        ("La vallée de la Loire était surnommée le Jardin de la France.", ["Vrai", "Faux"], 0, "Vrai. Cette contrée tempérée portait ce surnom."),
        ("Les châteaux de la Renaissance sont de sombres prisons militaires.", ["Vrai", "Faux"], 1, "Faux. Ce sont des résidences de plaisance lumineuses."),
        ("L'escalier de Chambord permet à deux personnes de monter sans se croiser.", ["Vrai", "Faux"], 0, "Vrai. C'est le principe du double escalier en spirale."),
        ("Des femmes d'influence ont marqué l'histoire de Chenonceau.", ["Vrai", "Faux"], 0, "Vrai. Le texte cite Diane de Poitiers et Catherine de Médicis."),
        ("Les jardins entourant les châteaux sont laissés à l'état de forêt sauvage.", ["Vrai", "Faux"], 1, "Faux. Ce sont des jardins géométriques taillés avec soin.")
    ]
))

passages.append(make_passage(
    "Le système du TGV et la mobilité rapide (The TGV High-Speed Train)", "A2", "fr",
    "Inauguré au début des années 1980 avec la liaison historique entre Paris et Lyon, le Train à Grande Vitesse, mondialement connu sous le sigle TGV, a révolutionné les déplacements terrestres en France et en Europe occidentale. Roulant à des vitesses commerciales atteignant plus de trois cents kilomètres à l'heure sur des voies ferrées spécialement conçues, ce fleuron de l'ingénierie ferroviaire française a considérablement raccourci les distances géographiques entre les grandes métropoles. Voyager de la capitale jusqu'à Marseille ou Bordeaux ne prend aujourd'hui que deux ou trois heures, rendant le train bien plus compétitif et pratique que l'avion de ligne pour de nombreux trajets professionnels ou touristiques. Contrairement aux aéroports souvent excentrés, les gares TGV se trouvent au cœur même des centres urbains, ce qui fait gagner un temps précieux aux passagers et facilite les correspondances directes avec les réseaux de métro et d'autobus locaux. De surcroît, le train constitue une alternative écologique remarquable dans le contexte de la transition énergétique: alimenté par une électricité majoritairement décarbonée, il émet jusqu'à cinquante fois moins de gaz à effet de serre par voyageur qu'un vol intérieur équivalent. Des millions d'usagers choisissent ainsi chaque semaine ce mode de transport rapide, ponctuel et reposant qui combine confort moderne et respect scrupuleux de l'environnement.",
    {"inauguré": "inaugurated", "sigle": "acronym", "vitesse": "speed", "fleuron": "flagship / jewel", "ingénierie": "engineering", "raccourci": "shortened", "compétitif": "competitive", "excentrés": "remote / outlying", "correspondances": "connections", "décarbonée": "decarbonized", "gaz à effet de serre": "greenhouse gases", "ponctuel": "punctual"},
    [
        ("Quand le TGV a-t-il été inauguré en France ?", ["Dans les années 1950", "Au début des années 1980", "En 2015", "Il y a un siècle"], 1, "Il fut inauguré au début des années 1980."),
        ("À quelle vitesse commerciale le TGV peut-il circuler ?", ["Cinquante km/h", "Cent km/h", "Plus de trois cents km/h", "Mille km/h"], 2, "Il roule à plus de 300 km/h sur des voies dédiées."),
        ("Combien de temps faut-il environ pour relier Paris à Marseille ou Bordeaux ?", ["Dix heures", "Deux à trois heures", "Une journée entière", "Trente minutes"], 1, "Le trajet prend seulement deux à trois heures."),
        ("Où se situent généralement les gares TGV ?", ["À la campagne", "Au cœur des centres urbains", "Sur des îles isolées", "Dans des ports"], 1, "Elles sont implantées au centre des villes."),
        ("Quel atout environnemental le TGV possède-t-il face à l'avion ?", ["Il ne pollue jamais", "Il émet jusqu'à cinquante fois moins de gaz à effet de serre", "Il nettoie l'air", "Il utilise de l'essence"], 1, "Il émet jusqu'à 50 fois moins de gaz à effet de serre.")
    ],
    [
        ("La première liaison de TGV reliait Paris à Lyon.", ["Vrai", "Faux"], 0, "Vrai. C'était la ligne historique inaugurale."),
        ("Le TGV circule sur des voies ordinaires sans aucun aménagement.", ["Vrai", "Faux"], 1, "Faux. Il roule sur des lignes à grande vitesse conçues pour lui."),
        ("L'avion est toujours plus rapide que le TGV pour les trajets de centre à centre.", ["Vrai", "Faux"], 1, "Faux. L'accès direct aux gares centrales rend le train plus pratique."),
        ("Le TGV fonctionne à l'énergie électrique.", ["Vrai", "Faux"], 0, "Vrai. Il est alimenté par de l'électricité."),
        ("Le train participe activement à la transition énergétique.", ["Vrai", "Faux"], 0, "Vrai. C'est une solution écologique majeure face aux émissions de CO2.")
    ]
))

passages.append(make_passage(
    "La Fête de la musique le 21 juin (World Music Day)", "A2", "fr",
    "Chaque année, le vingt et un juin, jour marquant le solstice d'été et la nuit la plus courte de l'année, la France entière vibre au rythme de la Fête de la musique. Créé en 1982 sous l'impulsion du ministère de la Culture, cet événement populaire et démocratique repose sur un concept d'une grande simplicité: inviter tous les musiciens, qu'ils soient amateurs passionnés ou artistes professionnels chevronnés, à descendre spontanément dans les rues pour jouer de la musique gratuitement devant le public. Dès la fin de l'après-midi, les places publiques, les parcs municipaux, les trottoirs, les terrasses de cafés et même les cours intérieures d'immeubles se métamorphosent en scènes de concert improvisées. Tous les genres musicaux sont célébrés sans distinction ni hiérarchie: du rock électrisant, du jazz feutré, de la musique classique symphonique, des chansons françaises traditionnelles, des rythmes électro entraînants et des percussions afro-caribéennes résonnent dans chaque quartier. Des foules joyeuses de toutes générations se promènent dans les villes pour écouter les groupes, chanter à tue-tête et danser jusqu'au milieu de la nuit dans une ambiance chaleureuse et bon enfant. Cet événement gratuit a rencontré un succès planétaire si éclatant qu'il est désormais célébré dans plus de cent vingt pays à travers les cinq continents.",
    {"solstice": "solstice", "impulsion": "impetus / initiative", "amateurs": "amateurs", "chevronnés": "experienced / seasoned", "spontanément": "spontaneously", "trottoirs": "sidewalks", "improvisées": "improvised", "feutré": "muffled / smooth", "percussions": "percussion", "chaleureuse": "warm / cordial", "planétaire": "planetary / worldwide", "succès": "success"},
    [
        ("À quelle date se déroule la Fête de la musique en France ?", ["Le premier janvier", "Le quatorze juillet", "Le vingt et un juin", "Le trente et un octobre"], 2, "Elle a lieu le 21 juin, lors du solstice d'été."),
        ("En quelle année cet événement a-t-il été créé ?", ["En 1900", "En 1982", "En 2010", "Au Moyen Âge"], 1, "Elle fut créée en 1982 par le ministère de la Culture."),
        ("Qui a le droit de jouer dans la rue pendant cette fête ?", ["Uniquement les musiciens professionnels", "Tous les musiciens, amateurs comme professionnels", "Seulement les chanteurs d'opéra", "Uniquement les enfants"], 1, "Tous les musiciens sont invités à se produire gratuitement."),
        ("Quel type de musique est joué lors de cette journée ?", ["Seulement du violon", "Tous les genres musicaux sans exception", "Uniquement de la musique militaire", "Rien du tout"], 1, "Tous les styles sont représentés: rock, jazz, classique, électro."),
        ("Dans combien de pays cette fête est-elle désormais célébrée ?", ["Dans deux pays", "Dans dix pays", "Dans plus de cent vingt pays", "Seulement en France"], 2, "Elle est célébrée dans plus de 120 pays à travers le monde.")
    ],
    [
        ("La Fête de la musique coïncide avec le solstice d'été.", ["Vrai", "Faux"], 0, "Vrai. Elle a lieu le jour du solstice d'été."),
        ("Tous les concerts dans les rues sont strictement payants.", ["Vrai", "Faux"], 1, "Faux. Les concerts de rue sont entièrement gratuits."),
        ("Les concerts se déroulent uniquement dans des salles fermées.", ["Vrai", "Faux"], 1, "Faux. Ils ont lieu dans les rues, places et parcs publics."),
        ("Des personnes de tous les âges participent à cette fête.", ["Vrai", "Faux"], 0, "Vrai. Des foules de toutes les générations se réunissent."),
        ("Le concept de la fête s'est exporté avec succès à l'étranger.", ["Vrai", "Faux"], 0, "Vrai. Plus de 120 pays l'ont adoptée à leur tour.")
    ]
))

passages.append(make_passage(
    "La vie dans un village des Alpes (Alpine Village Life)", "A2", "fr",
    "Niché au creux d'une vallée verdoyante de Savoie, le village de Beaufort vit au rythme apaisant des saisons de montagne. Loin de l'agitation des stations de ski ultramodernes, cette petite commune alpine a su préserver son authenticité rurale, son patrimoine architectural avec ses chalets en bois de mélèze et son savoir-faire agricole traditionnel. Ici, l'économie locale repose principalement sur l'élevage des vaches laitières de races Tarine et Abondance, dont le lait riche et parfumé permet de fabriquer le célèbre fromage d'alpage AOP: le Beaufort, surnommé avec fierté le 'prince des gruyères'. Durant les mois d'été, les éleveurs montent avec leurs troupeaux dans les hauts pâturages ensoleillés lors de la traditionnelle montée à l'alpage, où les bêtes se nourrissent d'herbe fraîche et de fleurs alpines aromatiques. En hiver, les toits pentus des maisons se recouvrent d'un épais manteau de neige blanche, transformant le paysage en un décor de carte postale féerique. Les habitants se rassemblent régulièrement dans la salle communale pour partager des repas montagnards réconfortants, comme une fondue savoyarde ou une tartiflette fumante. Malgré l'isolement relatif et les rigueurs du climat montagnard, la solidarité entre voisins est très forte et la fierté d'appartenir à cette terre de caractère se transmet intacte aux jeunes générations.",
    {"niché": "nestled", "apaisant": "soothing / calming", "commune": "municipality / village", "mélèze": "larch wood", "troupeaux": "herds", "alpage": "alpine pasture", "nourrissent": "feed / nourish", "pentus": "steep", "manteau": "blanket / coat (of snow)", "féerique": "magical / fairy-tale", "réconfortants": "comforting", "solidarité": "solidarity"},
    [
        ("Dans quelle région française le village de Beaufort se trouve-t-il ?", ["En Normandie", "En Savoie, dans les Alpes", "En Bretagne", "En Alsace"], 1, "Il est situé dans une vallée alpine de Savoie."),
        ("Quel produit gastronomique réputé fabrique-t-on dans ce village ?", ["Le vin de Bordeaux", "Le fromage d'alpage Beaufort", "Le nougat", "Le foie gras"], 1, "On y fabrique le fromage AOP Beaufort."),
        ("Où vont les vaches pendant les mois d'été ?", ["À l'étable fermée", "Dans les hauts pâturages en alpage", "En bord de mer", "Dans les forêts sombres"], 1, "Elles montent pâturer dans les alpages d'altitude."),
        ("Quels plats traditionnels réconfortants mange-t-on en hiver ?", ["Des glaces", "La fondue savoyarde et la tartiflette", "Des salades de riz", "Des sushis"], 1, "On partage des fondues savoyardes et des tartiflettes."),
        ("Quelle valeur humaine est particulièrement forte entre les villageois ?", ["La rivalité", "La solidarité entre voisins", "La solitude", "L'indifférence"], 1, "La solidarité et l'entraide sont très fortes.")
    ],
    [
        ("Beaufort est une station de ski bruyante et ultramoderne.", ["Vrai", "Faux"], 1, "Faux. Le village a su préserver son authenticité rurale."),
        ("Les chalets traditionnels sont construits en bois de mélèze.", ["Vrai", "Faux"], 0, "Vrai. Le bois de mélèze est typique de l'architecture locale."),
        ("Le fromage de Beaufort est surnommé le prince des gruyères.", ["Vrai", "Faux"], 0, "Vrai. C'est le surnom honorifique de ce fromage."),
        ("En hiver, les toits du village se couvrent de neige.", ["Vrai", "Faux"], 0, "Vrai. Un épais manteau de neige recouvre les chalets."),
        ("Les jeunes générations rejettent totalement les traditions de montagne.", ["Vrai", "Faux"], 1, "Faux. La fierté de leur terroir se transmet intacte aux jeunes.")
    ]
))

# Save first 10 French passages test
print(f"French passages so far: {len(passages)}")

