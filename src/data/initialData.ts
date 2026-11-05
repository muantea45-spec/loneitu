import type { Article, Category, Tag, Author, AboutPageData, FooterData, CompanyBannerData } from '../types/blog';

export const DEFAULT_COMPANY_BANNER: CompanyBannerData = {
  enabled: true,
  heading: 'ABOUT US',
  companyName: 'Mizo Farm Solutions',
  badge: 'Champhai-based Registered Society',
  showCompanyName: true,
  picture: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=1200&q=80',
  paragraphs: [
    'Mizo Farm Solutions is a Champhai-based registered society headed by Project Director Dr. C. Lalhriatpuia.',
    'Backed by four years of operations and award-winning post-harvest innovations, the organization partners with Cod Nerc and the Impulse NGO Network to drive rural development, youth upliftment, and women\'s empowerment.',
    'Its key initiatives include AI/IoT precision farming, mechanization, greenhouse cultivation, organic inputs, cold storage, and direct market access. Additionally, the society fosters off-farm resilience through handloom clusters, agro-processing, IT literacy, and livestock farming.',
    'Supported by experienced personnel in agricultural extension, civil engineering, and financial administration, the agency operates out of a fully equipped, connected office in Jail Veng, Champhai.'
  ]
};

export const INITIAL_AUTHORS: Author[] = [
  {
    id: 'auth-1',
    name: 'Dr. Lalhmingmawii Vance',
    role: 'Principal Soil Microbiologist',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    bio: 'Leilung nung (rhizosphere biome), thing phur zungzawng (fungal-bacterial ratios), leh leitha vawn ngheh dan zirchiangtu.',
    institution: 'Institute for Regenerative Agriculture'
  },
  {
    id: 'auth-2',
    name: 'Marcus Thorne',
    role: 'AgTech & IoT Systems Engineer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    bio: 'Lo neihna atana khawl changkang, LoRaWAN wireless sensor, leh drone hmanga thlai hriselna enfiah dan thiam bik.',
    institution: 'Precision Agronomics Lab'
  },
  {
    id: 'auth-3',
    name: 'Priya Nair',
    role: 'Agroforestry & Silvopasture Specialist',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
    bio: 'Thing lian hlimhnuaia ran vulh, thlai leh theihuan chin kawp (multi-strata agroforestry) zirchiangtu.',
    institution: 'Global Silvopasture Collective'
  },
  {
    id: 'auth-4',
    name: 'David Lalthanpuia',
    role: 'Horticulturist & Polyhouse Farmer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    bio: 'Polyhouse chhung thlai chin, thei chi ṭha thlan, leh rannung laka thlai venhimna damdawi tel lova kalpui thiam.',
    institution: 'Mizoram Horticultural Guild'
  }
];

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-agronomy',
    name: 'Leilung leh Thlai Enkawl',
    slug: 'leilung-leh-thlai-enkawl',
    description: 'Leilung ṭhatna vawn him, lei let kher lova thlai chin (no-till), hnah ro leh hnim hring leitha atana hman dan.',
    color: '#2D6A4F',
    icon: 'Sprout'
  },
  {
    id: 'cat-agtech',
    name: 'Loneih Khawl Thiamna',
    slug: 'loneih-khawl-thiamna',
    description: 'Tui far pekna khawl changkang, sensor hmanga leilung enpuina, leh drone hmanga lo leh huan enkawl dan.',
    color: '#1B4965',
    icon: 'Cpu'
  },
  {
    id: 'cat-horticulture',
    name: 'Thei leh Thlai Huan',
    slug: 'thei-leh-thlai-huan',
    description: 'Hmun zimtea thei tam tak chin (high-density), polyhouse enkawl dan, thei hlawk zawk thlan leh par vulh dan.',
    color: '#D97706',
    icon: 'Flower2'
  },
  {
    id: 'cat-livestock',
    name: 'Ran Vulh leh Thing Phun Kawp',
    slug: 'ran-vulh-leh-thing-phun-kawp',
    description: 'Thing lian hlimhnuaia bawng, beram leh vawk vulh kawp, ran chaw hnim ṭha enkawl leh sik leh sa venhim dan.',
    color: '#7F4F24',
    icon: 'ShieldCheck'
  },
  {
    id: 'cat-organic',
    name: 'Damdawi Tel Lova Enkawl',
    slug: 'damdawi-tel-lova-enkawl',
    description: 'Thlai tana ṭha rul leitha (vermicompost), leilung tihṭhatna Biochar, leh rannung ṭha hmanga rannung suat dan.',
    color: '#386641',
    icon: 'Leaf'
  },
  {
    id: 'cat-rural-policy',
    name: 'Khawtlang Loneih Hmasawnna',
    slug: 'khawtlang-loneih-hmasawnna',
    description: 'Ni zung chakna (solar cold storage) hmanga thlai vawn vawhna, loneitu inzawmkhawm, leh khawtlang hmasawnna.',
    color: '#4A5568',
    icon: 'Landmark'
  }
];

