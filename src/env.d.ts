/// <reference types="astro/client" />

interface Env {
  R2_IMAGES_BUCKET?: R2Bucket;
  IMAGES?: ImagesBinding;
  DB?: D1Database;
  PUBLIC_CLERK_PUBLISHABLE_KEY?: string;
  PUBLIC_R2_DOMAIN?: string; // R2 domain for images (e.g. https://images.seeintheseauw.com)
  CLERK_SECRET_KEY?: string;
  CLERK_JWT_KEY?: string;
  IMAGES_API_TOKEN?: string;
  ACCOUNT_ID?: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
}

type Runtime = import('@astrojs/cloudflare').Runtime<Env>;

declare namespace App {
  interface Locals extends Runtime {
    lang?: import('./i18n').Language;
  }
}
