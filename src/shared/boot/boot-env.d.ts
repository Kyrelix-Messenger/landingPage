import type { BootState } from "./boot";

declare global {
  interface Window {
    /** Written by bootstrap() in the inline <head> script. */
    __KYRELIX_BOOT__?: BootState;
  }
}
