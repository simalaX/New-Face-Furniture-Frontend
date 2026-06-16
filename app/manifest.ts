import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'New Face Furniture Kenya',
        short_name: 'New Face',
        description: 'Trusted Furniture Makers in Kenya. Custom-made furniture delivered countrywide.',
        start_url: '/',
        display: 'standalone',
        background_color: '#FAF7F2',
        theme_color: '#8B5E3C',
        icons: [
            {
                src: '/icon-192x192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icon-512x512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    }
}