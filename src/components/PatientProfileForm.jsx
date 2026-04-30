import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { extractKeywords } from '../utils/nlpKeywords';

const C = "#C89A83";

const BIOMARKERS = [
  'EGFR mutation','KRAS G12C','BRAF V600E','HER2+','HER2-','HR+','HR-',
  'BRCA1/2 mutation','NTRK/TRK fusion','PD-L1 ≥50%','PD-L1 <1%','CD19+',
  'CD38+','PSMA+','ALK rearrangement','ROS1 rearrangement','MSI-H','TMB-H',
  'IDH1/2 mutation','FLT3 mutation','MET amplification','FGFR alteration','dMMR',
];

const TREATMENTS = [
  'Carboplatin','Cisplatin','Oxaliplatin','Paclitaxel','Docetaxel','Gemcitabine',
  'Pemetrexed','5-FU','Capecitabine','Bevacizumab','Rituximab','Trastuzumab',
  'Pertuzumab','Pembrolizumab','Nivolumab','Atezolizumab','Durvalumab','Ipilimumab',
  'Letrozole','Anastrozole','Tamoxifen','Fulvestrant','Abiraterone','Enzalutamide',
  'Bortezomib','Lenalidomide','Daratumumab','Ibrutinib','Venetoclax','Olaparib',
  'CDK4/6 inhibitor','Prior EGFR inhibitor','Prior BRAF inhibitor',
  'Prior immunotherapy','Prior CAR-T',
];

const PHASES = ['Phase I','Phase II','Phase III','Phase IV'];

const EMPTY = {
  age: '', sex: 'ALL', condition: '', diseaseStage: '',
  location: '', region: '', ecog: 1, travelWillingness: 'ANY',
  biomarkers: [], priorTreatments: [], phases: [],
  clinicalNotes: '', extractedKeywords: [],
};

const SAMPLES = [
  {
    label: 'EGFR+ NSCLC',
    data: { ...EMPTY, condition: 'Non-Small Cell Lung Cancer', age: '58', diseaseStage: 'Stage IV', biomarkers: ['EGFR mutation'], priorTreatments: ['Prior EGFR inhibitor'] },
  },
  {
    label: 'HR+ Breast Cancer',
    data: { ...EMPTY, condition: 'Breast Cancer', age: '52', sex: 'FEMALE', diseaseStage: 'Metastatic', biomarkers: ['HR+','HER2-'], priorTreatments: ['Letrozole','CDK4/6 inhibitor'] },
  },
  {
    label: 'Newly Dx Myeloma',
    data: { ...EMPTY, condition: 'Multiple Myeloma', age: '65', diseaseStage: 'Newly Diagnosed', biomarkers: ['CD38+'], phases: ['Phase III'] },
  },
];

function PillGroup({ items, selected, onToggle, colorSelected }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px', marginTop: '8px' }}>
      {items.map(item => {
        const on = selected.includes(item);
        return (
          <button key={item} type="button" onClick={() => onToggle(item)} style={{
            padding: '5px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer',
            fontWeight: on ? 600 : 400, transition: 'all 0.14s',
            background: on ? (colorSelected || 'rgba(200,154,131,0.18)') : 'transparent',
            border: `1px solid ${on ? 'rgba(200,154,131,0.55)' : 'rgba(255,255,255,0.1)'}`,
            color: on ? C : 'rgba(255,255,255,0.5)',
            fontFamily: 'Geist Variable, sans-serif',
          }}>
            {item}
          </button>
        );
      })}
    </div>
  );
}

