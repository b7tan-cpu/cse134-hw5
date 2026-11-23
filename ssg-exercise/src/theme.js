'use strict';

const themeButton = document.querySelector('[data-theme-toggle]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    if (themeButton) {
        themeButton.textContent = theme === 'dark'
            ? 'Switch to light theme'
            : 'Switch to dark theme';
    }
}

function restoreTheme() {
    let theme = 'light';
    try {
        if (localStorage.getItem('portfolio-theme') === 'dark') {
            theme = 'dark';
        }
    } catch {
        // Apply the default theme even when reading storage fails.
    }
    applyTheme(theme);
}

restoreTheme();
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        restoreTheme();
    }
});
window.addEventListener('storage', (event) => {
    if (event.key === 'portfolio-theme' || event.key === null) {
        restoreTheme();
    }
});

if (themeButton) {
    themeButton.addEventListener('click', () => {
        const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
        const updateTheme = () => {
            applyTheme(theme);
            try {
                localStorage.setItem('portfolio-theme', theme);
            } catch {
                // The current page can still use the selected theme.
            }
        };

        if (typeof document.startViewTransition === 'function' && !reducedMotion.matches) {
            document.startViewTransition(updateTheme);
        } else {
            updateTheme();
        }
    });
    themeButton.hidden = false;
}
