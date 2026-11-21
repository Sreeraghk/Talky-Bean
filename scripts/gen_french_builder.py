# -*- coding: utf-8 -*-
import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__))))
from reading_builder_helper import save_typescript_file

# We will generate French passages programmatically with rich authentic texts and questions
passages = []

topics_fr = [
    # A1
    ("Une journée à Paris", "A Day in Paris", "A1",
     "Je m'appelle Antoine et j'habite dans un petit appartement calme à Paris. Chaque matin, je me réveille à sept heures précises. Je commence ma journée par une bonne douche chaude, puis je vais dans la cuisine. Je prépare un grand bol de café au lait et je mange deux croissants frais avec du beurre doux et de la confiture d'abricot. À huit heures, je quitte mon logement et je marche cinq minutes jusqu'à la station de métro. Je prends la ligne quatre pour aller au travail. Je travaille comme assistant dans une librairie ancienne située près de la Seine. La boutique ouvre à neuf heures du matin. J'aime beaucoup ranger les beaux livres et conseiller les clients sympathiques qui cherchent des romans passionnants. À midi, je mange une salade verte et un sandwich au fromage dans un petit square ensoleillé avec mes collègues. L'après-midi passe très vite car il y a toujours beaucoup de travail. À dix-huit heures, la librairie ferme ses portes et je rentre chez moi à pied. Le soir, je cuisine un repas léger, j'écoute de la musique classique et je lis un chapitre avant de dormir. J'adore ma vie à Paris.",
     {"appartement": "apartment", "réveille": "wake up", "croissants": "croissants", "confiture": "jam", "logement": "housing", "librairie": "bookshop", "conseiller": "to advise", "square": "small park", "sandwich": "sandwich", "repas": "meal", "musique": "music", "chapitre": "chapter"},
     [
         ("À quelle heure Antoine se réveille-t-il ?", ["À six heures", "À sept heures", "À huit heures", "À neuf heures"], 1, "Le texte indique qu'il se réveille à sept heures."),
         ("Que mange Antoine au petit-déjeuner ?", ["Des céréales", "Deux croissants avec beurre et confiture", "Des œufs", "Des fruits"], 1, "Il mange deux croissants frais avec du beurre et de la confiture."),
         ("Quel moyen de transport utilise-t-il ?", ["Le vélo", "La voiture", "Le métro", "Le bus"], 2, "Il prend la ligne quatre du métro."),
         ("Quel est son travail ?", ["Cuisinier", "Assistant dans une librairie ancienne", "Médecin", "Professeur"], 1, "Il travaille comme assistant dans une librairie ancienne."),
         ("Que fait-il le soir avant de dormir ?", ["Il regarde la télévision", "Il fait du sport", "Il lit un chapitre de livre", "Il joue aux jeux vidéo"], 2, "Le texte mentionne qu'il lit un chapitre avant de dormir.")
     ],
     [
         ("Antoine habite à Paris.", ["Vrai", "Faux"], 0, "Vrai. Le texte débute par 'j'habite dans un petit appartement calme à Paris'."),
         ("La librairie est située près de la mer.", ["Vrai", "Faux"], 1, "Faux. Elle est située près de la Seine."),
         ("Antoine déjeune seul dans la boutique.", ["Vrai", "Faux"], 1, "Faux. Il mange avec ses collègues dans un square."),
         ("La librairie ferme ses portes à dix-huit heures.", ["Vrai", "Faux"], 0, "Vrai. Elle ferme à dix-huit heures."),
         ("Antoine rentre chez lui en taxi.", ["Vrai", "Faux"], 1, "Faux. Il rentre chez lui à pied.")
     ]),

    ("Le marché de Provence", "The Provençal Market", "A1",
     "Tous les samedis matin, le village d'Aix-en-Provence s'anime grâce à son magnifique marché traditionnel en plein air. C'est l'endroit idéal pour découvrir les délicieuses spécialités de la région. Les étals colorés des producteurs locaux remplissent les petites ruelles historiques et la place de l'hôtel de ville. On y trouve une incroyable variété de fruits mûrs comme des pêches juteuses, des melons parfumés de Cavaillon et des raisins sucrés. Les maraîchers proposent aussi des légumes frais: des tomates rouges, des courgettes, des aubergines et des poivrons pour préparer une véritable ratatouille provençale. Un peu plus loin, l'odeur merveilleuse des herbes de Provence, du thym et de la lavande attire de nombreux visiteurs curieux. Je m'arrête toujours chez le fromager pour acheter un fromage de chèvre crémeux et quelques olives noires marinées à l'huile d'olive. Les marchands sont toujours souriants et aiment discuter chaleureusement avec les clients fidèles. Avant de rentrer à la maison, j'achète un joli bouquet de fleurs sauvages pour décorer la table du salon. Faire les courses au marché le samedi est un plaisir simple et authentique qui rend le week-end très agréable pour tous les habitants du village.",
     {"marché": "market", "étals": "stalls", "producteurs": "producers", "ruelles": "alleys", "pêches": "peaches", "melons": "melons", "légumes": "vegetables", "lavande": "lavender", "chèvre": "goat cheese", "olives": "olives", "bouquet": "bouquet", "plaisir": "pleasure"},
     [
         ("Quel jour a lieu le marché traditionnel ?", ["Le lundi", "Le samedi matin", "Le mercredi", "Le dimanche soir"], 1, "Le marché a lieu tous les samedis matin."),
         ("Quels fruits sont mentionnés dans le texte ?", ["Des bananes", "Des pêches, des melons et des raisins", "Des ananas", "Des pommes vertes"], 1, "Le texte mentionne des pêches juteuses, des melons et des raisins."),
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
     ]),

    ("Un week-end en Bretagne", "A Weekend in Brittany", "A1",
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
     ]),

    ("Ma passion pour la pâtisserie", "My Passion for Baking", "A1",
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
     ]),

    ("Le vélo en ville", "Cycling in the City", "A1",
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
     ])
]

print("Loaded 5 French A1 passages. Adding A2, B1, B2, C1...")
