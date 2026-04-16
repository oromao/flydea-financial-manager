import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Flydea',
    short_name: 'Flydea',
    description: 'Seu assistente financeiro pessoal.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FBFBFD',
    theme_color: '#FBFBFD',
    icons: [
      {
        src: '/icon?size=192',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon?size=512',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
