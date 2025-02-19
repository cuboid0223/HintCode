import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'HintCode',
    short_name: 'HintCode',
    description: 'An online coding practice platform integrating GPT-4o, specifically designed to provide reflective feedback for students',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/public/HINTCode.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/public/HINTCode.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}