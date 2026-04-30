import { useState } from 'react';
import { motion } from 'motion/react';

const C = "#C89A83";

const STATUS_OPTIONS = [
  { value: 'ANY', label: 'Any Status' },
  { value: 'RECRUITING', label: 'Recruiting' },
  { value: 'NOT_YET_RECRUITING', label: 'Not Yet Recruiting' },
  { value: 'ACTIVE_NOT_RECRUITING', label: 'Active, Not Recruiting' },
  { value: 'COMPLETED', label: 'Completed' },
];

const SEX_OPTIONS = [
  { value: 'ALL', label: 'All / Not Specified' },
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
];

export default function SearchForm({ onSearch, loading }) {
  const [form, setForm] = useState({
    condition: '',
    location: '',
    age: '',
    sex: 'ALL',
    status: 'RECRUITING',
  });

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(form);
  };

  const canSubmit = !loading && form.condition.trim().length > 0;

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, ease: [0.43, 0.13, 0.23, 0.96] }}
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(200,154,131,0.18)',
        borderRadius: '20px',
        padding: '36px 40px',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Condition — full width */}
      <div style={{ marginBottom: '20px' }}>
        <label style={labelStyle}>Medical Condition *</label>
        <input
          name="condition"
          value={form.condition}
          onChange={handleChange}
          placeholder="e.g. diabetes, breast cancer, COPD..."
          required
          className="trial-input"
          style={inputStyle}
        />
      </div>

      {/* 2-column grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <div>
          <label style={labelStyle}>Location / City</label>
          <input
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="e.g. New York, Boston..."
            className="trial-input"
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Age</label>
          <input
            name="age"
            type="number"
            value={form.age}
            onChange={handleChange}
            placeholder="e.g. 45"
            min="0"
            max="120"
            className="trial-input"
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Sex</label>
          <select name="sex" value={form.sex} onChange={handleChange} className="trial-input" style={selectStyle}>
            {SEX_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Recruiting Status</label>
          <select name="status" value={form.status} onChange={handleChange} className="trial-input" style={selectStyle}>
            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      <motion.button
        type="submit"
        disabled={!canSubmit}
        whileHover={canSubmit ? { scale: 1.02 } : {}}
        whileTap={canSubmit ? { scale: 0.98 } : {}}
        style={{
          width: '100%',
          padding: '14px 0',
          background: canSubmit ? C : 'rgba(200,154,131,0.25)',
          color: canSubmit ? '#171212' : 'rgba(255,255,255,0.3)',
          border: 'none',
          borderRadius: '12px',
          fontSize: '15px',
          fontWeight: 700,
          fontFamily: 'Manrope, sans-serif',
          cursor: canSubmit ? 'pointer' : 'not-allowed',
          letterSpacing: '0.04em',
          transition: 'background 0.2s, color 0.2s',
        }}
      >
        {loading ? 'Searching Real Trials...' : 'Find Matching Trials'}
      </motion.button>
    </motion.form>
  );
}

const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(200,154,131,0.2)',
  borderRadius: '10px',
  color: 'white',
  fontSize: '14px',
  fontFamily: 'inherit',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',
};

const selectStyle = {
  ...inputStyle,
  cursor: 'pointer',
  appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23C89A83' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' fill='none'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 14px center',
  paddingRight: '36px',
};

const labelStyle = {
  display: 'block',
  marginBottom: '7px',
  color: C,
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
};
