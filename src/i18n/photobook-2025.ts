import { IMAGES_BASE_URL } from '@/constants';

export type PhotobookLang = 'en' | 'it';

const base = '/images/contests/2025';

// Language-agnostic data: images, photographer names, person names.
export const photobook2025Shared = {
  cover: { image: `${base}/AyNJL5aPY2mqvE7Hlut_m.webp` },
  bw: {
    first: {
      image: `${base}/HqAtLmm_WZNcaqdqS-qvY.webp`,
      photographer: 'Marco Domenicucci',
    },
    second: {
      image: `${base}/dxnP7pmJwuhi58qDvkDc0.webp`,
      photographer: 'Alessandro Grasso',
    },
    third: {
      image: `${base}/hrnLz6cso33mNyOHMqTfE.webp`,
      photographer: 'Yves Guenot',
    },
  },
  macro: {
    first: {
      image: `${base}/AyNJL5aPY2mqvE7Hlut_m.webp`,
      photographer: 'Umberto Raganato',
    },
    second: {
      image: `${base}/jDKeqtHMCjuD-zY3nyyK_.webp`,
      photographer: 'Giancarlo Mazarese',
    },
    third: {
      image: `${base}/Bq0pvZY2C2ZGuG2d-Zb1J.webp`,
      photographer: 'Renata Romeo',
    },
  },
  wide: {
    first: {
      image: `${base}/M3UuRRotHaiyAhx09RExR.webp`,
      photographer: 'Marco Giuliano',
    },
    second: {
      image: `${base}/QP9TPG9VXi1eEWlu2ynBA.webp`,
      photographer: 'Marco Gargiulo',
    },
    third: {
      image: `${base}/GLZCG4LSGQ0os0PuAy2P3.webp`,
      photographer: 'Enrico Pompei',
    },
  },
  portfolio: {
    first: {
      photographer: 'Mimmo Roscigno',
      images: [
        `${base}/GSyDfXQ6BaGI4YDZkCavI.webp`,
        `${base}/Xs0fF1WIYvVeqTgiGQkXA.webp`,
        `${base}/OjpWUXDW8vqCMx-Pmdlwi.webp`,
      ],
    },
    second: {
      photographer: 'Francesco Visintin',
      images: [
        `${base}/8t0rHKWGb5r-kGPRsXwO5.webp`,
        `${base}/Z4BBuzaR6xqBmdvS4Tlog.webp`,
        `${base}/ihU4DBr1pNp9paPSHn0sm.webp`,
      ],
    },
    third: {
      photographer: 'Marc Casanovas',
      images: [
        `${base}/toZsZS8iWVQS5i9yp7DAW.webp`,
        `${base}/z0zWrTXxd768IfVRRK0Xh.webp`,
        `${base}/vMAN1zWQkOijUie96K5i9.webp`,
      ],
    },
  },
  leadership: [
    { name: 'Paolo De Iure' },
    { name: 'Giuseppe Pignataro' },
    { name: "Lucio D'Alessandro" },
  ],
  judges: [
    {
      name: 'Pasquale Vassallo',
      image: `${IMAGES_BASE_URL}/judges/BA4YMn4PQGEhT11vs5Ztg/oi-7LVzH3QDt68p-Kqt6W`,
    },
    {
      name: 'Pietro Formis',
      image: `${IMAGES_BASE_URL}/judges/TA4YMn4PQGEhT11vs5Ztg/y7HwiJ3smydmCE7U-h-Yk`,
    },
    {
      name: 'Domy Tripodi',
      image: `${IMAGES_BASE_URL}/judges/CA4YMn4PQGEhT11vs5Ztg/PlGzGi8UUS1mqM-MJKjpP`,
    },
  ],
  photographerIndex: [
    'Marc Casanovas',
    'Marco Domenicucci',
    'Marco Gargiulo',
    'Marco Giuliano',
    'Alessandro Grasso',
    'Yves Guenot',
    'Giancarlo Mazarese',
    'Enrico Pompei',
    'Umberto Raganato',
    'Renata Romeo',
    'Mimmo Roscigno',
    'Francesco Visintin',
  ],
} as const;

