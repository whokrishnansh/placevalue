import { useDraggable } from "@dnd-kit/core";
import { motion } from "framer-motion";

export default function DigitBubble({ id, digit, colorIndex, isUsed }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
    data: { digit, colorIndex, bubbleId: id },
    disabled: isUsed,
  });

  return (
    <motion.div
      ref={setNodeRef}
      className={`digit-bubble bubble-color-${colorIndex} ${isUsed ? "used" : ""}`}
      style={{
        opacity: isDragging ? 0.4 : isUsed ? 0.3 : 1,
        touchAction: "none",
      }}
      animate={
        !isUsed && !isDragging
          ? {
              y: [0, -6, 0],
            }
          : {}
      }
      transition={
        !isUsed && !isDragging
          ? {
              y: {
                duration: 2 + (colorIndex * 0.3),
                repeat: Infinity,
                ease: "easeInOut",
              },
            }
          : {}
      }
      {...listeners}
      {...attributes}
    >
      {digit}
    </motion.div>
  );
}

export function DragOverlayBubble({ digit, colorIndex }) {
  return (
    <div className={`digit-bubble-overlay bubble-color-${colorIndex}`}>
      {digit}
    </div>
  );
}
