"use client";

import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';

// --- COLOR THEMES ---
const COLOR_THEMES = [
  { main: '#EF4444', dark: '#991B1B', light: '#FCA5A5' }, // Red
  { main: '#F97316', dark: '#9A3412', light: '#FDBA74' }, // Orange
  { main: '#EAB308', dark: '#854D0E', light: '#FDE047' }, // Yellow
  { main: '#22C55E', dark: '#166534', light: '#86EFAC' }, // Green
  { main: '#06B6D4', dark: '#155E75', light: '#67E8F9' }, // Cyan
  { main: '#3B82F6', dark: '#1E40AF', light: '#93C5FD' }, // Blue
  { main: '#A855F7', dark: '#6B21A8', light: '#D8B4FE' }, // Purple
  { main: '#EC4899', dark: '#9D174D', light: '#F9A8D4' }, // Pink
  { main: '#6366F1', dark: '#3730A3', light: '#A5B4FC' }, // Indigo
  { main: '#14B8A6', dark: '#0F766E', light: '#5EEAD4' }, // Teal
];

const getRandomTheme = () => COLOR_THEMES[Math.floor(Math.random() * COLOR_THEMES.length)];

// --- TYPING ---
interface Theme {
  main: string;
  dark: string;
  light: string;
}

interface ShipProps {
  className?: string;
  style?: React.CSSProperties;
  theme: Theme;
}

interface ShipData {
  id: number;
  Component: React.FC<ShipProps>;
  theme: Theme;
  direction: string;
  duration: number;
  delay: number;
  top: number;
  left: number;
  size: number;
}

interface StarData {
  width: string;
  height: string;
  top: string;
  left: string;
  opacity: number;
  animation: string;
}

// --- ASSETS: SHIPS (Dynamic Colors) ---

const ShipShapeA = ({ className, style, theme }: ShipProps) => (
  <svg viewBox="0 0 180 180" className={className} style={style} shapeRendering="crispEdges">
    <path d="M50 10h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zM40 20h10v10h-10zM130 20h10v10h-10zM30 30h10v10h-10zM140 30h10v10h-10zM20 40h10v10h-10zM150 40h10v10h-10zM10 50h10v10h-10zM160 50h10v10h-10zM10 60h10v10h-10zM160 60h10v10h-10zM10 70h10v10h-10zM160 70h10v10h-10zM10 80h10v10h-10zM160 80h10v10h-10zM10 90h10v10h-10zM160 90h10v10h-10zM10 100h10v10h-10zM160 100h10v10h-10zM10 110h10v10h-10zM160 110h10v10h-10zM10 120h10v10h-10zM160 120h10v10h-10zM20 130h10v10h-10zM150 130h10v10h-10zM30 140h10v10h-10zM140 140h10v10h-10zM40 150h10v10h-10zM130 150h10v10h-10zM50 160h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10z" fill="#000"/>
    <path d="M50 20h10v10h-10zM110 20h10v10h-10zm10 0h10v10h-10zM110 30h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zM30 40h10v10h-10zm90 0h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zM20 50h10v10h-10zm100 50h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zM20 60h10v10h-10zm10 0h10v10h-10zm80 0h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zM20 70h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zM100 70h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zM20 80h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zM110 80h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zM20 90h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zM120 90h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zM20 100h10v10h-10zm20 0h10v10h-10zM70 100h10v10h-10zM110 100h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zM20 110h10v10h-10zm70 0h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zM150 110h10v10h-10zM80 120h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zM150 120h10v10h-10zM80 130h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zM90 140h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zM90 150h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10z" fill={theme.main}/>
    <path d="M60 20h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zM40 30h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zM50 40h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zM30 50h10v10h-10zm30 0h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zM40 60h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zM50 70h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zM50 80h10v10h-10zm20 0h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zM60 90h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zM30 100h10v10h-10zm20 0h10v10h-10zm10 0h10v10h-10zm20 0h10v10h-10zm10 0h10v10h-10zM30 110h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zm50 0h10v10h-10zm10 0h10v10h-10zM20 120h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zm50 0h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zM30 130h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zm50 0h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zM40 140h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zm50 0h10v10h-10zM50 150h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10zm10 0h10v10h-10z" fill={theme.light} opacity="0.8"/>
    <path d="M40 40h10v10h-10zM40 50h10v10h-10zm10 0h10v10h-10z" fill="#e1deed"/>
  </svg>
);

