// Prevent video dragging on mobile
document.addEventListener('DOMContentLoaded', function() {
    const videos = document.querySelectorAll('video');
    
    videos.forEach(video => {
        // Prevent touch events that could cause dragging
        video.addEventListener('touchstart', function(e) {
            e.preventDefault();
        }, { passive: false });
        
        video.addEventListener('touchmove', function(e) {
            e.preventDefault();
        }, { passive: false });
        
        video.addEventListener('touchend', function(e) {
            e.preventDefault();
        }, { passive: false });
        
        // Prevent drag events
        video.addEventListener('dragstart', function(e) {
            e.preventDefault();
            return false;
        });
        
        video.setAttribute('draggable', 'false');
    });
});

// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const nav = document.querySelector('.nav');
    const navLinks = document.querySelectorAll('.nav a');
    
    if (mobileMenuToggle && nav) {
        // Toggle menu
        mobileMenuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            nav.classList.toggle('active');
            document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
        });
        
        // Close menu when clicking on a link
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                nav.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (nav.classList.contains('active') && 
                !nav.contains(e.target) && 
                !mobileMenuToggle.contains(e.target)) {
                nav.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
});

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// FAQ Accordion
document.querySelectorAll('.faq-item').forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', function() {
        const isActive = item.classList.contains('active');
        
        // Close all FAQ items
        document.querySelectorAll('.faq-item').forEach(faqItem => {
            faqItem.classList.remove('active');
        });
        
        // Open clicked item if it wasn't active
        if (!isActive) {
            item.classList.add('active');
        }
    });
});

// Expand buttons for application cards
document.querySelectorAll('.expand-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const card = this.closest('.app-category-card');
        card.classList.toggle('expanded');
    });
});

// Comparison feature selection
document.querySelectorAll('.feature-number').forEach((feature, index) => {
    feature.addEventListener('click', function() {
        document.querySelectorAll('.feature-number').forEach(f => f.classList.remove('active'));
        this.classList.add('active');
        
        // Update comparison visuals based on selected feature
        updateComparisonVisual(index);
    });
});

function updateComparisonVisual(selectedIndex) {
    // This would update the comparison images based on selected feature
    console.log('Selected feature:', selectedIndex);
}

// Question buttons
document.querySelectorAll('.question-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        alert('Информация о данной особенности');
    });
});

// LED Film animation - только на десктопе
function animateLEDFilm() {
    if (window.innerWidth > 768) {
        const strips = document.querySelectorAll('.film-strip');
        strips.forEach((strip, index) => {
            strip.style.animation = `float ${3 + index}s ease-in-out infinite`;
        });
    }
}

// Add floating animation for LED strips - только на десктопе
const style = document.createElement('style');
style.textContent = `
    @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(var(--rotation, 0deg)); }
        50% { transform: translateY(-10px) rotate(var(--rotation, 0deg)); }
    }
    
    @media (max-width: 768px) {
        .film-strip {
            animation: none !important;
            transform: none !important;
        }
        .led-film-graphic {
            transform: none !important;
        }
    }
`;
document.head.appendChild(style);

// Apply rotation only on desktop (not mobile)
if (window.innerWidth > 768) {
    document.querySelectorAll('.film-strip-1').forEach(el => el.style.setProperty('--rotation', '-5deg'));
    document.querySelectorAll('.film-strip-2').forEach(el => el.style.setProperty('--rotation', '2deg'));
    document.querySelectorAll('.film-strip-3').forEach(el => el.style.setProperty('--rotation', '-3deg'));
    animateLEDFilm();
} else {
    // На мобильных отключаем все анимации
    document.querySelectorAll('.film-strip').forEach(el => {
        el.style.animation = 'none';
        el.style.transform = 'none';
    });
}

// Remove rotation and animation on resize if mobile
window.addEventListener('resize', function() {
    if (window.innerWidth <= 768) {
        document.querySelectorAll('.film-strip').forEach(el => {
            el.style.setProperty('--rotation', '0deg');
            el.style.transform = 'none';
            el.style.animation = 'none';
        });
        const ledFilmGraphic = document.querySelector('.led-film-graphic');
        if (ledFilmGraphic) {
            ledFilmGraphic.style.transform = 'none';
        }
    } else {
        animateLEDFilm();
    }
});

