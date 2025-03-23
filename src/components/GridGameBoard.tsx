
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
  gap = 0,
  className,
  itemClassName,
  animateSpecialItems = true,
}) => {
  // Calculate rows based on items and columns
  const rows = Math.ceil(items.length / columns);
  
  return (
    <div className={cn(
      "w-full h-full flex items-center justify-center p-0 m-0", 
      className
    )}>
      <div 
        className={cn(
          "grid w-full h-full",
        )}
        style={{ 
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: `${gap}px`,
        }}
      >
        {items.map((item) => (
          <div
            key={`grid-item-${item.id}`}
            className={cn(
              "flex items-center justify-center p-0 m-0 w-full h-full", 
              item.onClick ? "cursor-pointer" : "",
              "text-[calc(min(4vw,4vh))]",
              itemClassName
            )}
            onClick={item.onClick}
          >
            {item.isSpecial && animateSpecialItems ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
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
