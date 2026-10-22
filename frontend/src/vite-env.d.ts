/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_RAZORPAY_KEY_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Side-effect stylesheet imports from packages (e.g. "swiper/css").
declare module "swiper/css";
declare module "swiper/css/*";