// Form Validation and Submission
const orderForm = document.getElementById('orderForm');
if (orderForm) {
    orderForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(orderForm);
        const data = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });
        
        // Validate consent checkbox
        if (!data.consent) {
            alert('Пожалуйста, дайте согласие на обработку персональных данных');
            return;
        }
        
        // Create order object
        const orderData = {
            name: data.name,
            phone: data.phone,
            email: data.email,
            area: data.area || 'Не указана'
        };
        
        // Send to server
        fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData)
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                alert('Спасибо! Мы свяжемся с вами в течение 15-30 минут.');
                orderForm.reset();
            } else {
                alert('Произошла ошибка. Пожалуйста, попробуйте еще раз.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Произошла ошибка при отправке формы. Пожалуйста, попробуйте еще раз.');
        });
    });
}

// Cookie Notice
function closeCookieNotice() {
    const cookieNotice = document.getElementById('cookieNotice');
    if (cookieNotice) {
        cookieNotice.classList.add('hidden');
        localStorage.setItem('cookieNoticeClosed', 'true');
    }
}

// Show cookie notice if not previously closed
document.addEventListener('DOMContentLoaded', function() {
    const cookieNoticeClosed = localStorage.getItem('cookieNoticeClosed');
    const cookieNotice = document.getElementById('cookieNotice');
    
    if (cookieNoticeClosed === 'true' && cookieNotice) {
        cookieNotice.classList.add('hidden');
    }
});

// Scroll to Top Button
const addScrollToTopButton = () => {
    const button = document.createElement('button');
    button.innerHTML = '↑';
    button.style.cssText = `
        position: fixed;
        bottom: 100px;
        right: 30px;
        width: 50px;
        height: 50px;
        background: linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%);
        color: white;
        border: none;
        border-radius: 50%;
        font-size: 24px;
        cursor: pointer;
        opacity: 0;
        transition: opacity 0.3s;
        z-index: 1000;
        box-shadow: 0 4px 20px rgba(139, 92, 246, 0.4);
    `;
    
    document.body.appendChild(button);
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            button.style.opacity = '1';
        } else {
            button.style.opacity = '0';
        }
    });
    
    button.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
};

addScrollToTopButton();

// Animate on scroll
const animateOnScroll = () => {
    const elements = document.querySelectorAll('.tech-feature-card, .principle-card, .app-category-card, .stat-item');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });
    
    elements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.6s, transform 0.6s';
        observer.observe(element);
    });
};

animateOnScroll();

// Dynamic button actions
document.querySelectorAll('.btn-calculate, .btn-outline').forEach(button => {
    if (button.textContent.includes('Рассчитать') || button.textContent.includes('Получить расчет')) {
        button.addEventListener('click', function(e) {
            if (!button.closest('form')) {
                e.preventDefault();
                document.getElementById('order')?.scrollIntoView({ behavior: 'smooth' });
                setTimeout(() => {
                    document.querySelector('input[name="name"]')?.focus();
                }, 500);
            }
        });
    }
});

document.querySelectorAll('.btn-test-drive').forEach(button => {
    button.addEventListener('click', function(e) {
        e.preventDefault();
        alert('Форма для заказа тест-драйва будет открыта');
        document.getElementById('order')?.scrollIntoView({ behavior: 'smooth' });
    });
});

document.querySelectorAll('.presentation-btn').forEach(button => {
    button.addEventListener('click', function(e) {
        e.preventDefault();
        alert('Презентация будет отправлена на ваш email после заполнения формы');
        document.getElementById('order')?.scrollIntoView({ behavior: 'smooth' });
    });
});

document.querySelectorAll('.presentation-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelector('.presentation-btn')?.click();
    });
});

// Phone mask
const phoneInputs = document.querySelectorAll('input[type="tel"]');
phoneInputs.forEach(input => {
    input.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        let formattedValue = '';
        
        if (value.length > 0) {
            formattedValue = '+7 (';
            if (value.length > 1) {
                formattedValue += value.substring(1, 4) + ') ';
                if (value.length > 4) {
                    formattedValue += value.substring(4, 7) + '-';
                    if (value.length > 7) {
                        formattedValue += value.substring(7, 9) + '-';
                        if (value.length > 9) {
                            formattedValue += value.substring(9, 11);
                        }
                    }
                }
            }
        }
        
        e.target.value = formattedValue;
    });
});

// Parallax effect for hero section - только на десктопе
window.addEventListener('scroll', () => {
    if (window.innerWidth > 768) {
        const scrolled = window.pageYOffset;
        const ledFilmGraphic = document.querySelector('.led-film-graphic');
        if (ledFilmGraphic) {
            ledFilmGraphic.style.transform = `translateY(${scrolled * 0.3}px)`;
        }
    }
});

// Glow effect for video play button
const playBtn = document.querySelector('.btn-play');
if (playBtn) {
    playBtn.addEventListener('click', function() {
        alert('Видео будет воспроизведено');
    });
}

console.log('LED Плёнка website loaded successfully!');
