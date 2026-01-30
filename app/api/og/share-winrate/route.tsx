import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const winRate = parseFloat(searchParams.get('winrate') || '0');
  const username = searchParams.get('username') || 'Trader';
  
  const iconColor = '#60a5fa'; // blue-400

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
          backgroundColor: '#0f172a',
          padding: '40px',
        }}
      >
        {/* Main Card - Matching popup style */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 100px',
            border: '4px solid rgba(96, 165, 250, 0.3)',
            backgroundColor: 'rgba(96, 165, 250, 0.1)',
          }}
        >
          {/* Icon - Target */}
          <div
            style={{
              display: 'flex',
              width: '100px',
              height: '100px',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px',
            }}
          >
            <svg
              width="80"
              height="80"
              viewBox="0 0 24 24"
              fill="none"
              stroke={iconColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="6" />
              <circle cx="12" cy="12" r="2" />
            </svg>
          </div>
          
          {/* Title */}
          <div
            style={{
              display: 'flex',
              fontSize: 32,
              fontWeight: 'bold',
              color: iconColor,
              marginBottom: 8,
              textTransform: 'uppercase',
              letterSpacing: '2px',
            }}
          >
            WIN RATE
          </div>
          
          {/* Subtitle */}
          <div
            style={{
              display: 'flex',
              fontSize: 14,
              color: '#64748b',
              marginBottom: 24,
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            @{username}&apos;s accuracy
          </div>
          
          {/* Value */}
          <div
            style={{
              display: 'flex',
              fontSize: 64,
              fontWeight: 'bold',
              color: iconColor,
            }}
          >
            {winRate.toFixed(1)}%
          </div>
        </div>
        
        {/* Footer - Alphabit Branding */}
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            bottom: 40,
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: 24,
              fontWeight: 'bold',
              color: '#4ade80',
              letterSpacing: '4px',
            }}
          >
            ALPHABIT
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
