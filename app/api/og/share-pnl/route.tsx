import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pnl = searchParams.get('pnl') || '0';
  const username = searchParams.get('username') || 'Trader';
  
  const pnlNum = parseFloat(pnl);
  const isProfit = pnlNum >= 0;
  const iconColor = isProfit ? '#4ade80' : '#fb7185';

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
            border: `4px solid ${isProfit ? 'rgba(74, 222, 128, 0.3)' : 'rgba(251, 113, 133, 0.3)'}`,
            backgroundColor: isProfit ? 'rgba(74, 222, 128, 0.1)' : 'rgba(251, 113, 133, 0.1)',
          }}
        >
          {/* Icon */}
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
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
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
            TOTAL PNL
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
            @{username}&apos;s profit/loss
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
            {isProfit ? '+' : ''}{pnlNum.toFixed(2)} USDC
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