type LocalizedPiece = { title: string; place: string; body: string };
type LocalizedTriple = {
  first: LocalizedPiece;
  second: LocalizedPiece;
  third: LocalizedPiece;
};
type LocalizedPortfolio = {
  pieces: readonly [LocalizedPiece, LocalizedPiece, LocalizedPiece];
};

type PhotobookCopy = {
  meta: { title: string; description: string };
  ui: {
    downloadPdf: string;
    preparing: string;
    coverKicker: string;
    coverSubline: string;
    coverTitleSub: string;
    categories: {
      bw: string;
      macro: string;
      wide: string;
      portfolio: string;
    };
    categoryEyebrow: string;
    ordinals: readonly [string, string, string];
    placeSuffix: string;
    leadershipTitlePrefix: string;
    leadershipTitleEm: string;
    judgesEyebrow: string;
    judgesTitlePrefix: string;
    judgesTitleEm: string;
    preface: {
      eyebrow: string;
      titleLine1: string;
      titleLine2Em: string;
      paragraph1: string;
      paragraph2: string;
      paragraph3: string;
    };
    dividers: {
      bw: { titleLine1: string; titleLine2Em: string; sub: string };
      macro: { titleEm: string; sub: string };
      wide: { titleLine1: string; titleLine2Em: string; sub: string };
      portfolio: { titleLine1: string; titleLine2Em: string; sub: string };
    };
    macroQuote: {
      line1: string;
      line2Prefix: string;
      line2Em: string;
    };
    credits: {
      eyebrow: string;
      direzione: string;
      giuria: string;
      autori: string;
      aCuraDi: string;
      aCuraDiLine1: string;
      aCuraDiLine2: string;
    };
    endFine: string;
  };
  coverAlt: string;
  bw: LocalizedTriple;
  macro: LocalizedTriple;
  wide: LocalizedTriple;
  portfolio: {
    first: LocalizedPortfolio;
    second: LocalizedPortfolio;
    third: LocalizedPortfolio;
  };
  leadership: readonly [
    { role: string; body: string },
    { role: string; body: string },
  ];
};

