import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pnl = searchParams.get('pnl') || '0';
  const username = searchParams.get('username') || 'Trader';
  
  const pnlNum = parseFloat(pnl);
  const isProfit = pnlNum >= 0;

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
            border: `4px solid ${isProfit ? '#4ade80' : '#fb7185'}`,
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
            🚀 ALPHABIT
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
          
          {/* PNL Value */}
          <div
            style={{
              fontSize: 72,
              fontWeight: 'bold',
              color: isProfit ? '#4ade80' : '#fb7185',
              marginBottom: 20,
            }}
          >
            {isProfit ? '+' : ''}{pnlNum.toFixed(2)}
          </div>
          
          {/* Currency */}
          <div
            style={{
              fontSize: 28,
              color: '#64748b',
              textTransform: 'uppercase',
            }}
          >
            USDC
          </div>
          
          {/* Label */}
          <div
            style={{
              marginTop: 40,
              fontSize: 18,
              color: '#475569',
              textTransform: 'uppercase',
              letterSpacing: '2px',
            }}
          >
            Total PNL
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