export const INITIAL_TAGS: Tag[] = [
  { id: 'tag-soilhealth', name: 'LeiTha', slug: 'leitha', description: 'Leilung hriselna, organic carbon, leh leilung nungchate' },
  { id: 'tag-dripirrigation', name: 'TuiFarPek', slug: 'tuifarpek', description: 'Thlai zunga tui far khat te tea peka tui renchem dan' },
  { id: 'tag-agtech', name: 'AgTech', slug: 'agtech', description: 'Loneih khawl thar, sensor leh digital technology hman dan' },
  { id: 'tag-silvopasture', name: 'Silvopasture', slug: 'silvopasture', description: 'Thing phun, ran chaw hnim leh ran vulh kawp dan' },
  { id: 'tag-notill', name: 'LeiLehLoh', slug: 'leilehloh', description: 'Leilung let kher lova thlai chin dan (No-till farming)' },
  { id: 'tag-biochar', name: 'Biochar', slug: 'biochar', description: 'Thlai ro hal rala meihawl ṭhaa chantira leitha atana hman' },
  { id: 'tag-covercrops', name: 'HnimVawn', slug: 'hnimvawn', description: 'Leilung vawn nan leh leitha atana hnim phah thlan' },
  { id: 'tag-microclimate', name: 'SikLehSa', slug: 'siklehsa', description: 'Thingzar hnuai boruak vawngtu leh lum lutuk venna' },
  { id: 'tag-waterconservation', name: 'TuiVawnHim', slug: 'tuivawnhim', description: 'Tui khawlkhawm, tui renchem, leh huan tui pek dan' },
  { id: 'tag-biocontrol', name: 'RannungVen', slug: 'rannungven', description: 'Damdawi tur tel lova rannung ṭha hmanga hrik ven dan' }
];

