const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { JSDOM } = require('jsdom');
const root = resolve(__dirname, '..');
const source = name => readFileSync(resolve(root, name), 'utf8');

function setup({ saved, readFails = false, writeFails = false } = {}) {
    const dom = new JSDOM(source('projects.html'), {
        url: 'http://localhost:8080/projects.html', runScripts: 'outside-only'
    });
    const { window } = dom;
    const values = new Map(saved === undefined ? [] : [['hw5-cat-fact-panel-mode', saved]]);
    Object.defineProperty(window, 'localStorage', { value: {
        getItem(key) { if (readFails) throw new Error('Blocked read'); return values.get(key) ?? null; },
        setItem(key, value) { if (writeFails) throw new Error('Blocked write'); values.set(key, value); }
    } });
    window.eval(source('cat-fact-panel.js'));
    window.eval(source('cat-fact-controls.js'));
    return { dom, window, values, panel: window.document.querySelector('cat-fact-panel'),
        button: window.document.querySelector('[data-cat-compact]') };
}

test('sample control and external attribute toggle preserve the chosen content', t => {
    const { dom, panel, button, values } = setup(); t.after(() => dom.window.close());
    const first = panel.content.textContent;
    panel.sampleButton.click();
    assert.notEqual(panel.content.textContent, first);
    assert.match(panel.status.textContent, /Sample 2 of 2/);
    const selected = panel.content.textContent;
    button.click();
    assert.equal(panel.description.hidden, true);
    assert.equal(button.getAttribute('aria-pressed'), 'true');
    assert.equal(values.get('hw5-cat-fact-panel-mode'), 'compact');
    button.click();
    assert.equal(panel.description.hidden, false);
    assert.equal(panel.content.textContent, selected);
    assert.equal(values.get('hw5-cat-fact-panel-mode'), 'expanded');
});

test('loading, safe live text, success and attribute controls work together', async t => {
    const { dom, window, panel, button } = setup(); t.after(() => dom.window.close());
    let resolveRequest;
    window.fetch = (url, options) => {
        assert.equal(url, 'https://catfact.ninja/fact');
        assert.equal(options.headers.Accept, 'application/json');
        return new Promise(resolve => { resolveRequest = resolve; });
    };
    const previous = panel.content.textContent;
    const request = panel.loadFact();
    assert.equal(panel.loadButton.disabled, true);
    assert.match(panel.status.textContent, /Loading/);
    assert.equal(panel.content.textContent, previous);
    button.click();
    const text = '<img src=x onerror="alert(1)"> Cats are curious.';
    resolveRequest({ ok: true, json: async () => ({ fact: text }) });
    await request;
    assert.equal(panel.content.textContent, text);
    assert.equal(panel.content.children.length, 0);
    assert.equal(panel.loadButton.disabled, false);
    assert.match(panel.status.textContent, /Live fact loaded/);
    assert.equal(panel.description.hidden, true);
    button.click();
    assert.equal(panel.content.textContent, text);
    assert.equal(panel.description.hidden, false);
});

test('HTTP, parsing, field and network failures retain content and allow recovery', async t => {
    const { dom, window, panel } = setup(); t.after(() => dom.window.close());
    const previous = panel.content.textContent;
    const failures = [
        async () => ({ ok: false, status: 503 }),
        async () => ({ ok: true, json: async () => { throw new SyntaxError('Bad JSON'); } }),
        ...[null, {}, { fact: 123 }, { fact: ' ' }, { fact: 'x'.repeat(5001) }]
            .map(value => async () => ({ ok: true, json: async () => value })),
        async () => { throw new TypeError('Offline'); }
    ];
    for (const fail of failures) {
        window.fetch = fail;
        await panel.loadFact();
        assert.match(panel.status.textContent, /Could not load/);
        assert.equal(panel.content.textContent, previous);
        assert.equal(panel.loadButton.disabled, false);
        assert.equal(panel.sampleButton.disabled, false);
    }
    window.fetch = async () => ({ ok: true, json: async () => ({ fact: 'Recovered live fact.' }) });
    panel.loadButton.click();
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(panel.content.textContent, 'Recovered live fact.');
    assert.match(panel.status.textContent, /Live fact loaded/);
});

test('timeout restores controls and a subsequent request succeeds', async t => {
    const { dom, window, panel } = setup(); t.after(() => dom.window.close());
    let fireTimeout;
    window.setTimeout = callback => { fireTimeout = callback; return 1; };
    window.fetch = (url, { signal }) => new Promise((resolve, reject) => {
        signal.addEventListener('abort', () => reject(new window.DOMException('Aborted', 'AbortError')));
    });
    const request = panel.loadFact();
    fireTimeout();
    await request;
    assert.match(panel.status.textContent, /timed out/);
    assert.equal(panel.loadButton.disabled, false);
    window.fetch = async () => ({ ok: true, json: async () => ({ fact: 'Recovered after timeout.' }) });
    await panel.loadFact();
    assert.equal(panel.content.textContent, 'Recovered after timeout.');
});

test('valid saved modes restore; invalid values and read failures use expanded', t => {
    for (const options of [{ saved: 'compact' }, { saved: 'expanded' }, { saved: 'invalid' }, {}, { readFails: true }]) {
        const { dom, panel, button } = setup(options); t.after(() => dom.window.close());
        const compact = options.saved === 'compact';
        assert.equal(panel.hasAttribute('compact'), compact);
        assert.equal(panel.description.hidden, compact);
        assert.equal(button.getAttribute('aria-pressed'), String(compact));
    }
});

test('write failure still applies the preference on the current page', t => {
    const { dom, panel, button } = setup({ writeFails: true }); t.after(() => dom.window.close());
    button.click();
    assert.equal(panel.hasAttribute('compact'), true);
    assert.equal(panel.description.hidden, true);
    button.click();
    assert.equal(panel.description.hidden, false);
});

test('without JavaScript the page retains navigation, content and widget fallback', t => {
    const dom = new JSDOM(source('projects.html')); t.after(() => dom.window.close());
    const doc = dom.window.document;
    assert.ok(doc.querySelector('nav a[href="index.html"]'));
    assert.ok(doc.querySelector('#study-compass h2'));
    assert.match(doc.querySelector('cat-fact-panel').textContent, /when JavaScript is available/);
    assert.match(doc.querySelector('noscript').textContent, /Enable JavaScript/);
    assert.equal(doc.querySelector('[data-cat-compact]').hidden, true);
});
