// Content for the map. Scripture: RSV-2CE. Art images: Wikimedia Commons (credits on each entry). Coordinates: [longitude, latitude].
const PLACES = {
  nazareth:   { name: "Nazareth", ll: [35.30, 32.70], region: "Galilee", certainty: "Certain",
    note: "A small village of perhaps a few hundred people in the hills of Lower Galilee. Mary's home, and Jesus' home for about thirty years. The Basilica of the Annunciation stands over the traditional site of Mary's house.",
    today: {"text": "Nazareth is now the largest Arab city in Israel, spread over the hills it once barely touched. The modern Basilica of the Annunciation, finished in 1969, rises over the grotto honored as Mary's home.", "img": "img/today/nazareth.jpg", "credit": "A Marian mosaic in the courtyard of the Basilica of the Annunciation. Photo: Hoshvilim, CC BY-SA 4.0, via Wikimedia Commons", "source": "https://commons.wikimedia.org/wiki/File:Church_of_the_Annunciation,_Nazareth,_Israel_21.jpg"} },
  einkarem:   { name: "Ein Karem", ll: [35.16, 31.77], region: "Judea", certainty: "Traditional",
    note: "Luke says only \"a city of Judah\" in the hill country. Since at least the Byzantine era, Ein Karem, about 4 miles west of Jerusalem, has been honored as the home of Zechariah and Elizabeth. The Church of the Visitation and the Church of St John the Baptist stand there today.",
    today: {"text": "Ein Karem is now a leafy village quarter on the southwest edge of Jerusalem. The Church of the Visitation, built in 1955 to designs by Antonio Barluzzi, stands on the hillside where tradition places Elizabeth's home.", "img": "img/today/einkarem.jpg", "credit": "Statue of Mary and Elizabeth at the Church of the Visitation. Photo: Flavio~, CC BY 2.0, via Wikimedia Commons", "source": "https://commons.wikimedia.org/wiki/File:Ein_Karem-_Visitation_Church_(5569954169).jpg"} },
  temple:     { name: "Jerusalem (Temple)", ll: [35.235, 31.778], region: "Judea", certainty: "Certain",
    note: "Herod the Great's rebuilt Temple, begun about 20 BC, one of the largest sacred complexes of the Roman world. The Romans destroyed it in AD 70. The Temple Mount platform and the Western Wall remain.",
    today: {"text": "Herod's great platform still dominates Jerusalem's Old City. The Dome of the Rock, finished in 691, stands on top, and the Western Wall below it is part of Herod's retaining wall.", "img": "img/today/temple.jpg", "credit": "Western Wall and Dome of the Rock. Photo: Paul Arps, CC BY 2.0, via Wikimedia Commons", "source": "https://commons.wikimedia.org/wiki/File:Wailing_Wall_and_Dome_of_the_Rock_overview_(Jerusalem,_Palestine_2013)_(8683269470).jpg"} },
  bethlehem:  { name: "Bethlehem", ll: [35.20, 31.705], region: "Judea", certainty: "Certain",
    note: "The city of David, about 6 miles south of Jerusalem. The Church of the Nativity, first built under Constantine in the 330s, stands over the cave honored as the birthplace since at least the 2nd century.",
    today: {"text": "Bethlehem is a Palestinian city in the West Bank. The Church of the Nativity, rebuilt under Justinian in the 6th century, is one of the oldest churches still in daily use and a UNESCO World Heritage Site.", "img": "img/today/bethlehem.jpg", "credit": "Church of the Nativity. Photo: Bahnfrend, CC BY-SA 4.0, via Wikimedia Commons", "source": "https://commons.wikimedia.org/wiki/File:Church_of_the_Nativity,_2019_(01).jpg"} },
  shepherds:  { name: "Shepherds' Field", ll: [35.228, 31.700], region: "Judea", certainty: "Traditional",
    note: "Beit Sahour, just east of Bethlehem, where the land falls toward the Judean wilderness. Two chapels mark the traditional fields.",
    today: {"text": "Beit Sahour is a largely Christian town just east of Bethlehem. The Franciscan chapel at Shepherds' Field, built in 1954 by Antonio Barluzzi, is shaped like a shepherd's tent. A Greek Orthodox church nearby marks another traditional site.", "img": "img/today/shepherds.jpg", "credit": "Dome of the Shepherds' Field Chapel. Photo: Kyle Taylor, CC BY 4.0, via Wikimedia Commons", "source": "https://commons.wikimedia.org/wiki/File:Kyle_Taylor,_Roman_Catholic_Shepherds_Field_Chapel,_Beit_Sahour,_Bethlehem_-_16.jpg"} },
  egypt:      { name: "Egypt (Matariya)", ll: [31.31, 30.13], region: "Egypt", certainty: "Traditional",
    note: "Matthew names only Egypt. Coptic tradition traces a long route of the Holy Family through the Nile Valley. Matariya, near ancient Heliopolis (now Cairo), keeps the \"Virgin's Tree\" where they are said to have rested.",
    today: {"text": "Matariya is now a crowded district of northeast Cairo. A sycamore called the Virgin's Tree, a 17th-century successor of older trees, is kept in a walled garden where pilgrims still visit.", "img": "img/today/egypt.jpg", "credit": "The Virgin's Tree, Matariya. Photo: Roland Unger, CC BY-SA 3.0, via Wikimedia Commons", "source": "https://commons.wikimedia.org/wiki/File:CairoVirginTree.jpg"} },
  jericho:    { name: "Jericho", ll: [35.45, 31.865], region: "Judea", certainty: "Certain",
    note: "An oasis city in the Jordan Valley, about 850 ft below sea level. Herod the Great built a lavish winter palace here, where he died.",
    today: {"text": "Modern Jericho is a Palestinian city in the West Bank. Tell es-Sultan, the mound of ancient Jericho, became a UNESCO World Heritage Site in 2023. Herod's winter palaces lie about a mile to the southwest, at Tulul Abu el-Alayiq.", "img": "img/today/jericho.jpg", "credit": "Tell es-Sultan. Photo: Diego Delso, CC BY-SA 3.0, via Wikimedia Commons", "source": "https://commons.wikimedia.org/wiki/File:Tell_es-Sultan,_Jericho,_Palestine2.jpg"} },
  herodium:   { name: "Herodium", ll: [35.241, 31.666], region: "Judea", certainty: "Certain",
    note: "Herod's fortress-palace on a cone-shaped hill visible from Bethlehem. Archaeologist Ehud Netzer identified Herod's tomb on its slope in 2007.",
    today: {"text": "Herodium is an archaeological park south of Bethlehem. Visitors climb the cone to the ruins of Herod's palace-fortress, with its towers, cisterns, and tunnels, and can see the small theater found beside his tomb.", "img": "img/today/herodium.jpg", "credit": "Herodium from above. Photo: Asaf T., public domain, via Wikimedia Commons", "source": "https://commons.wikimedia.org/wiki/File:Herodium_from_above.jpg"} },
  caesarea:   { name: "Caesarea Maritima", ll: [34.89, 32.50], region: "Samaria (coast)", certainty: "Certain",
    note: "Herod's harbor city, named for Caesar Augustus. It became the seat of the Roman prefects of Judea, Pilate among them, who went up to Jerusalem at the great feasts.",
    today: {"text": "Caesarea is a national park on Israel's coast, between Tel Aviv and Haifa. Herod's harbor, theater, and hippodrome can still be walked. A stone found here in 1961 bears the name of Pontius Pilate.", "img": "img/today/caesarea.jpg", "credit": "The Roman theater at Caesarea. Photo: Godot13, CC BY-SA 4.0, via Wikimedia Commons", "source": "https://commons.wikimedia.org/wiki/File:ISR-2015-Caesarea-Caesarea_Maritima-Herodian_Amphitheater_01.jpg"} },
  tiberias:   { name: "Tiberias", ll: [35.535, 32.79], region: "Galilee", certainty: "Certain",
    note: "Founded by Herod Antipas about AD 18 to 20 on the Sea of Galilee and named for the emperor Tiberius. It became his capital. The Gospels never record Jesus entering it.",
    today: {"text": "Tiberias is a lakeside city on the western shore of the Sea of Galilee. Later it became a great center of Jewish learning, where the Jerusalem Talmud was compiled.", "img": "img/today/tiberias.jpg", "credit": "Lake promenade. Photo: geagea, CC BY 3.0, via Wikimedia Commons", "source": "https://commons.wikimedia.org/wiki/File:View_of_Yigal_Allon_promenade_from_the_Sea_of_Galilee.JPG"} },
  wilderness: { name: "Jordan near Jericho", ll: [35.53, 31.80], region: "Judea / Perea", certainty: "Probable",
    note: "John preached in the wilderness of Judea and baptized in the Jordan. The lower Jordan near Jericho lies on the main road from Galilee down to Jerusalem, where crowds would pass.",
    today: {"text": "Qasr al-Yahud, on the west bank of the Jordan, reopened to pilgrims in 2011 after decades as a closed military zone. Pilgrims step down into the narrow, muddy river for renewal of baptismal vows.", "img": "img/today/wilderness.jpg", "credit": "Qasr al-Yahud. Photo: Fallaner, CC BY-SA 4.0, via Wikimedia Commons", "source": "https://commons.wikimedia.org/wiki/File:Holy_Land_2016_P0577_Jordan_River_Kasr_al-Jahud_site_of_the_baptism_of_Jesus.jpg"} },
  bethabara:  { name: "Bethany beyond the Jordan", ll: [35.556, 31.840], region: "Perea", certainty: "Probable",
    note: "John 1:28 places John's baptizing at \"Bethany beyond the Jordan.\" Al-Maghtas on the east bank (a UNESCO World Heritage Site since 2015) and Qasr al-Yahud facing it on the west bank are honored as the place of Jesus' baptism.",
    today: {"text": "Al-Maghtas, Arabic for \"the place of immersion,\" lies on the Jordanian bank. Excavations since 1996 have uncovered Byzantine churches, pools, and monks' caves near Elijah's Hill. It became a UNESCO World Heritage Site in 2015.", "img": "img/today/bethabara.jpg", "credit": "Al-Maghtas. Photo: JeriesBassier, CC BY 4.0, via Wikimedia Commons", "source": "https://commons.wikimedia.org/wiki/File:%D8%A7%D9%84%D9%85%D8%BA%D8%B7%D8%B3.jpg"} }
};

