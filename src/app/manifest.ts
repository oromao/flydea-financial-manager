import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Flydea Financial Manager',
    short_name: 'Flydea',
    description: 'A sua solução Apple-like de gestão financeira.',
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
