import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const width = searchParams.get('width') || '320';
  const height = searchParams.get('height') || '180';
  const text = searchParams.get('text') || 'Canal';

  // Criar SVG placeholder
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#6750A4"/>
      <rect x="10" y="10" width="${parseInt(width) - 20}" height="${parseInt(height) - 20}" 
            fill="none" stroke="#FFFFFF" stroke-width="2" stroke-dasharray="5,5"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" 
            fill="#FFFFFF" text-anchor="middle" dominant-baseline="middle">
        ${decodeURIComponent(text)}
      </text>
      <circle cx="30" cy="30" r="8" fill="#FFFFFF" opacity="0.7"/>
      <circle cx="50" cy="30" r="8" fill="#FFFFFF" opacity="0.5"/>
      <circle cx="70" cy="30" r="8" fill="#FFFFFF" opacity="0.3"/>
    </svg>
  `;

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000',
    },
  });
}