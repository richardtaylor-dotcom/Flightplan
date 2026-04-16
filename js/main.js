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

    // Hero departure → wizard
    const startBtn = document.getElementById('startWizardBtn');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            const from = document.getElementById('heroDeparture').value;
            const params = new URLSearchParams();
            if (from) params.set('from', from);
            window.location.href = 'wizard.html' + (params.toString() ? '?' + params.toString() : '');
        });
    }

    // Role search suggestions with links to destination pages
    var basePath = window.location.pathname.includes('/destinations/') ? '' : 'destinations/';
    if (basePath === '' && !window.location.pathname.includes('/destinations/')) basePath = 'destinations/';

    const roles = [
        { name: 'Academies Director', slug: 'academies-director' },
        { name: 'Principal', slug: 'principal' },
        { name: 'Deputy Principal', slug: 'deputy-principal' },
        { name: 'Vice Principal', slug: 'vice-principal' },
        { name: 'Curriculum Advisor', slug: 'curriculum-advisor' },
        { name: 'Assistant Principal', slug: 'assistant-principal' },
        { name: 'SENCO', slug: 'senco' },
        { name: 'Director of Learning', slug: 'director-of-learning' },
        { name: 'Head of Learning', slug: 'head-of-learning' },
        { name: 'Phase Leader', slug: 'phase-leader' },
        { name: 'Deputy Director of Learning', slug: 'deputy-director-of-learning' },
        { name: 'Coordinator of Learning', slug: 'coordinator-of-learning' },
        { name: 'Second in Charge', slug: 'second-in-charge' },
        { name: 'Lead Practitioner', slug: 'lead-practitioner' },
        { name: 'Teacher of Subject', slug: 'teacher-of-subject' },
        { name: 'Class Teacher', slug: 'class-teacher' },
        { name: 'SEN Teacher', slug: 'sen-teacher' },
        { name: 'Intervention Teacher', slug: 'intervention-teacher' },
        { name: 'Teaching Assistant', slug: 'teaching-assistant' },
        { name: 'SEN Teaching Assistant', slug: 'sen-teaching-assistant' },
        { name: 'Higher Level Teaching Assistant', slug: 'higher-level-teaching-assistant' },
        { name: 'SEN Higher Level Teaching Assistant', slug: 'sen-higher-level-teaching-assistant' },
        { name: 'Cover Supervisor', slug: 'cover-supervisor' },
        { name: 'Technician', slug: 'technician' },
        { name: 'Nursery Manager', slug: 'nursery-manager' },
        { name: 'Deputy Nursery Manager', slug: 'deputy-nursery-manager' },
        { name: 'Nursery Assistant', slug: 'nursery-assistant' },
        { name: 'Office Manager', slug: 'office-manager' },
        { name: 'Academy Administrator', slug: 'academy-administrator' },
        { name: 'Receptionist', slug: 'receptionist' },
        { name: 'Personal Assistant', slug: 'personal-assistant' },
        { name: 'Executive Assistant', slug: 'executive-assistant' },
        { name: 'Student Services Manager', slug: 'student-services-manager' },
        { name: 'Student Services Officer', slug: 'student-services-officer' },
        { name: 'Assistant SENCO', slug: 'assistant-senco' },
        { name: 'Safeguarding Manager', slug: 'safeguarding-manager' },
        { name: 'Safeguarding Officer', slug: 'safeguarding-officer' },
        { name: 'Safeguarding Administrator', slug: 'safeguarding-administrator' },
        { name: 'Library Manager', slug: 'library-manager' },
        { name: 'Library Assistant', slug: 'library-assistant' },
        { name: 'Careers Manager', slug: 'careers-manager' },
        { name: 'Careers Officer', slug: 'careers-officer' },
        { name: 'Exams Manager', slug: 'exams-manager' },
        { name: 'Exams Officer', slug: 'exams-officer' },
        { name: 'Exams Administrator', slug: 'exams-administrator' },
        { name: 'Lead Invigilator', slug: 'lead-invigilator' },
        { name: 'Invigilator', slug: 'invigilator' },
        { name: 'Attendance Manager', slug: 'attendance-manager' },
        { name: 'Attendance Officer', slug: 'attendance-officer' },
        { name: 'Deputy Attendance Officer', slug: 'deputy-attendance-officer' },
        { name: 'Attendance Administrator', slug: 'attendance-administrator' },
        { name: 'Data Manager', slug: 'data-manager' },
        { name: 'Data Officer', slug: 'data-officer' },
        { name: 'Data Administrator', slug: 'data-administrator' },
        { name: 'Cover Manager', slug: 'cover-manager' },
        { name: 'Lunchtime Supervisor', slug: 'lunchtime-supervisor' },
        { name: 'Music Tutor', slug: 'music-tutor' },
        { name: 'School Counsellor', slug: 'school-counsellor' },
        { name: 'Assistant Headteacher', slug: 'assistant-headteacher' },
        { name: 'HR Administrator', slug: 'hr-administrator' }
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

            const matches = roles.filter(r => r.name.toLowerCase().includes(query));
            if (matches.length === 0) {
                suggestionsEl.classList.remove('search-box__suggestions--open');
                suggestionsEl.innerHTML = '';
                return;
            }

            suggestionsEl.innerHTML = matches.map(m =>
                `<a href="${basePath}${m.slug}.html" class="search-box__suggestion">${m.name}</a>`
            ).join('');
            suggestionsEl.classList.add('search-box__suggestions--open');
        });

        suggestionsEl.addEventListener('click', (e) => {
            var suggestion = e.target.closest('.search-box__suggestion');
            if (suggestion) {
                searchInput.value = suggestion.textContent;
                suggestionsEl.classList.remove('search-box__suggestions--open');
            }
        });

        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !suggestionsEl.contains(e.target)) {
                suggestionsEl.classList.remove('search-box__suggestions--open');
            }
        });
    }

    // Departure board category filter
    const filterBtns = document.querySelectorAll('.departure-board__filter-btn');
    const boardRows = document.querySelectorAll('.board__row');
    const categoryRows = document.querySelectorAll('.board__category-row');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('departure-board__filter-btn--active'));
            btn.classList.add('departure-board__filter-btn--active');
            const filter = btn.dataset.filter;

            boardRows.forEach(row => {
                row.style.display = (filter === 'all' || row.dataset.category === filter) ? '' : 'none';
            });
            categoryRows.forEach(row => {
                row.style.display = (filter === 'all' || row.dataset.category === filter) ? '' : 'none';
            });

            // Update count
            const countEl = document.querySelector('.departure-board__count');
            if (countEl) {
                const visible = [...boardRows].filter(r => r.style.display !== 'none').length;
                countEl.textContent = `Showing ${visible} destination${visible !== 1 ? 's' : ''} \u2022 All flights operated by Flightplan Education`;
            }
        });
    });

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
