// 9-factor weighted scoring, total = 100 pts

function parseAge(s) {
  const m = s?.match(/(\d+)/);
  return m ? parseInt(m[1]) : null;
}

export function buildSearchQueries(profile) {
  const cond = profile.condition?.trim();
  if (!cond) return [];
  const set = new Set([cond]);
  if (profile.biomarkers?.length > 0) set.add(`${cond} ${profile.biomarkers[0]}`);
  if (profile.diseaseStage) set.add(`${cond} ${profile.diseaseStage}`);
  if (profile.extractedKeywords?.length > 0) set.add(`${cond} ${profile.extractedKeywords[0]}`);
  return [...set].slice(0, 4);
}

export function scoreTrial(trial, profile) {
  const p = trial.protocolSection || {};
  const conds = p.conditionsModule?.conditions || [];
  const elig = p.eligibilityModule || {};
  const design = p.designModule || {};
  const locs = p.contactsLocationsModule?.locations || [];
  const title = (p.identificationModule?.briefTitle || '').toLowerCase();
  const summary = (p.descriptionModule?.briefSummary || '').toLowerCase();
  const eligText = (elig.eligibilityCriteria || '').toLowerCase();
  const phases = design.phases || [];

  let score = 0;
  const bd = {};
  const why = [];

  // 1. Condition — 28 pts
  const condQ = profile.condition?.toLowerCase().trim() || '';
  if (condQ) {
    const inConds = conds.some(c => c.toLowerCase().includes(condQ) || condQ.includes(c.toLowerCase()));
    const inTitle = title.includes(condQ);
    const inSummary = summary.slice(0, 500).includes(condQ);
    if (inConds || inTitle) {
      score += 28; bd.condition = 28;
      const hit = conds.find(c => c.toLowerCase().includes(condQ) || condQ.includes(c.toLowerCase()));
      why.push(`Condition match: ${hit || conds[0] || profile.condition}`);
    } else if (inSummary) {
      score += 16; bd.condition = 16;
      why.push(`Condition match: ${conds[0] || profile.condition}`);
    } else {
      bd.condition = 0;
    }
  } else { score += 14; bd.condition = 14; }

  // 2. Biomarker — 18 pts
  const bios = profile.biomarkers || [];
  if (bios.length > 0) {
    const text = `${title} ${summary.slice(0, 800)} ${eligText.slice(0, 800)}`;
    const matched = bios.filter(b => text.includes(b.toLowerCase()));
    if (matched.length > 0) {
      const pts = Math.min(18, Math.round(18 * (0.5 + 0.5 * matched.length / bios.length)));
      score += pts; bd.biomarker = pts;
      why.push(`Biomarker match: ${matched.slice(0, 2).join(', ')}`);
    } else { bd.biomarker = 0; }
  } else { score += 9; bd.biomarker = 9; }

  // 3. Location — 14 pts
  if (profile.location?.trim()) {
    const q = profile.location.toLowerCase().trim();
    const locStr = locs.flatMap(l => [l.city, l.state, l.country]).filter(Boolean).map(s => s.toLowerCase()).join(' ');
    if (locStr.includes(q)) { score += 14; bd.location = 14; why.push('Location match'); }
    else { bd.location = 0; }
  } else { score += 7; bd.location = 7; }

  // 4. Age — 8 pts
  if (profile.age && !isNaN(parseInt(profile.age))) {
    const ua = parseInt(profile.age);
    const mn = parseAge(elig.minimumAge); const mx = parseAge(elig.maximumAge);
    const ok = (mn === null || ua >= mn) && (mx === null || ua <= mx);
    score += ok ? 8 : 0; bd.age = ok ? 8 : 0;
    if (ok) why.push('Age within range');
  } else { score += 4; bd.age = 4; }

  // 5. Sex — 6 pts
  const tSex = (elig.sex || 'ALL').toUpperCase();
  const uSex = (profile.sex || 'ALL').toUpperCase();
  const sexOk = tSex === 'ALL' || uSex === 'ALL' || tSex === uSex;
  score += sexOk ? 6 : 0; bd.sex = sexOk ? 6 : 0;

  // 6. ECOG — 8 pts
  if (profile.ecog !== undefined && profile.ecog !== null) {
    const m = eligText.match(/ecog\D{0,25}(\d)/i) || eligText.match(/performance status\D{0,25}(\d)/i);
    if (m) {
      const ok = profile.ecog <= parseInt(m[1]);
      score += ok ? 8 : 0; bd.ecog = ok ? 8 : 0;
      if (ok) why.push(`ECOG ${profile.ecog} eligible`);
    } else { score += 5; bd.ecog = 5; }
  } else { score += 4; bd.ecog = 4; }

  // 7. Disease stage — 8 pts
  if (profile.diseaseStage) {
    const sl = profile.diseaseStage.toLowerCase();
    const txt = `${title} ${summary.slice(0, 500)} ${eligText.slice(0, 500)}`;
    const ok = txt.includes(sl)
      || (sl.includes('metastatic') && (txt.includes('advanced') || txt.includes('stage iv')))
      || (sl.includes('stage iv') && txt.includes('metastatic'));
    const pts = ok ? 8 : eligText.length === 0 ? 4 : 2;
    score += pts; bd.stage = pts;
    if (ok) why.push(`Stage match: ${profile.diseaseStage}`);
  } else { score += 4; bd.stage = 4; }

  // 8. Phase preference — 5 pts
  const prefPhases = profile.phases || [];
  if (prefPhases.length > 0 && phases.length > 0) {
    const hit = phases.some(tp => prefPhases.some(pp => tp.toLowerCase().replace(/_/g, ' ').includes(pp.toLowerCase())));
    score += hit ? 5 : 1; bd.phase = hit ? 5 : 1;
  } else {
    const pts = phases.length > 0 ? 3 : 2;
    score += pts; bd.phase = pts;
  }

  // 9. NLP keywords — 5 pts
  const kws = profile.extractedKeywords || [];
  if (kws.length > 0) {
    const txt = `${title} ${summary.slice(0, 600)} ${eligText.slice(0, 400)}`;
    const hits = kws.filter(k => txt.includes(k.toLowerCase()));
    const pts = hits.length > 0 ? Math.min(5, hits.length + 1) : 0;
    score += pts; bd.notes = pts;
  } else { score += 3; bd.notes = 3; }

  const percentage = Math.min(100, Math.max(0, score));

  let eligibility_status = 'low';
  if (percentage >= 60) eligibility_status = 'eligible';
  else if (percentage >= 38) eligibility_status = 'possible';

  let matchLabel = 'Low match';
  if (percentage >= 85) matchLabel = 'Strong match';
  else if (percentage >= 70) matchLabel = 'Good match';
  else if (percentage >= 55) matchLabel = 'Possible match';
  else if (percentage >= 38) matchLabel = 'Partial match';

  return { score, percentage, breakdown: bd, eligibility_status, matchLabel, explanation: why.join(' · ') };
}
