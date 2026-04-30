import { useState, useCallback } from 'react';
import { scoreTrial, buildSearchQueries } from '../utils/matchingAlgorithm';

const API_BASE = 'https://clinicaltrials.gov/api/v2/studies';

async function fetchBatch(queryCondition) {
  const params = new URLSearchParams({ format: 'json', pageSize: '50', 'query.cond': queryCondition });
  const res = await fetch(`${API_BASE}?${params}`);
  if (!res.ok) throw new Error(`API ${res.status}`);
  const data = await res.json();
  return data.studies || [];
}

export function useClinicalTrials() {
  const [trials, setTrials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);
  const [searchQueries, setSearchQueries] = useState([]);
  const [savedIds, setSavedIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ctm_saved') || '[]'); }
    catch { return []; }
  });

  const search = useCallback(async (profile) => {
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const queries = buildSearchQueries(profile);
      setSearchQueries(queries);

      const batches = await Promise.all(queries.map(q => fetchBatch(q).catch(() => [])));

      const seen = new Set();
      const all = batches.flat().filter(t => {
        const id = t.protocolSection?.identificationModule?.nctId;
        if (!id || seen.has(id)) return false;
        seen.add(id);
        return true;
      });

      const scored = all
        .map(t => ({ ...t, matchScore: scoreTrial(t, profile) }))
        .sort((a, b) => b.matchScore.percentage - a.matchScore.percentage);

      setTrials(scored);
    } catch (err) {
      setError(err.message || 'Failed to fetch');
      setTrials([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleSave = useCallback((nctId) => {
    setSavedIds(prev => {
      const next = prev.includes(nctId) ? prev.filter(id => id !== nctId) : [...prev, nctId];
      localStorage.setItem('ctm_saved', JSON.stringify(next));
      return next;
    });
  }, []);

  return { trials, loading, error, searched, searchQueries, savedIds, toggleSave, search };
}
