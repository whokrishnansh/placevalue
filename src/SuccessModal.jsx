import { motion } from "framer-motion";
import { formatNumber } from "./gameUtils";

export default function SuccessModal({
  target,
  expression,
  currentLevel,
  maxLevel,
  onNextLevel,
  onRetry,
}) {
  const isLastLevel = currentLevel >= maxLevel;

  return (
    <div className="success-overlay" onClick={(e) => e.target === e.currentTarget && onRetry()}>
      <motion.div
        className="success-modal"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <div className="success-emoji">🎉</div>
        <h2 className="success-title">
          {isLastLevel ? "You're a Master!" : "Excellent Work!"}
        </h2>
        <p className="success-message">
          You built <strong>{formatNumber(target)}</strong> correctly!
        </p>
        <div className="success-expression">{expression}</div>

        <div className="success-buttons">
          <button className="btn-retry" onClick={onRetry}>
            🔄 Replay
          </button>
          {!isLastLevel && (
            <button className="btn-next-level" onClick={onNextLevel}>
              Next Level →
            </button>
          )}
          {isLastLevel && (
            <button className="btn-next-level" onClick={onNextLevel}>
              🎓 See Results
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
