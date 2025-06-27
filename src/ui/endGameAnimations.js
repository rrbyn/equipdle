import { getSetting } from './settings.js';

const BONES_IMAGE_PATH = 'item_images/Bones.png';
const PARTYHAT_IMAGE_PATHS = [
    'item_images/blue_partyhat.png',
    'item_images/red_partyhat.png',
    'item_images/purple_partyhat.png',
    'item_images/yellow_partyhat.png',
    'item_images/green_partyhat.png'
];

const PARTICLE_COUNT = 100;
const GRAVITY = 0.5;
const TERMINAL_VELOCITY = 10;
const DRAG = 0.99;
const MAX_ANIMATION_DURATION = 2500;

function createParticle(imagePath) {
    const particle = document.createElement('img');
    particle.src = imagePath;
    particle.style.position = 'absolute';
    particle.style.width = '36px';
    particle.style.height = '36px';
    particle.style.pointerEvents = 'none';
    document.body.appendChild(particle);
    return particle;
}

function animateParticles(particles) {
    return new Promise(resolve => {
        let frame;
        const fps = 60;
        const frameInterval = 1000 / fps;
        let lastTime;
        let startTime;

        function animationLoop(currentTime) {
            if (startTime === undefined) {
                startTime = currentTime;
            }
            if (lastTime === undefined) {
                lastTime = currentTime;
            }

            const totalElapsedTime = currentTime - startTime;
            if (totalElapsedTime > MAX_ANIMATION_DURATION) {
                particles.forEach(p => p.element.remove());
                cancelAnimationFrame(frame);
                resolve();
                return;
            }

            const elapsedTime = currentTime - lastTime;

            if (elapsedTime > frameInterval) {
                lastTime = currentTime - (elapsedTime % frameInterval);

                const allParticlesOffScreen = particles.every(p => (p.y > window.innerHeight || p.x > window.innerWidth));
                if (allParticlesOffScreen) {
                    particles.forEach(p => p.element.remove());
                    cancelAnimationFrame(frame);
                    resolve();
                    return;
                }
                
                if(particles.length < PARTICLE_COUNT*0.1) {
                    particles.forEach(p => p.element.remove());
                    cancelAnimationFrame(frame);
                    resolve();
                    return;
                }

                particles.forEach(p => {
                    if (p.y > window.innerHeight || p.x > window.innerWidth) return;

                    p.vy += GRAVITY;
                    p.vy = Math.min(p.vy, TERMINAL_VELOCITY);
                    p.vx *= DRAG;

                    p.x += p.vx;
                    p.y += p.vy;

                    p.element.style.left = `${p.x}px`;
                    p.element.style.top = `${p.y}px`;
                    p.element.style.transform = `rotate(${p.rotation}deg)`;
                    p.rotation += p.rotationSpeed;
                });
            }

            frame = requestAnimationFrame(animationLoop);
        }

        frame = requestAnimationFrame(animationLoop);
    });
}

function createExplosion(imagePaths, originX, originY) {
    const particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const imagePath = imagePaths[Math.floor(Math.random() * imagePaths.length)];
        if (!imagePath) continue;

        const element = createParticle(imagePath);
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 15 + 5;

        particles.push({
            element,
            x: originX,
            y: originY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 15,
            rotation: Math.random() * 360,
            rotationSpeed: Math.random() * 10 - 5,
        });
    }
    return animateParticles(particles);
}

export function playWinAnimation() {
    if (getSetting('animationsDisabled')) {
        return Promise.resolve();
    }
    if (PARTYHAT_IMAGE_PATHS.length === 0) {
        console.warn('Party hat images not found. Skipping win animation.');
        return Promise.resolve();
    }
    const originX = window.innerWidth / 2;
    const originY = window.innerHeight / 2;
    return createExplosion(PARTYHAT_IMAGE_PATHS, originX, originY);
}

export function playLossAnimation() {
    if (getSetting('animationsDisabled')) {
        return Promise.resolve();
    }
    const originX = window.innerWidth / 2;
    const originY = window.innerHeight / 2;
    return createExplosion([BONES_IMAGE_PATH], originX, originY);
}