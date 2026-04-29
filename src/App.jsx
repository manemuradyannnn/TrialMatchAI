import React, { useEffect } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'
import BlurText from "./BlurText";



const handleAnimationComplete = () => {
  console.log('Animation completed!');
};

const C = "#C89A83";

const draw = (delay, duration = 1.0) => ({
  initial: { pathLength: 0, opacity: 0 },
  animate: { pathLength: 1, opacity: 1 },
  transition: {
  pathLength: { duration, delay, ease: [0.43, 0.13, 0.23, 0.96] },
  opacity: { duration: 0.01, delay },
  },
});

const CURSOR_SIZE = 32;

const App = () => {
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);
  const springX = useSpring(mouseX, { stiffness: 150, damping: 18, mass: 0.5 });
  const springY = useSpring(mouseY, { stiffness: 150, damping: 18, mass: 0.5 });

  useEffect(() => {
    const move = (e) => {
      mouseX.set(e.clientX - CURSOR_SIZE / 2);
      mouseY.set(e.clientY - CURSOR_SIZE / 2);
    };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, [mouseX, mouseY]);

  return (
  <>
    <motion.div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        x: springX,
        y: springY,
        width: CURSOR_SIZE,
        height: CURSOR_SIZE,
        borderRadius: '50%',
        border: `2px solid ${C}`,
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
    {/* Left corner scribble — loopy organic flourish */}
    <motion.svg
      width="400" height="520" viewBox="0 0 200 260" fill="none"
      style={{ position: 'fixed', top: 0, left: 0, pointerEvents: 'none' }}
    >
      <motion.path
        d="M 172,0 C 138,22 104,38 85,62 C 66,86 64,108 74,126 C 90,148 114,144 117,124 C 120,104 104,88 86,90 C 68,92 50,110 40,134 C 28,160 16,192 0,238"
        stroke={C} strokeWidth="2" strokeLinecap="round" fill="none"
        {...draw(0.2, 1.8)}
      />
    </motion.svg>

    {/* Right corner scribble — flowing S-curve, no loop */}
    <motion.svg
      width="320" height="520" viewBox="0 0 160 260" fill="none"
      style={{ position: 'fixed', top: 0, right: 0, pointerEvents: 'none' }}
    >
      <motion.path
        d="M 140,0 C 80,55 155,115 105,170 C 55,225 120,245 160,260"
        stroke={C} strokeWidth="2" strokeLinecap="round" fill="none"
        {...draw(0.35, 1.5)}
      />
    </motion.svg>

    <div className="flex justify-center items-center h-screen">
      <div className="flex flex-col items-center">
        <BlurText
          text="TrialMatch AI"
          delay={200}
          animateBy="words"
          direction="top"
          onAnimationComplete={handleAnimationComplete}
          className="text-8xl text-[#C89A83] text-center"
          style={{ fontFamily: 'Manrope, sans-serif' }}
        />

      
        {/* Squiggle underline */}
        <motion.svg
          width="540" height="30" viewBox="0 0 540 30" fill="none"
          style={{ marginTop: '-6px' }}
        >
          <motion.path
            d="M 5,20 C 40,6 75,26 110,16 C 145,6 180,24 215,15 C 250,6 285,24 320,15 C 355,6 390,24 425,15 C 452,8 480,22 510,16 C 520,13 530,16 535,16"
            stroke={C} strokeWidth="3.5" strokeLinecap="round" fill="none"
            {...draw(1.0, 1.1)}
          />
        </motion.svg>
      </div>
    </div>
  </>
  );
};

export default App;
