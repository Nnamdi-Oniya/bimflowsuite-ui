/// <reference types="vitest" />

declare namespace NodeJS {
  interface Global {
    ResizeObserver: typeof ResizeObserver;
    IntersectionObserver: typeof IntersectionObserver;
  }
}