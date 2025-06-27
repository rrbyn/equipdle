import { comparisonModal, closeComparisonModalButton, comparisonModalBody } from './domElements.js';
import { prepareComparisonViewModel } from './comparisonViewModel.js';
import { renderComparisonModal } from './comparisonModalRenderer.js';

export function initializeComparisonModal() {
    closeComparisonModalButton.classList.add('close-button');
    closeComparisonModalButton.addEventListener('click', () => {
        comparisonModal.style.display = 'none';
    });
}

export function showComparisonModal(possibleRanges) {
    const viewModel = prepareComparisonViewModel(possibleRanges);
    const modalBodyHtml = renderComparisonModal(viewModel);
    comparisonModalBody.innerHTML = modalBodyHtml;
    comparisonModal.style.display = 'block';
}