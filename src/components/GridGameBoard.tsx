import React, { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface GridItem {
  id: number;
  row: number;
  col: number;
  content: ReactNode;
  isSpecial?: boolean;
  onClick?: () => void;
}

interface GridGameBoardProps {
  items: GridItem[];
  columns: number;
  gap?: number;
  className?: string;
  itemClassName?: string;
  animateSpecialItems?: boolean;
}

const GridGameBoard: React.FC<GridGameBoardProps> = ({
  items,
  columns,
  gap = 0, // ביטול מרווחים בין אלמנטים כברירת מחדל
  className,
  itemClassName,
  animateSpecialItems = true,
}) => {
  return (
    <div className={cn(
      "w-full h-full flex items-center justify-center p-0", // הסרת הפדינג
      className
    )}>
      <div 
        className={cn(
          "grid w-full h-full", 
          `grid-cols-${columns}`
        )}
        style={{ 
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: `${gap}px` // אפס מרווח
        }}
      >
        {items.map((item) => (
          <div
            key={`grid-item-${item.id}`}
            className={cn(
              "aspect-square flex items-center justify-center p-0 m-0", // הסרת מרווחים פנימיים וחיצוניים
              item.onClick ? "cursor-pointer" : "",
              // התאמת גודל אייקונים לפי גודל מסך
              "text-[calc(min(4vw,4vh))]", // גודל אדפטיבי לרוחב המסך
              itemClassName
            )}
            onClick={item.onClick}
          >
            {item.isSpecial && animateSpecialItems ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                // שמירה על אותו גודל כדי שהאייקון המיוחד לא יהיה גדול יותר
                className="text-[calc(min(4vw,4vh))]"
              >
                {item.content}
              </motion.div>
            ) : (
              item.content
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GridGameBoard;