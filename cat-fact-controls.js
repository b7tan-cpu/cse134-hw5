'use strict';

const factPanel = document.querySelector('cat-fact-panel');
const compactButton = document.querySelector('[data-cat-compact]');
const preferenceKey = 'hw5-cat-fact-panel-mode';

if (factPanel && compactButton && customElements.get('cat-fact-panel')) {
    function applyMode(compact) {
        // Restoring and clicking both use the observed attribute, so neither
        // path rebuilds the component or discards its currently selected fact.
        factPanel.toggleAttribute('compact', compact);
        compactButton.setAttribute('aria-pressed', String(compact));
        compactButton.textContent = compact ? 'Show more details' : 'Use compact view';
    }

    let compact = false;
    try {
        const savedMode = localStorage.getItem(preferenceKey);
        compact = savedMode === 'compact';
    } catch {
        // Expanded is also the default if storage is unavailable.
    }
    applyMode(compact);
    compactButton.hidden = false;

    compactButton.addEventListener('click', () => {
        const nextCompact = !factPanel.hasAttribute('compact');
        applyMode(nextCompact);
        try {
            localStorage.setItem(preferenceKey, nextCompact ? 'compact' : 'expanded');
        } catch {
            // The observed attribute has already applied the user's choice.
        }
    });
}
