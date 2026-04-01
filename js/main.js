document.addEventListener('DOMContentLoaded', () => {
    // Tab switching
    const tabs = document.querySelectorAll('.search-box__tab');
    const panels = document.querySelectorAll('.search-box__panel');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('search-box__tab--active'));
            panels.forEach(p => p.classList.remove('search-box__panel--active'));
            tab.classList.add('search-box__tab--active');
            const panel = document.getElementById('panel-' + tab.dataset.tab);
            if (panel) panel.classList.add('search-box__panel--active');
        });
    });

    // Role search suggestions
    const roles = [
        'Teacher', 'Head of Department', 'Head of Year', 'SENCO',
        'Assistant Headteacher', 'Deputy Headteacher', 'Headteacher',
        'CEO / Executive Head', 'Pastoral Lead', 'Lead Practitioner',
        'Teaching Assistant', 'Higher Level Teaching Assistant (HLTA)',
        'Cover Supervisor', 'School Business Manager', 'IT Manager',
        'Librarian', 'Exams Officer', 'Data Manager',
        'Curriculum Lead', 'Phase Leader', 'Key Stage Coordinator',
        'Ofsted Inspector', 'Education Consultant', 'MAT Director',
        'Director of Teaching & Learning', 'Director of Sixth Form',
        'Safeguarding Lead', 'Attendance Officer'
    ];

    const searchInput = document.getElementById('roleSearch');
    const suggestionsEl = document.getElementById('searchSuggestions');

    if (searchInput && suggestionsEl) {
        searchInput.addEventListener('input', () => {
            const query = searchInput.value.toLowerCase().trim();
            if (query.length < 2) {
                suggestionsEl.classList.remove('search-box__suggestions--open');
                suggestionsEl.innerHTML = '';
                return;
            }

            const matches = roles.filter(r => r.toLowerCase().includes(query));
            if (matches.length === 0) {
                suggestionsEl.classList.remove('search-box__suggestions--open');
                suggestionsEl.innerHTML = '';
                return;
            }

            suggestionsEl.innerHTML = matches.map(m =>
                `<div class="search-box__suggestion">${m}</div>`
            ).join('');
            suggestionsEl.classList.add('search-box__suggestions--open');
        });

        suggestionsEl.addEventListener('click', (e) => {
            if (e.target.classList.contains('search-box__suggestion')) {
                searchInput.value = e.target.textContent;
                suggestionsEl.classList.remove('search-box__suggestions--open');
                suggestionsEl.innerHTML = '';
            }
        });

        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !suggestionsEl.contains(e.target)) {
                suggestionsEl.classList.remove('search-box__suggestions--open');
            }
        });
    }

    // Mobile menu
    const menuBtn = document.getElementById('menuBtn');
    const mobileNav = document.getElementById('mobileNav');
    const mobileNavOverlay = document.getElementById('mobileNavOverlay');
    const mobileNavClose = document.getElementById('mobileNavClose');

    function openMenu() {
        mobileNav.classList.add('mobile-nav--open');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        mobileNav.classList.remove('mobile-nav--open');
        document.body.style.overflow = '';
    }

    if (menuBtn) menuBtn.addEventListener('click', openMenu);
    if (mobileNavOverlay) mobileNavOverlay.addEventListener('click', closeMenu);
    if (mobileNavClose) mobileNavClose.addEventListener('click', closeMenu);

    const mobileLinks = document.querySelectorAll('.mobile-nav__link');
    mobileLinks.forEach(link => link.addEventListener('click', closeMenu));

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Header shadow on scroll
    const header = document.querySelector('.header');
    let lastScrollY = 0;

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        if (scrollY > 10) {
            header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
        } else {
            header.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
        }
        lastScrollY = scrollY;
    }, { passive: true });

    // Animate elements on scroll (intersection observer)
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animateElements = document.querySelectorAll(
        '.dest-card, .step, .story-card, .resource-card, .journey-card'
    );

    animateElements.forEach((el, i) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = `opacity 0.5s ease ${i * 0.05}s, transform 0.5s ease ${i * 0.05}s`;
        observer.observe(el);
    });
});