export default function PatientProfileForm({ onSearch, loading }) {
  const [form, setForm] = useState(EMPTY);
  const [keywords, setKeywords] = useState([]);

  useEffect(() => {
    const kws = extractKeywords(form.clinicalNotes);
    setKeywords(kws);
    setForm(prev => ({ ...prev, extractedKeywords: kws }));
  }, [form.clinicalNotes]);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const toggle = (k, v) => setForm(prev => ({
    ...prev, [k]: prev[k].includes(v) ? prev[k].filter(x => x !== v) : [...prev[k], v],
  }));
  const loadSample = d => setForm({ ...EMPTY, ...d });
  const handleSubmit = e => { e.preventDefault(); onSearch({ ...form, extractedKeywords: keywords }); };
  const canSubmit = !loading && form.condition.trim().length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Sample profiles */}
      <div style={{ marginBottom: '22px' }}>
        <div style={metaLabel}>Sample Profiles — Click to Load:</div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '9px' }}>
          {SAMPLES.map(s => (
            <motion.button key={s.label} type="button" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => loadSample(s.data)}
              style={{ padding: '7px 16px', background: 'transparent', border: `1px solid rgba(200,154,131,0.3)`, borderRadius: '6px', color: C, fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Geist Variable, sans-serif', letterSpacing: '0.02em' }}>
              {s.label}
            </motion.button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(200,154,131,0.12)', borderRadius: '14px', padding: '28px 28px 24px' }}>

          {/* Row: Age + Sex */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginBottom: '18px' }}>
            <div>
              <label style={lbl}>Age</label>
              <input type="number" value={form.age} onChange={e => set('age', e.target.value)} placeholder="e.g. 58" min="0" max="120" className="trial-input" style={inp} />
            </div>
            <div>
              <label style={lbl}>Biological Sex</label>
              <select value={form.sex} onChange={e => set('sex', e.target.value)} className="trial-input" style={sel}>
                <option value="ALL">Any / Not specified</option>
                <option value="FEMALE">Female</option>
                <option value="MALE">Male</option>
              </select>
            </div>
          </div>

          {/* Primary Condition */}
          <div style={{ marginBottom: '18px' }}>
            <label style={lbl}>Primary Condition — Required</label>
            <input value={form.condition} onChange={e => set('condition', e.target.value)} placeholder="e.g. Non-Small Cell Lung Cancer" required className="trial-input" style={inp} />
          </div>

          {/* Disease Stage */}
          <div style={{ marginBottom: '18px' }}>
            <label style={lbl}>Disease Stage</label>
            <select value={form.diseaseStage} onChange={e => set('diseaseStage', e.target.value)} className="trial-input" style={sel}>
              <option value="">Select stage</option>
              {['Stage I','Stage II','Stage III','Stage IV','Locally Advanced','Metastatic','Recurrent/Relapsed','Newly Diagnosed'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Location + Region */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginBottom: '18px' }}>
            <div>
              <label style={lbl}>Location (City, State)</label>
              <input value={form.location} onChange={e => set('location', e.target.value)} placeholder="e.g. Boston, MA" className="trial-input" style={inp} />
            </div>
            <div>
              <label style={lbl}>US Region</label>
              <select value={form.region} onChange={e => set('region', e.target.value)} className="trial-input" style={sel}>
                <option value="">Select region</option>
                {['Northeast','Southeast','Midwest','Southwest','West'].map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          {/* ECOG + Travel */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginBottom: '24px' }}>
            <div>
              <label style={lbl}>ECOG Performance Status (0–4)</label>
              <div style={{ marginTop: '12px' }}>
                <input type="range" min="0" max="4" value={form.ecog} onChange={e => set('ecog', parseInt(e.target.value))} className="ecog-slider" style={{ width: '100%', accentColor: C, cursor: 'pointer' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.04em' }}>0 = Fully active · 2 = Self-care only · 4 = Bedbound</span>
                  <span style={{ fontSize: '22px', fontWeight: 800, color: C, fontFamily: 'Manrope', lineHeight: 1 }}>{form.ecog}</span>
                </div>
              </div>
            </div>
            <div>
              <label style={lbl}>Willing to Travel for Trial</label>
              <select value={form.travelWillingness} onChange={e => set('travelWillingness', e.target.value)} className="trial-input" style={sel}>
                <option value="ANY">Yes — any location</option>
                <option value="REGIONAL">Within my region</option>
                <option value="STATE">My state only</option>
                <option value="LOCAL">Within 100 miles</option>
              </select>
            </div>
          </div>

          {/* Biomarkers */}
          <div style={{ marginBottom: '22px' }}>
            <label style={lbl}>Biomarkers / Molecular Profile</label>
            <PillGroup items={BIOMARKERS} selected={form.biomarkers} onToggle={v => toggle('biomarkers', v)} />
          </div>

          {/* Prior Treatments */}
          <div style={{ marginBottom: '22px' }}>
            <label style={lbl}>Prior Treatments Received</label>
            <PillGroup items={TREATMENTS} selected={form.priorTreatments} onToggle={v => toggle('priorTreatments', v)} />
          </div>

          {/* Preferred Phases */}
          <div style={{ marginBottom: '22px' }}>
            <label style={lbl}>Preferred Trial Phases</label>
            <div style={{ display: 'flex', gap: '10px', marginTop: '8px', flexWrap: 'wrap' }}>
              {PHASES.map(ph => {
                const on = form.phases.includes(ph);
                return (
                  <button key={ph} type="button" onClick={() => toggle('phases', ph)} style={{
                    padding: '7px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                    background: on ? 'rgba(200,154,131,0.18)' : 'transparent',
                    border: `1px solid ${on ? 'rgba(200,154,131,0.55)' : 'rgba(255,255,255,0.15)'}`,
                    color: on ? C : 'rgba(255,255,255,0.55)',
                    transition: 'all 0.14s', fontFamily: 'Geist Variable, sans-serif',
                  }}>
                    {ph}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Clinical Notes */}
          <div style={{ marginBottom: '24px' }}>
            <label style={lbl}>Clinical Notes — NLP-Analyzed for Additional Keyword Matching</label>
            <textarea value={form.clinicalNotes} onChange={e => set('clinicalNotes', e.target.value)} rows={4}
              placeholder="Paste clinical notes, pathology reports, mutation details, treatment history — keywords extracted automatically..."
              className="trial-input" style={{ ...inp, resize: 'vertical', lineHeight: 1.6 }} />
            {keywords.length > 0 && (
              <div style={{ marginTop: '7px', fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>
                Keywords extracted:{keywords.map(k => <span key={k} style={{ color: 'rgba(200,154,131,0.7)', marginLeft: '5px' }}>{k}</span>)}
              </div>
            )}
            <div style={{ marginTop: '5px', fontSize: '11px', color: 'rgba(255,255,255,0.22)', fontFamily: 'Geist Variable, sans-serif' }}>
              Keywords extracted from notes refine search queries and boost scoring for matching trials
            </div>
          </div>

          {/* Submit row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <motion.button type="submit" disabled={!canSubmit}
              whileHover={canSubmit ? { scale: 1.02 } : {}} whileTap={canSubmit ? { scale: 0.97 } : {}}
              style={{ padding: '12px 26px', background: canSubmit ? C : 'rgba(200,154,131,0.2)', color: canSubmit ? '#171212' : 'rgba(255,255,255,0.25)', border: 'none', borderRadius: '9px', fontSize: '14px', fontWeight: 700, fontFamily: 'Manrope, sans-serif', cursor: canSubmit ? 'pointer' : 'not-allowed', letterSpacing: '0.05em' }}>
              {loading ? 'Searching...' : 'FIND MATCHING TRIALS →'}
            </motion.button>
            <button type="button" onClick={() => loadSample(SAMPLES[0].data)} style={{ padding: '12px 20px', background: 'transparent', border: '1px solid rgba(255,255,255,0.18)', borderRadius: '9px', color: 'rgba(255,255,255,0.55)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Manrope, sans-serif', letterSpacing: '0.04em' }}>
              LOAD DEMO PROFILE
            </button>
            <button type="button" onClick={() => { setForm(EMPTY); setKeywords([]); }} style={{ padding: '12px 14px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: '13px', cursor: 'pointer', fontFamily: 'Geist Variable, sans-serif' }}>
              Reset
            </button>
            {!canSubmit && <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.25)', fontFamily: 'Geist Variable, sans-serif' }}>Enter a condition to begin</span>}
          </div>
        </div>
      </form>

      {/* Bottom metadata bar */}
      <div style={{ marginTop: '14px', fontSize: '11px', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'Geist Variable, monospace', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <span>9-Factor Weighted Scoring</span>
        <span>·</span><span>NLP Boost</span>
        <span>·</span><span>Up to 4 Queries</span>
        <span>·</span><span>50 Studies Each</span>
        <span>·</span><span>ClinicalTrials.gov API v2</span>
      </div>
    </motion.div>
  );
}

const inp = { width: '100%', padding: '10px 13px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(200,154,131,0.18)', borderRadius: '8px', color: 'white', fontSize: '14px', fontFamily: 'Geist Variable, sans-serif', outline: 'none', boxSizing: 'border-box' };
const sel = { ...inp, cursor: 'pointer', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23C89A83' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' fill='none'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 13px center', paddingRight: '34px' };
const lbl = { display: 'block', marginBottom: '6px', color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' };
const metaLabel = { fontSize: '11px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase' };
