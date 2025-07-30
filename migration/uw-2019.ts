import { nanoid } from 'nanoid';

export const submissions = [
  {
    id: nanoid(),
    contestId: 'uw-2019',
    categoryId: 'wide-angle',
    userEmail: 'john.doe@example.com',
    title: 'Coral Reef Panorama',
    description: 'A stunning wide-angle view of a vibrant coral reef ecosystem',
    fileName: 'coral-reef-panorama.jpg',
  },
  {
    id: nanoid(),
    contestId: 'uw-2019',
    categoryId: 'macro',
    userEmail: 'jane.smith@example.com',
    title: 'Sea Horse Portrait',
    description:
      'Intimate close-up of a delicate sea horse in its natural habitat',
    fileName: 'sea-horse-portrait.jpg',
  },
  {
    id: nanoid(),
    contestId: 'uw-2019',
    categoryId: 'bw',
    userEmail: 'mike.wilson@example.com',
    title: 'Shipwreck Silhouette',
    description:
      'Dramatic black and white composition of an underwater shipwreck',
    fileName: 'shipwreck-silhouette.jpg',
  },
];
