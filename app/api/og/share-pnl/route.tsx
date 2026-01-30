import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

// Fetch the Press Start 2P font TTF from Google Fonts
async function loadFont() {
  const fontUrl = 'https://github.com/google/fonts/raw/main/ofl/pressstart2p/PressStart2P-Regular.ttf';
  const fontData = await fetch(fontUrl).then((res) => res.arrayBuffer());
  return fontData;
}

export async function GET(request: NextRequest) {
  const fontData = await loadFont();
  
  const { searchParams } = new URL(request.url);
  const pnl = parseFloat(searchParams.get('pnl') || '0');
  const username = searchParams.get('username') || 'Trader';
  
  // Handle color - ensure it starts with #
  let themeColor = searchParams.get('color') || '#4ade80';
  if (!themeColor.startsWith('#')) {
    themeColor = '#' + themeColor;
  }

  const isProfit = pnl >= 0;

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#070a13',
          fontFamily: 'PixelFont',
          position: 'relative',
        }}
      >
        {/* Background Pattern */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            opacity: 0.04,
            backgroundImage: `linear-gradient(${themeColor} 1px, transparent 1px), linear-gradient(90deg, ${themeColor} 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Global Ambient Glow */}
        <div 
           style={{
             position: 'absolute',
             top: '20%',
             left: '30%',
             width: '600px',
             height: '600px',
             display: 'flex',
             background: themeColor,
             opacity: 0.1,
             filter: 'blur(100px)',
             borderRadius: '50%',
           }}
        />

        {/* Main Card Frame */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            width: '900px',
            height: '500px',
            border: '1px solid rgba(74, 59, 43, 0.2)',
            backgroundColor: 'rgba(20, 24, 36, 0.4)',
            borderRadius: '16px',
            paddingTop: '56px',
            position: 'relative',
          }}
        >
          {/* Logo Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
            {/* Logo Box */}
            <div
              style={{
                display: 'flex',
                width: '56px',
                height: '56px',
                border: `2px solid ${themeColor}`,
                borderRadius: '12px',
                overflow: 'hidden',
              }}
            >
               {/* eslint-disable-next-line @next/next/no-img-element */}
               <img
                  src="https://mini-kit-alphabit.vercel.app/hero.png"
                  alt="Alphabit Logo"
                  width="56"
                  height="56"
                  style={{ objectFit: 'cover' }}
                />
            </div>
            {/* Logo Text */}
            <div style={{ display: 'flex', fontSize: 20, fontWeight: 400, color: 'white', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              ALPHA<span style={{ color: themeColor }}>BIT</span>
            </div>
          </div>

          {/* Header TOTAL PNL */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'flex', fontSize: 28, color: themeColor, letterSpacing: '0.25em', lineHeight: 1, marginBottom: '8px' }}>
              TOTAL PNL
            </div>
            <div style={{ display: 'flex', fontSize: 10, color: '#64748b', letterSpacing: '0.2em', opacity: 0.7, textTransform: 'uppercase' }}>
              @{username}&apos;S PROFIT
            </div>
          </div>

          {/* TrendingUp Icon */}
          <div style={{ display: 'flex', marginBottom: '24px' }}>
            <svg
              width="80"
              height="80"
              viewBox="0 0 24 24"
              fill="none"
              stroke={themeColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
          </div>

           {/* Value Section */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
             <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px' }}>
                <span style={{ fontSize: 72, color: themeColor, lineHeight: 0.9, letterSpacing: '-0.02em' }}>
                  {isProfit ? '+' : ''}
                </span>
                <span style={{ fontSize: 72, color: 'white', lineHeight: 0.9, letterSpacing: '-0.02em' }}>
                  {Math.abs(pnl).toFixed(2)}
                </span>
                <span style={{ fontSize: 24, color: themeColor, opacity: 0.8, marginBottom: '8px' }}>
                  USDC
                </span>
             </div>
             <div style={{ display: 'flex', marginTop: '16px', fontSize: 8, color: '#64748b', letterSpacing: '0.5em', opacity: 0.6, textTransform: 'uppercase' }}>
                NET PROFIT
             </div>
          </div>

        </div>

        {/* Corner Accessories */}
        <div style={{ display: 'flex', position: 'absolute', top: '48px', left: '48px', width: '80px', height: '80px', borderTop: '2px solid rgba(30, 41, 59, 0.5)', borderLeft: '2px solid rgba(30, 41, 59, 0.5)', borderTopLeftRadius: '12px' }} />
        <div style={{ display: 'flex', position: 'absolute', bottom: '48px', right: '48px', width: '80px', height: '80px', borderBottom: '2px solid rgba(30, 41, 59, 0.5)', borderRight: '2px solid rgba(30, 41, 59, 0.5)', borderBottomRightRadius: '12px' }} />

        {/* Footer Slogan */}
        <div style={{ display: 'flex', position: 'absolute', bottom: '48px', alignItems: 'center', gap: '32px', color: '#334155' }}>
           <div style={{ display: 'flex', width: '80px', height: '1px', backgroundColor: 'rgba(30, 41, 59, 0.5)' }} />
           <div style={{ display: 'flex', fontSize: 8, letterSpacing: '0.8em', textTransform: 'uppercase', opacity: 0.5 }}>SECURE • SCALABLE • SMART</div>
           <div style={{ display: 'flex', width: '80px', height: '1px', backgroundColor: 'rgba(30, 41, 59, 0.5)' }} />
        </div>

      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'PixelFont',
          data: fontData,
          style: 'normal',
          weight: 400,
        },
      ],
    }
  );
}
