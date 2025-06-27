import { updateSetting } from './settings.js';

const welcomeModal = document.getElementById('welcome-modal');
const closeButton = document.getElementById('welcome-modal-close-button');
const getStartedButton = document.getElementById('welcome-modal-get-started-button');
const epilepsyModeToggle = document.getElementById('epilepsy-mode-toggle');

function showWelcomeModal() {
    const hasVisited = localStorage.getItem('hasVisited');
    if (!hasVisited) {
        welcomeModal.style.display = 'block';
    }
}

function closeWelcomeModal() {
    welcomeModal.style.display = 'none';
    localStorage.setItem('hasVisited', 'true');
}

closeButton.addEventListener('click', closeWelcomeModal);
getStartedButton.addEventListener('click', closeWelcomeModal)

epilepsyModeToggle.addEventListener('change', (e) => {
    const isChecked = e.target.checked;
    updateSetting('screenFlashDisabled', isChecked);
    updateSetting('animationsDisabled', isChecked);
});

export { showWelcomeModal };