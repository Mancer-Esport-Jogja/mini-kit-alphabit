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
            border: `4px solid ${isProfit ? '#4ade80' : '#fb7185'}`,
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
          
          {/* PNL Label */}
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
            TOTAL PNL
          </div>
          
          {/* PNL Value */}
          <div
            style={{
              display: 'flex',
              fontSize: 80,
              fontWeight: 'bold',
              color: isProfit ? '#4ade80' : '#fb7185',
              marginBottom: 16,
            }}
          >
            {isProfit ? '+' : ''}{pnlNum.toFixed(2)}
          </div>
          
          {/* Currency */}
          <div
            style={{
              display: 'flex',
              fontSize: 32,
              color: '#64748b',
              textTransform: 'uppercase',
            }}
          >
            USDC
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