export const INITIAL_ARTICLES: Article[] = [
  {
    id: 'art-1',
    title: 'Lei Hnuaia Hrui Inzawm: Sik leh Sa Inthlak Karah Lei Ṭha Siamthar Dan',
    slug: 'lei-hnuaia-hrui-inzawm-sik-leh-sa-leitha-siamthar',
    coverImage: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1600&q=80',
    category: 'Leilung leh Thlai Enkawl',
    tags: ['LeiTha', 'LeiLehLoh', 'Biochar', 'HnimVawn'],
    author: INITIAL_AUTHORS[0],
    publishedAt: '2026-10-28T09:00:00Z',
    readingTimeMinutes: 7,
    status: 'published',
    isFeatured: true,
    views: 3420,
    likes: 184,
    comments: [
      {
        id: 'comm-1',
        authorName: 'Lalmuanpuia Ralte',
        authorRole: 'Serchhip District Loneitu',
        content: 'Lei let lova crimson clover phah kan hman atang khan July thla ro lai pawhin kan leilung hian tui a chelh rei em em a, thlai an thi ve mai mai tawh lo.',
        createdAt: '2026-10-29T14:22:00Z'
      },
      {
        id: 'comm-2',
        authorName: 'Dr. C. Lalremruata',
        authorRole: 'Thlai Zung Chanchin Zirchiangtu',
        content: 'AMF leh thlai zung thawhhona hi a pawimawh hle mai. Chemical phosphorus fertilizer tam lutuk hian he fungi hi a tihchingpen theih dan zirtirna a awm em?',
        createdAt: '2026-10-30T08:15:00Z'
      }
    ],
    content: `## Kan Ke Hnuai Leilung Nung Chanchin

Kum sawm ruk liamta chhung khan leilung hi bungrua leh thing remkhawm ang maiah ngaiin chemical fertilizer chi hrang hrang leh damdawi hman khawlohnain kan tichhe hle a. Leilung kan let chiam hian leilung nungcha pawimawh em em **Arbuscular Mycorrhizal Fungi (AMF)** zung tam tak kan ti chat bawk thin.

He fungi hrui inzawmna tello chuan leilungin tui a chelh theihna (sponge ang leilung) a bo va, ruah a surin lei ṭha a luang ral a, khaw ro deuh hlekin lei a khi phutin thlai an thi thuai thin a ni.

> *"Leilung hrisel ṭha kut khat chhung lek pawh hian khawvel mihring zawng zawng awm tawh zat aia tam leilung nungcha te tak te an cheng a ni. Thlai chauh kan enkawl lo, leilung rilpui kan chawm a ni."*
> — **Dr. Lalhmingmawii Vance**, Institute for Regenerative Agriculture

---

### Mycorrhizae leh Thlai Zung Thawhhona

Thlai zung hian AMF fungi nen thawhhona ropui tak an nei a:

1. **Thlai Thlum Pek:** Thlaiin ni zung atanga chaw (carbon sugar) a siam za zela 10 atanga 30 chu thlai zung kaltlangin he fungi hian a hmu thin.
2. **Lei Chaw & Tui Laklet:** Fungi zung (hyphae) te tak te hian thlai zung thlen phak loh leilung thuk tak atangin phosphorus, zinc, copper leh tui chu thlai tan a la chhuak thung.
3. **Glomalin Siamna:** He fungi hian *Glomalin* an tih leilung char tak tak leh tui tichemin bel khawmtu a siam chhuak a, lei tuihawk lakah a vawng him bawk.

| Leilung Tehna | Chemical & Lei Let Nasat | Leilung Nung & Fungi Enkawl | Hmasawnna Hmuhchhuah |
| :--- | :--- | :--- | :--- |
| **Tui Hip Luh Chak Lam** | Darkarah inch 0.8 | Darkarah inch 6.4 | **Za zela 700-in a chak zawk** |
| **Fungi Hriselna Zat** | 22 µg/g leilung | 385 µg/g leilung | **A let 17.5-in a tam zawk** |
| **Glomalin Khawlkhawm** | 1.1 mg/g | 6.8 mg/g | **Lei chim lakah a him** |
| **Phosphorus Thlaiin a Hman** | Chemical DAP a ngai | Fungi-in amahin a phel darh | **Senso za zela 40-60 a tlem** |

---

### Leilung Fungi Tiharh Chhuak Tura Hmalak Dan

Leilung siamṭha tur hian sum tam tak sen a ngai lo; a hnah phah leh a zung enkawl a tawk em em a ni:

\`\`\`
LEI TIHṬHATNA KAWNGPUI PALI:
[Pillar 1: Lei Let Chiamloh]       -> Lei chhuat vawng hle hle rawh
[Pillar 2: Thlai Hring Phah Reng]  -> Thlai lak hmain hnah phah thlai theh rawh
[Pillar 3: Chemical Tihhniam]      -> Chemical fertilizer za zela 25-in tlem telh telh rawh
[Pillar 4: Lei Lum Lutuk Venna]     -> Lei chunglang hnim rovin khuh reng rawh
\`\`\`

#### 1. Hnah Phah Thlai (Cover Crops)
Thlai lak zawhin lei ruak ringawtin dah suh. Thlai chi hrang hrang pawlh la:
- **Be Chi (Legumes):** Boruak atangin leitha (nitrogen) leilungah an hip lut.
- **Zung Thuk Nei Chi (Radish / Chicory):** Leilung sak lutuk kawr thuk tak an verh tlang.
- **Hnim Hrui Nei Chi (Cereal Rye):** Fungi zung inzarpharna tur zau tak an pe.

#### 2. Biochar Hmanga Zung Venhim
Thlai ṭha phun dawnin meihawl leitha atana siam **Biochar** leiah pawlh rawh. Biochar hian tuibur te tak te ang maiin fungi te tan tui a chelh a, nungcha sual lakah a humhim bawk a ni.

---

### Loneitute Sum Hmuh Dan Hmasawnna
He leilung nung enkawl dan hian:
- Tractor leh leilung thawh hahna senso nasa takin a tihniam.
- Khaw ro lai kar thum (ni 21) chhung pawhin thlai an vuai lova, hring dupin an awm thei.
- Thlai thar hriselna leh a thlum dan (protein content) a sang zawk bawk.`
  },
  {
    id: 'art-2',
    title: 'Tui Far Fawn Hman Dan Fing: Sensor leh LoRaWAN Hmanga Tui Sen Ral Za zela 44 Tihtlem Dan',
    slug: 'tui-far-fawn-hman-dan-fing-lorawan-sensor-water-conservation',
    coverImage: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=1600&q=80',
    category: 'Loneih Khawl Thiamna',
    tags: ['TuiFarPek', 'AgTech', 'TuiVawnHim', 'SikLehSa'],
    author: INITIAL_AUTHORS[1],
    publishedAt: '2026-10-24T14:30:00Z',
    readingTimeMinutes: 6,
    status: 'published',
    isFeatured: false,
    views: 2890,
    likes: 142,
    comments: [
      {
        id: 'comm-3',
        authorName: 'Lalramchhana',
        authorRole: 'Horticulture Farmer, Champhai',
        content: 'Thlai zung bulah sensor kan dah a, thlai hian kan rin aia tlem tui a mamawh tih kan hria. Thei thlum dan leh hriselna a sang sawt hle.',
        createdAt: '2026-10-25T11:00:00Z'
      }
    ],
    content: `## Sana Rinchhana Tui Pek A Tawk Tawh Lo

Kan huanah tui pek nan sana (timer) ngawt kan hmang thin a, ruah sur lai pawhin tui a kal a, a nih loh leh lei chhungril ro laiin a chunglang chauh a huh thin. Thlai hnah a vuai hnu chauhva tui kan pek hian thlai rah leh puitlin theihna a chhiat phah hman tawh thin a ni.

Tui a tlem tial tial lai hian leilung ro dan teh thiam sensor hmanga **thlai mamawh tawk chiah tui pek (precision irrigation)** a hun ta hle.

---

### LoRaWAN Wireless Telemetry Hman Dan

Huan kil khatah phone network a awm loh pawhin, **LoRaWAN (Long Range Wireless)** radio band hmangin kilometer 12 bial chhung sensor-te hian tui pekna khawl an be tlang thei a ni.

\`\`\`
TUI PEK KHAWL INZAWN DAN:
[Huan Sensor Node] --(LoRa Radio)--> [Solar Gateway Khawl]
                                            |
                                      (Sim Card / Wi-Fi)
                                            v
[Phone / Local Controller] <--(Automated Trigger)-- [Tui Valve Hawngtu Khawl]
\`\`\`

#### Huan Sensor Pawimawh Chite:
1. **Watermark Matric Potential Sensor:** Leilungin tui a chelh beh tlat dan leh thlai zungin tui a hip theih dan tehna (kPa).
2. **Thuk Lam Chhiarna Sensor (15cm, 45cm, 90cm):** Tui a liam thuk lutuk em tih leh leitha a tlen fai em tih hriatna.
3. **Thlai Hnah Lum Lam Tehna (Canopy Infrared):** Thlai hnah a lum chuan tui a khawm tawh lo tih hriatna a ni.

---

### Leilung Chi Hrang Hrang Tana Tui Pek Hun
| Leilung Chi | A Huh Ṭha Lai | Tui Pek Hun Chiah | A Ro Lutuk Tawh |
| :--- | :--- | :--- | :--- |
| **Tiau Lei (Sand)** | 5 – 10 kPa | **25 – 35 kPa** | > 45 kPa |
| **Leilung Pangngai (Sandy Loam)** | 10 – 20 kPa | **40 – 50 kPa** | > 70 kPa |
| **Hlum Lei (Silt Clay)** | 20 – 30 kPa | **60 – 75 kPa** | > 100 kPa |
| **Leitha Tam Hlum (Heavy Clay)** | 25 – 35 kPa | **80 – 95 kPa** | > 120 kPa |

---

### Sum Senso Tlem Dan
- **Current / Diesel Senso:** Zan lamah leilungin tui a hip ṭhat lai chauhva tui pek anih avangin za zela 38.4-in electric senso a tlahniam.
- **Leitha Luang Ral Tur Venna:** Tui a liam lutuk loh avangin chemical leitha a tlen bo lo.
- **Khawl Senso Hmuhlet Leh:** Tui leh khawl hmanna senso hi thla 8 chhung lekin tui man leh thlai thar tam atangin a luh let leh nghal a ni.`
  },
  {
    id: 'art-3',
    title: 'Silvopasture: Thing Phun, Hnim Hring Leh Ran Vulh Kawp Dan Ṭha',
    slug: 'silvopasture-thing-phun-hnim-leh-ran-vulh-kawp',
    coverImage: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=1600&q=80',
    category: 'Ran Vulh leh Thing Phun Kawp',
    tags: ['Silvopasture', 'LeiTha', 'SikLehSa'],
    author: INITIAL_AUTHORS[2],
    publishedAt: '2026-10-20T11:15:00Z',
    readingTimeMinutes: 8,
    status: 'published',
    isFeatured: false,
    views: 1980,
    likes: 112,
    comments: [],
    content: `## Thing Phun Leh Ran Vulh Kar Thu

Hmanlai atangin ram ngaw leh ran vulh hi inhmelma ang maiin an ngai thin a: loneitute chuan thing an kit fai vek a, thing enkawltute chuan ran an um bo thin.

Mahse **Silvopasture** chuan he ngaihdan hi a thlak thawk a ni: thing lian, ran chaw hnim tha, leh ran vulh kawpin ram hmun khatah hlawkna thaphat (thingfak, hnim, leh ran sa/hnute) a siam chhuak thei a ni.

---

### Silvopasture Chhawng Thumte
\`\`\`
SILVOPASTURE CHHAWNGTE:
[Chhawng Chungnung] -> Thing hlim leh thei kung (Chestnut / Walnut / Thingfak)
[Chhawng Laifang]    -> Ran chaw hnah tha (Leucaena / Tagasaste / Hazelnut)
[Chhawng Hnuailang]  -> Hnim hring chaw ṭha (Clover / Orchardgrass / Chicory)
[Ran Vulhte]         -> Bawng, Beram, Vawk tlan kual thin
\`\`\`

#### 1. Ran Lum Lutuk Laka Venhimna
Bawng leh ran hian khawlum lutuk (27°C aia sang) an tuar lo em em a, hnute pek a tlem a, an thau thei thin lo. Thing hlim hnuaiah erawh:
- Boruak lum lam chu **4°C atanga 7°C-in a vawt zawk**.
- Leilung lum lutuk lakah a vawng him a, leilung nungchate an dam khawchhuak thei.
- Ran thau chak lam a tla tlahniam ve lo.

---

### Thing Chi Thlan Dan & Hlawkna
| Thing Chi | Than Chak Lam | Hlawkna Hmasa | Hlawkna Dang |
| :--- | :--- | :--- | :--- |
| **Honey Locust** | Kum 8-12 | Fencing ban, thingfak | A rah hian thlum leh protein tam tak a pai |
| **Chestnut** | Kum 4-6 | A rah hralh theih | Thingzar hlim nuam tak |
| **Black Walnut** | Kum 30-45 | Thingfak to tak | A hnuai hnim a ti thi ve lo |
| **Oak (Thang)** | Kum rei | Thingfak chang | A rah hi vawk chaw tana ṭha tak a ni |

---

### Ran Vahkual Dan (Rotational Grazing)
Ran chu hmun khatah dah reng tur a ni lo. Solar electric fence te tak te hmangin ni tin emaw kar tin hmun tharah sawn zel tur:
1. **A thum a chhe khat:** Ranin hnim za zela 33 an ei a, 33 an rap bet a, 33 a chawr leh nan an kalsan thin.
2. **Chawlh Hahtdam Tir:** Ram chu ni 45 atanga 90 chhung chawlh hahdam tir leh thin tur a ni.

He hian leilung nung a ti pung a, thingzung pawh a tichhe lova, leitha nasa takin a vawng reng thin a ni.`
  },
  {
    id: 'art-4',
    title: 'Thei Huan Changkan Dan: Thlai Phun Khawm (High-Density) leh Rannung Hrik Ven Dan',
    slug: 'thei-huan-changkan-dan-high-density-spindle-biocontrol',
    coverImage: 'https://images.unsplash.com/photo-1519972064555-542444e71b54?auto=format&fit=crop&w=1600&q=80',
    category: 'Thei leh Thlai Huan',
    tags: ['SikLehSa', 'RannungVen', 'AgTech'],
    author: INITIAL_AUTHORS[3],
    publishedAt: '2026-10-18T16:00:00Z',
    readingTimeMinutes: 6,
    status: 'published',
    isFeatured: false,
    views: 1420,
    likes: 89,
    comments: [],
    content: `## Thei Huan Siam Dan Thlak A Hun Ta

Hmanlai chuan thei kung hi hla tak takah phun a ni a, a kung a lian lutuk a, a hnuailang zarah ni zung a thleng lo va, a rah lawh dawnin harsa takin lawn a ngai thin.

Tuna theihuan enkawl dan thar **2D Planar Fruiting Wall** ah chuan:

---

### Trellis Wire Hmanga Thlai Phun Khawm
Thlai zung te chi (dwarf rootstock) hmangin thir hruiah thei zarte chu bang ang maia thlep felin enkawl a ni:
- Hektare khatah thei kung 200 chauh phun thin kha **2,500 atanga 3,500** thleng phun theih a ni ta.
- Thei rah za zela 92-in ni zung tawk chiah an dawng a, a rawng leh a thlum a rualkhai em em.
- Rah lawh a awlsam a, hlawhfa lak hah a tlem sawt.

\`\`\`
2D PLANAR FRUITING WALL TRELLIS:
[Hrui 4: 2.8m] ====== Thei Zar ====== Thei Zar ======
[Hrui 3: 2.1m] ====== Thei Zar ====== Thei Zar ======
[Hrui 2: 1.4m] ====== Thei Zar ====== Thei Zar ======
[Hrui 1: 0.7m] ====== A Kung Zung ==== A Kung Zung ====
\`\`\`

---

### Damdawi Tur Tel Lova Rannung Ven Dan
1. **Pheromone Rim Hmanga Hrik Hruai Bo:** Rannung nu rim ang chiah solar dispenser hmangin tlaiah chhuah a ni a, rannung pate chuan a nute an zawng hmu thei lo va, chi an thlah thei lo.
2. **Rannung Ṭhate Vulh:** Huan kiltirah pangpar rimtui (sweet alyssum) chin a ni a, he hian hrik eitu rulhut leh vate a ko khawm a, thei tichhe theitu hrik an ei zo thin.

Kum 2-na lekah thei thar a tan theih avangin loneitute tan sum senso laklet a chak em em a ni.`
  },
  {
    id: 'art-5',
    title: 'Biochar: Thlai Rohnah Hal Ruak Lova Meihawl Ṭhaa Chantir leh Lei Tihṭhat Nan Hman Dan',
    slug: 'biochar-thlai-rohnah-hal-ruak-lova-meihawl-leitha',
    coverImage: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1600&q=80',
    category: 'Damdawi Tel Lova Enkawl',
    tags: ['Biochar', 'LeiTha', 'TuiVawnHim', 'LeiLehLoh'],
    author: INITIAL_AUTHORS[0],
    publishedAt: '2026-10-12T10:45:00Z',
    readingTimeMinutes: 5,
    status: 'published',
    isFeatured: false,
    views: 1670,
    likes: 95,
    comments: [],
    content: `## Thing Ro Hal Ruak Aiin: Meihawl Ropui Biochar

Fur leh thlasikah thing zar ro, buh fawng, leh thlai hnawmte hal liam mai kan ching a. He hian boruak a ti chhe mai bakah leitha tur tam tak a hal ral thin a ni.

Boruak (oxygen) tlem te chauh luh theihna kilnah 450°C atanga 650°C-a kan ur hian **Biochar (Meihawl Leitha)** ah a chang a, he meihawl hian kum sangkhat (1,000) dawn leilungah leitha a vawng reng thei a ni.

---

### Biochar Mawina Leh Ṭhatna
Biochar gram khat lek pawh hian khua chhung zau zawng (250-450 sq. meters) khawpa zau tuibur te tak te a pai a.

> *"Biochar hi a thara leiah theh nghal ngawt chi a ni lo; sponge ro tak tui chhunga dah ang maiin thlai tana tui leh leitha a hip fai vek thei. Hman hmain leitha (compost) leh ek tuiah kar hnih chhung chiah phawt tur a ni."*
> — **Loneitu Field Note**

---

### Hman Tura Siam Dan:
1. **Sawh Sawm:** Biochar chu 2mm atanga 6mm vel leka tein sawk sawm rawh.
2. **Compost Nen Pawlh:** Biochar hlawm khat leh leitha (compost) hlawm li pawlh rawh.
3. **Chiah Huh:** Tui leh rul leitha tuiah ni 14 chhung chiah huh rawh.
4. **Leiah Pawlh:** Thlai phun dawnin a zung bul leiah pawlh la, i damchhungin a ṭhatna a bo tawh lovang.`
  },
  {
    id: 'art-6',
    title: 'Ni Zung Ni Hnuaia Thlai Vawn Vawhna (Solar Cold Storage): Loneitute Hlawkna Tihpun Dan',
    slug: 'ni-zung-thlai-vawn-vawhna-solar-cold-storage-mizoram',
    coverImage: 'https://images.unsplash.com/photo-1592982537447-6f2a6a0c5c1b?auto=format&fit=crop&w=1600&q=80',
    category: 'Khawtlang Loneih Hmasawnna',
    tags: ['AgTech', 'TuiVawnHim', 'SikLehSa'],
    author: INITIAL_AUTHORS[1],
    publishedAt: '2026-10-05T08:20:00Z',
    readingTimeMinutes: 7,
    status: 'published',
    isFeatured: false,
    views: 2150,
    likes: 128,
    comments: [],
    content: `## Thlai Chhe Ral Venhimna

Thingtlâng hmun hla tak takah kan thlai thar, thei, leh thlai hring za zela 40 vel chu bazar a thlen hmain a chhe ral thin a. Current a that tawk loh avangin loneituten an thlai an hralh hmanhmawh a, a man tlawm te tein dawrkai an hralh luih luih thin a ni.

He harsatna sut kian nan **Ni Zung Hmanga Thlai Vawn Vawhna (Solar Cold Storage)** a lo chhuak ta.

---

### Phase-Change Material (PCM) Hman Dan
Battery to lutuk hman a ngai lova, chhunah ni zung chakna hmangin vûr tlang (PCM Salt Hydrate) an ti khal a, zanah ni a lan loh pawhin he vûr tlang hian darkar 36 atanga 48 chhung room vawt tak (4°C) a vawng reng thei a ni.

\`\`\`
SOLAR COLD STORAGE KAL DAN:
[Solar Plate (5kW - 10kW)]
          | (Chhun ni zung hmangin)
          v
[Compressor Khawl]
          |
          +---> [Thlai dahna pindan chu 4°C-ah a ti vawt]
          |
          +---> [PCM Tui chu -3°C-ah vurah a chantir]
                     |
(Zanah: Ni a tla, khawl a thi)
                     v
[Vur khal tui zawngin a vawh a chhuah a, thlai a vawng him reng]
\`\`\`

---

### Loneitute Sum Hmuh Dan Hmasawnna
Loneitu inzawmkhawm ten he cold storage an neih hian:
- **Thlai Hring:** Antam, zikhlum, leh hmarcha chu ni 2 chauh hring thin kha **ni 21 chhung** thar em emin an vawng vawt thei.
- **Hralh Hun Thlan Thiam:** Bazarah thlai a tam laiin an hralh buai lo va, thlai tlem lai leh man to lai takah an hralh chauh thin.
- **Hlawkna:** Loneitu chhungkuate sum hmuh za zela **31.4-in a pung nghal a ni**.`
  }
];

