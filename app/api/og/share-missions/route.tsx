import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const missions = parseInt(searchParams.get('missions') || '0');
  const username = searchParams.get('username') || 'Trader';

  // Determine rank based on missions
  const getRank = (m: number) => {
    if (m >= 100) return { title: 'LEGENDARY', color: '#fbbf24' };
    if (m >= 50) return { title: 'VETERAN', color: '#a855f7' };
    if (m >= 20) return { title: 'EXPERIENCED', color: '#60a5fa' };
    if (m >= 5) return { title: 'ROOKIE', color: '#4ade80' };
    return { title: 'CADET', color: '#94a3b8' };
  };

  const rank = getRank(missions);

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
        {/* Border Container */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 80px',
            border: '4px solid #a855f7',
            backgroundColor: '#1e293b',
          }}
        >
          {/* Logo */}
          <div
            style={{
              display: 'flex',
              fontSize: 36,
              fontWeight: 'bold',
              color: '#4ade80',
              marginBottom: 24,
              letterSpacing: '4px',
            }}
          >
            ALPHABIT
          </div>
          
          {/* Username */}
          <div
            style={{
              display: 'flex',
              fontSize: 24,
              color: '#94a3b8',
              marginBottom: 40,
              textTransform: 'uppercase',
            }}
          >
            @{username}
          </div>
          
          {/* Missions Label */}
          <div
            style={{
              display: 'flex',
              fontSize: 18,
              color: '#64748b',
              marginBottom: 16,
              textTransform: 'uppercase',
              letterSpacing: '2px',
            }}
          >
            MISSIONS COMPLETED
          </div>
          
          {/* Missions Value */}
          <div
            style={{
              display: 'flex',
              fontSize: 80,
              fontWeight: 'bold',
              color: '#a855f7',
              marginBottom: 16,
            }}
          >
            {missions}
          </div>
          
          {/* Rank Badge */}
          <div
            style={{
              display: 'flex',
              fontSize: 24,
              color: rank.color,
              textTransform: 'uppercase',
              padding: '8px 24px',
              border: `2px solid ${rank.color}`,
            }}
          >
            {rank.title}
          </div>
        </div>
        
        {/* Footer */}
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            bottom: 40,
            fontSize: 18,
            color: '#475569',
          }}
        >
          Let&apos;s Trade
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
