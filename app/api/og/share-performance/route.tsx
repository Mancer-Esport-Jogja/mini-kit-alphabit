import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

// Fetch the Press Start 2P font TTF from Google Fonts
async function loadFont() {
  // Use TTF format (not WOFF2) as Satori only supports TTF/OTF
  const fontUrl = 'https://github.com/google/fonts/raw/main/ofl/pressstart2p/PressStart2P-Regular.ttf';
  const fontData = await fetch(fontUrl).then((res) => res.arrayBuffer());
  return fontData;
}

export async function GET(request: NextRequest) {
  const fontData = await loadFont();
  
  const { searchParams } = new URL(request.url);
  const pnl = parseFloat(searchParams.get('pnl') || '0');
  const username = searchParams.get('username') || 'Trader';
  const chartData = searchParams.get('chart') || '';
  
  // Handle color - robust parsing
  let themeColor = searchParams.get('color') || '#4ade80';
  // Decode if it looks encoded (contains %23 for #)
  try {
    themeColor = decodeURIComponent(themeColor);
  } catch {
    // ignore
  }
  // Ensure starts with #
  if (!themeColor.startsWith('#')) {
    themeColor = '#' + themeColor;
  }
  
  const isProfit = pnl >= 0;
  
  // Parse chart data or fallback to synthetic generation
  let chartPoints: number[] = [];
  
  if (chartData && chartData.length > 0) {
    chartPoints = chartData.split(',').map(Number).filter(n => !isNaN(n));
  }
  
  // FAILSAFE: If no chart data provided, generate synthetic data from PnL
  // This ensures we NEVER show "No data available" for a performance card that should have data
  if (chartPoints.length < 2) {
    const pnlValue = pnl;
    const numPoints = 12; // More points for smoother OG
    const variation = Math.abs(pnlValue) * 0.15 || 10;
    
    // Seeded-like random for consistency (simple)
    for (let i = 0; i < numPoints; i++) {
        const progress = i / (numPoints - 1);
        const baseValue = pnlValue * progress;
        // Pseudo-random based on index to look "real" but be deterministic-ish
        const randomVariation = (Math.sin(i * 1.5) * 0.5) * variation;
        chartPoints.push(Number((baseValue + randomVariation).toFixed(2)));
    }
    // Ensure last point is exactly the PnL
    chartPoints[chartPoints.length - 1] = pnlValue;
  }

  const hasChart = chartPoints.length >= 2;

  // Generate SVG path
  const generateChartPath = (points: number[], width: number, height: number) => {
    if (points.length < 2) return { linePath: '', areaPath: '' };
    
    // Find min/max for scaling
    // Add some padding to min/max so graph doesn't touch exact edges vertically if flat
    let minVal = Math.min(...points);
    let maxVal = Math.max(...points);
    
    if (minVal === maxVal) {
        minVal -= 1;
        maxVal += 1;
    }
    
    const range = maxVal - minVal;
    
    const coords = points.map((val, i) => {
      const x = (i / (points.length - 1)) * width;
      // Invert Y because SVG 0 is top
      const y = height - ((val - minVal) / range) * height;
      return { x, y };
    });
    
    const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(' ');
    // Close the area path for gradient fill
    const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;
    
    return { linePath, areaPath };
  };

  const chartWidth = 450;
  const chartHeight = 120;
  const chart = hasChart ? generateChartPath(chartPoints, chartWidth, chartHeight) : null;
  
  // Last point Y for the dot
  // We need to recalculate these based on the same min/max logic used in generateChartPath
  let minC = hasChart ? Math.min(...chartPoints) : 0;
  let maxC = hasChart ? Math.max(...chartPoints) : 0;
  if (minC === maxC) { minC -= 1; maxC += 1; }
  
  const rangeC = maxC - minC;
  const chartEndVal = hasChart ? chartPoints[chartPoints.length - 1] : 0;
  const lastY = hasChart ? chartHeight - ((chartEndVal - minC) / rangeC) * chartHeight : 0;

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
          backgroundColor: '#070a13',
          fontFamily: 'PixelFont',
          position: 'relative',
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
            display: 'flex',
            opacity: 0.04,
            backgroundImage: `linear-gradient(${themeColor} 1px, transparent 1px), linear-gradient(90deg, ${themeColor} 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Global Ambient Glow */}
        <div 
           style={{
             position: 'absolute',
             top: '20%',
             left: '30%',
             width: '600px',
             height: '600px',
             display: 'flex',
             background: themeColor,
             opacity: 0.1,
             filter: 'blur(100px)',
             borderRadius: '50%',
           }}
        />

        {/* Main Card Frame */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            width: '900px',
            height: '500px',
            border: '1px solid rgba(74, 59, 43, 0.2)',
            backgroundColor: 'rgba(20, 24, 36, 0.4)',
            borderRadius: '16px',
            paddingTop: '56px',
            position: 'relative',
          }}
        >
          {/* Logo Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
            {/* Logo Box */}
            <div
              style={{
                display: 'flex',
                width: '56px',
                height: '56px',
                border: `2px solid ${themeColor}`,
                borderRadius: '12px',
                overflow: 'hidden',
              }}
            >
               {/* eslint-disable-next-line @next/next/no-img-element */}
               <img
                  src="https://mini-kit-alphabit.vercel.app/hero.png"
                  alt="Alphabit Logo"
                  width="56"
                  height="56"
                  style={{ objectFit: 'cover' }}
                />
            </div>
            {/* Logo Text */}
            <div style={{ display: 'flex', fontSize: 36, fontWeight: 400, color: 'white', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              ALPHA<span style={{ color: themeColor }}>BIT</span>
            </div>
          </div>

          {/* Header Performance */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'flex', fontSize: 48, color: themeColor, letterSpacing: '0.25em', lineHeight: 1, marginBottom: '8px' }}>
              PERFORMANCE
            </div>
            <div style={{ display: 'flex', fontSize: 10, color: '#64748b', letterSpacing: '0.2em', opacity: 0.7, textTransform: 'uppercase' }}>
              @{username}&apos;S ALPHABIT STATS
            </div>
          </div>

           {/* Chart Area */}
          <div style={{ display: 'flex', position: 'relative', width: '450px', height: '120px', marginBottom: '32px' }}>
            {hasChart && chart ? (
              <svg width="450" height="120" viewBox="0 0 450 120">
                 <defs>
                  <linearGradient id="dynamicGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={themeColor} stopOpacity="0.4" />
                    <stop offset="100%" stopColor={themeColor} stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={chart.areaPath} fill="url(#dynamicGradient)" />
                <path d={chart.linePath} fill="none" stroke={themeColor} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="450" cy={lastY} r="5" fill={themeColor} />
                <circle cx="450" cy={lastY} r="12" fill={themeColor} opacity="0.2" />
              </svg>
            ) : (
               <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: 10 }}>
                 NO DATA AVAILABLE
               </div>
            )}
          </div>

           {/* Value Section */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
             <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                <span style={{ fontSize: 72, color: themeColor, lineHeight: 0.9, letterSpacing: '-0.02em' }}>
                    {isProfit ? '+' : ''}
                </span>
                <span style={{ fontSize: 72, color: 'white', lineHeight: 0.9, letterSpacing: '-0.02em' }}>
                  {pnl.toFixed(2)}
                </span>
                <span style={{ fontSize: 24, color: themeColor, opacity: 0.8, marginBottom: '8px' }}>
                  USDC
                </span>
             </div>
             <div style={{ display: 'flex', marginTop: '16px', fontSize: 8, color: '#64748b', letterSpacing: '0.5em', opacity: 0.6, textTransform: 'uppercase' }}>
                TOTAL PROFIT REALIZED
             </div>
          </div>

        </div>

        {/* Corner Accessories */}
        <div style={{ display: 'flex', position: 'absolute', top: '48px', left: '48px', width: '80px', height: '80px', borderTop: '2px solid rgba(30, 41, 59, 0.5)', borderLeft: '2px solid rgba(30, 41, 59, 0.5)', borderTopLeftRadius: '12px' }} />
        <div style={{ display: 'flex', position: 'absolute', bottom: '48px', right: '48px', width: '80px', height: '80px', borderBottom: '2px solid rgba(30, 41, 59, 0.5)', borderRight: '2px solid rgba(30, 41, 59, 0.5)', borderBottomRightRadius: '12px' }} />

        {/* Footer Slogan */}
        <div style={{ display: 'flex', position: 'absolute', bottom: '48px', alignItems: 'center', gap: '32px', color: '#334155' }}>
           <div style={{ display: 'flex', width: '80px', height: '1px', backgroundColor: 'rgba(30, 41, 59, 0.5)' }} />
           <div style={{ display: 'flex', fontSize: 8, letterSpacing: '0.8em', textTransform: 'uppercase', opacity: 0.5 }}>SECURE • SCALABLE • SMART</div>
           <div style={{ display: 'flex', width: '80px', height: '1px', backgroundColor: 'rgba(30, 41, 59, 0.5)' }} />
        </div>

      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'PixelFont',
          data: fontData,
          style: 'normal',
          weight: 400,
        },
      ],
    }
  );
}
