import { itemGuessInput, guessInputContainer } from './domElements.js';
import { allItemsNameAndImage } from '../game/state.js';

let autocompleteDiv = null;
import { debounce } from '../utils/debounce.js';


export function createAutocompleteDropdown() {
    if (autocompleteDiv) {
        autocompleteDiv.remove();
    }
    autocompleteDiv = document.createElement('div');
    autocompleteDiv.id = 'autocomplete-dropdown';
    autocompleteDiv.style.width = itemGuessInput.offsetWidth + 'px'; 
    guessInputContainer.appendChild(autocompleteDiv);

    
    const inputRect = itemGuessInput.getBoundingClientRect();
    const containerRect = guessInputContainer.getBoundingClientRect();
    autocompleteDiv.style.top = (inputRect.bottom - containerRect.top) + 'px';
    autocompleteDiv.style.left = (inputRect.left - containerRect.left) + 'px';
}

export function updateAutocompleteSuggestions() {
    const inputText = itemGuessInput.value.toLowerCase();
    if (!inputText) {
        if (autocompleteDiv) autocompleteDiv.innerHTML = '';
        return;
    }

    if (!autocompleteDiv || !document.body.contains(autocompleteDiv)) {
        createAutocompleteDropdown();
    } else {
        autocompleteDiv.innerHTML = ''; 
    }

    const filteredItems = allItemsNameAndImage.filter(item =>
        item.name.toLowerCase().includes(inputText)
    );

    if (filteredItems.length === 0) {
        autocompleteDiv.innerHTML = '';
        return;
    }

    filteredItems.forEach(item => {
        const suggestionItem = document.createElement('div');
        suggestionItem.classList.add('autocomplete-item');

        const img = document.createElement('img');
        img.src = item.image_local_path;
        img.alt = item.name;
        img.classList.add('autocomplete-item-image');

        const text = document.createElement('span');
        text.textContent = item.name;

        suggestionItem.appendChild(img);
        suggestionItem.appendChild(text);

        suggestionItem.addEventListener('click', () => {
            itemGuessInput.value = item.name;
            if (autocompleteDiv) autocompleteDiv.innerHTML = '';
            autocompleteDiv.remove(); 
        });
        autocompleteDiv.appendChild(suggestionItem);
    });
}

export const debouncedUpdateAutocompleteSuggestions = debounce(updateAutocompleteSuggestions, 100);

export function setupAutocompleteCloseListener() {
    document.addEventListener('click', (event) => {
        if (autocompleteDiv && !itemGuessInput.contains(event.target) && !autocompleteDiv.contains(event.target)) {
            autocompleteDiv.remove();
            autocompleteDiv = null; 
        }
    });
}