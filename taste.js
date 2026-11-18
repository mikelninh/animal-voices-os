import {selectResearchPortfolio,reviewProposal} from './rsi/taste/core.mjs';

const $ = id=>document.getElementById(id);
const pretty={
 'animal-voices':'Animal Voices',
 'inca-demo':'INCA Evidence Lab',
 'return-loop':'RETURN LOOP',
 'vietkieu-community':'Vietkieu Commons',
 'food-lab':'Food Lab'
};
const statusName={BLOCK:'Vetoed',REVISE:'Needs redesign',REVIEW_DESIGN:'Design review'};
const el=(tag,className,text)=>{
 const node=document.createElement(tag);
 if(className)node.className=className;
 if(text!==undefined)node.textContent=text;
 return node;
};
const append=(parent,...children)=>{for(const child of children)parent.append(child);return parent};
const state={charter:null,proposals:[],reviews:new Map(),portfolio:null,filter:'all',selected:null};
function renderMissions(){
 const grid=$('mission-grid');grid.replaceChildren();
 const missions=Object.entries(state.charter.products);
 missions.forEach(([id,goal],idx)=>{
  const card=el('article','mission');
  const index=el('div','mission-index',String(idx+1).padStart(2,'0')+' / MISSION');
  const title=el('h3','',pretty[id]||id);
  const north=el('p','north',goal.north_star);
  const measure=el('p','measure','First success: '+goal.first_success);
  const foot=el('div','mission-foot');
  const badge=el('span','','Impact: unmeasured');
  const choose=el('button','','Explore ↗');choose.type='button';
  choose.setAttribute('aria-label','Explore research for '+(pretty[id]||id));
  choose.addEventListener('click',()=>{
    $('product-filter').value=id;state.filter=id;state.selected=null;
    renderProposals();document.getElementById('research-lab').scrollIntoView({behavior:'smooth'});
  });
  append(foot,badge,choose);append(card,index,title,north,measure,foot);
  grid.append(card);
 });
}
function renderFilter(){
 const select=$('product-filter');
 Object.keys(state.charter.products).forEach(id=>{
   const opt=document.createElement('option');opt.value=id;opt.textContent=pretty[id]||id;select.append(opt);
 });
 select.addEventListener('change',()=>{state.filter=select.value;state.selected=null;renderProposals()});
}
function renderProposals(){
 const view=$('experiment-cards');view.replaceChildren();
 const visible=state.proposals.filter(p=>state.filter==='all'||p.product===state.filter);
 if(!visible.length){view.append(el('p','loading','No research proposals yet.'));renderInspector(null);return;}
 if(!visible.some(p=>p.id===state.selected))state.selected=visible[0].id;
 visible.forEach(p=>{
   const review=state.reviews.get(p.id);
   const active=p.id===state.selected;
   const item=el('button','experiment'+(active?' selected':''));
   item.type='button';item.setAttribute('aria-pressed',String(active));
   item.setAttribute('aria-label','Inspect '+p.name);
   const top=el('div','experiment-top');
   const label=el('span','experiment-label',pretty[p.product]||p.product);
   const badge=el('span','status'+(review.decision==='BLOCK'?' veto':review.decision==='REVISE'?' revise':''),statusName[review.decision]);
   append(top,label,badge);
   append(item,top,el('span','experiment-name',p.name),el('span','experiment-sub',p.question));
   item.addEventListener('click',()=>{state.selected=p.id;renderProposals()});
   view.append(item);
 });
 renderInspector(visible.find(p=>p.id===state.selected));
}
function addDetail(dl,title,value){
 const row=el('div');append(row,el('dt','',title),el('dd','',value));
 dl.append(row);
}
function renderInspector(p){
 const box=$('experiment-details');box.replaceChildren();
 const download=$('download-brief'),forecast=$('forecast');
 forecast.value='';
 if(!p){download.disabled=true;box.append(el('p','','No experiment selected.'));return;}
 const review=state.reviews.get(p.id);
 box.append(el('h3','',p.name),el('p','',p.question));
 const dl=el('dl','experiment-meta');
 addDetail(dl,'Who benefits',p.beneficiary);
 addDetail(dl,'What we test',p.method);
 addDetail(dl,'Success criterion',p.success_criterion);
 addDetail(dl,'First metric',p.metric);
 addDetail(dl,'Assumptions to challenge',(p.assumptions||[]).join(' · '));
 addDetail(dl,'Estimated, not measured','Importance '+p.impact+'/5 · Learning '+p.learning+'/5 · Tractability '+p.tractability+'/5 · Effort '+p.effort+'/5');
 box.append(dl);
 if(review.decision==='BLOCK')box.append(el('p','warning','Blocked by the mission charter: '+review.reasons.join(', ')+'. This is not an acceptable optimisation objective.'));
 if(review.decision==='REVISE')box.append(el('p','warning','This experiment needs a clearer design: '+review.reasons.join(', ')));
 if(review.decision==='REVIEW_DESIGN')box.append(el('p','micro','Design review only. The research choice, forecast and any release require human approval.'));
 download.disabled=review.decision!=='REVIEW_DESIGN';
 $('export-status').textContent='Private local export · No account, no uploads.';
}
function exportBrief(){
 const p=state.proposals.find(x=>x.id===state.selected);
 if(!p || state.reviews.get(p.id).decision!=='REVIEW_DESIGN')return;
 const raw=$('forecast').value.trim();
 const n=raw===''?null:Number(raw);
 if(raw!==''&&(!Number.isFinite(n)||n<0||n>100)){
   $('export-status').textContent='Please use a forecast between 0 and 100, or leave it blank.';return;
 }
 const brief={
  schema:'taste-experiment-registration-v0.1',
  product:p.product,id:p.id,registered_at:new Date().toISOString(),
  question:p.question,beneficiary:p.beneficiary,method:p.method,
  hypothesis:p.success_criterion,metric:p.metric,target:p.target,
  assumptions:p.assumptions,
  forecast_success_probability:n===null?null:n/100,
  actual_result:null,independent_review:null,
  initial_estimates_not_measurements:{impact:p.impact,learning:p.learning,tractability:p.tractability,effort:p.effort},
  human_approved:false,consent_required_for_participant_data:true,
  disclosure:'Research registration draft only. No outcomes observed. No data was sent.'
 };
 const blob=new Blob([JSON.stringify(brief,null,2)+'\n'],{type:'application/json'});
 const url=URL.createObjectURL(blob);
 const anchor=document.createElement('a');anchor.href=url;anchor.download='taste-'+p.id.toLowerCase()+'-registration.json';
 document.body.append(anchor);anchor.click();anchor.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
 $('export-status').textContent='Draft exported locally. Keep it unchanged as a prior registration before testing.';
}
async function start(){
 try{
  // Only fetch same-origin, public project declarations. No user data is sent.
  const [c,p]=await Promise.all([
   fetch('/rsi/taste/charter.json'),fetch('/rsi/taste/experiments.json')
  ]);
  if(!c.ok||!p.ok)throw Error('Research declarations unavailable');
  state.charter=await c.json();
  const source=await p.json();state.proposals=source.proposals;
  state.portfolio=selectResearchPortfolio(state.proposals,state.charter);
  state.reviews=new Map(state.portfolio.reviews.map(r=>[r.id,r]));
  $('count-missions').textContent=String(Object.keys(state.charter.products).length);
  $('count-proposals').textContent=String(state.proposals.length);
  $('count-vetoes').textContent=String(state.portfolio.blocked.length);
  renderMissions();renderFilter();renderProposals();
  $('download-brief').addEventListener('click',exportBrief);
 }catch(error){
  $('mission-grid').replaceChildren(el('p','loading','Could not load the public research charter.'));
  $('experiment-cards').replaceChildren(el('p','loading','The experiment data could not load. Check this deployment includes the Taste OS files.'));
  $('export-status').textContent='Research data unavailable; no results shown.';
  console.error('Taste OS public declarations unavailable:',String(error?.message||'unknown error'));
 }
}
start();
