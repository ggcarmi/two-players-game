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
      "w-full h-full flex items-center justify-center p-0 m-0", // הסרת הפדינג והמרווח
      className
    )}>
      <div 
        className={cn(
          "grid", // Remove w-full and h-full to avoid unnecessary stretching
          `grid-cols-${columns}`,
          "place-items-stretch", // Stretch items to fill available space
        )}
        // style={{ 
        //   gridTemplateRows: `repeat(${Math.ceil(items.length / columns)}, 1fr)`, // Dynamically size rows to match columns
        //   gridTemplateColumns: `repeat(${columns}, 1fr)`,
        //   gap: `0px`, // Remove all gaps
        //   height: "100%", // Ensure grid container fills the parent height
        //   width: "100%" // Ensure grid container fills the parent width
        // }}
        style={{ 
            gridTemplateRows: `repeat(${items.length / columns}, 1fr)`, // Dynamically size rows to match columns
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: `0px` // Ensure no gaps between items
        }}
      >
        {items.map((item) => (
          <div
            key={`grid-item-${item.id}`}
            className={cn(
              "aspect-square flex items-center justify-center p-0 m-0 w-full h-full", // Ensure grid items stretch fully
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