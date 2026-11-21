# -*- coding: utf-8 -*-
"""
Generates complete Portuguese reading library (25 passages, 5 per level A1-C1).
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
    "Um dia de sol em Lisboa (A Sunny Day in Lisbon)", "A1", "pt",
    "Tiago mora em Lisboa há dois anos e gosta muito da cidade. Todas as manhãs, ele acorda cedo por volta das sete horas e abre as janelas do seu apartamento para sentir a brisa suave do rio Tejo. Toma um duche rápido, veste roupas confortáveis e sai para caminhar pelas ruas de pedra branca. Às sete e meia, Tiago entra na sua pastelaria favorita no bairro de Alfama. Ele pede um café expresso bem quente e um pastel de nata crocante polvilhado com canela doce. Cumprimenta a simpática dona Maria com um sorriso caloroso e conversa brevemente sobre o tempo. Depois da refeição matinal, ele apanha o famoso elétrico amarelo número vinte e oito para ir até ao trabalho no centro. No escritório, Tiago trabalha com desenho gráfico até às cinco da tarde. Ao final do dia, ele sobe até ao miradouro de Santa Luzia para admirar os telhados vermelhos das casas e as águas azuis enquanto o sol se põe no horizonte. É um momento calmo que traz muita paz ao seu coração.",
    {"brisa": "breeze", "pedra branca": "white cobblestone", "pastelaria": "pastry shop", "crocante": "crispy", "polvilhado": "dusted / sprinkled", "canela": "cinnamon", "elétrico": "tram / streetcar", "miradouro": "viewpoint / lookout", "telhados": "rooftops", "horizonte": "horizon"},
    [
        ("A que horas Tiago acorda normalmente todas as manhãs ?", ["Às nove horas", "Por volta das sete horas", "Ao meio-dia", "Às quatro da manhã"], 1, "Tiago acorda por volta das sete horas da manhã."),
        ("O que Tiago pede para comer e beber na pastelaria ?", ["Chá frio e pão com manteiga", "Um café expresso quente e um pastel de nata com canela", "Suco de laranja e bolo de carne", "Apenas uma maçã"], 1, "Pede um café expresso e um pastel de nata polvilhado com canela."),
        ("Qual transporte tradicional ele apanha para ir ao trabalho ?", ["O metropolitano subterrâneo", "O famoso elétrico amarelo número 28", "Um táxi moderno", "Uma bicicleta de montanha"], 1, "Apanha o elétrico amarelo 28 tradicional de Lisboa."),
        ("Em qual profissão Tiago trabalha no escritório central ?", ["Trabalha como cozinheiro", "Trabalha com desenho gráfico", "É motorista de autocarro", "É carteiro"], 1, "Ele trabalha como designer gráfico até ao final da tarde."),
        ("Onde Tiago passa o final da tarde para ver o pôr do sol ?", ["Num centro comercial fechado", "No miradouro de Santa Luzia admirando a vista", "Na estação ferroviária", "No aeroporto"], 1, "Sobe ao miradouro de Santa Luzia para ver a vista panorâmica.")
    ],
    [
        ("Tiago mora em Lisboa há dez anos completos.", ["Verdadeiro", "Falso"], 1, "Falso. Ele mora na cidade há dois anos."),
        ("O pastel de nata é servido com uma pitada de canela doce.", ["Verdadeiro", "Falso"], 0, "Verdadeiro. O doce é polvilhado com canela tradicional."),
        ("O elétrico 28 é um meio de transporte muito conhecido em Lisboa.", ["Verdadeiro", "Falso"], 0, "Verdadeiro. É um dos símbolos turísticos e urbanos da capital."),
        ("Tiago detesta caminhar pelas ruas de pedra da sua cidade.", ["Verdadeiro", "Falso"], 1, "Falso. Ele gosta muito de passear pelas ruas históricas."),
        ("Do miradouro é possível ver os telhados e as águas do rio Tejo.", ["Verdadeiro", "Falso"], 0, "Verdadeiro. O miradouro oferece uma vista esplêndida da cidade.")
    ]
))

passages.append(make_passage(
    "O café da manhã brasileiro com pão de queijo (Brazilian Breakfast)", "A1", "pt",
    "No Brasil, o café da manhã é uma refeição alegre e cheia de sabores acolhedores para começar bem o dia. Na casa de Juliana, em Belo Horizonte, a família se reúne todas as manhãs na cozinha ampla e iluminada. O aroma agradável do café fresco coado na hora perfuma todos os quartos da casa. Sobre a mesa de madeira, há sempre uma cesta cheia de pães de queijo quentinhos e dourados, acabados de sair do forno a gás. O pão de queijo mineiro é feito com polvilho fino de mandioca e queijo curado da serra da Canastra, tendo uma casca crocante por fora e um miolo incrivelmente macio e elástico por dentro. Além dos pães de queijo, a família come fatias frescas de mamão maduro com algumas gotas de limão e fatias de queijo branco fresco. O pai de Juliana bebe café preto forte sem açúcar, enquanto as crianças preferem café com leite cremoso e suco natural de goiaba gelado. Todos conversam alegremente sobre os planos da escola e do trabalho antes de sair. Comer juntos pela manhã fortalece o carinho e a união da família.",
    {"acolhedores": "welcoming / cozy", "coado": "filtered / brewed (drip coffee)", "polvilho": "manioc starch", "mandioca": "cassava / manioc", "curado": "cured / aged", "crocante": "crispy", "miolo": "crumb / soft interior", "mamão": "papaya", "goiaba": "guava", "carinho": "affection / care"},
    [
        ("Em qual cidade brasileira mora a família de Juliana ?", ["Em Salvador", "Em Belo Horizonte, Minas Gerais", "Em Manaus", "Em Curitiba"], 1, "A família mora na cidade de Belo Horizonte."),
        ("Com quais ingredientes principais é feito o autêntico pão de queijo ?", ["Farinha de trigo e chocolate", "Polvilho de mandioca e queijo curado regional", "Arroz branco e açúcar refinado", "Milho verde e manteiga de amendoim"], 1, "Leva polvilho fino de mandioca e queijo da Canastra."),
        ("Qual fruta tropical fresca a família consome na mesa ?", ["Fatias de mamão maduro com limão", "Cerejas congeladas", "Apenas maçãs verdes", "Pêssegos em calda"], 0, "Consomem fatias de mamão doce e fresco."),
        ("Como o pai de Juliana prefere tomar o seu café matinal ?", ["Café gelado com refrigerante", "Café preto forte e sem açúcar", "Apenas leite puro quente", "Chá de hortelã doce"], 1, "Ele toma café preto forte sem açúcar."),
        ("Qual é o ambiente da refeição matinal na casa familiar ?", ["Silencioso e distante", "Alegre, acolhedor e com conversa sobre o dia", "Triste e apressado", "Sem nenhuma conversa"], 1, "É um momento carinhoso de união e conversa entre todos.")
    ],
    [
        ("O pão de queijo mineiro tem casca crocante e interior macio.", ["Verdadeiro", "Falso"], 0, "Verdadeiro. Essa é a textura típica e adorada do pão de queijo."),
        ("A família de Juliana come o café da manhã no restaurante da esquina.", ["Verdadeiro", "Falso"], 1, "Falso. Eles se reúnem na cozinha de casa todas as manhãs."),
        ("O café é coado na hora na cozinha da casa.", ["Verdadeiro", "Falso"], 0, "Verdadeiro. O café fresco coado perfuma a residência."),
        ("As crianças bebem apenas água morna com vinagre.", ["Verdadeiro", "Falso"], 1, "Falso. Elas bebem café com leite ou suco de goiaba."),
        ("A reunião matinal à mesa ajuda a fortalecer os laços familiares.", ["Verdadeiro", "Falso"], 0, "Verdadeiro. O texto afirma que comer juntos reforça o afeto familiar.")
    ]
))

passages.append(make_passage(
    "O passeio pelo calçadão de Copacabana (Copacabana Boardwalk)", "A1", "pt",
    "O Rio de Janeiro é famoso em todo o mundo pelas suas praias maravilhosas e pelo estilo de vida descontraído dos seus moradores, chamados carinhosamente de cariocas. A praia de Copacabana tem uma faixa de areia dourada muito larga e um calçadão espetacular com desenhos de ondas em pedras pretas e brancas portuguesas. Aos sábados pela manhã, milhares de pessoas vão até à beira-mar para praticar atividades físicas ao ar livre. Mariana e a sua amiga Luísa colocam roupas de ginástica leves e caminham juntas durante uma hora ao longo da praia sentindo o calor do sol. Muitas pessoas andam de bicicleta na ciclovia protegida, correm com os seus cães ou jogam futevôlei nas quadras de areia fina. O mar tem ondas refrescantes onde surfistas e banhistas aproveitam a água verde e limpa. Depois da caminhada animada, Mariana e Luísa param num quiosque à beira da calçada para beber água de coco bem gelada diretamente do fruto verde. Os vendedores ambulantes passam cantando e oferecendo biscoito de polvilho crocante e mate gelado com limão. O clima é de pura felicidade e energia positiva contagiante.",
    {"descontraído": "laid-back / relaxed", "calçadão": "boardwalk / promenade", "pedras portuguesas": "Portuguese mosaic stones", "beira-mar": "seaside / waterfront", "ciclovia": "bike path", "futevôlei": "footvolley", "quadras": "courts (sports)", "quiosque": "beach kiosk", "ambulantes": "street vendors", "contagiante": "infectious / contagious"},
    [
        ("Como são chamados os habitantes nascidos na cidade do Rio de Janeiro ?", ["Paulistas", "Cariocas", "Mineiros", "Gaúchos"], 1, "Os naturais do Rio de Janeiro são chamados cariocas."),
        ("Qual desenho famoso decora as pedras do calçadão de Copacabana ?", ["Corações vermelhos", "Ondas em pedras pretas e brancas portuguesas", "Linhas retas amarelas", "Estrelas douradas"], 1, "O calçadão tem o clássico desenho em ondas onduladas."),
        ("O que Mariana e Luísa fazem durante o passeio matinal ?", ["Caminham juntas ao longo da praia durante uma hora", "Dormem na areia o tempo todo", "Andam a cavalo no asfalto", "Fazem compras no shopping"], 0, "Fazem uma caminhada de uma hora à beira-mar."),
        ("O que as duas amigas bebem no quiosque após a caminhada esportiva ?", ["Refrigerante quente", "Água de coco bem gelada diretamente do fruto", "Café fervente com canela", "Sopa de legumes"], 1, "Bebem água de coco gelada e natural no quiosque."),
        ("Quais alimentos tradicionais os ambulantes vendem na praia carioca ?", ["Pizza congelada e sopa", "Biscoito de polvilho crocante e mate gelado", "Hambúrguer com batata frita", "Apenas água mineral morna"], 1, "Vendem o clássico biscoito de polvilho e mate gelado.")
    ],
    [
        ("O calçadão de Copacabana é feito de madeira escura simples.", ["Verdadeiro", "Falso"], 1, "Falso. É composto por mosaico de pedras portuguesas onduladas."),
        ("Pessoas de várias idades praticam exercícios ao ar livre na praia.", ["Verdadeiro", "Falso"], 0, "Verdadeiro. Há corredores, ciclistas e jogadores de futevôlei."),
        ("O futevôlei é praticado nas quadras montadas na areia da praia.", ["Verdadeiro", "Falso"], 0, "Verdadeiro. É um esporte muito popular na orla carioca."),
        ("Na praia não existem quiosques nem lugares para descansar.", ["Verdadeiro", "Falso"], 1, "Falso. Há quiosques ao longo de todo o calçadão."),
        ("A atmosfera da orla marítima transmite alegria e vitalidade aos visitantes.", ["Verdadeiro", "Falso"], 0, "Verdadeiro. O clima é de pura felicidade e energia contagiante.")
    ]
))

passages.append(make_passage(
    "A feira livre e as frutas tropicais (The Open-Air Fruit Market)", "A1", "pt",
    "Nas manhãs de domingo, as feiras livres colorem as ruas de muitas cidades de Portugal e do Brasil com bancas repletas de produtos agrícolas frescos e pessoas animadas. Em São Paulo, Gabriel costuma acompanhar a sua avó Helena à feira do bairro para escolher os melhores alimentos da semana. Logo na entrada da feira, os feirantes gritam com bom humor anunciando os preços baixos e oferecendo fatias saborosas de frutas maduras aos clientes que passam. Há uma variedade imensa de frutas tropicais coloridas: mangas perfumadas, abacaxis doces, maracujás aromáticos, melancias gigantes e cachos generosos de bananas pratas. Gabriel e a avó compram tomates vermelhos, alfaces crespas e meio quilo de laranjas doces para fazer suco natural em casa. O momento mais esperado da visita é a parada obrigatória na barraca do pastel frito. Lá, eles pedem um pastel de carne quentinho e crocante acompanhado de um copo de caldo de cana gelado com caldo de limão fresco. A feira livre é um espaço de convivência comunitária onde os vizinhos se encontram, conversam sobre a vida do bairro e mantêm viva a tradição da alimentação saudável e direta do produtor.",
    {"feiras livres": "open-air street markets", "bancas": "market stalls", "feirantes": "market vendors", "abacaxis": "pineapples", "maracujás": "passion fruits", "cachos": "bunches / clusters", "alfaces": "lettuces", "pastel": "deep-fried pastry (pastel)", "caldo de cana": "sugarcane juice", "convivência": "coexistence / community life"},
    [
        ("Em qual dia da semana Gabriel costuma ir à feira livre com a avó ?", ["Nas terças-feiras à noite", "Nas manhãs de domingo", "Apenas nas sextas-feiras chuvosas", "Nunca aos fins de semana"], 1, "Eles vão nas manhãs de domingo."),
        ("O que os feirantes fazem para atrair os clientes para as suas bancas ?", ["Ficam em silêncio absoluto", "Gritam os preços com bom humor e dão pedaços de fruta para provar", "Fecham as bancas", "Cobram para olhar as frutas"], 1, "Anunciam os preços alegremente e oferecem provas de frutas."),
        ("Quais frutas tropicais estão expostas nas bancas da feira descrita ?", ["Apenas amoras silvestres", "Mangas, abacaxis, maracujás, melancias e bananas", "Nenhuma fruta fresca", "Apenas maçãs secas"], 1, "Mangas, abacaxis, maracujás e outras frutas tropicais ricas."),
        ("Qual lanche tradicional Gabriel e a avó consomem na barraca da feira ?", ["Sopa de cebola francesa", "Pastel frito de carne e caldo de cana com limão", "Arroz com feijão gelado", "Bolo industrial de chocolate"], 1, "Comem pastel frito crocante com caldo de cana gelado."),
        ("Por que a feira livre é importante para os moradores da região ?", ["Porque vende carros novos", "Porque é um espaço de convivência social e venda de comida fresca", "Porque substitui os hospitais", "Porque é totalmente silenciosa"], 1, "Favorece a convivência comunitária e o acesso a produtos frescos.")
    ],
    [
        ("Gabriel vai à feira sozinho sem a companhia de familiares.", ["Verdadeiro", "Falso"], 1, "Falso. Ele vai acompanhado da sua avó Helena."),
        ("As frutas tropicais à venda incluem mangas perfumadas e abacaxis doces.", ["Verdadeiro", "Falso"], 0, "Verdadeiro. O texto lista várias frutas tropicais frescas."),
        ("O caldo de cana consumido na barraca é servido bem gelado.", ["Verdadeiro", "Falso"], 0, "Verdadeiro. É servido gelado e acompanhado de gotas de limão."),
        ("Na feira livre não se vende nenhuma verdura nem legume fresco.", ["Verdadeiro", "Falso"], 1, "Falso. Vendem tomates, alfaces e diversos vegetais da horta."),
        ("A feira aproxima os consumidores diretamente dos produtores agrícolas.", ["Verdadeiro", "Falso"], 0, "Verdadeiro. Mantém o contato direto com o comércio tradicional.")
    ]
))

passages.append(make_passage(
    "Minha viagem de trem ao Porto (My Train Trip to Porto)", "A1", "pt",
    "Viajar de comboio por Portugal é uma experiência muito tranquila, agradável e cheia de belas paisagens naturais para recordar. Na última sexta-feira, Ana comprou um bilhete na estação de Santa Apolónia, em Lisboa, com destino à encantadora cidade do Porto, no norte do país. O comboio de alta velocidade, conhecido como Alfa Pendular, partiu pontualmente às nove horas da manhã. Ana sentou-se num assento confortável ao lado da janela grande para poder observar tudo com atenção. Durante a viagem de quase três horas, a carruagem atravessou campos verdes floridos, pequenas quintas rurais e florestas de pinheiros e sobreiros majestosos. Ela aproveitou o tempo livre para ler capítulos de um romance romântico e escutar músicas suaves nos fones de ouvido. Pouco antes de chegar ao destino final, o comboio cruzou a imponente ponte sobre o rio Douro, oferecendo uma vista deslumbrante das encostas da ribeira com os seus barcos rabelos tradicionais e as históricas caves de vinho. Ao desembarcar na bela estação de São Bento, Ana ficou maravilhada com os milhares de azulejos azuis e brancos que contam episódios da história de Portugal nas paredes interiores. Ela estava muito entusiasmada para começar a explorar a cidade invicta.",
    {"comboio": "train", "bilhete": "ticket", "pontualmente": "punctually", "assento": "seat", "carruagem": "rail carriage", "quintas": "farms / country estates", "sobreiros": "cork oaks", "encostas": "slopes / hillsides", "rabelos": "rabelo boats (wine boats)", "azulejos": "ceramic tiles"},
    [
        ("De qual estação ferroviária de Lisboa partiu a viagem de Ana ?", ["Da estação do Rossio", "Da histórica estação de Santa Apolónia", "Do cais do Sodré", "Do aeroporto da Portela"], 1, "Partiu da estação de Santa Apolónia na capital."),
        ("Como se chama o moderno comboio de alta velocidade utilizado ?", ["Alfa Pendular", "Metrô Ligeiro", "Vagão Rápido", "Triciclo Express"], 0, "O comboio chama-se Alfa Pendular."),
        ("O que Ana fez para se distrair durante a viagem de três horas ?", ["Dormiu no chão da carruagem", "Leu um romance e escutou músicas relaxantes", "Cozinhou sopa no comboio", "Fez pinturas a óleo"], 1, "Aproveitou para ler o seu romance e ouvir música."),
        ("Qual rio famoso o comboio atravessou pouco antes de chegar ao Porto ?", ["O rio Sena", "O rio Douro com as suas encostas históricas", "O rio Amazonas", "O rio Nilo"], 1, "Cruzou o rio Douro com vista para a ribeira e os barcos."),
        ("O que chamou a atenção de Ana nas paredes da estação de São Bento ?", ["Pinturas modernas em neon", "Milhares de azulejos azuis e brancos com cenas históricas", "Paredes de tijolo cinzento sem nada", "Fotografias de aviões"], 1, "Os magníficos painéis de azulejos azuis e brancos tradicionais.")
    ],
    [
        ("A viagem de comboio entre Lisboa e o Porto durou cerca de três horas.", ["Verdadeiro", "Falso"], 0, "Verdadeiro. O Alfa Pendular fez o percurso em quase três horas."),
        ("O comboio viajou com cinco horas de atraso na partida.", ["Verdadeiro", "Falso"], 1, "Falso. Partiu pontualmente às nove horas da manhã."),
        ("Das janelas do comboio era possível avistar campos verdes e sobreiros.", ["Verdadeiro", "Falso"], 0, "Verdadeiro. A paisagem revelava a natureza e o campo português."),
        ("Os barcos rabelos são embarcações tradicionais ligadas ao transporte do vinho do Porto.", ["Verdadeiro", "Falso"], 0, "Verdadeiro. Eles transportavam as pipas de vinho pelo rio Douro."),
        ("Ana ficou decepcionada e triste ao desembarcar na estação de São Bento.", ["Verdadeiro", "Falso"], 1, "Falso. Ficou maravilhada com a beleza dos azulejos e muito entusiasmada.")
    ]
))

# Save first 5 Portuguese passages test
print(f"Portuguese passages so far: {len(passages)}")
