
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';

interface StatsCarouselProps {
  monthly: string;
  yearly: string;
}

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 50 : -50,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 50 : -50,
    opacity: 0,
  }),
};

export default function StatsCarousel({ monthly, yearly }: StatsCarouselProps) {
  const [[page, direction], setPage] = useState([0, 0]);
  const stats = [
    { title: 'Estimated Monthly Cost', value: monthly },
    { title: 'Total Yearly Cost', value: yearly },
  ];

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };
  
  const statIndex = page % stats.length;
  const currentStat = stats[statIndex < 0 ? stats.length + statIndex : statIndex];

  return (
    <div className="relative flex flex-col items-center justify-center bg-base-100 p-6 rounded-lg shadow-md h-48 overflow-hidden mb-8">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={page}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          className="absolute flex flex-col items-center justify-center"
        >
          <h3 className="text-text-light text-sm font-medium uppercase tracking-wider">{currentStat.title}</h3>
          <p className="text-5xl font-bold text-primary mt-2">€{currentStat.value}</p>
        </motion.div>
      </AnimatePresence>
      <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between px-2">
        <button onClick={() => paginate(-1)} className="text-text-light hover:text-primary p-2 rounded-full cursor-pointer">
          <ChevronLeftIcon />
        </button>
        <button onClick={() => paginate(1)} className="text-text-light hover:text-primary p-2 rounded-full cursor-pointer">
          <ChevronRightIcon />
        </button>
      </div>
    </div>
  );
}
