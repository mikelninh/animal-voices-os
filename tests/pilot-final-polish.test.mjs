import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = name => readFileSync(new URL('../' + name, import.meta.url), 'utf8');
const html = read('try.html');
const js = read('try.js');
const css = read('try.css');

test('community pilot: JavaScript is syntactically valid', () => {
  assert.doesNotThrow(() => new Function(js));
});

test('community pilot: all referenced element IDs exist', () => {
  const ids = [...js.matchAll(/\$\('([^']+)'\)/g)].map(match => match[1]);
  for (const id of new Set(ids)) {
    assert.match(html, new RegExp('id="' + id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '"'));
  }
});

test('community pilot: clear, honest editorial guidance for own comments', () => {
  assert.match(html, /vorbereiteten, redaktionellen Antworten/);
  assert.match(html, /hier antwortet keine KI frei auf neue Themen/);
  assert.match(html, /nicht automatisch/i);
});

test('community pilot: direct feedback does not require feed preview', () => {
  assert.match(html, /id="open-feedback"/);
  assert.match(js, /\$\('open-feedback'\)\.addEventListener\('click',\(\)=>showFeedback\(false\)\)/);
  assert.match(js, /showFeedback\(false,false\)/);
  assert.match(js, /DIRECT_FEEDBACK/);
});

test('community pilot: changed draft revokes stale feedback and copy status', () => {
  assert.match(js, /state\.vote=null;state\.reason=null;/);
  assert.match(js, /\$\('share-feedback'\)\.disabled=true;\$\('copy-feedback'\)\.disabled=true/);
  assert.match(js, /VOICE_RESETS_FEEDBACK/);
  assert.match(html, /id="copy-status"/);
  assert.match(js, /setStatus\('copy-status','✓ Kopiert!/);
});

test('community pilot: accessible buttons and reduced-motion experience', () => {
  for (const id of ['copy-reply', 'preview', 'open-feedback', 'skip-to-feedback']) {
    assert.match(html, new RegExp('<button[^>]+id="' + id + '"'));
  }
  assert.match(css, /\.feedback-shortcut:focus-visible/);
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.match(html, /aria-live="polite"/);
});
