import { getSetting, updateSetting } from './settings.js';

const modal = document.getElementById('new-game-warning-modal');
const proceedButton = document.getElementById('new-game-warning-proceed-button');
const cancelButton = document.getElementById('new-game-warning-cancel-button');
const closeButton = document.getElementById('new-game-warning-close-button');
const checkbox = document.getElementById('dont-show-again-checkbox');

let proceedCallback = null;

function showNewGameWarning(callback) {
    if (getSetting('disableNewGameWarning') === false) {
        checkbox.checked = false;
        modal.style.display = 'block';
        proceedCallback = callback;
    } else {
        callback();
    }
}

function hideModal() {
    modal.style.display = 'none';
}

proceedButton.addEventListener('click', () => {
    hideModal();
    if (proceedCallback) {
        proceedCallback();
        proceedCallback = null;
    }
});

checkbox.addEventListener('click', () => {
    updateSetting('disableNewGameWarning', checkbox.checked);
})
cancelButton.addEventListener('click', hideModal);
closeButton.addEventListener('click', hideModal);

export { showNewGameWarning };