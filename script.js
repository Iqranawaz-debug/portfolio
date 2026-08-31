// Portfolio Website JavaScript
// Contains all interactive elements and animations

document.addEventListener('DOMContentLoaded', function() {
    
    // ===== MOBILE MENU TOGGLE =====
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    
    menuToggle.addEventListener('click', function() {
        menuToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        
        // Prevent scrolling when menu is open
        if (navMenu.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    });
    
    // Close menu when clicking a link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            menuToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    });
    
    // ===== NAVBAR SCROLL EFFECT =====
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Show/hide back to top button
        const backToTop = document.getElementById('backToTop');
        if (window.scrollY > 500) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });
    
    // ===== BACK TO TOP BUTTON =====
    const backToTop = document.getElementById('backToTop');
    
    backToTop.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // ===== SMOOTH SCROLLING FOR ANCHOR LINKS =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const navbarHeight = navbar.offsetHeight;
                const targetPosition = targetElement.offsetTop - navbarHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // ===== ANIMATE SKILL BARS ON SCROLL =====
    const skillItems = document.querySelectorAll('.skill-item');
    
    function animateSkillBars() {
        skillItems.forEach(item => {
            const skillLevel = item.querySelector('.skill-level');
            const level = item.getAttribute('data-level');
            
            // Check if element is in viewport
            const rect = item.getBoundingClientRect();
            const isInViewport = rect.top <= window.innerHeight * 0.9 && rect.bottom >= 0;
            
            if (isInViewport && !item.classList.contains('animated')) {
                skillLevel.style.width = level + '%';
                item.classList.add('animated');
            }
        });
    }
    
    // Initial check and on scroll
    animateSkillBars();
    window.addEventListener('scroll', animateSkillBars);
    
    // ===== CONTACT FORM HANDLING =====
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value;
            
            // In a real implementation, you would send this data to a server
            // For this demo, we'll just show a success message
            const submitBtn = contactForm.querySelector('.form-submit');
            const originalText = submitBtn.textContent;
            
            submitBtn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
            submitBtn.style.backgroundColor = '#10b981';
            
            // Reset form
            contactForm.reset();
            
            // Reset button after 3 seconds
            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.style.backgroundColor = '';
            }, 3000);
            
            // Log the form data (for demo purposes)
            console.log('Form submitted:', { name, email, subject, message });
        });
    }
    
    // ===== FLOATING SHAPES ANIMATION =====
    const shapes = document.querySelectorAll('.shape');
    
    function animateShapes() {
        shapes.forEach((shape, index) => {
            // Different animation for each shape
            const time = Date.now() * 0.001;
            const speed = 0.5 + index * 0.2;
            const x = Math.sin(time * speed) * 20;
            const y = Math.cos(time * speed) * 20;
            
            shape.style.transform = `translate(${x}px, ${y}px)`;
        });
        
        requestAnimationFrame(animateShapes);
    }
    
    // Start shape animation
    animateShapes();
    
    // ===== TYPEWRITER EFFECT FOR HERO TITLE =====
    const heroTitle = document.querySelector('.hero-title .accent');
    const originalText = heroTitle.textContent;
    const words = ['Solutions', 'Insights', 'Models', 'Systems'];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;
    
    function typeWriter() {
        const currentWord = words[wordIndex];
        
        if (isDeleting) {
            // Deleting characters
            heroTitle.textContent = originalText + currentWord.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 50;
        } else {
            // Typing characters
            heroTitle.textContent = originalText + currentWord.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 100;
        }
        
        // Check if word is complete
        if (!isDeleting && charIndex === currentWord.length) {
            // Pause at the end of the word
            typingSpeed = 1500;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            // Move to next word
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            typingSpeed = 500;
        }
        
        setTimeout(typeWriter, typingSpeed);
    }
    
    // Start typewriter effect after a delay
    setTimeout(typeWriter, 1000);
    
    // ===== CURRENT YEAR IN FOOTER =====
    const currentYearElement = document.getElementById('currentYear');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }
    
    // ===== INTERSECTION OBSERVER FOR FADE-IN ANIMATIONS =====
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-visible');
            }
        });
    }, observerOptions);
    
    // Observe all sections for fade-in animation
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });
    
    // ===== PROJECT CARD HOVER EFFECTS =====
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // ===== INTEREST CARD ANIMATION =====
    const interestCards = document.querySelectorAll('.interest-card');
    
    interestCards.forEach((card, index) => {
        // Add staggered animation delay
        card.style.animationDelay = `${index * 0.1}s`;
    });
    
    // ===== SKILL TAG HOVER EFFECT =====
    const skillTags = document.querySelectorAll('.skill-tag');
    
    skillTags.forEach(tag => {
        tag.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px)';
        });
        
        tag.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
});