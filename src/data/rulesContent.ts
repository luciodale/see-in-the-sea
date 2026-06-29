import type { Language } from '@/i18n/translations';

/**
 * Structured, presentation-agnostic content for the 2026 (17th edition)
 * contest regulations. Source of truth: the official Italian "Regolamento
 * 2026 — 17ª edizione". The English is a faithful translation of that source.
 *
 * Icons, layout and interactions live in the page component — this module is
 * text only, so the same data can be rendered in any treatment and stays easy
 * to proofread against the original document.
 */

export type RulesBlock =
  | { kind: 'paragraph'; text: string }
  | { kind: 'list'; ordered?: boolean; items: string[] }
  | { kind: 'note'; label: string; text: string; tone?: 'info' | 'warning' };

export type RulesCategory = {
  id: string;
  name: string;
  description: string;
};

export type RulesFact = {
  id: string;
  label: string;
  value: string;
  detail: string;
};

export type RulesArticle = {
  id: string;
  number: string;
  title: string;
  pullQuote?: string;
  blocks: RulesBlock[];
};

export type RulesSection = {
  id: string;
  eyebrow: string;
  title: string;
  blocks: RulesBlock[];
};

export type RulesContact = {
  org: string;
  addressLines: string[];
  phones: { label: string; href: string }[];
  email: string;
  website: { label: string; href: string };
};

export type RulesNavItem = { id: string; label: string };

export type RulesContent = {
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    edition: string;
    intro: string;
  };
  nav: { label: string; items: RulesNavItem[] };
  categories: {
    id: string;
    eyebrow: string;
    title: string;
    intro: string;
    items: RulesCategory[];
    director: { label: string; value: string };
    jury: { label: string; value: string };
  };
  keyFacts: {
    id: string;
    eyebrow: string;
    title: string;
    facts: RulesFact[];
  };
  timeline: {
    eyebrow: string;
    title: string;
    nodes: { id: string; date: string; label: string }[];
  };
  rules: {
    id: string;
    eyebrow: string;
    title: string;
    intro: string;
    items: RulesArticle[];
  };
  sections: RulesSection[];
  prizeHighlights: { id: string; label: string }[];
  legal: {
    id: string;
    eyebrow: string;
    title: string;
    summary: string;
    items: RulesSection[];
  };
  contact: {
    id: string;
    eyebrow: string;
    title: string;
    card: RulesContact;
  };
  ui: {
    articleLabel: string;
    expand: string;
    backToTop: string;
  };
};