const ShipShapeB = ({ className, style, theme }: ShipProps) => (
  <svg viewBox="0 0 160 160" className={className} style={style} shapeRendering="crispEdges">
    <rect x="70" y="0" width="10" height="10" fill="#000" /><rect x="80" y="0" width="10" height="10" fill="#000" /><rect x="60" y="10" width="10" height="10" fill="#000" /><rect x="70" y="10" width="10" height="10" fill="#ecedde" /><rect x="80" y="10" width="10" height="10" fill="#ecedde" /><rect x="90" y="10" width="10" height="10" fill="#000" /><rect x="60" y="20" width="10" height="10" fill="#000" /><rect x="70" y="20" width="10" height="10" fill="#ecedde" /><rect x="80" y="20" width="10" height="10" fill="#ecedde" /><rect x="90" y="20" width="10" height="10" fill="#000" /><rect x="60" y="30" width="10" height="10" fill="#000" /><rect x="70" y="30" width="10" height="10" fill={theme.main} /><rect x="80" y="30" width="10" height="10" fill={theme.main} /><rect x="90" y="30" width="10" height="10" fill="#000" /><rect x="50" y="40" width="10" height="10" fill="#000" /><rect x="60" y="40" width="10" height="10" fill={theme.main} /><rect x="70" y="40" width="10" height="10" fill={theme.main} /><rect x="80" y="40" width="10" height="10" fill={theme.main} /><rect x="90" y="40" width="10" height="10" fill={theme.main} /><rect x="100" y="40" width="10" height="10" fill="#000" /><rect x="40" y="50" width="10" height="10" fill="#000" /><rect x="50" y="50" width="10" height="10" fill={theme.main} /><rect x="60" y="50" width="10" height="10" fill={theme.main} /><rect x="70" y="50" width="10" height="10" fill={theme.main} /><rect x="80" y="50" width="10" height="10" fill={theme.main} /><rect x="90" y="50" width="10" height="10" fill={theme.main} /><rect x="100" y="50" width="10" height="10" fill={theme.main} /><rect x="110" y="50" width="10" height="10" fill="#000" /><rect x="30" y="60" width="10" height="10" fill="#000" /><rect x="40" y="60" width="10" height="10" fill={theme.main} /><rect x="50" y="60" width="10" height="10" fill={theme.main} /><rect x="60" y="60" width="10" height="10" fill={theme.main} /><rect x="70" y="60" width="10" height="10" fill={theme.dark} /><rect x="80" y="60" width="10" height="10" fill={theme.dark} /><rect x="90" y="60" width="10" height="10" fill={theme.main} /><rect x="100" y="60" width="10" height="10" fill={theme.main} /><rect x="110" y="60" width="10" height="10" fill={theme.main} /><rect x="120" y="60" width="10" height="10" fill="#000" />
    <rect x="20" y="70" width="10" height="10" fill="#000" /><rect x="30" y="70" width="10" height="10" fill={theme.main} /><rect x="40" y="70" width="10" height="10" fill={theme.main} /><rect x="50" y="70" width="10" height="10" fill={theme.main} /><rect x="60" y="70" width="10" height="10" fill={theme.main} /><rect x="70" y="70" width="10" height="10" fill={theme.main} /><rect x="80" y="70" width="10" height="10" fill={theme.main} /><rect x="90" y="70" width="10" height="10" fill={theme.main} /><rect x="100" y="70" width="10" height="10" fill={theme.main} /><rect x="110" y="70" width="10" height="10" fill={theme.main} /><rect x="120" y="70" width="10" height="10" fill={theme.main} /><rect x="130" y="70" width="10" height="10" fill="#000" />
    <rect x="10" y="80" width="10" height="10" fill="#000" /><rect x="20" y="80" width="10" height="10" fill={theme.main} /><rect x="30" y="80" width="10" height="10" fill={theme.main} /><rect x="40" y="80" width="10" height="10" fill={theme.main} /><rect x="50" y="80" width="10" height="10" fill={theme.main} /><rect x="60" y="80" width="10" height="10" fill={theme.main} /><rect x="70" y="80" width="10" height="10" fill={theme.dark} /><rect x="80" y="80" width="10" height="10" fill={theme.dark} /><rect x="90" y="80" width="10" height="10" fill={theme.main} /><rect x="100" y="80" width="10" height="10" fill={theme.main} /><rect x="110" y="80" width="10" height="10" fill={theme.main} /><rect x="120" y="80" width="10" height="10" fill={theme.main} /><rect x="130" y="80" width="10" height="10" fill={theme.main} /><rect x="140" y="80" width="10" height="10" fill="#000" />
    <rect x="0" y="90" width="10" height="10" fill="#000" /><rect x="10" y="90" width="10" height="10" fill={theme.main} /><rect x="20" y="90" width="10" height="10" fill={theme.main} /><rect x="30" y="90" width="10" height="10" fill={theme.main} /><rect x="40" y="90" width="10" height="10" fill={theme.main} /><rect x="50" y="90" width="10" height="10" fill={theme.main} /><rect x="60" y="90" width="10" height="10" fill={theme.main} /><rect x="70" y="90" width="10" height="10" fill={theme.main} /><rect x="80" y="90" width="10" height="10" fill={theme.main} /><rect x="90" y="90" width="10" height="10" fill={theme.main} /><rect x="100" y="90" width="10" height="10" fill={theme.main} /><rect x="110" y="90" width="10" height="10" fill={theme.main} /><rect x="120" y="90" width="10" height="10" fill={theme.main} /><rect x="130" y="90" width="10" height="10" fill={theme.main} /><rect x="140" y="90" width="10" height="10" fill={theme.main} /><rect x="150" y="90" width="10" height="10" fill="#000" />
    <rect x="0" y="100" width="10" height="10" fill="#000" /><rect x="10" y="100" width="10" height="10" fill="#000" /><rect x="20" y="100" width="10" height="10" fill="#000" /><rect x="30" y="100" width="10" height="10" fill={theme.main} /><rect x="40" y="100" width="10" height="10" fill={theme.main} /><rect x="50" y="100" width="10" height="10" fill={theme.main} /><rect x="60" y="100" width="10" height="10" fill="#000" /><rect x="70" y="100" width="10" height="10" fill="#000" /><rect x="80" y="100" width="10" height="10" fill="#000" /><rect x="90" y="100" width="10" height="10" fill="#000" /><rect x="100" y="100" width="10" height="10" fill={theme.main} /><rect x="110" y="100" width="10" height="10" fill={theme.main} /><rect x="120" y="100" width="10" height="10" fill={theme.main} /><rect x="130" y="100" width="10" height="10" fill="#000" /><rect x="140" y="100" width="10" height="10" fill="#000" /><rect x="150" y="100" width="10" height="10" fill="#000" />
    <rect x="20" y="110" width="10" height="10" fill="#000" /><rect x="30" y="110" width="10" height="10" fill={theme.main} /><rect x="40" y="110" width="10" height="10" fill={theme.main} /><rect x="50" y="110" width="10" height="10" fill="#000" /><rect x="100" y="110" width="10" height="10" fill="#000" /><rect x="110" y="110" width="10" height="10" fill={theme.main} /><rect x="120" y="110" width="10" height="10" fill={theme.main} /><rect x="130" y="110" width="10" height="10" fill="#000" />
    <rect x="20" y="120" width="10" height="10" fill="#000" /><rect x="30" y="120" width="10" height="10" fill={theme.main} /><rect x="40" y="120" width="10" height="10" fill="#000" /><rect x="110" y="120" width="10" height="10" fill="#000" /><rect x="120" y="120" width="10" height="10" fill={theme.main} /><rect x="130" y="120" width="10" height="10" fill="#000" />
    <rect x="20" y="130" width="10" height="10" fill="#000" /><rect x="30" y="130" width="10" height="10" fill={theme.dark} /><rect x="40" y="130" width="10" height="10" fill="#000" /><rect x="110" y="130" width="10" height="10" fill="#000" /><rect x="120" y="130" width="10" height="10" fill={theme.dark} /><rect x="130" y="130" width="10" height="10" fill="#000" />
    <rect x="20" y="140" width="10" height="10" fill="#000" /><rect x="30" y="140" width="10" height="10" fill="#000" /><rect x="40" y="140" width="10" height="10" fill="#000" /><rect x="110" y="140" width="10" height="10" fill="#000" /><rect x="120" y="140" width="10" height="10" fill="#000" /><rect x="130" y="140" width="10" height="10" fill="#000" />
  </svg>
);

