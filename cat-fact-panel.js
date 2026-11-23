'use strict';

class CatFactPanel extends HTMLElement {
    static get observedAttributes() {
        return ['compact'];
    }

    connectedCallback() {
        if (this.heading) return;

        this.samples = [
            'Cats use their whiskers to sense nearby objects.',
            'Cats use their tails to help them balance.'
        ];
        this.sampleIndex = 0;
        this.requestCount = 0;

        // All interface nodes are created with DOM methods. Remote text never
        // enters an HTML parser.
        const make = (tag, text, className) => {
            const element = document.createElement(tag);
            if (text) element.textContent = text;
            if (className) element.className = className;
            return element;
        };

        this.heading = make('h3', 'A little curiosity, one fact at a time');
        this.description = make('p', 'Take a short study break. Browse two local examples, or ask Cat Facts for a live fact.', 'cat-fact-details');
        this.content = make('blockquote', this.samples[0], 'cat-fact-content');
        this.source = make('p', 'Local sample 1 of 2 · No network request yet.', 'cat-fact-source');
        this.loadButton = make('button', 'Get a live cat fact');
        this.loadButton.type = 'button';
        this.sampleButton = make('button', 'Next local sample');
        this.sampleButton.type = 'button';
        const controls = make('div', '', 'cat-fact-actions');
        controls.appendChild(this.loadButton);
        controls.appendChild(this.sampleButton);
        this.status = make('p', 'Ready. Showing a local sample.', 'cat-fact-status');
        this.status.setAttribute('role', 'status');
        this.status.setAttribute('aria-atomic', 'true');
        this.status.setAttribute('aria-live', 'polite');

        // The original fallback remains if this script cannot load.
        this.replaceChildren();
        [this.heading, this.description, this.content, this.source, controls, this.status]
            .forEach((element) => this.appendChild(element));

        this.sampleButton.addEventListener('click', () => {
            this.sampleIndex = (this.sampleIndex + 1) % this.samples.length;
            this.content.textContent = this.samples[this.sampleIndex];
            this.source.textContent = `Local sample ${this.sampleIndex + 1} of ${this.samples.length} · Not live API data.`;
            this.status.textContent = `Sample ${this.sampleIndex + 1} of ${this.samples.length}.`;
            this.loadButton.textContent = 'Get a live cat fact';
        });
        this.loadButton.addEventListener('click', () => this.loadFact());
        this.updateMode();
    }

    attributeChangedCallback() {
        this.updateMode();
    }

    updateMode() {
        if (!this.description) return;
        this.description.hidden = this.hasAttribute('compact');
        this.source.hidden = this.hasAttribute('compact');
    }

    disconnectedCallback() {
        this.controller?.abort();
    }

    async loadFact() {
        if (this.controller) return;
        const controller = new AbortController();
        this.controller = controller;
        const timeout = window.setTimeout(() => controller.abort(), 12000);
        this.loadButton.disabled = true;
        this.sampleButton.disabled = true;
        this.content.setAttribute('aria-busy', 'true');
        this.status.textContent = 'Loading a live cat fact… Your current fact stays here while you wait.';

        try {
            const response = await fetch('https://catfact.ninja/fact', {
                headers: { Accept: 'application/json' },
                cache: 'no-store',
                signal: controller.signal
            });
            if (!response.ok) throw new Error(`HTTP status ${response.status}`);
            const data = await response.json();
            if (typeof data?.fact !== 'string' || !data.fact.trim() || data.fact.length > 5000) {
                throw new Error('Expected a nonempty fact of at most 5000 characters.');
            }
            if (!this.isConnected) return;
            this.content.textContent = data.fact.trim();
            this.source.textContent = 'Live data from Cat Facts · catfact.ninja';
            this.requestCount += 1;
            this.status.textContent = `Live fact loaded. Successful requests: ${this.requestCount}.`;
            this.loadButton.textContent = 'Get another live fact';
        } catch (error) {
            if (!this.isConnected) return;
            this.status.textContent = error.name === 'AbortError'
                ? 'The request timed out. Your previous fact is still shown. Try again.'
                : 'Could not load a live fact. Your previous fact is still shown. Check your connection and try again.';
            this.loadButton.textContent = 'Try live fact again';
        } finally {
            window.clearTimeout(timeout);
            this.controller = null;
            this.loadButton.disabled = false;
            this.sampleButton.disabled = false;
            this.content.removeAttribute('aria-busy');
        }
    }
}

customElements.define('cat-fact-panel', CatFactPanel);
