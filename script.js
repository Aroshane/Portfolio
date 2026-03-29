document.addEventListener('DOMContentLoaded', () => {
    // 1. Intersection Observer for Scroll Animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 // Trigger when 15% of the element is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add the animation class
                entry.target.classList.add('is-visible');
                // Optional: Stop observing once animated to keep it visible
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Select all elements to animate
    const elementsToAnimate = document.querySelectorAll('.fade-in-up, .fade-in-right');
    elementsToAnimate.forEach(el => observer.observe(el));

    // 2. Navbar Scroll Effect
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.padding = '10px 0';
            navbar.style.background = 'rgba(10, 10, 15, 0.9)';
            navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.5)';
        } else {
            navbar.style.padding = '20px 0';
            navbar.style.background = 'rgba(10, 10, 15, 0.6)';
            navbar.style.boxShadow = 'none';
        }
    });

    // 3. Optional: Smooth Scroll Offset for Fixed Navbar
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Adjust scroll position to not be hidden by fixed header
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

    // 4. Stardust Canvas Background
    const canvas = document.getElementById('stardust');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;
        let particles = [];

        function resize() {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        }

        window.addEventListener('resize', resize);
        resize();

        let mouse = { x: null, y: null, radius: 150 };

        window.addEventListener('mousemove', (e) => {
            mouse.x = e.x;
            mouse.y = e.y;
        });
        window.addEventListener('mouseout', () => {
            mouse.x = null;
            mouse.y = null;
        });

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.size = Math.random() * 1.5 + 0.5;
                this.speedX = (Math.random() - 0.5) * 0.5;
                this.speedY = (Math.random() - 0.5) * 0.5;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                if (this.x > width) this.x = 0;
                else if (this.x < 0) this.x = width;
                if (this.y > height) this.y = 0;
                else if (this.y < 0) this.y = height;
            }

            draw() {
                ctx.fillStyle = 'rgba(255, 215, 0, 0.7)';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function initParticles() {
            particles = [];
            let numParticles = Math.floor((width * height) / 10000); 
            for (let i = 0; i < numParticles; i++) {
                particles.push(new Particle());
            }
        }

        function connect() {
            for (let a = 0; a < particles.length; a++) {
                for (let b = a + 1; b < particles.length; b++) {
                    let dx = particles[a].x - particles[b].x;
                    let dy = particles[a].y - particles[b].y;
                    let distance = dx * dx + dy * dy;

                    if (distance < 15000) {
                        let opacityValue = 1 - (distance / 15000);
                        ctx.strokeStyle = `rgba(255, 215, 0, ${opacityValue * 0.25})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particles[a].x, particles[a].y);
                        ctx.lineTo(particles[b].x, particles[b].y);
                        ctx.stroke();
                    }
                }

                // Interactive connection to mouse
                if (mouse.x != null && mouse.y != null) {
                    let mdx = particles[a].x - mouse.x;
                    let mdy = particles[a].y - mouse.y;
                    let mouseDist = mdx * mdx + mdy * mdy;
                    if (mouseDist < mouse.radius * mouse.radius) {
                        let mouseOpacity = 1 - Math.sqrt(mouseDist) / mouse.radius;
                        ctx.strokeStyle = `rgba(0, 255, 255, ${mouseOpacity * 0.35})`; 
                        ctx.lineWidth = 1.2;
                        ctx.beginPath();
                        ctx.moveTo(particles[a].x, particles[a].y);
                        ctx.lineTo(mouse.x, mouse.y);
                        ctx.stroke();
                    }
                }
            }
        }

        function animate() {
            ctx.clearRect(0, 0, width, height);
            for (let particle of particles) {
                particle.update();
                particle.draw();
            }
            connect();
            requestAnimationFrame(animate);
        }

        // Re-initialize softly on resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                resize();
                initParticles();
            }, 200);
        });

        initParticles();
        animate();
    }

    // 5. Custom Cursor
    const cursorDot = document.querySelector('[data-cursor-dot]');
    const cursorOutline = document.querySelector('[data-cursor-outline]');
    
    // Add touch detection to avoid custom cursor on mobile
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (!isTouchDevice && cursorDot && cursorOutline) {
        window.addEventListener('mousemove', (e) => {
            const posX = e.clientX;
            const posY = e.clientY;

            cursorDot.style.left = `${posX}px`;
            cursorDot.style.top = `${posY}px`;

            // Adding a slight delay to the outline for a fluid effect
            cursorOutline.animate({
                left: `${posX}px`,
                top: `${posY}px`
            }, { duration: 500, fill: "forwards" });
        });

        // Add hover effect for interactive elements
        const interactiveElements = document.querySelectorAll('a, button, .btn');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseover', () => {
                cursorDot.classList.add('hovered');
                cursorOutline.classList.add('hovered');
            });
            el.addEventListener('mouseleave', () => {
                cursorDot.classList.remove('hovered');
                cursorOutline.classList.remove('hovered');
            });
        });
    }

    // 6. 3D Tilt Effect for Glass Panels
    const tiltContainers = document.querySelectorAll('.glass-panel');
    
    if (!isTouchDevice) {
        tiltContainers.forEach(container => {
            container.addEventListener('mousemove', (e) => {
                // Get element boundaries
                const rect = container.getBoundingClientRect();
                const containerWidth = rect.width;
                const containerHeight = rect.height;
                
                // Calculate mouse position relative to element mapping to range [-1, 1]
                const x = ((e.clientX - rect.left) / containerWidth) * 2 - 1;
                const y = ((e.clientY - rect.top) / containerHeight) * 2 - 1;

                // Determine maximum rotation in degrees
                const maxRotationX = 10;
                const maxRotationY = 10;
                
                // Rotate based on position (invert Y for natural feel)
                const rotateX = maxRotationX * y * -1;
                const rotateY = maxRotationY * x;

                container.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
                container.style.boxShadow = `${-x * 10}px ${-y * 10}px 30px rgba(138, 43, 226, 0.2)`;
            });

            container.addEventListener('mouseleave', () => {
                // Reset transform
                container.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
                container.style.boxShadow = `0 4px 30px rgba(0, 0, 0, 0.1)`;
                
                // Keep smooth transition when snapping back
                container.style.transition = `transform 0.5s ease-out, box-shadow 0.5s ease-out`;
            });
            
            container.addEventListener('mouseenter', () => {
                // Remove transition to make hover tracking snappy
                container.style.transition = `none`;
            });
        });
    }
});
