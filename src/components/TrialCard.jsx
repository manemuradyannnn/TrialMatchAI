import { motion } from 'motion/react';
import { ExternalLink, MapPin, Building2, Users, Bookmark, BookmarkCheck } from 'lucide-react';

const C = "#C89A83";

const STATUS_META = {
  RECRUITING: { bg: 'rgba(74,222,128,0.12)', text: '#4ade80', border: 'rgba(74,222,128,0.25)', label: 'Recruiting' },
  NOT_YET_RECRUITING: { bg: 'rgba(251,191,36,0.12)', text: '#fbbf24', border: 'rgba(251,191,36,0.25)', label: 'Not Yet Recruiting' },
  ACTIVE_NOT_RECRUITING: { bg: 'rgba(96,165,250,0.12)', text: '#60a5fa', border: 'rgba(96,165,250,0.25)', label: 'Active, Not Recruiting' },
  COMPLETED: { bg: 'rgba(156,163,175,0.1)', text: '#9ca3af', border: 'rgba(156,163,175,0.2)', label: 'Completed' },
  TERMINATED: { bg: 'rgba(248,113,113,0.1)', text: '#f87171', border: 'rgba(248,113,113,0.2)', label: 'Terminated' },
};

const ELIG_META = {
  eligible: { bg: 'rgba(74,222,128,0.14)', text: '#4ade80', border: 'rgba(74,222,128,0.3)', label: 'Eligible' },
  possible: { bg: 'rgba(251,191,36,0.12)', text: '#fbbf24', border: 'rgba(251,191,36,0.28)', label: 'Possible Fit' },
  low: { bg: 'rgba(255,255,255,0.06)', text: 'rgba(255,255,255,0.4)', border: 'rgba(255,255,255,0.12)', label: 'Low Match' },
};

function scoreColor(pct) {
  if (pct >= 75) return '#4ade80';
  if (pct >= 50) return C;
  return '#f87171';
}

function Badge({ bg, text, border, label }) {
  return (
    <span style={{ padding: '3px 9px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.04em', background: bg, color: text, border: `1px solid ${border}`, whiteSpace: 'nowrap' }}>
      {label}
    </span>
  );
}