// --- MAIN COMPONENT ---

export default function AlphabitSplash() {
  const THEME = {
    primary: '#CA2D27', 
    secondary: '#0052FF', // Base Blue
    background: '#000000',
    text: '#ffffff'
  };

  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [notified, setNotified] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const [ships, setShips] = useState<ShipData[]>([]);
  const [stars, setStars] = useState<StarData[]>([]);

  // Generate Chaos Traffic (Ships) with RANDOM COLORS - Reduced Count
  useEffect(() => {
    const types = [ShipShapeA, ShipShapeB];
    const directions = ['up', 'down', 'left', 'right'];
    
    // Generate Ships
    const newShips = [...Array(12)].map((_, i) => ({
      id: i,
      Component: types[Math.floor(Math.random() * types.length)],
      theme: getRandomTheme(),
      direction: directions[Math.floor(Math.random() * directions.length)],
      duration: 15 + Math.random() * 25, 
      delay: -(Math.random() * 30), 
      top: Math.random() * 100, 
      left: Math.random() * 100, 
      size: 20 + Math.random() * 45 
    }));
    setShips(newShips);

    // Generate Stars
    const newStars = [...Array(60)].map(() => ({
      width: Math.random() > 0.8 ? '3px' : '2px',
      height: Math.random() > 0.8 ? '3px' : '2px',
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      opacity: Math.random(),
      animation: `twinkle ${2 + Math.random() * 4}s infinite`
    }));
    setStars(newStars);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setLoading(false);
          return 100;
        }
        return prev + Math.floor(Math.random() * 10) + 2; 
      });
    }, 150);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const targetDate = new Date('2026-02-01T00:00:00+07:00').getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden font-sans"
      style={{ backgroundColor: THEME.background, color: THEME.text }}
    >
      
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
          
          .font-pixel {
            font-family: 'Press Start 2P', cursive;
          }

          .scanlines {
            background: linear-gradient(
              to bottom,
              rgba(255,255,255,0),
              rgba(255,255,255,0) 50%,
              rgba(0,0,0,0.2) 50%,
              rgba(0,0,0,0.2)
            );
            background-size: 100% 4px;
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            pointer-events: none;
            z-index: 50;
          }
          
          .glow-text {
             text-shadow: 3px 3px 0px ${THEME.primary}40;
          }

          @keyframes moveRight {
             from { left: -15%; }
             to { left: 115%; }
          }
          @keyframes moveLeft {
             from { left: 115%; }
             to { left: -15%; }
          }
          @keyframes moveUp {
             from { top: 115%; }
             to { top: -15%; }
          }
          @keyframes moveDown {
             from { top: -15%; }
             to { top: 115%; }
          }

          @keyframes twinkle {
            0%, 100% { opacity: 0.2; }
            50% { opacity: 0.8; }
          }
        `}
      </style>

      <div className="scanlines"></div>

      {/* --- BACKGROUND LAYER --- */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        
        {/* Starfield */}
        {/* Starfield */}
        {stars.map((star: StarData, i: number) => (
          <div 
            key={`star-${i}`}
            className="absolute rounded-full bg-white"
            style={{
              width: star.width,
              height: star.height,
              top: star.top,
              left: star.left,
              opacity: star.opacity,
              animation: star.animation
            }}
          />
        ))}

        {/* Ships (Random Colors) */}
        {ships.map((ship) => {
          let rotation = '0deg';
          let animationName = '';
          let axisStyle: React.CSSProperties = {};

          switch(ship.direction) {
            case 'up':
              rotation = '0deg';
              animationName = 'moveUp';
              axisStyle = { left: `${ship.left}%` }; 
              break;
            case 'down':
              rotation = '180deg';
              animationName = 'moveDown';
              axisStyle = { left: `${ship.left}%` };
              break;
            case 'right':
              rotation = '90deg';
              animationName = 'moveRight';
              axisStyle = { top: `${ship.top}%` }; 
              break;
            case 'left':
              rotation = '-90deg';
              animationName = 'moveLeft';
              axisStyle = { top: `${ship.top}%` };
              break;
            default: break;
          }

          return (
            <div
              key={`ship-${ship.id}`}
              className="absolute"
              style={{
                ...axisStyle,
                width: `${ship.size}px`,
                height: `${ship.size}px`,
                animation: `${animationName} ${ship.duration}s linear infinite`,
                animationDelay: `${ship.delay}s`,
                zIndex: Math.floor(Math.random() * 10) 
              }}
            >
              <ship.Component 
                className="w-full h-full" 
                theme={ship.theme}
                style={{ transform: `rotate(${rotation})` }}
              />
            </div>
          );
        })}

      </div>

      {/* --- MAIN CONTAINER --- */}
      <div className="relative z-10 p-6 flex flex-col items-center max-w-sm w-full text-center">
        
        {/* --- MAIN LOGO --- */}
        <div className="mb-8 relative group">
          <div 
            className="w-24 h-24 border-4 border-white shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)] flex items-center justify-center relative z-10 overflow-hidden"
            style={{ backgroundColor: '#111' }}
          >
             <Image 
               src="/hero.png" 
               alt="Alphabit Logo"
               width={200}
               height={200} 
               className="w-full h-full object-cover"
             />
          </div>
          <div 
            className="w-24 h-24 absolute top-2 left-2 z-0"
            style={{ backgroundColor: THEME.secondary }}
          ></div>
        </div>

        {/* --- TITLE --- */}
        <h1 className="font-pixel text-2xl mb-2 glow-text tracking-widest text-white">
          ALPHABIT
        </h1>
        <p className="font-pixel text-[10px] mb-10 tracking-wider" style={{ color: THEME.secondary }}>
          Gamification Option Trading
        </p>

        {/* --- CONTENT AREA --- */}
        <div className="w-full border-2 border-[#333] p-1 shadow-[4px_4px_0px_0px_#222]" style={{ backgroundColor: 'rgba(17, 17, 17, 0.9)' }}>
           <div className="border border-[#333] p-6 flex flex-col items-center min-h-[160px] justify-center">
             
             {loading ? (
               <div className="w-full space-y-3">
                 <div className="flex justify-between font-pixel text-[8px] text-gray-400">
                   <span>INITIALIZING...</span>
                   <span>{Math.min(progress, 100)}%</span>
                 </div>
                 {/* Progress Bar */}
                 <div className="w-full h-4 bg-[#222] border border-gray-600 p-[2px]">
                   <div 
                     className="h-full" 
                     style={{ 
                       width: `${Math.min(progress, 100)}%`,
                       backgroundColor: THEME.primary 
                     }}
                   ></div>
                 </div>
                 <p className="font-pixel text-[8px] text-gray-600 mt-2 text-left">
                   {'>'} Loading assets...<br/>
                   {'>'} Syncing colors...
                 </p>
               </div>
             ) : (
               <div className="animate-fade-in w-full">
                 {!notified ? (
                   <>
                     <div className="mb-4 font-pixel text-[10px] leading-6 text-gray-300">
                       <p>THE APP IS CURRENTLY</p>
                       <p className="text-sm my-1 animate-pulse text-white">UNDER CONSTRUCTION</p>
                     </div>

                     {/* COUNTDOWN TIMER */}
                     <div className="flex justify-center gap-3 mb-6 border-y border-[#333] py-2 bg-[#1a1a1a]">
                        {['DAYS', 'HRS', 'MIN', 'SEC'].map((label, i) => {
                          const val = Object.values(timeLeft)[i];
                          return (
                            <React.Fragment key={label}>
                              <div className="text-center">
                                <div className="font-pixel text-sm text-white">
                                  {String(val).padStart(2, '0')}
                                </div>
                                <div className="font-pixel text-[6px] text-gray-500 mt-1">{label}</div>
                              </div>
                              {i < 3 && <div className="font-pixel text-gray-600 text-sm">:</div>}
                            </React.Fragment>
                          );
                        })}
                     </div>
                     
                     <div className="mb-4 font-pixel text-[10px] text-gray-300">
                        <p>JOIN THE WAITLIST</p>
                     </div>
                     
                     <button 
                        onClick={() => setNotified(true)}
                        className="w-full bg-white hover:bg-gray-200 text-black font-pixel text-[10px] py-3 border-b-4 border-r-4 border-gray-500 active:border-0 active:translate-y-1 transition-all flex items-center justify-center gap-2"
                     >
                        NOTIFY ME <ArrowRight size={12} />
                     </button>
                   </>
                 ) : (
                   <div className="text-center py-2">
                     <p className="font-pixel text-2xl mb-2" style={{ color: THEME.primary }}>OK!</p>
                     <p className="font-pixel text-[9px] text-gray-400">WE&apos;LL SIGNAL YOU SOON.</p>
                   </div>
                 )}
               </div>
             )}

           </div>
        </div>

        {/* --- FOOTER --- */}
        <div className="mt-12 flex flex-col items-center gap-2 opacity-60">
           <div className="flex gap-2">
              <span className="w-2 h-2 animate-pulse" style={{ backgroundColor: THEME.secondary }}></span>
              <span className="font-pixel text-[8px] text-gray-400">BASE MAINNET</span>
           </div>
           <p className="font-mono text-[10px] text-gray-600">© 2026 Alphabit Labs</p>
        </div>

      </div>
    </div>
  );
}
