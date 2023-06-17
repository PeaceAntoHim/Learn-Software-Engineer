import "https://deno.land/x/dotenv@v3.2.0/load.ts";

export const APP_HOST: string = Deno.env.get('APP_HOST_PROD')|| Deno.env.get('APP_HOST_LOCAL')|| "127.0.0.1";
export const APP_PORT: string = Deno.env.get('APP_PORT') || '8080';
export const APP_ID: string = Deno.env.get('APP_ID') || ''
export const REST_API_KEY: string = Deno.env.get('REST_API_KEY') || ''
export const ONE_SIGNAL_API_GATEWAY: string = Deno.env.get('ONE_SIGNAL_API_GATEWAY') || ''