const en: RulesContent = {
  hero: {
    eyebrow: 'Regulations',
    title: 'See in the Sea',
    subtitle: 'International Underwater Photocontest OrtonaMare 2026',
    edition: '17th Edition · 2026',
    intro:
      'The Contest is open to all underwater photographers and is free-themed. It is organised across the following sections.',
  },
  nav: {
    label: 'On this page',
    items: [
      { id: 'categories', label: 'Categories' },
      { id: 'key-facts', label: 'At a Glance' },
      { id: 'rules', label: 'Rules' },
      { id: 'ceremony', label: 'Ceremony' },
      { id: 'rankings', label: 'Rankings' },
      { id: 'prizes', label: 'Prizes' },
      { id: 'copyright', label: 'Copyright' },
      { id: 'legal', label: 'Privacy' },
      { id: 'contact', label: 'Contacts' },
    ],
  },
  categories: {
    id: 'categories',
    eyebrow: 'Competition Sections',
    title: 'Categories',
    intro:
      'Five sections, each judged on its own merits. Pick where your images belong — the same photo cannot be entered in more than one section.',
    items: [
      {
        id: 'wide-angle',
        name: 'Wide Angle (WA)',
        description:
          'The colour image must depict the underwater environment or the species that inhabit it through the use of wide-angle lenses or add-ons. Wide shots and backlighting are allowed, and human presence may be included as a complementary element. The photographer is free to interpret the theme according to their own compositional taste, using any technique. Split-shot (over/under) images are also permitted, provided the underwater portion is no less than 50%.',
      },
      {
        id: 'macro',
        name: 'Macro',
        description:
          'The colour image must capture entire aquatic subjects or details of subjects or underwater life that reveal the finest aesthetic taste through composition and colour. Images must be taken exclusively with macro lenses; fisheye lenses for close-focus macro are therefore excluded. Any technique is allowed, provided the main subject of the image represents the theme.',
      },
      {
        id: 'black-and-white',
        name: 'Black & White',
        description:
          'All free-themed black-and-white images taken with wide-angle or macro lenses are admitted.',
      },
      {
        id: 'animal-behaviour',
        name: 'Animal Behaviour',
        description:
          'Wide-angle, close-focus and macro images depicting a particular situation of underwater life are admitted. Split-shot (over/under) images are also permitted, provided the underwater portion is no less than 50%.',
      },
      {
        id: 'mediterranean-portfolio',
        name: 'Mediterranean Portfolio',
        description:
          'One or two series of 3 colour or B/W images celebrating the environment and fauna typical of the Mediterranean Sea. Each portfolio must comprise one Macro, one Wide Angle and one of free choice. Macro or WA images identical or similar to those entered in the previous sections are not allowed (see ref. Art. 1). Authors submitting two series must indicate, with a title or another form of identification permitted by these Regulations, to which Portfolio each individual image belongs.',
      },
    ],
    director: { label: 'Technical Director', value: 'Giuseppe Pignataro' },
    jury: { label: 'Jury Evaluation', value: 'January 2027' },
  },
  keyFacts: {
    id: 'key-facts',
    eyebrow: 'Essentials',
    title: 'At a Glance',
    facts: [
      {
        id: 'window',
        label: 'Submission Window',
        value: '1 Oct → 31 Dec 2026',
        detail: 'No extensions to the deadline will be granted.',
      },
      {
        id: 'fee',
        label: 'Entry Fee',
        value: '€20 / €30',
        detail: 'One category / multiple categories.',
      },
      {
        id: 'format',
        label: 'File Format',
        value: 'JPG · ≤ 5 MB',
        detail: '30×40 or 30×45 cm at 200 dpi.',
      },
      {
        id: 'limits',
        label: 'Submission Limits',
        value: '3 per section',
        detail: 'Up to 2 Mediterranean Portfolio series.',
      },
      {
        id: 'payment',
        label: 'Payment',
        value: 'Stripe',
        detail: 'Secure checkout, after upload.',
      },
      {
        id: 'jury',
        label: 'Jury & Awards',
        value: 'EUDI Show 2027',
        detail: 'Judging in January 2027, awards in Bologna.',
      },
    ],
  },
  timeline: {
    eyebrow: 'The Contest Journey',
    title: 'Dive Plan',
    nodes: [
      { id: 'open', date: '1 Oct 2026', label: 'Submissions open' },
      { id: 'close', date: '31 Dec 2026', label: 'Submissions close' },
      { id: 'jury', date: 'Jan 2027', label: 'Jury evaluation' },
      { id: 'ceremony', date: '2027', label: 'Awards · EUDI Show, Bologna' },
    ],
  },
  rules: {
    id: 'rules',
    eyebrow: 'The Regulation',
    title: 'Rules & Articles',
    intro:
      'The full regulation, article by article. Tap any article to expand it.',
    items: [
      {
        id: 'art-1',
        number: '1',
        title: 'Submission of Files',
        blocks: [
          {
            kind: 'paragraph',
            text: 'Authors may submit a maximum of 3 files per section and 2 series for the Mediterranean Portfolio. The same photo may not be entered in more than one section. To take part, log in to the official contest page www.seeintheseauw.com from 1 October 2026 through 31 December 2026 and open the photo-submission section. No extensions to the submission deadline will be granted.',
          },
          {
            kind: 'note',
            label: 'Note',
            tone: 'warning',
            text: 'All works already awarded in other national and international contests by 31 December 2025 will be excluded.',
          },
          {
            kind: 'paragraph',
            text: 'To submit your works you must register on the www.seeintheseauw.com portal using the “Enter the contest” button in the navigation bar. By registering on the platform, consent to data processing strictly related to the site’s functionality is considered implicit. Once registration is complete, access is automatic and the user is redirected to the submissions section, where they can upload and manage their contest photos and pay the entry fee.',
          },
          {
            kind: 'paragraph',
            text: 'For each successfully uploaded file, the system automatically sends a confirmation email to the address provided at registration. For any technical or IT issue, contact Lucio D’Alessandro at lucio.dalessa@gmail.com.',
          },
          {
            kind: 'paragraph',
            text: 'Each work must:',
          },
          {
            kind: 'list',
            items: [
              'Be in JPG format (the only accepted format).',
              'Not exceed 5 MB in size.',
              'Measure 30×40 or 30×45 cm at 200 dpi.',
              'Have a title containing alphanumeric characters only — no apostrophes, commas, brackets, etc. — with no reference to initials or to the author’s name.',
              'Contain exif data confirming the category entered. Any information that could identify the author must be removed. Exif data will not be visible to the jury during evaluation, but only to the organisation should verification be required.',
            ],
          },
        ],
      },
      {
        id: 'art-2',
        number: '2',
        title: 'Digital Images',
        pullQuote: 'Faithful to the RAW. No photomontage. No AI.',
        blocks: [
          {
            kind: 'paragraph',
            text: 'Cropping is permitted and unrestricted, provided the final image fits within 30×45 cm at 200 dpi. No post-production restriction applies, as long as the shot faithfully represents what is recorded in the original RAW file.',
          },
          {
            kind: 'list',
            items: [
              'Photomontages and image overlays are not permitted.',
              'Multiple exposures are allowed only if supported by the camera used and provided a single RAW file is generated.',
              'Images processed with AI (Artificial Intelligence) are not admitted.',
            ],
          },
          {
            kind: 'paragraph',
            text: 'Images must be free of frames, mats, watermarks and any logo or signature that could identify the photographer. Underwater images taken through submerged portholes, aquariums or swimming pools are not admitted. Images that show damage to the seabed, or frightened, stressed or unnaturally posed animals, will not be admitted — except images intended to document or denounce negative human actions.',
          },
          {
            kind: 'paragraph',
            text: 'The organisation, in agreement with the jury, reserves the right to exclude images that, on verification, do not comply with Art. 2. The RAW file will be compulsorily requested for every image selected by the jury. The jury’s decision is final.',
          },
        ],
      },
      {
        id: 'art-3',
        number: '3',
        title: 'Entry Fee',
        blocks: [
          {
            kind: 'paragraph',
            text: 'As reimbursement of expenses, an entry fee is required:',
          },
          {
            kind: 'list',
            items: [
              '€20.00 for entry in a single category.',
              '€30.00 for entry in multiple categories.',
            ],
          },
          {
            kind: 'paragraph',
            text: 'Payment can be made via Stripe once your works have been uploaded to the categories entered. If you experience problems with Stripe payment, contact the organising secretariat at info@ortonasub.com or info@ortonamare.org, or Mr Fabrizio Pompilio at +39 380 391 9121.',
          },
        ],
      },
      {
        id: 'art-4',
        number: '4',
        title: 'Awards',
        blocks: [
          {
            kind: 'paragraph',
            text: 'The 1st, 2nd and 3rd placed entries in each section of the Contest will be awarded. Each competitor may win only one prize offered by the sponsors. In the case of multiple wins by the same competitor, priority is given to the prize of greatest value.',
          },
          {
            kind: 'paragraph',
            text: 'Should an author be awarded in more than one section, they will receive the trophy for their best placement, with a plaque also noting the other results.',
          },
          {
            kind: 'note',
            label: 'Note',
            text: 'At the jury’s sole discretion, prizes may be assigned — regardless of category and theme — also to photos that these Regulations classify as “Mentioned”.',
          },
        ],
      },
      {
        id: 'art-5',
        number: '5',
        title: 'Publication of Winners',
        blocks: [
          {
            kind: 'paragraph',
            text: 'During the Award Ceremony, the organisation will present all winning photos, the mentioned ones, and any others that, at the jury’s sole discretion, stand out for particular technical and emotional interest.',
          },
          {
            kind: 'paragraph',
            text: 'Winning, mentioned and most significant photos will be published on the official website www.ortonamare.org and on the Contest’s Facebook and Instagram pages at the same time as the official rankings.',
          },
        ],
      },
      {
        id: 'art-6',
        number: '6',
        title: 'Admission',
        blocks: [
          {
            kind: 'paragraph',
            text: 'Works are admitted to the Contest only and exclusively upon payment of the entry fee referred to in Art. 3.',
          },
        ],
      },
    ],
  },
  sections: [
    {
      id: 'ceremony',
      eyebrow: 'The Event',
      title: 'Award Ceremony',
      blocks: [
        {
          kind: 'paragraph',
          text: 'The Contest awards will be presented at the EUDI Show in Bologna 2027.',
        },
        {
          kind: 'paragraph',
          text: 'As the presence of authors at the Award Ceremony is especially valued, the Organisation will give all winners advance notice of the detailed programme of the event.',
        },
        {
          kind: 'paragraph',
          text: 'For competitors unable to attend the Award Ceremony, the Organisation will prepare a format (video clip) that allows the author to be present virtually and to briefly present their awarded image. In compliance with the applicable regulations, the Organisation reserves the right to publish these videos on the Contest’s web and social channels.',
        },
        {
          kind: 'note',
          label: 'Note',
          text: 'Prizes not collected, due to the absence of winners or their delegate, will be shipped at the Organisation’s expense only for international authors resident abroad. For everyone else, shipping may be arranged, by prior telephone agreement with the Organisation, exclusively by cash on delivery and entirely at the recipient’s expense. For information, contact info@ortonasub.com.',
        },
      ],
    },
    {
      id: 'rankings',
      eyebrow: 'Results',
      title: 'Rankings',
      blocks: [
        {
          kind: 'paragraph',
          text: 'The rankings will be published after prior notice via the mailing list on www.seeintheseauw.com. For any other information, contact the Contest secretariat at info@ortonasub.com.',
        },
      ],
    },
    {
      id: 'prizes',
      eyebrow: 'What You Can Win',
      title: 'Prizes',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Prize pool: trophy, diving trips, underwater photography equipment and accessories, scuba gear, and more.',
        },
        {
          kind: 'note',
          label: 'Note 1',
          text: 'The terms for redeeming the prizes (cruises – stays – full days – equipment, etc.) and their features are governed directly by the suppliers collaborating with ORTONA SUB for the management of the “SEE in the SEA UW Photo Contest OrtonAmare”, year 2022. Anyone interested in further details or specific information should therefore contact the prize suppliers directly. The organising secretariat reserves the right to ship prizes not collected at the Award Ceremony within 60 days of the award date.',
        },
        {
          kind: 'note',
          label: 'Note 2',
          text: 'Prizes are not cumulative. Prizes left uncollected with the Organisation and unclaimed for one month after the award ceremony date will automatically be added to the prize pool of the following year’s contest.',
        },
      ],
    },
    {
      id: 'copyright',
      eyebrow: 'Rights',
      title: 'Copyright & Image Use',
      blocks: [
        {
          kind: 'paragraph',
          text: 'In compliance with applicable copyright law, the organisation considers the works submitted to the Contest free from any artistic property right or rights belonging to third parties. Competitors authorise the Organisation to use their works to promote the Contest itself, including through posters, brochures, non-profit calendars and web publications.',
        },
        {
          kind: 'paragraph',
          text: 'The images, free from payment of royalties or any other form of compensation, will always be used with a credit to the author’s name. In no case will the organisers make commercial use of these works, and anyone interested in purchasing an image will be put directly in touch with the author.',
        },
        {
          kind: 'paragraph',
          text: 'By taking part in the Contest, competitors authorise the organisation to process their data in order to receive updates on developments of this initiative, on the understanding that such data will in no case be passed to third parties, in compliance with Law 196/2003 on the protection of personal data.',
        },
        {
          kind: 'note',
          label: 'Note',
          text: 'Registration and participation in the Contest imply unconditional acceptance of these Regulations. Files and prints in the respective categories will not be returned and will become part of the exhibition archive.',
        },
      ],
    },
  ],
  prizeHighlights: [
    { id: 'trophy', label: 'Trophy' },
    { id: 'trips', label: 'Diving Trips' },
    { id: 'photo-gear', label: 'Photo & Video Gear' },
    { id: 'scuba-gear', label: 'Scuba Equipment' },
  ],
  legal: {
    id: 'legal',
    eyebrow: 'Legal',
    title: 'Privacy & Consent',
    summary:
      'Privacy notice and consent to the processing of personal data, pursuant to Legislative Decree 196 of 30/06/2003.',
    items: [
      {
        id: 'privacy',
        eyebrow: 'Art. 13 of Legislative Decree 196 of 30/06/2003',
        title: 'Privacy Notice',
        blocks: [
          {
            kind: 'paragraph',
            text: 'Pursuant to Article 13 of the above decree, we INFORM you that ORTONA SUB processes the personal data of supporters, collaborators, suppliers and individuals who have voluntarily provided (in person, by telephone, fax, e-mail, or by registering on the website www.ortonamare.org) their personal details to our representatives, in order to receive information about our services and/or initiatives.',
          },
          {
            kind: 'paragraph',
            text: 'Under the cited law (ref. Art. 2 – Purpose), ORTONA SUB guarantees that the processing of personal data is carried out with respect for fundamental rights and freedoms, as well as the dignity of the data subject, with particular regard to confidentiality, personal identity and the right to the protection of personal data.',
          },
          {
            kind: 'paragraph',
            text: 'Purpose of the processing of personal data: obligations connected with the company’s economic activity, in particular the compilation of records, internal statistics, invoicing, the keeping of customer–supplier accounts, and compliance with obligations laid down by law, regulations, EU legislation, and civil and tax rules.',
          },
          {
            kind: 'paragraph',
            text: 'Data collected by our representatives in relation to initiatives and anything else connected with ORTONA SUB’s activities will be retained for the purpose of sending information and promotional material about ORTONA SUB’s own activities (by post, fax, SMS and e-mail). Data are processed using paper and/or electronic media, by telematic means, including automated tools designed to store, manage and transmit the data, observing every precautionary measure that ensures their security and confidentiality.',
          },
          {
            kind: 'paragraph',
            text: 'Where necessary, personal data may also be disclosed to all parties whose right of access to such data is recognised under regulatory provisions.',
          },
          {
            kind: 'paragraph',
            text: 'The data are kept at our company’s operating headquarters for the period prescribed by civil and tax rules.',
          },
          {
            kind: 'paragraph',
            text: 'The data controller is: ORTONA SUB – Ortona (CH). Providing one’s personal data — by those who intend to establish a relationship with our association, even if purely informative about our activities/services — is to be considered optional; however, failure to provide the data may prevent the continuation of the relationship, its proper conduct and any legal obligations, including tax ones. We further inform you that, in relation to the aforementioned processing, the data subjects may at any time exercise the rights referred to in Art. 7 and Art. 8, in the manner set out in Art. 9 of the same Legislative Decree no. 196 of 30 June 2003, by contacting the data processor directly by post, fax or e-mail.',
          },
        ],
      },
      {
        id: 'consent',
        eyebrow: 'Art. 7 of Legislative Decree 196/2003',
        title: 'Consent to the Processing of Personal Data',
        blocks: [
          {
            kind: 'paragraph',
            text: 'With reference to the request made to us, having taken note of the above information notice and, in particular, of the rights recognised by Art. 7 of Legislative Decree 196/2003:',
          },
          {
            kind: 'list',
            ordered: true,
            items: [
              'The data subject has the right to obtain confirmation of the existence or otherwise of personal data concerning them, even if not yet recorded, and to have such data communicated in intelligible form.',
              'The data subject has the right to obtain information on: the origin of the personal data; the purposes and methods of the processing; the logic applied where processing is carried out with the aid of electronic instruments; and the identifying details of the controller, the processors and the designated representative pursuant to Article 5(2).',
              'The data subject has the right to obtain the updating, rectification or, where of interest, the integration of the data, for the purposes for which the data were collected or subsequently processed.',
              'The data subject has the right to object, in whole or in part, to the processing.',
            ],
          },
          {
            kind: 'paragraph',
            text: 'We hereby give our consent, pursuant to Article 23 of the said Legislative Decree, to the processing of our personal data and to their communication and dissemination, for the purposes and within the limits of the information notice above.',
          },
        ],
      },
    ],
  },
  contact: {
    id: 'contact',
    eyebrow: 'Get in Touch',
    title: 'Organising Secretariat',
    card: {
      org: 'ORTONA SUB',
      addressLines: [
        'C/o Sports Hall – Via Papa Giovanni XXIII',
        '66026 Ortona (CH), Italy',
      ],
      phones: [
        { label: '+39 339 657 7950', href: 'tel:+393396577950' },
        { label: '+39 380 391 9121', href: 'tel:+393803919121' },
      ],
      email: 'info@ortonasub.com',
      website: {
        label: 'www.ortonasub.com',
        href: 'https://www.ortonasub.com',
      },
    },
  },
  ui: {
    articleLabel: 'Article',
    expand: 'Expand',
    backToTop: 'Back to top',
  },
};

