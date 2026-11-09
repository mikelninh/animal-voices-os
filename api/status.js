'use strict';
/* Public capability indicator. Never exposes provider keys or access codes. */
module.exports = async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 res.setHeader('X-Content-Type-Options','nosniff');
 if(req.method!=='GET')return res.status(405).json({ok:false,error:'Only GET supported.'});
 const configured=Boolean(process.env.OPENAI_API_KEY&&process.env.AVOS_EDITOR_CODE&&process.env.AVOS_EDITOR_CODE.length>=16);
 return res.status(200).json({
   ok:true,available:configured,access:'private_editor',requires_explicit_consent:true,
   modes:['improve','new'],factual_basis:'curated_source_cards_only',
   live_source_verification:false,automatic_social_posting:false
 });
};