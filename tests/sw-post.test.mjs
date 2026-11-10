import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import vm from 'node:vm';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
test('Service Worker POST Share Target writes only to local IndexedDB and redirects without text parameters',async()=>{
 const listeners={},local={};let remoteCalls=0;
 const db={objectStoreNames:{contains:()=>true},transaction(){const tx={objectStore(){return {put(data,key){local[key]=data;queueMicrotask(()=>tx.oncomplete?.())}}},oncomplete:null,onerror:null};return tx},close(){}};
 const indexedDB={open(){const req={result:db};queueMicrotask(()=>req.onsuccess?.());return req}};
 const self={location:{origin:'https://animal-voices-os.vercel.app'},addEventListener:(name,fn)=>listeners[name]=fn};
 const context={self,indexedDB,caches:{},URL,Response,fetch(){remoteCalls++;throw Error('remote access not expected')},Date,Promise,queueMicrotask};
 vm.runInNewContext(fs.readFileSync(path.join(root,'sw.js'),'utf8'),context);
 const form=new Map([['text','Vegane Männer sind schwach'],['url','https://www.instagram.com/p/ABC/'],['title','Instagram']]);
 let result;
 listeners.fetch({request:{method:'POST',url:'https://animal-voices-os.vercel.app/share',formData:async()=>form},respondWith:p=>{result=p}});
 const response=await result;
 assert.equal(response.status,303);assert.equal(response.headers.get('location'),'https://animal-voices-os.vercel.app/phone.html?inbox=1');
 assert.equal(local.latest.text,'Vegane Männer sind schwach');
 assert.equal(remoteCalls,0);
 assert.ok(!response.headers.get('location').includes('Vegane'));
});
