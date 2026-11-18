/**
 * Taste OS 0.1 — decision quality ABOVE the existing RSI test loop.
 * Taste is NOT a model confidence score and not automatic deployment.
 * Mission principles are human-owned, and ranking dimensions are explicitly
 * labelled unvalidated hypotheses rather than measured product results.
 */
const ordinalKeys=['impact','learning','tractability','effort'];
const metricKinds=new Set(['verified_user_outcome','independent_quality','operational','vanity']);
const computedDenom=(n,d)=>d===0?null:Math.round(10000*n/d)/10000;
export function reviewProposal(proposal,charter) {
  if(!charter?.products || !Array.isArray(charter.vetoes))throw Error('Invalid human-owned mission charter');
  if(!proposal || typeof proposal.id!=='string' || !proposal.id || !charter.products[proposal.product])
    throw Error('Unknown product or proposal ID');
  const reasons=[];
  const forbidden=(proposal.vetoes||[]).filter(v=>charter.vetoes.includes(v));
  if(forbidden.length)reasons.push('MISSION_VETO:'+forbidden.join(','));
  const goal=charter.products[proposal.product];
  if(goal.vanity_metrics.includes(proposal.metric))reasons.push('VANITY_PROXY_NOT_OUTCOME');
  for(const f of ['name','question','beneficiary','metric','success_criterion','method']){
    if(typeof proposal[f]!=='string'||!proposal[f].trim())reasons.push('MISSING_'+f.toUpperCase());
  }
  for(const field of ordinalKeys){
    if(!Number.isInteger(proposal[field])||proposal[field]<1||proposal[field]>5)
      reasons.push('INVALID_ORDINAL_'+field.toUpperCase());
  }
  if(proposal.forecast_success!==null && proposal.forecast_success!==undefined &&
     (typeof proposal.forecast_success!=='number' || proposal.forecast_success<0 || proposal.forecast_success>1))
    reasons.push('INVALID_FORECAST');
  // Do not log personal input, raw customer comments, or the proposal text in reports.
  const blocked=reasons.some(x=>x.startsWith('MISSION_VETO')||x==='VANITY_PROXY_NOT_OUTCOME');
  const invalid=reasons.some(x=>x.startsWith('MISSING_')||x.startsWith('INVALID_'));
  return {id:proposal.id,product:proposal.product,decision:blocked?'BLOCK':invalid?'REVISE':'REVIEW_DESIGN',
    reasons,forecast_recorded:typeof proposal.forecast_success==='number',
    dimensions:Object.fromEntries(ordinalKeys.map(k=>[k,proposal[k]])),
    status:'hypothesis_not_result',deployment:'HUMAN_APPROVAL_REQUIRED'};
}
export function dominates(a,b) {
  // Ordinal HUMAN assessments: heuristic Pareto ranking, not estimated impact.
  // Effort is to be minimised; other dimensions maximised.
  if(a.product!==b.product)return false;
  const betterOrEqual=a.impact>=b.impact && a.learning>=b.learning &&
    a.tractability>=b.tractability && a.effort<=b.effort;
  const strictly=a.impact>b.impact || a.learning>b.learning ||
    a.tractability>b.tractability || a.effort<b.effort;
  return betterOrEqual && strictly;
}
export function selectResearchPortfolio(proposals,charter) {
  if(!Array.isArray(proposals))throw Error('Need proposals');
  if(new Set(proposals.map(p=>p.id)).size!==proposals.length)throw Error('Duplicate proposal IDs');
  const reviews=proposals.map(p=>reviewProposal(p,charter));
  const valid=proposals.filter((p,i)=>reviews[i].decision==='REVIEW_DESIGN');
  const byProduct=Object.keys(charter.products).map(product=>{
    const ps=valid.filter(p=>p.product===product);
    const pareto=ps.filter(p=>!ps.some(other=>other.id!==p.id && dominates(other,p)));
    return {product,proposed:proposals.filter(p=>p.product===product).length,
      eligible_for_design_review:ps.length,
      pareto_candidates:pareto.map(p=>p.id).sort()};
  });
  return {schema:'taste-0.1',status:'research_proposals_only',total:proposals.length,
    blocked:reviews.filter(r=>r.decision==='BLOCK').map(r=>r.id),
    to_redesign:reviews.filter(r=>r.decision==='REVISE').map(r=>r.id),
    reviews,by_product:byProduct,
    selected_experiment:null,reason:'Human must choose across beneficiaries and verify assumptions.',
    trained_taste_model:false, measured_effectiveness:null, automatically_deployed:false};
}
export function forecastCalibration(records) {
  if(!Array.isArray(records))throw Error('Need forecast records');
  const observed=records.filter(r=>r.result===true||r.result===false);
  if(observed.some(r=>typeof r.forecast!=='number'||r.forecast<0||r.forecast>1))
    throw Error('Resolved predictions need a previously registered probability [0,1]');
  const brier=observed.length?observed.reduce((s,r)=>s+(r.forecast-Number(r.result))**2,0)/observed.length:null;
  return {total:records.length,resolved:observed.length,unresolved:records.length-observed.length,
    mean_brier:brier===null?null:Math.round(brier*10000)/10000,
    interpretation:'Brier: lower is better; observational; no causal attribution.'};
}
export function preferenceAgreement(comparisons) {
  if(!Array.isArray(comparisons))throw Error('Need pairwise comparisons');
  const eligible=comparisons.filter(x=>x.human_choice==='a'||x.human_choice==='b');
  if(eligible.some(x=>!['a','b'].includes(x.predicted_choice)))throw Error('Invalid blind comparison prediction');
  const matched=eligible.filter(x=>x.human_choice===x.predicted_choice).length;
  return {comparisons:comparisons.length,eligible:eligible.length,matched,
    agreement:computedDenom(matched,eligible.length),
    human_disagreements_are_data:true,
    note:'Requires actual independent blinded human labels; no cases supplied means unknown.'};
}
export function labelExperimentEvidence(outcomes) {
  if(!Array.isArray(outcomes))throw Error('Need outcomes');
  const actual=outcomes.filter(x=>x.verified===true && x.kind==='real_user');
  return {experiments:outcomes.length,independently_verified_real_user_outcomes:actual.length,
    claimed_value:actual.length ? 'inspect_underlying_outcome_before_claiming' : null,
    no_outcomes_observed:outcomes.length===0};
}
