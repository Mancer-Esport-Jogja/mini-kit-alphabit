import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pnl = parseFloat(searchParams.get('pnl') || '0');
  const winRate = parseFloat(searchParams.get('winrate') || '0');
  const missions = parseInt(searchParams.get('missions') || '0');
  const username = searchParams.get('username') || 'Trader';
  
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
            padding: '50px 60px',
            border: '4px solid #fb923c',
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
              marginBottom: 16,
              letterSpacing: '4px',
            }}
          >
            ALPHABIT
          </div>
          
          {/* Username */}
          <div
            style={{
              display: 'flex',
              fontSize: 22,
              color: '#94a3b8',
              marginBottom: 30,
              textTransform: 'uppercase',
            }}
          >
            @{username} Performance
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
                backgroundColor: '#0f172a',
                border: `2px solid ${isProfit ? '#4ade80' : '#fb7185'}`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  fontSize: 14,
                  color: '#64748b',
                  marginBottom: 8,
                  textTransform: 'uppercase',
                }}
              >
                TOTAL PNL
              </div>
              <div
                style={{
                  display: 'flex',
                  fontSize: 36,
                  fontWeight: 'bold',
                  color: isProfit ? '#4ade80' : '#fb7185',
                }}
              >
                {isProfit ? '+' : ''}{pnl.toFixed(2)}
              </div>
              <div
                style={{
                  display: 'flex',
                  fontSize: 14,
                  color: '#64748b',
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
                backgroundColor: '#0f172a',
                border: '2px solid #60a5fa',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  fontSize: 14,
                  color: '#64748b',
                  marginBottom: 8,
                  textTransform: 'uppercase',
                }}
              >
                WIN RATE
              </div>
              <div
                style={{
                  display: 'flex',
                  fontSize: 36,
                  fontWeight: 'bold',
                  color: '#60a5fa',
                }}
              >
                {winRate.toFixed(1)}%
              </div>
              <div
                style={{
                  display: 'flex',
                  fontSize: 14,
                  color: '#64748b',
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
                backgroundColor: '#0f172a',
                border: '2px solid #a855f7',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  fontSize: 14,
                  color: '#64748b',
                  marginBottom: 8,
                  textTransform: 'uppercase',
                }}
              >
                MISSIONS
              </div>
              <div
                style={{
                  display: 'flex',
                  fontSize: 36,
                  fontWeight: 'bold',
                  color: '#a855f7',
                }}
              >
                {missions}
              </div>
              <div
                style={{
                  display: 'flex',
                  fontSize: 14,
                  color: '#64748b',
                }}
              >
                COMPLETED
              </div>
            </div>
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
