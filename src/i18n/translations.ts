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
    'nav.contests': 'Past Editions',
    'nav.trophy': 'Trophy',
    'nav.sponsors': 'Sponsors',
    'nav.contact': 'Contact Us',
    'nav.rules': 'Rules',
    'nav.login': 'Join the Contest',
    'nav.submissions': 'My Submissions',
    'nav.admin': 'Admin',

    // Home page sections
    'home.who-we-are.title': 'Who We Are',
    'home.who-we-are.description':
      'Discover the passionate community of underwater photographers who capture the hidden beauty beneath the waves. Our platform celebrates the art of marine photography, bringing together enthusiasts worldwide to share their unique visions of the underwater world.',
    'home.past-contests.title': 'Past Contests',
    'home.past-contests.description':
      'Explore the extraordinary winning entries from previous years, showcasing the incredible talent and creativity of our community. Each image tells a story of patience, skill, and the magical moments captured beneath the surface.',
    'home.past-contests.button': 'View Past Winners →',
    'home.sponsors.title': 'Our Sponsors',
    'home.sponsors.description':
      "We're grateful to our incredible sponsors who make this competition possible. Their support enables us to celebrate underwater photography and provide amazing opportunities for photographers worldwide.",
    'home.sponsors.button': 'See Sponsors →',

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
    'action.upload': 'Upload Photo',
    'action.upload-replacement': 'Upload Replacement',
    'action.replace': 'Replace',
    'action.delete': 'Delete',
    'action.cancel': 'Cancel',

    // Footer
    'footer.copyright': 'See in the Sea',
    'footer.quick-links': 'Quick Links',
    'footer.follow-us': 'Follow Us',
    'state.uploading': 'Uploading...',
    'state.replacing': 'Replacing...',
    'state.deleting': 'Deleting...',
    'toast.upload-success': 'Image uploaded successfully!',
    'toast.delete-success': 'Image deleted successfully!',
    'dialog.upload.title': 'Upload Complete',
    'dialog.delete.title': 'Deletion Complete',
    'dialog.upload.image': 'Image',
    'dialog.upload.titleLabel': 'Title',
    'dialog.upload.category': 'Category',
    'dialog.ok': 'OK',

    // Submissions UI
    'submissions.jury': 'Jury',
    'submissions.loading': 'Loading your submissions...',
    'submissions.closed': 'Submissions are closed for the current contest.',
    'submissions.max-size': 'Max size',
    'submissions.count-label': 'submissions',
    'form.title': 'Title',
    'form.description-optional': 'Description (optional)',
    'form.choose-file': 'Choose file',
    'form.no-file-chosen': 'No file chosen',

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
    'category.winner': 'First Place',

    // Contest results
    'result.first-place': 'First Place',
    'result.second-place': 'Second Place',
    'result.third-place': 'Third Place',
    'result.runner-up': 'Runner Up',
    'result.runner-ups': 'Runners Up',

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
      'I have asked myself so many times, staring in silence at this blank page...',
    'about.section1.paragraph2':
      'Fragments of blue overlap with blurred faces, the muffled echo of light bubbles, distant waves, suspended sensations scented with sun, salt, and seawater... shifting colors and shapes where nothing is as it seems...',
    'about.section1.paragraph3':
      'In a now distant past I tried to tell our journey, a meeting of gazes, fused passions to create a story to tell, the thrill of an irrational vision, the magic of searching beyond the horizon...',
    'about.section2.title': 'See in the Sea UW International Photocontest',
    'about.section2.paragraph1': 'Today we write a new chapter.',
    'about.section2.paragraph2':
      'See in the Sea UW International Photocontest is a challenge fulfilled, a project that takes wind again. It seeks to continue discovering your emotions captured in an instant of wonder, the fascination of exploring unknown seas through other eyes.',
    'about.section2.paragraph3':
      'See in the Sea lives on important skills, respect for those who choose to get involved with a smile, visceral passions expressed through unrepeatable moments...',
    'about.section3.title': '15th Edition',
    'about.section3.paragraph1':
      'We want to continue listening to your stories, being moved by the images you choose to share. We will admire them in silence, enchanted; they will remain in our eyes forever, telling the story of the Sea...',
    'about.section3.emphasis': 'a Sea for everyone...',
    'about.section3.paragraph2':
      'From here restarts the 15th edition of See in the Sea UW International Photocontest, from the hundreds of friends who have chosen us, from the thousands of photos you have given us, from the emotions we have created and you wanted to share...',
    'about.quote':
      'Give us again the wonder of this unrepeatable journey in the colors of blue.',
    'about.author': 'Paolo De Iure',
    'about.position': 'President Ortonasub',

    // Sponsors page
    'sponsors.title': 'Our Sponsors',
    'sponsors.subtitle': 'Supporting Underwater Photography Excellence',
    'sponsors.coming-soon.title': 'Sponsors Coming Soon',
    'sponsors.coming-soon.description':
      'We are currently working with amazing partners to support the UW 2025 contest. Stay tuned for exciting announcements!',
    'sponsors.coming-soon.contest': 'UW 2025 Contest',
    'sponsors.coming-soon.cta': 'Become a Sponsor',
    'sponsors.coming-soon.contact':
      'Contact us to learn more about sponsorship opportunities',

    // Trophy page
    'trophy.title': 'Sculpture "Click Fish"',
    'trophy.description':
      'The upper part of the work, a visual translation of the waves, suggests shifting attention beneath the surface of the water. There, among seaweed and corals, or hidden in an inlet, a fish gazes back at us, almost hypnotized. Yet the viewer, just like a photographer, can only "capture" its image. Trapped by the lens, the circularity of the sculpture and the grooves traced within it appear, while the subject remains free. Thus, the physical void is replaced by memory, or by a photograph.',
    'trophy.description-title': 'Description',
    'trophy.artist-title': 'Artist',
    'trophy.artist-description':
      'Valter Polleggioni was born in 1957 in Ortona, where he lives and has worked as a sculptor since 1984. To learn more visit his page.',
    'trophy.artist-cta': 'Learn more',

    // Contact page
    'contact.organization': 'ASD Ortona Sub APS',
    'contact.address': 'Address',
    'contact.address-details':
      'C/o Palazzetto dello sport – Via Giovanni XXIII – 66026 – Ortona (CH)',
    'contact.president': 'President Ortona Sub',
    'contact.technical-director': 'Technical Director',
    'contact.administrative-secretary': 'Administrative Secretary',
  },

  it: {
    // Navigation
    'nav.about': 'Chi Siamo',
    'nav.contests': 'Edizioni Precedenti',
    'nav.trophy': 'Trofeo',
    'nav.sponsors': 'Sponsor',
    'nav.contact': 'Contatti',
    'nav.rules': 'Regolamento',
    'nav.login': 'Partecipa al Concorso',
    'nav.submissions': 'Le mie candidature',
    'nav.admin': 'Admin',

    // Home page sections
    'home.who-we-are.title': 'Chi Siamo',
    'home.who-we-are.description':
      "Scopri la comunità appassionata di fotografi subacquei che catturano la bellezza nascosta sotto le onde. La nostra piattaforma celebra l'arte della fotografia marina, riunendo appassionati da tutto il mondo per condividere le loro prospettive uniche del mondo sottomarino.",
    'home.past-contests.title': 'Edizioni Precedenti',
    'home.past-contests.description':
      "Esplora le straordinarie opere vincitrici degli anni precedenti, che mostrano l'incredibile talento e creatività della nostra comunità. Ogni immagine racconta una storia di pazienza, abilità e momenti magici catturati sotto la superficie.",
    'home.past-contests.button': 'Vedi i Vincitori Precedenti →',
    'home.sponsors.title': 'I Nostri Sponsor',
    'home.sponsors.description':
      'Siamo grati ai nostri straordinari sponsor che rendono possibile questa competizione. Il loro supporto ci permette di celebrare la fotografia subacquea e di offrire opportunità eccezionali ai fotografi di tutto il mondo.',
    'home.sponsors.button': 'Vedi Sponsor →',

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
    'action.upload': 'Carica Foto',
    'action.upload-replacement': 'Carica Sostituzione',
    'action.replace': 'Sostituisci',
    'action.delete': 'Elimina',
    'action.cancel': 'Annulla',

    // Footer
    'footer.copyright': 'See in the Sea',
    'footer.quick-links': 'Link Rapidi',
    'footer.follow-us': 'Seguici',
    'state.uploading': 'Caricamento...',
    'state.replacing': 'Sostituzione...',
    'state.deleting': 'Eliminazione...',
    'toast.upload-success': 'Immagine caricata con successo!',
    'toast.delete-success': 'Immagine eliminata con successo!',
    'dialog.upload.title': 'Caricamento Completato',
    'dialog.delete.title': 'Eliminazione Completata',
    'dialog.upload.image': 'Immagine',
    'dialog.upload.titleLabel': 'Titolo',
    'dialog.upload.category': 'Categoria',
    'dialog.ok': 'OK',

    // Submissions UI
    'submissions.jury': 'Giuria',
    'submissions.loading': 'Caricamento delle tue candidature...',
    'submissions.closed':
      'Le candidature sono chiuse per il concorso corrente.',
    'submissions.max-size': 'Dimensione massima',
    'submissions.count-label': 'candidature',
    'form.title': 'Titolo',
    'form.description-optional': 'Descrizione (opzionale)',
    'form.choose-file': 'Scegli file',
    'form.no-file-chosen': 'Nessun file selezionato',

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
    'category.winner': 'Primo Classificato',

    // Contest results
    'result.first-place': 'Primo Classificato',
    'result.second-place': 'Secondo Classificato',
    'result.third-place': 'Terzo Classificato',
    'result.runner-up': 'Menzione',
    'result.runner-ups': 'Menzioni',

    // Anonymous author
    'author.anonymous': 'Anonimo',
    'author.by': 'di',

    // Contests page
    'contests.title': 'Edizioni Precedenti',
    'contests.description':
      "Esplora le nostre competizioni annuali di fotografia subacquea. Ogni anno riunisce fotografi appassionati da tutto il mondo per mostrare l'incredibile bellezza sotto le onde.",
    'contests.no-contests': 'Nessun Concorso Disponibile',
    'contests.check-back': 'Torna presto per le prossime competizioni!',

    // About page
    'about.title': 'Chi Siamo',
    'about.section1.title': 'La Magia degli Incontri Sottomarini',
    'about.section1.paragraph1':
      'Me lo sono chiesto tante volte, fissando in silenzio questo foglio bianco...',
    'about.section1.paragraph2':
      "Frammenti di blu si accavallano a volti sfumati, l'eco sopito di bolle leggere, onde lontane, sensazioni sospese che profumano di sole, sale, acqua di mare... colori e forme mutevoli dove nulla è come sembra...",
    'about.section1.paragraph3':
      "In un passato ormai lontano ho provato a raccontare il nostro viaggio, incontro di sguardi, passioni fuse per creare una storia, il brivido di una visione irrazionale, la magia di cercare oltre l'orizzonte...",
    'about.section2.title': 'See in the Sea UW International Photocontest',
    'about.section2.paragraph1': 'Oggi scriviamo un nuovo capitolo.',
    'about.section2.paragraph2':
      'See in the Sea UW International Photocontest è una sfida vinta, un progetto che torna a prendere vento. Vuole continuare a scoprire le vostre emozioni fermate in un istante di meraviglia, il fascino di mari sconosciuti visti attraverso altri occhi.',
    'about.section2.paragraph3':
      'See in the Sea vive di competenze importanti, del rispetto verso chi sceglie di mettersi in gioco con un sorriso, passioni viscerali espresse attraverso istanti irripetibili...',
    'about.section3.title': '15ª Edizione',
    'about.section3.paragraph1':
      'Vogliamo continuare ad ascoltare le vostre storie, emozionarci con le immagini che vorrete condividere. Le ammireremo in silenzio, incantati, resteranno nei nostri occhi per sempre e racconteranno il Mare...',
    'about.section3.emphasis': 'un Mare di tutti...',
    'about.section3.paragraph2':
      'Da qui riparte la 15ª edizione di See in the Sea UW International Photocontest, dalle centinaia di amici che ci hanno scelto, dalle migliaia di foto che ci avete donato, dalle emozioni che abbiamo creato e che avete voluto condividere...',
    'about.quote':
      'Regalateci ancora la meraviglia di questo irripetibile viaggio nei colori del blu.',
    'about.author': 'Paolo De Iure',
    'about.position': 'Presidente Ortonasub',

    // Sponsors page
    'sponsors.title': 'I Nostri Sponsor',
    'sponsors.subtitle':
      "A sostegno dell'eccellenza nella fotografia subacquea",
    'sponsors.coming-soon.title': 'Sponsor in Arrivo',
    'sponsors.coming-soon.description':
      'Stiamo lavorando con partner straordinari per supportare il concorso UW 2025. Restate sintonizzati per annunci emozionanti!',
    'sponsors.coming-soon.contest': 'Concorso UW 2025',
    'sponsors.coming-soon.cta': 'Diventa Sponsor',
    'sponsors.coming-soon.contact':
      'Contattaci per saperne di più sulle opportunità di sponsorizzazione',

    // Trophy page
    'trophy.title': 'Scultura "Click Fish"',
    'trophy.description':
      "La parte superiore dell'opera, traduzione visiva dei flutti, suggerisce di spostare l'attenzione sotto la superficie dell'acqua. Qui, tra alghe e coralli o nascosto in un'insenatura, un pesce ci osserva ipnotizzato. Eppure lo spettatore, proprio come farebbe un fotografo, può solo 'trattenerne' l'immagine. Intrappolato dall'obiettivo, compaiono la circolarità della scultura e i solchi tracciati al suo interno, mentre il soggetto resta libero. Così, al vuoto fisico si sostituisce il ricordo o la fotografia.",
    'trophy.description-title': 'Descrizione',
    'trophy.artist-title': 'Artista',
    'trophy.artist-description':
      'Valter Polleggioni è nato nel 1957 a Ortona, dove vive e lavora come scultore dal 1984. Per saperne di più visita la sua pagina.',
    'trophy.artist-cta': 'Scopri di più',

    // Contact page
    'contact.organization': 'ASD Ortona Sub APS',
    'contact.address': 'Sede',
    'contact.address-details':
      'C/o Palazzetto dello sport – Via Giovanni XXIII – 66026 – Ortona (CH)',
    'contact.president': 'Presidente Ortona Sub',
    'contact.technical-director': 'Direttore Tecnico',
    'contact.administrative-secretary': 'Segreteria Amministrativa',
  },
} as const;

export type TranslationKey = keyof (typeof translations)[typeof defaultLang];
