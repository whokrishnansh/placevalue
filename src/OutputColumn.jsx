import { motion, AnimatePresence } from "framer-motion";

export default function OutputColumn({ machines, placements }) {
  // Reverse so highest place value is at bottom (matching machine layout which goes from top: ones -> highest)
  // Actually let's keep same order as machines: smallest at top, matching machine order
  const sortedMachines = [...machines].sort(
    (a, b) => b.multiplier - a.multiplier
  );

  return (
    <div className="output-section">
      <div className="section-label">Output</div>
      <div className="output-column">
        {sortedMachines.map((machine) => {
          const digit = placements[machine.multiplier];
          const hasValue = digit !== undefined;
          const value = hasValue ? digit * machine.multiplier : null;

          return (
            <div className="output-row" key={machine.multiplier}>
              <div className="output-place-label">{machine.shortLabel}</div>
              <AnimatePresence mode="wait">
                {hasValue ? (
                  <motion.div
                    key={`val-${machine.multiplier}-${digit}`}
                    className="output-value has-value"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {value.toLocaleString("en-IN")}
                  </motion.div>
                ) : (
                  <motion.div
                    key={`empty-${machine.multiplier}`}
                    className="output-value empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    —
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
