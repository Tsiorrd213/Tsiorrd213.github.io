document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    /* --- Loader Overlay Fade-out --- */
    const loader = document.getElementById('loader');
    window.addEventListener('load', () => {
        // Ensure loader stays visible for at least 800ms for a premium feel
        setTimeout(() => {
            if (loader) {
                loader.classList.add('fade-out');
            }
        }, 800);
    });

    // Fallback if load event already fired or delayed
    setTimeout(() => {
        if (loader && !loader.classList.contains('fade-out')) {
            loader.classList.add('fade-out');
        }
    }, 2000);

    /* --- Mobile Menu Toggle --- */
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileNav = document.querySelector('.mobile-nav');
    const menuIcon = menuToggle ? menuToggle.querySelector('i') : null;

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener('click', () => {
            mobileNav.classList.toggle('open');
            
            // Toggle icon from menu to x
            if (menuIcon && typeof lucide !== 'undefined') {
                const isOpen = mobileNav.classList.contains('open');
                menuIcon.setAttribute('data-lucide', isOpen ? 'x' : 'menu');
                lucide.createIcons({
                    attrs: {
                        class: 'lucide-icon'
                    },
                    nameAttr: 'data-lucide'
                });
            }
        });

        // Close menu on link click
        mobileNav.querySelectorAll('.mobile-nav-link').forEach(link => {
            link.addEventListener('click', () => {
                mobileNav.classList.remove('open');
                if (menuIcon && typeof lucide !== 'undefined') {
                    menuIcon.setAttribute('data-lucide', 'menu');
                    lucide.createIcons({
                        attrs: {
                            class: 'lucide-icon'
                        },
                        nameAttr: 'data-lucide'
                    });
                }
            });
        });
    }

    /* --- Scroll Entrance Animations --- */
    const scrollTriggerElements = document.querySelectorAll('.scroll-trigger');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.12
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Animate once
            }
        });
    }, observerOptions);

    scrollTriggerElements.forEach(el => {
        observer.observe(el);
    });

    /* --- Parallax on Background Circuit Traces --- */
    const circuitContainer = document.querySelector('.circuit-traces-container');
    
    window.addEventListener('mousemove', (e) => {
        if (circuitContainer) {
            // Calculate cursor offset from center (-0.5 to 0.5)
            const x = (e.clientX / window.innerWidth) - 0.5;
            const y = (e.clientY / window.innerHeight) - 0.5;
            
            // Smooth translate the whole circuit traces container
            requestAnimationFrame(() => {
                circuitContainer.style.transform = `translate(${x * 20}px, ${y * 20}px)`;
            });
        }
    });

    /* --- Interactive Learning Framework Methodology --- */
    const stepTabs = document.querySelectorAll('.framework-step-tab');
    const contentBlocks = document.querySelectorAll('.framework-content-block');

    if (stepTabs.length > 0 && contentBlocks.length > 0) {
        stepTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetStep = tab.getAttribute('data-step');

                // Update tab states
                stepTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Update content blocks with transition
                contentBlocks.forEach(block => {
                    block.classList.remove('active');
                });

                const activeBlock = document.getElementById(`step-desc-${targetStep}`);
                if (activeBlock) {
                    activeBlock.classList.add('active');
                }
            });

            // Hover trigger for desktop
            tab.addEventListener('mouseenter', () => {
                tab.click();
            });
        });
    }

    /* --- Smooth scrolling for header anchor links --- */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                
                // Adjust scroll position to account for sticky header
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
});
