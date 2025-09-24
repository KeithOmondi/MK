import React, { useEffect, useState } from "react";

interface CountdownProps {
  targetDate?: string; // now optional
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const Countdown: React.FC<CountdownProps> = ({ targetDate }) => {
  const calculateTimeLeft = (): TimeLeft => {
    if (!targetDate) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const target = new Date(targetDate).getTime();
    if (isNaN(target)) {
      // invalid date string
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const now = new Date().getTime();
    const difference = target - now;

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  };

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const formatNumber = (num: number) => String(num).padStart(2, "0");

  // ✅ Don’t render anything if no valid targetDate
  if (!targetDate || isNaN(new Date(targetDate).getTime())) {
    return null;
  }

  return (
    <div className="flex gap-2 text-white font-bold text-lg">
      <span className="bg-red-600 px-2 py-1 rounded">{timeLeft.days}d</span>
      <span className="bg-red-600 px-2 py-1 rounded">{formatNumber(timeLeft.hours)}h</span>
      <span className="bg-red-600 px-2 py-1 rounded">{formatNumber(timeLeft.minutes)}m</span>
      <span className="bg-red-600 px-2 py-1 rounded">{formatNumber(timeLeft.seconds)}s</span>
    </div>
  );
};

export default Countdown;