// Minor places drawn for context only.
const CONTEXT = [
  ["Capernaum", 35.575, 32.881], ["Cana", 35.34, 32.75], ["Sepphoris", 35.28, 32.75],
  ["Magdala", 35.515, 32.825], ["Bethsaida", 35.63, 32.91], ["Scythopolis", 35.50, 32.50],
  ["Samaria", 35.19, 32.28], ["Hebron", 35.10, 31.53], ["Joppa", 34.75, 32.05],
  ["Gaza", 34.45, 31.51], ["Ascalon", 34.55, 31.66], ["Gadara", 35.68, 32.65],
  ["Machaerus", 35.64, 31.56], ["Damascus", 36.29, 33.51], ["Tyre", 35.20, 33.27],
  ["Sidon", 35.37, 33.56], ["Caesarea Philippi", 35.69, 33.25], ["Pelusium", 32.55, 31.04],
  ["Alexandria", 29.92, 31.20], ["Memphis", 31.25, 29.85], ["Emmaus", 34.99, 31.84],
  ["Qumran", 35.46, 31.74], ["Rhinocorura", 33.80, 31.12]
];

const MOUNTAINS = [["Mt Hermon", 35.86, 33.42], ["Mt Tabor", 35.39, 32.69], ["Mt Carmel", 35.05, 32.73], ["Mt of Olives", 35.245, 31.778]];

const REGIONS = [
  ["Galilee", 35.38, 32.88], ["Samaria", 35.18, 32.18], ["Judea", 35.02, 31.50], ["Idumea", 34.95, 31.12],
  ["Perea", 35.78, 31.92], ["Decapolis", 36.02, 32.50], ["Phoenicia", 35.38, 33.42], ["Nabataea", 35.85, 30.55],
  ["Egypt", 30.70, 30.40], ["Sinai", 33.75, 29.70], ["Iturea", 36.10, 33.10]
];

// Waypoints for journeys. Scripture rarely names roads; these follow the main roads of the day.
const ROUTES = {
  "nazareth>einkarem":  [[35.30,32.70],[35.38,32.55],[35.50,32.45],[35.53,32.15],[35.47,31.88],[35.30,31.80],[35.235,31.778],[35.16,31.77]],
  "einkarem>nazareth":  [[35.16,31.77],[35.235,31.778],[35.30,31.80],[35.47,31.88],[35.53,32.15],[35.50,32.45],[35.38,32.55],[35.30,32.70]],
  "nazareth>bethlehem": [[35.30,32.70],[35.38,32.55],[35.50,32.45],[35.53,32.15],[35.47,31.88],[35.30,31.80],[35.235,31.778],[35.20,31.705]],
  "bethlehem>shepherds":[[35.20,31.705],[35.228,31.700]],
  "bethlehem>temple":   [[35.20,31.705],[35.215,31.74],[35.235,31.778]],
  "temple>bethlehem":   [[35.235,31.778],[35.215,31.74],[35.20,31.705]],
  "bethlehem>egypt":    [[35.20,31.705],[34.95,31.60],[34.55,31.55],[34.45,31.51],[34.22,31.30],[33.80,31.12],[33.10,31.12],[32.55,31.04],[32.10,30.70],[31.70,30.40],[31.31,30.13]],
  "egypt>nazareth":     [[31.31,30.13],[31.70,30.40],[32.10,30.70],[32.55,31.04],[33.10,31.12],[33.80,31.12],[34.22,31.30],[34.45,31.51],[34.75,32.05],[34.88,32.45],[35.05,32.62],[35.30,32.70]],
  "nazareth>temple":    [[35.30,32.70],[35.38,32.55],[35.50,32.45],[35.53,32.15],[35.47,31.88],[35.30,31.80],[35.235,31.778]],
  "nazareth>bethabara": [[35.30,32.70],[35.38,32.55],[35.50,32.45],[35.53,32.15],[35.556,31.840]],
  "jericho>herodium":   [[35.45,31.865],[35.38,31.76],[35.30,31.70],[35.241,31.666]]
};

const LANES = [
  { id: "jesus", name: "Jesus & the Holy Family" },
  { id: "john",  name: "John the Baptist & family" },
  { id: "herod", name: "The Herods" },
  { id: "rome",  name: "Rome & its governors" }
];

