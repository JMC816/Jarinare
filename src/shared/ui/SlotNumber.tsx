import { useEffect, useRef, useState } from 'react';

type SlotNumberProps = {
  value: number;
  className?: string;
};

const DURATION = 1200;
const STEPS = 30;

const SlotNumber = ({ value, className = '' }: SlotNumberProps) => {
  const [display, setDisplay] = useState<number | null>(null);
  const prevValue = useRef(-1);
  const frameRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const start = prevValue.current < 0 ? 0 : prevValue.current;
    const end = value;
    let step = 0;

    if (frameRef.current) clearInterval(frameRef.current);

    frameRef.current = setInterval(() => {
      step++;
      const progress = step / STEPS;
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplay(Math.round(start + (end - start) * eased));

      if (step >= STEPS) {
        clearInterval(frameRef.current!);
        setDisplay(end);
        prevValue.current = end;
      }
    }, DURATION / STEPS);

    return () => {
      if (frameRef.current) clearInterval(frameRef.current);
    };
  }, [value]);

  return (
    <span className={className}>
      {(display ?? 0).toLocaleString('ko-KR')} 원
    </span>
  );
};

export default SlotNumber;
