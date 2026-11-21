#!/usr/bin/env python3
import json
import re

def count_words(text):
    return len(re.findall(r'\S+', text))

passages = [
    # A1 (150-220 words)
    {
        "title": "Mein Tag in München (My Day in Munich)",
        "level": "A1",
        "language": "de",
        "text": "Ich heiße Lukas und wohne seit zwei Jahren in München. Jeden Morgen stehe ich pünktlich um sieben Uhr auf. Zuerst trinke ich eine große Tasse schwarzen Kaffee und esse zwei Scheiben frisches Brot mit Butter und Erdbeermarmelade. Danach ziehe ich mich an und packe meine Tasche. Um acht Uhr verlasse ich die Wohnung und gehe zur U-Bahn-Station. Ich fahre mit der U-Bahn direkt ins Zentrum zur Universität. Dort studiere ich Informatik. Die erste Vorlesung beginnt um halb neun und ist sehr interessant. Um zwölf Uhr treffe ich meine Freunde in der Mensa. Wir essen zusammen Pizza oder Salat und trinken kaltes Wasser. Nach dem Mittagessen lerne ich zwei Stunden in der Bibliothek. Am Nachmittag fahre ich mit dem Fahrrad durch den Englischen Garten. Am Abend koche ich mit meiner Freundin Gemüse und Reis. Um dreiundzwanzig Uhr gehe ich müde ins Bett.",
        "vocabularyHints": {
            "wohne": "live / reside",
            "pünktlich": "punctual / on time",
            "frisches": "fresh",
            "marmelade": "jam",
            "station": "station",
            "vorlesung": "lecture",
            "mensa": "university cafeteria",
            "bibliothek": "library",
            "garten": "garden / park",
            "gemüse": "vegetables",
            "schlafen": "to sleep",
            "müde": "tired"
        },
        "mcqQuestions": [
            {
                "question": "Um wie viel Uhr steht Lukas jeden Morgen auf?",
                "options": ["Um sechs Uhr", "Um sieben Uhr", "Um acht Uhr", "Um neun Uhr"],
                "correctAnswerIndex": 1,
                "explanation": "Im Text steht: 'Jeden Morgen stehe ich pünktlich um sieben Uhr auf.'"
            },
            {
                "question": "Was isst Lukas zum Frühstück?",
                "options": ["Müsli mit Joghurt", "Brot mit Butter und Marmelade", "Ein Schinkenbrot", "Nur einen Apfel"],
                "correctAnswerIndex": 1,
                "explanation": "Lukas isst 'zwei Scheiben frisches Brot mit Butter und Erdbeermarmelade'."
            },
            {
                "question": "Wie kommt Lukas am Morgen zur Universität?",
                "options": ["Mit dem Bus", "Mit dem Auto", "Mit der U-Bahn", "Zu Fuß"],
                "correctAnswerIndex": 2,
                "explanation": "Er geht zur U-Bahn-Station und fährt mit der U-Bahn direkt ins Zentrum."
            },
            {
                "question": "Wo trifft Lukas seine Freunde um zwölf Uhr?",
                "options": ["In einem Café", "Im Park", "In der Mensa", "In der Bibliothek"],
                "correctAnswerIndex": 2,
                "explanation": "Der Text sagt: 'Um zwölf Uhr treffe ich meine Freunde in der Mensa.'"
            },
            {
                "question": "Was macht Lukas am Nachmittag?",
                "options": ["Er schwimmt im See", "Er fährt Fahrrad im Park", "Er schläft zwei Stunden", "Er arbeitet im Supermarkt"],
                "correctAnswerIndex": 1,
                "explanation": "Im Text steht: 'Am Nachmittag fahre ich mit dem Fahrrad durch den Englischen Garten.'"
            }
        ],
        "tfQuestions": [
            {
                "question": "Lukas studiert Informatik an der Universität.",
                "options": ["Richtig", "Falsch"],
                "correctAnswerIndex": 0,
                "explanation": "Richtig. Der Text bestätigt: 'Dort studiere ich Informatik.'"
            },
            {
                "question": "Die erste Vorlesung beginnt um zehn Uhr.",
                "options": ["Richtig", "Falsch"],
                "correctAnswerIndex": 1,
                "explanation": "Falsch. Die erste Vorlesung beginnt um halb neun."
            },
            {
                "question": "Lukas lernt nach dem Mittagessen in der Bibliothek.",
                "options": ["Richtig", "Falsch"],
                "correctAnswerIndex": 0,
                "explanation": "Richtig. 'Nach dem Mittagessen lerne ich zwei Stunden in der Bibliothek.'"
            },
            {
                "question": "Am Abend kocht Lukas ganz allein.",
                "options": ["Richtig", "Falsch"],
                "correctAnswerIndex": 1,
                "explanation": "Falsch. Er kocht gemeinsam mit seiner Freundin."
            },
            {
                "question": "Lukas geht um dreiundzwanzig Uhr schlafen.",
                "options": ["Richtig", "Falsch"],
                "correctAnswerIndex": 0,
                "explanation": "Richtig. 'Um dreiundzwanzig Uhr gehe ich müde ins Bett.'"
            }
        ]
    },
    {
        "title": "Meine Familie und unser Zuhause (My Family and Our Home)",
        "level": "A1",
        "language": "de",
        "text": "Mein Name ist Julia. Ich bin fünfundzwanzig Jahre alt und wohne in einem kleinen Haus in Hamburg. Das Haus hat einen schönen Garten mit vielen Blumen und zwei alten Bäumen. Meine Familie ist sehr herzlich. Mein Vater heißt Markus und arbeitet als Lehrer an einer Grundschule. Meine Mutter Susanne arbeitet in einer bekannten Buchhandlung in der Innenstadt. Ich habe auch einen jüngeren Bruder. Er heißt Felix, ist neunzehn Jahre alt und macht eine Ausbildung zum Koch. Wir haben auch ein Haustier: einen freundlichen Hund namens Bruno. Am Samstag frühstücken wir alle gemeinsam in der hellen Küche. Es gibt warmen Tee, frischen Orangensaft, knusprige Brötchen und gekochte Eier. Danach machen wir oft einen langen Spaziergang an der Elbe. Meine Großeltern wohnen in der Nähe und besuchen uns sonntags zum Mittagessen. Meine Mutter kocht dann immer eine leckere Suppe. Ich liebe meine Familie und unser ruhiges Zuhause sehr.",
        "vocabularyHints": {
            "zuhause": "home",
            "blumen": "flowers",
            "bäumen": "trees",
            "herzlich": "warm / cordial",
            "grundschule": "elementary school",
            "buchhandlung": "bookstore",
            "ausbildung": "apprenticeship / training",
            "brötchen": "bread rolls",
            "spaziergang": "walk / stroll",
            "suppe": "soup",
            "haustier": "pet",
            "gemütlich": "cozy / comfortable"
        },
        "mcqQuestions": [
            {
                "question": "Wo wohnt Julia mit ihrer Familie?",
                "options": ["In Berlin", "In Hamburg", "In Wien", "In Zürich"],
                "correctAnswerIndex": 1,
                "explanation": "Im Text steht: 'Ich bin fünfundzwanzig Jahre alt und wohne in einem kleinen Haus in Hamburg.'"
            },
            {
                "question": "Was arbeitet Julias Vater von Beruf?",
                "options": ["Arzt", "Koch", "Lehrer", "Verkäufer"],
                "correctAnswerIndex": 2,
                "explanation": "Der Text sagt: 'Mein Vater heißt Markus und arbeitet als Lehrer an einer Grundschule.'"
            },
            {
                "question": "Was für ein Haustier hat die Familie?",
                "options": ["Eine Katze", "Ein Kaninchen", "Einen Papagei", "Einen Hund"],
                "correctAnswerIndex": 3,
                "explanation": "Die Familie hat 'einen freundlichen Hund namens Bruno'."
            },
            {
                "question": "Was macht Felix beruflich?",
                "options": ["Er studiert Medizin", "Er lernt Koch", "Er arbeitet im Büro", "Er verkauft Bücher"],
                "correctAnswerIndex": 1,
                "explanation": "Felix 'macht eine Ausbildung zum Koch'."
            },
            {
                "question": "Wann besuchen die Großeltern die Familie?",
                "options": ["Am Freitagabend", "Am Samstagmorgen", "Am Sonntag", "Jeden Werktag"],
                "correctAnswerIndex": 2,
                "explanation": "Im Text steht: 'Meine Großeltern wohnen in der Nähe und besuchen uns sonntags zum Mittagessen.'"
            }
        ],
        "tfQuestions": [
            {
                "question": "Julias Mutter arbeitet in einer Buchhandlung.",
                "options": ["Richtig", "Falsch"],
                "correctAnswerIndex": 0,
                "explanation": "Richtig. 'Meine Mutter Susanne arbeitet in einer bekannten Buchhandlung in der Innenstadt.'"
            },
            {
                "question": "Das Haus hat keinen Garten.",
                "options": ["Richtig", "Falsch"],
                "correctAnswerIndex": 1,
                "explanation": "Falsch. Das Haus hat einen schönen Garten mit Blumen und Bäumen."
            },
            {
                "question": "Die Familie frühstückt am Samstag gemeinsam.",
                "options": ["Richtig", "Falsch"],
                "correctAnswerIndex": 0,
                "explanation": "Richtig. 'Am Samstag frühstücken wir alle gemeinsam in der hellen Küche.'"
            },
            {
                "question": "Julia hat zwei Schwestern.",
                "options": ["Richtig", "Falsch"],
                "correctAnswerIndex": 1,
                "explanation": "Falsch. Julia hat nur einen jüngeren Bruder namens Felix."
            },
            {
                "question": "Nach dem Frühstück spaziert die Familie oft an der Elbe.",
                "options": ["Richtig", "Falsch"],
                "correctAnswerIndex": 0,
                "explanation": "Richtig. 'Danach machen wir oft einen langen Spaziergang an der Elbe.'"
            }
        ]
    },
    {
        "title": "Auf dem Wochenmarkt (At the Weekly Market)",
        "level": "A1",
        "language": "de",
        "text": "Jeden Samstagmorgen besuche ich den Wochenmarkt auf dem großen Marktplatz. Es ist mein Lieblingstag in der Woche, weil die Atmosphäre dort immer lebendig und bunt ist. Viele Bauern aus der Region verkaufen ihr frisches Obst und Gemüse. Ich nehme immer einen großen Stoffbeutel mit. Zuerst gehe ich zum Gemüsestand von Herrn Weber. Ich kaufe zwei Kilo rote Äpfel, süße Karotten, eine Gurke und frische Tomaten für einen Salat. Danach gehe ich zum Käsestand. Die Verkäuferin lässt mich ein Stück Schweizer Käse probieren. Er schmeckt hervorragend, also kaufe ich dreihundert Gramm. Nebenan duftet es wunderbar nach Brot. Der Bäcker verkauft warmes Roggenbrot und kleine Zimtschnecken. Ich nehme ein halbes Brot und zwei Schnecken für den Nachmittag mit. An einem kleinen Blumenstand kaufe ich noch gelbe Tulpen für das Wohnzimmer. Das Einkaufen auf dem Markt dauert ungefähr eine Stunde. Am Ende trinke ich einen schnellen Espresso im Café am Eck.",
        "vocabularyHints": {
            "wochenmarkt": "weekly market",
            "lebendig": "lively",
            "bauern": "farmers",
            "stoffbeutel": "cloth bag",
            "karotten": "carrots",
            "gurke": "cucumber",
            "käsestand": "cheese stall",
            "probieren": "to taste / try",
            "roggenbrot": "rye bread",
            "zimtschnecken": "cinnamon rolls",
            "tulpen": "tulips",
            "einkaufen": "shopping"
        },
        "mcqQuestions": [
            {
                "question": "An welchem Tag besucht die Person den Wochenmarkt?",
                "options": ["Montagmorgen", "Mittwochnachmittag", "Samstagmorgen", "Sonntagabend"],
                "correctAnswerIndex": 2,
                "explanation": "Der Text beginnt mit: 'Jeden Samstagmorgen besuche ich den Wochenmarkt...'"
            },
            {
                "question": "Was kauft die Person am Gemüsestand?",
                "options": ["Nur Kartoffeln", "Äpfel, Karotten, Gurke und Tomaten", "Nur Zwiebeln und Knoblauch", "Bananen und Orangen"],
                "correctAnswerIndex": 1,
                "explanation": "Im Text steht: 'Ich kaufe zwei Kilo rote Äpfel, süße Karotten, eine Gurke und frische Tomaten...'"
            },
            {
                "question": "Was darf die Person am Käsestand probieren?",
                "options": ["Ziegenkäse", "Schafskäse", "Schweizer Käse", "Italienischen Parmesan"],
                "correctAnswerIndex": 2,
                "explanation": "Der Text sagt: 'Die Verkäuferin lässt mich ein Stück Schweizer Käse probieren.'"
            },
            {
                "question": "Was kauft die Person beim Bäcker für den Nachmittag?",
                "options": ["Eine Schokoladentorte", "Zwei Zimtschnecken und Brot", "Kekse und Brezeln", "Nur Apfelkuchen"],
                "correctAnswerIndex": 1,
                "explanation": "Sie nimmt 'ein halbes Brot und zwei Schnecken für den Nachmittag mit'."
            },
            {
                "question": "Welche Blumen kauft die Person für das Wohnzimmer?",
                "options": ["Rote Rosen", "Weiße Lilien", "Gelbe Tulpen", "Blaue Orchideen"],
                "correctAnswerIndex": 2,
                "explanation": "Im Text steht: 'An einem kleinen Blumenstand kaufe ich noch gelbe Tulpen...'"
            }
        ],
        "tfQuestions": [
            {
                "question": "Die Bauern verkaufen Produkte aus der eigenen Region.",
                "options": ["Richtig", "Falsch"],
                "correctAnswerIndex": 0,
                "explanation": "Richtig. 'Viele Bauern aus der Region verkaufen ihr frisches Obst und Gemüse.'"
            },
            {
                "question": "Die Person bezahlt mit Plastiktüten statt Stoffbeuteln.",
                "options": ["Richtig", "Falsch"],
                "correctAnswerIndex": 1,
                "explanation": "Falsch. Die Person nimmt immer einen großen Stoffbeutel mit."
            },
            {
                "question": "Der Käse schmeckt der Person überhaupt nicht.",
                "options": ["Richtig", "Falsch"],
                "correctAnswerIndex": 1,
                "explanation": "Falsch. Der Käse schmeckt hervorragend."
            },
            {
                "question": "Der Einkauf dauert ungefähr eine Stunde.",
                "options": ["Richtig", "Falsch"],
                "correctAnswerIndex": 0,
                "explanation": "Richtig. 'Das Einkaufen auf dem Markt dauert ungefähr eine Stunde.'"
            },
            {
                "question": "Am Ende trinkt die Person einen Espresso im Café.",
                "options": ["Richtig", "Falsch"],
                "correctAnswerIndex": 0,
                "explanation": "Richtig. 'Am Ende trinke ich einen schnellen Espresso im Café am Eck.'"
            }
        ]
    },
    {
        "title": "Kochen mit Freunden (Cooking with Friends)",
        "level": "A1",
        "language": "de",
        "text": "Kochen ist mein liebstes Hobby. Am liebsten koche ich am Wochenende für meine Freunde Anna und David. Heute Abend machen wir zusammen ein italienisches Nudelgericht mit Tomatensauce. Um siebzehn Uhr kommen die beiden zu mir nach Hause. Anna bringt frisches Basilikum und Knoblauch aus ihrem Garten mit. David hat eine Flasche Mineralwasser und Olivenöl gekauft. Wir beginnen sofort mit den Vorbereitungen. David schneidet die Zwiebeln und weint ein bisschen, weil sie so scharf sind. Anna und ich waschen die reifen Tomaten und schneiden sie in kleine Stücke. Dann braten wir den Knoblauch vorsichtig im heißen Öl an. Die Küche riecht schon nach wenigen Minuten herrlich. In einem großen Topf kochen wir das Wasser für die Nudeln mit etwas Salz. Nach zwanzig Minuten ist das Essen fertig. Wir decken den Holztisch mit bunten Tellern und Gläsern. Wir essen gemeinsam, lachen viel und hören leise Klaviermusik. Zum Nachtisch gibt es Schokoladeneis.",
        "vocabularyHints": {
            "hobby": "hobby",
            "nudelgericht": "pasta dish",
            "tomatensauce": "tomato sauce",
            "basilikum": "basil",
            "knoblauch": "garlic",
            "zwiebeln": "onions",
            "schneiden": "to cut / chop",
            "braten": "to fry / saute",
            "topf": "pot",
            "holztisch": "wooden table",
            "nachtisch": "dessert",
            "schokoladeneis": "chocolate ice cream"
        },
        "mcqQuestions": [
            {
                "question": "Was kochen die Freunde heute Abend?",
                "options": ["Eine deutsche Gemüsesuppe", "Ein italienisches Nudelgericht", "Ein scharfes Curry", "Gegrillten Fisch"],
                "correctAnswerIndex": 1,
                "explanation": "Der Text sagt: 'Heute Abend machen wir zusammen ein italienisches Nudelgericht mit Tomatensauce.'"
            },
            {
                "question": "Was bringt Anna aus ihrem Garten mit?",
                "options": ["Karotten und Äpfel", "Basilikum und Knoblauch", "Kartoffeln und Salat", "Zitronen und Orangen"],
                "correctAnswerIndex": 1,
                "explanation": "Im Text steht: 'Anna bringt frisches Basilikum und Knoblauch aus ihrem Garten mit.'"
            },
            {
                "question": "Warum weint David beim Kochen?",
                "options": ["Weil er traurig ist", "Weil er sich verbrannt hat", "Weil die Zwiebeln scharf sind", "Weil das Essen verbrannt ist"],
                "correctAnswerIndex": 2,
                "explanation": "David weint, 'weil die Zwiebeln so scharf sind'."
            },
            {
                "question": "Welche Musik hören die Freunde beim Essen?",
                "options": ["Laute Rockmusik", "Leise Klaviermusik", "Schnelle Tanzmusik", "Gar keine Musik"],
                "correctAnswerIndex": 1,
                "explanation": "Im Text heißt es: '...und hören leise Klaviermusik.'"
            },
            {
                "question": "Was gibt es am Ende zum Nachtisch?",
                "options": ["Apfelkuchen", "Erdbeeren mit Sahne", "Schokoladeneis", "Pudding"],
                "correctAnswerIndex": 2,
                "explanation": "Der Text schließt ab mit: 'Zum Nachtisch gibt es Schokoladeneis.'"
            }
        ],
        "tfQuestions": [
            {
                "question": "Kochen ist das liebste Hobby des Erzählers.",
                "options": ["Richtig", "Falsch"],
                "correctAnswerIndex": 0,
                "explanation": "Richtig. 'Kochen ist mein liebstes Hobby.'"
            },
            {
                "question": "Die Freunde kochen Fleisch in der Sauce.",
                "options": ["Richtig", "Falsch"],
                "correctAnswerIndex": 1,
                "explanation": "Falsch. Sie kochen eine Tomatensauce mit Knoblauch, Basilikum und Öl."
            },
            {
                "question": "Das Essen ist nach zwanzig Minuten fertig.",
                "options": ["Richtig", "Falsch"],
                "correctAnswerIndex": 0,
                "explanation": "Richtig. 'Nach zwanzig Minuten ist das Essen fertig.'"
            },
            {
                "question": "Die Freunde essen an einem Schreibtisch.",
                "options": ["Richtig", "Falsch"],
                "correctAnswerIndex": 1,
                "explanation": "Falsch. Sie decken den Holztisch in der Küche."
            },
            {
                "question": "David hat Olivenöl und Mineralwasser gekauft.",
                "options": ["Richtig", "Falsch"],
                "correctAnswerIndex": 0,
                "explanation": "Richtig. 'David hat eine Flasche Mineralwasser und Olivenöl gekauft.'"
            }
        ]
    },
    {
        "title": "Mein Wochenende in den Bergen (My Weekend in the Mountains)",
        "level": "A1",
        "language": "de",
        "text": "Letztes Wochenende bin ich mit dem Zug in die Alpen gefahren. Die Reise von München dauerte nur eine Stunde. Das Wetter war einfach perfekt: Der Himmel war blau und die Sonne schien den ganzen Tag. Ich habe in einer kleinen gemütlichen Berghütte übernachtet. Am Samstagmorgen bin ich früh aufgewacht. Nach einem kräftigen Frühstück mit Bergkäse und Schwarzbrot habe ich meine Wanderschuhe angezogen. Ich bin auf einen hohen Berg gewandert. Der Weg war manchmal steil, aber die Aussicht auf das grüne Tal war wunderschön. Unterwegs habe ich bunte Bergblumen fotografiert und das Rauschen eines kleinen Baches gehört. Auf dem Gipfel habe ich eine Rast gemacht und einen Apfel gegessen. Es war ganz ruhig da oben, nur der Wind war zu hören. Am Nachmittag bin ich langsam wieder nach unten gelaufen. Am Abend saß ich vor der Hütte und habe den Sonnenuntergang beobachtet. Es war ein wunderbares Erlebnis in der Natur.",
        "vocabularyHints": {
            "zug": "train",
            "alpen": "Alps",
            "berghütte": "mountain hut",
            "übernachtet": "stayed overnight",
            "wanderschuhe": "hiking boots",
            "steil": "steep",
            "aussicht": "view / panorama",
            "tal": "valley",
            "bach": "stream / creek",
            "gipfel": "summit / peak",
            "rast": "rest / break",
            "sonnenuntergang": "sunset"
        },
        "mcqQuestions": [
            {
                "question": "Womit ist die Person in die Alpen gefahren?",
                "options": ["Mit dem Auto", "Mit dem Bus", "Mit dem Zug", "Mit dem Fahrrad"],
                "correctAnswerIndex": 2,
                "explanation": "Im Text steht: 'Letztes Wochenende bin ich mit dem Zug in die Alpen gefahren.'"
            },
            {
                "question": "Wie lange dauerte die Reise von München aus?",
                "options": ["Eine halbe Stunde", "Eine Stunde", "Drei Stunden", "Einen ganzen Tag"],
                "correctAnswerIndex": 1,
                "explanation": "Der Text sagt: 'Die Reise von München dauerte nur eine Stunde.'"
            },
            {
                "question": "Wo hat die Person übernachtet?",
                "options": ["In einem Luxushotel", "In einem Zelt", "In einer kleinen Berghütte", "Bei Freunden"],
                "correctAnswerIndex": 2,
                "explanation": "Die Person hat 'in einer kleinen gemütlichen Berghütte übernachtet'."
            },
            {
                "question": "Was hat die Person auf dem Berggipfel gegessen?",
                "options": ["Ein Wurstbrot", "Einen Apfel", "Ein Stück Kuchen", "Schokolade"],
                "correctAnswerIndex": 1,
                "explanation": "Im Text steht: 'Auf dem Gipfel habe ich eine Rast gemacht und einen Apfel gegessen.'"
            },
            {
                "question": "Was beobachtete die Person am Samstagabend?",
                "options": ["Die Sterne", "Ein Gewitter", "Den Sonnenuntergang", "Wilde Tiere"],
                "correctAnswerIndex": 2,
                "explanation": "Am Abend 'saß ich vor der Hütte und habe den Sonnenuntergang beobachtet'."
            }
        ],
        "tfQuestions": [
            {
                "question": "Das Wetter in den Bergen war sonnig und blau.",
                "options": ["Richtig", "Falsch"],
                "correctAnswerIndex": 0,
                "explanation": "Richtig. 'Der Himmel war blau und die Sonne schien den ganzen Tag.'"
            },
            {
                "question": "Der Wanderweg war durchgehend flach und einfach.",
                "options": ["Richtig", "Falsch"],
                "correctAnswerIndex": 1,
                "explanation": "Falsch. Der Text erwähnt: 'Der Weg war manchmal steil...'"
            },
            {
                "question": "Die Person hat bunte Bergblumen fotografiert.",
                "options": ["Richtig", "Falsch"],
                "correctAnswerIndex": 0,
                "explanation": "Richtig. 'Unterwegs habe ich bunte Bergblumen fotografiert...'"
            },
            {
                "question": "Auf dem Gipfel war laute Musik zu hören.",
                "options": ["Richtig", "Falsch"],
                "correctAnswerIndex": 1,
                "explanation": "Falsch. 'Es war ganz ruhig da oben, nur der Wind war zu hören.'"
            },
            {
                "question": "Die Person wanderte mit Wanderschuhen.",
                "options": ["Richtig", "Falsch"],
                "correctAnswerIndex": 0,
                "explanation": "Richtig. '...habe ich meine Wanderschuhe angezogen.'"
            }
        ]
    }
]

for p in passages:
    words = count_words(p['text'])
    print(f"[{p['level']}] {p['title']}: {words} words (MCQs: {len(p['mcqQuestions'])}, TFs: {len(p['tfQuestions'])})")
