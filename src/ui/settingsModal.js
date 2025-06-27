import { getSetting, updateSetting } from './settings.js';

const settingsModal = document.getElementById('settings-modal');
const closeButton = document.getElementById('close-settings-modal');
const volumeSliderContainer = document.getElementById('volume-slider-container');
const volumeSelector = document.getElementById('volume-selector');
const muteButton = document.getElementById('mute-button');
const screenFlashToggle = document.getElementById('screen-flash-toggle');
const animationsToggle = document.getElementById('animations-toggle');
const newGameWarningToggle = document.getElementById('new-game-warning-toggle');
const volumeIconMuted = muteButton.querySelector('.volume-icon-muted');

let listenersAttached = false;

function updateVolumeSelectorPosition(volume) {
    const maxVolume = 0.7; // Corresponds to volumeSlider.max
    const normalizedVolume = Math.min(Math.max(volume / maxVolume, 0), 1);

    const containerWidth = volumeSliderContainer.offsetWidth;
    const selectorWidth = volumeSelector.offsetWidth;
    
    // 10px from left for 0% and 10px from right for 100%
    const travelRange = containerWidth - selectorWidth - 20;
    const newLeft = 10 + (normalizedVolume * travelRange);

    volumeSelector.style.left = `${newLeft}px`;
}

function updateMuteButtonState(muted) {
    if (muted) {
        muteButton.classList.add('muted');
    } else {
        muteButton.classList.remove('muted');
    }
}

export function setupSettingsModalListeners() {
    if (listenersAttached) {
        return;
    }

    closeButton.addEventListener('click', () => {
        settingsModal.style.display = 'none';
    });

    function handleVolumeDrag(e) {
        const rect = volumeSliderContainer.getBoundingClientRect();
        const containerWidth = volumeSliderContainer.offsetWidth;
        const selectorWidth = volumeSelector.offsetWidth;
        const travelRange = containerWidth - selectorWidth - 20;

        let newLeft = e.clientX - rect.left - (selectorWidth / 2);
        newLeft = Math.max(10, Math.min(newLeft, 10 + travelRange));
        
        const normalizedVolume = (newLeft - 10) / travelRange;
        const maxVolume = 0.7;
        let volume = normalizedVolume * maxVolume;

        if (volume < 0.01) {
            volume = 0;
        }

        updateSetting('volume', volume);
        const isMuted = volume === 0;
        updateSetting('muted', isMuted);
        updateMuteButtonState(isMuted);

        updateVolumeSelectorPosition(volume);
    }

    function stopVolumeDrag() {
        document.removeEventListener('mousemove', handleVolumeDrag);
        document.removeEventListener('mouseup', stopVolumeDrag);
    }

    volumeSliderContainer.addEventListener('mousedown', (e) => {
        e.preventDefault();
        handleVolumeDrag(e);
        document.addEventListener('mousemove', handleVolumeDrag);
        document.addEventListener('mouseup', stopVolumeDrag);
    });

    muteButton.addEventListener('click', () => {
        const currentVolume = getSetting('volume');
        
        if (currentVolume > 0) {
            updateSetting('volume', 0);
            updateSetting('muted', true);
            updateMuteButtonState(true);
            updateVolumeSelectorPosition(0);
        } else {
            const defaultVolume = 0.5;
            updateSetting('volume', defaultVolume);
            updateSetting('muted', false);
            updateMuteButtonState(false);
            updateVolumeSelectorPosition(defaultVolume);
        }
    });

    screenFlashToggle.addEventListener('change', (e) => {
        updateSetting('screenFlashDisabled', e.target.checked);
    });

    animationsToggle.addEventListener('change', (e) => {
        updateSetting('animationsDisabled', e.target.checked);
    });

    newGameWarningToggle.addEventListener('change', (e) => {
        updateSetting('disableNewGameWarning', e.target.checked);
    });

    const initialMuted = getSetting('muted');
    updateMuteButtonState(initialMuted);

    screenFlashToggle.checked = getSetting('screenFlashDisabled');
    animationsToggle.checked = getSetting('animationsDisabled');
    newGameWarningToggle.checked = getSetting('disableNewGameWarning');
    
    listenersAttached = true;
}

export function showSettingsModal() {
    settingsModal.style.display = 'block';
    const volume = getSetting('volume');
    const muted = getSetting('muted');
    updateVolumeSelectorPosition(muted ? 0 : volume);
    updateMuteButtonState(muted);
    screenFlashToggle.checked = getSetting('screenFlashDisabled');
    animationsToggle.checked = getSetting('animationsDisabled');
    newGameWarningToggle.checked = getSetting('disableNewGameWarning');
}