import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import TrialCard from './TrialCard';

const C = "#C89A83";

function SpotlightCard({ label, trial, icon }) {
  if (!trial) return null;
  const p = trial.protocolSection || {};
  const title = p.identificationModule?.briefTitle || '';
  const pct = trial.matchScore?.percentage || 0;
  const sc = pct >= 75 ? '#4ade80' : pct >= 50 ? C : '#f87171';
  const es = trial.matchScore?.eligibility_status || 'low';
  const eligLabel = { eligible: 'Eligible', possible: 'Possible Fit', low: 'Low Match' }[es];
  const eligColor = { eligible: '#4ade80', possible: '#fbbf24', low: 'rgba(255,255,255,0.4)' }[es];

  return (
    <div style={{ flex: '1 1 0', minWidth: '200px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(200,154,131,0.14)', borderRadius: '12px', padding: '16px' }}>
      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '8px' }}>
        {icon} {label}
      </div>
      <p style={{ margin: '0 0 10px', fontSize: '13px', color: 'white', lineHeight: 1.4, fontFamily: 'Manrope', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {title}
      </p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '28px', fontWeight: 800, color: sc, fontFamily: 'Manrope', lineHeight: 1 }}>{pct}</span>
        <span style={{ fontSize: '11px', fontWeight: 700, color: eligColor, background: `${eligColor}18`, border: `1px solid ${eligColor}44`, padding: '2px 9px', borderRadius: '20px' }}>{eligLabel}</span>
      </div>
    </div>
  );
}

const ALL_PHASES = ['Phase I','Phase II','Phase III','Phase IV','N/A'];
const ALL_STATUSES = ['RECRUITING','NOT_YET_RECRUITING','ACTIVE_NOT_RECRUITING','COMPLETED','TERMINATED'];
const STATUS_LABELS = { RECRUITING:'Recruiting', NOT_YET_RECRUITING:'Not Yet Recruiting', ACTIVE_NOT_RECRUITING:'Active, Not Recruiting', COMPLETED:'Completed', TERMINATED:'Terminated' };
const MIN_SCORES = [{ v: 0, l: 'Any' }, { v: 25, l: '25+' }, { v: 50, l: '50+' }, { v: 75, l: '75+' }];

