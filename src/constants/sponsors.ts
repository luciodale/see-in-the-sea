export type Sponsor = {
  logo: string;
  website?: string;
  width?: string;
  name?: string;
};

export const sponsorsMeta = {
  aquadiving: {
    website: 'https://www.aquadiving.it/',
  },
  siladen: {
    website: 'https://www.siladen.com',
  },
  coralEye: {
    website: 'https://www.coral-eye.com/',
  },
  albatros: {
    website: 'https://www.albatrostopboat.com/',
  },
  easyDive: {
    website: 'https://www.easydive.it/',
  },
  ciampoli: {},
  pgs: { website: 'https://www.pgs.it/' },
  legaNavale: { website: 'https://www.lega-navale.it/' },
  ssi: { website: 'https://www.divessi.com/' },
  puntoNave: { website: 'https://www.puntonavemarineservice.com/' },
  isotta: { website: 'https://www.isotecnic.it/' },
  htc: { website: 'https://htcinfissi.it/' },
} as const;

export const sponsorAlbatrosMain = {
  logo: '/images/sponsors/albatros-logo.svg',
  website: sponsorsMeta.albatros.website,
};

export const sponsorAlbatros: Sponsor[] = [
  {
    logo: '/images/sponsors/albatros-logo-3.png',
    website: sponsorsMeta.albatros.website,
    width: 'w-50',
  },
  {
    logo: '/images/sponsors/albatros-logo-2.png',
    website: sponsorsMeta.albatros.website,
    width: 'w-72',
  },
  {
    logo: '/images/sponsors/albatros-logo-4.png',
    website: sponsorsMeta.albatros.website,
    width: 'w-40',
  },
];

export const sponsors: Sponsor[] = [
  {
    logo: '/images/sponsors/isotta-logo.svg',
    website: sponsorsMeta.isotta.website,
  },
  {
    logo: '/images/sponsors/aquadiving-logo.png',
    website: sponsorsMeta.aquadiving.website,
  },
  {
    logo: '/images/sponsors/siladen-logo.png',
    website: sponsorsMeta.siladen.website,
  },
  {
    logo: '/images/sponsors/coral-eye-logo.png',
    website: sponsorsMeta.coralEye.website,
  },
  {
    logo: '/images/sponsors/easy-dive-logo.svg',
    website: sponsorsMeta.easyDive.website,
  },
  {
    logo: '/images/sponsors/ciampoli-logo.svg',
  },
  {
    logo: '/images/sponsors/pgs-logo.webp',
    website: sponsorsMeta.pgs.website,
  },
  {
    logo: '/images/sponsors/htc-logo.png',
    website: sponsorsMeta.htc.website,
    width: 'w-92',
  },
  {
    logo: '/images/sponsors/lega-navale-logo.svg',
    website: sponsorsMeta.legaNavale.website,
  },
  {
    logo: '/images/sponsors/ssi-logo.svg',
    website: sponsorsMeta.ssi.website,
    width: 'w-2xl',
  },
  {
    logo: '/images/sponsors/puntonave.webp',
    website: sponsorsMeta.puntoNave.website,
  },
];
