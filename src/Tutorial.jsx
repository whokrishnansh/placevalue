import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TUTORIAL_STEPS = [
  {
    id: "welcome",
    title: "Welcome to Place Value Multiplier! 🎮",
    description:
      "Learn place values by dragging digits into multiplier machines. Let's walk through how it works!",
    spotlightSelector: null,
    pointerType: "wave",
  },
  {
    id: "pick-digit",
    title: "① Pick a Digit Bubble",
    description:
      "Click and hold on any digit bubble on the left to pick it up. Each bubble contains a single digit (0–9).",
    spotlightSelector: ".bubbles-section",
    pointerType: "click",
  },
  {
    id: "drag-to-machine",
    title: "② Drag to a Multiplier Machine",
    description:
      "While holding, drag it over to one of the multiplier machines (×1, ×10, ×100…). The machine will glow purple when you hover over it!",
    spotlightSelector: [".bubbles-section", ".machines-section"],
    pointerType: "drag",
  },
  {
    id: "match-target",
    title: "③ Match the Target Number",
    description:
      'Fill in all machines so that the total matches the target number shown in the purple card. When you get it right — 🎉 Confetti!',
    spotlightSelector: ".target-section",
    pointerType: "click",
  },
];

const SPOTLIGHT_PADDING = 6;

export default function Tutorial({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [spotlightRect, setSpotlightRect] = useState(null);

  const step = TUTORIAL_STEPS[currentStep];
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;

  // Measure the target section(s) and compute a union bounding rect
  useEffect(() => {
    const measure = () => {
      const selectors = Array.isArray(step.spotlightSelector)
        ? step.spotlightSelector
        : step.spotlightSelector
        ? [step.spotlightSelector]
        : [];

      if (selectors.length === 0) {
        setSpotlightRect(null);
        return;
      }

      let minTop = Infinity,
        minLeft = Infinity,
        maxBottom = 0,
        maxRight = 0;
      let found = false;

      for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (!el) continue;
        found = true;
        const rect = el.getBoundingClientRect();
        minTop = Math.min(minTop, rect.top);
        minLeft = Math.min(minLeft, rect.left);
        maxBottom = Math.max(maxBottom, rect.bottom);
        maxRight = Math.max(maxRight, rect.right);
      }

      if (!found) {
        setSpotlightRect(null);
        return;
      }

      setSpotlightRect({
        top: minTop - SPOTLIGHT_PADDING,
        left: minLeft - SPOTLIGHT_PADDING,
        width: maxRight - minLeft + SPOTLIGHT_PADDING * 2,
        height: maxBottom - minTop + SPOTLIGHT_PADDING * 2,
      });
    };

    // small delay to ensure DOM layout is ready
    const timer = setTimeout(measure, 60);
    window.addEventListener("resize", measure);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", measure);
    };
  }, [currentStep, step.spotlightSelector]);

  const handleNext = useCallback(() => {
    if (isLastStep) {
      setIsExiting(true);
      setTimeout(() => onComplete(), 500);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  }, [isLastStep, onComplete]);

  const handleSkip = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => onComplete(), 500);
  }, [onComplete]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      }
      if (e.key === "Escape") {
        handleSkip();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleNext, handleSkip]);

  // Dynamic pointer position based on spotlight rect
  const getPointerStyle = () => {
    if (!spotlightRect) return {};
    if (step.pointerType === "click") {
      return {
        top: `${spotlightRect.top + spotlightRect.height * 0.38}px`,
        left: `${spotlightRect.left + spotlightRect.width * 0.45}px`,
      };
    }
    if (step.pointerType === "drag") {
      return {
        top: `${spotlightRect.top + spotlightRect.height * 0.4}px`,
        left: `${spotlightRect.left + spotlightRect.width * 0.12}px`,
      };
    }
    return {};
  };

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          className="tutorial-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Spotlight cutout: creates dark overlay everywhere EXCEPT over the highlighted section */}
          <div
            className={`tutorial-spotlight-cutout ${spotlightRect ? "active" : ""}`}
            style={
              spotlightRect
                ? {
                    top: `${spotlightRect.top}px`,
                    left: `${spotlightRect.left}px`,
                    width: `${spotlightRect.width}px`,
                    height: `${spotlightRect.height}px`,
                  }
                : undefined
            }
          />

          {/* Animated pointer */}
          <div
            className={`tutorial-pointer pointer-${step.pointerType}`}
            style={spotlightRect ? getPointerStyle() : undefined}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.5 3.5L7.5 16.5L10.5 13.5L14 20L16.5 18.5L13 12H17.5L7.5 3.5Z"
                fill="white"
                stroke="#333"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
            </svg>
            {step.pointerType === "click" && (
              <div className="pointer-ripple" />
            )}
          </div>

          {/* Content card */}
          <motion.div
            className="tutorial-card"
            key={step.id}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            {/* Progress dots */}
            <div className="tutorial-progress">
              {TUTORIAL_STEPS.map((_, idx) => (
                <div
                  key={idx}
                  className={`tutorial-progress-dot ${
                    idx === currentStep ? "active" : ""
                  } ${idx < currentStep ? "completed" : ""}`}
                />
              ))}
            </div>

            <div className="tutorial-step-number">
              Step {currentStep + 1} of {TUTORIAL_STEPS.length}
            </div>

            <h2 className="tutorial-title">{step.title}</h2>
            <p className="tutorial-description">{step.description}</p>

            <div className="tutorial-actions">
              <button className="tutorial-skip-btn" onClick={handleSkip}>
                Skip Tutorial
              </button>
              <button className="tutorial-next-btn" onClick={handleNext}>
                {isLastStep ? "Start Playing! 🚀" : "Next →"}
              </button>
            </div>

            <div className="tutorial-key-hint">
              Press <kbd>Enter</kbd> or <kbd>→</kbd> to continue •{" "}
              <kbd>Esc</kbd> to skip
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
