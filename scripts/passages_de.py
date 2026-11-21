# -*- coding: utf-8 -*-
# German Passages (de): A1, A2, B1, B2, C1 (5 passages per level = 25 total)

passages = [
    # ------------------ A1 (150-220 words) ------------------
    {
        "title": "Mein Tag in München (My Day in Munich)",
        "level": "A1",
        "language": "de",
        "text": "Ich heiße Lukas und wohne seit zwei Jahren in München. Jeden Morgen stehe ich pünktlich um sieben Uhr auf. Zuerst trinke ich eine große Tasse heißen Kaffee und esse zwei Scheiben frisches Brot mit Butter und Erdbeermarmelade. Danach ziehe ich mich an und packe meine Tasche. Um acht Uhr verlasse ich die Wohnung und gehe zur U-Bahn-Station. Ich fahre mit der U-Bahn direkt ins Zentrum zur Universität. Dort studiere ich Informatik und treffe viele nette Menschen. Die erste Vorlesung beginnt um halb neun und ist sehr interessant. Um zwölf Uhr treffe ich meine Freunde in der Mensa. Wir essen zusammen Pizza oder frischen Salat und trinken kaltes Wasser. Nach dem Mittagessen lerne ich zwei Stunden ruhig in der Bibliothek. Am Nachmittag fahre ich mit dem Fahrrad durch den Englischen Garten, wenn das Wetter schön ist. Am Abend koche ich mit meiner Freundin Gemüse und Reis. Um dreiundzwanzig Uhr gehe ich müde ins Bett und schlafe schnell ein. Es ist ein aktiver und schöner Tag.",
        "vocabularyHints": {
            "wohne": "live / reside",
            "pünktlich": "punctual",
            "frisches": "fresh",
            "marmelade": "jam",
            "station": "station",
            "vorlesung": "lecture",
            "mensa": "cafeteria",
            "bibliothek": "library",
            "garten": "garden",
            "gemüse": "vegetables",
            "müde": "tired",
            "aktiv": "active"
        },
        "mcqQuestions": [
            {"question": "Wann steht Lukas jeden Morgen auf?", "options": ["Um sechs Uhr", "Um sieben Uhr", "Um acht Uhr", "Um neun Uhr"], "correctAnswerIndex": 1, "explanation": "Im Text steht: 'Jeden Morgen stehe ich pünktlich um sieben Uhr auf.'"},
            {"question": "Was frühstückt Lukas?", "options": ["Müsli", "Brot mit Butter und Marmelade", "Ein Ei", "Nur Obst"], "correctAnswerIndex": 1, "explanation": "Er isst zwei Scheiben frisches Brot mit Butter und Erdbeermarmelade."},
            {"question": "Wie kommt Lukas zur Universität?", "options": ["Mit dem Bus", "Mit dem Auto", "Mit der U-Bahn", "Zu Fuß"], "correctAnswerIndex": 2, "explanation": "Er fährt mit der U-Bahn direkt ins Zentrum."},
            {"question": "Was studiert Lukas?", "options": ["Medizin", "Informatik", "Geschichte", "Jura"], "correctAnswerIndex": 1, "explanation": "Der Text sagt: 'Dort studiere ich Informatik.'"},
            {"question": "Wo verbringt Lukas den Nachmittag bei schönem Wetter?", "options": ["Im Einkaufszentrum", "Im Englischen Garten", "Im Schwimmbad", "Im Kino"], "correctAnswerIndex": 1, "explanation": "Er fährt mit dem Fahrrad durch den Englischen Garten."}
        ],
        "tfQuestions": [
            {"question": "Lukas wohnt seit zwei Jahren in München.", "options": ["Richtig", "Falsch"], "correctAnswerIndex": 0, "explanation": "Richtig. 'Ich heiße Lukas und wohne seit zwei Jahren in München.'"},
            {"question": "Lukas isst in der Mensa immer allein.", "options": ["Richtig", "Falsch"], "correctAnswerIndex": 1, "explanation": "Falsch. Er trifft seine Freunde in der Mensa."},
            {"question": "Nach dem Essen lernt er in der Bibliothek.", "options": ["Richtig", "Falsch"], "correctAnswerIndex": 0, "explanation": "Richtig. 'Nach dem Mittagessen lerne ich zwei Stunden ruhig in der Bibliothek.'"},
            {"question": "Am Abend kocht er gemeinsam mit seiner Freundin.", "options": ["Richtig", "Falsch"], "correctAnswerIndex": 0, "explanation": "Richtig. 'Am Abend koche ich mit meiner Freundin Gemüse und Reis.'"},
            {"question": "Lukas geht um Mitternacht schlafen.", "options": ["Richtig", "Falsch"], "correctAnswerIndex": 1, "explanation": "Falsch. Er geht um dreiundzwanzig Uhr ins Bett."}
        ]
    },
    {
        "title": "Meine Familie und unser Zuhause (My Family and Our Home)",
        "level": "A1",
        "language": "de",
        "text": "Mein Name ist Julia. Ich bin fünfundzwanzig Jahre alt und wohne in einem kleinen gemütlichen Haus in Hamburg. Das Haus hat einen schönen Garten mit vielen bunten Blumen und zwei alten Bäumen. Meine Familie ist sehr herzlich und wir verbringen viel Zeit zusammen. Mein Vater heißt Markus und arbeitet als Lehrer an einer großen Grundschule. Meine Mutter Susanne arbeitet in einer bekannten Buchhandlung in der Innenstadt. Ich habe auch einen jüngeren Bruder. Er heißt Felix, ist neunzehn Jahre alt und macht eine Ausbildung zum Koch in einem Restaurant. Wir haben auch ein Haustier: einen freundlichen braunen Hund namens Bruno. Am Samstag frühstücken wir alle gemeinsam in der hellen Küche. Es gibt warmen Tee, frischen Orangensaft, knusprige Brötchen, Käse und gekochte Eier. Danach machen wir oft einen langen Spaziergang an der Elbe. Meine Großeltern wohnen in der Nähe und besuchen uns sonntags zum Mittagessen. Meine Mutter kocht dann immer eine köstliche Gemüsesuppe. Ich liebe meine Familie und unser ruhiges Zuhause sehr.",
        "vocabularyHints": {
            "zuhause": "home",
            "blumen": "flowers",
            "bäumen": "trees",
            "herzlich": "warm / loving",
            "grundschule": "primary school",
            "buchhandlung": "bookshop",
            "ausbildung": "apprenticeship",
            "brötchen": "rolls",
            "spaziergang": "walk",
            "haustier": "pet",
            "köstliche": "delicious",
            "suppe": "soup"
        },
        "mcqQuestions": [
            {"question": "In welcher Stadt lebt Julia?", "options": ["Köln", "Hamburg", "Bremen", "Frankfurt"], "correctAnswerIndex": 1, "explanation": "Julia wohnt in einem Haus in Hamburg."},
            {"question": "Was ist der Beruf von Julias Vater?", "options": ["Arzt", "Koch", "Lehrer", "Gärtner"], "correctAnswerIndex": 2, "explanation": "Ihr Vater arbeitet als Lehrer an einer Grundschule."},
            {"question": "Welches Tier gehört zur Familie?", "options": ["Eine weiße Katze", "Ein brauner Hund", "Ein Papagei", "Ein Pferd"], "correctAnswerIndex": 1, "explanation": "Die Familie hat einen braunen Hund namens Bruno."},
            {"question": "Was lernt Julias Bruder Felix beruflich?", "options": ["Mechaniker", "Koch", "Bäcker", "Kellner"], "correctAnswerIndex": 1, "explanation": "Felix macht eine Ausbildung zum Koch."},
            {"question": "Wohin geht die Familie nach dem Samstagsfrühstück?", "options": ["Ins Einkaufszentrum", "An die Elbe zum Spaziergang", "In den Zoo", "Ins Stadion"], "correctAnswerIndex": 1, "explanation": "Sie machen einen langen Spaziergang an der Elbe."}
        ],
        "tfQuestions": [
            {"question": "Julias Haus hat einen Garten mit Bäumen und Blumen.", "options": ["Richtig", "Falsch"], "correctAnswerIndex": 0, "explanation": "Richtig. 'Das Haus hat einen schönen Garten mit vielen bunten Blumen...'"},
            {"question": "Julias Mutter arbeitet im Krankenhaus.", "options": ["Richtig", "Falsch"], "correctAnswerIndex": 1, "explanation": "Falsch. Sie arbeitet in einer Buchhandlung."},
            {"question": "Felix ist älter als Julia.", "options": ["Richtig", "Falsch"], "correctAnswerIndex": 1, "explanation": "Falsch. Felix ist Julias jüngerer Bruder."},
            {"question": "Die Großeltern kommen sonntags zu Besuch.", "options": ["Richtig", "Falsch"], "correctAnswerIndex": 0, "explanation": "Richtig. Die Großeltern besuchen sie sonntags zum Mittagessen."},
            {"question": "Am Samstagfrühstück gibt es Brötchen und Orangensaft.", "options": ["Richtig", "Falsch"], "correctAnswerIndex": 0, "explanation": "Richtig. Es gibt knusprige Brötchen, Käse, Eier und Orangensaft."}
        ]
    },
    {
        "title": "Auf dem Wochenmarkt (At the Weekly Market)",
        "level": "A1",
        "language": "de",
        "text": "Jeden Samstagmorgen besuche ich den traditionellen Wochenmarkt auf dem großen Marktplatz. Es ist mein Lieblingstag in der Woche, weil die Atmosphäre dort immer lebendig, freundlich und bunt ist. Viele Bauern aus den umliegenden Dörfern verkaufen ihr frisches Obst und Gemüse. Ich nehme immer einen großen Stoffbeutel und einen Korb mit. Zuerst gehe ich zum Gemüsestand von Herrn Weber. Ich kaufe zwei Kilo rote Äpfel, süße Karotten, eine Gurke und reife Tomaten für einen Salat. Danach gehe ich zum Käsestand. Die freundliche Verkäuferin lässt mich ein kleines Stück Schweizer Bergkäse probieren. Er schmeckt hervorragend und würzig, also kaufe ich dreihundert Gramm. Nebenan duftet es wunderbar nach frischem Backwerk. Der Bäcker verkauft warmes Roggenbrot und kleine süße Zimtschnecken. Ich nehme ein halbes Brot und zwei Schnecken für den Nachmittag mit nach Hause. An einem bunten Blumenstand kaufe ich noch frische gelbe Tulpen für das Wohnzimmer. Das Einkaufen auf dem Markt dauert ungefähr eine Stunde. Am Ende trinke ich einen heißen Espresso im kleinen Café am Eck.",
        "vocabularyHints": {
            "wochenmarkt": "weekly market",
            "lebendig": "lively",
            "bauern": "farmers",
            "stoffbeutel": "cloth bag",
            "karotten": "carrots",
            "gurke": "cucumber",
            "käsestand": "cheese stall",
            "probieren": "to taste",
            "würzig": "savory / aromatic",
            "roggenbrot": "rye bread",
            "zimtschnecken": "cinnamon rolls",
            "tulpen": "tulips"
        },
        "mcqQuestions": [
            {"question": "Wann geht die Person auf den Wochenmarkt?", "options": ["Freitags", "Samstags", "Sonntags", "Dienstags"], "correctAnswerIndex": 1, "explanation": "Im Text steht: 'Jeden Samstagmorgen besuche ich den traditionellen Wochenmarkt...'"},
            {"question": "Was kauft die Person am Gemüsestand?", "options": ["Kartoffeln und Kohl", "Äpfel, Karotten, Gurke und Tomaten", "Nur Zwiebeln", "Bananen und Birnen"], "correctAnswerIndex": 1, "explanation": "Sie kauft Äpfel, Karotten, eine Gurke und Tomaten."},
            {"question": "Was für einen Käse probiert die Person?", "options": ["Holländischen Gouda", "Schweizer Bergkäse", "Französischen Weichkäse", "Schafskäse"], "correctAnswerIndex": 1, "explanation": "Die Verkäuferin lässt sie Schweizer Bergkäse probieren."},
            {"question": "Was nimmt die Person beim Bäcker mit?", "options": ["Nur Brötchen", "Brot und zwei Zimtschnecken", "Einen Schokokuchen", "Eine Brezel"], "correctAnswerIndex": 1, "explanation": "Sie nimmt ein halbes Brot und zwei Zimtschnecken mit."},
            {"question": "Welche Blumen werden gekauft?", "options": ["Rote Rosen", "Gelbe Tulpen", "Weiße Lilien", "Sonnenblumen"], "correctAnswerIndex": 1, "explanation": "Die Person kauft gelbe Tulpen für das Wohnzimmer."}
        ],
        "tfQuestions": [
            {"question": "Die Bauern kommen aus umliegenden Dörfern.", "options": ["Richtig", "Falsch"], "correctAnswerIndex": 0, "explanation": "Richtig. 'Viele Bauern aus den umliegenden Dörfern verkaufen ihr frisches Obst...'"},
            {"question": "Die Person benutzt nur Einweg-Plastiktüten.", "options": ["Richtig", "Falsch"], "correctAnswerIndex": 1, "explanation": "Falsch. Sie nimmt einen großen Stoffbeutel und Korb mit."},
            {"question": "Der Bergkäse schmeckt würzig und gut.", "options": ["Richtig", "Falsch"], "correctAnswerIndex": 0, "explanation": "Richtig. 'Er schmeckt hervorragend und würzig...'"},
            {"question": "Der gesamte Einkauf dauert einen halben Tag.", "options": ["Richtig", "Falsch"], "correctAnswerIndex": 1, "explanation": "Falsch. Er dauert ungefähr eine Stunde."},
            {"question": "Am Ende trinkt die Person einen Espresso im Café.", "options": ["Richtig", "Falsch"], "correctAnswerIndex": 0, "explanation": "Richtig. 'Am Ende trinke ich einen heißen Espresso im kleinen Café am Eck.'"}
        ]
    },
    {
        "title": "Kochen mit Freunden (Cooking with Friends)",
        "level": "A1",
        "language": "de",
        "text": "Kochen ist mein liebstes Hobby. Am liebsten koche ich am Wochenende für meine guten Freunde Anna und David. Heute Abend machen wir zusammen ein klassisches italienisches Nudelgericht mit einer feinen Tomatensauce. Um siebzehn Uhr kommen die beiden pünktlich zu mir nach Hause. Anna bringt frisches Basilikum und aromatischen Knoblauch aus ihrem eigenen Garten mit. David hat eine Flasche Mineralwasser und gutes Olivenöl aus dem Supermarkt gekauft. Wir beginnen sofort mit den Vorbereitungen in der Küche. David schneidet die Zwiebeln und weint ein bisschen, weil sie so scharf sind. Anna und ich waschen die reifen roten Tomaten und schneiden sie sorgfältig in kleine Stücke. Dann braten wir den Knoblauch vorsichtig im heißen Öl an. Die Küche riecht schon nach wenigen Minuten herrlich. In einem großen Topf kochen wir das Wasser für die Nudeln mit etwas Meersalz. Nach zwanzig Minuten ist das leckere Essen fertig. Wir decken den Holztisch mit bunten Tellern und Gläsern. Wir essen gemeinsam, lachen viel und hören leise Klaviermusik. Zum Nachtisch gibt es cremiges Schokoladeneis.",
        "vocabularyHints": {
            "hobby": "hobby",
            "nudelgericht": "pasta dish",
            "tomatensauce": "tomato sauce",
            "basilikum": "basil",
            "knoblauch": "garlic",
            "zwiebeln": "onions",
            "schneiden": "to chop / slice",
            "braten": "to fry",
            "topf": "pot",
            "meersalz": "sea salt",
            "holztisch": "wooden table",
            "schokoladeneis": "chocolate ice cream"
        },
        "mcqQuestions": [
            {"question": "Was kochen die Freunde heute Abend?", "options": ["Pizza", "Ein italienisches Nudelgericht", "Eine Reispfanne", "Kartoffelpuffer"], "correctAnswerIndex": 1, "explanation": "Sie kochen ein italienisches Nudelgericht mit Tomatensauce."},
            {"question": "Was bringt Anna aus ihrem Garten mit?", "options": ["Karotten", "Basilikum und Knoblauch", "Kartoffeln", "Salat"], "correctAnswerIndex": 1, "explanation": "Anna bringt Basilikum und Knoblauch mit."},
            {"question": "Warum weint David bei der Vorbereitung?", "options": ["Er hat sich geschnitten", "Wegen der scharfen Zwiebeln", "Weil er traurig ist", "Wegen des heißen Öls"], "correctAnswerIndex": 1, "explanation": "David weint, weil die Zwiebeln so scharf sind."},
            {"question": "Wie lange dauert es, bis das Essen fertig ist?", "options": ["Zehn Minuten", "Zwanzig Minuten", "Eine Stunde", "Zwei Stunden"], "correctAnswerIndex": 1, "explanation": "Im Text steht: 'Nach zwanzig Minuten ist das leckere Essen fertig.'"},
            {"question": "Was gibt es als Nachtisch?", "options": ["Apfelkuchen", "Erdbeeren", "Cremiges Schokoladeneis", "Joghurt"], "correctAnswerIndex": 2, "explanation": "Zum Nachtisch gibt es cremiges Schokoladeneis."}
        ],
        "tfQuestions": [
            {"question": "Anna und David kommen um siebzehn Uhr an.", "options": ["Richtig", "Falsch"], "correctAnswerIndex": 0, "explanation": "Richtig. 'Um siebzehn Uhr kommen die beiden pünktlich...'"},
            {"question": "David hat Olivenöl und Wasser mitgebracht.", "options": ["Richtig", "Falsch"], "correctAnswerIndex": 0, "explanation": "Richtig. David kaufte Mineralwasser und Olivenöl."},
            {"question": "Die Freunde hören laute Partymusik beim Essen.", "options": ["Richtig", "Falsch"], "correctAnswerIndex": 1, "explanation": "Falsch. Sie hören leise Klaviermusik."},
            {"question": "Die Tomaten werden mit Knoblauch im Öl angebraten.", "options": ["Richtig", "Falsch"], "correctAnswerIndex": 0, "explanation": "Richtig. Sie braten den Knoblauch an und bereiten die Sauce zu."},
            {"question": "Kochen ist dem Erzähler sehr unangenehm.", "options": ["Richtig", "Falsch"], "correctAnswerIndex": 1, "explanation": "Falsch. Kochen ist sein liebstes Hobby."}
        ]
    },
    {
        "title": "Mein Wochenende in den Bergen (My Weekend in the Mountains)",
        "level": "A1",
        "language": "de",
        "text": "Letztes Wochenende bin ich mit dem Zug in die bayerischen Alpen gefahren. Die Fahrt von München dauerte nur eine knappe Stunde und war sehr bequem. Das Wetter war einfach perfekt: Der Himmel war strahlend blau und die warme Sonne schien den ganzen Tag. Ich habe in einer kleinen gemütlichen Berghütte aus Holz übernachtet. Am Samstagmorgen bin ich früh aufgewacht. Nach einem kräftigen Frühstück mit Bergkäse, Honig und Schwarzbrot habe ich meine festen Wanderschuhe angezogen und meinen Rucksack genommen. Ich bin auf einen hohen Berg gewandert. Der schmale Weg war manchmal steil und anstrengend, aber die weite Aussicht auf das grüne Tal war wunderschön. Unterwegs habe ich bunte Bergblumen fotografiert und dem Rauschen eines klaren Gebirgsbaches gelauscht. Auf dem Gipfel habe ich eine lange Rast gemacht, frisches Wasser getrunken und einen roten Apfel gegessen. Es war ganz friedlich da oben, nur der sanfte Wind war zu hören. Am späten Nachmittag bin ich langsam wieder hinuntergelaufen. Es war ein unvergessliches Naturerlebnis.",
        "vocabularyHints": {
            "alpen": "Alps",
            "bequem": "comfortable",
            "strahlend": "beaming / radiant",
            "berghütte": "mountain hut",
            "wanderschuhe": "hiking boots",
            "rucksack": "backpack",
            "steil": "steep",
            "aussicht": "view / panorama",
            "tal": "valley",
            "bach": "stream / creek",
            "gipfel": "peak / summit",
            "friedlich": "peaceful"
        },
        "mcqQuestions": [
            {"question": "Wie ist die Person in die Alpen gereist?", "options": ["Mit dem Auto", "Mit dem Zug", "Mit dem Bus", "Mit dem Flugzeug"], "correctAnswerIndex": 1, "explanation": "Im Text steht: '...bin ich mit dem Zug in die bayerischen Alpen gefahren.'"},
            {"question": "Wie war das Wetter in den Bergen?", "options": ["Regnerisch", "Bewölkt und kühl", "Strahlend blau und sonnig", "Sehr neblig"], "correctAnswerIndex": 2, "explanation": "Der Himmel war strahlend blau und die Sonne schien."},
            {"question": "Was aß die Person zum Frühstück?", "options": ["Müsli", "Bergkäse, Honig und Schwarzbrot", "Eier mit Schinken", "Croissants"], "correctAnswerIndex": 1, "explanation": "Sie frühstückte Bergkäse, Honig und Schwarzbrot."},
            {"question": "Was aß die Person auf dem Gipfel?", "options": ["Schokolade", "Ein Käsebrot", "Einen roten Apfel", "Kekse"], "correctAnswerIndex": 2, "explanation": "Auf dem Gipfel aß sie einen roten Apfel."},
            {"question": "Was war auf dem Gipfel zu hören?", "options": ["Laute Musik", "Nur der sanfte Wind", "Donner", "Autos"], "correctAnswerIndex": 1, "explanation": "Der Text sagt: '...nur der sanfte Wind war zu hören.'"}
        ],
        "tfQuestions": [
            {"question": "Die Zugfahrt dauerte ungefähr eine Stunde.", "options": ["Richtig", "Falsch"], "correctAnswerIndex": 0, "explanation": "Richtig. Die Fahrt dauerte nur eine knappe Stunde."},
            {"question": "Die Hütte war aus Beton und Glas gebaut.", "options": ["Richtig", "Falsch"], "correctAnswerIndex": 1, "explanation": "Falsch. Die Hütte war aus Holz gebaut."},
            {"question": "Der Wanderweg war stellenweise steil.", "options": ["Richtig", "Falsch"], "correctAnswerIndex": 0, "explanation": "Richtig. 'Der schmale Weg war manchmal steil und anstrengend...'"},
            {"question": "Unterwegs fotografierte die Person Blumen.", "options": ["Richtig", "Falsch"], "correctAnswerIndex": 0, "explanation": "Richtig. Sie fotografierte bunte Bergblumen."},
            {"question": "Die Person fuhr mit der Seilbahn nach unten.", "options": ["Richtig", "Falsch"], "correctAnswerIndex": 1, "explanation": "Falsch. Sie ist langsam wieder hinuntergelaufen."}
        ]
    }
]