const it: RulesContent = {
  hero: {
    eyebrow: 'Regolamento',
    title: 'See in the Sea',
    subtitle: 'International Underwater Photocontest OrtonaMare 2026',
    edition: '17ª Edizione · 2026',
    intro:
      'Il Concorso è aperto a tutti i fotografi subacquei ed è a tema libero. Le sezioni nelle quali si articola il Concorso sono le seguenti.',
  },
  nav: {
    label: 'In questa pagina',
    items: [
      { id: 'categories', label: 'Categorie' },
      { id: 'key-facts', label: 'In breve' },
      { id: 'rules', label: 'Regolamento' },
      { id: 'ceremony', label: 'Premiazione' },
      { id: 'rankings', label: 'Classifiche' },
      { id: 'prizes', label: 'Premi' },
      { id: 'copyright', label: 'Copyright' },
      { id: 'legal', label: 'Privacy' },
      { id: 'contact', label: 'Contatti' },
    ],
  },
  categories: {
    id: 'categories',
    eyebrow: 'Sezioni del Concorso',
    title: 'Categorie',
    intro:
      'Cinque sezioni, ciascuna valutata in modo autonomo. Scegli dove inserire le tue immagini: la stessa foto non può essere presentata in più sezioni.',
    items: [
      {
        id: 'wide-angle',
        name: 'Grandangolo (WA)',
        description:
          'L’immagine, a colori, dovrà rappresentare l’ambiente subacqueo o le specie che lo popolano attraverso l’uso di ottiche o aggiuntivi grandangolari. Sono ammessi i campi lunghi e i controluce, la presenza umana potrà essere inserita nell’immagine come elemento complementare. Il fotografo è libero di interpretare il tema secondo il proprio gusto compositivo, utilizzando qualunque tipo di tecnica. Sono ammesse anche immagini a mezz’acqua, nelle quali la parte subacquea non deve essere inferiore al 50%.',
      },
      {
        id: 'macro',
        name: 'Macro',
        description:
          'L’immagine, a colori, dovrà riprendere soggetti acquatici interi o particolari di soggetti o di vita subacquea che evidenzino il miglior gusto estetico attraverso scelte compositive e cromatismi. Le immagini dovranno essere realizzate unicamente con ottiche macro, si esclude quindi l’utilizzo di ottiche fisheye per macro ravvicinate. È ammessa qualunque tipo di tecnica, purché il soggetto principale dell’immagine rappresenti il tema.',
      },
      {
        id: 'black-and-white',
        name: 'Bianco e Nero',
        description:
          'Sono ammesse tutte le immagini a tema libero in BN scattate con ottiche grandangolari o macro.',
      },
      {
        id: 'animal-behaviour',
        name: 'Comportamento Animale',
        description:
          'Sono ammesse immagini grandangolari, ravvicinate e macro che rappresentano una particolare situazione di vita sottomarina. Sono ammesse anche immagini a mezz’acqua, nelle quali la parte subacquea non deve essere inferiore al 50%.',
      },
      {
        id: 'mediterranean-portfolio',
        name: 'Portfolio Mediterraneo',
        description:
          'Una o due serie di 3 immagini a colori o B/N, che esaltino l’ambiente e la fauna tipiche del Mar Mediterraneo. Ogni portfolio deve essere così composto: una Macro, una WA ed una a scelta personale. Non sono ammesse immagini Macro o WA uguali o similari a quelle presentate nelle precedenti sezioni (vedi rif. Art. 1). Gli autori che inviano due serie devono indicare con un titolo o altra forma di caratterizzazione consentita dal Regolamento a quale Portfolio attribuire ogni singola immagine.',
      },
    ],
    director: { label: 'Direttore Tecnico', value: 'Giuseppe Pignataro' },
    jury: { label: 'Valutazione della Giuria', value: 'Gennaio 2027' },
  },
  keyFacts: {
    id: 'key-facts',
    eyebrow: 'L’essenziale',
    title: 'In Breve',
    facts: [
      {
        id: 'window',
        label: 'Periodo di Iscrizione',
        value: '1 ott → 31 dic 2026',
        detail: 'Non saranno concesse proroghe.',
      },
      {
        id: 'fee',
        label: 'Quota di Iscrizione',
        value: '20 € / 30 €',
        detail: 'Una categoria / più categorie.',
      },
      {
        id: 'format',
        label: 'Formato File',
        value: 'JPG · ≤ 5 MB',
        detail: '30×40 o 30×45 cm a 200 dpi.',
      },
      {
        id: 'limits',
        label: 'Limiti di Invio',
        value: '3 per sezione',
        detail: 'Fino a 2 serie per il Portfolio Mediterraneo.',
      },
      {
        id: 'payment',
        label: 'Pagamento',
        value: 'Stripe',
        detail: 'Checkout sicuro, dopo il caricamento.',
      },
      {
        id: 'jury',
        label: 'Giuria e Premi',
        value: 'EUDI Show 2027',
        detail: 'Valutazione a Gennaio 2027, premiazione a Bologna.',
      },
    ],
  },
  timeline: {
    eyebrow: 'Il percorso del Concorso',
    title: 'Piano d’Immersione',
    nodes: [
      { id: 'open', date: '1 ott 2026', label: 'Apertura iscrizioni' },
      { id: 'close', date: '31 dic 2026', label: 'Chiusura iscrizioni' },
      { id: 'jury', date: 'Gen 2027', label: 'Valutazione della giuria' },
      {
        id: 'ceremony',
        date: '2027',
        label: 'Premiazione · EUDI Show, Bologna',
      },
    ],
  },
  rules: {
    id: 'rules',
    eyebrow: 'Il Regolamento',
    title: 'Regolamento e Articoli',
    intro:
      'Il regolamento completo, articolo per articolo. Tocca un articolo per espanderlo.',
    items: [
      {
        id: 'art-1',
        number: '1',
        title: 'Presentazione dei File',
        blocks: [
          {
            kind: 'paragraph',
            text: 'Gli autori possono presentare un massimo di 3 file per sezione e 2 serie per il Portfolio Mediterraneo. La stessa foto non può essere presentata in più sezioni. Per partecipare al concorso sarà necessario collegarsi dal 01/10/2026 a tutto il 31/12/2026 alla pagina ufficiale del concorso www.seeintheseauw.com ed accedere alla sezione dedicata all’iscrizione foto. Si specifica che non saranno concesse proroghe per la data di invio delle opere.',
          },
          {
            kind: 'note',
            label: 'Nota',
            tone: 'warning',
            text: 'Verranno escluse tutte le opere già premiate in altri concorsi Nazionali ed Internazionali entro la data del 31 Dicembre 2025.',
          },
          {
            kind: 'paragraph',
            text: 'Per inviare le proprie opere è necessario registrarsi al portale www.seeintheseauw.com tramite il pulsante “Partecipa al concorso” presente nella barra di navigazione. Con l’iscrizione alla piattaforma, il consenso al trattamento dei dati per fini strettamente legati alla funzionalità del sito sarà considerato implicito. Una volta completata la registrazione, l’accesso sarà automatico e l’utente verrà reindirizzato alla sezione dedicata alle candidature, da cui potrà caricare e gestire le foto per il concorso ed effettuare il pagamento della quota di iscrizione.',
          },
          {
            kind: 'paragraph',
            text: 'Ad ogni file caricato con successo, il sistema invierà in automatico un’email di conferma all’indirizzo email fornito durante la registrazione. Per ogni evenienza di carattere tecnico informatico, contattare Lucio D’Alessandro all’indirizzo email lucio.dalessa@gmail.com.',
          },
          {
            kind: 'paragraph',
            text: 'Si precisa che ogni opera:',
          },
          {
            kind: 'list',
            items: [
              'Deve essere di formato JPG (unico formato accettato).',
              'Non deve superare i 5 Mb di peso.',
              'Deve avere le seguenti dimensioni 30×40 o 30×45 a 200 dpi.',
              'Dovrà avere un titolo contenente solo caratteri alfanumerici, senza l’uso di apostrofi, virgole, parentesi ecc., e senza alcun riferimento a sigle o al nome dell’autore.',
              'Deve contenere i dati exif a riscontro della categoria di appartenenza. Qualunque info che possa rendere identificabile l’autore deve essere rimossa. I dati exif non saranno accessibili ai giurati durante la sessione ma, in caso di riscontro, solo dall’organizzazione.',
            ],
          },
        ],
      },
      {
        id: 'art-2',
        number: '2',
        title: 'Immagini Digitali',
        pullQuote: 'Fedeli al RAW. Nessun fotomontaggio. Nessuna IA.',
        blocks: [
          {
            kind: 'paragraph',
            text: 'Il crop è consentito ed è libero purché l’immagine finale rientri nelle misure di 30×45 cm a 200 dpi. Nessuna restrizione in post produzione è richiesta purché lo scatto rappresenti fedelmente ciò che è rappresentato nel file raw originario.',
          },
          {
            kind: 'list',
            items: [
              'Non sono consentiti fotomontaggi o sovrapposizione di immagini.',
              'Sono ammesse le esposizioni multiple solo se consentite dalle caratteristiche della fotocamera usata e previa generazione del singolo file RAW.',
              'Non sono ammesse immagini elaborate con IA (Intelligenza Artificiale).',
            ],
          },
          {
            kind: 'paragraph',
            text: 'Le immagini devono essere prive di cornici o passe-partout, filigrane e di qualunque logo o firma che possa identificare il fotografo. Non sono ammesse immagini subacquee riprese attraverso oblò sommersi, acquari e piscine. Non saranno ammesse immagini che palesano danneggiamenti del fondale, animali spaventati, stressati o in situazioni innaturali, salvo immagini che vogliano documentare o denunciare manifestazioni umane negative.',
          },
          {
            kind: 'paragraph',
            text: 'L’organizzazione, in accordo con la giuria, si riserva il diritto di escludere le immagini che, in fase di verifica, non siano conformi a quanto espresso nell’Art. 2. A tutte le immagini selezionate dalla giuria verrà richiesto d’obbligo il file RAW. Il giudizio della giuria è inappellabile.',
          },
        ],
      },
      {
        id: 'art-3',
        number: '3',
        title: 'Quota di Iscrizione',
        blocks: [
          {
            kind: 'paragraph',
            text: 'A titolo di rimborso spese, è richiesta una quota di iscrizione pari a:',
          },
          {
            kind: 'list',
            items: [
              'Euro 20,00 per chi si iscrive ad una sola categoria.',
              'Euro 30,00 per chi si iscrive a più categorie.',
            ],
          },
          {
            kind: 'paragraph',
            text: 'Il versamento potrà essere effettuato tramite pagamento Stripe una volta effettuato l’upload delle opere nelle categorie a cui si è partecipato. In caso di problemi con la modalità di pagamento attraverso il sistema Stripe, contattare la segreteria organizzativa info@ortonasub.com o info@ortonamare.org, o eventualmente il Sig. Fabrizio Pompilio al +39 380 391 9121.',
          },
        ],
      },
      {
        id: 'art-4',
        number: '4',
        title: 'Premi',
        blocks: [
          {
            kind: 'paragraph',
            text: 'Saranno premiati il 1°, il 2° e il 3° classificato di ogni sezione del Concorso. Ogni concorrente può vincere un solo premio messo in palio dagli sponsor. In caso di più vincite di uno stesso concorrente, verrà data priorità al premio di maggior valore.',
          },
          {
            kind: 'paragraph',
            text: 'Nel caso in cui un autore venga premiato in più sezioni, riceverà il trofeo relativo al miglior piazzamento con la targhetta che indicherà anche gli altri risultati.',
          },
          {
            kind: 'note',
            label: 'Nota',
            text: 'Ad insindacabile giudizio della Giuria potranno essere assegnati premi, indipendentemente dalla categoria e dalla tematica, anche a foto che il Regolamento qualifica come «Segnalate».',
          },
        ],
      },
      {
        id: 'art-5',
        number: '5',
        title: 'Pubblicazione dei Vincitori',
        blocks: [
          {
            kind: 'paragraph',
            text: 'L’organizzazione presenterà, durante la Cerimonia di Premiazione, tutte le foto vincitrici, le segnalate e tutte quelle che, ad insindacabile giudizio della Giuria, evidenzieranno particolari motivi di interesse tecnico ed emozionale.',
          },
          {
            kind: 'paragraph',
            text: 'Le foto vincitrici, le segnalate e quelle ritenute maggiormente significative saranno pubblicate sul sito ufficiale www.ortonamare.org e sulla pagina Facebook e Instagram del Concorso contestualmente alla pubblicazione delle classifiche ufficiali.',
          },
        ],
      },
      {
        id: 'art-6',
        number: '6',
        title: 'Ammissione',
        blocks: [
          {
            kind: 'paragraph',
            text: 'Le opere saranno ammesse al Concorso solo ed esclusivamente previo pagamento della quota di iscrizione di cui all’art. 3.',
          },
        ],
      },
    ],
  },
  sections: [
    {
      id: 'ceremony',
      eyebrow: 'L’evento',
      title: 'Premiazione',
      blocks: [
        {
          kind: 'paragraph',
          text: 'La premiazione del Concorso avverrà in occasione dell’EUDI Show di Bologna 2027.',
        },
        {
          kind: 'paragraph',
          text: 'Tenuto conto di come sia particolarmente gradita la presenza degli autori alla Cerimonia di Premiazione, sarà cura dell’Organizzazione comunicare preventivamente a tutti i vincitori il programma dettagliato della manifestazione.',
        },
        {
          kind: 'paragraph',
          text: 'L’organizzazione, tenuto conto dell’impossibilità di alcuni concorrenti a partecipare alla Cerimonia di Premiazione, predisporrà un format (videoclip) che consentirà all’autore di essere presente virtualmente e presentarsi raccontando sinteticamente l’immagine premiata. L’Organizzazione, nel rispetto delle normative imposte, si riserva di pubblicare i video sui canali web e social afferenti al Concorso.',
        },
        {
          kind: 'note',
          label: 'Nota',
          text: 'I premi non ritirati, per assenza dei vincitori o di un loro delegato, verranno spediti a carico dell’Organizzazione solamente per autori internazionali con residenza all’estero. Per tutti gli altri può essere prevista la spedizione, previo accordo telefonico con l’Organizzazione, esclusivamente con la formula del contrassegno a totale carico del destinatario. Per info contattare attraverso mail: info@ortonasub.com.',
        },
      ],
    },
    {
      id: 'rankings',
      eyebrow: 'Risultati',
      title: 'Classifiche',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Le classifiche verranno pubblicate previa comunicazione in mailing list sul sito www.seeintheseauw.com. Per qualsiasi altra informazione contattare la segreteria del Concorso scrivendo all’indirizzo mail info@ortonasub.com.',
        },
      ],
    },
    {
      id: 'prizes',
      eyebrow: 'Cosa si vince',
      title: 'Premi',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Montepremi: Trofeo, Viaggi sub, apparecchiature ed accessori fotosub, attrezzature subacquee, ecc.',
        },
        {
          kind: 'note',
          label: 'Nota 1',
          text: 'Le modalità di fruizione dei premi (Crociere – Soggiorni – Full day – Attrezzature ecc.) e le loro caratteristiche sono regolate direttamente dai fornitori della collaborazione offerta a ORTONA SUB per la gestione del Concorso «SEE in the SEA UW Photo Contest OrtonAmare» anno 2022. Quanti fossero preventivamente interessati a maggiori dettagli, oppure a particolari informazioni, dovranno pertanto prendere contatto direttamente con i fornitori dei premi. La segreteria organizzativa si riserva il diritto di spedire i premi non ritirati in occasione della Cerimonia di premiazione entro il termine di 60 gg. dalla data di premiazione.',
        },
        {
          kind: 'note',
          label: 'Nota 2',
          text: 'I premi non sono cumulabili. I premi non ritirati e rimasti in giacenza presso l’Organizzazione senza essere reclamati, trascorso un mese dalla data della cerimonia di premiazione, entreranno automaticamente nel monte premi del concorso dell’anno successivo.',
        },
      ],
    },
    {
      id: 'copyright',
      eyebrow: 'Diritti',
      title: 'Copyright e Utilizzo Immagini',
      blocks: [
        {
          kind: 'paragraph',
          text: 'L’organizzazione, in conformità con le leggi stabilite in materia di copyright, considera le opere presentate in Concorso esenti da qualsiasi diritto di proprietà artistica o da diritti appartenenti a terzi. I concorrenti autorizzano l’utilizzo delle loro opere da parte dell’Organizzazione per operazioni di promozione del Concorso stesso, anche attraverso manifesti, brochure, calendari senza fini di lucro e pubblicazioni via web.',
        },
        {
          kind: 'paragraph',
          text: 'Le immagini, svincolate dal pagamento dei diritti d’autore o da qualsiasi altro tipo di retribuzione, saranno sempre utilizzate con l’obbligo di menzione del nome dell’autore. In nessun caso, gli organizzatori faranno comunque uso commerciale di queste opere e le persone, eventualmente interessate all’acquisto di un’opera, saranno messe direttamente in contatto con l’autore.',
        },
        {
          kind: 'paragraph',
          text: 'I concorrenti, con la partecipazione al Concorso, autorizzano l’organizzazione al trattamento dei dati, al fine di ottenere aggiornamenti in merito agli sviluppi della presente iniziativa, ben inteso che i dati stessi non saranno in nessun caso trasmessi a terzi, nel rispetto di quanto stabilito dalla Legge 196/2003 sulla tutela dei dati personali.',
        },
        {
          kind: 'note',
          label: 'Nota',
          text: 'L’iscrizione e partecipazione al Concorso implica l’accettazione incondizionata del presente Regolamento. I files e le stampe delle rispettive categorie non saranno restituite ed entreranno a far parte dell’archivio della mostra.',
        },
      ],
    },
  ],
  prizeHighlights: [
    { id: 'trophy', label: 'Trofeo' },
    { id: 'trips', label: 'Viaggi Sub' },
    { id: 'photo-gear', label: 'Attrezzatura Fotosub' },
    { id: 'scuba-gear', label: 'Attrezzatura Subacquea' },
  ],
  legal: {
    id: 'legal',
    eyebrow: 'Note legali',
    title: 'Privacy e Consenso',
    summary:
      'Informativa e consenso al trattamento dei dati personali, ai sensi del D.L. 196 del 30/06/2003.',
    items: [
      {
        id: 'privacy',
        eyebrow: 'Art. 13 del D.L. 196 del 30/06/2003',
        title: 'Informativa sulla Privacy',
        blocks: [
          {
            kind: 'paragraph',
            text: 'Ai sensi dell’articolo 13 del decreto legge suddetto, INFORMIAMO che ORTONA SUB tratta dati personali di simpatizzanti, collaboratori, fornitori e di soggetti che hanno volontariamente comunicato (personalmente, telefonicamente, via fax, via e-mail o registrandosi sul sito www.ortonamare.org) i loro dati anagrafici ai nostri incaricati, al fine di ricevere informazioni sui nostri servizi e/o iniziative.',
          },
          {
            kind: 'paragraph',
            text: 'Secondo la legge indicata (rif. Art. 2 – Finalità), ORTONA SUB garantisce che il trattamento dei dati personali si svolga nel rispetto dei diritti e delle libertà fondamentali, nonché della dignità dell’interessato, con particolare riferimento alla riservatezza, all’identità personale e al diritto alla protezione dei dati personali.',
          },
          {
            kind: 'paragraph',
            text: 'Finalità del trattamento dei dati personali: adempimenti connessi all’attività economica dell’azienda ed in particolare per la compilazione delle anagrafiche, di statistiche interne, per la fatturazione, la tenuta della contabilità clienti-fornitori, per soddisfare gli obblighi previsti dalle norme di legge, dai regolamenti, dalla normativa comunitaria, da norme civilistiche e fiscali.',
          },
          {
            kind: 'paragraph',
            text: 'I dati raccolti dagli incaricati relativamente ad iniziative e quant’altro connesso alle attività di ORTONA SUB, verranno conservati al fine dell’invio d’informazioni e materiale pubblicitario relativamente alle attività di ORTONA SUB stessa (via posta, fax, sms ed e-mail). Il trattamento dei dati avviene utilizzando supporti cartacei e/o informatici, per via telematica, anche attraverso strumenti automatizzati atti a memorizzare, gestire e trasmettere i dati stessi, con l’osservanza di ogni misura cautelativa che ne garantisca la sicurezza e la riservatezza.',
          },
          {
            kind: 'paragraph',
            text: 'I dati personali, qualora fosse necessario, vengono comunicati anche a tutti i soggetti cui la facoltà di accesso a tali dati è riconosciuta in forza di provvedimenti normativi.',
          },
          {
            kind: 'paragraph',
            text: 'I dati sono conservati presso la sede operativa della nostra società, per il tempo prescritto dalle norme civilistiche e fiscali.',
          },
          {
            kind: 'paragraph',
            text: 'Il titolare del trattamento è: ORTONA SUB – Ortona (CH). Il conferimento dei propri dati personali da parte dei soggetti che intendono aprire un rapporto con la nostra associazione, anche se puramente informativo sulle nostre attività/servizi, è da ritenersi facoltativo, ma l’eventuale mancato conferimento potrebbe comportare la mancata prosecuzione del rapporto, del suo corretto svolgimento e degli eventuali adempimenti di legge, anche fiscali. Informiamo inoltre che, in relazione al predetto trattamento, i soggetti interessati possono in ogni momento esercitare i diritti di cui all’art. 7 e all’art. 8, nelle modalità espresse dall’art. 9 dello stesso Decreto Legge nr. 196 del 30 Giugno 2003, rivolgendosi direttamente al Responsabile del trattamento via posta, fax o e-mail.',
          },
        ],
      },
      {
        id: 'consent',
        eyebrow: 'Art. 7 del Decreto Legge 196/2003',
        title: 'Consenso al Trattamento dei Dati Personali',
        blocks: [
          {
            kind: 'paragraph',
            text: 'In relazione alla richiesta formulataci, preso atto dell’informativa di cui sopra e, in particolare, dei diritti riconosciuti dall’Art. 7 del Decreto Legge 196/2003:',
          },
          {
            kind: 'list',
            ordered: true,
            items: [
              'L’interessato ha diritto di ottenere la conferma dell’esistenza o meno di dati personali che lo riguardano, anche se non ancora registrati, e la loro comunicazione in forma intelligibile.',
              'L’interessato ha diritto di ottenere l’indicazione: dell’origine dei dati personali; delle finalità e modalità del trattamento; della logica applicata in caso di trattamento effettuato con l’ausilio di strumenti elettronici; degli estremi identificativi del titolare, dei responsabili e del rappresentante designato ai sensi dell’articolo 5, comma 2.',
              'L’interessato ha diritto di ottenere l’aggiornamento, la rettificazione ovvero, quando vi ha interesse, l’integrazione dei dati, agli scopi per i quali i dati sono stati raccolti o successivamente trattati.',
              'L’interessato ha diritto di opporsi, in tutto o in parte, al trattamento.',
            ],
          },
          {
            kind: 'paragraph',
            text: 'Prestiamo il nostro consenso ai sensi dell’articolo 23 del precisato Decreto Legge, al trattamento dei nostri dati personali e alla loro comunicazione e diffusione, per le finalità e nei limiti della sopracitata informativa.',
          },
        ],
      },
    ],
  },
  contact: {
    id: 'contact',
    eyebrow: 'Contatti',
    title: 'Segreteria Organizzativa',
    card: {
      org: 'ORTONA SUB',
      addressLines: [
        'C/o Palazzetto dello sport – Via Papa Giovanni XXIII',
        '66026 Ortona (CH)',
      ],
      phones: [
        { label: '+39 339 657 7950', href: 'tel:+393396577950' },
        { label: '+39 380 391 9121', href: 'tel:+393803919121' },
      ],
      email: 'info@ortonasub.com',
      website: {
        label: 'www.ortonasub.com',
        href: 'https://www.ortonasub.com',
      },
    },
  },
  ui: {
    articleLabel: 'Articolo',
    expand: 'Espandi',
    backToTop: 'Torna su',
  },
};

export const rulesContent: Record<Language, RulesContent> = { en, it };
