import { getSetting } from './settings.js';

const sounds = {
    win: new Audio('audio/victory.ogg'),
    loss: new Audio('audio/death.ogg'),
    damage: new Audio('audio/damage.ogg')
};

function playSound(sound) {
    if (getSetting('muted')) {
        return;
    }
    sound.volume = getSetting('volume');
    sound.currentTime = 0;
    sound.play();
}

export function playWinSound() {
    playSound(sounds.win);
}

export function playLossSound() {
    playSound(sounds.loss);
}

export function playDamageSound() {
    playSound(sounds.damage);
}