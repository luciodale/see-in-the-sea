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
  },
} as const;

export type TranslationKey = keyof (typeof translations)[typeof defaultLang];
