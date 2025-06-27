import { historyList, historyModal, closeModalButton, viewHistoryButton } from './domElements.js';
import { getDailyGameHistory } from '../utils/localStorage.js';

export function displayHistory() {
    historyList.innerHTML = '';
    const dailyGameHistory = getDailyGameHistory();
    if (dailyGameHistory.length === 0) {
        const noHistoryItem = document.createElement('li');
        noHistoryItem.textContent = 'No daily game history yet.';
        historyList.appendChild(noHistoryItem);
        return;
    }

    dailyGameHistory.sort((a, b) => new Date(b.date) - new Date(a.date));

    dailyGameHistory.forEach(entry => {
        const listItem = document.createElement('li');

        const itemImage = document.createElement('img');
        itemImage.src = entry.itemImage;
        itemImage.alt = entry.itemTitle;
        itemImage.classList.add('history-item-image');

        const itemDetails = document.createElement('div');
        itemDetails.classList.add('history-item-details');
        itemDetails.innerHTML = `
            <strong>Date:</strong> ${entry.date}<br>
            <strong>Item:</strong> ${entry.itemTitle}<br>
            <strong>Guesses:</strong> ${entry.guessesMade}
        `;

        const gameResult = document.createElement('div');
        gameResult.classList.add('history-item-result', entry.won ? 'won' : 'lost');
        gameResult.textContent = entry.won ? 'Won' : 'Lost';

        listItem.appendChild(itemImage);
        listItem.appendChild(itemDetails);
        listItem.appendChild(gameResult);

        historyList.appendChild(listItem);
    });
}

export function setupHistoryModalListeners() {
    viewHistoryButton.addEventListener('click', () => {
        displayHistory();
        historyModal.style.display = 'block';
    });

    closeModalButton.addEventListener('click', () => {
        historyModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === historyModal) {
            historyModal.style.display = 'none';
        }
    });
}