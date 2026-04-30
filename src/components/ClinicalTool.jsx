import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Search, BarChart2, Bookmark } from 'lucide-react';
import PatientProfileForm from './PatientProfileForm';
import ResultsPanel from './ResultsPanel';
import TrialCard from './TrialCard';

const C = "#C89A83";

function AnalyticsPanel({ trials }) {
  if (trials.length === 0) return (
    <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.3)', fontFamily: 'Geist Variable, sans-serif', fontSize: '14px' }}>
      Run a search to see analytics.
    </div>
  );

  const statusCounts = {};
  const phaseCounts = {};
  trials.forEach(t => {
    const s = t.protocolSection?.statusModule?.overallStatus || 'UNKNOWN';
    statusCounts[s] = (statusCounts[s] || 0) + 1;
    const phases = t.protocolSection?.designModule?.phases || [];
    const key = phases.length > 0 ? phases[0].replace(/_/g, ' ') : 'N/A';
    phaseCounts[key] = (phaseCounts[key] || 0) + 1;
  });

  const eligible = trials.filter(t => t.matchScore?.eligibility_status === 'eligible').length;
  const possible = trials.filter(t => t.matchScore?.eligibility_status === 'possible').length;
  const avgScore = Math.round(trials.reduce((s, t) => s + (t.matchScore?.percentage || 0), 0) / trials.length);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px', marginBottom: '28px' }}>
        {[
          { label: 'Total Trials', value: trials.length, color: 'white' },
          { label: 'Eligible', value: eligible, color: '#4ade80' },
          { label: 'Possible Fit', value: possible, color: '#fbbf24' },
          { label: 'Avg Match Score', value: `${avgScore}%`, color: C },
        ].map(s => (
          <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(200,154,131,0.1)', borderRadius: '10px', padding: '16px' }}>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>{s.label}</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: s.color, fontFamily: 'Manrope', lineHeight: 1 }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>Recruiting Status</div>
        {Object.entries(statusCounts).sort((a, b) => b[1] - a[1]).map(([status, count]) => (
          <div key={status} style={{ marginBottom: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)' }}>{status.replace(/_/g, ' ')}</span>
              <span style={{ fontSize: '12px', color: C }}>{count}</span>
            </div>
            <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${(count / trials.length) * 100}%` }} transition={{ duration: 0.7 }}
                style={{ height: '100%', background: `linear-gradient(90deg, ${C}, rgba(200,154,131,0.4))`, borderRadius: '2px' }} />
            </div>
          </div>
        ))}
      </div>

      <div>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>Trial Phase</div>
        {Object.entries(phaseCounts).sort((a, b) => b[1] - a[1]).map(([phase, count]) => (
          <div key={phase} style={{ marginBottom: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)' }}>{phase}</span>
              <span style={{ fontSize: '12px', color: C }}>{count}</span>
            </div>
            <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${(count / trials.length) * 100}%` }} transition={{ duration: 0.7 }}
                style={{ height: '100%', background: 'linear-gradient(90deg, rgba(96,165,250,0.8), rgba(96,165,250,0.3))', borderRadius: '2px' }} />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function SavedPanel({ trials, savedIds, onToggleSave }) {
  const saved = trials.filter(t => savedIds.includes(t.protocolSection?.identificationModule?.nctId));
  if (saved.length === 0) return (
    <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.3)', fontFamily: 'Geist Variable, sans-serif', fontSize: '14px' }}>
      {savedIds.length > 0
        ? 'Run a new search to reload your saved trials.'
        : 'Bookmark trials from the Results tab to save them here.'}
    </div>
  );
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ marginBottom: '12px', fontSize: '13px', color: 'rgba(255,255,255,0.35)', fontFamily: 'Geist Variable, sans-serif' }}>
        {saved.length} saved trial{saved.length !== 1 ? 's' : ''}
      </div>
      {saved.map((t, i) => (
        <TrialCard
          key={t.protocolSection?.identificationModule?.nctId || i}
          trial={t} index={i}
          saved
          onSave={onToggleSave}
        />
      ))}
    </motion.div>
  );
}

export default function ClinicalTool({ trials, loading, error, searched, searchQueries, savedIds, onToggleSave, onSearch }) {
  const [activeTab, setActiveTab] = useState('profile');

  const handleSearch = (profile) => {
    onSearch(profile);
    setTimeout(() => setActiveTab('results'), 300);
  };

  const tabs = [
    { id: 'profile', label: 'Patient Profile', Icon: User },
    { id: 'results', label: 'Results', Icon: Search, badge: trials.length > 0 ? trials.length : null },
    { id: 'analytics', label: 'Analytics', Icon: BarChart2 },
    { id: 'saved', label: 'Saved', Icon: Bookmark, badge: savedIds.length > 0 ? savedIds.length : null },
  ];

  return (
    <div>
      {/* Tab navigation */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(200,154,131,0.15)', marginBottom: '28px', overflowX: 'auto' }}>
        {tabs.map(({ id, label, Icon, badge }) => {
          const active = activeTab === id;
          return (
            <button key={id} onClick={() => setActiveTab(id)} style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              padding: '12px 20px',
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: active ? C : 'rgba(255,255,255,0.38)',
              borderBottom: active ? `2px solid ${C}` : '2px solid transparent',
              marginBottom: '-1px',
              fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
              fontFamily: 'Geist Variable, sans-serif',
              transition: 'color 0.18s',
              whiteSpace: 'nowrap',
            }}>
              <Icon size={14} />
              {label}
              {badge != null && (
                <span style={{ padding: '1px 7px', background: active ? C : 'rgba(255,255,255,0.1)', color: active ? '#171212' : 'rgba(255,255,255,0.55)', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {activeTab === 'profile' && (
          <motion.div key="profile" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>
            <PatientProfileForm onSearch={handleSearch} loading={loading} />
          </motion.div>
        )}
        {activeTab === 'results' && (
          <motion.div key="results" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>
            <ResultsPanel trials={trials} loading={loading} error={error} searched={searched} searchQueries={searchQueries} savedIds={savedIds} onToggleSave={onToggleSave} />
          </motion.div>
        )}
        {activeTab === 'analytics' && (
          <motion.div key="analytics" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>
            <AnalyticsPanel trials={trials} />
          </motion.div>
        )}
        {activeTab === 'saved' && (
          <motion.div key="saved" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>
            <SavedPanel trials={trials} savedIds={savedIds} onToggleSave={onToggleSave} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