# ------------------ A2 (200-260 words) ------------------
passages.extend([
    {
        "title": "Die neue Wohnung in Berlin (The New Apartment in Berlin)",
        "level": "A2",
        "language": "de",
        "text": "Vor zwei Monaten bin ich aus beruflichen Gründen von Frankfurt nach Berlin gezogen. Die Suche nach einer passenden Wohnung war eine große Herausforderung, weil der Wohnungsmarkt in der Hauptstadt sehr angespannt ist. Schließlich hatte ich Glück und habe eine helle Zweizimmerwohnung im lebendigen Stadtteil Prenzlauer Berg gefunden. Die Wohnung befindet sich im dritten Stock eines renovierten Altbaus mit hohen Decken und schönen Holzfußböden. Besonders gefällt mir der kleine Balkon mit Blick auf einen ruhigen grünen Innenhof. Dort frühstücke ich morgens gerne und trinke meinen Kaffee, während die Vögel zwitschern. Am letzten Wochenende haben mir zwei hilfsbereite Freunde beim Umzug geholfen. Wir haben schwere Kisten geschleppt, ein bequemes Sofa aufgebaut und die neue Küche eingerichtet. Meine neue Nachbarin, Frau Schmidt, ist eine ältere Dame, die schon seit vierzig Jahren in diesem Haus lebt. Sie hat uns am ersten Abend frischen Apfelkuchen vorbeigebracht und mich herzlich in der Hausgemeinschaft willkommen geheißen. Die Lage ist ideal für mich: Direkt um die Ecke gibt es einen Supermarkt, eine Bäckerei mit leckeren Brezeln und eine Straßenbahnhaltestelle. Mit der Straßenbahn brauche ich nur fünfzehn Minuten zu meinem Arbeitsplatz im Zentrum. Ich fühle mich hier bereits sehr wohl und freue mich auf mein neues Leben in Berlin.",
        "vocabularyHints": {
            "herausforderung": "challenge",
            "angespannt": "tight / strained",
            "altbau": "pre-war building",
            "holzfußböden": "wooden floors",
            "innenhof": "courtyard",
            "umzug": "move / relocation",
            "geschleppt": "dragged / hauled",
            "hausgemeinschaft": "building community",
            "straßenbahn": "tram",
            "lage": "location",
            "arbeitsplatz": "workplace",
            "wohl": "comfortable / well"
        },
        "mcqQuestions": [
            {"question": "Warum ist die Person nach Berlin gezogen?", "options": ["Wegen des Studiums", "Aus beruflichen Gründen", "Wegen der Familie", "Um Urlaub zu machen"], "correctAnswerIndex": 1, "explanation": "Sie zog 'aus beruflichen Gründen von Frankfurt nach Berlin'."},
            {"question": "In welchem Stadtteil liegt die neue Wohnung?", "options": ["Kreuzberg", "Mitte", "Prenzlauer Berg", "Charlottenburg"], "correctAnswerIndex": 2, "explanation": "Die Wohnung liegt im Stadtteil Prenzlauer Berg."},
            {"question": "Was brachte die Nachbarin Frau Schmidt am ersten Abend?", "options": ["Einen Blumenstrauß", "Frischen Apfelkuchen", "Eine Flasche Wein", "Eine Schüssel Suppe"], "correctAnswerIndex": 1, "explanation": "Frau Schmidt brachte 'frischen Apfelkuchen' vorbei."},
            {"question": "Wo frühstückt die Person morgens am liebsten?", "options": ["In der Küche", "Auf dem kleinen Balkon", "Im Café um die Ecke", "Im Bett"], "correctAnswerIndex": 1, "explanation": "Sie frühstückt gerne auf dem kleinen Balkon mit Blick auf den Innenhof."},
            {"question": "Wie lange dauert die Fahrt mit der Straßenbahn zur Arbeit?", "options": ["Fünf Minuten", "Fünfzehn Minuten", "Dreißig Minuten", "Eine Stunde"], "correctAnswerIndex": 1, "explanation": "Mit der Straßenbahn braucht sie nur fünfzehn Minuten."}
        ],
        "tfQuestions": [
            {"question": "Die Wohnungssuche in Berlin war sehr einfach und schnell.", "options": ["Richtig", "Falsch"], "correctAnswerIndex": 1, "explanation": "Falsch. Die Suche war eine große Herausforderung."},
            {"question": "Die Wohnung befindet sich im dritten Stock eines renovierten Altbaus.", "options": ["Richtig", "Falsch"], "correctAnswerIndex": 0, "explanation": "Richtig. 'Die Wohnung befindet sich im dritten Stock eines renovierten Altbaus...'"},
            {"question": "Frau Schmidt lebt erst seit einem Monat in dem Haus.", "options": ["Richtig", "Falsch"], "correctAnswerIndex": 1, "explanation": "Falsch. Sie lebt seit vierzig Jahren in dem Haus."},
            {"question": "In der Nähe der Wohnung gibt es eine Straßenbahnhaltestelle.", "options": ["Richtig", "Falsch"], "correctAnswerIndex": 0, "explanation": "Richtig. Es gibt eine Haltestelle direkt um die Ecke."},
            {"question": "Zwei Freunde haben beim Tragen der Kisten geholfen.", "options": ["Richtig", "Falsch"], "correctAnswerIndex": 0, "explanation": "Richtig. 'Zwei hilfsbereite Freunde haben mir beim Umzug geholfen.'"}
        ]
    },
    {
        "title": "Gesund leben und Wohlbefinden (Living Healthy and Well-being)",
        "level": "A2",
        "language": "de",
        "text": "Es ist heutzutage wichtiger denn je, bewusst und gesund zu leben, um körperlich und geistig fit zu bleiben. Vor einem Jahr habe ich beschlossen, meine täglichen Gewohnheiten grundlegend zu verändern. Früher habe ich mich oft schlapp und unkonzentriert gefühlt, weil ich zu viele Fertiggerichte gegessen und mich kaum bewegt habe. Heute versuche ich, mich jeden Tag mindestens dreißig Minuten aktiv an der frischen Luft zu bewegen. Morgens gehe ich regelmäßig joggen oder mache eine halbe Stunde Yoga im Wohnzimmer, bevor ich zur Arbeit fahre. Auch die richtige Ernährung spielt eine entscheidende Rolle für das Wohlbefinden. Ich koche mittlerweile fast jeden Abend selbst mit frischem saisonalem Gemüse, Vollkornprodukten und gesunden pflanzlichen Ölen. Statt zuckerhaltiger Limonade trinke ich tagsüber viel stilles Wasser und ungesüßten Kräutertee. Außerdem achte ich darauf, jede Nacht mindestens sieben bis acht Stunden ruhig zu schlafen, damit sich mein Körper erholen kann. Wenn ich bei der Arbeit gestresst bin, mache ich kurze Atemübungen, höre entspannende Klaviermusik oder lese abends ein Buch statt fernzusehen. Durch diese einfachen Veränderungen fühle ich mich viel energiegeladener, ausgeglichener und zufriedener im Alltag.",
        "vocabularyHints": {
            "bewusst": "consciously",
            "körperlich": "physically",
            "gewohnheiten": "habits",
            "fertiggerichte": "ready-made meals",
            "wohlbefinden": "well-being",
            "vollkornprodukte": "wholegrain products",
            "zuckerhaltig": "sugary",
            "kräutertee": "herbal tea",
            "atemübungen": "breathing exercises",
            "ausgeglichen": "balanced",
            "energiegeladen": "energetic",
            "erholen": "to recover"
        },
        "mcqQuestions": [
            {"question": "Was hat die Person vor einem Jahr beschlossen?", "options": ["Den Beruf zu wechseln", "Ihre täglichen Gewohnheiten zu verändern", "In eine andere Stadt zu ziehen", "Einen Hund zu kaufen"], "correctAnswerIndex": 1, "explanation": "Sie beschloss, ihre täglichen Gewohnheiten grundlegend zu verändern."},
            {"question": "Wie lange bewegt sich die Person täglich mindestens?", "options": ["Zehn Minuten", "Dreißig Minuten", "Zwei Stunden", "Drei Stunden"], "correctAnswerIndex": 1, "explanation": "Sie bewegt sich 'mindestens dreißig Minuten aktiv an der frischen Luft'."},
            {"question": "Was kocht die Person heutzutage am liebsten?", "options": ["Fast Food und Pommes", "Gerichte mit frischem Gemüse und Vollkorn", "Nur Süßspeisen", "Konserven"], "correctAnswerIndex": 1, "explanation": "Sie kocht selbst mit frischem Gemüse, Vollkornprodukten und pflanzlichen Ölen."},
            {"question": "Was trinkt die Person anstelle von Limonade?", "options": ["Kaffee und Cola", "Stilles Wasser und Kräutertee", "Bier und Wein", "Nur Milch"], "correctAnswerIndex": 1, "explanation": "Sie trinkt stilles Wasser und ungesüßten Kräutertee."},
            {"question": "Wie viele Stunden Schlaf strebt die Person pro Nacht an?", "options": ["Vier bis fünf", "Sieben bis acht", "Zehn bis zwölf", "Nur sechs"], "correctAnswerIndex": 1, "explanation": "Sie achtet darauf, 'mindestens sieben bis acht Stunden' zu schlafen."}
        ],
        "tfQuestions": [
            {"question": "Früher fühlte sich die Person oft schlapp und unkonzentriert.", "options": ["Richtig", "Falsch"], "correctAnswerIndex": 0, "explanation": "Richtig. 'Früher habe ich mich oft schlapp und unkonzentriert gefühlt...'"},
            {"question": "Die Person ernährt sich ausschließlich von Fertiggerichten.", "options": ["Richtig", "Falsch"], "correctAnswerIndex": 1, "explanation": "Falsch. Sie kocht mittlerweile fast jeden Abend selbst."},
            {"question": "Bei Stress macht die Person Atemübungen oder liest ein Buch.", "options": ["Richtig", "Falsch"], "correctAnswerIndex": 0, "explanation": "Richtig. Sie macht Atemübungen, hört Musik oder liest ein Buch."},
            {"question": "Morgens macht die Person manchmal Yoga im Wohnzimmer.", "options": ["Richtig", "Falsch"], "correctAnswerIndex": 0, "explanation": "Richtig. '...oder mache eine halbe Stunde Yoga im Wohnzimmer...'"},
            {"question": "Die Veränderungen haben der Person überhaupt nicht geholfen.", "options": ["Richtig", "Falsch"], "correctAnswerIndex": 1, "explanation": "Falsch. Sie fühlt sich viel energiegeladener und zufriedener."}
        ]
    },
    {
        "title": "Ein Besuch im Tierpark Hellabrunn (A Visit to Hellabrunn Zoo)",
        "level": "A2",
        "language": "de",
        "text": "Gestern habe ich mit meiner Schwester und ihrem kleinen Sohn den berühmten Tierpark Hellabrunn in München besucht. Hellabrunn ist kein gewöhnlicher Zoo, sondern der weltweit erste Geo-Zoo, in dem die Tiere nach ihren ursprünglichen Kontinenten geordnet zusammenleben. Das Wetter war angenehm mild und die Sonne blitzte immer wieder zwischen den weißen Wolken hervor. Gleich am Eingang haben wir uns einen Lageplan besorgt, damit wir keinen Bereich verpassen. Zuerst sind wir in die afrikanische Savanne spaziert. Dort konnten wir elegante Giraffen beobachten, die gemächlich an hohen Akazienbäumen knabberten, während Zebras und Strauße friedlich über die weite Wiese trabten. Mein Neffe war besonders begeistert von den verspielten Elefantenkindern, die im Wasserbecken planschten und sich gegenseitig mit Schlamm bespritzten. Zur Mittagszeit haben wir auf einer Holzbank im Schatten alter Eichen eine Rast eingelegt. Wir haben frische belegte Brote, knackige Äpfel und kühlen Tee genossen. Am Nachmittag besuchten wir die Polarwelt. Die neugierigen Pinguine tauchten blitzschnell durch das klare Wasser und schienen die Besucher durch die großen Glasscheiben genau zu beobachten. Es war ein lehrreicher und fröhlicher Ausflug für die ganze Familie.",
        "vocabularyHints": {
            "tierpark": "animal park / zoo",
            "kontinenten": "continents",
            "savanne": "savannah",
            "gemächlich": "leisurely",
            "knabberten": "nibbled",
            "neffe": "nephew",
            "begeistert": "enthusiastic",
            "planschten": "splashed",
            "schatten": "shade",
            "polarwelt": "polar world",
            "glasscheiben": "glass panes",
            "lehrreich": "educational / informative"
        },
        "mcqQuestions": [
            {"question": "Mit wem hat die Person den Tierpark besucht?", "options": ["Mit den Eltern", "Mit Schwester und Neffe", "Mit Arbeitskollegen", "Ganz alleine"], "correctAnswerIndex": 1, "explanation": "Mit 'meiner Schwester und ihrem kleinen Sohn'."},
            {"question": "Was ist das Besondere am Tierpark Hellabrunn?", "options": ["Er ist der älteste Zoo der Welt", "Er ordnet Tiere nach Kontinenten (Geo-Zoo)", "Er hat nur Meerestiere", "Er ist nachts geöffnet"], "correctAnswerIndex": 1, "explanation": "Es ist 'der weltweit erste Geo-Zoo, in dem die Tiere nach Kontinenten geordnet leben'."},
            {"question": "Welche Tiere knabberten an hohen Bäumen?", "options": ["Elefanten", "Giraffen", "Pinguine", "Bären"], "correctAnswerIndex": 1, "explanation": "Giraffen knabberten gemächlich an hohen Akazienbäumen."},
            {"question": "Wovon war der kleine Neffe besonders begeistert?", "options": ["Von den Zebras", "Von den Elefantenkindern", "Von den Tigern", "Vom Spielplatz"], "correctAnswerIndex": 1, "explanation": "Der Neffe war begeistert von den 'verspielten Elefantenkindern'."},
            {"question": "Welche Tiere beobachteten die Besucher durch Glasscheiben?", "options": ["Die Giraffen", "Die Pinguine", "Die Löwen", "Die Krokodile"], "correctAnswerIndex": 1, "explanation": "Die Pinguine tauchten und schienen die Besucher durch Scheiben zu beobachten."}
        ],
        "tfQuestions": [
            {"question": "Hellabrunn befindet sich in Berlin.", "options": ["Richtig", "Falsch"], "correctAnswerIndex": 1, "explanation": "Falsch. Hellabrunn befindet sich in München."},
            {"question": "Die Besucher haben sich am Eingang einen Plan besorgt.", "options": ["Richtig", "Falsch"], "correctAnswerIndex": 0, "explanation": "Richtig. 'Gleich am Eingang haben wir uns einen Lageplan besorgt...'"},
            {"question": "Die Elefantenkinder planschten im Wasserbecken.", "options": ["Richtig", "Falsch"], "correctAnswerIndex": 0, "explanation": "Richtig. Die Elefantenkinder planschten und bespritzten sich mit Schlamm."},
            {"question": "Das Mittagessen nahmen sie in einem teuren Restaurant ein.", "options": ["Richtig", "Falsch"], "correctAnswerIndex": 1, "explanation": "Falsch. Sie aßen belegte Brote auf einer Holzbank im Schatten."},
            {"question": "Der Ausflug war für die Familie lehrreich und schön.", "options": ["Richtig", "Falsch"], "correctAnswerIndex": 0, "explanation": "Richtig. 'Es war ein lehrreicher und fröhlicher Ausflug...'"}
        ]
    },
    {
        "title": "Reisevorbereitungen für Spanien (Travel Preparations for Spain)",
        "level": "A2",
        "language": "de",
        "text": "Diesen Sommer erfülle ich mir einen lang gehegten Traum: Ich werde zwei Wochen lang durch Andalusien im Süden Spaniens reisen. Da ich gerne unabhängig unterwegs bin, habe ich die Reise komplett selbst über das Internet organisiert. Zuerst habe ich die Flugtickets nach Málaga und die Hotelübernachtungen in Sevilla, Granada und Córdoba gebucht. In Granada möchte ich unbedingt die weltberühmte Festung Alhambra besichtigen, für die man Eintrittskarten viele Wochen im Voraus reservieren muss. Um mich vor Ort verständigen zu können, lerne ich seit vier Monaten fleißig Spanisch mit einer Sprach-App auf meinem Smartphone. Jeden Tag übe ich zwanzig Minuten lang wichtige Redewendungen für den Alltag, zum Beispiel wie man im Restaurant landestypische Tapas bestellt oder am Bahnhof nach dem richtigen Abfahrtsgleis fragt. Gestern habe ich begonnen, meinen Koffer probeweise zu packen. Da es im andalusischen Sommer tagsüber sehr heiß werden kann, packe ich vor allem luftige Kleidung aus Baumwolle, eine dunkle Sonnenbrille, eine Kopfbedeckung und Sonnencreme mit hohem Lichtschutzfaktor ein. Ein handlicher Reiseführer mit Karten und ein Notizbuch für persönliche Eindrücke dürfen natürlich auch nicht fehlen. Ich bin schon sehr gespannt auf die maurische Architektur, die andalusische Gastfreundschaft und die spanische Küche.",
        "vocabularyHints": {
            "unabhängig": "independent",
            "festung": "fortress",
            "eintrittskarten": "tickets / admission",
            "im voraus": "in advance",
            "redewendungen": "idioms / phrases",
            "abfahrtsgleis": "departure platform",
            "baumwolle": "cotton",
            "sonnenbrille": "sunglasses",
            "kopfbedeckung": "headwear / hat",
            "lichtschutzfaktor": "sun protection factor",
            "reiseführer": "travel guide",
            "gastfreundschaft": "hospitality"
        },
        "mcqQuestions": [
            {"question": "Wohin reist die Person diesen Sommer?", "options": ["Nach Italien", "Nach Andalusien in Spanien", "Nach Südfrankreich", "Nach Griechenland"], "correctAnswerIndex": 1, "explanation": "Sie reist 'zwei Wochen lang durch Andalusien im Süden Spaniens'."},
            {"question": "Welche berühmte Festung möchte sie in Granada besichtigen?", "options": ["Den Prado", "Die Alhambra", "Die Sagrada Família", "Den Alcázar"], "correctAnswerIndex": 1, "explanation": "In Granada möchte sie die Festung Alhambra besichtigen."},
            {"question": "Wie lange lernt die Person schon Spanisch?", "options": ["Seit zwei Wochen", "Seit vier Monaten", "Seit drei Jahren", "Gar nicht"], "correctAnswerIndex": 1, "explanation": "Sie lernt 'seit vier Monaten fleißig Spanisch mit einer Sprach-App'."},
            {"question": "Was packt die Person wegen der Hitze ein?", "options": ["Wollpullover", "Luftige Baumwollkleidung und Sonnencreme", "Einen dicken Mantel", "Stiefel"], "correctAnswerIndex": 1, "explanation": "Sie packt luftige Kleidung, Sonnenbrille und Sonnencreme ein."},
            {"question": "Wie wurde die Reise organisiert?", "options": ["Über ein Reisebüro", "Komplett selbst über das Internet", "Von Freunden", "Von der Universität"], "correctAnswerIndex": 1, "explanation": "Sie hat die Reise 'komplett selbst über das Internet organisiert'."}
        ],
        "tfQuestions": [
            {"question": "Tickets für die Alhambra muss man im Voraus reservieren.", "options": ["Richtig", "Falsch"], "correctAnswerIndex": 0, "explanation": "Richtig. '...für die man Eintrittskarten viele Wochen im Voraus reservieren muss.'"},
            {"question": "Die Reise dauert insgesamt einen Monat.", "options": ["Richtig", "Falsch"], "correctAnswerIndex": 1, "explanation": "Falsch. Die Reise dauert zwei Wochen."},
            {"question": "Die Person übt täglich wichtige Redewendungen auf Spanisch.", "options": ["Richtig", "Falsch"], "correctAnswerIndex": 0, "explanation": "Richtig. 'Jeden Tag übe ich zwanzig Minuten lang wichtige Redewendungen...'"},
            {"question": "Im Koffer ist auch ein Reiseführer mit Karten.", "options": ["Richtig", "Falsch"], "correctAnswerIndex": 0, "explanation": "Richtig. 'Ein handlicher Reiseführer mit Karten... darf natürlich auch nicht fehlen.'"},
            {"question": "Die Person reist nur nach Madrid.", "options": ["Richtig", "Falsch"], "correctAnswerIndex": 1, "explanation": "Falsch. Sie besucht Städte wie Málaga, Sevilla, Granada und Córdoba."}
        ]
    },
    {
        "title": "Mein Berufsalltag im Architekturbüro (My Workday in the Architecture Office)",
        "level": "A2",
        "language": "de",
        "text": "Seit einem halben Jahr arbeite ich als Junior-Projektmanager in einem modernen Architekturbüro in Köln. Unser Team besteht aus zwölf kreativen Architekten, Ingenieuren und Bauleitern. Wir planen nachhaltige Wohngebäude und energiesparende Schulen in Nordrhein-Westfalen. Mein Arbeitstag beginnt meistens gegen halb neun Uhr morgens. Nachdem ich meine E-Mails gelesen habe, besprechen wir im täglichen Team-Meeting die aktuellen Baufortschritte und anstehende Termine mit den Baufirmen. Zu meinen Hauptaufgaben gehört es, Materialbestellungen zu kontrollieren, Zeitpläne abzustimmen und Rechnungen gewissenhaft zu prüfen. Zweimal pro Woche fahre ich gemeinsam mit dem leitenden Architekten direkt auf die Baustellen, um die ausgeführten Arbeiten vor Ort zu überprüfen. Es ist faszinierend zu beobachten, wie aus digitalen Plänen am Computer Schritt für Schritt reale Häuser aus Holz, Beton und Glas entstehen. Mittags gehen wir oft zusammen in ein italienisches Bistro in der Nähe, um uns bei Pasta und Kaffee über private Pläne und Architekturtrends auszutauschen. Obwohl die Arbeit manchmal anstrengend ist und enge Fristen eingehalten werden müssen, bereitet mir die vielseitige Zusammenarbeit mit den verschiedenen Handwerkern und Planern große Freude. Ich lerne jeden Tag etwas Neues dazu.",
        "vocabularyHints": {
            "architekturbüro": "architecture office",
            "nachhaltig": "sustainable",
            "bauleiter": "construction manager",
            "baufortschritte": "construction progress",
            "zeitpläne": "schedules",
            "gewissenhaft": "conscientious",
            "baustelle": "construction site",
            "überprüfen": "to inspect / check",
            "faszinierend": "fascinating",
            "beton": "concrete",
            "fristen": "deadlines",
            "handwerker": "craftsmen / tradespeople"
        },
        "mcqQuestions": [
            {"question": "Als was arbeitet die Person im Architekturbüro?", "options": ["Als Buchhalter", "Als Junior-Projektmanager", "Als Chef-Ingenieur", "Als Bauzeichner"], "correctAnswerIndex": 1, "explanation": "Sie arbeitet 'als Junior-Projektmanager in einem modernen Architekturbüro'."},
            {"question": "Was für Gebäude plant das Team hauptsächlich?", "options": ["Fabriken", "Nachhaltige Wohngebäude und Schulen", "Nur Brücken", "Wolkenkratzer"], "correctAnswerIndex": 1, "explanation": "Sie planen nachhaltige Wohngebäude und energiesparende Schulen."},
            {"question": "Wie oft fährt die Person auf die Baustellen?", "options": ["Täglich", "Zweimal pro Woche", "Einmal im Monat", "Nie"], "correctAnswerIndex": 1, "explanation": "Im Text steht: 'Zweimal pro Woche fahre ich... direkt auf die Baustellen...'"},
            {"question": "Wo verbringt das Team häufig die Mittagspause?", "options": ["In der Kantine", "Im italienischen Bistro", "Im Park", "Im Konferenzraum"], "correctAnswerIndex": 1, "explanation": "Sie gehen mittags 'in ein italienisches Bistro in der Nähe'."},
            {"question": "Aus welchen Materialien entstehen die Häuser?", "options": ["Nur aus Stein", "Aus Holz, Beton und Glas", "Aus Plastik", "Aus Lehm"], "correctAnswerIndex": 1, "explanation": "Es entstehen reale Häuser 'aus Holz, Beton und Glas'."}
        ],
        "tfQuestions": [
            {"question": "Das Team besteht aus zwölf Personen.", "options": ["Richtig", "Falsch"], "correctAnswerIndex": 0, "explanation": "Richtig. 'Unser Team besteht aus zwölf kreativen Architekten, Ingenieuren...'"},
            {"question": "Die Person arbeitet in Frankfurt.", "options": ["Richtig", "Falsch"], "correctAnswerIndex": 1, "explanation": "Falsch. Das Büro befindet sich in Köln."},
            {"question": "Zu den Aufgaben gehört das Prüfen von Rechnungen und Zeitplänen.", "options": ["Richtig", "Falsch"], "correctAnswerIndex": 0, "explanation": "Richtig. 'Materialbestellungen zu kontrollieren, Zeitpläne abzustimmen und Rechnungen... zu prüfen.'"},
            {"question": "Die Arbeit hat keine Fristen und Termine.", "options": ["Richtig", "Falsch"], "correctAnswerIndex": 1, "explanation": "Falsch. Es müssen enge Fristen eingehalten werden."},
            {"question": "Die Person lernt täglich etwas Neues bei der Arbeit.", "options": ["Richtig", "Falsch"], "correctAnswerIndex": 0, "explanation": "Richtig. 'Ich lerne jeden Tag etwas Neues dazu.'"}
        ]
    }
])
