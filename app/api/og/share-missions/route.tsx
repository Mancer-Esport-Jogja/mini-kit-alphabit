import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const missions = parseInt(searchParams.get('missions') || '0');
  const username = searchParams.get('username') || 'Trader';
  
  // Determine rank based on missions
  const getRank = (count: number) => {
    if (count >= 100) return { title: 'LEGEND', emoji: '👑' };
    if (count >= 50) return { title: 'VETERAN', emoji: '⭐' };
    if (count >= 20) return { title: 'EXPERT', emoji: '🎖️' };
    if (count >= 10) return { title: 'SKILLED', emoji: '💪' };
    return { title: 'ROOKIE', emoji: '🚀' };
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
          backgroundColor: '#0a0a0a',
          fontFamily: 'monospace',
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
            backgroundImage: 'radial-gradient(circle at 25% 25%, #1e293b 2px, transparent 2px)',
            backgroundSize: '40px 40px',
            opacity: 0.3,
          }}
        />
        
        {/* Content Container */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '60px',
            border: `4px solid #a855f7`,
            backgroundColor: '#0f172a',
          }}
        >
          {/* Logo/Brand */}
          <div
            style={{
              fontSize: 32,
              fontWeight: 'bold',
              color: '#4ade80',
              marginBottom: 20,
              letterSpacing: '4px',
            }}
          >
            🎮 ALPHABIT
          </div>
          
          {/* Username */}
          <div
            style={{
              fontSize: 24,
              color: '#94a3b8',
              marginBottom: 40,
              textTransform: 'uppercase',
            }}
          >
            @{username}&apos;s Journey
          </div>
          
          {/* Missions Value */}
          <div
            style={{
              fontSize: 72,
              fontWeight: 'bold',
              color: '#a855f7',
              marginBottom: 20,
            }}
          >
            {missions}
          </div>
          
          {/* Label */}
          <div
            style={{
              fontSize: 28,
              color: '#c4b5fd',
              textTransform: 'uppercase',
            }}
          >
            MISSIONS COMPLETED
          </div>
          
          {/* Rank */}
          <div
            style={{
              marginTop: 40,
              fontSize: 24,
              color: '#fbbf24',
              textTransform: 'uppercase',
              letterSpacing: '2px',
            }}
          >
            {rank.emoji} {rank.title}
          </div>
        </div>
        
        {/* Footer */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            fontSize: 16,
            color: '#475569',
          }}
        >
          Trade Options on Farcaster
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 800,
      headers: {
        'Cache-Control': 'public, immutable, no-transform, max-age=300',
      },
    }
  );
}
