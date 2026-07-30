import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

const QuestionTimer = ({ durationSeconds, onExpire, resetKey }) => {
  const [secondsLeft, setSecondsLeft] = useState(durationSeconds);

  useEffect(() => {
    setSecondsLeft(durationSeconds);
  }, [resetKey, durationSeconds]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onExpire();
      return;
    }

    const timerId = setTimeout(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timerId);
  }, [secondsLeft, onExpire]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const isLow = secondsLeft <= 10;

  return (
    <div
      className={`flex items-center gap-1.5 text-sm font-medium ${
        isLow ? "text-[var(--color-error)]" : "text-[var(--color-text-secondary)]"
      }`}
    >
      <Clock size={16} />
      {minutes}:{seconds.toString().padStart(2, "0")}
    </div>
  );
};

export default QuestionTimer;