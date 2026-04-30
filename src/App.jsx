import React, { useEffect } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'
import BlurText from "./BlurText";
import ClinicalTool from './components/ClinicalTool';
import { useClinicalTrials } from './hooks/useClinicalTrials';

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
  const { trials, loading, error, searched, searchQueries, savedIds, toggleSave, search } = useClinicalTrials();

  useEffect(() => {
    const move = (e) => {
      mouseX.set(e.clientX - CURSOR_SIZE / 2);
      mouseY.set(e.clientY - CURSOR_SIZE / 2);
    };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, [mouseX, mouseY]);

  const handleSearch = (profile) => {
    search(profile);
    setTimeout(() => {
      document.getElementById('tool-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
  };

  return (
    <>
      {/* Fixed cursor */}
      <motion.div
        style={{
          position: 'fixed', top: 0, left: 0, x: springX, y: springY,
          width: CURSOR_SIZE, height: CURSOR_SIZE, borderRadius: '50%',
          border: `2px solid ${C}`, pointerEvents: 'none', zIndex: 9999,
        }}
      />

      {/* Fixed corner SVG decorations */}
      <motion.svg width="400" height="520" viewBox="0 0 200 260" fill="none"
        style={{ position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 1 }}>
        <motion.path
          d="M 172,0 C 138,22 104,38 85,62 C 66,86 64,108 74,126 C 90,148 114,144 117,124 C 120,104 104,88 86,90 C 68,92 50,110 40,134 C 28,160 16,192 0,238"
          stroke={C} strokeWidth="2" strokeLinecap="round" fill="none" {...draw(0.2, 1.8)} />
      </motion.svg>

      <motion.svg width="320" height="520" viewBox="0 0 160 260" fill="none"
        style={{ position: 'fixed', top: 0, right: 0, pointerEvents: 'none', zIndex: 1 }}>
        <motion.path
          d="M 140,0 C 80,55 155,115 105,170 C 55,225 120,245 160,260"
          stroke={C} strokeWidth="2" strokeLinecap="round" fill="none" {...draw(0.35, 1.5)} />
      </motion.svg>

      {/* Section 1: Hero */}
      <section style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
        <BlurText
          text="TrialMatch AI"
          delay={200} animateBy="words" direction="top"
          className="text-8xl text-[#C89A83] text-center"
        />
        <motion.svg width="540" height="30" viewBox="0 0 540 30" fill="none" style={{ marginTop: '-6px' }}>
          <motion.path
            d="M 5,20 C 40,6 75,26 110,16 C 145,6 180,24 215,15 C 250,6 285,24 320,15 C 355,6 390,24 425,15 C 452,8 480,22 510,16 C 520,13 530,16 535,16"
            stroke={C} strokeWidth="3.5" strokeLinecap="round" fill="none" {...draw(1.0, 1.1)} />
        </motion.svg>
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.4, duration: 1 }}
          style={{ position: 'absolute', bottom: '36px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '11px', color: 'rgba(200,154,131,0.5)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>Scroll</span>
          <motion.div animate={{ y: [0, 7, 0] }} transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
            style={{ width: '1px', height: '28px', background: 'linear-gradient(to bottom, rgba(200,154,131,0.5), transparent)' }} />
        </motion.div>
      </section>

      {/* Section 2: Tagline */}
      <section style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '0 32px', textAlign: 'center' }}>
        <BlurText 
  text="Find perfect clinical trials, near you."
  delay={110}
  animateBy="words"
  direction="bottom"
  className="text-5xl text-[#C89A83] text-center"
/>
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          style={{ marginTop: '28px', fontSize: '16px', color: '#dec2b4', maxWidth: '460px', lineHeight: 1.75, fontFamily: 'Geist Variable, sans-serif' }}>
          AI-powered matching connects you with clinical trials tailored to your condition, location, and profile — in seconds.
        </motion.p>
        <motion.button
          onClick={() => document.getElementById('tool-section')?.scrollIntoView({ behavior: 'smooth' })}
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          style={{ marginTop: '40px', padding: '13px 32px', background: 'transparent', border: `1px solid rgba(200,154,131,0.4)`, borderRadius: '12px', color: C, fontSize: '14px', fontWeight: 600, fontFamily: 'Manrope, sans-serif', cursor: 'pointer', letterSpacing: '0.06em' }}>
          Start Searching
        </motion.button>
      </section>

      {/* Section 3: Clinical Tool */}
      <section id="tool-section" style={{ padding: '60px 32px 100px', maxWidth: '1100px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.7, ease: [0.43, 0.13, 0.23, 0.96] }}
          style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '36px', fontWeight: 700, color: C, margin: '0 0 12px' }}>
            Find Your Trial
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '15px', fontFamily: 'Geist Variable, sans-serif', margin: 0 }}>
            Real data from ClinicalTrials.gov, matched to your molecular profile.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.05 }}
          transition={{ duration: 0.6, delay: 0.1 }}>
          <ClinicalTool
            trials={trials}
            loading={loading}
            error={error}
            searched={searched}
            searchQueries={searchQueries}
            savedIds={savedIds}
            onToggleSave={toggleSave}
            onSearch={handleSearch}
          />
        </motion.div>
      </section>
    </>
  );
};

export default App;