export default function ResultsPanel({ trials, loading, error, searched, searchQueries, savedIds, onToggleSave }) {
  const [textQ, setTextQ] = useState('');
  const [phaseF, setPhaseF] = useState('');
  const [statusF, setStatusF] = useState('');
  const [minScore, setMinScore] = useState(0);
  const [sortBy, setSortBy] = useState('score');
  const [view, setView] = useState('list');

  const eligible = useMemo(() => trials.filter(t => t.matchScore?.eligibility_status === 'eligible').length, [trials]);
  const possible = useMemo(() => trials.filter(t => t.matchScore?.eligibility_status === 'possible').length, [trials]);

  const bestOverall = trials[0] || null;
  const bestLocal = useMemo(() => trials.find(t => t.matchScore?.breakdown?.location >= 14) || trials[1] || null, [trials]);
  const bestBiomarker = useMemo(() => trials.find(t => t.matchScore?.breakdown?.biomarker >= 14) || trials[2] || null, [trials]);

  const filtered = useMemo(() => {
    let list = [...trials];
    if (textQ) {
      const q = textQ.toLowerCase();
      list = list.filter(t => {
        const title = (t.protocolSection?.identificationModule?.briefTitle || '').toLowerCase();
        const conds = (t.protocolSection?.conditionsModule?.conditions || []).join(' ').toLowerCase();
        return title.includes(q) || conds.includes(q);
      });
    }
    if (phaseF) {
      list = list.filter(t => {
        const phases = t.protocolSection?.designModule?.phases || [];
        if (phaseF === 'N/A') return phases.length === 0;
        return phases.some(ph => ph.toLowerCase().replace(/_/g, ' ').includes(phaseF.toLowerCase()));
      });
    }
    if (statusF) {
      list = list.filter(t => t.protocolSection?.statusModule?.overallStatus === statusF);
    }
    if (minScore > 0) {
      list = list.filter(t => (t.matchScore?.percentage || 0) >= minScore);
    }
    if (sortBy === 'alpha') {
      list.sort((a, b) => (a.protocolSection?.identificationModule?.briefTitle || '').localeCompare(b.protocolSection?.identificationModule?.briefTitle || ''));
    }
    return list;
  }, [trials, textQ, phaseF, statusF, minScore, sortBy]);

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '80px 0' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.1, ease: 'linear' }}
          style={{ width: '36px', height: '36px', border: `2px solid rgba(200,154,131,0.15)`, borderTop: `2px solid ${C}`, borderRadius: '50%', margin: '0 auto 18px' }} />
        <p style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Geist Variable, sans-serif', fontSize: '15px', margin: 0 }}>
          Searching real clinical trials...
        </p>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center', padding: '48px 24px', background: 'rgba(248,113,113,0.05)', border: '1px solid rgba(248,113,113,0.18)', borderRadius: '14px' }}>
        <p style={{ color: '#f87171', fontSize: '15px', margin: '0 0 8px', fontFamily: 'Geist Variable, sans-serif' }}>
          Unable to fetch trials right now. Please try again.
        </p>
        <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '12px', margin: 0 }}>{error}</p>
      </motion.div>
    );
  }

  if (!searched) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px', color: 'rgba(255,255,255,0.3)', fontFamily: 'Geist Variable, sans-serif', fontSize: '15px' }}>
        Fill in the Patient Profile tab and click "Find Matching Trials" to see results here.
      </div>
    );
  }

  if (trials.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center', padding: '48px 24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(200,154,131,0.1)', borderRadius: '14px' }}>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '15px', margin: 0, fontFamily: 'Geist Variable, sans-serif' }}>
          No matching trials found. Try broadening your search.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      {/* Search query tags */}
      {searchQueries.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '14px' }}>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', fontFamily: 'Geist Variable, sans-serif' }}>Searched:</span>
          {searchQueries.map(q => (
            <span key={q} style={{ padding: '3px 10px', background: 'rgba(200,154,131,0.12)', border: '1px solid rgba(200,154,131,0.25)', borderRadius: '20px', fontSize: '12px', color: C }}>
              {q}
            </span>
          ))}
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', fontFamily: 'Geist Variable, sans-serif' }}>{trials.length} trials scored</span>
        </div>
      )}

      {/* Title + stats */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 700, color: 'white', fontFamily: 'Manrope' }}>
          Results
        </h3>
        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontFamily: 'Geist Variable, sans-serif' }}>
          {filtered.length} of {trials.length} shown
          {eligible > 0 && <> · <span style={{ color: '#4ade80' }}>{eligible} eligible</span></>}
          {possible > 0 && <> · <span style={{ color: '#fbbf24' }}>{possible} possible fit</span></>}
        </div>
      </div>

      {/* Spotlight cards */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <SpotlightCard label="Best Overall" trial={bestOverall} icon="★" />
        <SpotlightCard label="Best Local" trial={bestLocal} icon="◎" />
        <SpotlightCard label="Best Biomarker" trial={bestBiomarker} icon="⬡" />
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '20px', padding: '14px 16px', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(200,154,131,0.1)', borderRadius: '10px' }}>
        <input
          value={textQ} onChange={e => setTextQ(e.target.value)}
          placeholder="Filter results..."
          className="trial-input"
          style={{ flex: '1 1 160px', padding: '7px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(200,154,131,0.18)', borderRadius: '7px', color: 'white', fontSize: '13px', outline: 'none', fontFamily: 'Geist Variable, sans-serif' }}
        />
        <select value={phaseF} onChange={e => setPhaseF(e.target.value)} className="trial-input" style={fsStyle}>
          <option value="">All Phases</option>
          {ALL_PHASES.map(ph => <option key={ph} value={ph}>{ph}</option>)}
        </select>
        <select value={statusF} onChange={e => setStatusF(e.target.value)} className="trial-input" style={fsStyle}>
          <option value="">All Statuses</option>
          {ALL_STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
        <select value={minScore} onChange={e => setMinScore(Number(e.target.value))} className="trial-input" style={fsStyle}>
          {MIN_SCORES.map(o => <option key={o.v} value={o.v}>Min Score: {o.l}</option>)}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="trial-input" style={fsStyle}>
          <option value="score">Sort: Score</option>
          <option value="alpha">Sort: A–Z</option>
        </select>
        <div style={{ display: 'flex', border: '1px solid rgba(200,154,131,0.2)', borderRadius: '7px', overflow: 'hidden' }}>
          {['list','grid'].map(v => (
            <button key={v} onClick={() => setView(v)} style={{ padding: '7px 14px', background: view === v ? 'rgba(200,154,131,0.2)' : 'transparent', border: 'none', color: view === v ? C : 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '12px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: 'Geist Variable, sans-serif' }}>
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Trial list/grid */}
      <AnimatePresence mode="wait">
        {view === 'list' ? (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filtered.map((t, i) => (
              <TrialCard
                key={t.protocolSection?.identificationModule?.nctId || i}
                trial={t} index={i}
                saved={savedIds.includes(t.protocolSection?.identificationModule?.nctId)}
                onSave={onToggleSave}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
            {filtered.map((t, i) => (
              <TrialCard
                key={t.protocolSection?.identificationModule?.nctId || i}
                trial={t} index={i} compact
                saved={savedIds.includes(t.protocolSection?.identificationModule?.nctId)}
                onSave={onToggleSave}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.35)', fontFamily: 'Geist Variable, sans-serif', fontSize: '14px' }}>
          No trials match your current filters. Try adjusting them.
        </div>
      )}
    </motion.div>
  );
}

const fsStyle = { padding: '7px 28px 7px 10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(200,154,131,0.18)', borderRadius: '7px', color: 'white', fontSize: '12px', outline: 'none', cursor: 'pointer', fontFamily: 'Geist Variable, sans-serif', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='7' viewBox='0 0 10 7'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23C89A83' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' fill='none'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' };
