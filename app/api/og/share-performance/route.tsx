import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pnl = parseFloat(searchParams.get('pnl') || '0');
  const username = searchParams.get('username') || 'Trader';
  const winRate = parseFloat(searchParams.get('winrate') || '0');
  const missions = parseInt(searchParams.get('missions') || '0');
  
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
            padding: '60px 80px',
            border: `4px solid #f97316`,
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
            📈 ALPHABIT
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
            @{username}&apos;s Performance
          </div>
          
          {/* Stats Grid */}
          <div
            style={{
              display: 'flex',
              gap: '40px',
              marginBottom: 20,
            }}
          >
            {/* PNL */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '20px 30px',
                backgroundColor: '#1e293b',
                border: '2px solid #334155',
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  color: '#64748b',
                  marginBottom: 8,
                  textTransform: 'uppercase',
                }}
              >
                Total PNL
              </div>
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 'bold',
                  color: isProfit ? '#4ade80' : '#fb7185',
                }}
              >
                {isProfit ? '+' : ''}{pnl.toFixed(2)}
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: '#475569',
                }}
              >
                USDC
              </div>
            </div>
            
            {/* Win Rate */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '20px 30px',
                backgroundColor: '#1e293b',
                border: '2px solid #334155',
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  color: '#64748b',
                  marginBottom: 8,
                  textTransform: 'uppercase',
                }}
              >
                Win Rate
              </div>
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 'bold',
                  color: '#60a5fa',
                }}
              >
                {winRate.toFixed(1)}%
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: '#475569',
                }}
              >
                ACCURACY
              </div>
            </div>
            
            {/* Missions */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '20px 30px',
                backgroundColor: '#1e293b',
                border: '2px solid #334155',
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  color: '#64748b',
                  marginBottom: 8,
                  textTransform: 'uppercase',
                }}
              >
                Missions
              </div>
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 'bold',
                  color: '#a855f7',
                }}
              >
                {missions}
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: '#475569',
                }}
              >
                COMPLETED
              </div>
            </div>
          </div>
          
          {/* Label */}
          <div
            style={{
              marginTop: 20,
              fontSize: 18,
              color: '#f97316',
              textTransform: 'uppercase',
              letterSpacing: '2px',
            }}
          >
            Overall Performance
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
