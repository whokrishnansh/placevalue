import { useDroppable } from "@dnd-kit/core";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatMultiplier } from "./gameUtils";

export default function Machine({
  multiplier,
  label,
  placedDigit,
  onRemoveDigit,
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: `machine-${multiplier}`,
    data: { multiplier },
  });

  const [isWobbling, setIsWobbling] = useState(false);
  const [prevDigit, setPrevDigit] = useState(null);

  useEffect(() => {
    if (placedDigit !== undefined && placedDigit !== prevDigit) {
      setIsWobbling(true);
      const timer = setTimeout(() => setIsWobbling(false), 320);
      setPrevDigit(placedDigit);
      return () => clearTimeout(timer);
    }
    if (placedDigit === undefined) {
      setPrevDigit(null);
    }
  }, [placedDigit, prevDigit]);

  const hasDigit = placedDigit !== undefined;
  const computedValue = hasDigit ? placedDigit * multiplier : null;

  return (
    <div className="machine-row">
      <div
        ref={setNodeRef}
        className={`machine-card ${isOver ? "drag-over" : ""} ${hasDigit ? "has-digit" : ""} ${isWobbling ? "wobbling" : ""}`}
      >
        <div className="machine-multiplier">{formatMultiplier(multiplier)}</div>
        <div className="machine-label">{label}</div>

        <div className="machine-status-lights">
          <div
            className={`status-light ${hasDigit ? "active-green" : ""}`}
          ></div>
          <div
            className={`status-light ${hasDigit ? "active-green" : ""}`}
          ></div>
          <div
            className={`status-light ${!hasDigit ? "active-red" : ""}`}
          ></div>
        </div>

        {!hasDigit && <div className="machine-drop-hint">Drop digit here</div>}

        <AnimatePresence>
          {hasDigit && (
            <motion.div
              className="machine-placed-digit"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              onClick={() => onRemoveDigit(multiplier)}
              title="Click to remove"
            >
              {placedDigit}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className={`machine-connector ${hasDigit ? "active" : ""}`}></div>
    </div>
  );
}
