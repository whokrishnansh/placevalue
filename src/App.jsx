import { useState, useCallback, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { motion, AnimatePresence } from "framer-motion";

import DigitBubble, { DragOverlayBubble } from "./DigitBubble";
import Machine from "./Machine";
import OutputColumn from "./OutputColumn";
import SuccessModal from "./SuccessModal";
import FinalRecapModal from "./FinalRecapModal";
import Tutorial from "./Tutorial";
import Confetti from "./Confetti";
import { useSoundEffects } from "./useSoundEffects";
import {
  LEVELS,
  generateTarget,
  generateBubbles,
  buildExpression,
  computeTotal,
  formatNumber,
} from "./gameUtils";

export default function App() {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [target, setTarget] = useState(null);
  const [bubbles, setBubbles] = useState([]);
  const [placements, setPlacements] = useState({}); // { multiplier: digit }
  const [usedBubbleIds, setUsedBubbleIds] = useState(new Set());
  const [activeDrag, setActiveDrag] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showRecap, setShowRecap] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(true);
  const [completedLevels, setCompletedLevels] = useState(new Set());
  const [darkMode, setDarkMode] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);

  // Dark mode toggle
  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => {
      const next = !prev;
      document.documentElement.setAttribute(
        "data-theme",
        next ? "dark" : "light"
      );
      return next;
    });
  }, []);

  const { playDrop, playPickup, playSuccess, playRemove } = useSoundEffects();

  const levelConfig = LEVELS[currentLevel - 1];
  const machines = levelConfig.machines;

  // Initialize level
  const initLevel = useCallback(
    (level) => {
      const t = generateTarget(level);
      const b = generateBubbles(t, level);
      setTarget(t);
      setBubbles(b);
      setPlacements({});
      setUsedBubbleIds(new Set());
      setShowSuccess(false);
      setConfettiActive(false);
      setCurrentLevel(level);
    },
    []
  );

  useEffect(() => {
    initLevel(1);
  }, [initLevel]);

  // Hide hint after first interaction
  useEffect(() => {
    if (Object.keys(placements).length > 0) {
      setShowHint(false);
    }
  }, [placements]);

  // Check for success
  useEffect(() => {
    if (target !== null && computeTotal(placements) === target) {
      // Small delay so user can see the final value
      const timer = setTimeout(() => {
        setShowSuccess(true);
        setConfettiActive(true);
        setScore((prev) => prev + currentLevel * 100);
        setCompletedLevels((prev) => new Set([...prev, currentLevel]));
        playSuccess();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [placements, target, currentLevel, playSuccess]);

  // Sensors for dnd-kit
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 5 },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 100, tolerance: 5 },
  });
  const sensors = useSensors(pointerSensor, touchSensor);

  // Drag handlers
  const handleDragStart = (event) => {
    const { active } = event;
    setActiveDrag(active.data.current);
    playPickup();
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveDrag(null);

    if (!over) return;

    const { digit, bubbleId } = active.data.current;
    const { multiplier } = over.data.current;

    // If machine already has a digit, free that bubble first
    if (placements[multiplier] !== undefined) {
      // Find the bubble that was placed here and unmark it
      const existingBubbleId = findBubbleIdForPlacement(multiplier);
      if (existingBubbleId) {
        setUsedBubbleIds((prev) => {
          const next = new Set(prev);
          next.delete(existingBubbleId);
          return next;
        });
      }
    }

    // Place the new digit
    setPlacements((prev) => ({
      ...prev,
      [multiplier]: digit,
    }));

    // Mark bubble as used
    setUsedBubbleIds((prev) => new Set([...prev, bubbleId]));

    playDrop();
  };

  const handleDragCancel = () => {
    setActiveDrag(null);
  };

  // Track which bubble ID is placed in which machine
  const [bubbleMachineMap, setBubbleMachineMap] = useState({});

  // Updated placement tracking
  const findBubbleIdForPlacement = (multiplier) => {
    return bubbleMachineMap[multiplier] || null;
  };

  // Override placement handlers with map tracking
  const handleDragEndWithMap = (event) => {
    const { active, over } = event;
    setActiveDrag(null);

    if (!over) return;

    const { digit, bubbleId } = active.data.current;
    const { multiplier } = over.data.current;

    // If machine already has a digit, free that bubble first
    const existingBubbleId = bubbleMachineMap[multiplier];
    if (existingBubbleId) {
      setUsedBubbleIds((prev) => {
        const next = new Set(prev);
        next.delete(existingBubbleId);
        return next;
      });
    }

    // Place the new digit
    setPlacements((prev) => ({
      ...prev,
      [multiplier]: digit,
    }));

    // Track which bubble is in which machine
    setBubbleMachineMap((prev) => ({
      ...prev,
      [multiplier]: bubbleId,
    }));

    // Mark bubble as used
    setUsedBubbleIds((prev) => new Set([...prev, bubbleId]));

    playDrop();
  };

  // Remove digit from machine
  const handleRemoveDigit = (multiplier) => {
    const bubbleId = bubbleMachineMap[multiplier];

    setPlacements((prev) => {
      const next = { ...prev };
      delete next[multiplier];
      return next;
    });

    if (bubbleId) {
      setUsedBubbleIds((prev) => {
        const next = new Set(prev);
        next.delete(bubbleId);
        return next;
      });

      setBubbleMachineMap((prev) => {
        const next = { ...prev };
        delete next[multiplier];
        return next;
      });
    }

    playRemove();
  };

  // Reset current level
  const handleReset = () => {
    initLevel(currentLevel);
    setBubbleMachineMap({});
  };

  // Next level
  const handleNextLevel = () => {
    // If we just completed the last level, show the recap
    if (currentLevel >= LEVELS.length) {
      setShowSuccess(false);
      setShowRecap(true);
      return;
    }
    const nextLevel = Math.min(currentLevel + 1, LEVELS.length);
    initLevel(nextLevel);
    setBubbleMachineMap({});
  };

  // Retry same level with new number
  const handleRetry = () => {
    initLevel(currentLevel);
    setBubbleMachineMap({});
  };

  // Play again from level 1 (after final recap)
  const handlePlayAgain = () => {
    setShowRecap(false);
    setConfettiActive(false);
    setScore(0);
    setCompletedLevels(new Set());
    initLevel(1);
    setBubbleMachineMap({});
    setShowHint(true);
  };

  // Derived state
  const total = computeTotal(placements);
  const expression = buildExpression(placements, machines);
  const isMatched = target !== null && total === target;

  if (target === null) return null;

  return (
    <>
    {/* Tutorial Overlay */}
    <AnimatePresence>
      {showTutorial && (
        <Tutorial onComplete={() => setShowTutorial(false)} />
      )}
    </AnimatePresence>

    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEndWithMap}
      onDragCancel={handleDragCancel}
    >
      <div className="app-container">
        {/* Header */}
        <header className="game-header">
          <div className="header-left">
            <div className="header-logo">PV</div>
            <div>
              <div className="header-title">Place Value Multiplier</div>
              <div className="level-progress">
                {LEVELS.map((l) => (
                  <div
                    key={l.level}
                    className={`level-dot ${completedLevels.has(l.level) ? "completed" : ""} ${currentLevel === l.level ? "current" : ""}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="header-center">
            <div className="level-badge">
              <span className="star">⭐</span>
              Level {currentLevel}: {levelConfig.name}
            </div>
          </div>

          <div className="header-right">
            <div className="score-display">🏆 {score}</div>
            <button className="reset-btn" onClick={handleReset}>
              ↻ Reset
            </button>
            <button
              className="theme-toggle"
              onClick={toggleDarkMode}
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              <span className="theme-icon">{darkMode ? "☀️" : "🌙"}</span>
            </button>
          </div>
        </header>

        {/* Game Board */}
        <main className="game-board">
          {/* Left: Digit Bubbles */}
          <div className="bubbles-section">
            <div className="section-label">Digits</div>
            <div className="bubbles-container">
              {bubbles.map((bubble) => (
                <DigitBubble
                  key={bubble.id}
                  id={bubble.id}
                  digit={bubble.digit}
                  colorIndex={bubble.colorIndex}
                  isUsed={usedBubbleIds.has(bubble.id)}
                />
              ))}
            </div>
          </div>

          {/* Center Left: Machines */}
          <div className="machines-section">
            <div className="section-label">Multiplier Machines</div>
            {[...machines].sort((a, b) => b.multiplier - a.multiplier).map((machine) => (
              <Machine
                key={machine.multiplier}
                multiplier={machine.multiplier}
                label={machine.label}
                placedDigit={placements[machine.multiplier]}
                onRemoveDigit={handleRemoveDigit}
              />
            ))}
          </div>

          {/* Center: Output Column */}
          <OutputColumn machines={machines} placements={placements} />

          {/* Right: Target & Result */}
          <div className="target-section">
            {/* Target Card */}
            <div className="target-card">
              <div className="target-card-stars">
                <span>⭐</span>
                <span>⭐</span>
              </div>
              <div className="target-card-label">Match the Number</div>
              <div className="target-number">{formatNumber(target)}</div>
            </div>

            {/* Result Card */}
            <div className={`result-card ${isMatched ? "matched" : ""}`}>
              <div className="result-label">Your Number</div>
              <div
                className={`result-number ${total === 0 && Object.keys(placements).length === 0 ? "empty" : ""} ${isMatched ? "matched" : ""}`}
              >
                {Object.keys(placements).length === 0
                  ? "—"
                  : formatNumber(total)}
              </div>
            </div>

            {/* Explanation Card */}
            <AnimatePresence>
              {expression && (
                <motion.div
                  className="explanation-card"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="explanation-label">Expanded Form</div>
                  <div className="explanation-expression">{expression}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        {/* Instruction Hint */}
        <AnimatePresence>
          {showHint && (
            <motion.div
              className="instruction-hint"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <span className="emoji">👆</span>
              Drag a digit bubble onto a multiplier machine to begin!
            </motion.div>
          )}
        </AnimatePresence>

        {/* Drag Overlay */}
        <DragOverlay dropAnimation={null}>
          {activeDrag ? (
            <DragOverlayBubble
              digit={activeDrag.digit}
              colorIndex={activeDrag.colorIndex}
            />
          ) : null}
        </DragOverlay>

        {/* Success Modal */}
        <AnimatePresence>
          {showSuccess && (
            <SuccessModal
              target={target}
              expression={`${formatNumber(target)} = ${expression}`}
              currentLevel={currentLevel}
              maxLevel={LEVELS.length}
              onNextLevel={handleNextLevel}
              onRetry={handleRetry}
            />
          )}
        </AnimatePresence>

        {/* Final Recap Modal */}
        <AnimatePresence>
          {showRecap && (
            <FinalRecapModal score={score} onPlayAgain={handlePlayAgain} />
          )}
        </AnimatePresence>

        {/* Confetti */}
        <Confetti active={confettiActive} />
      </div>
    </DndContext>
    </>
  );
}
