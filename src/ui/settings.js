const SETTINGS_KEY = 'equipdle-settings';

const defaultSettings = {
    volume: 0.5,
    muted: false,
    screenFlashDisabled: false,
    animationsDisabled: false,
    disableNewGameWarning: false,
};

let currentSettings = undefined;

export function loadSettings() {
    try {
        const savedSettings = localStorage.getItem(SETTINGS_KEY);
        if (savedSettings) {
            currentSettings = { ...defaultSettings, ...JSON.parse(savedSettings) };
        } else {
            currentSettings = { ...defaultSettings };
        }
    } catch (error) {
        console.error('Error loading settings from localStorage:', error);
        currentSettings = { ...defaultSettings };
    }
}

function saveSettings() {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(currentSettings));
    } catch (error) {
        console.error('Error saving settings to localStorage:', error);
    }
}

export function getSetting(key) {
    if (currentSettings === undefined) {
        loadSettings();
    }
    return currentSettings[key];
}

export function updateSetting(key, value) {
    if (currentSettings === undefined) {
        loadSettings();
    }
    currentSettings[key] = value;
    saveSettings();
}

// Initialize settings on load
loadSettings();