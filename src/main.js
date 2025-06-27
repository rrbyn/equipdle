import { loadItems } from './game/itemLogic.js';
import { setupEventListeners } from './ui/eventListeners.js';
import { loadSettings } from './ui/settings.js';
import { setupSettingsModalListeners } from './ui/settingsModal.js';
import { initializeComparisonModal } from './ui/comparisonModal.js';
import { initializeNavigation } from './ui/navigation.js';
import { showWelcomeModal } from './ui/welcomeModal.js';

loadItems();
setupEventListeners();
setupSettingsModalListeners();
loadSettings();
initializeComparisonModal();
initializeNavigation();
showWelcomeModal();