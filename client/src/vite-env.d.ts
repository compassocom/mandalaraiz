/// <reference types="vite/client" />

// Type declarations for static asset imports
declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}

declare module '*.gif' {
  const src: string;
  export default src;
}

declare module '*.svg' {
  const src: string;
  export default src;
}

declare module '*.webp' {
  const src: string;
  export default src;
}

// Specific declarations for leaflet image assets
declare module 'leaflet/dist/images/marker-icon.png' {
  const src: string;
  export default src;
}

declare module 'leaflet/dist/images/marker-icon-2x.png' {
  const src: string;
  export default src;
}

declare module 'leaflet/dist/images/marker-shadow.png' {
  const src: string;
  export default src;
}