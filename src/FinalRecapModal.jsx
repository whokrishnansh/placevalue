import { motion } from "framer-motion";

const RECAP_SECTIONS = [
  {
    emoji: "🔢",
    title: "What is Place Value?",
    text: "Every digit in a number has a value based on its position. The same digit means different things depending on where it sits — this is called Place Value.",
  },
  {
    emoji: "⚙️",
    title: "The Multiplier Principle",
    text: "Each position is a power of 10. The Ones place is ×1, Tens is ×10, Hundreds is ×100, and so on. A digit's value equals the digit multiplied by its place value.",
  },
  {
    emoji: "🧩",
    title: "Expanded Form",
    text: 'Any number can be broken down into the sum of each digit\'s place value. For example: 6,354 = 6×1000 + 3×100 + 5×10 + 4×1. This is called the Expanded Form.',
  },
  {
    emoji: "📐",
    title: "The Pattern of Ten",
    text: "Each place value is exactly 10 times the one before it. Ones → Tens → Hundreds → Thousands. This base-10 pattern is the foundation of our entire number system!",
  },
  {
    emoji: "🏆",
    title: "What You Mastered",
    text: "You built numbers from Ones all the way to Ten Lakhs (millions). You now understand how digits combine with place values to form any number!",
  },
];

export default function FinalRecapModal({ score, onPlayAgain }) {
  return (
    <div
      className="success-overlay"
      onClick={(e) => e.target === e.currentTarget && onPlayAgain()}
    >
      <motion.div
        className="recap-modal"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        {/* Top gradient bar */}
        <div className="recap-top-bar"></div>

        {/* Trophy header */}
        <div className="recap-header">
          <div className="recap-trophy">🏆</div>
          <h2 className="recap-title">All Levels Complete!</h2>
          <p className="recap-subtitle">
            Final Score: <strong>{score}</strong> points
          </p>
        </div>

        {/* Divider */}
        <div className="recap-divider">
          <span className="recap-divider-label">📖 Place Value — Key Concepts</span>
        </div>

        {/* Concept cards */}
        <div className="recap-concepts">
          {RECAP_SECTIONS.map((section, idx) => (
            <motion.div
              key={idx}
              className="recap-concept-card"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + idx * 0.1 }}
            >
              <div className="recap-concept-emoji">{section.emoji}</div>
              <div className="recap-concept-content">
                <h3 className="recap-concept-title">{section.title}</h3>
                <p className="recap-concept-text">{section.text}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Example visual */}
        <div className="recap-example">
          <div className="recap-example-label">Example</div>
          <div className="recap-example-equation">
            <span className="recap-digit-highlight th">5</span>
            <span className="recap-digit-highlight h">3</span>
            <span className="recap-digit-highlight t">7</span>
            <span className="recap-digit-highlight o">2</span>
            <span className="recap-equals">=</span>
            <span className="recap-expanded">
              5×1000 + 3×100 + 7×10 + 2×1
            </span>
          </div>
        </div>

        {/* Play Again button */}
        <div className="recap-footer">
          <button className="btn-play-again" onClick={onPlayAgain}>
            🎮 Play Again from Level 1
          </button>
        </div>
      </motion.div>
    </div>
  );
}
