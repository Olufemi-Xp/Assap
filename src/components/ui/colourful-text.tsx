"use client";
import React from "react";
import { motion } from "motion/react";

const MARKETPLACE_COLORS = [
  "#0284C7", // Teal Blue
  "#0E7490", // Deep Teal
  "#0891B2", // Cyan Blue
  "#1E3A8A", // Indigo Blue
  "#0284C7", // Teal Blue
  "#D4AF37", // Subtle Champagne Gold highlight
];

export function ColourfulText({ text }: { text: string }) {
  const [currentColors, setCurrentColors] = React.useState(MARKETPLACE_COLORS);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      const rotated = [...MARKETPLACE_COLORS.slice(1), MARKETPLACE_COLORS[0]];
      setCurrentColors(rotated);
      setCount((prev) => prev + 1);
    }, 5500);

    return () => clearInterval(interval);
  }, []);

  let globalCharIndex = 0;

  return text.split(" ").map((word, wordIndex, words) => (
    <React.Fragment key={`word-${wordIndex}`}>
      <span className="inline-block whitespace-nowrap">
        {word.split("").map((char) => {
          const index = globalCharIndex++;
          return (
            <motion.span
              key={`${char}-${count}-${index}`}
              initial={{ y: 0 }}
              animate={{
                color: currentColors[index % currentColors.length],
                y: [0, -2, 0],
                opacity: [1, 0.92, 1],
              }}
              transition={{
                duration: 0.45,
                delay: index * 0.04,
              }}
              className="inline-block whitespace-pre font-heading font-black tracking-tight"
            >
              {char}
            </motion.span>
          );
        })}
      </span>
      {wordIndex < words.length - 1 ? " " : null}
    </React.Fragment>
  ));
}

export default ColourfulText;
