interface Env {
  PUBLIC_CLERK_PUBLISHABLE_KEY?: string;
  CLERK_SECRET_KEY?: string;
  CLERK_JWT_KEY?: string;
  R2_IMAGES_BUCKET?: R2Bucket;
  IMAGES_API_TOKEN?: string;
}

type Runtime = import("@astrojs/cloudflare").Runtime<Env>;
declare namespace App {  interface Locals extends Runtime {}}