const it: PhotobookCopy = {
  meta: {
    title: 'Photobook 2025 — See in the Sea',
    description:
      'Le immagini vincitrici del See in the Sea International Underwater Photocontest 2025.',
  },
  ui: {
    downloadPdf: 'Scarica PDF',
    preparing: 'Preparazione…',
    coverKicker: 'Photobook',
    coverSubline: 'International Underwater Photocontest',
    coverTitleSub: 'Le immagini vincitrici',
    categories: {
      bw: 'Black and White',
      macro: 'Macro',
      wide: 'Wide Angle',
      portfolio: 'Portfolio Mediterraneo',
    },
    categoryEyebrow: 'Categoria',
    ordinals: ['1°', '2°', '3°'],
    placeSuffix: 'classificato',
    leadershipTitlePrefix: 'La ',
    leadershipTitleEm: 'direzione',
    judgesEyebrow: 'Giuria',
    judgesTitlePrefix: 'I ',
    judgesTitleEm: 'giudici',
    preface: {
      eyebrow: 'Prefazione',
      titleLine1: 'Un anno di immagini',
      titleLine2Em: 'dal silenzio del mare',
      paragraph1:
        'Dodici autori, quattro categorie, un solo linguaggio: la luce. ',
      paragraph2:
        "Questo volume raccoglie le fotografie premiate dall'edizione 2025 del See in the Sea, concorso internazionale dedicato alla fotografia subacquea.",
      paragraph3:
        'Ogni scatto è un incontro. Con un soggetto, con una condizione di luce, con un istante irripetibile. Sfoglialo lentamente.',
    },
    dividers: {
      bw: {
        titleLine1: 'Black and',
        titleLine2Em: 'White',
        sub: 'Tre autori. Tre visioni in bianco e nero.',
      },
      macro: {
        titleEm: 'Macro',
        sub: "L'invisibile a un palmo dall'obiettivo.",
      },
      wide: {
        titleLine1: 'Wide',
        titleLine2Em: 'Angle',
        sub: 'Lo spazio, la scala, la luce ambientale.',
      },
      portfolio: {
        titleLine1: 'Portfolio',
        titleLine2Em: 'Mediterraneo',
        sub: 'Tre autori, tre trittici. Nove letture di un unico mare.',
      },
    },
    macroQuote: {
      line1: "L'impronta dell'uomo in contrasto",
      line2Prefix: 'con ',
      line2Em: 'il coraggio del mare.',
    },
    credits: {
      eyebrow: 'Colophon',
      direzione: 'Direzione',
      giuria: 'Giuria',
      autori: 'Autori',
      aCuraDi: 'A cura di',
      aCuraDiLine1: 'See in the Sea — International Underwater Photocontest.',
      aCuraDiLine2: 'Organizzato da Ortona Sub.',
    },
    endFine: 'Fine.',
  },
  coverAlt: 'A pancia piena — Umberto Raganato',
  bw: {
    first: {
      title: 'Incontro giocoso',
      place: 'Isola di Tonga, Oceania',
      body: "Una femmina adulta di megattera, calma e curiosa, mi concede un lungo incontro ravvicinato nelle acque di Vava'u, a Tonga, importante sito di riproduzione durante l'inverno australe. Incontri del genere rivelano l'intelligenza sociale e la sensibilità straordinaria di questi giganti del mare.",
    },
    second: {
      title: 'Ctenoforo',
      place: 'Area Marina Protetta di Portofino',
      body: "Questa stampa monocroma cattura la complessa struttura di uno Ctenoforo, mettendo a nudo la sua trasparenza quasi totale. La luce interna, privata delle sue naturali iridescenze, si focalizza qui sulla geometria delle serie di pettini, rendendo tangibile l'invisibile confine tra l'organismo e l'abisso.",
    },
    third: {
      title: 'Face to Face',
      place: 'North Sulawesi, Indonesia',
      body: "Durante un'immersione notturna, questo curioso calamaro si è avvicinato a noi, attratto dalle nostre luci. La loro curiosità è pari anche alla loro imprevedibilità, spesso si hanno solo pochi secondi per scattare una foto, unica, come in questo caso.",
    },
  },
  macro: {
    first: {
      title: 'A pancia piena',
      place: 'Santa Caterina di Nardò, LE',
      body: "Durante una notturna estiva mi balza all'occhio una piccola medusa simile a quelle fotografate tantissime volte. Questa tuttavia è differente dalle altre in quanto presenta al suo interno un piccolo pesce in stato larvale.",
    },
    second: {
      title: 'Contorni di luce',
      place: '—',
      body: "Un hairy frogfish (Antennarius striatus) fotografato con due flash. Il primo flash, in controluce, con snoot e filtro giallo, ha delineato i contorni del soggetto, mettendo in risalto le trasparenze e le strutture filamentose del corpo. Il secondo flash è stato focalizzato sull'occhio per preservare una resa cromatica naturale nel punto di maggiore interesse. L'assenza di luce ambientale e il fondo nero hanno esaltato il gioco di luci e ombre, lasciando che forma, volume e texture definissero l'immagine.",
    },
    third: {
      title: 'Piercing',
      place: 'Hurgada, Egitto',
      body: "Le cicatrici di acciaio su un Platax teiera: l'impronta dell'uomo in contrasto con il coraggio del mare. La testimonianza di un frammento di vita che porta addosso il peso del nostro passaggio, senza arrendersi.",
    },
  },
  wide: {
    first: {
      title: '… che scatto!',
      place: 'Raja Ampat, Southwest Papua, Indonesia',
      body: 'A pochi metri dalla riva, nelle vicinanze della spiaggia del resort che mi ospita, fluttua una enorme macchia di sargassi: rappresenta il loro habitat ideale dove mimetizzarsi rendendosi quasi invisibili. Tra quelle foglie tre Frogfish mi guardano immobili.',
    },
    second: {
      title: "L'opportunista",
      place: 'Monte di Procida, Napoli',
      body: "Un granchio blu (Callinectes sapidus) si aggira sul basso fondale all'interno di un porticciolo di pescatori. Scarti della pesca professionale vengono gettati sul fondale e quindi facile preda per uno spuntino gratis e senza sforzo.",
    },
    third: {
      title: 'Alien World',
      place: 'False Bay, Cape Town, Sud Africa',
      body: "In Sud Africa, nella baia di False Bay, le correnti fredde ricche di nutrienti alimentano l'incredibile biodiversità dei reef di acqua fredda. Nella foto un Puffadder Shyshark (Haploblepharus edwardsii) si nasconde tra le spugne e i coralli molli del reef.",
    },
  },
  portfolio: {
    first: {
      pieces: [
        {
          title: 'Angry',
          place: 'Marina Grande, Sorrento',
          body: "Un grosso astice mediterraneo alza le sue potenti chele in un atteggiamento palesemente difensivo, forse disturbato dal mio avvicinarmi per immortalare quell'istante.",
        },
        {
          title: 'Primordial Broth',
          place: 'Saline Joniche, RC',
          body: "Durante un'immersione notturna nello stretto di Messina, un pesce Civetta si fa strada in mezzo ad una grande quantità di piccolissimi gamberetti.",
        },
        {
          title: 'Forever',
          place: 'Banco di Santa Croce, Golfo di Napoli',
          body: 'Nella foto sono rappresentati due gamberi simbionti del crinoide, il maschio a destra e la femmina a sinistra. Vivono in simbiosi con questo crinoide giallo, un echinoderma stretto parente dei ricci e delle stelle marine.',
        },
      ],
    },
    second: {
      pieces: [
        {
          title: 'Sepiola',
          place: 'Argentario, Cala Grande, Grosseto',
          body: 'Un momento sospeso nella penombra del Mediterraneo, dove la delicatezza del soggetto incontra la precisione della luce.',
        },
        {
          title: 'Polpo Comune',
          place: 'Argentario, Cala Grande, Grosseto',
          body: "Un polpo comune su uno scoglio a Cala Grande, all'Argentario, a circa 30 metri di profondità. Qui ho cercato un equilibrio tra luce artificiale e ambiente per mantenere naturalezza e tridimensionalità, integrando il soggetto nel suo habitat.",
        },
        {
          title: 'Seppia Comune',
          place: 'Forte dei Marmi, Lucca',
          body: 'Scattata di fronte alla spiaggia di Forte dei Marmi a circa 4 metri di profondità, mostra tre seppie allineate davanti a una nassa abbandonata ma ancora attiva. Ho trascorso con loro oltre 30 minuti realizzando più di 1200 scatti: è stato straordinario osservare i continui cambiamenti di colore durante le interazioni reciproche, mentre ignoravano sia i granchi di sabbia — loro prede abituali — sia la nassa, spesso luogo di deposizione delle uova ma anche potenziale trappola.',
        },
      ],
    },
    third: {
      pieces: [
        {
          title: 'Lophius',
          place: 'Mar Mediterraneo',
          body: "Il pesce lanterna del Mediterraneo (Lophius piscatorius) abita sia il Mar Mediterraneo che l'Oceano Atlantico. Questo esemplare si distingue come il più grande che ho avuto l'opportunità di fotografare negli ultimi anni, misurando quasi un metro e mezzo di lunghezza. Le sue dimensioni imponenti e l'aspetto insolito lo rendono uno dei predatori più notevoli di queste acque.",
        },
        {
          title: 'Nesting Syndrome',
          place: 'Mar Mediterraneo',
          body: 'I nidi svolgono un ruolo cruciale nella biologia riproduttiva di Symphodus cinereus. Questa specie costruisce i suoi nidi sul fondale marino, tipicamente in aree con substrati sabbiosi o ghiaiosi, spesso in prossimità di praterie di fanerogame marine. Il maschio attrae le femmine al suo nido e, dopo la deposizione delle uova, si assume la responsabilità della loro protezione e cura.',
        },
        {
          title: 'Guarding the Next Generation',
          place: 'Mar Mediterraneo',
          body: "Un Diplecogaster bimaculata, pesce ventosa originario del Mediterraneo, intento a proteggere la sua covata. I piccoli punti con gli occhi visibili sono embrioni che si sviluppano all'interno di capsule adesive attaccate alla superficie. Le cure parentali includono la costante ventilazione delle uova per garantire l'ossigenazione e proteggerle da predatori e sedimenti: comportamenti cruciali per la sopravvivenza della prole.",
        },
      ],
    },
  },
  leadership: [
    {
      role: 'Presidente Ortona Sub',
      body: '"Me lo sono chiesto tante volte, fissando in silenzio questo schermo nero... Frammenti di blu si accavallano a volti sfumati, l\'eco sopito di bolle leggere, onde lontane, sensazioni sospese che profumano di sole, di sale, di acqua di mare... colori e forme mutevoli dove nulla è come sembra... In un passato ormai lontano ho provato a raccontare il nostro viaggio, incontro di sguardi, passioni fuse per creare una storia, il brivido di una visione irrazionale, la magia di cercare oltre l\'orizzonte..."',
    },
    {
      role: 'Direttore Tecnico',
      body: 'Responsabile della direzione tecnica del concorso, coordina logistica, sicurezza e criteri di valutazione garantendo lo standard qualitativo delle edizioni.',
    },
  ],
};