export default function TrialCard({ trial, index, saved, onSave, compact }) {
  const p = trial.protocolSection || {};
  const id = p.identificationModule || {};
  const statusMod = p.statusModule || {};
  const desc = p.descriptionModule || {};
  const conds = p.conditionsModule?.conditions || [];
  const elig = p.eligibilityModule || {};
  const phases = p.designModule?.phases || [];
  const sponsor = p.sponsorCollaboratorsModule?.leadSponsor?.name;
  const locs = p.contactsLocationsModule?.locations || [];
  const ms = trial.matchScore || { percentage: 0, eligibility_status: 'low', matchLabel: '', explanation: '' };

  const nctId = id.nctId || '';
  const title = id.briefTitle || 'Untitled Trial';
  const status = statusMod.overallStatus || 'UNKNOWN';
  const summary = desc.briefSummary || '';
  const pct = ms.percentage;
  const sc = scoreColor(pct);

  const statusInfo = STATUS_META[status] || { bg: 'rgba(255,255,255,0.07)', text: '#aaa', border: 'rgba(255,255,255,0.15)', label: status };
  const eligInfo = ELIG_META[ms.eligibility_status] || ELIG_META.low;
  const phaseLabel = phases.length > 0 ? phases.map(ph => ph.replace(/_/g, ' ')).join('/') : 'N/A';

  const primaryLoc = locs[0];
  const locText = primaryLoc ? [primaryLoc.city, primaryLoc.state, primaryLoc.country].filter(Boolean).join(', ') : null;

  if (compact) {
    return (
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(200,154,131,0.12)', borderRadius: '12px', padding: '16px', height: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <Badge {...statusInfo} />
          <span style={{ fontSize: '20px', fontWeight: 800, color: sc, fontFamily: 'Manrope' }}>{pct}%</span>
        </div>
        <h4 style={{ margin: '0 0 10px', fontSize: '13px', color: 'white', lineHeight: 1.4, fontFamily: 'Manrope', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{title}</h4>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Badge {...eligInfo} />
          {nctId && <a href={`https://clinicaltrials.gov/study/${nctId}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', color: C, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>CT.gov <ExternalLink size={10} /></a>}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.05 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.06, 0.3), ease: [0.43, 0.13, 0.23, 0.96] }}
      style={{
        display: 'flex',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(200,154,131,0.1)',
        borderLeft: `3px solid ${sc}`,
        borderRadius: '10px',
        overflow: 'hidden',
      }}
    >
      {/* Rank column */}
      <div style={{ width: '44px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '18px 0 0', flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.05)' }}>
        <span style={{ fontSize: '15px', fontWeight: 800, color: sc, fontFamily: 'Manrope' }}>{index + 1}</span>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: '16px 18px', minWidth: 0 }}>
        {/* Title row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: '10px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ margin: '0 0 5px', fontSize: '14px', fontWeight: 600, color: 'white', lineHeight: 1.45, fontFamily: 'Manrope' }}>{title}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>{nctId}</span>
              {nctId && (
                <a href={`https://clinicaltrials.gov/study/${nctId}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', color: C, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px', opacity: 0.8 }}>
                  CT.gov <ExternalLink size={10} />
                </a>
              )}
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: '28px', fontWeight: 800, color: sc, fontFamily: 'Manrope', lineHeight: 1 }}>{pct}</div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.06em' }}>/ 100</div>
          </div>
        </div>

        {/* Badges */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
          <Badge bg="rgba(255,255,255,0.07)" text="rgba(255,255,255,0.5)" border="rgba(255,255,255,0.12)" label={phaseLabel} />
          <Badge {...statusInfo} />
          {conds.slice(0, 2).map(c => (
            <Badge key={c} bg="rgba(200,154,131,0.1)" text={C} border="rgba(200,154,131,0.22)" label={c.length > 28 ? c.slice(0, 28) + '…' : c} />
          ))}
          <Badge {...eligInfo} />
        </div>

        {/* Match bar + label */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>{ms.matchLabel}</span>
          <span style={{ fontSize: '12px', color: sc, fontWeight: 700 }}>{pct}%</span>
        </div>
        <div style={{ height: '4px', background: 'rgba(255,255,255,0.07)', borderRadius: '2px', marginBottom: '8px', overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${pct}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: Math.min(index * 0.06, 0.3) + 0.15 }}
            style={{ height: '100%', background: `linear-gradient(90deg, ${sc}, ${C})`, borderRadius: '2px' }}
          />
        </div>

        {/* Explanation */}
        {ms.explanation && (
          <p style={{ margin: '0 0 10px', fontSize: '12px', color: sc === '#4ade80' ? 'rgba(74,222,128,0.75)' : 'rgba(200,154,131,0.7)', lineHeight: 1.5, fontFamily: 'Geist Variable, sans-serif' }}>
            {ms.explanation}
          </p>
        )}

        {/* Summary snippet */}
        {summary && (
          <p style={{ margin: '0 0 10px', fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {summary}
          </p>
        )}

        {/* Meta row */}
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '12px' }}>
          {locText && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'rgba(255,255,255,0.38)' }}>
              <MapPin size={11} />{locText}{locs.length > 1 ? ` / +${locs.length - 1} sites` : ''}
            </span>
          )}
          {sponsor && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'rgba(255,255,255,0.38)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <Building2 size={11} />{sponsor}
            </span>
          )}
          {(elig.minimumAge || elig.maximumAge) && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'rgba(255,255,255,0.38)' }}>
              <Users size={11} />{[elig.minimumAge, elig.maximumAge].filter(Boolean).join(' – ')}
            </span>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button onClick={() => onSave?.(nctId)} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'transparent', border: 'none', cursor: 'pointer', color: saved ? C : 'rgba(255,255,255,0.35)', fontSize: '12px', fontFamily: 'Geist Variable, sans-serif', padding: 0 }}>
            {saved ? <BookmarkCheck size={13} /> : <Bookmark size={13} />}
            {saved ? 'Saved' : 'Save'}
          </button>
          {nctId && (
            <a href={`https://clinicaltrials.gov/study/${nctId}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: C, textDecoration: 'none', fontWeight: 600, letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'Manrope' }}>
              EXPLAIN MATCH <ExternalLink size={11} />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
