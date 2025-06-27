import { currentHealth } from '../game/state.js';
import { INITIAL_HEALTH } from '../game/constants.js';
import { healthBarInner, healthValueDisplay } from './domElements.js';

export function updateHealthDisplay() {
    const healthPercentage = (currentHealth / INITIAL_HEALTH) * 100;
    healthBarInner.style.width = `${healthPercentage}%`;
    healthValueDisplay.textContent = `${currentHealth}/${INITIAL_HEALTH}`;

    if (healthPercentage > 50) {
        healthBarInner.style.backgroundColor = '#00ff00';
    } else if (healthPercentage > 20) {
        healthBarInner.style.backgroundColor = '#ffff00';
    } else {
        healthBarInner.style.backgroundColor = '#ff0000';
    }
}