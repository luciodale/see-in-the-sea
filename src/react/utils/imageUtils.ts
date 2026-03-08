import { getFullQualityImageUrl } from '../../server/imageService';

// Local dev: static images from public/ since R2 doesn't serve locally
const LOCAL_DEV_IMAGES = [
  '/images/contests/2025/-3BcSVDpZO2WN2tYVDxXU.webp',
  '/images/contests/2025/1_ejaLRybeNB2D3zCBcQz.webp',
  '/images/contests/2025/2kYwGl96GTWK4xFvvoGml.webp',
  '/images/contests/2025/5C0Jgo1UFYUD7L0cZa94b.webp',
  '/images/contests/2025/8t0rHKWGb5r-kGPRsXwO5.webp',
  '/images/contests/2025/9GpV6AbRzIRKbV00Jcxf8.webp',
  '/images/contests/2025/AyNJL5aPY2mqvE7Hlut_m.webp',
  '/images/contests/2025/Bq0pvZY2C2ZGuG2d-Zb1J.webp',
  '/images/contests/2025/DjIWUtw7qmY4zSmS64fmS.webp',
  '/images/contests/2025/GAKXCowui1Q4L4A_dZH6j.webp',
  '/images/contests/2025/GLZCG4LSGQ0os0PuAy2P3.webp',
  '/images/contests/2025/GSyDfXQ6BaGI4YDZkCavI.webp',
  '/images/contests/2025/HqAtLmm_WZNcaqdqS-qvY.webp',
  '/images/contests/2025/M3UuRRotHaiyAhx09RExR.webp',
  '/images/contests/2025/OjpWUXDW8vqCMx-Pmdlwi.webp',
  '/images/contests/2025/QP9TPG9VXi1eEWlu2ynBA.webp',
  '/images/contests/2025/Xs0fF1WIYvVeqTgiGQkXA.webp',
  '/images/contests/2025/Z4BBuzaR6xqBmdvS4Tlog.webp',
  '/images/contests/2025/dxnP7pmJwuhi58qDvkDc0.webp',
  '/images/contests/2025/hrnLz6cso33mNyOHMqTfE.webp',
  '/images/contests/2025/ihU4DBr1pNp9paPSHn0sm.webp',
  '/images/contests/2025/jDKeqtHMCjuD-zY3nyyK_.webp',
  '/images/contests/2025/nJW3yMxvKdo_hITbyT1yh.webp',
  '/images/contests/2025/prDmbrdnuBfmZg2pa8kAm.webp',
  '/images/contests/2025/rnqpiHihDxDM0J84-aR0e.webp',
  '/images/contests/2025/ryO0Bbh9iNDkolLUroFIS.webp',
  '/images/contests/2025/toZsZS8iWVQS5i9yp7DAW.webp',
  '/images/contests/2025/vMAN1zWQkOijUie96K5i9.webp',
  '/images/contests/2025/xzjCtEnyKe4IgYJcsb15E.webp',
  '/images/contests/2025/z0zWrTXxd768IfVRRK0Xh.webp',
];

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

/**
 * Constructs the full image URL for display
 * @param r2ImageId - The r2ImageId from the database
 * @returns The full API path for the image
 */
export function getImageUrl(r2ImageId: string) {
  // TODO: remove local dev fallback when R2 serves locally
  if (window.location.hostname === 'localhost') {
    return LOCAL_DEV_IMAGES[simpleHash(r2ImageId) % LOCAL_DEV_IMAGES.length];
  }
  // return getFullQualityImageUrl(r2ImageId);
  return getFullQualityImageUrl(r2ImageId);
}
