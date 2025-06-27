const pages = {
    game: document.getElementById('game-page'),
    'how-to-play': document.getElementById('how-to-play-page'),
    blog: document.getElementById('blog-page'),
    about: document.getElementById('about-page'),
};

const navLinks = document.querySelectorAll('.nav-link');
const navToggle = document.querySelector('.nav-toggle');
const mainNav = document.querySelector('.main-nav');
const mainHeader = document.querySelector('.main-header');

function showPage(pageId) {
    for (const id in pages) {
        if (pages[id]) {
            pages[id].style.display = 'none';
        }
    }
    
    if (pages[pageId]) {
        pages[pageId].style.display = 'block';
    }

    
    navLinks.forEach(link => {
        if (link.dataset.page === pageId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    
    if (mainNav.classList.contains('open')) {
        mainNav.classList.remove('open');
        navToggle.classList.remove('open');
    }
}

function handleNavigation(event) {
    event.preventDefault();
    const pageId = event.currentTarget.dataset.page;
    if (pageId) {
        const path = pageId === 'game' ? '/' : `/${pageId}`;
        history.pushState({ page: pageId }, '', path);
        showPage(pageId);
    }
}

function toggleMobileNav() {
    mainNav.classList.toggle('open');
    navToggle.classList.toggle('open');
}

let lastScrollTop = 0;
function handleScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollTop > lastScrollTop && scrollTop > mainHeader.offsetHeight) {
        mainHeader.classList.add('hide');
    } else {
        mainHeader.classList.remove('hide');
    }
    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; 
}

export function initializeNavigation() {
    navLinks.forEach(link => {
        link.addEventListener('click', handleNavigation);
    });

    navToggle.addEventListener('click', toggleMobileNav);
    window.addEventListener('scroll', handleScroll);
    
    window.addEventListener('popstate', (event) => {
        if (event.state && event.state.page) {
            showPage(event.state.page);
        } else {
            
            showPage('game');
        }
    });
    
    const path = window.location.pathname;
    let initialPage = 'game';
    if (path === '/how-to-play') initialPage = 'how-to-play';
    if (path === '/blog') initialPage = 'blog';
    if (path === '/about') initialPage = 'about';
    
    showPage(initialPage);
}