const EVENTS = [
  {
    id: "zechariah", lane: "john", place: "temple", date: "c. 7–6 BC",
    title: "Gabriel appears to Zechariah",
    people: ["Zechariah", "Gabriel", "Elizabeth"],
    gospels: { Lk: "1:5–25" },
    summary: "Zechariah, an elderly priest, is chosen by lot to burn incense in the sanctuary. The angel Gabriel tells him that his barren wife Elizabeth will bear a son to be named John, who will go before the Lord \"in the spirit and power of Elijah.\" Because he doubts, Zechariah is struck mute until the child is born.",
    stay: "Zechariah was serving his priestly division's week at the Temple, then returned home to the hill country.",
    scripture: [
      { ref: "Luke 1:13", text: "But the angel said to him, \"Do not be afraid, Zechariah, for your prayer is heard, and your wife Elizabeth will bear you a son, and you shall call his name John.\"" },
      { ref: "Luke 1:17", text: "and he will go before him in the spirit and power of Elijah, to turn the hearts of the fathers to the children, and the disobedient to the wisdom of the just, to make ready for the Lord a people prepared." }
    ],
    echoes: [{ ref: "Malachi 4:5–6", note: "The promised return of Elijah, which Gabriel's words echo." }],
    art: [
      { kind: "Masterpiece", img: "img/zechariah0.jpg", credit: "Public domain, via Wikimedia Commons", source: "https://commons.wikimedia.org/wiki/File:Angel_Appearing_to_Zacharias.jpg",
        title: "The Annunciation to Zacharias", artist: "Domenico Ghirlandaio", year: "1486–90", medium: "Fresco",
        location: "Tornabuoni Chapel, Santa Maria Novella, Florence",
        description: "The angel appears beside the altar while Zechariah offers incense, watched by a crowd of Florentines in contemporary dress.",
        significance: "Part of the great cycle of the lives of the Virgin and John the Baptist commissioned by Giovanni Tornabuoni.",
        symbolism: "The incense smoke rising before the altar stands for prayer ascending to God; the Florentine onlookers place the Gospel inside the patrons' own city.",
        impact: "Among the most admired fresco cycles of the Florentine Renaissance. A young Michelangelo was apprenticed in Ghirlandaio's workshop around the time it was painted." }
    ]
  },
  {
    id: "annunciation", lane: "jesus", place: "nazareth", date: "c. 6–5 BC",
    title: "The Annunciation",
    people: ["Mary", "Gabriel", "Joseph"],
    gospels: { Lk: "1:26–38" },
    summary: "In the sixth month of Elizabeth's pregnancy, Gabriel is sent to Nazareth to Mary, a virgin betrothed to Joseph of the house of David. He announces that she will conceive by the Holy Spirit and bear a son, Jesus, who will reign over the house of Jacob forever. Mary gives her consent.",
    stay: "Mary's family home in Nazareth.",
    scripture: [
      { ref: "Luke 1:28", text: "And he came to her and said, \"Hail, full of grace, the Lord is with you!\"" },
      { ref: "Luke 1:38", text: "And Mary said, \"Behold, I am the handmaid of the Lord; let it be to me according to your word.\" And the angel departed from her." }
    ],
    echoes: [{ ref: "Isaiah 7:14", note: "\"Behold, a virgin shall conceive and bear a son.\"" }, { ref: "2 Samuel 7:12–16", note: "God's promise of an everlasting throne to David's line." }],
    art: [
      { kind: "Masterpiece", img: "img/annunciation0.jpg", credit: "Public domain, via Wikimedia Commons", source: "https://commons.wikimedia.org/wiki/File:Fra_Angelico_-_The_Annunciation_-_WGA00555.jpg",
        title: "Annunciation", artist: "Fra Angelico", year: "c. 1440–45", medium: "Fresco",
        location: "Convent of San Marco, Florence (top of the dormitory stairs)",
        description: "Gabriel bows before Mary, seated on a simple stool beneath a quiet loggia. Both lean forward with crossed arms.",
        significance: "Painted for the Dominican friars to meet at the top of the stairs. An inscription asks them to say a Hail Mary as they pass.",
        symbolism: "The enclosed garden at left recalls Mary's purity (the hortus conclusus of the Song of Songs). The bare cell-like setting mirrors the friars' own life of prayer.",
        impact: "Often called the most serene image of the Annunciation ever painted, and a defining work of early Renaissance devotional art." },
      { kind: "Masterpiece", img: "img/annunciation1.jpg", credit: "Public domain, via Wikimedia Commons", source: "https://commons.wikimedia.org/wiki/File:Leonardo_da_Vinci_-_Annunciazione_-_Google_Art_Project.jpg",
        title: "Annunciation", artist: "Leonardo da Vinci", year: "c. 1472–76", medium: "Oil and tempera on panel",
        location: "Uffizi Gallery, Florence",
        description: "Gabriel kneels on a flowered lawn holding a lily. Mary, at a marble lectern, raises her hand in surprise.",
        significance: "One of Leonardo's earliest surviving works, painted while he was still in Verrocchio's workshop.",
        symbolism: "The lily stands for Mary's purity; the open book recalls Isaiah's prophecy; the walled garden again speaks of her virginity.",
        impact: "Shows the young Leonardo's study of nature and atmosphere: the hazy mountains in the distance anticipate his later landscapes." },
      { kind: "Descriptive", img: "img/annunciation2.jpg", credit: "Public domain, via Wikimedia Commons", source: "https://commons.wikimedia.org/wiki/File:Henry_Ossawa_Tanner,_American_(active_France)_-_The_Annunciation_-_Google_Art_Project.jpg",
        title: "The Annunciation", artist: "Henry Ossawa Tanner", year: "1898", medium: "Oil on canvas",
        location: "Philadelphia Museum of Art",
        description: "A teenage Mary in plain Middle Eastern clothes sits on a rumpled bed, looking up at a column of golden light.",
        significance: "Tanner, an African American painter, travelled to Palestine in 1897 to study its people and homes before painting it.",
        symbolism: "Gabriel appears only as light, not as a winged figure, so the scene feels both ordinary and holy.",
        impact: "Helps us picture the real setting: a humble stone room, a young village girl, a moment of quiet awe." }
    ]
  },
  {
    id: "visitation", lane: "jesus", place: "einkarem", from: "nazareth", date: "c. 6–5 BC",
    title: "The Visitation",
    people: ["Mary", "Elizabeth", "John (unborn)", "Zechariah"],
    gospels: { Lk: "1:39–56" },
    summary: "Mary travels \"with haste\" to the hill country of Judea to visit her kinswoman Elizabeth. At Mary's greeting the unborn John leaps in Elizabeth's womb, and Elizabeth is filled with the Holy Spirit. Mary responds with the Magnificat, and stays about three months.",
    stay: "Mary stayed about three months in the home of Zechariah and Elizabeth.",
    journey: "About 80 to 90 miles, roughly a 4 to 5 day walk, probably via the Jordan Valley.",
    scripture: [
      { ref: "Luke 1:41–42", text: "And when Elizabeth heard the greeting of Mary, the babe leaped in her womb; and Elizabeth was filled with the Holy Spirit and she exclaimed with a loud cry, \"Blessed are you among women, and blessed is the fruit of your womb!\"" },
      { ref: "Luke 1:46–47", text: "And Mary said, \"My soul magnifies the Lord, and my spirit rejoices in God my Savior,\"" }
    ],
    echoes: [{ ref: "2 Samuel 6:9–11", note: "David asks how the Ark can come to him; the Ark stays three months. Luke's account closely mirrors it." }, { ref: "1 Samuel 2:1–10", note: "Hannah's song, which the Magnificat echoes." }],
    art: [
      { kind: "Masterpiece", img: "img/visitation0.jpg", credit: "Public domain, via Wikimedia Commons", source: "https://commons.wikimedia.org/wiki/File:Pontormo-visitation-after-restorationRGB.jpg",
        title: "Visitation", artist: "Jacopo Pontormo", year: "1528–29", medium: "Oil on panel",
        location: "Pieve di San Michele, Carmignano (near Florence)",
        description: "Mary and Elizabeth embrace in tall, swirling robes of acid pink, green and orange, watched by two attendants who stare out at us.",
        significance: "A masterpiece of Florentine Mannerism, and one of the few major works never moved from the small parish church it was made for.",
        symbolism: "The two attendants are often read as mirror images of the two women, their faces turned to the viewer as witnesses.",
        impact: "Its strange, glowing colors influenced modern artists and filmmakers; Bill Viola's video \"The Greeting\" (1995) restages it." },
      { kind: "Masterpiece", img: "img/visitation1.jpg", credit: "Public domain, via Wikimedia Commons", source: "https://commons.wikimedia.org/wiki/File:Mariotto_Albertinelli_-_Visitation_-_WGA0129.jpg",
        title: "Visitation", artist: "Mariotto Albertinelli", year: "1503", medium: "Oil on panel",
        location: "Uffizi Gallery, Florence",
        description: "The two women clasp hands beneath a classical arch against a clear sky.",
        significance: "A calm High Renaissance treatment, with a simple, balanced composition.",
        symbolism: "The arch frames the meeting as a threshold between the old covenant (Elizabeth) and the new (Mary).",
        impact: "A widely reproduced image of the scene in prayer books and on holy cards." }
    ]
  },
  {
    id: "birthjohn", lane: "john", place: "einkarem", date: "c. 6–5 BC",
    title: "The birth of John the Baptist",
    people: ["Elizabeth", "Zechariah", "John"],
    gospels: { Lk: "1:57–80" },
    summary: "Elizabeth gives birth to a son. At his circumcision the relatives want to name him Zechariah, but Elizabeth says he will be called John. Zechariah writes \"His name is John,\" his speech returns, and he prophesies in the Benedictus.",
    stay: "The family home in the hill country of Judea.",
    scripture: [
      { ref: "Luke 1:63–64", text: "And he asked for a writing tablet, and wrote, \"His name is John.\" And they all marveled. And immediately his mouth was opened and his tongue loosed, and he spoke, blessing God." },
      { ref: "Luke 1:76", text: "And you, child, will be called the prophet of the Most High; for you will go before the Lord to prepare his ways," },
      { ref: "Luke 1:80", text: "And the child grew and became strong in spirit, and he was in the wilderness till the day of his manifestation to Israel." }
    ],
    echoes: [{ ref: "Isaiah 40:3", note: "The voice preparing the way of the Lord." }],
    art: [
      { kind: "Masterpiece", img: "img/birthjohn0.jpg", credit: "Public domain, via Wikimedia Commons", source: "https://commons.wikimedia.org/wiki/File:Nacimiento_de_San_Juan_Bautista_(Artemisia_Gentileschi).jpg",
        title: "The Birth of Saint John the Baptist", artist: "Artemisia Gentileschi", year: "c. 1635", medium: "Oil on canvas",
        location: "Museo del Prado, Madrid",
        description: "Women wash the newborn in a warm, everyday room while Zechariah writes the child's name.",
        significance: "Painted for a series on John's life for the Buen Retiro palace in Madrid.",
        symbolism: "The ordinary domestic labor of the women frames a miraculous birth; Zechariah's pen marks the moment his silence ends.",
        impact: "A celebrated work by the most famous woman painter of the Baroque, now widely studied and exhibited." },
      { kind: "Masterpiece", img: "img/birthjohn1.jpg", credit: "Public domain, via Wikimedia Commons", source: "https://commons.wikimedia.org/wiki/File:Cappella_tornabuoni,_12,_Nascita_di_san_giovanni_battista.jpg",
        title: "Birth of Saint John the Baptist", artist: "Domenico Ghirlandaio", year: "1486–90", medium: "Fresco",
        location: "Tornabuoni Chapel, Santa Maria Novella, Florence",
        description: "Elizabeth rests in bed as women nurse the baby; a servant sweeps in with a basket of fruit on her head.",
        significance: "A companion to the Zechariah scene in the same chapel.",
        symbolism: "The fruit-bearing servant, moving like a classical figure, suggests abundance and blessing.",
        impact: "Famous as a window into the domestic life of wealthy Florentine women in the 1480s." }
    ]
  },
  {
    id: "josephdream", lane: "jesus", place: "nazareth", from: "einkarem", date: "c. 5 BC",
    title: "Joseph's dream",
    people: ["Joseph", "Mary", "An angel of the Lord"],
    gospels: { Mt: "1:18–25" },
    summary: "After three months Mary returns to Nazareth. Joseph, a just man, learns she is with child and resolves to divorce her quietly. An angel tells him in a dream to take Mary as his wife, for the child is of the Holy Spirit, and to name him Jesus.",
    stay: "Mary returned to Nazareth. Joseph, a builder (tektōn), lived and worked there.",
    journey: "Mary's return from Ein Karem, about 80 to 90 miles.",
    scripture: [
      { ref: "Matthew 1:20", text: "But as he considered this, behold, an angel of the Lord appeared to him in a dream, saying, \"Joseph, son of David, do not fear to take Mary your wife, for that which is conceived in her is of the Holy Spirit;\"" },
      { ref: "Matthew 1:21", text: "she will bear a son, and you shall call his name Jesus, for he will save his people from their sins." }
    ],
    echoes: [{ ref: "Isaiah 7:14", note: "Matthew 1:23 quotes it: \"his name shall be called Emmanuel\" (God with us)." }],
    art: [
      { kind: "Masterpiece", img: "img/josephdream0.jpg", credit: "Public domain, via Wikimedia Commons", source: "https://commons.wikimedia.org/wiki/File:Georges_de_La_Tour_-_The_Dream_of_St_Joseph_-_WGA12344.jpg",
        title: "The Dream of Saint Joseph", artist: "Georges de La Tour", year: "c. 1640", medium: "Oil on canvas",
        location: "Musée d'arts de Nantes, France",
        description: "An old Joseph dozes over a book by candlelight while a child-like angel touches his arm.",
        significance: "A classic example of La Tour's candlelit night scenes.",
        symbolism: "The candle, half hidden by the angel's arm, suggests divine light coming into a sleeping mind.",
        impact: "La Tour was forgotten for centuries and rediscovered in the 20th century; this is one of his best-known works." }
    ]
  },
  {
    id: "nativity", lane: "jesus", place: "bethlehem", from: "nazareth", date: "c. 6–4 BC",
    title: "The census and the Nativity",
    people: ["Mary", "Joseph", "Jesus", "Caesar Augustus"],
    gospels: { Mt: "1:25; 2:1", Lk: "2:1–7" },
    summary: "A decree of Caesar Augustus calls everyone to be enrolled. Joseph, of the house of David, goes up from Nazareth to Bethlehem with Mary. There she gives birth to her first-born son, wraps him in swaddling cloths and lays him in a manger, because there was no place for them in the inn.",
    stay: "A place where animals were kept, perhaps the lower room of a house or a cave, as early tradition (Justin Martyr, c. AD 150) holds.",
    journey: "About 90 miles, roughly a week on foot with Mary late in pregnancy.",
    scripture: [
      { ref: "Luke 2:1", text: "In those days a decree went out from Caesar Augustus that all the world should be enrolled." },
      { ref: "Luke 2:7", text: "And she gave birth to her first-born son and wrapped him in swaddling cloths, and laid him in a manger, because there was no place for them in the inn." }
    ],
    echoes: [{ ref: "Micah 5:2", note: "\"But you, O Bethlehem Ephrathah... from you shall come forth for me one who is to be ruler in Israel.\"" }],
    art: [
      { kind: "Masterpiece", img: "img/nativity0.jpg", credit: "Public domain, via Wikimedia Commons", source: "https://commons.wikimedia.org/wiki/File:Giotto_di_Bondone_-_No._17_Scenes_from_the_Life_of_Christ_-_1._Nativity_-_Birth_of_Jesus_-_WGA09193.jpg",
        title: "Nativity", artist: "Giotto di Bondone", year: "c. 1305", medium: "Fresco",
        location: "Scrovegni (Arena) Chapel, Padua",
        description: "Mary lays the swaddled child in the manger beneath a wooden shelter, with the ox and ass looking on, angels above and Joseph asleep below.",
        significance: "Part of the fresco cycle that broke from flat Byzantine style and gave figures weight, emotion and real space.",
        symbolism: "The ox and ass come from Isaiah 1:3 (\"the ox knows its owner, and the ass its master's crib\"). Joseph's sleep marks him as a quiet guardian.",
        impact: "The Scrovegni cycle is often called the starting point of Western Renaissance painting." },
      { kind: "Masterpiece", img: "img/nativity1.jpg", credit: "Public domain, via Wikimedia Commons", source: "https://commons.wikimedia.org/wiki/File:Pieter_Bruegel_the_Elder_-_The_Numbering_at_Bethlehem_-_Google_Art_Project.jpg",
        title: "The Census at Bethlehem", artist: "Pieter Bruegel the Elder", year: "1566", medium: "Oil on panel",
        location: "Royal Museums of Fine Arts of Belgium, Brussels",
        description: "A snowy Flemish village at dusk. Crowds line up at an inn to pay taxes, while Mary on a donkey and Joseph pass almost unnoticed.",
        significance: "One of the first paintings to set a Gospel scene in a winter landscape.",
        symbolism: "The Holy Family is lost in a crowd busy with taxes, a quiet comment on how the world overlooks Christ. Bruegel's audience also knew the burden of Spanish rule.",
        impact: "Much copied by his son Pieter Brueghel the Younger; it shaped the snowy Christmas imagery we still use." }
    ]
  },
  {
    id: "shepherds", lane: "jesus", place: "shepherds", from: "bethlehem", date: "c. 6–4 BC",
    title: "The angels and the shepherds",
    people: ["Shepherds", "The angel of the Lord", "The heavenly host"],
    gospels: { Lk: "2:8–20" },
    summary: "Shepherds keeping watch over their flocks by night see the glory of the Lord. An angel announces the birth of a Savior in the city of David, and a multitude of angels praise God. The shepherds hurry to Bethlehem and find the child lying in a manger.",
    stay: "The shepherds came to the manger in Bethlehem.",
    scripture: [
      { ref: "Luke 2:10–11", text: "And the angel said to them, \"Be not afraid; for behold, I bring you good news of a great joy which will come to all the people; for to you is born this day in the city of David a Savior, who is Christ the Lord.\"" },
      { ref: "Luke 2:14", text: "\"Glory to God in the highest, and on earth peace among men with whom he is pleased!\"" }
    ],
    echoes: [{ ref: "1 Samuel 16:11", note: "David himself was a shepherd of Bethlehem." }],
    art: [
      { kind: "Masterpiece", img: "img/shepherds0.jpg", credit: "Public domain, via Wikimedia Commons", source: "https://commons.wikimedia.org/wiki/File:Correggio_-_The_Holy_Night_-_Google_Art_Project.jpg",
        title: "Holy Night (Adoration of the Shepherds)", artist: "Antonio da Correggio", year: "c. 1529–30", medium: "Oil on panel",
        location: "Gemäldegalerie Alte Meister, Dresden",
        description: "All the light in a dark night scene comes from the newborn child, lighting Mary's face and dazzling a shepherdess who shields her eyes.",
        significance: "One of the first great night scenes in Western art.",
        symbolism: "The light from the child illustrates John 1:9, the true light that enlightens every man.",
        impact: "Called \"La Notte\" in Italy, it was among the most famous paintings in Europe for centuries and inspired countless candlelit nativities." },
      { kind: "Masterpiece", img: "img/shepherds1.jpg", credit: "Public domain, via Wikimedia Commons", source: "https://commons.wikimedia.org/wiki/File:Gerard_van_Honthorst_-_Adoration_of_the_Shepherds_(1622).jpg",
        title: "Adoration of the Shepherds", artist: "Gerard van Honthorst", year: "1622", medium: "Oil on canvas",
        location: "Wallraf-Richartz Museum, Cologne",
        description: "Weathered shepherds crowd close around the glowing child, their faces lit from below.",
        significance: "A key work of the Utrecht Caravaggisti, painters who brought Caravaggio's dramatic lighting north.",
        symbolism: "The hidden light source, the child, makes the point that Christ himself is the light.",
        impact: "Honthorst was so famous for night scenes the Italians called him \"Gherardo delle Notti.\"" }
    ]
  },
  {
    id: "presentation", lane: "jesus", place: "temple", from: "bethlehem", date: "c. 6–4 BC",
    title: "The Presentation in the Temple",
    people: ["Mary", "Joseph", "Jesus", "Simeon", "Anna"],
    gospels: { Lk: "2:22–38" },
    summary: "Forty days after the birth, Mary and Joseph bring Jesus to the Temple to present him to the Lord and offer two turtledoves or pigeons, the offering of the poor. The aged Simeon takes the child in his arms and prays the Nunc Dimittis. The prophetess Anna, 84, gives thanks and speaks of him to all awaiting redemption.",
    stay: "A short trip of about 6 miles from Bethlehem.",
    scripture: [
      { ref: "Luke 2:29–30", text: "\"Lord, now let your servant depart in peace, according to your word; for my eyes have seen your salvation\"" },
      { ref: "Luke 2:34–35", text: "\"Behold, this child is set for the fall and rising of many in Israel, and for a sign that is spoken against (and a sword will pierce through your own soul also), that thoughts out of many hearts may be revealed.\"" }
    ],
    echoes: [{ ref: "Leviticus 12:6–8", note: "The purification offering; two birds when a lamb cannot be afforded." }, { ref: "Malachi 3:1", note: "\"The Lord whom you seek will suddenly come to his temple.\"" }],
    art: [
      { kind: "Masterpiece", img: "img/presentation0.jpg", credit: "Public domain, via Wikimedia Commons", source: "https://commons.wikimedia.org/wiki/File:Het_loflied_van_Simeon,_Rembrandt_van_Rijn,_1631,_Mauritshuis,_The_Hague.jpg",
        title: "Simeon in the Temple", artist: "Rembrandt van Rijn", year: "1631", medium: "Oil on panel",
        location: "Mauritshuis, The Hague",
        description: "A beam of light falls on a small group, Simeon holding the child, in the vast dark space of the Temple.",
        significance: "Painted at 25, as Rembrandt moved to Amsterdam; he returned to Simeon throughout his life, and his last unfinished painting shows the same scene.",
        symbolism: "The immense dark architecture against the small lit group shows how God's salvation arrives quietly in a great institution.",
        impact: "A defining early Rembrandt, admired for its use of light to direct the eye." }
    ]
  },
  {
    id: "magi", lane: "jesus", place: "bethlehem", from: "temple", date: "c. 5–4 BC",
    title: "The visit of the Magi",
    people: ["The Magi", "Herod the Great", "Mary", "Jesus"],
    gospels: { Mt: "2:1–12" },
    summary: "Wise men from the East arrive in Jerusalem asking for the newborn king of the Jews. Herod, troubled, learns from the chief priests that the Messiah is to be born in Bethlehem and sends the Magi there. The star leads them to the house, where they worship the child and offer gold, frankincense and myrrh. Warned in a dream, they return home another way.",
    stay: "Matthew says the Magi found the child in \"the house,\" suggesting the family had settled in Bethlehem for a time.",
    scripture: [
      { ref: "Matthew 2:1–2", text: "Now when Jesus was born in Bethlehem of Judea in the days of Herod the king, behold, wise men from the East came to Jerusalem, saying, \"Where is he who has been born king of the Jews? For we have seen his star in the East, and have come to worship him.\"" },
      { ref: "Matthew 2:11", text: "and going into the house they saw the child with Mary his mother, and they fell down and worshiped him. Then, opening their treasures, they offered him gifts, gold and frankincense and myrrh." }
    ],
    echoes: [{ ref: "Numbers 24:17", note: "\"A star shall come forth out of Jacob.\"" }, { ref: "Psalm 72:10–11; Isaiah 60:6", note: "Kings bearing gifts of gold and frankincense." }],
    art: [
      { kind: "Masterpiece", img: "img/magi0.jpg", credit: "Public domain, via Wikimedia Commons", source: "https://commons.wikimedia.org/wiki/File:Gentile_da_Fabriano_-_Adorazione_dei_Magi_-_Google_Art_Project.jpg",
        title: "Adoration of the Magi", artist: "Gentile da Fabriano", year: "1423", medium: "Tempera and gold leaf on panel",
        location: "Uffizi Gallery, Florence",
        description: "A dazzling procession of kings, horses, hunting dogs, monkeys and courtiers winds down from distant hills to the manger.",
        significance: "The supreme example of International Gothic painting, commissioned by Palla Strozzi, the richest man in Florence.",
        symbolism: "The three kings are three ages of man (old, mature, young), showing all humanity coming to Christ. Real gold leaf makes the gifts physically precious.",
        impact: "Its splendor set the standard for Magi scenes that the Medici and others would try to surpass." },
      { kind: "Masterpiece", img: "img/magi1.jpg", credit: "Public domain, via Wikimedia Commons", source: "https://commons.wikimedia.org/wiki/File:Giotto_di_Bondone_-_No._18_Scenes_from_the_Life_of_Christ_-_2._Adoration_of_the_Magi_-_WGA09195.jpg",
        title: "Adoration of the Magi", artist: "Giotto di Bondone", year: "c. 1305", medium: "Fresco",
        location: "Scrovegni (Arena) Chapel, Padua",
        description: "The eldest king kneels to kiss the child's foot, while a blazing star with a fiery tail hangs above the stable.",
        significance: "The star is painted as a comet, likely inspired by Halley's Comet, which Giotto could have seen in 1301.",
        symbolism: "The comet turns the Star of Bethlehem into a real, witnessed sign in the sky.",
        impact: "The European Space Agency named its 1986 probe to Halley's Comet \"Giotto\" in honor of this painting." }
    ]
  },
  {
    id: "flight", lane: "jesus", place: "egypt", from: "bethlehem", date: "c. 5–4 BC",
    title: "The flight into Egypt",
    people: ["Joseph", "Mary", "Jesus", "An angel of the Lord"],
    gospels: { Mt: "2:13–15" },
    summary: "After the Magi leave, an angel warns Joseph in a dream that Herod will search for the child to destroy him. Joseph rises by night and takes the child and his mother to Egypt, where they remain until Herod's death. Egypt had large Jewish communities, especially in Alexandria.",
    stay: "In Egypt until Herod died, probably a period of months to a few years.",
    journey: "At least 250 to 300 miles across the northern Sinai coast road, about 2 to 3 weeks.",
    scripture: [
      { ref: "Matthew 2:13", text: "\"Rise, take the child and his mother, and flee to Egypt, and remain there till I tell you; for Herod is about to search for the child, to destroy him.\"" },
      { ref: "Matthew 2:15", text: "and remained there until the death of Herod. This was to fulfil what the Lord had spoken by the prophet, \"Out of Egypt have I called my son.\"" }
    ],
    echoes: [{ ref: "Hosea 11:1", note: "\"Out of Egypt I called my son\": Jesus relives Israel's story." }, { ref: "Genesis 37–50", note: "Another Joseph, a dreamer, who went down into Egypt." }],
    art: [
      { kind: "Masterpiece", img: "img/flight0.jpg", credit: "Public domain, via Wikimedia Commons", source: "https://commons.wikimedia.org/wiki/File:Rest_on_the_Flight_into_Egypt-Caravaggio_(c.1597).jpg",
        title: "Rest on the Flight into Egypt", artist: "Caravaggio", year: "c. 1597", medium: "Oil on canvas",
        location: "Galleria Doria Pamphilj, Rome",
        description: "Mary and the child sleep while Joseph holds a music score for an angel playing the violin.",
        significance: "One of Caravaggio's earliest religious paintings, gentle and lyrical, unlike his later dramatic style.",
        symbolism: "The score is a real motet on the Song of Songs; the dry, rocky side (Joseph) contrasts with the green, living side (Mary and child).",
        impact: "A favorite of Caravaggio scholars for its tenderness and its unique musical detail." },
      { kind: "Descriptive", img: "img/flight1.jpg", credit: "Public domain, via Wikimedia Commons", source: "https://commons.wikimedia.org/wiki/File:Henry_Ossawa_Tanner_-_Flight_into_Egypt_(1923).jpg",
        title: "Flight into Egypt", artist: "Henry Ossawa Tanner", year: "1923", medium: "Oil on canvas",
        location: "The Metropolitan Museum of Art, New York",
        description: "A small family hurries through a moonlit town at night, a lamp in hand.",
        significance: "Tanner painted this subject many times; he saw in it the story of refugees and of his own family's history.",
        symbolism: "The deep blue night and single light stress danger, secrecy and haste.",
        impact: "Helps us imagine what Matthew implies: a sudden escape by night." }
    ]
  },
  {
    id: "innocents", lane: "herod", place: "bethlehem", date: "c. 5–4 BC",
    title: "The Massacre of the Innocents",
    people: ["Herod the Great", "The children of Bethlehem"],
    gospels: { Mt: "2:16–18" },
    summary: "Realizing the Magi have tricked him, Herod orders the killing of all boys two years old and under in Bethlehem and its region. Bethlehem was a small town, so historians estimate perhaps a few dozen children. The act fits what Josephus records of Herod's late years, when he executed three of his own sons.",
    stay: "Herod ruled from his palace in Jerusalem.",
    scripture: [
      { ref: "Matthew 2:16", text: "Then Herod, when he saw that he had been tricked by the wise men, was in a furious rage, and he sent and killed all the male children in Bethlehem and in all that region who were two years old or under, according to the time which he had ascertained from the wise men." },
      { ref: "Matthew 2:18", text: "\"A voice was heard in Ramah, wailing and loud lamentation, Rachel weeping for her children; she refused to be consoled, because they were no more.\"" }
    ],
    echoes: [{ ref: "Jeremiah 31:15", note: "Rachel weeping for her children." }, { ref: "Exodus 1:22", note: "Pharaoh's order to kill Hebrew boys, from which Moses was saved." }],
    art: [
      { kind: "Masterpiece", img: "img/innocents0.jpg", credit: "Public domain, via Wikimedia Commons", source: "https://commons.wikimedia.org/wiki/File:Rubens,_Peter_Paul_-_Massacre_of_the_Innocents_-_Art_Gallery_of_Ontario.jpg",
        title: "Massacre of the Innocents", artist: "Peter Paul Rubens", year: "c. 1610–12", medium: "Oil on panel",
        location: "Art Gallery of Ontario, Toronto",
        description: "A whirl of soldiers and desperate mothers fill the canvas with violent motion.",
        significance: "Painted just after Rubens returned from Italy, absorbing Michelangelo and classical sculpture.",
        symbolism: "The poses borrow from ancient sculpture; the composition expresses chaos as a spiral with no place of rest.",
        impact: "Rediscovered in 2001, it sold at Sotheby's in 2002 for about £49.5 million, then a record for an Old Master painting, and was later given to the Art Gallery of Ontario." }
    ]
  },
  {
    id: "herodsdeath", lane: "herod", place: "jericho", date: "4 BC", year: -4.5,
    title: "Herod the Great dies",
    people: ["Herod the Great", "Archelaus", "Herod Antipas", "Philip"],
    gospels: { Mt: "2:19" },
    summary: "Herod dies at his winter palace in Jericho after a painful illness, around 4 BC by most reckonings. He is buried at Herodium. Rome divides his kingdom among three sons: Archelaus gets Judea and Samaria, Herod Antipas gets Galilee and Perea, and Philip gets the lands northeast of the Sea of Galilee.",
    stay: "Jericho winter palace; buried at Herodium.",
    scripture: [
      { ref: "Matthew 2:19", text: "But when Herod died, behold, an angel of the Lord appeared in a dream to Joseph in Egypt," }
    ],
    history: "Josephus (Antiquities 17) describes Herod's last illness, his death at Jericho, and the funeral procession to Herodium. Because of the date of Herod's death, Jesus' birth is usually placed between about 6 and 4 BC.",
    art: [
      { kind: "Artifact", img: "img/herodsdeath0.jpg", credit: "Photo: Yair Haklai, CC BY-SA 4.0, via Wikimedia Commons", source: "https://commons.wikimedia.org/wiki/File:Sarcophagus,_possibly_of_Herod,_from_Herodium._On_display_at_the_Israel_Museum_in_Jerusalem.jpg",
        title: "Herod's tomb and sarcophagus", artist: "Excavated by Ehud Netzer", year: "Found 2007", medium: "Red limestone sarcophagus",
        location: "Israel Museum, Jerusalem (pieces exhibited 2013)",
        description: "The smashed remains of an ornate sarcophagus found on the slope of Herodium, believed to be Herod's.",
        significance: "Confirmed Josephus's account that Herod was buried at Herodium.",
        symbolism: "Deliberately smashed in antiquity, likely by rebels who hated Herod.",
        impact: "One of the major Israeli archaeological finds of the 21st century." }
    ]
  },
  {
    id: "return", lane: "jesus", place: "nazareth", from: "egypt", date: "c. 4–3 BC",
    title: "Return to Nazareth",
    people: ["Joseph", "Mary", "Jesus"],
    gospels: { Mt: "2:19–23", Lk: "2:39–40" },
    summary: "An angel tells Joseph that those who sought the child's life are dead. Hearing that Archelaus rules Judea in his father's place, Joseph is afraid to go there. Warned in a dream, he withdraws to Galilee and settles in Nazareth.",
    stay: "Nazareth became the family home for the next three decades.",
    journey: "About 300 miles back along the coast road, then inland.",
    scripture: [
      { ref: "Matthew 2:22–23", text: "But when he heard that Archelaus reigned over Judea in place of his father Herod, he was afraid to go there, and being warned in a dream he withdrew to the district of Galilee. And he went and dwelt in a city called Nazareth, that what was spoken by the prophets might be fulfilled, \"He shall be called a Nazarene.\"" },
      { ref: "Luke 2:40", text: "And the child grew and became strong, filled with wisdom; and the favor of God was upon him." }
    ],
    echoes: [{ ref: "Isaiah 11:1", note: "A shoot (Hebrew netzer) from the stump of Jesse; often linked to \"Nazarene.\"" }],
    art: [
      { kind: "Masterpiece", img: "img/return0.jpg", credit: "Public domain, via Wikimedia Commons", source: "https://commons.wikimedia.org/wiki/File:Rubens_-_The_Return_of_the_Holy_Family_from_Egypt,_c._1630,_Wadsworth.jpg",
        title: "The Return of the Holy Family from Egypt", artist: "Peter Paul Rubens", year: "c. 1620s", medium: "Oil on canvas",
        location: "Wadsworth Atheneum Museum of Art, Hartford",
        description: "The boy Jesus walks between Mary and Joseph, holding their hands, as they head home.",
        significance: "Shows the Holy Family as a walking family rather than a mother and infant on a donkey.",
        symbolism: "The child between his earthly parents is often read as an earthly trinity mirroring the heavenly one.",
        impact: "A popular image for devotions to the Holy Family." }
    ]
  },
  {
    id: "province", lane: "rome", place: "caesarea", date: "AD 6",
    title: "Judea becomes a Roman province",
    people: ["Archelaus", "Quirinius", "Coponius", "Judas the Galilean"],
    gospels: {},
    summary: "Augustus deposes Archelaus for brutal misrule and exiles him to Gaul. Judea, Samaria and Idumea come under direct Roman rule by a prefect based at Caesarea. Quirinius, legate of Syria, holds a census for taxation, which sparks a revolt led by Judas the Galilean. Galilee stays under Herod Antipas.",
    stay: "The prefect lived at Caesarea and came up to Jerusalem for the feasts.",
    scripture: [
      { ref: "Acts 5:37", text: "After him Judas the Galilean arose in the days of the census and drew away some of the people after him; he also perished, and all who followed him were scattered." }
    ],
    history: "Josephus (Antiquities 18) records the census of Quirinius in AD 6. How it relates to Luke 2:2 is a long-debated question in New Testament chronology.",
    art: []
  },
  {
    id: "temple12", lane: "jesus", place: "temple", from: "nazareth", date: "c. AD 8",
    title: "The boy Jesus in the Temple",
    people: ["Jesus (age 12)", "Mary", "Joseph", "The teachers"],
    gospels: { Lk: "2:41–52" },
    summary: "Every year the family goes up to Jerusalem for Passover. When Jesus is twelve he stays behind. After three days Mary and Joseph find him in the Temple, sitting among the teachers, listening and asking questions. He goes home with them and is obedient to them. The Gospels then fall silent for about eighteen years, the \"hidden years\" in Nazareth.",
    stay: "Pilgrims camped in and around Jerusalem for the week of the feast.",
    journey: "About 80 to 90 miles each way in a large pilgrim caravan.",
    scripture: [
      { ref: "Luke 2:46", text: "After three days they found him in the temple, sitting among the teachers, listening to them and asking them questions;" },
      { ref: "Luke 2:49", text: "And he said to them, \"How is it that you sought me? Did you not know that I must be in my Father's house?\"" },
      { ref: "Luke 2:52", text: "And Jesus increased in wisdom and in stature, and in favor with God and man." }
    ],
    echoes: [{ ref: "1 Samuel 2:26", note: "The boy Samuel \"grew both in stature and in favor with the Lord and with men.\"" }],
    art: [
      { kind: "Masterpiece", img: "img/temple120.jpg", credit: "Public domain, via Wikimedia Commons", source: "https://commons.wikimedia.org/wiki/File:William_Holman_Hunt_-_The_Finding_of_the_Saviour_in_the_Temple_-_Google_Art_Project.jpg",
        title: "The Finding of the Saviour in the Temple", artist: "William Holman Hunt", year: "1854–60", medium: "Oil on canvas",
        location: "Birmingham Museum and Art Gallery, England",
        description: "Mary embraces the boy Jesus as robed rabbis look on in a richly patterned Temple interior.",
        significance: "Hunt worked on it for years in Jerusalem, using local Jewish models and studying dress and ritual objects.",
        symbolism: "Details such as a blind beggar at the door and builders outside allude to Christ's future mission and the \"stone the builders rejected.\"",
        impact: "A sensation when shown in London in 1860; it sold for a then-huge sum and made Hunt's reputation." },
      { kind: "Masterpiece", img: "img/temple121.jpg", credit: "Public domain, via Wikimedia Commons", source: "https://commons.wikimedia.org/wiki/File:Albrecht_D%C3%BCrer_-_Jesus_among_the_Doctors_-_Google_Art_Project.jpg",
        title: "Christ among the Doctors", artist: "Albrecht Dürer", year: "1506", medium: "Oil on panel",
        location: "Thyssen-Bornemisza Museum, Madrid",
        description: "A young Christ, surrounded by crowding, grotesque faces of scholars, counts off arguments on his fingers.",
        significance: "Dürer inscribed that he painted it in five days during his stay in Venice.",
        symbolism: "The tangle of four hands at the center shows youthful clarity against the confusion of worldly learning.",
        impact: "A striking experiment in composition, influenced by Leonardo's studies of grotesque heads." }
    ]
  },
  {
    id: "tiberias", lane: "herod", place: "tiberias", date: "c. AD 18–20",
    title: "Antipas builds Tiberias",
    people: ["Herod Antipas", "Herodias (later)"],
    gospels: { Jn: "6:23" },
    summary: "Herod Antipas, tetrarch of Galilee and Perea, founds a new capital on the western shore of the Sea of Galilee and names it for the emperor Tiberius. It is built partly over a cemetery, so observant Jews long avoid it. Antipas will later imprison and execute John the Baptist, and Jesus will call him \"that fox\" (Luke 13:32).",
    stay: "Antipas also ruled from Sepphoris, 4 miles from Nazareth, which he rebuilt during Jesus' youth.",
    scripture: [
      { ref: "John 6:23", text: "However, boats from Tiberias came near the place where they ate the bread after the Lord had given thanks." }
    ],
    history: "Josephus (Antiquities 18.2.3) describes the founding and the burial ground beneath it. The Sea of Galilee is called the \"Sea of Tiberias\" in John 6:1 and 21:1.",
    art: []
  },
  {
    id: "pilate", lane: "rome", place: "caesarea", date: "AD 26",
    title: "Pontius Pilate arrives as prefect",
    people: ["Pontius Pilate", "Tiberius Caesar", "Caiaphas"],
    gospels: { Lk: "3:1" },
    summary: "Tiberius appoints Pontius Pilate prefect of Judea, a post he holds until AD 36. Josephus and Philo record clashes early in his rule, such as bringing military standards bearing the emperor's image into Jerusalem. Caiaphas is high priest throughout his term.",
    stay: "Pilate's residence was at Caesarea; in Jerusalem he used Herod's former palace.",
    scripture: [
      { ref: "Luke 3:1", text: "In the fifteenth year of the reign of Tiberius Caesar, Pontius Pilate being governor of Judea, and Herod being tetrarch of Galilee, and his brother Philip tetrarch of the region of Ituraea and Trachonitis, and Lysanias tetrarch of Abilene," }
    ],
    history: "Josephus, Jewish War 2.9 and Antiquities 18.3; Philo, Embassy to Gaius 38. Tacitus (Annals 15.44) names Christ's execution under Pilate.",
    art: [
      { kind: "Artifact", img: "img/pilate0.jpg", credit: "Photo: BRBurton, CC0, via Wikimedia Commons", source: "https://commons.wikimedia.org/wiki/File:Pontius_Pilate_Inscription.JPG",
        title: "The Pilate Stone", artist: "Unknown Roman stonecutter", year: "c. AD 26–36", medium: "Limestone inscription",
        location: "Israel Museum, Jerusalem (a replica stands at Caesarea)",
        description: "A block found in the theater at Caesarea in 1961, carved with Pilate's name and his title, prefect of Judea.",
        significance: "The only known inscription from his lifetime naming Pontius Pilate.",
        symbolism: "It records a building Pilate dedicated to Tiberius, the emperor named in Luke 3:1.",
        impact: "Settled Pilate's exact title and confirmed him as a historical figure outside the Gospels." }
    ]
  },
  {
    id: "johnpreaches", lane: "john", place: "wilderness", date: "c. AD 28–29",
    title: "John preaches in the wilderness",
    people: ["John the Baptist", "Crowds", "Pharisees and Sadducees", "Tax collectors and soldiers"],
    gospels: { Mt: "3:1–12", Mk: "1:1–8", Lk: "3:1–20", Jn: "1:19–28" },
    summary: "In the fifteenth year of Tiberius, the word of God comes to John in the wilderness. Clothed in camel's hair, eating locusts and wild honey, he preaches a baptism of repentance in the Jordan. Crowds come from Jerusalem and all Judea. He tells soldiers and tax collectors how to live justly and announces one mightier who is coming.",
    stay: "John lived in the wilderness and baptized along the Jordan.",
    scripture: [
      { ref: "Matthew 3:1–2", text: "In those days came John the Baptist, preaching in the wilderness of Judea, \"Repent, for the kingdom of heaven is at hand.\"" },
      { ref: "Mark 1:6", text: "Now John was clothed with camel's hair, and had a leather girdle around his waist, and ate locusts and wild honey." },
      { ref: "John 1:23", text: "He said, \"I am the voice of one crying in the wilderness, 'Make straight the way of the Lord,' as the prophet Isaiah said.\"" }
    ],
    echoes: [{ ref: "Isaiah 40:3", note: "\"A voice cries: In the wilderness prepare the way of the Lord.\"" }, { ref: "2 Kings 1:8", note: "Elijah \"wore a garment of haircloth, with a girdle of leather about his loins.\"" }],
    art: [
      { kind: "Masterpiece", img: "img/johnpreaches0.jpg", credit: "Public domain, via Wikimedia Commons", source: "https://commons.wikimedia.org/wiki/File:Pieter_Bruegel_the_Elder_-_The_Sermon_of_Saint_John_the_Baptist_-_Google_Art_Project.jpg",
        title: "The Sermon of Saint John the Baptist", artist: "Pieter Bruegel the Elder", year: "1566", medium: "Oil on panel",
        location: "Museum of Fine Arts, Budapest",
        description: "A huge crowd of Flemish peasants, gypsies and gentry gather in a forest clearing to hear a small, distant John.",
        significance: "Painted in 1566, when Protestant open-air \"hedge sermons\" were drawing crowds in the Netherlands.",
        symbolism: "John is hard to find; Bruegel makes us search the crowd as the listeners search their hearts. Christ stands quietly among them.",
        impact: "Admired as one of Bruegel's richest crowd scenes and as a document of religious upheaval." }
    ]
  },
  {
    id: "baptism", lane: "jesus", place: "bethabara", from: "nazareth", date: "c. AD 28–29",
    title: "The Baptism of Jesus",
    people: ["Jesus (about 30)", "John the Baptist", "The Holy Spirit", "The Father's voice"],
    gospels: { Mt: "3:13–17", Mk: "1:9–11", Lk: "3:21–22", Jn: "1:29–34" },
    summary: "Jesus comes from Nazareth to the Jordan to be baptized by John. John protests that he needs to be baptized by Jesus. As Jesus comes up from the water, the heavens open, the Spirit descends like a dove, and a voice declares him the beloved Son. Luke notes that Jesus was about thirty. Next he goes into the wilderness for forty days.",
    stay: "Bethany beyond the Jordan, where John was baptizing.",
    journey: "About 70 miles down the Jordan Valley from Nazareth.",
    scripture: [
      { ref: "Matthew 3:14", text: "John would have prevented him, saying, \"I need to be baptized by you, and do you come to me?\"" },
      { ref: "Matthew 3:16–17", text: "And when Jesus was baptized, he went up immediately from the water, and behold, the heavens were opened and he saw the Spirit of God descending like a dove, and alighting on him; and lo, a voice from heaven, saying, \"This is my beloved Son, with whom I am well pleased.\"" },
      { ref: "Mark 1:11", text: "and a voice came from heaven, \"You are my beloved Son; with you I am well pleased.\"" },
      { ref: "John 1:29", text: "The next day he saw Jesus coming toward him, and said, \"Behold, the Lamb of God, who takes away the sin of the world!\"" }
    ],
    echoes: [{ ref: "Psalm 2:7; Isaiah 42:1", note: "The Son and the chosen servant in whom God delights." }, { ref: "Joshua 3", note: "Israel crosses the Jordan near Jericho to enter the promised land." }],
    art: [
      { kind: "Masterpiece", img: "img/baptism0.jpg", credit: "Public domain, via Wikimedia Commons", source: "https://commons.wikimedia.org/wiki/File:Piero_della_Francesca_-_Baptism_of_Christ_-_WGA17595.jpg",
        title: "The Baptism of Christ", artist: "Piero della Francesca", year: "c. 1450s", medium: "Tempera on panel",
        location: "The National Gallery, London",
        description: "A still, pale Christ stands in a clear stream as John pours water; the dove hovers above, level with the clouds.",
        significance: "A landmark of Renaissance geometry and calm, originally an altarpiece for Piero's home town, Sansepolcro.",
        symbolism: "Three angels at left echo the Trinity; the walnut tree stands for the Cross. The Tuscan landscape places the Jordan in Piero's own country.",
        impact: "One of the most loved paintings in the National Gallery, central to modern appreciation of Piero." },
      { kind: "Masterpiece", img: "img/baptism1.jpg", credit: "Public domain, via Wikimedia Commons", source: "https://commons.wikimedia.org/wiki/File:Andrea_del_Verrocchio,_Leonardo_da_Vinci_-_Baptism_of_Christ_-_Uffizi.jpg",
        title: "The Baptism of Christ", artist: "Andrea del Verrocchio and Leonardo da Vinci", year: "c. 1472–75", medium: "Oil and tempera on panel",
        location: "Uffizi Gallery, Florence",
        description: "John pours water over Christ's head; two angels kneel at left holding his robes.",
        significance: "The young Leonardo painted the angel in profile at far left, and likely parts of the landscape.",
        symbolism: "The hands of God and the dove above, and John's cross-staff, make the Trinity and the Cross present at once.",
        impact: "Vasari tells that Verrocchio, seeing his pupil's angel surpass his own figures, resolved never to paint again. The story, true or not, marks the arrival of Leonardo." }
    ]
  }
];
