import React, { ReactNode, useEffect, useState } from "react";
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
  rotationDuration?: number;
  isDevelopmentMode?: boolean;
  autoRotate?: boolean;
}

const GridGameBoard: React.FC<GridGameBoardProps> = ({
  items,
  columns,
  gap = 0,
  className,
  itemClassName,
  animateSpecialItems = true,
  rotationDuration = 0.2,
  isDevelopmentMode = false,
  autoRotate = true,
}) => {
  const [rotations, setRotations] = useState<{ [key: number]: number }>({});
  const rows = Math.ceil(items.length / columns);

  useEffect(() => {
    if (autoRotate) {
      const interval = setInterval(() => {
        setRotations(prev => {
          const newRotations = { ...prev };
          items.forEach(item => {
            newRotations[item.id] = (prev[item.id] || 0) + (Math.random() > 0.5 ? 90 : -90);
          });
          return newRotations;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [autoRotate, items]);

  return (
    <div className={cn(
      "flex items-center justify-center w-full h-full p-0 m-0 overflow-hidden",
      className
    )}>
      <div className="flex-grow-0 flex-shrink-0 aspect-square">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: `${gap}px`,
            width: "100%",
            height: "100%",
            aspectRatio: "1",
          }}
        >
          {items.map((item) => (
            <div
              key={`cell-${item.id}`}
              onClick={item.onClick}
              className={cn(
                "w-full h-full p-0 m-0",
                "flex items-center justify-center",
                "aspect-square",
                item.onClick && "cursor-pointer",
                itemClassName,
                item.isSpecial && isDevelopmentMode && "outline outline-2 outline-red-500 bg-red-100/20"
              )}
            >
              <motion.div
                initial={{ scale: item.isSpecial && animateSpecialItems ? 0 : 1, rotate: 0 }}
                animate={{ 
                  scale: 1, 
                  rotate: rotations[item.id] || 0 
                }}
                transition={{ duration: rotationDuration }}
                className="w-full h-full flex items-center justify-center p-0 m-0"
                style={{ transformOrigin: "center" }}
              >
                {item.content}
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GridGameBoard;