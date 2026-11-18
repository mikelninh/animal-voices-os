/* RSI 2.0: dependency-free, project-agnostic evaluation and conservative promotion gates.
 * No LLM judging itself, no automatic rollout, no synthetic impact claims.
 */
export function fraction(n, d) { return d ? Number((n / d).toFixed(4)) : null; }
function same(actual, expected) {
  return Object.entries(expected).every(([key, value]) => actual?.[key] === value);
}
function safely(fn, input) {
  try {
    const result = fn(input);
    if (!result || typeof result !== 'object' || result instanceof Promise)
      throw Error('Adapter must synchronously return an object');
    return {result, error: null};
  } catch (error) {
    return {result: {}, error: String(error?.name || 'Error')};
  }
}
function summarise(rows, version) {
  const n = rows.length;
  const correct = rows.filter(r => r[version].pass).length;
  const sensitive = rows.filter(r => r.critical);
  const criticalErrors = sensitive.filter(r => !r[version].pass).length;
  const groups = [...new Set(rows.map(r => r.group))].sort().map(group => {
    const set = rows.filter(r => r.group === group);
    return {group, n: set.length, correct: set.filter(r => r[version].pass).length,
      accuracy: fraction(set.filter(r => r[version].pass).length, set.length)};
  });
  return {n, correct, accuracy: fraction(correct, n), critical_n: sensitive.length,
    critical_errors: criticalErrors, critical_error_rate: fraction(criticalErrors, sensitive.length),
    groups};
}
/**
 * Each case has {id, group, input, expected:{field:value}, critical}.
 * The adapter returns a small, deterministic decision object.
 * Never place raw comments, secrets or PII in output reports.
 *
 * Real-user preference, latency, money and impact intentionally remain null
 * until independently collected and added through a separate evidence record.
 */
export function evaluateSuite({product, dataset, split='frozen-regression',
  cases, baseline, candidate, baselineVersion='baseline', candidateVersion='candidate'}) {
  if (typeof product !== 'string' || !product.trim() || !Array.isArray(cases) ||
      cases.length === 0 || typeof baseline !== 'function' || typeof candidate !== 'function')
    throw Error('A product, nonempty cases and two adapters are required');
  const ids = cases.map(c => c.id);
  if (new Set(ids).size !== ids.length || ids.some(id => typeof id !== 'string' || !id))
    throw Error('Every case needs a unique, nonempty id');
  const rows = cases.map(c => {
    if (!c.expected || Object.keys(c.expected).length === 0 || !c.group)
      throw Error('Every case needs a group and an expected result: ' + c.id);
    const a = safely(baseline, c.input), b = safely(candidate, c.input);
    return {id:c.id, group:c.group, critical:c.critical === true,
      baseline:{pass:!a.error && same(a.result,c.expected), error:a.error},
      candidate:{pass:!b.error && same(b.result,c.expected), error:b.error}};
  });
  const a = summarise(rows,'baseline'), b = summarise(rows,'candidate');
  const regressions = rows.filter(r => r.baseline.pass && !r.candidate.pass).map(r => r.id);
  const improvements = rows.filter(r => !r.baseline.pass && r.candidate.pass).map(r => r.id);
  const criticalRegressions = rows.filter(r => r.critical && r.baseline.pass &&
    !r.candidate.pass).map(r => r.id);
  const reasons = [];
  if (b.critical_errors > 0) reasons.push('critical_failures');
  if (regressions.length) reasons.push('regressions');
  if (b.correct <= a.correct) reasons.push('no_measured_improvement');
  // A clean mechanical preflight is necessary but not sufficient for release.
  const automatedGate = reasons.length ? 'BLOCK' : 'PASS_PRECHECK';
  const report = {
    schema:'rsi-2.0', product, dataset, split, baseline_version:baselineVersion,
    candidate_version:candidateVersion, sample_size:rows.length,
    baseline:a, candidate:b,
    delta_correct:b.correct-a.correct,
    improvements, regressions, critical_regressions:criticalRegressions,
    automated_gate:automatedGate, reasons,
    promotion:'HUMAN_REVIEW_REQUIRED',
    user_preference:null, observed_latency_ms:null, observed_cost_usd:null,
    real_world_impact:null,
    rows,
    caveat:'Frozen synthetic regression tests only. This is not real-user effectiveness, source verification or causal impact.'
  };
  return report;
}
export function summariseEvidence(records) {
  if (!Array.isArray(records) || records.length === 0) return {n:0, yes:null, maybe:null, no:null,
    publish_worthy_rate:null, critical_flag_rate:null};
  if (records.some(r => !['yes','maybe','no'].includes(r.vote) || typeof r.critical !== 'boolean'))
    throw Error('Each consented record needs vote yes/maybe/no and critical boolean');
  const count = v => records.filter(r => r.vote === v).length;
  return {n:records.length,yes:count('yes'),maybe:count('maybe'),no:count('no'),
    publish_worthy_rate:fraction(count('yes')+count('maybe'),records.length),
    critical_flag_rate:fraction(records.filter(r => r.critical).length,records.length)};
}
