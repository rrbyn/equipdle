import { timerInterval, dailyGameCompleted, setTimerInterval } from './state.js';
import { initializeGame } from './gameInitialization.js';
import { dailyGameTimerDiv } from '../ui/domElements.js';
import { GameType } from './constants.js';

export function startDailyTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
    }

    function updateTimer() {
        const now = new Date(new Date().toLocaleString("en-US", {timeZone: "UTC"}))
        const midnight = new Date(now);
        midnight.setHours(24, 0, 0, 0);

        const timeLeft = midnight.getTime() - now.getTime();

        if (timeLeft < 0) {
            // It's past midnight, reset the game for the new day
            clearInterval(timerInterval);
            initializeGame(GameType.DAILY); // Re-initialize for the new day
            dailyGameTimerDiv.textContent = 'New daily game available!';
            return;
        }

        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        dailyGameTimerDiv.textContent = `Next daily game in: ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    updateTimer();
    setTimerInterval(setInterval(updateTimer, 1000));
}