export const INITIAL_ABOUT_DATA: AboutPageData = {
  badge: 'The Loneitu Manifesto — MIZORAM TAN',
  heroTitle: 'Empowering Mizoram Farmers with Sustainable Agronomy & Agro-Tech.',
  heroDescription: 'Loneitu is a dedicated agricultural platform built for Mizoram—fostering climate-smart hill agronomy, high-value horticulture, livestock care, and rural prosperity.',
  editorialTag: 'Our Editorial Purpose',
  editorialTitle: 'Why Modern Agriculture Requires a New Reading Standard',
  editorialBody: `For over half a century, mainstream agricultural communication was dominated by chemical input catalogs and subsidized monoculture advice. Soil was simplified into a dead sponge to be force-fed soluble NPK, while pests and weeds were met with escalating sprays that bred resistant biotypes.

Today, a quiet agricultural revolution is underway. Farmers worldwide are demonstrating that by fostering subterranean mycorrhizal fungal webs, crimping dense cover crops, deploying low-power wireless tension sensors, and integrating timber trees with livestock, farms can thrive through extreme weather while slashing overhead costs.`,
  quote: 'To heal the climate and nourish human communities, we must first restore the microbial dignity of the soil beneath our feet.',
  customCardsSection: {
    enabled: true,
    tag: 'Staff & Team Specialists',
    title: 'Staff & Specialists of the Firm',
    subtitle: 'The dedicated agronomists, researchers, officers, and field specialists of the firm.',
    columns: [
      { id: 'col-location', name: 'DESIGNATION', type: 'text' },
      { id: 'col-contact', name: 'PORTFOLIO', type: 'text' },
      { id: 'col-status', name: 'QUALIFICATION', type: 'text' },
      { id: 'col-1793872810199', name: 'PROFESSIONAL EXPERIENCE', type: 'text' },
    ],
    cards: [
      {
        id: 'card-1793872877251',
        name: 'Dr. C. Lalhriatpuia',
        designation: 'Project Director',
        portfolio: 'Agriculture & Horticulture',
        qualification: 'Ph.D.',
        experience: 'More than 10 years of field work experience with several published research papers. Awarded Appreciation Certificates by the Minister of Horticulture, Government of Mizoram, Minister of State, Adviser to Chief Minister, and MLA. Extensive work experience under NABARD.',
        avatar: 'https://i.postimg.cc/Z5rVXKSy/Hriata.png',
        title: 'Dr. C. Lalhriatpuia',
        image: 'https://i.postimg.cc/Z5rVXKSy/Hriata.png',
        columnValues: {
          'col-location': 'Project Director',
          'col-contact': 'Agriculture & Horticulture',
          'col-status': 'Ph.D.',
          'col-1793872810199': 'More than 10 years of field work experience with several published research papers. Awarded Appreciation Certificates by the Minister of Horticulture, Government of Mizoram, Minister of State, Adviser to Chief Minister, and MLA. Extensive work experience under NABARD.',
        },
      },
      {
        id: 'card-1',
        name: 'Dr. C. Lalremruata',
        designation: 'Senior Soil & Agronomy Specialist',
        portfolio: 'Microbial Inoculants & Soil Health',
        qualification: 'Ph.D. Soil Science',
        experience: 'Oversees high-altitude soil profiling, microbial fungal inoculants, and cold-climate grape vineyard monitoring across Mizoram.',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
        title: 'Dr. C. Lalremruata',
        image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
        columnValues: {
          'col-location': 'Senior Soil & Agronomy Specialist',
          'col-contact': 'Microbial Inoculants & Soil Health',
          'col-status': 'Ph.D. Soil Science',
          'col-1793872810199': 'Oversees high-altitude soil profiling, microbial fungal inoculants, and cold-climate grape vineyard monitoring across Mizoram.',
        },
      },
      {
        id: 'card-2',
        name: 'Pi Lalhmingmawii Vance',
        designation: 'Principal Horticultural Investigator',
        portfolio: 'Citrus & Dragon Fruit Canopy',
        qualification: 'M.Sc. Horticulture',
        experience: 'Specializes in tropical fruit canopy pruning, dragon fruit trellis architectures, and Assam lemon disease-free rootstocks.',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
        title: 'Pi Lalhmingmawii Vance',
        image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
        columnValues: {
          'col-location': 'Principal Horticultural Investigator',
          'col-contact': 'Citrus & Dragon Fruit Canopy',
          'col-status': 'M.Sc. Horticulture',
          'col-1793872810199': 'Specializes in tropical fruit canopy pruning, dragon fruit trellis architectures, and Assam lemon disease-free rootstocks.',
        },
      },
      {
        id: 'card-3',
        name: 'Pu R. Lalhmachhuana',
        designation: 'Organic Input & Composting Officer',
        portfolio: 'Bio-fertilizer & Certification',
        qualification: 'B.Sc. Agriculture',
        experience: 'Leads farmer participatory bio-fertilizer formulations, vermicomposting clusters, and community organic certification.',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        title: 'Pu R. Lalhmachhuana',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        columnValues: {
          'col-location': 'Organic Input & Composting Officer',
          'col-contact': 'Bio-fertilizer & Certification',
          'col-status': 'B.Sc. Agriculture',
          'col-1793872810199': 'Leads farmer participatory bio-fertilizer formulations, vermicomposting clusters, and community organic certification.',
        },
      },
    ],
  },
  authorsTitle: 'Contributing Agronomists & Field Researchers',
  authorsSubtitle: 'Researchers and farmers authoring our peer-informed investigations',
  socialLinks: {
    instagram: '',
    facebook: '',
    whatsapp: '',
    youtube: '',
    twitter: '',
  },
  companyBanner: DEFAULT_COMPANY_BANNER,
};

export const INITIAL_FOOTER_DATA: FooterData = {
  tagline: 'Mizoram leilung mil thlai enkawl dan, huan siam dan thar, leh ran vulh dan tha ziah chhuahna journal.',
  copyrightText: 'Loneitu (MIZORAM TAN). Mizoram thlai leh leilung humhalhna.',
  dedicationText: 'Loneitute leh zirtirtute tana duhsakna nen',
  contactEmail: 'muantea45@gmail.com',
  bannerEnabled: false,
  bannerBadge: 'HRIATTIRNA',
  bannerTitle: 'Loneitu Field Advisory & Community Journal',
  bannerText: 'Mizoram loneitute tana chanchin thar, sik leh sa inthlakthleng mila hmalak dan leh zirtirna tha ber ber te.',
  bannerButtonText: 'Kan Chanchin Chhiar Rawh',
  bannerButtonLink: '/about',
};
