import React, { useState, useEffect } from 'react';

interface CountdownProps {
  targetTimestamp: number; // in seconds
  onExpire?: () => void;
}

export const Countdown: React.FC<CountdownProps> = ({ targetTimestamp, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = Math.floor(Date.now() / 1000);
      const difference = targetTimestamp - now;

      if (difference <= 0) {
        setIsExpired(true);
        setTimeLeft('EXPIRED');
        if (onExpire) onExpire();
        return;
      }

      const hours = Math.floor(difference / 3600);
      const minutes = Math.floor((difference % 3600) / 60);
      const seconds = difference % 60;

      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${minutes}m ${seconds.toString().padStart(2, '0')}s`);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetTimestamp, onExpire]);

  return (
    <span className={isExpired ? 'text-slate-500' : 'text-yellow-500'}>
      {timeLeft}
    </span>
  );
};
