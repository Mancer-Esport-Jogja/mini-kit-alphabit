import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const winRate = parseFloat(searchParams.get('winrate') || '0');
  const username = searchParams.get('username') || 'Trader';
  
  const isGood = winRate >= 50;

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
            border: '4px solid #60a5fa',
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
          
          {/* Win Rate Label */}
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
            WIN RATE
          </div>
          
          {/* Win Rate Value */}
          <div
            style={{
              display: 'flex',
              fontSize: 80,
              fontWeight: 'bold',
              color: '#60a5fa',
              marginBottom: 16,
            }}
          >
            {winRate.toFixed(1)}%
          </div>
          
          {/* Status */}
          <div
            style={{
              display: 'flex',
              fontSize: 24,
              color: isGood ? '#4ade80' : '#fbbf24',
              textTransform: 'uppercase',
            }}
          >
            {isGood ? 'SHARP SHOOTER' : 'IMPROVING'}
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
