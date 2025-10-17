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
    'nav.submissions': 'My Photos',
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
    'action.upload-picture': 'Upload Picture',
    'action.replace': 'Replace',
    'action.delete': 'Delete',
    'action.manage': 'Manage',
    'action.cancel': 'Cancel',
    'action.close': 'Close',
    'action.click-to-manage': 'Click to manage',
    'action.print': 'Print',

    // Footer
    'footer.copyright': 'See in the Sea',
    'footer.quick-links': 'Quick Links',
    'footer.follow-us': 'Follow Us',
    'state.uploading': 'Uploading...',
    'state.replacing': 'Replacing...',
    'state.deleting': 'Deleting...',
    'state.loading': 'Loading...',
    'upload.processing-large-file': 'Processing large file, please wait...',
    'modal.please-wait': 'Please wait...',
    'toast.upload-success': 'Image uploaded successfully!',
    'toast.delete-success': 'Image deleted successfully!',
    'dialog.upload.title': 'Upload Complete',
    'dialog.delete.title': 'Deletion Complete',
    'dialog.upload.image': 'Image',
    'dialog.upload.titleLabel': 'Title',
    'dialog.upload.category': 'Category',
    'dialog.ok': 'OK',
    'modal.upload.title': 'Upload Photo',
    'modal.submission.title': 'Manage Submission',
    'modal.delete.confirm': 'Are you sure you want to delete this submission?',

    // Submissions UI
    'submissions.jury': 'Jury',
    'submissions.technical-director': 'Technical Director',
    'submissions.loading': 'Loading your submissions...',
    'submissions.closed': 'Submissions are closed for the current contest.',
    'submissions.max-size': 'Max size',
    'submissions.count-label': 'submissions',
    'submissions.no-pictures-uploaded': 'No pictures uploaded yet',
    'submissions.pictures-uploaded': 'picture(s) uploaded',
    'submissions.category-complete':
      'Category complete - maximum submissions reached',
    'submissions.category-complete-description':
      'Maximum submissions reached for this category',
    'submissions.your-pictures': 'Your pictures',
    'submissions.success-received': '✓ Picture Successfully Received!',
    'submissions.success-description':
      'Your photo has been uploaded and is ready for the contest',

    // Portfolio and photo types
    'portfolio.title': 'Portfolio',
    'portfolio.complete': 'Complete',
    'portfolio.photos-count': 'photos',
    'photo-type.macro': 'Macro',
    'photo-type.wide-angle': 'Wide Angle',
    'photo-type.free': 'Free Choice',
    'image-status.empty': 'Empty',
    'image-status.uploaded': 'Uploaded',

    // Mediterranean instructions
    'mediterranean.instructions.title': 'Instructions:',
    'mediterranean.instructions.content':
      'Click on any empty photo slot to upload. To replace a photo, first delete it using the manage button, then upload a new one. Each portfolio must include exactly one Macro, one Wide Angle, and one Free Choice photo. You can upload up to',
    'mediterranean.instructions.portfolios': 'complete portfolios',
    'mediterranean.instructions.photos-total': 'photos total',

    'form.title': 'Title',
    'form.title-placeholder': 'Enter a title for your photo',
    'form.description-optional': 'Description (optional)',
    'form.description-placeholder': 'Describe your photo (optional)',
    'form.choose-file': 'Choose file',
    'form.no-file-chosen': 'No file chosen',
    'form.file-too-large': 'File size exceeds the maximum allowed size',

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
    'result.first-place': 'Gold',
    'result.second-place': 'Silver',
    'result.third-place': 'Bronze',
    'result.runner-up': 'Runner Up',
    'result.runner-ups': 'Runners Up',

    // Rank translations
    'rank.first': 'Winner',
    'rank.second': 'Runner Up',
    'rank.third': 'Third Place',
    'rank.runner-up': 'Honorable Mention',

    // Anonymous author
    'author.anonymous': 'Anonymous',
    'author.by': 'by',

    // Contests page
    'contests.title': 'Contest Years',
    'contests.description': 'Explore the winners of the past contests',
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
    'sponsors.become-sponsor': 'Become a Sponsor',
    'sponsors.contact':
      'Contact us to learn more about sponsorship opportunities',

    // Trophy page
    'trophy.title': 'Sculpture "Click Fish"',
    'trophy.description':
      'The upper part of the work, a visual translation of the waves, suggests shifting attention beneath the surface of the water. There, among seaweed and corals, or hidden in an inlet, a fish gazes back at us, almost hypnotized. Yet the viewer, just like a photographer, can only "capture" its image. Trapped by the lens, the circularity of the sculpture and the grooves traced within it appear, while the subject remains free. Thus, the physical void is replaced by memory, or by a photograph.',
    'trophy.description-intro':
      'Sculpture in reconstructed marble and metal, created exclusively for the ASD Ortona Sub APS Association on the occasion of the See in the Sea Underwater Photocontest; limited edition of 100 numbered pieces from 1/100 to 100/100.',
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
    'contact.web-master': 'Web Master',

    // Authentication
    'auth.choice.title': 'Welcome to See in the Sea',
    'auth.choice.subtitle': 'Join our underwater photography contest',
    'auth.choice.login': 'Sign In',
    'auth.choice.signup': 'Create Account',
    'auth.choice.existing-account': 'Already have an account?',

    'auth.login.title': 'Sign In',
    'auth.login.subtitle': 'Access your photo submissions',
    'auth.login.email': 'Email',
    'auth.login.email-placeholder': 'Enter your email address',
    'auth.login.password': 'Password',
    'auth.login.password-placeholder': 'Enter your password',
    'auth.login.submit': 'Sign In',
    'auth.login.submitting': 'Signing in...',
    'auth.login.back': 'Back to options',

    'auth.signup.title': 'Create Account',
    'auth.signup.first-name': 'First Name',
    'auth.signup.first-name-placeholder': 'Enter your first name',
    'auth.signup.last-name': 'Last Name',
    'auth.signup.last-name-placeholder': 'Enter your last name',
    'auth.signup.email': 'Email',
    'auth.signup.email-placeholder': 'Enter your email address',
    'auth.signup.password': 'Password',
    'auth.signup.password-placeholder': 'Create a password',
    'auth.signup.confirm-password': 'Confirm Password',
    'auth.signup.confirm-password-placeholder': 'Confirm your password',
    'auth.signup.submit': 'Create Account',
    'auth.signup.submitting': 'Creating account...',
    'auth.signup.back': 'Back to options',
    'auth.signup.passwords-no-match': 'Passwords do not match',
    'auth.signup.password-too-short':
      'Password must be at least 8 characters long',
    'auth.signup.email-verification':
      'Please check your email and verify your account to complete registration.',

    'auth.verify.title': 'Verify Your Email',
    'auth.verify.subtitle': 'Enter the verification code sent to your email',
    'auth.verify.instructions':
      'We sent a 6-digit verification code to your email address. Please check your inbox and enter the code below.',
    'auth.verify.code': 'Verification Code',
    'auth.verify.code-placeholder': 'Enter 6-digit code',
    'auth.verify.submit': 'Verify Email',
    'auth.verify.submitting': 'Verifying...',
    'auth.verify.back': 'Back to signup',

    'auth.reset.forgot-password': 'Forgot your password?',
    'auth.reset.title': 'Reset Password',
    'auth.reset.subtitle': 'Enter your email to receive a reset code',
    'auth.reset.instructions':
      "We'll send a verification code to your email address to reset your password.",
    'auth.reset.email': 'Email',
    'auth.reset.email-placeholder': 'Enter your email address',
    'auth.reset.send-code': 'Send Reset Code',
    'auth.reset.sending': 'Sending...',
    'auth.reset.back': 'Back to login',
    'auth.reset.code-sent': 'Reset code sent to your email',

    'auth.reset-verify.title': 'Enter Reset Code',
    'auth.reset-verify.subtitle': 'Check your email for the verification code',
    'auth.reset-verify.instructions':
      'Enter the verification code we sent to your email along with your new password.',
    'auth.reset-verify.code': 'Verification Code',
    'auth.reset-verify.code-placeholder': 'Enter verification code',
    'auth.reset-verify.new-password': 'New Password',
    'auth.reset-verify.new-password-placeholder': 'Enter your new password',
    'auth.reset-verify.confirm-password': 'Confirm New Password',
    'auth.reset-verify.confirm-password-placeholder':
      'Confirm your new password',
    'auth.reset-verify.submit': 'Reset Password',
    'auth.reset-verify.submitting': 'Resetting password...',
    'auth.reset-verify.back': 'Back to reset',
    'auth.reset-verify.passwords-no-match': 'Passwords do not match',

    'auth.logout': 'Sign Out',
    'auth.signup.registration-incomplete':
      'Please complete the registration process.',
    'auth.verify.failed':
      'Verification failed. Please check your code and try again.',

    // Payment
    'payment.title': 'Complete Your Entry',
    'payment.single-category': 'Single Category Entry',
    'payment.multiple-categories': 'Multiple Categories Entry',
    'payment.categories-submitted':
      '{count} {count, plural, one {category} other {categories}} submitted',
    'payment.pay-now': 'Pay Now',
    'payment.processing': 'Processing...',
    'payment.secure-payment': 'Secure payment powered by Stripe',
    'payment.ready-to-pay':
      'Your photos are ready! Complete your submission by making payment.',
    'payment.no-submissions-title': 'No Submissions Yet',
    'payment.no-submissions-desc':
      'Submit to at least one category before making payment',
    'payment.success.title': 'Payment Successful!',
    'payment.success.message':
      'Your contest entry has been successfully processed.',
    'payment.success.next-steps':
      'You will receive a confirmation email shortly. Good luck with the contest!',
    'payment.success.back-to-submissions': 'Back to My Submissions',
    'payment.cancelled.title': 'Payment Cancelled',
    'payment.cancelled.message':
      'Your payment was cancelled. No charges have been made.',
    'payment.cancelled.try-again':
      'You can try again anytime from your submissions page.',
    'payment.cancelled.back-to-submissions': 'Back to My Submissions',
    'payment.submissions-locked': 'Submissions locked after payment',
    'payment.warning.title': 'Final Step: Payment',
    'payment.warning.message':
      'Once you complete payment, you will not be able to make any more edits to your submissions.',
    'payment.back-to-submissions': '← Back to submissions',

    // Patrocini
    'patrocini.title': 'With the high patronage of:',
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
    'nav.submissions': 'Le mie foto',
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
    'action.upload-picture': 'Carica Foto',
    'action.replace': 'Sostituisci',
    'action.delete': 'Elimina',
    'action.manage': 'Gestisci',
    'action.cancel': 'Annulla',
    'action.close': 'Chiudi',
    'action.click-to-manage': 'Clicca per gestire',
    'action.print': 'Stampa',

    // Footer
    'footer.copyright': 'See in the Sea',
    'footer.quick-links': 'Link Rapidi',
    'footer.follow-us': 'Seguici',
    'state.uploading': 'Caricamento...',
    'state.replacing': 'Sostituzione...',
    'state.deleting': 'Eliminazione...',
    'state.loading': 'Caricamento...',
    'upload.processing-large-file':
      'Elaborazione file di grandi dimensioni, attendere...',
    'modal.please-wait': 'Attendere...',
    'toast.upload-success': 'Immagine caricata con successo!',
    'toast.delete-success': 'Immagine eliminata con successo!',
    'dialog.upload.title': 'Caricamento Completato',
    'dialog.delete.title': 'Eliminazione Completata',
    'dialog.upload.image': 'Immagine',
    'dialog.upload.titleLabel': 'Titolo',
    'dialog.upload.category': 'Categoria',
    'dialog.ok': 'OK',
    'modal.upload.title': 'Carica Foto',
    'modal.submission.title': 'Gestisci Candidatura',
    'modal.delete.confirm': 'Sei sicuro di voler eliminare questa candidatura?',

    // Submissions UI
    'submissions.jury': 'Giuria',
    'submissions.technical-director': 'Direttore Tecnico',
    'submissions.loading': 'Caricamento delle tue candidature...',
    'submissions.closed':
      'Le candidature sono chiuse per il concorso corrente.',
    'submissions.max-size': 'Dimensione massima',
    'submissions.count-label': 'candidature',
    'submissions.no-pictures-uploaded': 'Nessuna foto caricata ancora',
    'submissions.pictures-uploaded': 'foto caricate',
    'submissions.category-complete':
      'Categoria completa - massimo numero di candidature raggiunto',
    'submissions.category-complete-description':
      'Massimo numero di candidature raggiunto per questa categoria',
    'submissions.your-pictures': 'Le tue foto',
    'submissions.success-received': '✓ Foto Ricevuta con Successo!',
    'submissions.success-description':
      'La tua foto è stata caricata ed è pronta per il concorso',

    // Portfolio and photo types
    'portfolio.title': 'Portfolio',
    'portfolio.complete': 'Completo',
    'portfolio.photos-count': 'foto',
    'photo-type.macro': 'Macro',
    'photo-type.wide-angle': 'Grandangolo',
    'photo-type.free': 'Libera Scelta',
    'image-status.empty': 'Vuoto',
    'image-status.uploaded': 'Caricato',

    // Mediterranean instructions
    'mediterranean.instructions.title': 'Istruzioni:',
    'mediterranean.instructions.content':
      'Clicca su qualsiasi slot foto vuoto per caricare. Per sostituire una foto, prima eliminarla usando il pulsante gestisci, poi caricarne una nuova. Ogni portfolio deve includere esattamente una Macro, una Grandangolo e una Libera Scelta. Puoi caricare fino a',
    'mediterranean.instructions.portfolios': 'portfolio completi',
    'mediterranean.instructions.photos-total': 'foto totali',

    'form.title': 'Titolo',
    'form.title-placeholder': 'Inserisci un titolo per la tua foto',
    'form.description-optional': 'Descrizione (opzionale)',
    'form.description-placeholder': 'Descrivi la tua foto (opzionale)',
    'form.choose-file': 'Scegli file',
    'form.no-file-chosen': 'Nessun file selezionato',
    'form.file-too-large': 'La dimensione del file supera il limite consentito',

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
    'result.first-place': 'Oro',
    'result.second-place': 'Argento',
    'result.third-place': 'Bronzo',
    'result.runner-up': 'Menzione',
    'result.runner-ups': 'Menzioni',

    // Rank translations
    'rank.first': 'Oro',
    'rank.second': 'Argento',
    'rank.third': 'Bronzo',
    'rank.runner-up': "Menzione d'Onore",

    // Anonymous author
    'author.anonymous': 'Anonimo',
    'author.by': 'di',

    // Contests page
    'contests.title': 'Edizioni Precedenti',
    'contests.description': "Esplora l'albo d'oro dei contest",
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
    'sponsors.become-sponsor': 'Diventa Sponsor',
    'sponsors.contact':
      'Contattaci per saperne di più sulle opportunità di sponsorizzazione',

    // Trophy page
    'trophy.title': 'Scultura "Click Fish"',
    'trophy.description':
      "La parte superiore dell'opera, traduzione visiva dei flutti, suggerisce di spostare l'attenzione sotto la superficie dell'acqua. Qui, tra alghe e coralli o nascosto in un'insenatura, un pesce ci osserva ipnotizzato. Eppure lo spettatore, proprio come farebbe un fotografo, può solo 'trattenerne' l'immagine. Intrappolato dall'obiettivo, compaiono la circolarità della scultura e i solchi tracciati al suo interno, mentre il soggetto resta libero. Così, al vuoto fisico si sostituisce il ricordo o la fotografia.",
    'trophy.description-intro':
      "Scultura in marmo ricostruito e metallo, realizzata in esclusiva per l'Associazione ASD Ortona Sub ASP in occasione del concorso See in the Sea Underwater Photocontest; tirata in 100 esemplari numerati da 1/100 a 100/100.",
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
    'contact.web-master': 'Web Master',

    // Authentication
    'auth.choice.title': 'Benvenuti a See in the Sea',
    'auth.choice.subtitle':
      'Unisciti al nostro concorso di fotografia subacquea',
    'auth.choice.login': 'Accedi',
    'auth.choice.signup': 'Crea Account',
    'auth.choice.existing-account': 'Hai già un account?',

    'auth.login.title': 'Accedi',
    'auth.login.subtitle': 'Accedi alle tue foto',
    'auth.login.email': 'Email',
    'auth.login.email-placeholder': 'Inserisci il tuo indirizzo email',
    'auth.login.password': 'Password',
    'auth.login.password-placeholder': 'Inserisci la tua password',
    'auth.login.submit': 'Accedi',
    'auth.login.submitting': 'Accesso in corso...',
    'auth.login.back': 'Torna alle opzioni',

    'auth.signup.title': 'Crea Account',
    'auth.signup.first-name': 'Nome',
    'auth.signup.first-name-placeholder': 'Inserisci il tuo nome',
    'auth.signup.last-name': 'Cognome',
    'auth.signup.last-name-placeholder': 'Inserisci il tuo cognome',
    'auth.signup.email': 'Email',
    'auth.signup.email-placeholder': 'Inserisci il tuo indirizzo email',
    'auth.signup.password': 'Password',
    'auth.signup.password-placeholder': 'Crea una password',
    'auth.signup.confirm-password': 'Conferma Password',
    'auth.signup.confirm-password-placeholder': 'Conferma la tua password',
    'auth.signup.submit': 'Crea Account',
    'auth.signup.submitting': 'Creazione account...',
    'auth.signup.back': 'Torna alle opzioni',
    'auth.signup.passwords-no-match': 'Le password non corrispondono',
    'auth.signup.password-too-short':
      'La password deve essere di almeno 8 caratteri',
    'auth.signup.email-verification':
      'Controlla la tua email e verifica il tuo account per completare la registrazione.',

    'auth.verify.title': 'Verifica la tua Email',
    'auth.verify.subtitle':
      'Inserisci il codice di verifica inviato alla tua email',
    'auth.verify.instructions':
      'Abbiamo inviato un codice di verifica a 6 cifre al tuo indirizzo email. Controlla la tua casella di posta e inserisci il codice qui sotto.',
    'auth.verify.code': 'Codice di Verifica',
    'auth.verify.code-placeholder': 'Inserisci codice a 6 cifre',
    'auth.verify.submit': 'Verifica Email',
    'auth.verify.submitting': 'Verifica in corso...',
    'auth.verify.back': 'Torna alla registrazione',

    'auth.reset.forgot-password': 'Hai dimenticato la password?',
    'auth.reset.title': 'Reimposta Password',
    'auth.reset.subtitle':
      'Inserisci la tua email per ricevere un codice di reset',
    'auth.reset.instructions':
      'Ti invieremo un codice di verifica al tuo indirizzo email per reimpostare la password.',
    'auth.reset.email': 'Email',
    'auth.reset.email-placeholder': 'Inserisci il tuo indirizzo email',
    'auth.reset.send-code': 'Invia Codice Reset',
    'auth.reset.sending': 'Invio in corso...',
    'auth.reset.back': 'Torna al login',
    'auth.reset.code-sent': 'Codice di reset inviato alla tua email',

    'auth.reset-verify.title': 'Inserisci Codice Reset',
    'auth.reset-verify.subtitle':
      'Controlla la tua email per il codice di verifica',
    'auth.reset-verify.instructions':
      'Inserisci il codice di verifica che ti abbiamo inviato via email insieme alla tua nuova password.',
    'auth.reset-verify.code': 'Codice di Verifica',
    'auth.reset-verify.code-placeholder': 'Inserisci il codice di verifica',
    'auth.reset-verify.new-password': 'Nuova Password',
    'auth.reset-verify.new-password-placeholder':
      'Inserisci la tua nuova password',
    'auth.reset-verify.confirm-password': 'Conferma Nuova Password',
    'auth.reset-verify.confirm-password-placeholder':
      'Conferma la tua nuova password',
    'auth.reset-verify.submit': 'Reimposta Password',
    'auth.reset-verify.submitting': 'Reimpostazione password...',
    'auth.reset-verify.back': 'Torna al reset',
    'auth.reset-verify.passwords-no-match': 'Le password non corrispondono',

    'auth.logout': 'Disconnetti',
    'auth.signup.registration-incomplete':
      'Completa il processo di registrazione.',
    'auth.verify.failed': 'Verifica fallita. Controlla il codice e riprova.',

    // Payment
    'payment.title': 'Completa la tua Iscrizione',
    'payment.single-category': 'Iscrizione Singola Categoria',
    'payment.multiple-categories': 'Iscrizione Categorie Multiple',
    'payment.categories-submitted':
      '{count} {count, plural, one {categoria} other {categorie}} inviate',
    'payment.pay-now': 'Paga Ora',
    'payment.processing': 'Elaborazione...',
    'payment.secure-payment': 'Pagamento sicuro tramite Stripe',
    'payment.ready-to-pay':
      'Le tue foto sono pronte! Completa la tua iscrizione effettuando il pagamento.',
    'payment.no-submissions-title': 'Nessuna Candidatura Ancora',
    'payment.no-submissions-desc':
      'Invia almeno una candidatura prima di effettuare il pagamento',
    'payment.success.title': 'Pagamento Riuscito!',
    'payment.success.message':
      'La tua iscrizione al concorso è stata elaborata con successo.',
    'payment.success.next-steps':
      "Riceverai un'email di conferma a breve. In bocca al lupo per il concorso!",
    'payment.success.back-to-submissions': 'Torna alle Mie Candidature',
    'payment.cancelled.title': 'Pagamento Annullato',
    'payment.cancelled.message':
      'Il tuo pagamento è stato annullato. Non sono stati effettuati addebiti.',
    'payment.cancelled.try-again':
      'Puoi riprovare in qualsiasi momento dalla pagina delle tue candidature.',
    'payment.cancelled.back-to-submissions': 'Torna alle Mie Candidature',
    'payment.submissions-locked': 'Candidature bloccate dopo il pagamento',
    'payment.warning.title': 'Passo Finale: Pagamento',
    'payment.warning.message':
      'Una volta completato il pagamento, non potrai più modificare le tue candidature.',
    'payment.back-to-submissions': '← Torna alle candidature',

    // Patrocini
    'patrocini.title': "Con l'alto patrocinio di:",
  },
} as const;

export type TranslationKey = keyof (typeof translations)[typeof defaultLang];
