from playwright.sync_api import sync_playwright
from urllib.parse import quote
from pathlib import Path
BASE='http://127.0.0.1:5173'
logs=[]
def assertion(cond,msg):
 if not cond:raise AssertionError(msg)
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 def test(name, fn):
  try:fn();logs.append(('PASS',name))
  except Exception as e:logs.append(('FAIL',name,str(e)[:450]))
 def page(width=1280,height=900):
  ctx=browser.new_context(viewport={'width':width,'height':height},is_mobile=(width<600),has_touch=(width<600),accept_downloads=True)
  pg=ctx.new_page();pg.set_default_timeout(5000);return ctx,pg
 def mount(pg,share_text=None):
  import base64
  root=Path('/mnt/data/animal-voices-v08')
  html=(root/'index.html').read_text()
  css=(root/'styles.css').read_text()
  css=css[css.find(';')+1:] if css.startswith('@import') else css
  html=html.replace('<link rel="stylesheet" href="./styles.css">','<style>'+css+'</style>')
  for file in ['trio.webp','momo.webp','kiki.webp','bao.webp']:
   data=base64.b64encode((root/'characters'/file).read_bytes()).decode()
   html=html.replace('./characters/'+file,'data:image/webp;base64,'+data)
  for file in ['data.js','companion-core.js','app.js','companion.js']:
   code=(root/file).read_text()
   if file=='companion.js' and share_text is not None:
    code=code.replace('core.extractShare(window.location.search)','core.extractShare("?shared=1&text="+encodeURIComponent('+repr(share_text)+'))')
   html=html.replace('<script src="./'+file+'"></script>','<script>'+code+'</script>')
  pg.evaluate("""
   window.__mockStore = {};
   Object.defineProperty(window, 'localStorage', {value:{getItem:k=>window.__mockStore[k]||null,setItem:(k,v)=>{window.__mockStore[k]=v},removeItem:k=>{delete window.__mockStore[k]}}});
   window.history.replaceState = () => { window.__replaceCalled = true; };
  """)
  pg.set_content(html,wait_until='domcontentloaded',timeout=15000)
 ctx,pg=page();errors=[];pg.on('pageerror',lambda e:errors.append(str(e)))
 mount(pg)
 test('PWA manifest available',lambda:assertion(pg.locator('link[rel=manifest]').count()==1,'manifest link'))
 test('First screen has single main task',lambda:assertion(pg.locator('#comment').is_visible() and pg.locator('#triage-panel').is_hidden(),'first action'))
 pg.locator('#comment').fill('Vegane Männer sind doch schwach und können keine Muskeln aufbauen.')
 pg.locator('#analyze').click()
 test('Triage recommends sourced reply',lambda:assertion(pg.locator('#triage-panel').is_visible() and pg.locator('[data-action=reply]').get_attribute('aria-pressed')=='true','triage'))
 test('No premature editor',lambda:assertion(pg.locator('#result-area').is_hidden(),'should not pre-render answer'))
 pg.locator('[data-action=reply]').click()
 test('Evidence shown',lambda:assertion(pg.locator('#evidence-card').is_visible() and pg.locator('a[href*="doi.org/"]').count()>0,'source visible'))
 test('Approval initially disabled',lambda:assertion(pg.locator('#approve').is_disabled() and pg.locator('#copy').is_disabled(),'approval gate'))
 test('Short reply initially selected',lambda:assertion(pg.locator('[data-length=short]').get_attribute('aria-pressed')=='true','short selected'))
 pg.locator('[data-persona=bao]').click()
 pg.locator('#reviewer').fill('QA');pg.locator('#review-check').check();pg.locator('#approve').click()
 test('Approval and copy unlocked',lambda:assertion(pg.locator('#copy').is_enabled() and pg.locator('#after-approval').is_visible(),'copy unlocked'))
 pg.locator('#reply').fill('Neuer Text, der wieder kontrolliert werden muss.')
 test('Edit revokes approval',lambda:assertion(pg.locator('#copy').is_disabled() and pg.locator('#approve').is_disabled(),'revocation'))
 pg.locator('#review-check').check();pg.locator('#approve').click()
 pg.locator('#mark-posted').click()
 test('Self-reported post is explicit only',lambda:assertion(pg.locator('#posted-note').inner_text().find('keine')>=0 or pg.locator('#mark-posted').is_disabled(),'self-report'))
 pg.locator('#comment').fill('Jemand sagt, Veganer können gar keine Muskeln aufbauen.')
 pg.locator('#analyze').click()
 test('Quoted claim needs context',lambda:assertion('Kontext' in pg.locator('#triage-recommendation').inner_text(),'quoted context'))
 pg.locator('[data-action=save]').click()
 test('Save content idea',lambda:assertion('vorgemerkt' in pg.locator('#action-outcome').inner_text(),'saved'))
 pg.locator('#comment').fill('Halt die Fresse, dumme Veganer!')
 pg.locator('#analyze').click()
 test('Pure insult recommends ignoring',lambda:assertion(pg.locator('[data-action=ignore]').get_attribute('aria-pressed')=='true','ignore recommended'))
 pg.locator('[data-action=ignore]').click()
 test('Ignore path has no answer',lambda:assertion(pg.locator('#result-area').is_hidden(),'no drafting'))
 pg.locator('#comment').fill('Ich bringe dich um!')
 pg.locator('#analyze').click()
 test('Threat recommends report',lambda:assertion(pg.locator('[data-action=report]').get_attribute('aria-pressed')=='true','report recommendation'))
 pg.locator('[data-action=report]').click()
 test('Report is guidance only',lambda:assertion(pg.locator('#action-outcome').is_visible() and 'Wir melden nichts automatisch' in pg.locator('#action-outcome').inner_text(),'report'))
 test('No JS runtime errors',lambda:assertion(len(errors)==0,str(errors)))
 pg.screenshot(path='/mnt/data/animal-voices-v08/preview-desktop.png',full_page=True)
 ctx.close()
 mob,mp=page(390,844);mobile_errors=[];mp.on('pageerror',lambda e:mobile_errors.append(str(e)))
 mount(mp,share_text='https://www.instagram.com/reel/xyz/?utm_source=spamsomething')
 test('Android share link-only does not create comment',lambda:assertion(mp.locator('#comment').input_value()=='' and mp.locator('#share-banner').is_visible(),'link only'))
 test('GET share query removed from history',lambda:assertion(mp.evaluate('window.__replaceCalled===true'),'privacy query removal'))
 test('Source link canonicalized',lambda:assertion(mp.locator('#source-url').input_value()=='https://www.instagram.com/reel/xyz/','canonical link'))
 test('Mobile no horizontal overflow',lambda:assertion(mp.evaluate('document.documentElement.scrollWidth<=innerWidth'),'mobile overflow '+str(mp.evaluate('document.documentElement.scrollWidth'))))
 mp.screenshot(path='/mnt/data/animal-voices-v08/preview-mobile.png',full_page=True)
 test('Mobile JS no errors',lambda:assertion(not mobile_errors,str(mobile_errors)))
 mob.close()
 txtctx,txtpg=page(390,844)
 mount(txtpg,share_text='Kann man ohne Fleisch wirklich Muskeln aufbauen? https://www.instagram.com/p/abc')
 test('Share text preview requires confirmation',lambda:assertion(txtpg.locator('#use-shared-text').is_visible() and txtpg.locator('#comment').input_value()=='','manual confirm'))
 txtpg.locator('#use-shared-text').click()
 test('Share text copied only on explicit click',lambda:assertion('Kann man ohne Fleisch' in txtpg.locator('#comment').input_value(),'share confirm'))
 txtctx.close()
 browser.close()
for line in logs:print(*line)
if any(x[0]=='FAIL' for x in logs):raise SystemExit(1)
print('All',len(logs),'browser checks passed')
