export type Sponsor = {
  logo: string;
  website?: string;
  width?: string;
  name?: string;
};

export const sponsorAlbatros: Sponsor[] = [
  {
    logo: '/images/sponsors/albatros-logo-3.png',
    website: 'https://www.albatrostopboat.com/',
    width: 'w-50',
  },
  {
    logo: '/images/sponsors/albatros-logo-2.png',
    website: 'https://www.albatrostopboat.com/',
    width: 'w-72',
  },
  {
    logo: '/images/sponsors/albatros-logo-4.png',
    website: 'https://www.albatrostopboat.com/',
    width: 'w-40',
  },
];

export const sponsors: Sponsor[] = [
  {
    logo: '/images/sponsors/isotta-logo.svg',
    website: 'https://www.isotecnic.it/',
  },

  {
    logo: '/images/sponsors/ciampoli-logo.svg',
  },
  {
    logo: '/images/sponsors/pgs-logo.webp',
  },
  {
    logo: '/images/sponsors/lega-navale-logo.png',
    width: 'w-72',
    name: 'Lega Navale Italiana Sezione di Ortona',
  },
  {
    logo: '/images/sponsors/ssi-logo.svg',
    website: 'https://www.divessi.com/',
    width: 'w-2xl',
  },
];
