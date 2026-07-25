import { useState, useEffect } from 'react';

const CountdownTimer = ({ endDate }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(endDate) - new Date();
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      } else {
        setTimeLeft('Ended');
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000); // update every minute
    return () => clearInterval(timer);
  }, [endDate]);

  if (!timeLeft || timeLeft === 'Ended') return null;

  return (
    <span className="block bg-black/70 text-white text-[10px] px-2 py-0.5 rounded mt-1">
      Ends in: {timeLeft}
    </span>
  );
};

export default CountdownTimer;