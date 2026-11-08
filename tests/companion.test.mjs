import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const dir=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(dir,'..');
const require=createRequire(import.meta.url),t=require('../triage.js');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.webmanifest'),'utf8'));
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
const foo={id:'strength',sources:['strength'],voices:{momo:'test long'}};
test('PWA is installable and handles POST share target with local inbox',()=>{
 assert.equal(manifest.display,'standalone');
 assert.equal(manifest.share_target.method,'POST');
 assert.equal(manifest.share_target.enctype,'multipart/form-data');
 assert.equal(manifest.share_target.action,'/share');
 assert.equal(manifest.share_target.params.text,'text');
 assert.equal(manifest.share_target.params.url,'url');
 for(const icon of manifest.icons)assert.ok(fs.existsSync(path.join(root,icon.src)));
 assert.ok(html.includes('rel="manifest"'));assert.ok(html.includes('id="share-banner"'));
});
test('Share target does not misinterpret an Instagram post link as comment text',()=>{
 const r=t.readShared('?title=Post&text='+encodeURIComponent('https://www.instagram.com/p/ABC/?utm_source=copy')+'&url='+encodeURIComponent('https://www.instagram.com/p/ABC/'));
 assert.ok(r.shared);assert.equal(r.postUrl,'https://www.instagram.com/p/ABC/');assert.equal(r.comment,'');
 const r2=t.readShared('?text='+encodeURIComponent('Vegane Männer sind schwach. https://www.instagram.com/reel/TEST/'));
 assert.equal(r2.comment,'Vegane Männer sind schwach.');assert.equal(r2.postUrl,'https://www.instagram.com/reel/TEST/');
});
test('Only legitimate Instagram hosts accepted; remove tracking',()=>{
 assert.equal(t.instagramUrl('https://www.instagram.com/p/ABC/?igsh=xxx'),'https://www.instagram.com/p/ABC/');
 for(const url of ['https://instagram.com.evil.example/p/1/','http://www.instagram.com/p/1/','https://www.instagram.com.evil/'])assert.equal(t.instagramUrl(url),'');
});
test('Four recommendation categories distinguish threat, bait, supported claim and unknown',()=>{
 assert.equal(t.classify('Ich bring dich um!',foo,null).action,'report');
 assert.equal(t.classify('Ihr Veganer seid Idioten.',foo,null).action,'ignore');
 assert.equal(t.classify('Vegane Männer sind schwach',foo,null).action,'reply');
 assert.equal(t.classify('Was ist deine Meinung zu Quantenphysik?',null,null).action,'save');
 assert.equal(t.classify('Jemand sagt, Veganer sind schwach',foo,'Zitat').action,'save');
 assert.ok(t.classify('Vegane Männer sind schwach',foo,null).reason.includes('Quellen'));
});
test('Saved content ideas remove handles, URLs, emails and phone numbers',()=>{
 const safe=t.sanitizeIdea('Hallo @xy_99 siehe https://example.org/ Test user@example.com +4917612345678');
 assert.ok(!safe.includes('@xy_99')&&!safe.includes('https://')&&!safe.includes('user@example.com')&&!safe.includes('+4917612345678'));
});
test('Short answer variants must be curated and do not invent sourced studies',()=>{
 const text=t.reply(foo,'momo','short');
 assert.ok(text.includes('Meta-Analyse'));
 assert.ok(!text.includes('https://'));
 assert.ok(t.reply(foo,'kiki','short').includes(text));
 assert.equal(t.reply(null,'momo','short'),'');
});
test('Browser approval gate requires original source opened plus manual review',()=>{
 for(const id of ['triage-card','triage-reason','action-grid','reply-short','reply-long','source-check','mark-posted','post-url','after-copy'])assert.ok(html.includes('id="'+id+'"'),id);
 assert.ok(app.includes('sourceOpenedAt'));
 assert.ok(app.includes('sourceOpenedAt') && app.includes('source-check')); 
 assert.ok(app.includes('approvedReply'));
 assert.ok(!app.includes('graph.facebook.com'));
 assert.ok(!app.includes('api.twitter.com'));
});
test('Offline shell intercepts share POST and does not cache comments',()=>{
 assert.ok(sw.includes("caches.match('/index.html')"));
 assert.ok(sw.includes("url.pathname==='/share'"));
 assert.ok(sw.includes("indexedDB.open(DB,1)"));
 assert.ok(sw.includes("Response.redirect(new URL('/?inbox=1#dialog',self.location.origin).href,303)"));
 assert.ok(!sw.includes('cache.put(req'));
 assert.ok(sw.includes("req.mode==='navigate'"));
});
