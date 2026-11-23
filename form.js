'use strict';

const form = document.querySelector('.contact-form');
const fields = [
    { control: form.elements.namedItem('name'), label: 'Name' },
    { control: form.elements.namedItem('email'), label: 'Email' },
    { control: form.elements.namedItem('comments'), label: 'Comments' },
];
const form_errors = [];
const historyField = form.elements.namedItem('form-errors');
const comments = form.elements.namedItem('comments');
const feedback = document.querySelector('#form-feedback');
const counter = document.querySelector('#comments-count');
const warningThreshold = 100;

function validationMessage(field) {
    const { control, label } = field;
    control.setCustomValidity('');

    if (control.validity.valueMissing) {
        return label === 'Comments' ? 'Enter a message.' : `Enter your ${control.name}.`;
    }
    if (control.validity.typeMismatch) {
        return 'Enter an email address in the format student@example.com.';
    }
    if (control.validity.tooShort) {
        return `Enter at least ${control.minLength} characters.`;
    }
    return control.validationMessage;
}

function showValidation(field) {
    const { control, label } = field;
    const message = validationMessage(field);
    control.setCustomValidity(message);

    const error = document.querySelector(`#${control.id}-error`);
    const text = message ? `${label}: ${message}` : '';
    if (error.textContent !== text) {
        error.textContent = text;
        error.hidden = !message;
    }
    if (message) {
        control.setAttribute('aria-invalid', 'true');
    } else {
        control.removeAttribute('aria-invalid');
    }
    return message;
}

function updateCounter() {
    const remaining = comments.maxLength - comments.value.length;
    counter.classList.toggle('near-limit', remaining <= warningThreshold);
    if (remaining === 0) {
        counter.textContent = 'Character limit reached. 0 characters remaining.';
    } else if (remaining === 1) {
        counter.textContent = 'Approaching the limit. 1 character remaining.';
    } else if (remaining <= warningThreshold) {
        counter.textContent = `Approaching the limit. ${remaining} characters remaining.`;
    } else {
        counter.textContent = `${remaining.toLocaleString('en-US')} characters remaining.`;
    }
}

for (const field of fields) {
    const { control } = field;
    let edited = false;
    let feedbackEnabled = false;

    control.addEventListener('input', () => {
        edited = true;
        if (feedbackEnabled) {
            showValidation(field);
        }
    });

    control.addEventListener('blur', () => {
        if (edited) {
            feedbackEnabled = true;
            showValidation(field);
        }
    });

    // Native submission checks each invalid control once. Editing only reads
    // validity, so editing and blur never add entries to the history.
    control.addEventListener('invalid', () => {
        feedbackEnabled = true;
        const message = showValidation(field);
        if (message) {
            form_errors.push({ field: control.name, message });
        }
    });
}

form.addEventListener('submit', () => {
    historyField.value = JSON.stringify(form_errors);
});

comments.addEventListener('input', updateCounter);
window.addEventListener('pageshow', updateCounter);
updateCounter();
historyField.disabled = false;
feedback.hidden = false;
counter.hidden = false;
