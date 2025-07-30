import { nanoid } from 'nanoid';

// Template for contest submissions
// Copy this file and rename it to your contest (e.g., uw-2019.ts, uw-2020.ts)
// Then add your submissions to the array below

export const submissions = [
  {
    id: nanoid(), // This will be replaced with a new ID during migration
    contestId: 'contest-id', // Change this to your contest ID (e.g., 'uw-2019')
    categoryId: 'wide-angle', // Options: 'wide-angle', 'macro', 'bw'
    userEmail: 'user@example.com', // The photographer's email
    title: 'Photo Title', // The title of the photo
    description: 'Photo description (optional)', // Description of the photo
    fileName: 'image-file.jpg', // Must match exactly with a file in the pictures/ folder
  },
  // Add more submissions here...
  // {
  //   id: nanoid(),
  //   contestId: 'contest-id',
  //   categoryId: 'macro',
  //   userEmail: 'another@example.com',
  //   title: 'Another Photo',
  //   description: 'Another description',
  //   fileName: 'another-image.jpg',
  // },
];

// Available categories:
// - 'wide-angle': Expansive underwater scenes, coral reefs, and seascapes
// - 'macro': Close-up photography of small marine life and details
// - 'bw': Black & White underwater photography

// File naming conventions:
// - Use descriptive names: 'sea-dragon.jpg', 'coral-reef-wide.jpg'
// - Supported formats: .jpg, .jpeg, .png, .gif
// - Make sure the fileName exactly matches the file in the pictures/ folder
