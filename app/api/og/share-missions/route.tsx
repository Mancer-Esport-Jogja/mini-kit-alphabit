import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const missions = parseInt(searchParams.get('missions') || '0');
  const username = searchParams.get('username') || 'Trader';

  const iconColor = '#a855f7'; // purple-400

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
            border: '4px solid rgba(168, 85, 247, 0.3)',
            backgroundColor: 'rgba(168, 85, 247, 0.1)',
          }}
        >
          {/* Icon - Gamepad2 */}
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
              <line x1="6" y1="11" x2="10" y2="11" />
              <line x1="8" y1="9" x2="8" y2="13" />
              <line x1="15" y1="12" x2="15.01" y2="12" />
              <line x1="18" y1="10" x2="18.01" y2="10" />
              <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z" />
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
            TOTAL MISSIONS
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
            @{username}&apos;s experience
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
            {missions} Missions
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