const en: PhotobookCopy = {
  meta: {
    title: 'Photobook 2025 — See in the Sea',
    description:
      'The winning images of the See in the Sea International Underwater Photocontest 2025.',
  },
  ui: {
    downloadPdf: 'Download PDF',
    preparing: 'Preparing…',
    coverKicker: 'Photobook',
    coverSubline: 'International Underwater Photocontest',
    coverTitleSub: 'The winning images',
    categories: {
      bw: 'Black and White',
      macro: 'Macro',
      wide: 'Wide Angle',
      portfolio: 'Mediterranean Portfolio',
    },
    categoryEyebrow: 'Category',
    ordinals: ['1st', '2nd', '3rd'],
    placeSuffix: 'place',
    leadershipTitlePrefix: 'Our ',
    leadershipTitleEm: 'leadership',
    judgesEyebrow: 'Jury',
    judgesTitlePrefix: 'The ',
    judgesTitleEm: 'judges',
    preface: {
      eyebrow: 'Preface',
      titleLine1: 'A year of images',
      titleLine2Em: 'from the silence of the sea',
      paragraph1:
        'Twelve authors, four categories, a single language: light. This volume gathers the photographs awarded at the 2025 edition of See in the Sea, the international contest dedicated to underwater photography.',
      paragraph2:
        'Every shot is an encounter. With a subject, with a lighting condition, with an unrepeatable instant. Turn the pages slowly.',
      paragraph3: '',
    },
    dividers: {
      bw: {
        titleLine1: 'Black and',
        titleLine2Em: 'White',
        sub: 'Three authors. Three monochrome visions.',
      },
      macro: {
        titleEm: 'Macro',
        sub: 'The invisible, a palm away from the lens.',
      },
      wide: {
        titleLine1: 'Wide',
        titleLine2Em: 'Angle',
        sub: 'Space, scale, ambient light.',
      },
      portfolio: {
        titleLine1: 'Mediterranean',
        titleLine2Em: 'Portfolio',
        sub: 'Three authors, three triptychs. Nine readings of a single sea.',
      },
    },
    macroQuote: {
      line1: 'The mark of man in contrast',
      line2Prefix: 'with ',
      line2Em: 'the courage of the sea.',
    },
    credits: {
      eyebrow: 'Colophon',
      direzione: 'Leadership',
      giuria: 'Jury',
      autori: 'Authors',
      aCuraDi: 'Edited by',
      aCuraDiLine1: 'See in the Sea — International Underwater Photocontest.',
      aCuraDiLine2: 'Organised by Ortona Sub.',
    },
    endFine: 'The End.',
  },
  coverAlt: 'A pancia piena — Umberto Raganato',
  bw: {
    first: {
      title: 'Playful Encounter',
      place: 'Tonga Islands, Oceania',
      body: "An adult female humpback whale, calm and curious, grants me a long, close encounter in the waters of Vava'u, Tonga — a major breeding site during the austral winter. Meetings like this reveal the social intelligence and extraordinary sensitivity of these giants of the sea.",
    },
    second: {
      title: 'Ctenophore',
      place: 'Portofino Marine Protected Area',
      body: 'This monochrome print captures the intricate structure of a Ctenophore, laying bare its almost total transparency. The inner light, stripped of its natural iridescence, focuses here on the geometry of the comb rows, making tangible the invisible boundary between organism and abyss.',
    },
    third: {
      title: 'Face to Face',
      place: 'North Sulawesi, Indonesia',
      body: 'During a night dive, this curious squid approached us, drawn in by our lights. Their curiosity matches their unpredictability — often you have only a few seconds to take a shot, unique, as in this case.',
    },
  },
  macro: {
    first: {
      title: 'On a Full Belly',
      place: 'Santa Caterina di Nardò, LE',
      body: "During a summer night dive, a small jellyfish catches my eye — similar to many I've photographed before. This one, however, is different: inside it sits a tiny fish in larval stage.",
    },
    second: {
      title: 'Contours of Light',
      place: '—',
      body: "A hairy frogfish (Antennarius striatus) photographed with two flashes. The first, backlit, with snoot and yellow filter, outlined the subject's contours, highlighting the transparencies and filamentous structures of the body. The second flash was focused on the eye to preserve a natural chromatic rendering at the point of greatest interest. The absence of ambient light and the black background exalted the play of light and shadow, letting shape, volume and texture define the image.",
    },
    third: {
      title: 'Piercing',
      place: 'Hurghada, Egypt',
      body: 'Steel scars on a teapot Platax: the mark of man in contrast with the courage of the sea. The testimony of a fragment of life that carries the weight of our passing, without surrender.',
    },
  },
  wide: {
    first: {
      title: '… what a shot!',
      place: 'Raja Ampat, Southwest Papua, Indonesia',
      body: 'A few metres from the shore, near the beach of the resort hosting me, a huge patch of sargassum floats: their ideal habitat, where they camouflage themselves almost invisibly. Among those leaves, three frogfish watch me, motionless.',
    },
    second: {
      title: 'The Opportunist',
      place: 'Monte di Procida, Naples',
      body: "A blue crab (Callinectes sapidus) roams the shallow seabed inside a small fishermen's harbour. Scraps from professional fishing are thrown onto the bottom and thus easy prey for a free, effortless snack.",
    },
    third: {
      title: 'Alien World',
      place: 'False Bay, Cape Town, South Africa',
      body: 'In South Africa, in False Bay, cold nutrient-rich currents fuel the incredible biodiversity of cold-water reefs. In the photograph, a Puffadder Shyshark (Haploblepharus edwardsii) hides among the sponges and soft corals of the reef.',
    },
  },
  portfolio: {
    first: {
      pieces: [
        {
          title: 'Angry',
          place: 'Marina Grande, Sorrento',
          body: 'A large Mediterranean lobster raises its powerful claws in a plainly defensive posture, perhaps disturbed by my approach as I tried to capture that instant.',
        },
        {
          title: 'Primordial Broth',
          place: 'Saline Joniche, RC',
          body: 'During a night dive in the Strait of Messina, a stargazer fish makes its way through a great cloud of tiny shrimp.',
        },
        {
          title: 'Forever',
          place: 'Santa Croce Bank, Gulf of Naples',
          body: 'The photograph shows two crinoid symbiont shrimp, the male on the right and the female on the left. They live in symbiosis with this yellow crinoid — an echinoderm, a close relative of sea urchins and starfish.',
        },
      ],
    },
    second: {
      pieces: [
        {
          title: 'Sepiola',
          place: 'Argentario, Cala Grande, Grosseto',
          body: 'A moment suspended in the half-light of the Mediterranean, where the delicacy of the subject meets the precision of the light.',
        },
        {
          title: 'Common Octopus',
          place: 'Argentario, Cala Grande, Grosseto',
          body: 'A common octopus on a rock at Cala Grande, Argentario, at about 30 metres depth. Here I sought a balance between artificial light and environment to preserve naturalness and three-dimensionality, integrating the subject into its habitat.',
        },
        {
          title: 'Common Cuttlefish',
          place: 'Forte dei Marmi, Lucca',
          body: 'Taken in front of the beach of Forte dei Marmi at about 4 metres depth, it shows three cuttlefish aligned before an abandoned but still active fish trap. I spent over 30 minutes with them, shooting more than 1,200 frames: it was extraordinary to watch the continuous colour changes during their interactions, while they ignored both the sand crabs — their usual prey — and the trap, often a place of egg-laying but also a potential snare.',
        },
      ],
    },
    third: {
      pieces: [
        {
          title: 'Lophius',
          place: 'Mediterranean Sea',
          body: "The Mediterranean anglerfish (Lophius piscatorius) inhabits both the Mediterranean Sea and the Atlantic Ocean. This specimen stands out as the largest I've had the chance to photograph in recent years, measuring almost a metre and a half in length. Its imposing size and unusual appearance make it one of the most remarkable predators of these waters.",
        },
        {
          title: 'Nesting Syndrome',
          place: 'Mediterranean Sea',
          body: 'Nests play a crucial role in the reproductive biology of Symphodus cinereus. This species builds its nests on the seafloor, typically in areas with sandy or gravelly substrates, often near seagrass meadows. The male attracts females to his nest and, after egg-laying, takes on the responsibility of their protection and care.',
        },
        {
          title: 'Guarding the Next Generation',
          place: 'Mediterranean Sea',
          body: 'A Diplecogaster bimaculata, a clingfish native to the Mediterranean, intent on protecting its clutch. The small dots with visible eyes are embryos developing inside adhesive capsules attached to the surface. Parental care includes constant fanning of the eggs to ensure oxygenation and to shield them from predators and sediment — behaviours crucial to the survival of the offspring.',
        },
      ],
    },
  },
  leadership: [
    {
      role: 'President of Ortona Sub',
      body: 'At the helm of Ortona Sub, he has long championed the culture of the sea and the spread of underwater photography as a tool for knowledge and protection of the marine environment.',
    },
    {
      role: 'Technical Director',
      body: 'Responsible for the technical direction of the contest, he coordinates logistics, safety and judging criteria, ensuring the quality standard of each edition.',
    },
  ],
};

