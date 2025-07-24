interface Env {
  R2_IMAGES_BUCKET?: R2Bucket;
  IMAGES?: ImagesBinding;
  PUBLIC_CLERK_PUBLISHABLE_KEY?: string;
  CLERK_SECRET_KEY?: string;
  CLERK_JWT_KEY?: string;
  IMAGES_API_TOKEN?: string;
  UPLOAD_IMAGE_ENDPOINT_TOKEN?: string;
  ACCOUNT_ID?: string;
}

type Runtime = import("@astrojs/cloudflare").Runtime<Env>;
declare namespace App {  interface Locals extends Runtime {}}
