# -*- coding: utf-8 -*-
"""
Appends A2, B1, B2, and C1 passages to Portuguese and writes src/data/reading/portuguese.ts.
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from passage_factory import make_passage
from reading_builder_helper import save_typescript_file
import build_portuguese

passages = build_portuguese.passages

# =========================================================================
# A2 (200-260 words)
# =========================================================================
passages.append(make_passage(
    "A tradição do pastel de nata e a doçaria portuguesa (Pastel de Nata Tradition)", "A2", "pt",
    "Em Portugal, a doçaria tradicional conventual ocupa um lugar de imenso destaque no património gastronómico e na identidade cultural do país, sendo admirada por viajantes do mundo inteiro. Entre todas as especialidades doces portuguesas, nenhuma alcançou tanta celebridade internacional quanto o irresistível pastel de nata, cuja receita original nasceu no início do século dezanove no imponente Mosteiro dos Jerónimos, localizado na histórica freguesia de Belém, em Lisboa. Naquela época de profunda devoção religiosa, os monges da ordem de São Jerónimo utilizavam enormes quantidades de claras de ovos para engomar com rigor as suas vestes religiosas brancas e para clarificar os vinhos finos produzidos na região. Para aproveitar o excesso de gemas que sobravam todos os dias na cozinha do convento, os religiosos criaram uma receita genial de tarteletes com massa folhada finíssima e um recheio aveludado à base de leite fresco, gemas de ovos batidas, açúcar e casca de limão perfumada. Após o encerramento do mosteiro em 1834, a fórmula secreta foi vendida aos proprietários de uma antiga refinaria de cana-de-açúcar, dando origem à afamada pastelaria 'Pastéis de Belém', que continua a laborar no mesmo local até aos dias de hoje. Servidos ainda mornos, estaladiços por fora e cremosos por dentro, estes pastéis são tradicionalmente polvilhados com açúcar em pó e canela moída, acompanhando na perfeição uma chávena de café bem forte.",
    {"conventual": "convent-based / monastic", "património": "heritage", "destaque": "prominence / highlight", "freguesia": "parish / neighborhood", "engomar": "to starch (clothing)", "gemas": "egg yolks", "massa folhada": "puff pastry", "aveludado": "velvety / smooth", "recheio": "filling", "estaladiços": "crispy / flaky", "chávena": "teacup / coffee cup", "laborar": "to operate / work"},
    [
        ("Onde nasceu a receita original dos famosos pastéis de nata ?", ["No Mosteiro dos Jerónimos em Belém", "Na cidade de Coimbra numa padaria moderna", "No Algarve num hotel de praia", "Na ilha da Madeira"], 0, "Nasceu no Mosteiro dos Jerónimos em Belém, Lisboa."),
        ("Por que os monges tinham tantas gemas de ovo sobrando na cozinha ?", ["Porque não gostavam de comer ovos", "Porque usavam as claras para engomar roupas e clarificar vinhos", "Porque compravam ovos estragados", "Porque faziam tinta amarela para pintar quadros"], 1, "Usavam as claras para engomar hábitos religiosos e clarificar vinho."),
        ("Quais ingredientes compõem o recheio cremoso e aveludado do doce ?", ["Carne moída com queijo", "Leite fresco, gemas batidas, açúcar e aroma de limão", "Apenas água com sal marinho", "Farinha de milho crua com vinagre"], 1, "O recheio leva leite, gemas de ovos, açúcar e casca de limão."),
        ("Como os pastéis de nata são tradicionalmente servidos nas confeitarias ?", ["Congelados e duros", "Mornos, estaladiços e polvilhados com canela e açúcar em pó", "Cobertos de molho de tomate", "Fritos em óleo escuro"], 1, "São servidos mornos e estaladiços com canela e açúcar."),
        ("Em qual ano o Mosteiro dos Jerónimos foi encerrado antes da venda da receita ?", ["Em 1999", "Em 1834 durante as reformas liberais", "Em 1500", "Em 2010"], 1, "A extinção das ordens religiosas ocorreu em 1834.")
    ],
    [
        ("A doçaria conventual portuguesa tem raízes históricas nos mosteiros antigos.", ["Verdadeiro", "Falso"], 0, "Verdadeiro. As freiras e monges criaram grande parte dos doces tradicionais."),
        ("O pastel de nata original é feito com massa de pão pesada e sem recheio.", ["Verdadeiro", "Falso"], 1, "Falso. É feito com massa folhada crocante e creme aveludado."),
        ("A pastelaria de Belém ainda funciona e utiliza a receita histórica original.", ["Verdadeiro", "Falso"], 0, "Verdadeiro. A fábrica dos Pastéis de Belém funciona desde o século XIX."),
        ("Nenhum turista estrangeiro tem interesse em provar os pastéis de nata em Lisboa.", ["Verdadeiro", "Falso"], 1, "Falso. É uma das atrações gastronómicas mais famosas e procuradas."),
        ("O doce é frequentemente apreciado acompanhado de um café expresso bem tirado.", ["Verdadeiro", "Falso"], 0, "Verdadeiro. O pastel de nata com café é uma combinação clássica diária.")
    ]
))

passages.append(make_passage(
    "A festa junina e as danças populares no Nordeste (Festa Junina in the Northeast)", "A2", "pt",
    "Durante todo o mês de junho, a região Nordeste do Brasil ganha vida com uma explosão contagiante de cores, ritmos folclóricos e sabores acolhedores com a celebração das tradicionais Festas Juninas em homenagem a São João, Santo António e São Pedro. Cidades como Campina Grande, na Paraíba, e Caruaru, em Pernambuco, disputam anualmente o honroso título de realizadoras do maior São João do planeta, atraindo centenas de milhares de turistas e forrozeiros entusiasmados. Os arraiais são carinhosamente enfeitados com quilómetros de bandeirinhas coloridas de papel de seda, balões iluminados e fogueiras acesas que aquecem as noites frescas de inverno. O som animado da sanfona, do triângulo e do zabumba comanda o compasso acelerado do forró, do xote e do baião, eternizados pela genialidade musical do lendário Luiz Gonzaga. Nas praças públicas, grupos comunitários apresentam danças de quadrilha espetaculares, onde rapazes vestidos com camisas axadrezadas e moças com vestidos floridos rodopiantes encenam casamentos caipiras bem-humorados cheios de brincadeiras. A culinária típica das festividades é profundamente ligada à época da colheita do milho: as famílias saboreiam pratos deliciosos e reconfortantes como espigas de milho cozido com manteiga, pamonha doce enrolada na palha natural, canjica cremosa salpicada com canela, bolo de fubá fofinho e quentão aromatizado com gengibre e cravinho. A festa junina é uma celebração pura do calor humano e da resistência cultural nordestina.",
    {"contagiante": "infectious / contagious", "forrozeiros": "forró dancers / fans", "arraiais": "festive grounds / party village", "bandeirinhas": "little paper flags", "fogueiras": "bonfires", "sanfona": "accordion", "zabumba": "bass drum", "axadrezadas": "plaid / checkered", "caipiras": "country / rustic", "pamonha": "corn paste cake (pamonha)", "canjica": "sweet corn pudding", "salpicada": "sprinkled / dusted"},
    [
        ("Quais santos católicos populares são celebrados nas Festas Juninas brasileiras ?", ["São Nicolau e São Bento", "São João, Santo António e São Pedro", "São Jorge e São Francisco", "Apenas São Judas Tadeu"], 1, "Celebram-se São João, Santo António e São Pedro em junho."),
        ("Quais cidades nordestinas competem pelo título de maior São João do mundo ?", ["Porto Alegre e Curitiba", "Campina Grande e Caruaru", "Brasília e Goiânia", "Santos e Vitória"], 1, "Campina Grande (Paraíba) e Caruaru (Pernambuco)."),
        ("Quais instrumentos tradicionais formam a base do ritmo do forró ?", ["Guitarra elétrica e bateria pesada", "Sanfona, triângulo e zabumba", "Violino clássico e piano de cauda", "Trompete e flauta doce"], 1, "O trio tradicional do forró é composto por sanfona, triângulo e zabumba."),
        ("Qual alimento agrícola colhido no campo é o ingrediente principal dos pratos juninos ?", ["O arroz branco refinado", "O milho verde doce", "A soja transgénica", "A uva passa"], 1, "O milho verde é a base de pratos como pamonha, canjica e bolos."),
        ("O que os grupos encenam com humor durante a apresentação da quadrilha junina ?", ["Uma batalha naval", "Um casamento caipira divertido com brincadeiras teatrais", "Uma cerimónia fúnebre", "Um julgamento criminal severo"], 1, "Encenam um bem-humorado casamento na roça com dança coletiva.")
    ],
    [
        ("As Festas Juninas no Nordeste acontecem com grande entusiasmo no mês de junho.", ["Verdadeiro", "Falso"], 0, "Verdadeiro. O mês inteiro é dedicado às celebrações populares."),
        ("O músico Luiz Gonzaga é considerado um dos maiores ícones do baião e do forró.", ["Verdadeiro", "Falso"], 0, "Verdadeiro. Ele popularizou os ritmos nordestinos por todo o Brasil."),
        ("Os arraiais juninos são espaços tristes sem qualquer tipo de música ou decoração.", ["Verdadeiro", "Falso"], 1, "Falso. São enfeitados com bandeirinhas e cheios de som animado."),
        ("Pamonha e canjica são sobremesas tradicionais feitas a partir do milho verde.", ["Verdadeiro", "Falso"], 0, "Verdadeiro. Fazem parte do banquete junino à base de milho."),
        ("As fogueiras são acesas apenas para cozinhar peixes na beira das praias.", ["Verdadeiro", "Falso"], 1, "Falso. As fogueiras homenageiam os santos e aquecem as noites de inverno.")
    ]
))

passages.append(make_passage(
    "O fado de Alfama e a saudade lisboeta (Fado & Saudade in Alfama)", "A2", "pt",
    "Em Lisboa, ao cair suave da noite sobre o casario antigo e as ladeiras sinuosas do histórico bairro de Alfama, o ar enche-se de notas melancólicas dedilhadas na guitarra portuguesa, anunciando o início de uma noite de fado autêntico. Considerado património cultural imaterial da humanidade pela UNESCO, o fado é a mais profunda expressão poética e musical da alma lusitana, transmitindo sentimentos universais como o amor desmedido, o destino implacável e a intraduzível palavra 'saudade', que evoca uma mistura agridoce de ausência sentida, memórias queridas e esperança distante. Nas pequenas tabernas e casas de fado intimistas, onde a luz fraca de velas cria um ambiente quase sagrado de recolhimento, o silêncio faz-se ouvir assim que a fadista se levanta envolvida no seu xaile negro de lã. Sem necessidade de microfones potentes ou efeitos especiais artificiais, a voz pura e poderosa ecoa com pungência pelas paredes de pedra caiada, acompanhada pelo timbre cristalino das doze cordas de aço da guitarra portuguesa e pelos acordes graves da viola de fado. Recordam-se grandes lendas como Amália Rodrigues, que levou a poesia lusa aos palcos mais prestigiados do mundo, enquanto novas gerações de artistas reinventam o género com arranjos inovadores sem perder a autenticidade das origens. Ouvir fado enquanto se saboreia um copo de vinho tinto robusto do Alentejo e um caldo verde fumegante é uma vivência sensorial e afetiva que toca o fundo da alma de qualquer viajante.",
    {"ladeiras": "slopes / steep streets", "dedilhadas": "strummed / plucked", "lusitana": "Lusitanian / Portuguese", "saudade": "saudade (longing / nostalgia)", "tabernas": "taverns", "intimistas": "intimate", "recolhimento": "contemplation / quietness", "xaile": "shawl", "caiada": "whitewashed", "timbre": "timbre / tone", "fumegante": "steaming hot", "vivência": "life experience / living moment"},
    [
        ("Em qual bairro histórico de Lisboa o fado tradicional é muito vivenciado ?", ["No Parque das Nações", "Em Alfama com as suas ladeiras sinuosas", "Em Cascais moderno", "No aeroporto"], 1, "No antigo e carismático bairro medieval de Alfama."),
        ("Qual sentimento complexo e tipicamente português é expresso no fado ?", ["A raiva destrutiva", "A 'saudade', mistura de memória, ausência e afeto", "O medo de viajar", "O tédio sem sentido"], 1, "A saudade, sentimento profundo de amor e lembrança."),
        ("Qual peça de vestuário tradicional a fadista costuma usar nos ombros ?", ["Um casaco desportivo amarelo", "Um elegante xaile negro de lã", "Um colete salva-vidas", "Um chapéu de palha"], 1, "Usa tradicionalmente um xaile negro sobre os ombros."),
        ("Quais instrumentos acompanham a voz pura da fadista nas casas tradicionais ?", ["Bateria eletrónica e saxofone", "Guitarra portuguesa de doze cordas e viola de fado", "Acordeão e flauta transversal", "Sintetizador e órgão elétrico"], 1, "A guitarra portuguesa e a viola de acompanhamento."),
        ("Qual grande cantora é reverenciada como a rainha do fado português no mundo ?", ["Carmen Miranda", "Amália Rodrigues", "Maria Callas", "Gal Costa"], 1, "Amália Rodrigues é o maior ícone histórico do fado luso.")
    ],
    [
        ("O fado é reconhecido pela UNESCO como património cultural da humanidade.", ["Verdadeiro", "Falso"], 0, "Verdadeiro. O género recebeu essa distinção mundial em 2011."),
        ("As apresentações de fado em Alfama exigem palcos gigantes e luzes de neon.", ["Verdadeiro", "Falso"], 1, "Falso. Ocorrem em tabernas acolhedoras à luz de velas."),
        ("A guitarra portuguesa possui doze cordas de aço e um timbre agudo cristalino.", ["Verdadeiro", "Falso"], 0, "Verdadeiro. As suas cordas duplas conferem uma sonoridade única."),
        ("O público costuma conversar alto e gritar durante o canto da fadista.", ["Verdadeiro", "Falso"], 1, "Falso. Há um respeito profundo com silêncio absoluto para ouvir."),
        ("O caldo verde com vinho é um acompanhamento gastronómico típico nas noites de fado.", ["Verdadeiro", "Falso"], 0, "Verdadeiro. Pratos tradicionais completam a experiência cultural.")
    ]
))

passages.append(make_passage(
    "A paixão nacional pelo futebol brasileiro (Brazilian Football Passion)", "A2", "pt",
    "No Brasil, o futebol transcende as barreiras de uma simples modalidade atlética para se converter no elemento primordial da identidade cultural colectiva e no coração das conversas populares de norte a sul do país. Conhecido internacionalmente como o 'país do futebol' e único detentor de cinco taças de campeão do mundo da FIFA, o Brasil desenvolveu um estilo inconfundível de jogo, celebrado como 'futebol-arte', marcado pelo drible desconcertante, pela improvisação espontânea e pela alegria desinibida dentro das quatro linhas. Esta relação apaixonada tem início logo na infância: em qualquer pedaço de chão batido de pequenas vilas do interior, nas praias de areia branca ou nas ruas estreitas das comunidades periféricas das grandes metrópoles, crianças descalças jogam com bolas improvisadas de meias ou plástico, sonhando seguir os passos gloriosos de ídolos universais como Pelé, Garrincha, Zico, Ronaldo Fenómeno e Marta. Nos dias de partidas decisivas dos grandes clubes como Flamengo, Corinthians, Palmeiras ou São Paulo, o país praticamente para: as ruas cobrem-se de camisolas coloridas, as famílias reúnem-se ao redor da televisão na sala para assar carne na brasa e os bares enchem-se de torcedores apaixonados que gritam a cada lance perigoso. O estádio do Maracanã, no Rio de Janeiro, ergue-se como um verdadeiro templo deste espetáculo desportivo emocionante, onde cânticos ritmados ecoam das bancadas com a força de um coro de dezenas de milhares de vozes unidas pelo amor à camisola.",
    {"transcende": "transcends", "detentor": "holder / possessor", "drible": "dribble / feint", "desconcertante": "baffling / dazzling", "quatro linhas": "pitch / playing field (four lines)", "chão batido": "dirt ground / packed earth", "descalças": "barefoot", "camisolas": "jerseys / shirts", "brasa": "embers / barbecue grill", "torcedores": "fans / supporters", "bancadas": "bleachers / stands", "cânticos": "chants / songs"},
    [
        ("Quantos títulos mundiais da FIFA a seleção brasileira conquistou na sua história ?", ["Dois títulos", "Cinco títulos de campeão mundial", "Apenas um título", "Nenhum título oficial"], 1, "O Brasil é o único país pentacampeão mundial de futebol."),
        ("Como é conhecido o estilo de jogo criativo e com dribles do futebol brasileiro ?", ["Futebol de choque", "Futebol-arte caracterizado pela improvisação e drible", "Futebol defensivo estático", "Jogo mecânico"], 1, "O estilo é celebrado como 'futebol-arte'."),
        ("Onde muitas crianças brasileiras começam a jogar bola na infância ?", ["Em campos cobertos de luxo", "Em campinhos de terra batida, na rua ou na praia", "Apenas em estádios profissionais", "Em ginásios climatizados"], 1, "Jogam em campinhos de terra, ruas ou praias com alegria."),
        ("Qual estádio mítico do Rio de Janeiro é considerado o templo do futebol nacional ?", ["O Estádio Azteca", "O lendário Estádio do Maracanã", "O Coliseu romano", "A Arena de Wembley"], 1, "O Maracanã é o templo histórico do futebol no país."),
        ("Qual grande jogador do passado é reverenciado mundialmente como o 'Rei do futebol' ?", ["Napoleão Bonaparte", "Pelé", "Pablo Picasso", "Ayrton Senna"], 1, "Pelé é considerado o Rei do futebol mundial.")
    ],
    [
        ("O Brasil é a única seleção de futebol que venceu cinco Copas do Mundo.", ["Verdadeiro", "Falso"], 0, "Verdadeiro. O país detém cinco estrelas de campeão da FIFA."),
        ("As pessoas no Brasil nunca assistem a jogos de futebol juntas com a família.", ["Verdadeiro", "Falso"], 1, "Falso. As famílias reúnem-se para churrascos e assistem juntas com entusiasmo."),
        ("Pelé e Garrincha são figuras lendárias da história do futebol brasileiro.", ["Verdadeiro", "Falso"], 0, "Verdadeiro. São pioneiros do futebol-arte reconhecidos no mundo todo."),
        ("O Maracanã fica localizado na cidade de Salvador da Bahia.", ["Verdadeiro", "Falso"], 1, "Falso. Fica localizado na cidade do Rio de Janeiro."),
        ("O futebol no Brasil funciona como um ponto de união e orgulho comunitário.", ["Verdadeiro", "Falso"], 0, "Verdadeiro. Conecta pessoas de todas as regiões e classes sociais.")
    ]
))

passages.append(make_passage(
    "O ecoturismo e a beleza natural de Bonito (Ecotourism in Bonito)", "A2", "pt",
    "Localizado no coração do estado do Mato Grosso do Sul, o município de Bonito é reconhecido internacionalmente como um dos destinos de ecoturismo e turismo de aventura mais fascinantes, organizados e sustentáveis de todo o continente sul-americano. Cercada pela exuberância da serra da Bodoquena e pela rica biodiversidade do ecossistema do Pantanal, a região atrai amantes da natureza encantados pelas suas águas doces extraordinariamente transparentes, grutas calcárias misteriosas e cachoeiras espetaculares. O fenómeno hidrológico da limpidez quase irreal dos rios da região, como o famoso rio Sucuri e o rio da Prata, deve-se à grande concentração de calcário nas rochas subterrâneas: o carbonato de cálcio atua como um poderoso filtro natural que sedimenta qualquer impureza no fundo, transformando os cursos de água em imensos aquários naturais de água límpida. Durante a atividade de flutuação, equipados com fatos de neoprene, coletes salva-vidas e máscaras de mergulho com tubo, os turistas deslizam suavemente à flor da água acompanhados por cardumes curiosos de peixes dourados e piraputangas multicoloridas, sem perturbar o ambiente frágil. Para proteger este santuário ecológico do impacto predatório do turismo de massa desordenado, a prefeitura local implementou um inovador sistema de vouchers digitais com capacidade de carga rigorosa e controlo estrito do número de visitantes em cada atração diária. Bonito é uma prova viva de que a conservação rigorosa da natureza e o desenvolvimento económico responsável podem conviver em harmonia perfeita.",
    {"exuberância": "exuberance / lushness", "calcárias": "limestone / calcareous", "limpidez": "clarity / limpidity", "flutuação": "floating / snorkeling", "neoprene": "wetsuit (neoprene)", "fatos": "suits (wetsuits)", "cardumes": "schools of fish", "dourados": "golden dorados (fish)", "piraputangas": "piraputangas (tropical fish)", "predatório": "predatory / destructive", "vouchers": "digital vouchers / permits", "carga": "carrying capacity"},
    [
        ("Em qual estado brasileiro está localizado o famoso polo ecológico de Bonito ?", ["Em São Paulo", "No Mato Grosso do Sul, perto do Pantanal", "No Ceará no litoral", "No Amazonas junto a Manaus"], 1, "Fica no Mato Grosso do Sul na serra da Bodoquena."),
        ("Por que as águas dos rios de Bonito são tão incrivelmente cristalinas ?", ["Porque usam cloro em pó nos rios", "Porque o calcário das rochas filtra as impurezas e as deposita no fundo", "Porque os rios não têm peixes", "Porque a água é congelada o ano inteiro"], 1, "O calcário atua como filtro natural de sedimentação das águas."),
        ("Como os visitantes realizam a atividade de flutuação nos rios límpidos ?", ["Nadando rápido de costas", "Deslizando suavemente com fato de neoprene, colete e máscara", "Mergulhando com garrafas de oxigénio pesadas", "Andando a pé no leito do rio"], 1, "Flutuam suavemente com colete e máscara observando a fauna."),
        ("Quais espécies de peixes nadam ao lado dos turistas durante as flutuações ?", ["Baleias azuis e tubarões brancos", "Cardumes de piraputangas e peixes dourados da região", "Apenas pequenos caranguejos", "Nenhum animal sobrevive na água"], 1, "Nadam com piraputangas, dourados e outras espécies nativas."),
        ("Qual mecanismo ecológico foi criado para impedir a degradação provocada pelo turismo ?", ["A proibição total de qualquer pessoa na cidade", "Um voucher digital com número limite de visitantes diários em cada passeio", "A destruição das estradas", "O corte de todas as árvores ao redor"], 1, "O sistema de voucher digital com controle estrito de carga ambiental.")
    ],
    [
        ("Bonito é famoso pelas suas grutas, cachoeiras e rios de água transparente.", ["Verdadeiro", "Falso"], 0, "Verdadeiro. É considerado um modelo global de ecoturismo sustentável."),
        ("Os rios da região são barrentos, escuros e sem qualquer visibilidade.", ["Verdadeiro", "Falso"], 1, "Falso. As águas são incrivelmente cristalinas como num aquário."),
        ("Os turistas usam roupas e máscaras para flutuar sem pisar o fundo do rio.", ["Verdadeiro", "Falso"], 0, "Verdadeiro. Isso evita levantar sedimentos e protege as plantas aquáticas."),
        ("Qualquer número ilimitado de pessoas pode entrar nas atrações ao mesmo tempo.", ["Verdadeiro", "Falso"], 1, "Falso. Há vagas diárias estritas controladas por sistema público."),
        ("A preservação de Bonito demonstra o sucesso da união entre turismo e conservação.", ["Verdadeiro", "Falso"], 0, "Verdadeiro. É uma referência internacional de sustentabilidade ambiental.")
    ]
))

# Save first 10 Portuguese passages test
print(f"Portuguese passages so far: {len(passages)}")