export const photobook2025Copy: Record<PhotobookLang, PhotobookCopy> = {
  it,
  en,
};

type PortfolioSlot = 'first' | 'second' | 'third';
type TripleSlot = 'first' | 'second' | 'third';

type SharedTriple = Record<TripleSlot, { image: string; photographer: string }>;

function mergeTriple(shared: SharedTriple, copy: LocalizedTriple) {
  const slots: readonly TripleSlot[] = ['first', 'second', 'third'] as const;
  return Object.fromEntries(
    slots.map(slot => [slot, { ...shared[slot], ...copy[slot] }])
  ) as Record<
    TripleSlot,
    LocalizedPiece & { image: string; photographer: string }
  >;
}

export function getPhotobook2025(lang: PhotobookLang) {
  const s = photobook2025Shared;
  const c = photobook2025Copy[lang];

  const portfolioSlots: readonly PortfolioSlot[] = [
    'first',
    'second',
    'third',
  ] as const;
  const portfolio = Object.fromEntries(
    portfolioSlots.map(slot => [
      slot,
      {
        photographer: s.portfolio[slot].photographer,
        pieces: c.portfolio[slot].pieces.map((p, i) => ({
          image: s.portfolio[slot].images[i],
          ...p,
        })),
      },
    ])
  ) as Record<
    PortfolioSlot,
    {
      photographer: string;
      pieces: Array<LocalizedPiece & { image: string }>;
    }
  >;

  c.leadership;
  return {
    lang,
    meta: c.meta,
    ui: c.ui,
    cover: { image: s.cover.image, alt: c.coverAlt },
    bw: mergeTriple(s.bw, c.bw),
    macro: mergeTriple(s.macro, c.macro),
    wide: mergeTriple(s.wide, c.wide),
    portfolio,
    leadershipNames: s.leadership,
    leadership: s.leadership
      .map((entry, i) => ({
        ...entry,
        ...c.leadership[i],
      }))
      .filter(entry => entry.body),
    judges: s.judges.map(judge => ({ ...judge })),
    photographerIndex: s.photographerIndex,
  };
}
