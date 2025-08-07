export const defaultLang = 'en';
export const languages = {
  en: 'English',
  it: 'Italiano',
} as const;

export type Language = keyof typeof languages;

export const translations = {
  en: {
    // Navigation
    'nav.about': 'About',
    'nav.contests': 'Contests',
    'nav.login': 'Login',
    'nav.submit': 'Submit Photo',

    // Home page sections
    'home.who-we-are.title': 'Who We Are',
    'home.who-we-are.description':
      'Discover the passionate community of underwater photographers who capture the hidden beauty beneath the waves. Our platform celebrates the art of marine photography, bringing together enthusiasts from around the world to share their unique perspectives of the underwater realm.',
    'home.past-contests.title': 'Past Contests',
    'home.past-contests.description':
      'Explore the extraordinary winning entries from previous years, showcasing the incredible talent and creativity of our community. Each image tells a story of patience, skill, and the magical moments captured beneath the surface.',
    'home.past-contests.button': 'View Past Winners →',
    'home.sponsors.title': 'Our Sponsors',
    'home.sponsors.description':
      "We're grateful to our incredible sponsors who make this competition possible. Their support enables us to celebrate underwater photography and provide amazing opportunities for photographers worldwide.",

    // Navbar
    'navbar.cta': 'Registration Open!',
    'navbar.register': 'Register Now',
    'navbar.discover': 'Discover the Contest',

    // Site branding
    'site.title': 'See in the Sea',
    'site.description':
      'Discover the beauty of underwater photography through our international contest showcasing the best marine life images.',

    // Actions
    'action.learn-more': 'Learn More →',

    // Categories
    'category.wide-angle': 'Wide Angle',
    'category.macro': 'Macro',
    'category.black-and-white': 'Black & White',
    'category.black-background': 'Black Background',
    'category.mediterranean': 'Mediterranean Portfolio',
    'category.storyboard': 'Storyboard',
    'category.compact': 'Compact',
    'category.molluscs': 'Molluscs',
    'category.the-sea': 'The Sea',
    'category.dan-europe-photography-security':
      'Dan Europe Photography Security',
    'category.giovanni-smorti-award': 'Giovanni Smorti Award',
    'category.seahorse': 'Seahorse',
    'category.waves': 'Waves',
    'category.newcomers': 'Newcomers',
    'category.the-professions-of-the-sea': 'The Professions of the Sea',
    'category.art-in-the-water': 'Art in the Water',
    'category.winners-only': 'Winners Only',
    'category.winner': 'Winner',

    // Contest results
    'result.first-place': 'First Place',
    'result.second-place': 'Second Place',
    'result.third-place': 'Third Place',
    'result.runner-up': 'Runner Up',
    'result.runner-ups': 'Runner Ups',

    // Anonymous author
    'author.anonymous': 'Anonymous',
    'author.by': 'by',

    // Contests page
    'contests.title': 'Contest Years',
    'contests.description':
      'Explore our annual underwater photography competitions. Each year brings together passionate photographers from around the world to showcase the incredible beauty beneath the waves.',
    'contests.no-contests': 'No Contests Available',
    'contests.check-back': 'Check back soon for upcoming competitions!',

    // About page
    'about.title': 'About Us',
    'about.section1.title': 'The Magic of Underwater Encounters',
    'about.section1.paragraph1':
      'I have asked myself... I have asked myself so many times staring in silence at this blank page...',
    'about.section1.paragraph2':
      'Fragments of blue overlap with blurred faces, the muffled echo of light bubbles, distant waves, suspended sensations that smell of sun, salt, sea water... changing colors and shapes where nothing is as it seems...',
    'about.section1.paragraph3':
      'In a now distant past I tried to tell our journey, a meeting of gazes, fused passions to create a story to tell, the thrill of an irrational vision, the magic of searching beyond the horizon...',
    'about.section2.title': 'See in the Sea UW International Photocontest',
    'about.section2.paragraph1': 'Today we write a new chapter.',
    'about.section2.paragraph2':
      'See in the Sea UW International Photocontest is a won challenge, a project that takes wind again, it is wanting to continue discovering your emotions captured in an instant of wonder, the fascination of discovering unknown seas through other eyes.',
    'about.section2.paragraph3':
      'See in the Sea lives on important skills, respect for those who choose to get involved with a smile, visceral passions expressed through unrepeatable moments...',
    'about.section3.title': '15th Edition',
    'about.section3.paragraph1':
      'We want to continue listening to your stories, being moved by the images you will choose to select, we will admire them in silence, enchanted, they will remain in our eyes forever, they will tell the Sea...',
    'about.section3.emphasis': 'a Sea for everyone...',
    'about.section3.paragraph2':
      'From here restarts the 15th edition of See in the Sea UW International Photocontest, from the hundreds of friends who have chosen us, from the thousands of photos you have given us, from the emotions we have created and you wanted to share...',
    'about.quote':
      'Give us again the wonder of this unrepeatable journey in the colors of blue.',
    'about.author': 'Paolo De Iure',
    'about.position': 'President Ortonasub',
  },
  it: {
    // Navigation
    'nav.about': 'Chi Siamo',
    'nav.contests': 'Concorsi',
    'nav.login': 'Login',
    'nav.submit': 'Invia Foto',

    // Home page sections
    'home.who-we-are.title': 'Chi Siamo',
    'home.who-we-are.description':
      "Scopri la comunità appassionata di fotografi subacquei che catturano la bellezza nascosta sotto le onde. La nostra piattaforma celebra l'arte della fotografia marina, riunendo appassionati da tutto il mondo per condividere le loro prospettive uniche del regno sottomarino.",
    'home.past-contests.title': 'Concorsi Precedenti',
    'home.past-contests.description':
      "Esplora le straordinarie opere vincitrici degli anni precedenti, che mostrano l'incredibile talento e creatività della nostra comunità. Ogni immagine racconta una storia di pazienza, abilità e momenti magici catturati sotto la superficie.",
    'home.past-contests.button': 'Vedi i Vincitori Precedenti →',
    'home.sponsors.title': 'I Nostri Sponsor',
    'home.sponsors.description':
      'Siamo grati ai nostri incredibili sponsor che rendono possibile questa competizione. Il loro supporto ci permette di celebrare la fotografia subacquea e di fornire opportunità straordinarie ai fotografi di tutto il mondo.',

    // Navbar
    'navbar.cta': 'Iscrizioni Aperte!',
    'navbar.register': 'Iscriviti Ora',
    'navbar.discover': 'Scopri il Concorso',

    // Site branding
    'site.title': 'See in the Sea',
    'site.description':
      'Scopri la bellezza della fotografia subacquea attraverso il nostro concorso internazionale che presenta le migliori immagini della vita marina.',

    // Actions
    'action.learn-more': 'Scopri di Più →',

    // Categories
    'category.wide-angle': 'Grandangolo',
    'category.macro': 'Macro',
    'category.black-and-white': 'Bianco e Nero',
    'category.black-background': 'Sfondo Nero',
    'category.mediterranean': 'Portfolio Mediterraneo',
    'category.storyboard': 'Storyboard',
    'category.compact': 'Compatta',
    'category.molluscs': 'Molluschi',
    'category.the-sea': 'Il Mare',
    'category.dan-europe-photography-security':
      'Dan Europe Photography Security',
    'category.giovanni-smorti-award': 'Premio Giovanni Smorti',
    'category.seahorse': 'Cavalluccio Marino',
    'category.waves': 'Onde',
    'category.newcomers': 'Esordienti',
    'category.the-professions-of-the-sea': 'Le Professioni del Mare',
    'category.art-in-the-water': 'Arte in Acqua',
    'category.winners-only': 'Solo Vincitori',
    'category.winner': 'Vincitore',

    // Contest results
    'result.first-place': 'Primo Posto',
    'result.second-place': 'Secondo Posto',
    'result.third-place': 'Terzo Posto',
    'result.runner-up': 'Menzione',
    'result.runner-ups': 'Menzioni',

    // Anonymous author
    'author.anonymous': 'Anonimo',
    'author.by': 'di',

    // Contests page
    'contests.title': "Albo d'oro",
    'contests.description':
      "Esplora le nostre competizioni annuali di fotografia subacquea. Ogni anno riunisce fotografi appassionati da tutto il mondo per mostrare l'incredibile bellezza sotto le onde.",
    'contests.no-contests': 'Nessun Concorso Disponibile',
    'contests.check-back': 'Torna presto per le prossime competizioni!',

    // About page
    'about.title': 'Chi Siamo',
    'about.section1.title': 'La Magia degli Incontri Sottomarini',
    'about.section1.paragraph1':
      'Me lo sono chiesto... me lo sono chiesto tante volte fissando in silenzio questo foglio bianco...',
    'about.section1.paragraph2':
      "Frammenti di blu si accavallano a volti sfumati, l'eco sopito di bolle leggere, onde lontane, sensazioni sospese profumano di sole, di sale, di acqua di Mare... colori e forme mutevoli dove nulla è come sembra...",
    'about.section1.paragraph3':
      "In un passato ormai lontano ho provato a raccontare il nostro viaggio, incontro di sguardi, passioni fuse per creare una storia da raccontare, il brivido di una visione irrazionale, la magia di cercare oltre l'orizzonte...",
    'about.section2.title': 'See in the Sea UW International Photocontest',
    'about.section2.paragraph1': 'Oggi scriviamo un nuovo capitolo.',
    'about.section2.paragraph2':
      'See in the Sea UW International Photocontest è una sfida vinta, un progetto che torna a prendere vento, è voler continuare a scoprire le vostre emozioni fermate in un istante di meraviglia, il fascino della scoperta di mari sconosciuti attraverso altri occhi.',
    'about.section2.paragraph3':
      'See in the Sea vive di competenze importanti, del rispetto verso chi sceglie di mettersi in gioco con un sorriso, passioni viscerali declinate attraverso istanti irripetibili...',
    'about.section3.title': '15ma Edizione',
    'about.section3.paragraph1':
      'Vogliamo continuare ad ascoltare le vostre storie, emozionarci per le immagini che vorrete selezionare, le ammireremo in silenzio, incantati, resteranno nei nostri occhi per sempre, racconteranno il Mare...',
    'about.section3.emphasis': 'un Mare di tutti...',
    'about.section3.paragraph2':
      'Da qui riparte la 15ma edizione di See in the Sea UW International Photocontest, dalle centinaia di amici che ci hanno scelto, dalle migliaia di foto che ci avete regalato, dalle emozioni che abbiamo creato e avete voluto condividere...',
    'about.quote':
      'Regalateci ancora la meraviglia di questo irripetibile viaggio nei colori del blu.',
    'about.author': 'Paolo De Iure',
    'about.position': 'Presidente Ortonasub',
  },
} as const;

export type TranslationKey = keyof (typeof translations)[typeof defaultLang];
