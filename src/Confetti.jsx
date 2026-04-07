import { useEffect, useState } from "react";

const COLORS = [
  "#8b5cf6",
  "#3b82f6",
  "#22c55e",
  "#f97316",
  "#ec4899",
  "#eab308",
  "#06b6d4",
  "#ef4444",
];

const SHAPES = ["square", "circle", "triangle"];

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

export default function Confetti({ active }) {
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    if (!active) {
      setPieces([]);
      return;
    }

    const newPieces = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      left: randomBetween(0, 100),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      size: randomBetween(6, 14),
      duration: randomBetween(1.5, 3.5),
      delay: randomBetween(0, 0.8),
      rotation: randomBetween(0, 360),
    }));

    setPieces(newPieces);

    const timer = setTimeout(() => setPieces([]), 4000);
    return () => clearTimeout(timer);
  }, [active]);

  if (!active || pieces.length === 0) return null;

  return (
    <>
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="confetti-piece"
          style={{
            left: `${piece.left}%`,
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.color,
            borderRadius: piece.shape === "circle" ? "50%" : piece.shape === "triangle" ? "0" : "2px",
            clipPath: piece.shape === "triangle" ? "polygon(50% 0%, 0% 100%, 100% 100%)" : "none",
            animationDuration: `${piece.duration}s`,
            animationDelay: `${piece.delay}s`,
            transform: `rotate(${piece.rotation}deg)`,
          }}
        />
      ))}
    </>
  );
}
