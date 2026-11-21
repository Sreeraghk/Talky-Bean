import { PremadePassage } from './types';

export const IRISH_PASSAGES: PremadePassage[] = [
  {
    "title": "Maidin Bhreá i mBaile Átha Cliath (A Fine Morning in Dublin)",
    "level": "A1",
    "language": "ga",
    "text": "Is mise Liam agus is mac léinn mé i mBaile Átha Cliath, príomhchathair na hÉireann. Tá cónaí orm in árasán beag deas in aice le Faiche Stiabhna. Inniu tá an aimsir go hálainn; tá an ghrian ag taitneamh sa spéir ghorm agus níl aon bháisteach ann. Éirím go luath ar a hocht a chlog ar maidin. Ithim bricfeasta sláintiúil sa chistin: leite the le mil, torthaí úra agus cupán mór tae le bainne. Ar a naoi a chlog, fágaim an teach agus siúlaim go dtí Coláiste na Tríonóide, áit a ndéanaim staidéar ar an stair agus ar an teanga. Is breá liom na seantithe bríce dearga agus na crainn ghlasa ar fud na cathrach. Feicim a lán daoine ar na sráideanna: oibrithe ag dul chuig an obair, turasóirí le ceamaraí agus mic léinn eile ag rothaíocht. Ag am lóin, buailim le mo chara Máire i gcaife beag ar Shráid Grafton. Ithimid ceapaire blasta le cáis agus anraith trátaí te. Bíonn comhrá deas cairdiúil againn as Gaeilge faoinár ranganna. Is cathair bheo, fháilteach agus thaitneamhach í Baile Átha Cliath agus tá an-áthas orm a bheith i mo chónaí anseo.",
    "vocabularyHints": {
      "mac léinn": "student",
      "árasán": "apartment",
      "leite": "porridge",
      "mil": "honey",
      "Coláiste na Tríonóide": "Trinity College",
      "cairdiúil": "friendly",
      "fáilteach": "welcoming",
      "ceapaire": "sandwich",
      "rothaíocht": "cycling",
      "príomhchathair": "capital city"
    },
    "mcqQuestions": [
      {
        "question": "Cá bhfuil cónaí ar Liam faoi láthair?",
        "options": [
          "I gCorcaigh",
          "I mBaile Átha Cliath",
          "I nGaillimh",
          "I Luimneach"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Tá cónaí ar Liam i mBaile Átha Cliath."
      },
      {
        "question": "Cad a itheann Liam don bhricfeasta ar maidin?",
        "options": [
          "Uibheacha agus bagún",
          "Leite the le mil agus torthaí",
          "Arán friochta",
          "Gránphlúr amháin"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Itheann sé leite the le mil agus torthaí úra."
      },
      {
        "question": "Cén coláiste a bhfreastalaíonn Liam air?",
        "options": [
          "Coláiste na Tríonóide",
          "Coláiste na hOllscoile Gaillimh",
          "Coláiste Phádraig",
          "Ollscoil Luimnigh"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Déanann sé staidéar i gColáiste na Tríonóide."
      },
      {
        "question": "Cé leis a mbuaileann Liam ag am lóin ar Shráid Grafton?",
        "options": [
          "Leis an ollamh",
          "Leis a chara Máire",
          "Leis a dheartháir",
          "Leis an dochtúir"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Buaileann sé le Máire i gcaife."
      },
      {
        "question": "Cén teanga a labhraíonn Liam agus Máire le chéile?",
        "options": [
          "Fraincis",
          "Gaeilge",
          "Gearmáinis",
          "Spáinnis"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Bíonn comhrá breá as Gaeilge acu."
      }
    ],
    "tfQuestions": [
      {
        "question": "Is mac léinn é Liam a bhfuil cónaí air i mBaile Átha Cliath.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. Is mac léinn é sa phríomhchathair."
      },
      {
        "question": "Tá an aimsir fliuch agus gaofar ar maidin.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Bréagach. Tá an ghrian ag taitneamh agus tá an lá breá."
      },
      {
        "question": "Siúlann Liam go dtí Coláiste na Tríonóide ar a naoi a chlog.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. Siúlann sé chun an choláiste ar a naoi."
      },
      {
        "question": "Níl aon duine le feiceáil ar na sráideanna.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Bréagach. Tá a lán daoine, turasóirí agus oibrithe ann."
      },
      {
        "question": "Is breá le Liam a bheith ag maireachtáil i mBaile Átha Cliath.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. Is cathair bheo fháilteach í dar leis."
      }
    ]
  },
  {
    "title": "Cuairt ar an Siopa Leabhar i nGaillimh (Visit to a Galway Bookshop)",
    "level": "A1",
    "language": "ga",
    "text": "Gach tráthnóna Sathairn, is breá le hÁine cuairt a thabhairt ar an seanshopa leabhar atá suite i lár chathair na Gaillimhe. Tá an siopa seo suite ar shráid bheag chiúin in aice leis an gCladach agus Abhainn na Coiribe. Nuair a osclaíonn Áine an doras adhmaid, cloiseann sí cloigín beag ag bualadh agus buaileann boladh álainn leabhar agus caife léi. Tá na seilfeanna arda lán go béal le leabhair staire, cnuasaigh filíochta, scéalta do pháistí agus úrscéalta nua-aimseartha as Gaeilge agus as Béarla. Tá cat mór bán ina chodladh go socair ar chathaoir bhog i gcúinne an tsiopa. Roghnaíonn Áine leabhar nua le scéalta traidisiúnta faoi oileáin Chonamara. Suíonn sí síos in aice leis an bhfuinneog mhór le cupán caife te. Is féidir léi na bádóirí agus na faoileáin a fheiceáil ar an uisce lasmuigh. Tagann a lán daoine isteach chun féachaint ar na leabhair nó chun labhairt le húinéir an tsiopa, fear cineálta darb ainm Seán. Is áit shuaimhneach í seo ina mothaíonn gach duine ar a shuaimhneas. Tar éis uair an chloig de léamh taitneamhach, ceannaíonn Áine dhá leabhar agus filleann sí abhaile le croí éadrom sásta.",
    "vocabularyHints": {
      "siopa leabhar": "bookshop",
      "seilfeanna": "shelves",
      "filíocht": "poetry",
      "úrscéal": "novel",
      "suaimhneach": "peaceful",
      "úinéir": "owner",
      "faoileáin": "seagulls",
      "Cladach": "Claddagh",
      "bádóirí": "boatmen",
      "ina chodladh": "sleeping"
    },
    "mcqQuestions": [
      {
        "question": "Cén áit a dtéann Áine gach tráthnóna Sathairn?",
        "options": [
          "Go dtí an pictiúrlann",
          "Go dtí an siopa leabhar i nGaillimh",
          "Chuig an trá",
          "Chuig an staid"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Téann sí go dtí an seanshopa leabhar."
      },
      {
        "question": "Cad atá suite in aice leis an siopa leabhar?",
        "options": [
          "Stáisiún traenach",
          "An Cladach agus Abhainn na Coiribe",
          "Aerfort mór",
          "Monarcha"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Tá sé in aice leis an gCladach agus an abhainn."
      },
      {
        "question": "Cad atá ina chodladh ar an gcathaoir i gcúinne an tsiopa?",
        "options": [
          "Madra beag dubh",
          "Cat mór bán",
          "Coinín",
          "Lacha"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Tá cat mór bán ina chodladh go ciúin."
      },
      {
        "question": "Cén cineál leabhar a roghnaíonn Áine le léamh?",
        "options": [
          "Leabhar matamaitice",
          "Scéalta traidisiúnta faoi Chonamara",
          "Leabhar cócaireachta",
          "Nuachtán spóirt"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Roghnaíonn sí scéalta faoi Chonamara."
      },
      {
        "question": "Cad a cheannaíonn Áine sula bhfágann sí an siopa?",
        "options": [
          "Cupán caife amháin",
          "Dhá leabhar thaitneamhacha",
          "Pictiúr mór",
          "Bia don chat"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Ceannaíonn sí dhá leabhar le léamh sa bhaile."
      }
    ],
    "tfQuestions": [
      {
        "question": "Tá an siopa leabhar suite i lár chathair na Gaillimhe.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. Tá sé suite ar shráid chiúin sa chathair."
      },
      {
        "question": "Níl aon leabhar Gaeilge ar fáil sa siopa seo.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Bréagach. Tá a lán leabhar Gaeilge ar na seilfeanna."
      },
      {
        "question": "Feiceann Áine faoileáin agus báid ar an uisce ón bhfuinneog.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. Tá radharc breá aici ar an abhainn."
      },
      {
        "question": "Is fear cantalach mí-chairdiúil é úinéir an tsiopa.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Bréagach. Is fear cineálta é darb ainm Seán."
      },
      {
        "question": "Mothaíonn Áine an-sásta agus suaimhneach sa siopa seo.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. Filleann sí abhaile le croí éadrom sásta."
      }
    ]
  },
  {
    "title": "Deireadh Seachtaine i nGaeltacht Chonamara (Weekend in Connemara Gaeltacht)",
    "level": "A1",
    "language": "ga",
    "text": "Chuaigh Colm agus a theaghlach ar thuras speisialta go Gaeltacht Chonamara an deireadh seachtaine seo caite. Is ceantar álainn tuaithe é Conamara atá lán de lochanna glana, cnoic ísle agus carraigeacha eibhir. San áit seo, is í an Ghaeilge príomhtheanga an phobail agus labhraíonn gach duine í sa bhaile, sna siopaí agus ar scoil. D'fhan an teaghlach i dteach aíochta traidisiúnta cois farraige i gCeathrú Rua. Bhí fáilte chroíúil roimh gach duine ón mbean an tí, Bríd. Ar an Satharn, shiúil siad ar an Trá Dhearg agus bhailigh siad sliogáin ildaite ar an ngaineamh bog. Chonaic siad caoirigh bhána ag ithe féir ar thaobh an chnoic agus capaillíní Chonamara ag rith go saor sa pháirc. Sa tráthnóna, d'ith siad dinnéar blasta le bradán úr Atlantaigh agus prátaí nua-bhainte. Tar éis an dinnéir, d'éist siad le ceol beo i dteach tábhairne an tsráidbhaile. Bhí fear áitiúil ag seinm an bhosca cheoil agus cailín óg ag canadh amhrán sean-nóis le guth binn glan. D'fhoghlaim Colm a lán focal nua agus bhain sé an-taitneamh as an nGaeilge a chloisteáil timpeall air an t-am ar fad. D'fhág an turas cuimhní geala ina gcroí.",
    "vocabularyHints": {
      "Gaeltacht": "Gaeltacht (Irish-speaking region)",
      "eibhir": "granite",
      "teach aíochta": "guesthouse",
      "sliogáin": "seashells",
      "capaillín": "Connemara pony",
      "bradán": "salmon",
      "amhrán sean-nóis": "traditional unaccompanied singing",
      "bosca ceoil": "accordion",
      "cuimhní": "memories",
      "croíúil": "warm-hearted"
    },
    "mcqQuestions": [
      {
        "question": "Cén ceantar Gaeltachta ar thug Colm agus a theaghlach cuairt air?",
        "options": [
          "Gaeltacht Thír Chonaill",
          "Gaeltacht Chonamara",
          "Gaeltacht Chorca Dhuibhne",
          "Oileán Chléire"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Thug siad cuairt ar Chonamara i gContae na Gaillimhe."
      },
      {
        "question": "Cá bhfuair an teaghlach lóistín le linn an deiridh seachtaine?",
        "options": [
          "In óstán mór cathrach",
          "I dteach aíochta traidisiúnta i gCeathrú Rua",
          "I bpuball ar an trá",
          "I gcarbhán"
        ],
        "correctAnswerIndex": 1,
        "explanation": "D'fhan siad i dteach aíochta cois farraige."
      },
      {
        "question": "Cad a chonaic siad ag rith sa pháirc gar don chnoc?",
        "options": [
          "Eilfeanna",
          "Capaillíní Chonamara",
          "Faoileáin amháin",
          "Madraí fiaigh"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Chonaic siad capaillíní Chonamara."
      },
      {
        "question": "Cad a d'ith an teaghlach don dinnéar blasta?",
        "options": [
          "Píotsa reoite",
          "Bradán úr Atlantaigh agus prátaí nua",
          "Ceapairí fuara",
          "Burgair"
        ],
        "correctAnswerIndex": 1,
        "explanation": "D'ith siad bradán úr agus prátaí nua."
      },
      {
        "question": "Cén cineál amhránaíochta a chuala siad sa teach tábhairne?",
        "options": [
          "Rac-cheol nua-aimseartha",
          "Amhránaíocht ar an sean-nós",
          "Ceol ceoldráma",
          "Ceol rap"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Chuala siad amhrán traidisiúnta sean-nóis."
      }
    ],
    "tfQuestions": [
      {
        "question": "Is ceantar Gaeltachta é Conamara ina labhraítear Gaeilge go laethúil.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. Is í an Ghaeilge gnáth-theanga an phobail ann."
      },
      {
        "question": "Shiúil an teaghlach ar an Trá Dhearg ar an Satharn.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. Shiúil siad ar an trá agus bhailigh sliogáin."
      },
      {
        "question": "Ní raibh aon cheol beo le cloisteáil sa sráidbhaile.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Bréagach. Bhí ceol bosca agus amhránaíocht bhinn ann."
      },
      {
        "question": "Bhí fearg ar an mbean an tí nuair a tháinig na haíonna.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Bréagach. Chuir sí fáilte chroíúil fhial rompu."
      },
      {
        "question": "Chabhraigh an turas le Colm a chuid Gaeilge a chleachtadh.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. D'fhoghlaim sé focail nua le linn an turais."
      }
    ]
  },
  {
    "title": "Béile Traidisiúnta i dTeach Tabhairne i gCill Chainnigh (Traditional Pub Meal)",
    "level": "A1",
    "language": "ga",
    "text": "Nuair a bhíonn an lá fuar agus scamallach, níl aon rud níos fearr ná dul isteach i dteach tábhairne cluthar traidisiúnta i gCill Chainnigh. Tá cáil ar an gcathair mheánaoiseach seo as a cuid caisleán álainn agus a cuid tithe tábhairne stairiúla. Chuaigh Pádraig agus a chara Eoin isteach i dtigh tábhairne ársa le ballaí cloiche agus teallach mór oscailte. Bhí tine bhreá mhóna ag lasadh go geal sa teallach, ag scaipeadh teasa agus boladh cumhra portaigh ar fud an tseomra. Shuigh an bheirt acu ag bord adhmaid in aice leis an tine. D'ordaigh siad stobhach Gaelach traidisiúnta. Tháinig an bia go tapa i mbobhlaí móra doimhne: píosaí móra feola uaineola boga, prátaí, cairéid, oinniúin agus broth saibhir te. Bhí dhá shlisne d'arán donn baile le him buí leathadh in aice leis an mbobhla. D'ól siad gloine leann dubh úr agus bhain siad lán-taitneamh as an mbéile blasta cothaitheach. Bhí daoine ag caint agus ag gáire go suáilceach timpeall orthu agus seanchas á insint faoi stair an bhaile. Is cuid lárnach de chultúr sóisialta na hÉireann é an teach tábhairne, áit ina mbailíonn cairde agus comharsana le chéile le haghaidh comhrá, ceoil agus suaimhnis tar éis lae oibre.",
    "vocabularyHints": {
      "cluthar": "cozy",
      "meánaoiseach": "medieval",
      "teallach": "hearth / fireplace",
      "móin": "peat / turf",
      "stobhach Gaelach": "Irish stew",
      "uaineoil": "lamb / mutton",
      "arán donn": "traditional brown soda bread",
      "leann dubh": "stout / dark beer",
      "suáilceach": "cheerful",
      "seanchas": "folklore / lore"
    },
    "mcqQuestions": [
      {
        "question": "Cén chathair stairiúil ina bhfuil an teach tábhairne suite?",
        "options": [
          "I mBéal Feirste",
          "I gCill Chainnigh",
          "I bPort Láirge",
          "I Sligeach"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Tá an tigh tábhairne suite i gCill Chainnigh."
      },
      {
        "question": "Cad a bhí ag lasadh sa teallach oscailte?",
        "options": [
          "Gual dubh",
          "Tine bhreá mhóna chumhra",
          "Páipéar amháin",
          "Gás"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Bhí tine thraidisiúnta mhóna ag lasadh."
      },
      {
        "question": "Cén príomhbhéile traidisiúnta a d'ordaigh Pádraig agus Eoin?",
        "options": [
          "Spaghetti",
          "Stobhach Gaelach le huaineoil agus prátaí",
          "Curraí sicín",
          "Iasc friochta le sceallóga"
        ],
        "correctAnswerIndex": 1,
        "explanation": "D'ordaigh siad stobhach Gaelach blasta."
      },
      {
        "question": "Cén cineál aráin a cuireadh ar fáil leis an stobhach?",
        "options": [
          "Baoite bán francach",
          "Arán donn baile le him buí",
          "Arán cruithneachta crua",
          "Tósta simplí"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Fuair siad arán donn baile le him."
      },
      {
        "question": "Cén tábhacht a bhaineann leis an teach tábhairne i saol na hÉireann?",
        "options": [
          "Is áit stórais amháin é",
          "Is ionad tábhachtach sóisialta é le haghaidh comhrá agus cairdis",
          "Bíonn sé dúnta i gcónaí",
          "Ní labhraítear focal ann"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Is áit thábhachtach chultúrtha agus shóisialta é."
      }
    ],
    "tfQuestions": [
      {
        "question": "Tá cáil ar Chill Chainnigh as a stair mheánaoiseach.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. Is cathair stairiúil mheánaoiseach í."
      },
      {
        "question": "Bhí an teallach fuar agus ní raibh aon tine ann.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Bréagach. Bhí tine mhóna ag lasadh go geal ann."
      },
      {
        "question": "Bhí uaineoil, cairéid agus prátaí sa stobhach Gaelach.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. Is iad sin príomh-chomhábhair an stobhaigh Ghaelaigh."
      },
      {
        "question": "Níor thaitin an bia le Pádraig ná le hEoin ar chor ar bith.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Bréagach. Bhain siad an-taitneamh as an mbéile."
      },
      {
        "question": "Is áit mhaith é an teach tábhairne chun scéalta agus comhrá a chloisteáil.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. Bíonn daoine ag gáire agus ag déanamh seanchais ann."
      }
    ]
  },
  {
    "title": "Siúlóid ar Chósta Chorcaí agus Fiadhúlra na hÉireann (Walking Cork Coast)",
    "level": "A1",
    "language": "ga",
    "text": "Tá cósta theas Chontae Chorcaí ar cheann de na háiteanna is pictiúrtha san Eoraip, le haillte arda, cuanta ciúine agus tránna fada gainmheacha. Maidin Dé Domhnaigh, shocraigh Sinéad agus a cairde siúlóid fhada a dhéanamh ar Chonair Chósta Chorcaí Thiar. Thosaigh siad ag Ceann Chionn tSáile, baile beag iascaireachta a bhfuil tithe ildaite agus caiféanna deasa ann. Bhí an ghaoth ón Aigéan Atlantach ag séideadh go húr thar na haillte. Bhí an fharraige domhain ghorm agus na tonnta bána ag bualadh go láidir i gcoinne na gcarraigeacha thíos. Agus iad ag siúl ar an gcosán caol féarmhar, chonaic siad a lán fiadhúlra suimiúil: éin mhara cosúil le foracha, seilmircigh agus préacháin chosdearga ag eitilt go hard sa spéir. Go tobann, chonaic Sinéad dhá rón liatha ag snámh go suaimhneach san uisce gar don chladach, a gcinn chruinne ag breathnú aníos orthu go fiosrach. Stop an grúpa ag teach solais bán chun lón beag a ithe agus taitneamh a bhaint as an radharc fairsing ar an aigéan. Mothaíonn duine beag i láthair chumhacht an nádúir anseo, ach ag an am céanna faigheann an t-anam suaimhneas domhain ón aer glan salannach. Is turas iontach é d'aon duine ar mian leis éalú ó luas mire an tsaoil nua-aimseartha.",
    "vocabularyHints": {
      "cuanta": "bays / harbors",
      "aillte": "cliffs",
      "iascaireacht": "fishing",
      "tonnta": "waves",
      "éin mhara": "seabirds",
      "rón liath": "grey seal",
      "teach solais": "lighthouse",
      "fiosrach": "curious",
      "luas mire": "hectic / crazy pace",
      "anam": "soul"
    },
    "mcqQuestions": [
      {
        "question": "Cén contae ina ndearna Sinéad agus a cairde a siúlóid chósta?",
        "options": [
          "I gContae Chiarraí",
          "I gContae Chorcaí",
          "I gContae Mhaigh Eo",
          "I gContae Dhún na nGall"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Rinne siad an tsiúlóid ar chósta Chorcaí."
      },
      {
        "question": "Cén baile iascaireachta ildaite as ar thosaigh an tsiúlóid?",
        "options": [
          "Cóbh",
          "Cionn tSáile",
          "Sciobairín",
          "Beanntraí"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Thosaigh siad ag Ceann Chionn tSáile."
      },
      {
        "question": "Cad a chonaic Sinéad ag snámh go fiosrach san uisce?",
        "options": [
          "Siorcanna bána",
          "Dhá rón liatha",
          "Deilfeanna bándearga",
          "Míolta móra"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Chonaic sí dhá rón liatha ag breathnú aníos."
      },
      {
        "question": "Cén foirgneamh a stop an grúpa in aice leis chun lón a ithe?",
        "options": [
          "Caisleán mór",
          "Teach solais bán",
          "Eaglais ársa",
          "Stáisiún bus"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Stop siad ag teach solais bán."
      },
      {
        "question": "Cén tionchar a bhíonn ag an aer mara ar an duine dar leis an téacs?",
        "options": [
          "Cuireann sé imní ar dhaoine",
          "Tugann sé suaimhneas domhain don anam",
          "Déanann sé tinneas cinn",
          "Cuireann sé fearg orthu"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Tugann an t-aer glan suaimhneas don anam."
      }
    ],
    "tfQuestions": [
      {
        "question": "Tá aillte arda agus tránna le feiceáil ar chósta Chorcaí.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. Is ceantar an-phictiúrtha é an cósta."
      },
      {
        "question": "Bhí an fharraige go hiomlán tirim gan aon tonnta.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Bréagach. Bhí tonnta láidre ag bualadh ar na carraigeacha."
      },
      {
        "question": "Chonaic an grúpa éin mhara éagsúla ag eitilt sa spéir.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. Bhí foracha agus préacháin le feiceáil."
      },
      {
        "question": "Rinne siad an tsiúlóid i lár chathair mhór ghlórach.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Bréagach. Shiúil siad ar chosán aille cois farraige."
      },
      {
        "question": "Is deis iontach é an turas seo chun suaimhneas a fháil.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. Cuidíonn sé le daoine éalú ó ghnó an tsaoil."
      }
    ]
  },
  {
    "title": "Ceol Traidisiúnta agus an Seisiún Ceoil (Traditional Music & Pub Session)",
    "level": "A2",
    "language": "ga",
    "text": "Is cuid lárnach agus bheo de shaol cultúrtha na hÉireann é an ceol traidisiúnta Gaelach, ceol a bhfuil fréamhacha doimhne aige i stair agus i mbéaloideas na tíre. Ní hamháin go gcloistear an ceol seo ar stáitsí móra ceolchoirme, ach maireann a fhíor-spiorad sna tithe tábhairne beaga tuaithe ar fud na hÉireann, go háirithe i gcontaetha cosúil leis an gClár, Gaillimh, Dún na nGall agus Ciarraí. Tugtar «seisiún ceoil» ar an nós seo ina dtagann ceoltóirí le chéile go neamhfhoirmiúil chun poirt, ríleanna, cornphíopaí agus foinn mhaorga a chasadh gan aon chleachtadh foirmiúil roimh ré. Suíonn na ceoltóirí i gciorcal timpeall ar an mbord: cloistear an fidil lena fuaimeanna géara binn, an fheadóg stáin shimplí ach ghlórmhar, an consairtín, an bosca ceoil, an chláirseach ársa agus an bodhrán traidisiúnta, cnaguirlis déanta as craiceann gabhair a choinníonn rithim bheoga an cheoil. Ní bhíonn aon stiúrthóir ann; tosaíonn ceoltóir amháin port aitheanta agus téann na ceoltóirí eile isteach láithreach le comhcheol foirfe. Is é an rud is suntasaí faoin seisiún ná an fháilte a chuirtear roimh dhaoine: is féidir le duine óg nó aosta, le sárcheoltóir nó le foghlaimeoir, a bheith páirteach sa chiorcal. Buaileann an lucht féachana a gcosa le rithim an phoirt agus uaireanta éiríonn daoine chun rince seit fuinniúil a dhéanamh ar an urlár adhmaid. Is ceiliúradh pobail é an seisiún a nascann glúnta le chéile trí chumhacht an cheoil dhúchais.",
    "vocabularyHints": {
      "fréamhacha": "roots",
      "béaloideas": "folklore",
      "seisiún": "session",
      "port": "jig",
      "ríl": "reel",
      "cornphíopa": "hornpipe",
      "fidil": "fiddle",
      "cláirseach": "harp",
      "bodhrán": "bodhrán (Irish frame drum)",
      "cnaguirlis": "percussion instrument"
    },
    "mcqQuestions": [
      {
        "question": "Cá bhfaightear fíor-spiorad an cheoil thraidisiúnta de ghnáth?",
        "options": [
          "I hallaí móra opera amháin",
          "I seisiúin neamhfhoirmiúla i dtithe tábhairne",
          "I stiúideonna teilifíse dúnta",
          "I scoileanna príobháideacha"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Maireann an spiorad sna seisiúin thraidisiúnta."
      },
      {
        "question": "Cad é an bodhrán a úsáidtear sa cheol Gaelach?",
        "options": [
          "Uirlis téadach",
          "Cnaguirlis traidisiúnta déanta as craiceann gabhair",
          "Uirlis gaoithe práis",
          "Méarchlár leictreach"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Is cnaguirlis déanta as craiceann gabhair é an bodhrán."
      },
      {
        "question": "Conas a thosaíonn foinn le linn an tseisiúin?",
        "options": [
          "Bíonn stiúrthóir gairmiúil i gceannas",
          "Tosaíonn ceoltóir amháin agus téann daoine eile isteach go nádúrtha",
          "Leagtar síos rialacha dochta i scríbhinn",
          "Seinntear taifeadadh ar ríomhaire"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Tosaíonn ceoltóir amháin agus leantar é."
      },
      {
        "question": "Cé na huirlisí ceoil a luaitear sa sliocht?",
        "options": [
          "Drumaí leictreacha agus sacsafón",
          "Fidil, feadóg stáin, bosca ceoil, cláirseach agus bodhrán",
          "Giotár dord agus pianó amháin",
          "Trompóin agus feadóg mhór"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Luaitear an fhidil, an fheadóg, an consairtín agus an bodhrán."
      },
      {
        "question": "Cén ról atá ag an seisiún sa phobal?",
        "options": [
          "Daoine a choinneáil ina dtost",
          "Glúnta éagsúla a thabhairt le chéile i gceiliúradh pobail",
          "Ticéid daora a dhíol",
          "Comórtas géar a eagrú"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Nascann sé daoine de gach aois le chéile trí cheol."
      }
    ],
    "tfQuestions": [
      {
        "question": "Is cuid thábhachtach de chultúr na hÉireann é an ceol traidisiúnta.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. Tá fréamhacha doimhne aige sa tír."
      },
      {
        "question": "Ní cheadaítear ach d'aon cheoltóir amháin seinm i seisiún.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Bréagach. Is gníomhaíocht ghrúpa oscailte é an seisiún."
      },
      {
        "question": "Déantar an bodhrán as craiceann ainmhí ar fhráma adhmaid.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. Úsáidtear craiceann gabhair go hiondúil."
      },
      {
        "question": "Ní chuirtear aon fháilte roimh dhaoine óga ag seisiúin cheoil.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Bréagach. Bíonn fáilte roimh cheoltóirí óga agus aosta."
      },
      {
        "question": "Bíonn rince seit agus cnagadh cos le feiceáil le linn an cheoil.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. Glacann an lucht éisteachta páirt le rince agus bualadh bos."
      }
    ]
  },
  {
    "title": "Oileáin Árann agus Saol Traidisiúnta an Atlantaigh (The Aran Islands)",
    "level": "A2",
    "language": "ga",
    "text": "Amach ó chósta Chontae na Gaillimhe i mbéal Chuan na Gaillimhe, tá trí oileán chlochacha a bhfuil cáil dhomhanda orthu: Árainn Mhór (Inis Mór), Inis Meáin agus Inis Oírr. Is ionann Oileáin Árann agus tearmann cultúrtha ina bhfuil an Ghaeilge, an seanchas agus seantraidisiúin na hÉireann caomhnaithe go láidir in ainneoin ghaotha feanntacha an Atlantaigh. Tá tírdhreach na n-oileán ar leith: carraigeacha aolchloiche nochta atá roinnte ag mílte ballaí cloch thirime a thóg na glúnta d'oileánaigh le saothar crua a lámha chun cré bheag a chosaint ón gcreimeadh. Toisc nach raibh mórán ithreach nádúrtha ar na carraigeacha, chruthaigh na feirmeoirí a n-ithir féin thar na cianta trí fheamainn mhara agus gaineamh a iompar ón gcladach agus a mheascadh le chéile. Ar Inis Mór, seasann Dún Aonghasa go maorga ar bharr aille céad méadar os cionn na dtonnta fraocha — dúnfort mórthaibhseach ón gCré-Umhaois a léiríonn cumhacht agus intleacht na luath-áitritheoirí. Tá cáil ar leith ar gheansaithe Árann freisin, geansaithe bána olla a bhfuil patrúin chasta cniotáilte orthu a bhíodh á gcaitheamh ag na hiascairí ar a gcuid naomhóg chun iad a choinneáil tirim agus te i gcoinne fhuacht na farraige. Cé go bhfuil turasóireacht nua-aimseartha ann inniu, labhraítear Gaeilge bhinn go líofa sna tithe agus sna scoileanna, rud a chinntíonn go leanann an nasc beo leis an am atá thart ar aghaidh don todhchaí.",
    "vocabularyHints": {
      "tearmann": "haven / sanctuary",
      "aolchloch": "limestone",
      "ballaí cloch thirime": "dry-stone walls",
      "creimeadh": "erosion",
      "feamainn": "seaweed",
      "Dún Aonghasa": "Dun Aengus (prehistoric fort)",
      "Cré-Umhaois": "Bronze Age",
      "geansaí Árann": "Aran jumper / sweater",
      "naomhóg": "currach (traditional canvas boat)",
      "intleacht": "intellect / ingenuity"
    },
    "mcqQuestions": [
      {
        "question": "Cé mhéad oileán atá i ngrúpa Oileáin Árann?",
        "options": [
          "Dhá oileán",
          "Trí oileán (Inis Mór, Inis Meáin, Inis Oírr)",
          "Cúig oileán",
          "Deich n-oileán"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Tá trí oileán sa ghrúpa."
      },
      {
        "question": "Cén cineál carraige a chlúdaíonn tírdhreach Oileáin Árann?",
        "options": [
          "Eibhear dubh",
          "Aolchloch nochta le ballaí cloiche",
          "Gaineamhchloch dhearg",
          "Marmar amháin"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Clúdaíonn aolchloch an tírdhreach karstach."
      },
      {
        "question": "Conas a chruthaigh na seanoileánaigh ithir le haghaidh barra?",
        "options": [
          "Cheannaigh siad í ar líne",
          "Measctha siad feamainn mhara agus gaineamh le chéile",
          "Thug siad cré i málaí ó Mheiriceá",
          "Níor úsáid siad aon ithir"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Chruthaigh siad ithir le feamainn agus gaineamh."
      },
      {
        "question": "Cad é Dún Aonghasa ar Inis Mór?",
        "options": [
          "Teach solais nua",
          "Dúnfort mórthaibhseach ársa ón gCré-Umhaois ar aill ard",
          "Óstán nua-aimseartha",
          "Stáisiún báid tarrthála"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Is dúnfort ársa é ar bharr aille."
      },
      {
        "question": "Cén fáth a mbíodh geansaithe Árann á gcaitheamh ag iascairí?",
        "options": [
          "Chun a bheith faiseanta",
          "Chun iad a choinneáil te agus tirim ar an naomhóg",
          "Mar éide scoile",
          "Chun snámh níos tapúla"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Choinnigh an olann nádúrtha te agus tirim iad."
      }
    ],
    "tfQuestions": [
      {
        "question": "Is pobal láidir Gaeltachta iad Oileáin Árann.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. Labhraítear Gaeilge go nádúrtha sna hoileáin."
      },
      {
        "question": "Tá foraoisí ollmhóra de chrainn arda ag fás ar fud Inis Mór.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Bréagach. Is tírdhreach clochach é den chuid is mó."
      },
      {
        "question": "Tógadh Dún Aonghasa ar bharr aille céad méadar os cionn na farraige.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. Seasann sé go drámatúil ar an aill."
      },
      {
        "question": "Is bád adhmaid nua-aimseartha mótair é an naomhóg amháin.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Bréagach. Is bád traidisiúnta canbháis agus cléithe é."
      },
      {
        "question": "Déantar geansaithe Árann as olann le patrúin chasta.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. Tá clú domhanda ar an gcniotáil thraidisiúnta seo."
      }
    ]
  },
  {
    "title": "Cluichí Gaelacha: Iománaíocht agus Peil Ghaelach (Gaelic Games)",
    "level": "A2",
    "language": "ga",
    "text": "Níl aon eagraíocht spóirt in Éirinn a bhfuil an oiread sin tionchair agus measa uirthi agus atá ar Chumann Lúthchleas Gael (CLG), a bunaíodh i nDurlas Éile i 1884 chun cluichí dúchais na tíre a chaomhnú agus a chur chun cinn. Is iad an iománaíocht agus an pheil Ghaelach an dá phríomhspórt a imrítear faoi scáth an chumainn. Meastar go bhfuil an iománaíocht ar cheann de na cluichí faiche is sine agus is tapúla ar domhan, spórt a bhfuil tagairtí dó le fáil sna seanscéalta miotaseolaíochta faoi Chú Chulainn féin. Imrítear an cluiche le camán déanta as adhmad fuinseoige solúbtha agus sliotar crua leathair. Bíonn scileanna iontacha ag teastáil: caithfidh na himreoirí an sliotar a ghabháil san aer, é a chothromú ar bharr an chamáin agus iad ag rith faoi lánluas, agus é a bhualadh thar an trasnán nó isteach san eangach. Is spórt fuinniúil corraitheach í an pheil Ghaelach freisin a chomhcheanglaíonn gnéithe den sacar agus den rugbaí le rialacha uathúla. Is é an rud is suntasaí faoi CLG ná a spiorad amaitéarach: ní fhaigheann na himreoirí, fiú na réaltaí is mó a imríonn os comhair ochtó míle duine i bPáirc an Chrócaigh i gCluiche Ceannais na hÉireann, aon phá as a gcuid imeartha. Imríonn siad ar son onóra a bparóiste agus a gcontae, ag filleadh ar a ngnáth-phoist mar mhúinteoirí, feirmeoirí nó innealtóirí an lá dár gcionn. Is léiriú fíor é an spiorad pobail seo ar dhílseacht agus ar bhród náisiúnta mhuintir na hÉireann.",
    "vocabularyHints": {
      "Cumann Lúthchleas Gael": "GAA (Gaelic Athletic Association)",
      "iománaíocht": "hurling",
      "camán": "hurley (ash stick)",
      "fuinseog": "ash wood",
      "sliotar": "sliotar (leather hurling ball)",
      "trasnán": "crossbar",
      "spiorad amaitéarach": "amateur spirit",
      "Páirc an Chrócaigh": "Croke Park",
      "Cluiche Ceannais": "All-Ireland Final",
      "dílseacht": "loyalty / allegiance"
    },
    "mcqQuestions": [
      {
        "question": "Cén bhliain inar bunaíodh Cumann Lúthchleas Gael (CLG)?",
        "options": [
          "1999",
          "1884",
          "1916",
          "1750"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Bunaíodh CLG i 1884 i nDurlas Éile."
      },
      {
        "question": "Cén laoch miotaseolaíochta a bhfuil nasc aige le stair na hiománaíochta?",
        "options": [
          "Fionn Mac Cumhaill",
          "Cú Chulainn",
          "Oisín",
          "Brian Bóramha"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Tá clú ar Chú Chulainn as a chuid scileanna iománaíochta."
      },
      {
        "question": "Cén cineál adhmaid a úsáidtear go traidisiúnta chun camáin a dhéanamh?",
        "options": [
          "Darach crua",
          "Fuinseog sholúbtha",
          "Péine bog",
          "Bailse"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Úsáidtear adhmad fuinseoige go traidisiúnta."
      },
      {
        "question": "Cé mhéad pá a fhaigheann na himreoirí as imirt do CLG?",
        "options": [
          "Milliún euro sa bhliain",
          "Ní fhaigheann siad aon phá; is spórt amaitéarach é",
          "Pá seachtainiúil",
          "Bónas mór in aghaidh an chúil"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Is lúthchleasaithe amaitéaracha iad uile gan pá."
      },
      {
        "question": "Cén staid stairiúil ina n-imrítear Cluiche Ceannais na hÉireann?",
        "options": [
          "Staid Aviva",
          "Páirc an Chrócaigh i mBaile Átha Cliath",
          "Staid an Chathair",
          "Páirc Uí Chaoimh"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Imrítear na cluichí ceannais i bPáirc an Chrócaigh."
      }
    ],
    "tfQuestions": [
      {
        "question": "Is iad an iománaíocht agus an pheil Ghaelach príomhchluichí CLG.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. Is iad seo na spóirt náisiúnta is mó."
      },
      {
        "question": "Is cluiche nua-aimseartha í an iománaíocht a cumadh cúpla bliain ó shin.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Bréagach. Is cluiche ársa í a bhfuil na céadta bliain de stair aici."
      },
      {
        "question": "Tugtar sliotar ar an liathróid chrua leathair a úsáidtear san iománaíocht.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. Is é an sliotar liathróid an chluiche."
      },
      {
        "question": "Faigheann réaltaí CLG tuarastal ollmhór ó chlubanna saibhre.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Bréagach. Imríonn siad ar bhonn amaitéarach ar son an phobail."
      },
      {
        "question": "Filleann na himreoirí ar a ngnáthphoist tar éis na gcluichí móra.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. Is gnáthoibrithe agus gairmithe iad sa ghnáthshaol."
      }
    ]
  },
  {
    "title": "Féile Phádraig agus Ceiliúradh Chultúr na hÉireann (St. Patrick's Day Celebrations)",
    "level": "A2",
    "language": "ga",
    "text": "Gach bliain ar an seachtú lá déag de mhí an Mhárta, ceiliúrann muintir na hÉireann agus daoine de bhunadh na hÉireann ar fud an domhain Lá Fhéile Pádraig, lá náisiúnta na hÉireann. Is é Naomh Pádraig éarlamh na tíre, fear a tháinig go hÉirinn sa chúigiú haois chun an Chríostaíocht a chraobhscaoileadh. De réir an tseanchais, d'úsáid Pádraig an tseamróg bheag ghlas le trí dhuilleog chun teagasc na Tríonóide Naofa a mhíniú do na ríthe agus do na daoine, agus ó shin i leith tá an tseamróg anois ina siombail idirnáisiúnta d'Éirinn. Ar an lá speisialta seo, caitheann daoine éadaí uaine, ribíní glasa agus seamróga úra ar a gcuid cótaí. Eagraítear paráidí ollmhóra ildaite i mBaile Átha Cliath, i gCorcaigh agus i mbailte móra agus beaga ar fud an oileáin, chomh maith le cathracha domhanda ar nós Nua-Eabhrac, Londain, Sydney agus Tóiceo. Bíonn bannaí máirseála, ceoltóirí, pubaill chultúrtha, rinceoirí Gaelacha agus taibheoirí sráide ag siamsaíocht do na sluaite móra. I gcathracha thar lear, déantar foirgnimh cháiliúla a shoilsiú le solas glas, mar shampla an Colasaem sa Róimh, an Sydney Opera House agus Túr Eiffel i bPáras, feiniméan ar a dtugtar an «Global Greening». In Éirinn féin, is deis í an fhéile ní hamháin chun spraoi a bheith ag daoine, ach chun bród a léiriú as an nGaeilge, as an gceol Gaelach agus as oidhreacht shaibhir na tíre. Tugann an lá teachtaireacht dhomhanda chairdis, dóchais agus fáilte uaidh go gach cearn den domhan.",
    "vocabularyHints": {
      "éarlamh": "patron saint",
      "craobhscaoileadh": "propagation / preaching",
      "seamróg": "shamrock",
      "Tríonóid Naofa": "Holy Trinity",
      "banna máirseála": "marching band",
      "Global Greening": "Global Greening initiative",
      "oidhreacht": "heritage",
      "ceiliúradh": "celebration",
      "teachtaireacht": "message",
      "cearn": "corner / quarter"
    },
    "mcqQuestions": [
      {
        "question": "Cén dáta ar a gceiliúrtar Lá Fhéile Pádraig gach bliain?",
        "options": [
          "25 Nollaig",
          "17 Márta",
          "1 Eanáir",
          "31 Deireadh Fómhair"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Ceiliúrtar an fhéile ar an 17 Márta."
      },
      {
        "question": "Cén planda beag a d'úsáid Naomh Pádraig chun an Tríonóid a mhíniú?",
        "options": [
          "Rós dearg",
          "An tseamróg ghlas trí-dhuilleogach",
          "Lus an chromchinn",
          "Dristeog"
        ],
        "correctAnswerIndex": 1,
        "explanation": "D'úsáid sé an tseamróg mar shampla léiritheach."
      },
      {
        "question": "Cén dath a bhíonn á chaitheamh go forleathan ar Lá Fhéile Pádraig?",
        "options": [
          "Gorm",
          "Glas (uaine)",
          "Dubh",
          "Dearg"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Caitheann daoine dath glas agus seamróga."
      },
      {
        "question": "Cad é an tionscnamh «Global Greening» a luaitear sa téacs?",
        "options": [
          "Crainn a chur san fhásach",
          "Foirgnimh mhóra dhomhanda a lasadh le solas glas",
          "Bia glas a ithe amháin",
          "Páipéar a athchúrsáil"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Déantar foirgnimh cháiliúla a shoilsiú le dath glas."
      },
      {
        "question": "Cén teachtaireacht a thugann Féile Phádraig don domhan mór?",
        "options": [
          "Cogaíocht agus coimhlint",
          "Cairdeas, dóchas agus fáilte chroíúil",
          "Trádáil dhochta amháin",
          "Dúnadh teorainneacha"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Tugann an lá teachtaireacht chairdis agus fáilte uaidh."
      }
    ],
    "tfQuestions": [
      {
        "question": "Is é Naomh Pádraig éarlamh náisiúnta na hÉireann.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. Aithnítear é mar éarlamh na tíre."
      },
      {
        "question": "Ní cheiliúrtar Lá Fhéile Pádraig ach i mBaile Átha Cliath amháin.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Bréagach. Ceiliúrtar é ar fud an oileáin agus timpeall an domhain."
      },
      {
        "question": "Úsáidtear an tseamróg mar shiombail dhomhanda d'Éirinn.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. Is siombail aitheanta í ar fud na cruinne."
      },
      {
        "question": "Bíonn paráidí móra ar siúl i Nua-Eabhrac agus i Londain freisin.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. Bíonn paráidí ollmhóra i gcathracha móra thar lear."
      },
      {
        "question": "Tá toirmeasc ar cheol agus ar rince Gaelach le linn na féile.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Bréagach. Bíonn ceol agus rince i lár an aonaigh i gcónaí."
      }
    ]
  },
  {
    "title": "Aillte an Mhothair agus Fiadhúlra Chósta an Atlantaigh (Cliffs of Moher)",
    "level": "A2",
    "language": "ga",
    "text": "Seasann Aillte an Mhothair go maorga ar chósta thiar Chontae an Chláir, áit a mbuaileann oileán na hÉireann go drámatúil le fórsa dothuigthe an Aigéin Atlantaigh. Síneann na haillte ollmhóra seo thar ocht gciliméadar ar fhad agus sroicheann siad airde os cionn dhá chéad méadar os cionn an uisce ag an bpointe is airde in aice le Túr Uí Bhriain. Tá an radharc ón mbarr iontach ar fad: ar lá glan, is féidir Oileáin Árann, Cuan na Gaillimhe agus cnoic Chonamara a fheiceáil go soiléir sa gcéin. Ní hamháin gur iontas geolaíochta iad na haillte, le sraitheanna carraigeacha gaineamhchloiche agus scealla a taisceadh níos mó ná trí chéad milliún bliain ó shin, ach is tearmann fiadhúlra ríthábhachtach iad freisin. Is láithreán neadaithe aitheanta idirnáisiúnta iad do bhreis is tríocha míle péire éan mara. Idir mhí Aibreáin agus mhí Iúil, tagann na mílte puifíní beaga ildaite, leis na goba geala oráisteacha agus na súile bríomhara, chun neadacha a dhéanamh i bpoill ar na fánaí féarmhara ar bharr na n-aillte. Chomh maith leis na puifíní, feictear foracha, crosáin agus faoileáin ag eitilt go healaíonta ar an ngaoth láidir. San uisce thíos, is minic a fheictear deilfeanna bolgshrónacha ag léim sna tonnta agus rónna liatha ag scíth ar na carraigeacha. Tá sé an-tábhachtach na conairí siúil a leanúint go cúramach mar gheall ar na gaotha arda agus an chontúirt titim. Meallann an suíomh seo breis is milliún cuairteoir gach bliain, daoine a thagann faoi dhraíocht ag áilleacht fhiáin nádúrtha na hÉireann.",
    "vocabularyHints": {
      "Aillte an Mhothair": "Cliffs of Moher",
      "gaineamhchloch": "sandstone",
      "sceall": "shale",
      "neadú": "nesting",
      "puifín": "puffin",
      "gob": "beak / bill",
      "foracha": "guillemot",
      "crosán": "razorbill",
      "deilf bholgshrónach": "bottlenose dolphin",
      "geolaíocht": "geology"
    },
    "mcqQuestions": [
      {
        "question": "Cén contae ina bhfuil Aillte an Mhothair suite?",
        "options": [
          "Contae Chorcaí",
          "Contae an Chláir",
          "Contae Chiarraí",
          "Contae Phort Láirge"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Tá siad suite ar chósta Chontae an Chláir."
      },
      {
        "question": "Cén airde a shroicheann na haillte ag an bpointe is airde?",
        "options": [
          "Fiche méadar",
          "Os cionn dhá chéad méadar",
          "Míle méadar",
          "Deich méadar"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Sroicheann siad os cionn 200 méadar os cionn na farraige."
      },
      {
        "question": "Cén t-éan mara ildaite a neadaíonn ar na haillte sa samhradh?",
        "options": [
          "An lasairéan",
          "An puifín lena ghob oráisteach",
          "An phiongain",
          "An colm bán"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Neadaíonn na mílte puifín ildaite ann."
      },
      {
        "question": "Cén aois atá ag na sraitheanna carraigeacha de réir na ngeolaithe?",
        "options": [
          "Céad bliain",
          "Níos mó ná trí chéad milliún bliain",
          "Deich míle bliain",
          "Míle bliain"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Tá na carraigeacha os cionn 300 milliún bliain d'aois."
      },
      {
        "question": "Cad a fheictear go minic ag léim san uisce faoi na haillte?",
        "options": [
          "Crogall",
          "Deilfeanna bolgshrónacha agus rónna",
          "Capall uisce",
          "Siorcanna bán mhóra"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Feictear deilfeanna ag snámh agus ag léim sna tonnta."
      }
    ],
    "tfQuestions": [
      {
        "question": "Tá Aillte an Mhothair suite ar chósta thiar na hÉireann.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. Tá siad ar imeall an Atlantaigh i gContae an Chláir."
      },
      {
        "question": "Ní thagann aon éan mara chun neadacha a dhéanamh ar na haillte.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Bréagach. Neadaíonn os cionn tríocha míle péire éan mara ann."
      },
      {
        "question": "Is féidir Oileáin Árann a fheiceáil ón mbarr ar lá glan.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. Bíonn radharc leathan ar Chuan na Gaillimhe."
      },
      {
        "question": "Tá sé sábháilte léim thar na ballaí cosanta ar imeall na haille.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Bréagach. Tá sé an-chontúirteach mar gheall ar na gaotha."
      },
      {
        "question": "Tagann níos mó ná milliún duine ar cuairt chun na n-aillte gach bliain.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. Is é seo ceann de na láithreáin is mó a bhfuil tóir air."
      }
    ]
  },
  {
    "title": "Athbheochan na Gaeilge agus Gluaiseacht na nGaelscoileanna (Revival of Irish Language)",
    "level": "B1",
    "language": "ga",
    "text": "Tá stair na Gaeilge ar cheann de na scéalta teanga is casta agus is spreagúla san Eoraip. Cé gur laghdaigh tionchar an Ghorta Mhóir agus polasaithe coilíneacha líon na gcainteoirí dúchais go tubaisteach sa naoú haois déag, tá borradh agus dóchas nua tagtha faoin teanga sa lá atá inniu ann a bhuíochas do ghluaiseacht phobail fhuinniúil. Ceann de na forbairtí is suntasaí le leathchéad bliain anuas ná fás dochreidte na nGaelscoileanna agus na nGaelcholáistí — scoileanna lán-Ghaeilge lasmuigh de na ceantair thraidisiúnta Ghaeltachta. Thosaigh an ghluaiseacht seo le grúpaí beaga tuismitheoirí a bhí meáite ar oideachas ardchaighdeáin trí mheán na Gaeilge a chur ar fáil dá gcuid páistí. Inniu, tá na céadta Gaelscoil ar fud Phoblacht na hÉireann agus i dTuaisceart Éireann, agus bíonn éileamh ollmhór ar áiteanna iontu gach bliain toisc go léiríonn taighde go gcuidíonn an détheangachas go mór le forbairt intleachtúil, shóisialta agus chognaíoch an linbh. Taobh amuigh den chóras oideachais, tá réabhlóid iomlán tarlaithe sna meáin chumarsáide Ghaeilge. Cuireann stáisiúin teilifíse agus raidió ar nós TG4 agus Raidió na Gaeltachta cláir nuálacha ar fáil a mheallann lucht féachana leathan idir óg agus aosta. Ina theannta sin, tá tionchar ollmhór ag an teicneolaíocht dhigiteach: tá aipeanna soghluaiste ar nós Duolingo tar éis cabhrú le milliúin daoine ar fud an domhain Gaeilge a fhoghlaim, agus tá pobail bhríomhara Ghaeilge ag cruthú ábhair ar na meáin shóisialta gach lá. Ní iarsma den am atá thart í an Ghaeilge a thuilleadh, ach uirlis bheo chumarsáide a nascann féiniúlacht na hÉireann lena todhchaí nua-aimseartha.",
    "vocabularyHints": {
      "athbheochan": "revival",
      "Gaelscoil": "all-Irish primary school",
      "Gaelcholáiste": "all-Irish secondary school",
      "détheangachas": "bilingualism",
      "cogníoch": "cognitive",
      "meáin chumarsáide": "communications media",
      "TG4": "TG4 (Irish-language TV station)",
      "teicneolaíocht dhigiteach": "digital technology",
      "féiniúlacht": "identity",
      "iarsma": "relic / remnant"
    },
    "mcqQuestions": [
      {
        "question": "Cad é an phríomhghluaiseacht oideachais a chabhraigh le hathbheochan na Gaeilge?",
        "options": [
          "Scoileanna príobháideacha Béarla",
          "Gluaiseacht na nGaelscoileanna lasmuigh den Ghaeltacht",
          "Ranganna oíche amháin",
          "Dúnadh na scoileanna"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Gluaiseacht na nGaelscoileanna agus na nGaelcholáistí."
      },
      {
        "question": "Cé a chuir tús le bunú na chéad Ghaelscoileanna nua-aimseartha?",
        "options": [
          "Rialtais eachtracha",
          "Grúpaí tiomnaithe tuismitheoirí áitiúla",
          "Bainc mhóra",
          "Údaráis mhíleata"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Thosaigh tuismitheoirí iad ar an leibhéal pobail."
      },
      {
        "question": "Cén buntáiste a léiríonn taighde faoin oideachas trí mheán an détheangachais?",
        "options": [
          "Cuireann sé mearbhall ar pháistí",
          "Cuidíonn sé le forbairt chognaíoch agus intleachtúil an linbh",
          "Fágann sé nach bhfoghlaimítear matamaitic",
          "Laghdaíonn sé scileanna sóisialta"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Feabhsaíonn an détheangachas forbairt intinne an pháiste."
      },
      {
        "question": "Cén stáisiún teilifíse náisiúnta Gaeilge a luaitear sa sliocht?",
        "options": [
          "RTE One",
          "TG4",
          "BBC",
          "CNN"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Soláthraíonn TG4 seirbhís nua-aimseartha teilifíse as Gaeilge."
      },
      {
        "question": "Cén tionchar atá ag aipeanna cosúil le Duolingo ar an nGaeilge?",
        "options": [
          "Laghdaíonn siad spéis na ndaoine",
          "Cuidíonn siad le milliúin daoine ar fud an domhain an teanga a fhoghlaim",
          "Ní oibríonn siad",
          "Cuireann siad toirmeasc ar an teanga"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Leathnaíonn siad an teanga ar fud an domhain go digiteach."
      }
    ],
    "tfQuestions": [
      {
        "question": "Tá éileamh mór ar áiteanna sna Gaelscoileanna ar fud na tíre.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. Bíonn éileamh leanúnach ar oideachas lán-Ghaeilge."
      },
      {
        "question": "Ní fhaightear Gaelscoileanna ach taobh istigh de na ceantair Ghaeltachta amháin.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Bréagach. Tá siad bunaithe ar fud na mbailte móra agus cathracha."
      },
      {
        "question": "Tá cláir nua-aimseartha nuálacha á gcur ar fáil ag TG4.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. Cuireann TG4 seirbhís ardchaighdeáin ar fáil."
      },
      {
        "question": "Níl aon ról ag na meáin shóisialta i saol na Gaeilge inniu.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Bréagach. Tá pobal bríomhar ar líne ag cruthú ábhair as Gaeilge."
      },
      {
        "question": "Aithnítear an Ghaeilge anois mar theanga bheo nua-aimseartha.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. Is teanga chomhaimseartha í a bhfuil todhchaí aici."
      }
    ]
  },
  {
    "title": "Féilte Ceilteacha: Samhain, Imbolc, Bealtaine agus Lúnasa (The Four Celtic Festivals)",
    "level": "B1",
    "language": "ga",
    "text": "Sula dtáinig an Chríostaíocht go hÉirinn, bhí saol na sean-Ghael comhtháite go dlúth le timthriall an nádúir, le gluaiseacht na gréine agus le séasúir na talmhaíochta. Bhí an bhliain Cheilteach roinnte ina dhá leath mhór — an leath dhorcha (an geimhreadh) agus an leath gheal (an samhradh) — agus ba iad ceithre phríomhfhéile cheathrún a mharcáil an t-aistriú idir na céimeanna éagsúla: Samhain, Imbolc, Bealtaine agus Lúnasa. Ba í Féile na Samhna, ar an gcéad lá de mhí Shamhna (an chéad lá de Shamhain), tús na bliana nua Ceiltí. Chreidtí go raibh an teorainn idir an saol seo agus an t-alltar an-tanaí ag an am seo, rud a d'fhág go bhféadfadh spioraid agus sióga taisteal idir an dá shaol. Is as deasghnátha na Samhna a d'eascair Oíche Shamhna nua-aimseartha (Halloween), lena n-áirítear tinte cnámh, feistis cheilteacha agus úlla a shamhlú. Ar an gcéad lá de mhí Feabhra tháinig Imbolc, féile a bhain le tús an earraigh, le breith na n-uan agus le lacht na gcaorach; nascadh an fhéile seo níos déanaí le Naomh Bríd agus a cros luachra cáiliúil. Ag tús mhí na Bealtaine, lasadh tinte móra ar chnoic ar nós Chnoc Uisnigh chun fáilte a chur roimh theas an tsamhraidh agus chun eallach a chosaint trí iad a thiomáint idir dhá thine bheannaithe. Ar deireadh, ag tús mhí Lúnasa, ceiliúradh Féile Lúnasa in onóir an dé Lú, féile a mharcáil tús an fhómhair agus rath na mbarr talmhaíochta. Léiríonn na seandeasghnátha seo an meas as cuimse a bhí ag na Ceiltigh ar rithimí na cruinne.",
    "vocabularyHints": {
      "timthriall": "cycle",
      "leath dhorcha": "dark half of the year",
      "féilte ceathrún": "quarter festivals",
      "alltar": "otherworld",
      "sióga": "fairies / otherworldly beings",
      "deasghnátha": "rituals / rites",
      "Imbolc": "Imbolc (spring festival)",
      "lacht": "milk / lactation",
      "cros Bhríde": "St. Brigid's rush cross",
      "fómhar": "harvest / autumn"
    },
    "mcqQuestions": [
      {
        "question": "Cén fhéile a mharcáil tús na bliana nua i bhféilire na gCeilteach?",
        "options": [
          "Bealtaine",
          "Samhain ag tús mhí na Samhna",
          "Imbolc",
          "Lúnasa"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Ba í an tSamhain tús na bliana nua Ceiltí."
      },
      {
        "question": "Cén fhéile nua-aimseartha dhomhanda a d'eascair as nósanna na Samhna?",
        "options": [
          "An Cháisc",
          "Oíche Shamhna (Halloween)",
          "Lá an Lucht Oibre",
          "Lá Altaithe"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Is as an Samhain a d'eascair Halloween."
      },
      {
        "question": "Cén comhartha den earrach a bhain go traidisiúnta le Féile Imbolc?",
        "options": [
          "Duilleoga ag titim",
          "Breith na n-uan agus lacht na gcaorach",
          "Sioc mór ar na lochanna",
          "Baint an arbhair"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Bhain sé le breith na n-uan agus fás nua."
      },
      {
        "question": "Cad a dhéantaí leis an eallach le linn Fhéile na Bealtaine?",
        "options": [
          "Cuireadh i bhfolach iad",
          "Tiomáineadh iad idir dhá thine bheannaithe mar chosaint",
          "Seoladh ar bháid iad",
          "Díoladh thar lear iad"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Tiomáineadh iad idir dhá thine mar chosaint spioradálta."
      },
      {
        "question": "Cén dia Ceilteach a raibh féile an fhómhair i mí Lúnasa ainmnithe ina onóir?",
        "options": [
          "Dagda",
          "Lú (Lugh Lamhfhada)",
          "Balor",
          "Manannán"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Ainmníodh Féile Lúnasa in onóir an dé Lú."
      }
    ],
    "tfQuestions": [
      {
        "question": "Bhí ceithre phríomhfhéile cheathrún ag na Ceiltigh ársa.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. Samhain, Imbolc, Bealtaine agus Lúnasa a bhí iontu."
      },
      {
        "question": "Chreidtí go raibh doras an alltair ar oscailt le linn Oíche Shamhna.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. Chreidtí go raibh na spioraid in ann teacht trasna."
      },
      {
        "question": "Bhain Féile Imbolc le deireadh an tsamhraidh agus an sioc mór.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Bréagach. Bhain sí le tús an earraigh agus tús na beatha nua."
      },
      {
        "question": "Lasadh tinte móra Bealtaine ar Chnoc Uisnigh chun fáilte a chur roimh an samhradh.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. Bhíodh tinte mhóra Bealtaine ag lasadh ar chnoic."
      },
      {
        "question": "Ní raibh aon bhaint ag na féilte seo le saol na talmhaíochta.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Bréagach. Bhí siad fite fuaite le barra agus beithígh."
      }
    ]
  },
  {
    "title": "Stair an Ghorta Mhóir agus an Imirce go Meiriceá (The Great Famine & Emigration)",
    "level": "B1",
    "language": "ga",
    "text": "Is é an Gorta Mór (1845–1852) an tragóid ba mhó agus ba dhoimhne i stair nua-aimseartha na hÉireann, tubaiste dhaonna a d'athraigh déimeagrafaic, teanga agus sochaí an oileáin go deo. I lár an naoú haois déag, bhí daonra na hÉireann os cionn ocht milliún duine, ach bhí an chuid ba mhó de na cosmhuintir ag brath go hiomlán ar bharr amháin le haghaidh a gcothaithe: an práta. Nuair a bhuail an dúchan (Phytophthora infestans) an tír sa bhliain 1845, theip ar an mbarr prátaí bliain i ndiaidh bliana, rud a d'fhág na milliúin feirmeoirí tionóntacha gan aon fhoinse bia. Cé go raibh daoine ag fáil bháis den ocras agus de ghalair uafásacha ar nós an tíofais agus an fhiabhrais chliste, lean rialtas na Breataine ar aghaidh ag easpórtáil gráin, eallach agus muiceoil as an tír faoi dhlíthe dian-eacnamaíochta an mhargaidh oscailte (laissez-faire). Fuair thart ar mhilliún duine bás le linn na mblianta dorcha sin, agus cuireadh iallach ar mhilliún go leith eile teitheadh ar na «báid chónra» thar an Atlantach go Meiriceá Thuaidh agus go Sasana. Bhí na coinníollacha ar na báid seo chomh hainnis sin go bhfuair cuid mhór de na heasláin bás ar an bhfarraige sular shroich siad Oileán Grosse i gCeanada nó Bostún. Thit daonra na hÉireann go tubaisteach agus cailleadh an chuid ba mhó de chainteoirí dúchais na Gaeilge san iarthar. Mar sin féin, d'éirigh leis an diaspóra Éireannach i Meiriceá, i gCeanada agus san Astráil pobail thábhachtacha a bhunú a raibh tionchar ollmhór acu ar pholaitíocht agus ar chultúr an domhain.",
    "vocabularyHints": {
      "Gorta Mór": "Great Famine",
      "déimeagrafaic": "demographics",
      "dúchan": "potato blight",
      "feirmeoir tionóntach": "tenant farmer",
      "tíofas": "typhus",
      "laissez-faire": "laissez-faire economics",
      "báid chónra": "coffin ships",
      "ainnis": "miserable / wretched",
      "diaspóra": "diaspora",
      "easláin": "invalids / sick people"
    },
    "mcqQuestions": [
      {
        "question": "Cén tréimhse inar tharla an Gorta Mór in Éirinn?",
        "options": [
          "1700–1705",
          "1845–1852",
          "1914–1918",
          "1939–1945"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Tharla an Gorta Mór idir 1845 agus 1852."
      },
      {
        "question": "Cén barr ar a raibh cosmhuintir na hÉireann ag brath le haghaidh bia?",
        "options": [
          "Rís",
          "An práta",
          "Cruithneacht amháin",
          "Pónairí"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Bhí an pobal ag brath go hiomlán ar an bpráta."
      },
      {
        "question": "Cad a bhí ag tarlú don bhia eile (grán agus eallach) le linn an Ghorta?",
        "options": [
          "Roinneadh saor in aisce ar na daoine é",
          "Leanadh ar aghaidh á n-easpórtáil as Éirinn",
          "Dóghadh an t-iomlán",
          "Caitheadh san fharraige é"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Leanadh ar aghaidh ag easpórtáil bia as an tír."
      },
      {
        "question": "Cén leasainm a tugadh ar na longa bochta ar thaistil na heasláin orthu?",
        "options": [
          "Báid luais",
          "Báid chónra (coffin ships)",
          "Báid phaisinéirí só",
          "Naomhóga"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Tugadh báid chónra orthu mar gheall ar an mbásmhaireacht."
      },
      {
        "question": "Cén tionchar buan a bhí ag an nGorta ar an nGaeilge?",
        "options": [
          "Mhéadaigh líon na gcainteoirí",
          "Cailleadh cuid mhór de chainteoirí dúchais trí bhás agus imirce",
          "Ní raibh aon tionchar aige",
          "Tháinig an Ghaeilge i réim i mBostún amháin"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Bhuail sé buille tubaisteach do phobail labhartha na Gaeilge san iarthar."
      }
    ],
    "tfQuestions": [
      {
        "question": "Fuair timpeall milliún duine bás le linn an Ghorta Mhóir.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. Meastar gur cailleadh thart ar mhilliún duine."
      },
      {
        "question": "Ba é an dúchan ba chúis le cliseadh an bhairr phrátaí.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. Scrios an galar fungasach na prátaí."
      },
      {
        "question": "Bhí gach bád imirce compordach, sábháilte agus lán de bhia.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Bréagach. Bhí na coinníollacha uafásach ar na báid chónra."
      },
      {
        "question": "Níor fhág aon duine Éire le linn bhlianta an Ghorta.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Bréagach. D'imigh níos mó ná milliún go leith duine ar imirce."
      },
      {
        "question": "Bhunaigh an diaspóra Éireannach pobail thábhachtacha thar lear.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. D'fhás an diaspóra go láidir i Meiriceá agus thar lear."
      }
    ]
  },
  {
    "title": "Litríocht na Gaeilge: Ó na Sean-Scéalta go Máirtín Ó Cadhain (Irish Literature Heritage)",
    "level": "B1",
    "language": "ga",
    "text": "Tá traidisiún liteartha na Gaeilge ar cheann de na traidisiúin scríofa is sine in Iarthar na hEorpa, ag dul siar níos mó ná míle go leith bliain go dtí aimsir na luath-lámhscríbhinní mainistreach agus na hinscríbhinní Oghaim ar chlocha. Roinntear an tseanlitríocht i gceithre phríomhthimthriall miotaseolaíochta: Scéalta na Ríthe, Scéalaíocht na Rúraíochta (ina bhfuil an Táin Bó Cúailnge agus gaiscí Chú Chulainn), an Fhiannaíocht (scéalta gaisce faoi Fhionn Mac Cumhaill agus a lucht fiaigh), agus an Timthriall Miotaseolaíochta faoi Thuatha Dé Danann. Ar feadh na gcéadta bliain, choinnigh na filí gairmiúla — na baird — an cultúr beo trí dhánta casta siollacha a chumadh do na taoisigh Ghaelacha. Nuair a thit an seanchóras Gaelach i ndiaidh Chath Chionn tSáile, tháinig filíocht pholaitiúil an dóchais agus an bhróin chun cinn, cosúil le haislingí Eoghain Rua Uí Shúilleabháin agus Aogáin Uí Rathaille, ina samhlaítear Éire mar spéirbhean álainn atá ag fanacht le fuascailt ó bhrú na gcoilíneach. Sa fichiú haois, tharla athbheochan nua-aimseartha liteartha faoi thionchar Chonradh na Gaeilge. Ba é Máirtín Ó Cadhain, scríbhneoir réabhlóideach as an Spidéal i gConamara, buaicphointe an nua-aoisise réabhlóidigh seo. Léirigh a phríomhshaothar, Cré na Cille (1949), comhráite géara, greannmhara agus searbha idir corpáin atá curtha i reilig Chonamara. Tá an t-úrscéal seo aitheanta mar cheann de na sárshaothair nua-aoiseacha is mó san Eoraip, a thaispeánann saibhreas dochreidte agus cumhacht shollúnta na Gaeilge labhartha. Cuireann na forbairtí dearfacha seo go léir le saibhreas chultúrtha na tíre agus tugann siad misneach nua do lucht labhartha na teanga.",
    "vocabularyHints": {
      "lámhscríbhinn": "manuscript",
      "Ogham": "Ogham script",
      "Rúraíocht": "Ulster Cycle",
      "Fiannaíocht": "Fenian Cycle",
      "Táin Bó Cúailnge": "Cattle Raid of Cooley",
      "baird": "bards / court poets",
      "aisling": "vision poem (aisling genre)",
      "spéirbhean": "heavenly woman / vision maiden",
      "Cré na Cille": "The Dirty Dust (Cré na Cille)",
      "reilig": "graveyard / cemetery"
    },
    "mcqQuestions": [
      {
        "question": "Cad é an t-inscríbhinn ársa a bhíodh le fáil gearrtha ar chlocha in Éirinn?",
        "options": [
          "Hieroglyphs",
          "Ogham",
          "Rúnas",
          "Laidin amháin"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Ba é an t-Ogham an luathchóras scríofa ar chlocha."
      },
      {
        "question": "Cén sár-scéal eipiciúil atá mar chroílár Scéalaíocht na Rúraíochta?",
        "options": [
          "Oisín i dTír na nÓg",
          "Táin Bó Cúailnge",
          "Clann Lir",
          "Scéal Ghearóid Iarla"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Is é an Táin Bó Cúailnge príomh-eipic na Rúraíochta."
      },
      {
        "question": "Cad a bhí mar phríomhthéama sa seánra filíochta ar a dtugtar an «aisling»?",
        "options": [
          "Dánta grá simplí",
          "Éire á léiriú mar spéirbhean ag fanacht le saoirse",
          "Scéalta faoi ainmhithe feirme",
          "Treoracha cócaireachta"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Samhlaíodh Éire mar spéirbhean a bhí ag lorg fuascailte."
      },
      {
        "question": "Cé a scríobh an t-úrscéal nua-aimseartha cáiliúil «Cré na Cille»?",
        "options": [
          "Pádraig Mac Piarais",
          "Máirtín Ó Cadhain",
          "Seán Ó Ríordáin",
          "Breandán Ó hEithir"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Máirtín Ó Cadhain a scríobh Cré na Cille."
      },
      {
        "question": "Cá bhfuil carachtair an úrscéil «Cré na Cille» suite le linn an scéil?",
        "options": [
          "Ar long mhór san fharraige",
          "Faoi thalamh i reilig i gConamara",
          "I gcaisleán ríoga",
          "I bpríosún i mBaile Átha Cliath"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Bíonn na mairbh ag comhrá lena chéile faoin gcré sa reilig."
      }
    ],
    "tfQuestions": [
      {
        "question": "Tá traidisiún scríofa na Gaeilge ar cheann de na cinn is sine san Eoraip.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. Téann an traidisiún siar níos mó ná 1500 bliain."
      },
      {
        "question": "Níor scríobhadh aon dán ná scéal riamh sa Ghaeilge roimh an 20ú haois.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Bréagach. Tá corpas ollmhór meánaoiseach agus nua-aimseartha ann."
      },
      {
        "question": "Baineann scéalta na Fiannaíochta le Fionn Mac Cumhaill.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. Is é Fionn ceannaire na bhFiann sna seanscéalta."
      },
      {
        "question": "Meastar go bhfuil «Cré na Cille» ar cheann de shárshaothair an nua-aoiseachais.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. Tá cáil idirnáisiúnta ar úrscéal Uí Chadhain."
      },
      {
        "question": "Scríobhadh Cré na Cille i mBéarla ar dtús agus ansin aistríodh é.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Bréagach. Scríobhadh é go díreach i nGaeilge shaibhir Chonamara."
      }
    ]
  },
  {
    "title": "Éiceolaíocht na bPortach agus Fuinneamh In-athnuaite (Bogs & Renewable Energy)",
    "level": "B1",
    "language": "ga",
    "text": "Clúdaíonn portaigh móna cuid mhaith de thalamh na hÉireann, go háirithe i lár na tíre agus ar feadh chósta thiar an Atlantaigh. Ar feadh na mílte bliain, d'fhéach pobail tuaithe ar an bportach mar phríomhfhoinse teasa agus breosla: baineadh an mhóin go traidisiúnta le sleán, triomaíodh na foirbheacha faoin ngrian sa samhradh, agus dódh iad sna tinte teallaigh i rith an gheimhridh fhada. Sa fichiú haois, thosaigh Bord na Móna ag baint móna ar scála tionsclaíoch ollmhór le meaisíní móra chun stáisiúin leictreachais a rith. Mar sin féin, le blianta beaga anuas, tá athrú bunúsach tagtha ar an dearcadh náisiúnta i dtaobh na bportach mar gheall ar an ngéarchéim aeráide dhomhanda. Aithnítear anois gur éiceachórais fíor-luachmhara iad na portaigh a fheidhmíonn mar «chisteoirí carbóin» ollmhóra: stórálann na portaigh phortaigh shléibhe agus phortaigh arda níos mó carbóin ná foraoisí uile na tíre le chéile. Nuair a dhraenáiltear nó a dhóitear an mhóin, scaoiltear na milliúin tonna de gháis cheaptha teasa san atmaisféar. Dá bharr sin, tá Éire tar éis éirí as baint tionsclaíoch na móna agus tá cláir mhóra athfhliuchta agus athchóirithe á gcur i bhfeidhm chun na portaigh a thabhairt ar ais chun beatha mar ghnáthóga d'fhiadhúlra neamhchoitianta, lena n-áirítear an lus na móna, an fheochadán phortaigh agus an crotach cluasach. Ag an am céanna, tá an tír ag aistriú go fuinneamh in-athnuaite, ag baint leasa as gaotha láidre an Atlantaigh le feirmeacha gaoithe ar tír agus amach ón gcósta, agus cumhacht na gréine. Is sampla iontach é seo den chaoi ar féidir le nósanna traidisiúnta athrú ar mhaithe le todhchaí ghlas inbhuanaithe.",
    "vocabularyHints": {
      "portach": "peat bog",
      "sleán": "turf spade (slane)",
      "athfhliuchadh": "rewetting (of peatlands)",
      "cisteoir carbóin": "carbon sink",
      "gáis cheaptha teasa": "greenhouse gases",
      "in-athnuaite": "renewable",
      "feirm ghaoithe": "wind farm",
      "crotach": "curlew (bird)",
      "gnáthóg": "habitat",
      "inbhuanaithe": "sustainable"
    },
    "mcqQuestions": [
      {
        "question": "Cén uirlis thraidisiúnta a d'úsáidtí chun móin a bhaint de láimh san am atá thart?",
        "options": [
          "Speal",
          "Sleán",
          "Ráca",
          "Píce"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Baineadh an mhóin le sleán traidisiúnta."
      },
      {
        "question": "Cén ról tábhachtach éiceolaíoch a bhíonn ag portaigh sa lá atá inniu ann?",
        "options": [
          "Draenálann siad aibhneacha",
          "Stórálann siad méideanna ollmhóra carbóin ón atmaisféar",
          "Táirgeann siad plaisteach",
          "Níl aon ról acu"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Feidhmíonn siad mar thaiscumair mhóra charbóin."
      },
      {
        "question": "Cad a tharlaíonn nuair a dhraenáiltear agus a dhóitear portaigh?",
        "options": [
          "Glanann sé an t-aer",
          "Scaoiltear gáis cheaptha teasa a dhéanann dochar don aeráid",
          "Fásann crainn torthaí láithreach",
          "Éiríonn an talamh reoite"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Scaoiltear méideanna ollmhóra dé-ocsaíde carbóin."
      },
      {
        "question": "Cén beart atá á dhéanamh ag Éirinn anois chun portaigh a chosaint?",
        "options": [
          "Baint na móna a mhéadú faoi dhó",
          "Cláir mhóra athfhliuchta agus caomhnaithe a chur i bhfeidhm",
          "Gach portach a chlúdach le coincréit",
          "Crainn bhabhúin a chur iontu"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Tá cláir athfhliuchta á gcur i bhfeidhm chun iad a athbheochan."
      },
      {
        "question": "Cén fhoinse fuinnimh in-athnuaite a bhfuil an-acmhainn ag baint léi in Éirinn?",
        "options": [
          "Fuinneamh núicléach",
          "Fuinneamh gaoithe ó ghaotha láidre an Atlantaigh",
          "Gual dubh",
          "Gás nádúrtha allmhairithe"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Fuinneamh gaoithe ar tír agus amach ón gcósta."
      }
    ],
    "tfQuestions": [
      {
        "question": "Bhíodh an mhóin mar phríomhfhoinse teasa do theaghlaigh thuaithe.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. Dódh an mhóin i dtinte teallaigh ar feadh na gcéadta bliain."
      },
      {
        "question": "Stórálann portaigh níos mó carbóin ná gach foraois in Éirinn le chéile.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. Is cisteoirí carbóin fíor-chumhachtacha iad."
      },
      {
        "question": "Tá Éire ag leanúint ar aghaidh ag baint móna ar scála mór tionsclaíoch.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Bréagach. Tá deireadh curtha le baint thionsclaíoch na móna."
      },
      {
        "question": "Cuidíonn athfhliuchadh na bportach le gnáthóga éan agus plandaí a shábháil.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. Tagann fiadhúlra ar leith ar ais sna portaigh athfhásta."
      },
      {
        "question": "Níl aon ghaoth ná acmhainn in-athnuaite ag oileán na hÉireann.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Bréagach. Tá ceann de na hacmhainní gaoithe is mó san Eoraip ag Éirinn."
      }
    ]
  },
  {
    "title": "Athbheochan Liteartha na hÉireann: Yeats, Lady Gregory agus an Abbey (Irish Literary Revival)",
    "level": "B2",
    "language": "ga",
    "text": "Ag deireadh an naoú haois déag agus ag tús an fichiú haois, tharla gluaiseacht chultúrtha thar a bheith cumhachtach in Éirinn ar a dtugtar Athbheochan Liteartha na hÉireann (nó an Renaissance Ceilteach). Bhí an ghluaiseacht seo dírithe ar fhéiniúlacht náisiúnta shoiléir a athchruthú trí mhiotaseolaíocht, béaloideas agus stair ársa na hÉireann a thabhairt chun tosaigh sa litríocht, sa drámaíocht agus san fhilíocht. Ba iad an file mór William Butler Yeats, an drámadóir agus bailitheoir béaloidis Lady Augusta Gregory, agus an fealsamh Edward Martyn ceannairí na gluaiseachta seo. Chreid siad go daingean go raibh gá le saothair ealaíne a bhí fréamhaithe i spiorad Gaelach na tíre seachas a bheith ag brath go géilliúil ar chultúr Shasana. Sa bhliain 1904, bhunaigh Yeats agus Lady Gregory Amharclann na Mainistreach (The Abbey Theatre) i mBaile Átha Cliath, institiúid a tháinig chun bheith ina hAmharclann Náisiúnta d'Éirinn agus a chuir tús le ré órga sa drámaíocht dhomhanda. Ar stáitse na Mainistreach, cuireadh drámaí réabhlóideacha i láthair a spreag díospóireachtaí teasaí agus corraíl fiú, ar nós The Playboy of the Western World le J.M. Synge agus The Plough and the Stars le Seán O'Casey. Chuir dráma Synge fearg ar roinnt lucht féachana toisc gur léirigh sé saol tuaithe i gConamara ar bhealach réalaíoch neamhbhalbh in ionad íomhá idéalach rómánsúil a thaispeáint. San am céanna, bhí Yeats ag scríobh filíochta maorga a thuill Duais Nobel na Litríochta dó i 1923, an chéad Éireannach a ghnóthaigh an t-éacht sin. Chuir an Athbheochan Liteartha bonn spioradálta agus cultúrtha faoin éileamh polaitiúil ar fhéinchinneadh náisiúnta, ag cruthú na heite intleachtúla a d'ullmhaigh an bealach do neamhspleáchas na tíre. Léiríonn na gnéithe éagsúla seo uile beocht agus athléimneacht phobal na hÉireann agus iad ag múnlú a dtodhchaí féin sa nua-aois.",
    "vocabularyHints": {
      "Athbheochan Liteartha": "Literary Revival",
      "Amharclann na Mainistreach": "Abbey Theatre",
      "miotaseolaíocht": "mythology",
      "drámadóir": "playwright",
      "béaloideas": "folklore",
      "ré órga": "golden era",
      "féinchinneadh": "self-determination",
      "Duais Nobel": "Nobel Prize",
      "stáitse": "stage",
      "corraíl": "unrest / riots"
    },
    "mcqQuestions": [
      {
        "question": "Cad a bhí mar phríomhacus d'Athbheochan Liteartha na hÉireann?",
        "options": [
          "Gach seanscéal a dhíothú",
          "Féiniúlacht náisiúnta a athchruthú trí fhilíocht, béaloideas agus miotaseolaíocht",
          "Litríocht eachtrach amháin a léamh",
          "Sciúradh teanga"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Bhí sí dírithe ar oidhreacht Cheilteach agus spiorad Gaelach a athbheochan."
      },
      {
        "question": "Cé na daoine a bhunaigh Amharclann na Mainistreach (The Abbey Theatre) i 1904?",
        "options": [
          "James Joyce agus Samuel Beckett",
          "W.B. Yeats agus Lady Augusta Gregory",
          "Bram Stoker agus Oscar Wilde",
          "Pádraig Mac Piarais amháin"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Bhunaigh W.B. Yeats agus Lady Gregory an amharclann náisiúnta."
      },
      {
        "question": "Cén fáth ar tharla círéibeacha le linn dráma J.M. Synge «The Playboy of the Western World»?",
        "options": [
          "Toisc go raibh an ticéad ró-daor",
          "Toisc gur léirigh sé saol tuaithe ar bhealach réalaíoch searbh seachas idéalaithe",
          "Toisc nach raibh aon aisteoirí ar an stáitse",
          "Toisc gur thit an díon"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Chuir an léiriú réalaíoch ar mhuintir an iarthair fearg ar an lucht féachana."
      },
      {
        "question": "Cén gradam domhanda mór a bhuaigh W.B. Yeats sa bhliain 1923?",
        "options": [
          "Duais Nobel na Litríochta",
          "Gradam Oscar",
          "Bonn Oilimpeach",
          "Duais Pulitzer"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Ghnóthaigh Yeats Duais Nobel na Litríochta i 1923."
      },
      {
        "question": "Cén nasc a bhí idir an ghluaiseacht liteartha agus polaitíocht na hÉireann?",
        "options": [
          "Chuir sí cosc ar pholaitíocht",
          "Chruthaigh sí muinín chultúrtha a neartaigh an t-éileamh ar neamhspleáchas náisiúnta",
          "Mhol sí fanacht faoi riail Shasana go deo",
          "Ní raibh aon bhaint acu le chéile"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Chuir sí bonn cultúrtha faoin éileamh ar fhéinchinneadh polaitiúil."
      }
    ],
    "tfQuestions": [
      {
        "question": "Bunaíodh Amharclann na Mainistreach i mBaile Átha Cliath i 1904.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. Is í amharclann náisiúnta na tíre í."
      },
      {
        "question": "Ba é W.B. Yeats an chéad scríbhneoir Éireannach a bhuaigh Duais Nobel na Litríochta.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. Bhuaigh sé an duais mhór i 1923."
      },
      {
        "question": "Níor scríobh Lady Gregory aon dráma ná bailiúchán béaloidis riamh.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Bréagach. Bhí sí ar phríomhcheannairí agus scríbhneoirí na gluaiseachta."
      },
      {
        "question": "Ghlac gach duine go fonnmhar le drámaí Synge gan aon chur ina gcoinne.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Bréagach. Tharla corraíl agus díospóireachtaí géara faoina dhrámaí."
      },
      {
        "question": "Chuidigh an ghluaiseacht le bród náisiúnta a chothú i measc mhuintir na hÉireann.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. Neartaigh sí féiniúlacht na tíre go mór."
      }
    ]
  },
  {
    "title": "Éirí Amach na Cásca 1916 agus Bunú an Stáit (The 1916 Rising & Irish Independence)",
    "level": "B2",
    "language": "ga",
    "text": "Ar Luan Cásca, an 24 Aibreán 1916, tharla ceann de na heachtraí ba chinniúnaí i stair pholaitiúil na hÉireann nuair a d'éirigh grúpa beag náisiúnaithe armtha amach i gcoinne Impireacht na Breataine i mBaile Átha Cliath. Faoi cheannas ceannairí ar nós Phádraig Mhic Phiarais, Shéamuis Uí Chonghaile agus Thomáis Uí Chléirigh, ghabh Óglaigh na hÉireann agus Arm Cathartha na hÉireann príomhfhoirgnimh straitéiseacha ar fud na cathrach, go háirithe Ard-Oifig an Phoist (an GPO) ar Shráid Uí Chonaill. Ar chéimeanna an GPO, léigh Pádraig Mac Piarais Forógra na Poblachta os ard, cáipéis dhrámatúil a d'fhógair Poblacht Neamhspleách na hÉireann agus a gheall cearta comhionanna, saoirse reiligiúnach agus vótáil uilechoiteann do gach saoránach, idir fhir agus mhná — prionsabal thar a bheith forásach san Eoraip ag an am. Mhair an troid fhuilteach ar feadh seachtaine amháin i gcoinne fórsaí armtha na Breataine a raibh airtléire throm agus gunna-bháid acu. Scriosadh cuid mhór de lár Bhaile Átha Cliath sular ghéill na reibiliúnaigh ar an Satharn chun tuilleadh básanna sibhialtacha a chosc. Cé go raibh formhór mhuintir na cathrach naimhdeach i dtreo an Éirí Amach ar dtús, d'athraigh an meon poiblí go hiomlán nuair a chuir arm na Breataine ceathrar déag de na príomhcheannairí chun báis i bPríosún Chill Mhaighneann, James Connolly ina measc a bhí gortaithe go holc agus a cuireadh chun báis ina shuí i gcathaoir. Spreag an fealladh seo fearg uilechoiteann agus chruthaigh sé tonn náisiúnachais a threoraigh go díreach chuig Cogadh na Saoirse (1919–1921) agus bunú Shaorstát Éireann. D'fhág 1916 oidhreacht mharthanach de dhílseacht do phrionsabail an daonlathais agus an cheartais shóisialta. Léiríonn na gnéithe éagsúla seo uile beocht agus athléimneacht phobal na hÉireann agus iad ag múnlú a dtodhchaí féin sa nua-aois.",
    "vocabularyHints": {
      "Éirí Amach na Cásca": "1916 Easter Rising",
      "Ard-Oifig an Phoist": "General Post Office (GPO)",
      "Forógra na Poblachta": "Proclamation of the Republic",
      "vótáil uilechoiteann": "universal suffrage",
      "forásach": "progressive",
      "reibiliúnach": "rebel",
      "Príosún Chill Mhaighneann": "Kilmainham Gaol",
      "cur chun báis": "execution",
      "Cogadh na Saoirse": "War of Independence",
      "Saorstát": "Free State"
    },
    "mcqQuestions": [
      {
        "question": "Cén foirgneamh stairiúil a bhí mar phríomhcheanncheathrú ag na reibiliúnaigh i 1916?",
        "options": [
          "Caisleán Bhaile Átha Cliath",
          "Ard-Oifig an Phoist (GPO)",
          "Coláiste na Tríonóide",
          "Teach an Chustaim"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Bhí an GPO ar Shráid Uí Chonaill mar cheanncheathrú."
      },
      {
        "question": "Cad a léigh Pádraig Mac Piarais os ard ar chéimeanna an fhoirgnimh?",
        "options": [
          "Forógra na Poblachta",
          "Dán fada Gaeilge",
          "Leabhar Dlí Shasana",
          "Bille cánach"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Léigh sé Forógra stairiúil na Poblachta."
      },
      {
        "question": "Cén prionsabal forásach a bhí leagtha síos i bhForógra na Poblachta 1916?",
        "options": [
          "Cearta speisialta d'uaisle amháin",
          "Cearta comhionanna agus vótáil do gach saoránach, idir fhir agus mhná",
          "Cosc ar reiligiún",
          "Monarcacht nua a bhunú"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Gheall sé cearta comhionanna agus cearta vótála do gach saoránach."
      },
      {
        "question": "Cá cuireadh na príomhcheannairí chun báis tar éis an Éirí Amach?",
        "options": [
          "I bPáirc an Fhionnuisce",
          "I bPríosún Chill Mhaighneann",
          "I Londain",
          "Ar oileán iargúlta"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Cuireadh iad chun báis i gclós Phríosún Chill Mhaighneann."
      },
      {
        "question": "Cén éifeacht a bhí ag cur chun báis na gceannairí ar mheon mhuintir na hÉireann?",
        "options": [
          "Chuir sé deireadh leis an náisiúnachas",
          "Spreag sé fearg ollmhór agus tacaíocht uilechoiteann do neamhspleáchas na tíre",
          "Rinne sé daoine an-sásta",
          "Níor thug éinne faoi deara é"
        ],
        "correctAnswerIndex": 1,
        "explanation": "D'athraigh sé meon an phobail go hiomlán ar son na saoirse."
      }
    ],
    "tfQuestions": [
      {
        "question": "Tharla Éirí Amach na Cásca sa bhliain 1916.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. Thosaigh sé ar Luan Cásca 1916."
      },
      {
        "question": "Mhair an troid i lár Bhaile Átha Cliath ar feadh seachtaine amháin.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. Ghéill na reibiliúnaigh tar éis seachtaine troda."
      },
      {
        "question": "Níor chuir arm na Breataine aon cheannaire chun báis tar éis na troda.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Bréagach. Cuireadh ceathrar déag chun báis go míthrócaireach."
      },
      {
        "question": "Bhí James Connolly ar dhuine de phríomhcheannairí an Éirí Amach.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. Bhí sé i gceannas ar Arm Cathartha na hÉireann."
      },
      {
        "question": "Threoraigh imeachtaí 1916 go díreach chuig Cogadh na Saoirse.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. Spreag sé an streachailt ar son an neamhspleáchais."
      }
    ]
  },
  {
    "title": "An Ghaeltacht sa Nua-Aois: Teicneolaíocht agus Pobail Tuaithe (The Modern Gaeltacht)",
    "level": "B2",
    "language": "ga",
    "text": "Le blianta beaga anuas, tá claochlú suntasach ag teacht ar réigiúin Ghaeltachta na hÉireann agus iad ag iarraidh freagairt do dhúshláin an aonú haois fichead. Go stairiúil, ba cheantair iargúlta tuaithe iad na Gaeltachtaí ar chósta thiar agus theas na tíre a bhí ag brath go mór ar thalmhaíocht thraidisiúnta, ar iascaireacht shéasúrach agus ar thurasóireacht shamhraidh. Cé gur chuidigh an t-iargúltacht sin le caomhnú na Gaeilge mar theanga phobail thar na glúnta, chruthaigh sé deacrachtaí tromchúiseacha eacnamaíochta freisin, go háirithe dífhostaíocht ard agus imirce leanúnach daoine óga oilte go dtí na cathracha móra nó thar lear. Chun an taoide seo a chasadh, tá eagraíochtaí forbartha ar nós Údarás na Gaeltachta ag cur béime láidir anois ar an ngeilleagar digiteach agus ar nuálaíocht teicneolaíochta. Ceann de na tionscnaimh is rathúla ná gréasán «Gteic» — níos mó ná tríocha mol digiteach nua-aimseartha a bunaíodh i gcroílár na bpobal Gaeltachta ó Dhún na nGall go Ciarraí. Soláthraíonn na moil seo ard-bhanna leathan snáthoptaice, spásanna comhoibrithe nua-aoiseacha agus tacaíocht ghnó do chian-oibrithe, d'fhiontraithe agus do chuideachtaí idirnáisiúnta. De bharr na bhforbairtí seo, tá daoine óga atá líofa sa Ghaeilge in ann fanacht ina bpobail dhúchais agus gairmeacha ardluacha a thógáil i réimsí ar nós na meán digiteach, bogearraí, bitheolaíocht mhara agus seirbhísí airgeadais. Ní hamháin go neartaíonn an fhorbairt eacnamaíoch seo geilleagar na dtuath, ach cuireann sí bonn daingean faoi inmharthanacht na Gaeilge mar theanga theaghlaigh agus oibre, ag léiriú go bhfuil áit lárnach ag cultúr dúchais na tíre i dteicneolaíocht dhomhanda an lae inniu. Léiríonn na gnéithe éagsúla seo uile beocht agus athléimneacht phobal na hÉireann agus iad ag múnlú a dtodhchaí féin sa nua-aois. Léiríonn na gnéithe éagsúla seo uile beocht agus athléimneacht phobal na hÉireann agus iad ag múnlú a dtodhchaí féin sa nua-aois.",
    "vocabularyHints": {
      "claochlú": "transformation",
      "iargúlta": "remote / isolated",
      "dífhostaíocht": "unemployment",
      "imirce": "emigration",
      "Údarás na Gaeltachta": "Údarás na Gaeltachta (development authority)",
      "Gteic": "Gteic (Gaeltacht digital hub network)",
      "cian-oibrí": "remote worker",
      "fiontraí": "entrepreneur",
      "inmharthanacht": "viability / sustainability",
      "snáthoptaic": "fiber-optic broadband"
    },
    "mcqQuestions": [
      {
        "question": "Cad iad na príomhdhúshláin thraidisiúnta a bhí roimh phobail na Gaeltachta?",
        "options": [
          "Ró-dhaonra cathrach",
          "Dífhostaíocht ard agus imirce leanúnach daoine óga",
          "Easpa uisce",
          "Ró-chuid monarchana móra"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Bhí fadhbanna imirce agus dífhostaíochta ag cur isteach orthu."
      },
      {
        "question": "Cén eagraíocht stáit atá freagrach as forbairt eacnamaíoch na Gaeltachta?",
        "options": [
          "Bord Fáilte",
          "Údarás na Gaeltachta",
          "Bord Bia",
          "Bord na Móna"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Is é Údarás na Gaeltachta an ghníomhaireacht forbartha réigiúnaí."
      },
      {
        "question": "Cad is «Gteic» ann i gcomhthéacs na Gaeltachta nua-aimseartha?",
        "options": [
          "Cineál nua báid",
          "Gréasán de mhoil dhigiteacha ardteicneolaíochta do chian-obair",
          "Comórtas peile",
          "Aip ceoil amháin"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Is gréasán de spásanna digiteacha oibre é Gteic."
      },
      {
        "question": "Cén buntáiste a bhaineann le moil Gteic do dhaoine óga sa Ghaeltacht?",
        "options": [
          "Ní gá dóibh obair a dhéanamh",
          "Tugann sé deis dóibh fanacht sa bhaile agus gairmeacha ardteicneolaíochta a leanúint",
          "Cuireann sé iallach orthu bogadh go Baile Átha Cliath",
          "Dúnann sé scoileanna"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Cuireann sé ar a gcumas fanacht ina bpobail le poist mhaithe."
      },
      {
        "question": "Conas a théann an fhorbairt eacnamaíoch seo i bhfeidhm ar an nGaeilge féin?",
        "options": [
          "Scriosann sí an teanga",
          "Neartaíonn sí inmharthanacht na Gaeilge mar theanga oibre agus phobail",
          "Ní bhíonn aon éifeacht aici",
          "Cuireann sí cosc ar labhairt na Gaeilge"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Neartaíonn sé an teanga mar mheán nua-aimseartha oibre."
      }
    ],
    "tfQuestions": [
      {
        "question": "Bunaíodh níos mó ná tríocha mol digiteach Gteic ar fud na Gaeltachta.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. Tá an gréasán scaipthe go forleathan."
      },
      {
        "question": "Ní cheadaítear ach d'iascairí úsáid a bhaint as moil dhigiteacha Gteic.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Bréagach. Tá siad oscailte do chian-oibrithe, fiontraithe agus gnólachtaí."
      },
      {
        "question": "Cuidíonn ard-bhanna leathan snáthoptaice le daoine oibriú go cianda.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. Tá nascacht den scoth ar fáil sna moil."
      },
      {
        "question": "Níl aon spéis ag daoine óga Gaeltachta i dteicneolaíocht nua.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Bréagach. Tá siad ag forbairt gairmeacha nuálacha sna réimsí seo."
      },
      {
        "question": "Cuidíonn fás eacnamaíoch na Gaeltachta le todhchaí na teanga.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. Coinníonn sé daoine óga líofa sa phobal dúchais."
      }
    ]
  },
  {
    "title": "Geilleagar an Tíogair Cheiltigh agus an tAistriú Nuálaíochta (Celtic Tiger & Innovation Shift)",
    "level": "B2",
    "language": "ga",
    "text": "Ó lár na nóchaidí ar aghaidh, chuaigh geilleagar na hÉireann trí thréimhse d'fhás eacnamaíoch as cuimse ar a tugadh «An Tíogar Ceilteach». D'athraigh an fás dochreidte seo Éire ó thír sách bocht talmhaíochta a raibh fiacha arda agus dífhostaíocht ghéar ag gabháil léi go ceann de na tíortha ba shaibhre san Aontas Eorpach de réir ioncaim per capita. Bhí roinnt príomhfhachtóirí mar bhonn faoin rath eacnamaíoch seo: ráta íseal cánach corparáidí (12.5%), infheistíocht ollmhór san oideachas tríú leibhéal a chruthaigh lucht saothair óg, ardoilte agus Béarla mar theanga dhúchais acu, agus ballraíocht láidir sa Mhargadh Aonair Eorpach. Mheall na tosca seo na céadta cuideachta ilnáisiúnta Mheiriceánach i réimsí na teicneolaíochta, na cógaisíochta agus na bhfeistí leighis chun a gceanncheathrúna Eorpacha a bhunú i mBaile Átha Cliath, i gCorcaigh agus i nGaillimh — fathigh dhomhanda cosúil le Google, Apple, Microsoft, Meta agus Pfizer. Cé gur tháinig géarchéim thubaisteach i 2008 mar gheall ar bhoilsciú maoine agus iasachtaí baicíneacha baincéireachta, d'éirigh le hÉirinn teacht aniar iontach a dhéanamh thar an gcéad deich mbliana eile. Sa lá atá inniu ann, tá an geilleagar ag aistriú ó bheith ag brath go heisiach ar chomhlachtaí eachtracha go dtí éiceachóras nuálaíochta dúchais: tá gnólachtaí nuathionscanta Éireannacha (startups) ag forbairt teicneolaíochtaí nua i réimsí na hintleachta saorga, na teicneolaíochta glaine agus an chistithe airgeadais (FinTech). Mar sin féin, cruthaíonn an rath eacnamaíoch seo dúshláin shóisialta thromchúiseacha freisin, go háirithe costais mhaireachtála an-arda, brú dochreidte ar an gcóras tithíochta agus an gá le forbairt réigiúnach níos cothroime a chinntiú ar fud an oileáin go léir. Léiríonn na gnéithe éagsúla seo uile beocht agus athléimneacht phobal na hÉireann agus iad ag múnlú a dtodhchaí féin sa nua-aois. Léiríonn na gnéithe éagsúla seo uile beocht agus athléimneacht phobal na hÉireann agus iad ag múnlú a dtodhchaí féin sa nua-aois.",
    "vocabularyHints": {
      "Tíogair Ceilteach": "Celtic Tiger",
      "cáin chorparáide": "corporation tax",
      "infheistíocht": "investment",
      "Margadh Aonair": "Single Market",
      "ilnáisiúnta": "multinational",
      "cógaisíocht": "pharmaceuticals",
      "boilsciú maoine": "property bubble",
      "gnólacht nuathionscanta": "startup company",
      "teicneolaíocht ghlan": "cleantech",
      "géarchéim tithíochta": "housing crisis"
    },
    "mcqQuestions": [
      {
        "question": "Cén t-ainm a tugadh ar an tréimhse d'fhás eacnamaíoch ollmhór in Éirinn sna 1990idí?",
        "options": [
          "An Leon Gaelach",
          "An Tíogair Ceilteach",
          "An tIolar Atlantach",
          "An Fhómhar Órga"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Tugadh an Tíogair Ceilteach ar an bhfeiniméan eacnamaíoch."
      },
      {
        "question": "Cén ráta cánach corparáidí tarraingteach a chuidigh le cuideachtaí ilnáisiúnta a mhealladh?",
        "options": [
          "50%",
          "12.5%",
          "0%",
          "35%"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Ráta cánach corparáidí 12.5% a bhí i bhfeidhm."
      },
      {
        "question": "Cad iad na hearnálacha tionsclaíochta is mó a d'fhás go láidir le linn na tréimhse seo?",
        "options": [
          "Mianadóireacht guail",
          "Teicneolaíocht eolais, cógaisíocht agus feistí leighis",
          "Déantúsaíocht ghluaisteán",
          "Bonnadóireacht"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Teicneolaíocht (Google, Apple) agus cógaisíocht (Pfizer)."
      },
      {
        "question": "Cad ba phríomhchúis leis an ngéarchéim airgeadais a bhuail Éire sa bhliain 2008?",
        "options": [
          "Cliseadh ar an bhfómhar",
          "Boilsciú maoine agus iasachtaí baolacha baincéireachta",
          "Cogaíocht eachtrach",
          "Easpa leictreachais"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Bhris an boilsciú maoine agus thit córas na mbanc as a chéile."
      },
      {
        "question": "Cén príomhdhúshlán sóisialta atá ag gabháil leis an ngeilleagar láidir inniu?",
        "options": [
          "Easpa bia",
          "Géarchéim tithíochta agus costais arda maireachtála",
          "Dúnadh na n-aerfort",
          "Ganntanas carranna"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Tá géarchéim mhór tithíochta agus costais mhaireachtála ag cur brú ar dhaoine."
      }
    ],
    "tfQuestions": [
      {
        "question": "Mheall Éire fathigh dhomhanda teicneolaíochta cosúil le Google agus Apple.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. Bhunaigh na cuideachtaí a gceanncheathrúna Eorpacha anseo."
      },
      {
        "question": "Níor tháinig aon athrú ar gheilleagar na hÉireann ón 19ú haois i leith.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Bréagach. Tharla athrú bunúsach ó thalmhaíocht go teicneolaíocht ardluacha."
      },
      {
        "question": "Chuidigh lucht saothair oilte a bhfuil Béarla acu le hinfheistíocht a mhealladh.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. Ba phríomhbhuntáiste é an córas oideachais ardchaighdeáin."
      },
      {
        "question": "Níl aon ghnólachtaí nuathionscanta Éireannacha á bhforbairt inniu.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Bréagach. Tá éiceachóras bríomhar fiontraíochta dúchais ag fás."
      },
      {
        "question": "Tá an ghéarchéim tithíochta ar cheann de na dúshláin is mó sa lá atá inniu ann.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. Is fadhb shóisialta ollmhór í soláthar tithe."
      }
    ]
  },
  {
    "title": "Caomhnú Mara agus Inbhuanaitheacht Chósta an Atlantaigh (Marine Conservation)",
    "level": "B2",
    "language": "ga",
    "text": "Tá ceann de na limistéir mhuirí is mó agus is saibhre san Eoraip ag Éirinn, limistéar a shíneann i bhfad amach isteach san Aigéan Atlantach thar Shleamhnán Ilchríochach na hÉireann agus atá deich n-uaire níos mó ná achar talún an oileáin féin. San uisce domhain seo, tá éiceachórais mhara uathúla le fáil a bhfuil tábhacht dhomhanda ag baint leo: sceireacha choiréil fhuaruisce a thógann na mílte bliain le fás sa dorchadas, gnáthóga cothaithe do mhíolta móra gorma agus crogaill mhara, agus limistéir ríthábhachtacha d'éin mhara. Ar feadh na gcéadta bliain, bhí muintir an chósta ag brath ar an bhfarraige le haghaidh a mbeatha, ach le blianta beaga anuas tá an timpeallacht mhara seo faoi bhrú ollmhór ó ghníomhaíochtaí daonna: ró-iascaireacht le tráil ghrinnill a scriosann gnáthóga leochaileacha, truailliú plaisteach a chuireann isteach ar gach leibhéal den bhiashlabhra, agus téamh domhanda na n-aigéan a athraíonn patrúin imirce na n-iasc. Mar fhreagra ar na bagairtí seo, tá Éire ag glacadh le beartais uaillmhianacha caomhnaithe. Tá an stát tiomanta do thart ar 30% d'uiscí na hÉireann a ainmniú mar Limistéir Mhuirí faoi Chosaint (MPAs) faoin mbliain 2030, rud a chuirfidh srian ar ghníomhaíochtaí díobhálacha i limistéir íogaire éiceolaíochta. Ag an am céanna, tá eolaithe mara ó institiúidí ar nós Fhhoras na Mara ag baint úsáide as longa taighde nua-aimseartha agus fomhuireáin gan fhoireann chun doimhneacht an Atlantaigh a mhapáil agus a chosaint. Ní hamháin go gcosnaíonn an caomhnú seo bithéagsúlacht luachmhar an aigéin, ach cinntíonn sé freisin go bhfanfaidh iascach na hearnála inbhuanaithe do phobail chósta na hÉireann do na glúnta atá le teacht. Léiríonn na gnéithe éagsúla seo uile beocht agus athléimneacht phobal na hÉireann agus iad ag múnlú a dtodhchaí féin sa nua-aois.",
    "vocabularyHints": {
      "limistéar muirí": "marine area / maritime territory",
      "Sleamhnán Ilchríochach": "Continental Shelf",
      "sceireacha choiréil": "cold-water coral reefs",
      "ró-iascaireacht": "overfishing",
      "tráil ghrinnill": "bottom trawling",
      "truailliú plaisteach": "plastic pollution",
      "Limistéar Muirí faoi Chosaint": "Marine Protected Area (MPA)",
      "Foras na Mara": "Marine Institute",
      "fomhuireán": "submersible / underwater drone",
      "bithéagsúlacht": "biodiversity"
    },
    "mcqQuestions": [
      {
        "question": "Cé chomh mór is atá limistéar muirí na hÉireann i gcomparáid lena achar talún?",
        "options": [
          "Leath chomh mór",
          "Deich n-uaire níos mó ná an talamh",
          "Díreach mar an gcéanna",
          "Níos lú ná an talamh"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Tá an limistéar muirí thart ar dheich n-uaire níos mó ná an t-oileán féin."
      },
      {
        "question": "Cad iad na struchtúir nádúrtha uathúla a fhásann san uisce domhain fuar Atlantach?",
        "options": [
          "Foraoisí bambú",
          "Sceireacha choiréil fhuaruisce a thógann na mílte bliain le fás",
          "Pluaiseanna gainimh amháin",
          "Gairdíní bláthanna"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Tá sceireacha choiréil fhuaruisce fíor-luachmhara san fharraige dhomhain."
      },
      {
        "question": "Cén cleachtas iascaireachta a dhéanann dochar mór do ghnáthóga ghrinneall na farraige?",
        "options": [
          "Iascaireacht le slat bheag",
          "Ró-iascaireacht le tráil ghrinnill a tharraingítear trasna an ghrinnill",
          "Snámh simplí",
          "Báid lae"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Scriosann tráil ghrinnill na gnáthóga leochaileacha thíos."
      },
      {
        "question": "Cén sprioc atá leagtha síos ag Éirinn maidir le Limistéir Mhuirí faoi Chosaint (MPAs) faoi 2030?",
        "options": [
          "0%",
          "Thart ar 30% d'uiscí na tíre a chosaint",
          "100% de na hiascairí a chur as obair",
          "Gach bád a thoirmeasc"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Tá an tír tiomanta 30% d'uiscí na tíre a chosaint faoi 2030."
      },
      {
        "question": "Cén ghníomhaireacht eolaíochta stáit a dhéanann taighde ar fharraigí na hÉireann?",
        "options": [
          "Bord Scannán",
          "Foras na Mara",
          "An Post",
          "Bord Gáis"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Déanann Foras na Mara taighde ceannródaíoch mara."
      }
    ],
    "tfQuestions": [
      {
        "question": "Tá ceann de na limistéir mhuirí is mó san Eoraip faoi dhlínse na hÉireann.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. Síneann uiscí na hÉireann i bhfad isteach san Atlantach."
      },
      {
        "question": "Níl aon choiréal le fáil san Aigéan Atlantach fuar timpeall na hÉireann.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Bréagach. Tá sceireacha móra fuaruisce le fáil sa dorchadas domhain."
      },
      {
        "question": "Is baol mór don bhiashlabhra mara é an truailliú plaisteach.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. Déanann micreaphlaistigh dochar do gach speiceas san fharraige."
      },
      {
        "question": "Úsáideann eolaithe fomhuireáin nua-aimseartha gan fhoireann chun an fharraige a thaiscéaladh.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. Déantar mapáil dhomhain le teicneolaíocht nua."
      },
      {
        "question": "Ní bhaineann caomhnú na farraige le heacnamaíocht phobail chósta na hÉireann.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Bréagach. Cinntíonn sé go mbeidh iascach inbhuanaithe ann amach anseo."
      }
    ]
  },
  {
    "title": "Leabhar Cheanannais agus Ealaín na Lámhscríbhinní Meánaoiseacha (Book of Kells & Monastic Art)",
    "level": "C1",
    "language": "ga",
    "text": "Seasann Leabhar Cheanannais (The Book of Kells) mar cheann de na sár-éachtaí ealaíne agus spioradálta is airde a tháirg an tsibhialtacht Mheánaoiseach in Iarthar na hEorpa, séadchomhartha a léiríonn buaic na healaíne leithisí (Insular art) a d'fhás as comhleá thraidisiúin na gCeilteach, na nAngla-Shacsanach agus na luath-Chríostaíochta. Cruthaíodh an lámhscríbhinn shoiléirithe mhaorga seo timpeall na bliana 800 AD, is dócha i mainistir Cholm Cille ar oileán Í i nGarbhchríocha na hAlban, sular aistríodh í go Mainistir Cheanannais i gContae na Mí chun í a chosaint ó ruathair fhoréigneacha na Lochlannach. Cuimsíonn an saothar téacs Laidine de na ceithre Shoiscéal de réir an Vulgáid, ach is é an maisiú grafach fíorálainn a fhágann go bhfuil cáil dhomhanda gan fasach air. Tá gach leathanach den phár pár-veilim déanta as craiceann lao agus maisithe le mionsonraí dochreidte: patrúin fhite chasta idirfhite, bíseanna bíseacha Ceilteacha, litreacha tosaigh maisiúla lán de dhaoine agus d'ainmhithe miotasacha ag lúbadh trína chéile, agus líocha daora a fuarthas ó gach cearn den domhan aitheanta, lena n-áirítear lapis lazuli as an Afganastáin. Is é an leathanach Chi-Rho (leathanach 34r), a thaispeánann an chéad dá litir de theideal Chríost sa Ghréigis, an sampla is mó a bhfuil cáil air de mhaisiúchán casta spioradálta: aimsíonn an tsúil ghéar mionsonraí bídeacha ceilte ar nós dhá chat ag faire ar dhá luch ag ithe aráin eocairistigh. Ní hamháin gur saothar diagachta a bhí sa lámhscríbhinn, ach léiriú amhairc ar an gcreideamh Críostaí a d'fheidhmigh mar thearmann spioradálta in aimsir chorraitheach chogaidh. Inniu, caomhnaítear an lámhscríbhinn i Seanleabharlann Choláiste na Tríonóide i mBaile Átha Cliath, áit a meallann sí na céadta míle léannta agus cuairteoir gach bliain a sheasann faoi dhraíocht ag gile dochreidte na líocha agus ag foighne neamhghnách na manach Gaelach a chruthaigh í breis is míle dhá chéad bliain ó shin. Fágann an léargas doimhin seo oidhreacht intleachtúil dho-sháraithe a leanann de bheith ina foinse shíoraí thorthúil don smaointeoireacht dhomhanda chomhaimseartha. Fágann an léargas doimhin seo oidhreacht intleachtúil dho-sháraithe a leanann de bheith ina foinse shíoraí thorthúil don smaointeoireacht dhomhanda chomhaimseartha.",
    "vocabularyHints": {
      "Leabhar Cheanannais": "Book of Kells",
      "ealaín leithis": "Insular art",
      "Colm Cille": "St. Colmcille (Columba)",
      "Í Chaluim Chille": "Iona monastery",
      "Ruathair Lochlannacha": "Viking raids",
      "pár-veilim": "calfskin vellum",
      "Chi-Rho": "Chi-Rho monogram",
      "lapis lazuli": "lapis lazuli pigment",
      "lámhscríbhinn shoiléirithe": "illuminated manuscript",
      "eocairisteach": "Eucharistic"
    },
    "mcqQuestions": [
      {
        "question": "Cén tréimhse inar cruthaíodh Leabhar Cheanannais de réir saineolaithe?",
        "options": [
          "Timpeall na bliana 800 AD",
          "I 1500 AD",
          "I 200 BC",
          "I 1916 AD"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Cruthaíodh an lámhscríbhinn timpeall 800 AD sa luath-mheánaois."
      },
      {
        "question": "Cén áit inar cuireadh tús le cruthú na lámhscríbhinne is dócha?",
        "options": [
          "I bPáras",
          "I mainistir Cholm Cille ar oileán Í",
          "I gCeanannas amháin",
          "Sa Róimh"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Ceaptar gur thosaigh sé ar oileán Í in Albain."
      },
      {
        "question": "Cén t-ábhar ar a bhfuil leathanaigh an leabhair déanta?",
        "options": [
          "Páipéar nua-aimseartha",
          "Pár-veilim déanta as craiceann lao",
          "Duilleoga crainn",
          "Éadach línéadaigh"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Tá sé scríofa ar phár-veilim déanta as craiceann ainmhí."
      },
      {
        "question": "Cad a léiríonn an leathanach cáiliúil Chi-Rho (34r)?",
        "options": [
          "Léarscáil dhomhanda",
          "An chéad dá litir de theideal Chríost sa Ghréigis le maisiú fíor-chasta",
          "Dán fada as Gaeilge",
          "Pictiúr den phápa"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Is é an Chi-Rho monogram Chríost maisithe go healaíonta."
      },
      {
        "question": "Cá gcaomhnaítear Leabhar Cheanannais i láthair na huaire?",
        "options": [
          "I Músaem an Louvre",
          "I Seanleabharlann Choláiste na Tríonóide i mBaile Átha Cliath",
          "I gCeanannas fós",
          "I Londain"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Tá sé ar taispeáint i gColáiste na Tríonóide i mBaile Átha Cliath."
      }
    ],
    "tfQuestions": [
      {
        "question": "Meastar go bhfuil Leabhar Cheanannais ar shár-éachtaí ealaíne na Meánaoise.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. Is sárshaothar ealaíne leithisí é a bhfuil clú domhanda air."
      },
      {
        "question": "Úsáideadh líocha luachmhara ar nós lapis lazuli as an Afganastáin sa mhaisiú.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. Fuarthas líocha daora ó áiteanna i bhfad i gcéin."
      },
      {
        "question": "Aistríodh an leabhar go Ceanannas chun é a chosaint ó ruathair na Lochlannach.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. Ba chúis sábháilteachta é an t-aistriú."
      },
      {
        "question": "Níl aon mhaisiú ná dathanna le feiceáil ar leathanaigh an leabhair.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Bréagach. Tá sé ar cheann de na lámhscríbhinní is saibhre maisithe ar domhan."
      },
      {
        "question": "Scríobhadh téacs an leabhair go hiomlán i mBéarla nua-aimseartha.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Bréagach. Tá téacs Laidine de na ceithre Soiscéal ann."
      }
    ]
  },
  {
    "title": "Comhaontú Aoine an Chéasta agus Próiseas na Síochána (Good Friday Agreement & Peace Process)",
    "level": "C1",
    "language": "ga",
    "text": "Ar an 10 Aibreán 1998, síníodh Comhaontú Aoine an Chéasta (The Good Friday Agreement nó Comhaontú Bhéal Feirste), cáipéis stairiúil a chuir deireadh foirmiúil le trí scór bliain de choimhlint fhoréigneach fhuilteach i dTuaisceart Éireann ar a dtugtaí «Na Trioblóidí» (The Troubles). Ba é an coimhlint seo toradh ar theannas doimhin stairiúil idir dhá phríomhphobal a raibh mianta polaitiúla agus féiniúlachtaí náisiúnta éagsúla acu: an pobal Aontachtach/Dílseach, Protastúnach den chuid is mó, a theastaigh uathu fanacht mar chuid den Ríocht Aontaithe, agus an pobal Náisiúnach/Poblachtánach, Caitliceach den chuid is mó, a d'éiligh comhionannas cearta agus Éire aontaithe a bhaint amach. Maraíodh os cionn trí mhíle go leith duine le linn na dTrioblóidí, lena n-áirítear sibhialtaigh, saighdiúirí agus baill d'eagraíochtaí paraimíleata cosúil leis an IRA agus an UVF. B'éacht dochreidte taidhleoireachta é an Comhaontú a éilíonn comhréiteach cróga ó gach taobh faoi stiúir cheannairí polaitiúla misniúla ar nós John Hume, David Trimble, Gerry Adams agus an t-iar-Sheanadóir Meiriceánach George Mitchell a bhí mar chathaoirleach ar na cainteanna. Bhí an comhaontú bunaithe ar thrí phríomhcholún (Three Strands): institiúidí féinrialtais nua i Stormont a chuir comhroinnt cumhachta éigeantach i bhfeidhm idir Aontachtaigh agus Náisiúnaithe; caidreamh Thuaidh-Theas trí Chomhairle Aireachta Thuaidh-Theas; agus caidreamh idir-rialtasach idir Éire agus an Bhreatain. Go ríthábhachtach, dheimhnigh an Comhaontú prionsabal an toilithe (Principle of Consent) — nach n-athrófaí stádas bunreachtúil Thuaisceart Éireann gan toil thromlach an phobail ann — agus d'aithin sé ceart gach duine sa Tuaisceart a bheith ina shaoránach Éireannach, ina shaoránach Briotanach nó an dá cheann. Cé go bhfuil deacrachtaí fós ann, go háirithe maidir le comhtháthú pobail agus tionchar an Bhreatimeachta (Brexit), d'éirigh leis an gComhaontú síocháin mharthanach a bhunú agus glúin nua a thógáil suas saor ó scáth an fhoréigin laethúil. Fágann an léargas doimhin seo oidhreacht intleachtúil dho-sháraithe a leanann de bheith ina foinse shíoraí thorthúil don smaointeoireacht dhomhanda chomhaimseartha. Fágann an léargas doimhin seo oidhreacht intleachtúil dho-sháraithe a leanann de bheith ina foinse shíoraí thorthúil don smaointeoireacht dhomhanda chomhaimseartha.",
    "vocabularyHints": {
      "Comhaontú Aoine an Chéasta": "Good Friday Agreement",
      "Na Trioblóidí": "The Troubles",
      "Aontachtóir": "Unionist",
      "Dílseoir": "Loyalist",
      "Náisiúnaí": "Nationalist",
      "Poblachtánach": "Republican",
      "comhroinnt cumhachta": "power-sharing",
      "prionsabal an toilithe": "principle of consent",
      "taidhleoireacht": "diplomacy",
      "Breatimeacht": "Brexit"
    },
    "mcqQuestions": [
      {
        "question": "Cén bhliain inar síníodh Comhaontú Aoine an Chéasta i mBéal Feirste?",
        "options": [
          "1916",
          "1998",
          "1969",
          "2010"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Síníodh an comhaontú ar Aoine an Chéasta 1998."
      },
      {
        "question": "Cad é an t-ainm a tugadh ar an gcoimhlint fhada i dTuaisceart Éireann a tháinig roimh an gcomhaontú?",
        "options": [
          "An Cogadh Mór",
          "Na Trioblóidí (The Troubles)",
          "Cogadh na Cathartha",
          "An Éirí Amach"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Tugadh Na Trioblóidí ar an tréimhse choimhlinte."
      },
      {
        "question": "Cén prionsabal rialachais a cuireadh i bhfeidhm i bParlaimint Stormont?",
        "options": [
          "Monarcacht absalóideach",
          "Comhroinnt éigeantach cumhachta idir Aontachtaigh agus Náisiúnaithe",
          "Rialú díreach míleata",
          "Rialú ó Bhaile Átha Cliath amháin"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Rialtas comhroinnte cumhachta a bunaíodh."
      },
      {
        "question": "Cad a deir «Prionsabal an Toilithe» maidir le stádas an Tuaiscirt?",
        "options": [
          "Go n-aontófar Éire go forneartach láithreach",
          "Nach n-athrófar stádas bunreachtúil an Tuaiscirt gan toil thromlach an phobail",
          "Nach ceadmhach vóta a chaitheamh go deo",
          "Go mbeidh an Tuaisceart ina stát neamhspleách féin"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Ní féidir stádas a athrú gan toiliú thromlach mhuintir an Tuaiscirt."
      },
      {
        "question": "Cén ceart saoránachta a ráthaítear do dhaoine a rugadh i dTuaisceart Éireann?",
        "options": [
          "Saoránacht Bhriotanach amháin",
          "Ceart a bheith ina saoránach Éireannach, Briotanach, nó an dá cheann",
          "Ní fhaigheann siad aon phas",
          "Saoránacht Mheiriceánach"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Tá an ceart acu saoránacht Éireannach, Bhriotanach nó an dá cheann a bheith acu."
      }
    ],
    "tfQuestions": [
      {
        "question": "Chuir Comhaontú Aoine an Chéasta deireadh foirmiúil leis na Trioblóidí.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. Chruthaigh sé creat polaitiúil don tsíocháin."
      },
      {
        "question": "Níor ghlac ach taobh amháin páirt sna cainteanna síochána.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Bréagach. Bhí ar cheannairí Aontachtacha agus Náisiúnacha comhaontú le chéile."
      },
      {
        "question": "Maraíodh níos mó ná 3,500 duine le linn na dTrioblóidí.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. Bhí an líon daoine a maraíodh thar a bheith tragóideach."
      },
      {
        "question": "Tá an tsíocháin i dTuaisceart Éireann briste go hiomlán inniu agus cogadh ann.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Bréagach. Cé go bhfuil dúshláin ann, maireann an tsíocháin den chuid is mó."
      },
      {
        "question": "Aithnítear John Hume agus David Trimble as a gcuid misnigh i mbunú na síochána.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. Bhuaigh an bheirt acu Duais Nobel na Síochána dá bharr."
      }
    ]
  },
  {
    "title": "Cearta Teanga, an Bunreacht agus Stádas na Gaeilge san Aontas Eorpach (Language Rights & EU Status)",
    "level": "C1",
    "language": "ga",
    "text": "Baineann stádas dlíthiúil agus bunreachtúil na Gaeilge le croílár fhéiniúlacht pholaitiúil agus dhlíthiúil stát na hÉireann ó bunaíodh é. De réir Airteagal 8 de Bhunreacht na hÉireann (Bunreacht na hÉireann 1937), is í an Ghaeilge an phríomhtheanga oifigiúil mar theanga náisiúnta na tíre, agus aithnítear an Béarla mar an dara teanga oifigiúil. Cé gur bhronn an stádas bunreachtúil seo cearta móra teoiriciúla ar shaoránaigh, ar feadh na mblianta fada bhí bearna ollmhór idir an teoiric bhunreachtúil agus an réaltacht phraiticiúil laethúil sa tseirbhís phoiblí, áit a raibh an Béarla i réim beagnach go hiomlán. Tharla athrú suntasach ar an scéal seo sa bhliain 2003 nuair a ritheadh Acht na dTeangacha Oifigiúla i ndiaidh feachtais fhada chearta daonna a bhí faoi cheannas gníomhaithe pobail. Bhunaigh an t-acht Oifig an Choimisinéara Teanga chun monatóireacht a dhéanamh ar chomhlíonadh dualgas teanga ag comhlachtaí poiblí agus chun a chinntiú go bhfaigheann saoránaigh seirbhísí stáit trí mheán na Gaeilge gan míbhuntáiste. Thug an leasú reachtúil is déanaí (Acht na dTeangacha Oifigiúla Leasaithe 2021) sprioc shonrach isteach: faoin mbliain 2030, caithfidh 20% de na hearcaigh nua sa tseirbhís phoiblí a bheith líofa sa Ghaeilge. Ar an leibhéal idirnáisiúnta, tharla buaicphointe eile ar an 1 Eanáir 2022 nuair a tháinig deireadh iomlán leis an maolú ar stádas na Gaeilge san Aontas Eorpach. Ón lá sin amach, tá stádas iomlán oifigiúil oibre ag an nGaeilge san AE, comhionann leis an bhFraincis, leis an nGearmáinis nó leis an Spáinnis, rud a chiallaíonn go gcaithfear gach cáipéis reachtúil, gach dlí agus gach comhaontú Eorpach a aistriú go Gaeilge. Chruthaigh sé seo na céadta post ardluacha d'aistritheoirí, do dhlítheoirí agus do theangeolaithe Gaelacha sa Bhruiséil agus i Lucsamburg, ag ardú gradam na teanga go hidirnáisiúnta agus ag cruthú géarghá le hardscileanna gairmiúla teanga. Fágann an léargas doimhin seo oidhreacht intleachtúil dho-sháraithe a leanann de bheith ina foinse shíoraí thorthúil don smaointeoireacht dhomhanda chomhaimseartha. Fágann an léargas doimhin seo oidhreacht intleachtúil dho-sháraithe a leanann de bheith ina foinse shíoraí thorthúil don smaointeoireacht dhomhanda chomhaimseartha.",
    "vocabularyHints": {
      "Bunreacht na hÉireann": "Constitution of Ireland",
      "príomhtheanga oifigiúil": "first official language",
      "Acht na dTeangacha Oifigiúla": "Official Languages Act",
      "An Coimisinéir Teanga": "Language Commissioner",
      "earcaigh": "recruits",
      "maolú": "derogation",
      "Aontas Eorpach": "European Union",
      "reachtúil": "statutory / legislative",
      "aistritheoir": "translator",
      "teangeolaí": "linguist"
    },
    "mcqQuestions": [
      {
        "question": "Cén stádas a thugann Airteagal 8 de Bhunreacht na hÉireann don Ghaeilge?",
        "options": [
          "Dara teanga iasachta",
          "An phríomhtheanga oifigiúil mar theanga náisiúnta",
          "Teanga gan stádas",
          "Teanga réigiúnach amháin"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Tugann an Bunreacht stádas mar phríomhtheanga oifigiúil di."
      },
      {
        "question": "Cén oifig a bunaíodh faoi Acht na dTeangacha Oifigiúla 2003 chun cearta teanga a chosaint?",
        "options": [
          "An Roinn Oideachais",
          "Oifig an Choimisinéara Teanga",
          "Bord na Gaeilge amháin",
          "Cúirt na Corónach"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Bunaíodh Oifig an Choimisinéara Teanga chun monatóireacht a dhéanamh."
      },
      {
        "question": "Cén sprioc earcaíochta atá leagtha síos don tseirbhís phoiblí faoi 2030 san Acht Leasaithe 2021?",
        "options": [
          "1%",
          "20% d'earcaigh nua le Gaeilge líofa",
          "100%",
          "5%"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Sprioc 20% d'earcaigh nua a bheith inniúil sa Ghaeilge."
      },
      {
        "question": "Cad a tharla ar an 1 Eanáir 2022 maidir le stádas na Gaeilge san Aontas Eorpach?",
        "options": [
          "Baineadh an Ghaeilge den liosta",
          "Tháinig deireadh leis an maolú agus fuair sí lánstádas oifigiúil oibre san AE",
          "Ghlac an AE leis an nGaeilge mar an t-aon teanga",
          "Níor tharla aon athrú"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Fuair an Ghaeilge lánstádas mar theanga oifigiúil oibre san AE."
      },
      {
        "question": "Cén cineál fostaíochta a chruthaigh lánstádas na Gaeilge san Aontas Eorpach?",
        "options": [
          "Poist i monarchana amháin",
          "Gairmeacha ardluacha d'aistritheoirí, do dhlítheoirí agus do theangeolaithe",
          "Poist thalmhaíochta",
          "Poist gan phá"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Chruthaigh sé gairmeacha gairmiúla aistriúcháin agus dlí sa Bhruiséil."
      }
    ],
    "tfQuestions": [
      {
        "question": "Is í an Ghaeilge an chéad teanga oifigiúil faoi Bhunreacht na hÉireann.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. Aithníonn Airteagal 8 mar phríomhtheanga oifigiúil í."
      },
      {
        "question": "Tá stádas iomlán oibre ag an nGaeilge san Aontas Eorpach anois.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. Tháinig deireadh leis an maolú in 2022."
      },
      {
        "question": "Ní cheadaítear seirbhísí poiblí a lorg trí Ghaeilge in Éirinn faoin dlí.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Bréagach. Cosnaíonn Acht na dTeangacha Oifigiúla an ceart sin."
      },
      {
        "question": "Caithfear reachtaíocht uile an Aontais Eorpaigh a fhoilsiú as Gaeilge inniu.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. Tá an dualgas céanna uirthi agus atá ar na teangacha oifigiúla eile."
      },
      {
        "question": "Níl aon spriocanna earcaíochta ann do dhaoine le Gaeilge sa státseirbhís.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Bréagach. Tá sprioc reachtúil 20% leagtha síos faoi 2030."
      }
    ]
  },
  {
    "title": "Dúshláin Dhéimeagrafacha agus Géarchéim Tithíochta na hÉireann (Demographics & Housing Crisis)",
    "level": "C1",
    "language": "ga",
    "text": "Tá Éire i lár ceann de na claochluithe déimeagrafacha agus eacnamaíocha is suntasaí ina stair, forbairt a chuireann brú ollmhór ar bhonneagar fisiciúil agus sóisialta na tíre. De réir sonraí ón bPríomh-Oifig Staidrimh (CSO), sháraigh daonra Phoblacht na hÉireann cúig mhilliún go leith duine le déanaí — an leibhéal is airde ó aimsir an Ghorta Mhóir i lár an naoú haois déag. Tá an fás daonra seo mar thoradh ar dhá phríomhthoisc: ráta breithe réasúnta sláintiúil le blianta fada anuas agus, níos tábhachtaí fós, imirce ghlan isteach thar a bheith láidir. Mar gheall ar a geilleagar rathúil, a cobhsaíocht pholaitiúil agus an líon mór fostaíochta a chruthaíonn corparáidí ilnáisiúnta, tá Éire anois ina tír imirce a mheallann oibrithe ó gach cearn den Aontas Eorpach agus níos faide i gcéin, chomh maith le daoine a dteastaíonn tearmann uathu ó chogaíocht agus ó ghéarchéimeanna idirnáisiúnta. Mar sin féin, tá an borradh daonra seo tar éis bualadh go díreach i gcoinne na heaspa infheistíochta stairiúla i gcórais phoiblí, rud a d'eascair géarchéim thithíochta thromchúiseach as. Níl an soláthar tithe nua ag teacht gar d'éileamh an mhargaidh, rud a d'fhág go bhfuil praghsanna ceannaigh agus cíosanna ardaithe go leibhéil nach bhfacthas riamh cheana. Fágann sé seo nach bhfuil glúin iomlán d'aosaigh óga in ann teach a cheannach ná teach a fháil ar cíos ar phraghas réasúnta, agus go leor acu fós ina gcónaí lena dtuismitheoirí go dtí a luath-thriochaidí nó ag smaoineamh ar dhul ar imirce go dtí an Astráil nó Ceanada. Chomh maith leis an tithíocht, tá brú ollmhór ar an gcóras cúraim sláinte (feitheamh fada sna hionaid éigeandála), ar an gcóras iompair phoiblí agus ar sheirbhísí uisce agus fuinnimh. Éilíonn réiteach na gceisteanna seo comhordú straitéiseach fadtéarmach idir pleanáil spásúil, infheistíocht stáit i dtithíocht inacmhainne agus dílárú eacnamaíoch chun forbairt chothrom a chruthú lasmuigh de mhórcheantar Bhaile Átha Cliath. Fágann an léargas doimhin seo oidhreacht intleachtúil dho-sháraithe a leanann de bheith ina foinse shíoraí thorthúil don smaointeoireacht dhomhanda chomhaimseartha.",
    "vocabularyHints": {
      "claochlú": "transformation",
      "Príomh-Oifig Staidrimh": "Central Statistics Office (CSO)",
      "imirce ghlan": "net migration",
      "bonposition": "infrastructure / foundation",
      "tithíocht inacmhainne": "affordable housing",
      "cíosanna": "rents",
      "dílárú": "decentralization",
      "pleanáil spásúil": "spatial planning",
      "leibhéal is airde": "highest level",
      "comhordú": "coordination"
    },
    "mcqQuestions": [
      {
        "question": "Cén leibhéal daonra a sháraigh Poblacht na hÉireann le déanaí de réir an CSO?",
        "options": [
          "Dhá mhilliún",
          "Cúig mhilliún go leith duine",
          "Deich milliún",
          "Aon mhilliún"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Sháraigh an daonra 5.5 milliún duine, an leibhéal is airde ó aimsir an Ghorta."
      },
      {
        "question": "Cad iad an dá phríomhchúis leis an bhfás daonra dochreidte seo?",
        "options": [
          "Ráta breithe ard agus imirce ghlan láidir isteach",
          "Teorainneacha dúnta",
          "Easpa taistil",
          "Laghdú ar shaolré daoine"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Tháinig an fás ó rátaí breithe agus imirce ghlan isteach."
      },
      {
        "question": "Cad é an príomhdhúshlán sóisialta a chruthaigh an borradh daonra seo?",
        "options": [
          "Easpa carranna",
          "Géarchéim thromchúiseach tithíochta le cíosanna arda agus ganntanas soláthair",
          "Easpa bia",
          "Dúnadh na n-ollscoileanna"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Ganntanas tithe agus cíosanna fíor-arda."
      },
      {
        "question": "Cén tionchar atá ag praghsanna arda tithíochta ar aosaigh óga in Éirinn?",
        "options": [
          "Tá siad go léir ag ceannach tithe go héasca",
          "Tá go leor acu ina gcónaí lena dtuismitheoirí nó ag smaoineamh ar imirce",
          "Níl suim acu i dtithe",
          "Téann siad go léir go dtí an Fhrainc"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Bíonn orthu fanacht sa bhaile lena dtuismitheoirí nó dul ar imirce."
      },
      {
        "question": "Cén réiteach straitéiseach a mholtar sa sliocht chun an fhadhb a leigheas?",
        "options": [
          "Gach tógáil a stopadh",
          "Infheistíocht fhadtéarmach i dtithíocht inacmhainne agus dílárú eacnamaíoch",
          "Cánacha a ardú go 100%",
          "Scoileanna a dhúnadh"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Pleanáil fhadtéarmach, tithíocht inacmhainne agus dílárú réigiúnach."
      }
    ],
    "tfQuestions": [
      {
        "question": "Tá daonra na hÉireann ag an leibhéal is airde ó lár an 19ú haois.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. Sháraigh an daonra 5.5 milliún duine."
      },
      {
        "question": "Is tír imirce isteach í Éire anois mar gheall ar a geilleagar rathúil.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. Tagann daoine ó gach cearn den domhan ag obair inti."
      },
      {
        "question": "Tá an-chuid tithe folmha saor ar fáil ar chíos íseal i mBaile Átha Cliath.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Bréagach. Tá géarchéim mhór soláthair agus praghsanna an-arda i réim."
      },
      {
        "question": "Níl aon bhrú ar an gcóras sláinte ná ar iompar poiblí.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Bréagach. Tá brú mór ar ospidéil agus ar an mbonneagar uile."
      },
      {
        "question": "Éilíonn an ghéarchéim pleanáil straitéiseach agus infheistíocht fhadtéarmach stáit.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. Tá gá le beartais láidre leanúnacha."
      }
    ]
  },
  {
    "title": "Fealsúnacht an Dúlra agus Spioradáltacht Cheilteach sa Nua-Aois (Celtic Nature Philosophy in Modernity)",
    "level": "C1",
    "language": "ga",
    "text": "I ré seo na géarchéime éiceolaíochta agus an mheathlaithe bhithéagsúlachta domhanda, tá aird úr á tabhairt ar fhealsúnacht thraidisiúnta an dúlra agus ar spioradáltacht na sean-Ghael, dearcadh fealsúnach a d'fhéach ar an duine mar chuid lárnach d'fhréamhacha an nádúir seachas mar mháistir uachtarach air. Sa traidisiún Ceilteach ársa, níor breathnaíodh ar an timpeallacht nádúrtha mar acmhainn mharbh le saothrú ar mhaithe le brabús eacnamaíoch, ach mar dhomhan beo lán d'anam agus de rúndiamhair (anima mundi). Léirítear an dearcadh seo go soiléir i luath-fhilíocht na manach Gaelach ón ochtú haois ar aghaidh, dánta mín-chumtha ar nós dánta faoin dubhán fraoigh, faoin gcrann iúir nó faoin gcat Pangur Bán, áit a scríobhann an file faoin gceangal comhbhách idir a shaol spioradálta féin agus guth na n-éan sa choill ghlas. Bhí gach crann, gach foinse fíoruisce agus gach cnoc ceangailte le ciall dhiaga nó le cónaí spioradálta: mar shampla, measadh gur crainn bheannaithe iad an dair, an fhuinseog agus an choill, agus bhí toibreacha beannaithe mar spásanna leighis agus machnaimh phobail. Chuir scríbhneoirí comhaimseartha agus fealsaimh ar nós John Moriarty agus John O'Donohue (údar an leabhair cháiliúil Anam Chara) an oidhreacht seo chun cinn mar leigheas ar an uaigneas eiseach agus ar an scoitheadh spioradálta a mhothaíonn an duine nua-aimseartha i sochaí ardchaipitlíoch tomhaltais. D'áitigh Moriarty go gcaithfidh an duine ath-fhoghlaim conas cónaí go humhal laistigh de rithimí na talún agus meas a léiriú ar gach neach beo, dearcadh a luíonn go foirfe le prionsabail an éiceolaíochais dhomhain (Deep Ecology) sa lá atá inniu ann. Ní cumha rómánsúil faoin am atá thart atá i gceist anseo, ach cothú eitice nua a aithníonn gur ionann sláinte an chomhshaoil agus sláinte mheabhrach agus spioradálta an chine dhaonna. Fágann an léargas doimhin seo oidhreacht intleachtúil dho-sháraithe a leanann de bheith ina foinse shíoraí thorthúil don smaointeoireacht dhomhanda chomhaimseartha. Fágann an léargas doimhin seo oidhreacht intleachtúil dho-sháraithe a leanann de bheith ina foinse shíoraí thorthúil don smaointeoireacht dhomhanda chomhaimseartha.",
    "vocabularyHints": {
      "fealsúnacht an dúlra": "nature philosophy",
      "spioradáltacht": "spirituality",
      "Pangur Bán": "Pangur Bán (old Irish poem about monk's cat)",
      "Anam Chara": "Anam Chara (soul friend)",
      "toibreacha beannaithe": "holy wells",
      "éiceolaíocht dhomhain": "deep ecology",
      "tomhaltas": "consumerism",
      "uaigneas eiseach": "existential loneliness",
      "comhbhách": "empathetic / harmonious",
      "rithim": "rhythm"
    },
    "mcqQuestions": [
      {
        "question": "Cén dearcadh a bhí ag na seana-Ghaeil ar an timpeallacht nádúrtha?",
        "options": [
          "Mar stór earraí le saothrú gan teorainn",
          "Mar dhomhan beo lán d'anam, de bhrí dhiaga agus de rúndiamhair",
          "Mar réimse naimhdeach le scriosadh",
          "Ní raibh aon dearcadh acu"
        ],
        "correctAnswerIndex": 1,
        "explanation": "D'fhéach siad ar an dúlra mar dhomhan beo spioradálta."
      },
      {
        "question": "Cén dán luath-Ghaeilge cáiliúil a léiríonn an ceangal cairdiúil idir manach agus a chat?",
        "options": [
          "Cré na Cille",
          "Pangur Bán",
          "An Táin",
          "Cúirt an Mheán Oíche"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Pangur Bán, an dán cáiliúil ón luath-mheánaois."
      },
      {
        "question": "Cad a bhí mar thábhacht ag toibreacha beannaithe i dtraidisiún na hÉireann?",
        "options": [
          "Úsáideadh iad mar mhonarchana",
          "Spásanna leighis, paidreoireachta agus machnaimh phobail",
          "Áiteanna dumpála",
          "Banc airgid"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Spásanna leighis agus machnaimh spioradálta."
      },
      {
        "question": "Cén leabhar fealsúnachta a scríobh John O'Donohue a tharraing clú idirnáisiúnta?",
        "options": [
          "The Republic",
          "Anam Chara",
          "Ulysses",
          "The Great Hunger"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Scríobh sé Anam Chara faoin spioradáltacht Cheilteach."
      },
      {
        "question": "Cén ghluaiseacht chomhaimseartha éiceolaíochta a réitíonn go dlúth leis an bhfealsúnacht seo?",
        "options": [
          "Tionsclaíocht mhórscála",
          "Éiceolaíocht dhomhain (Deep Ecology)",
          "Mianadóireacht dhomhainfharraige",
          "Caipitleachas gan srian"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Éiceolaíocht dhomhain a chreideann i luach gach neiche beo."
      }
    ],
    "tfQuestions": [
      {
        "question": "Léiríonn luath-fhilíocht na manach Gaelach grá domhain don dúlra.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. Bhí siad faoi dhraíocht ag guth na n-éan agus an choill."
      },
      {
        "question": "Measadh gur chrainn bheannaithe iad an dair agus an fhuinseog sa tsean-traidisiún.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. Bhí urraim ar leith ag na Gaeil do chrainn dhúchais."
      },
      {
        "question": "Scríobh John Moriarty faoin ngá atá le maireachtáil go humhal leis an talamh.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. Mhol sé athcheangal spioradálta leis an gcruthú."
      },
      {
        "question": "Molann an fhealsúnacht seo go ndéanfaí gach foraois a leagan ar mhaithe le brabús.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 1,
        "explanation": "Bréagach. Cuireann sí béim iomlán ar chaomhnú agus ar urraim don dúlra."
      },
      {
        "question": "Aithnítear anois go bhfuil ceangal idir sláinte an domhain agus sláinte an duine.",
        "options": [
          "Fíor",
          "Bréagach"
        ],
        "correctAnswerIndex": 0,
        "explanation": "Fíor. Is ceann de phríomhphrionsabail na heitice nua é seo."
      }
    ]
  }
];
