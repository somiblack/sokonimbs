// background-3d.js
// Adds 3D scroll-based movement to the hero SVG background


document.addEventListener('DOMContentLoaded', function() {
  // Accessibility: Respect prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    // Remove any transform if previously set
    const offerBg = document.getElementById('offer-bg-3d');
    const offerBgDark = document.getElementById('offer-bg-3d-dark');
    if (offerBg) offerBg.style.transform = '';
    if (offerBgDark) offerBgDark.style.transform = '';
    return;
  }

  // Find the main offer background SVGs (light and dark)
  const offerBg = document.getElementById('offer-bg-3d');
  const offerBgDark = document.getElementById('offer-bg-3d-dark');
  // Find the parent container for overlay
  const bgContainer = offerBg ? offerBg.parentElement : (offerBgDark ? offerBgDark.parentElement : null);
  if (!offerBg && !offerBgDark) return;

  let lastScrollY = window.scrollY;
  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;

  function onScroll() {
    lastScrollY = window.scrollY;
    // Slow down: only 180deg max rotation
    const maxX = 180, maxY = 180;
    const scrollMax = document.body.scrollHeight - window.innerHeight;
    targetX = ((lastScrollY / scrollMax) * maxX) || 0;
    targetY = ((lastScrollY / scrollMax) * maxY) || 0;
  }

  function animate() {
    currentX += (targetX - currentX) * 0.10;
    currentY += (targetY - currentY) * 0.10;
    if (offerBg) offerBg.style.transform = `perspective(700px) rotateX(${currentX}deg) rotateY(${currentY}deg)`;
    if (offerBgDark) offerBgDark.style.transform = `perspective(700px) rotateX(${currentX}deg) rotateY(${currentY}deg)`;
    requestAnimationFrame(animate);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  animate();

  // --- Subtle Particle Overlay ---
  if (bgContainer && !document.getElementById('network-particle-overlay')) {
    const particleCanvas = document.createElement('canvas');
    particleCanvas.id = 'network-particle-overlay';
    particleCanvas.style.position = 'absolute';
    particleCanvas.style.top = 0;
    particleCanvas.style.left = 0;
    particleCanvas.style.width = '100%';
    particleCanvas.style.height = '100%';
    particleCanvas.style.pointerEvents = 'none';
    particleCanvas.style.touchAction = 'none';
    particleCanvas.style.zIndex = 2;
    particleCanvas.style.opacity = 0.22; // faint
    // Insert overlay after SVG for stacking
    bgContainer.appendChild(particleCanvas);

    // Responsive sizing
    function resizeCanvas() {
      // Use devicePixelRatio for crispness on mobile
      const dpr = window.devicePixelRatio || 1;
      particleCanvas.width = bgContainer.offsetWidth * dpr;
      particleCanvas.height = bgContainer.offsetHeight * dpr;
      particleCanvas.style.width = bgContainer.offsetWidth + 'px';
      particleCanvas.style.height = bgContainer.offsetHeight + 'px';
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle config
    const PARTICLE_COUNT = 22;
    const PARTICLE_SIZE = 1.2;
    const PARTICLE_COLOR = '#fff';
    const SPARKLE_COLOR = '#e0e7ef';
    const SPEED = 0.08;
    const particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * particleCanvas.width,
        y: Math.random() * particleCanvas.height,
        r: PARTICLE_SIZE + Math.random() * 1.2,
        dx: (Math.random() - 0.5) * SPEED,
        dy: (Math.random() - 0.5) * SPEED,
        sparkle: Math.random() < 0.25
      });
    }

    function drawParticles() {
      const ctx = particleCanvas.getContext('2d');
      const dpr = window.devicePixelRatio || 1;
      ctx.setTransform(1, 0, 0, 1, 0, 0); // reset
      ctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);
      for (const p of particles) {
        ctx.save();
        ctx.globalAlpha = p.sparkle ? 0.7 : 0.35;
        ctx.beginPath();
        ctx.arc(p.x / dpr, p.y / dpr, p.r, 0, 2 * Math.PI);
        ctx.fillStyle = p.sparkle ? SPARKLE_COLOR : PARTICLE_COLOR;
        ctx.shadowColor = p.sparkle ? SPARKLE_COLOR : PARTICLE_COLOR;
        ctx.shadowBlur = p.sparkle ? 8 : 0;
        ctx.fill();
        ctx.restore();
      }
      ctx.restore();
    }

    function animateParticles() {
      for (const p of particles) {
        p.x += p.dx;
        p.y += p.dy;
        // Wrap around edges
        if (p.x < 0) p.x = particleCanvas.width;
        if (p.x > particleCanvas.width) p.x = 0;
        if (p.y < 0) p.y = particleCanvas.height;
        if (p.y > particleCanvas.height) p.y = 0;
        // Occasional sparkle flicker
        if (p.sparkle && Math.random() < 0.01) p.sparkle = false;
        if (!p.sparkle && Math.random() < 0.003) p.sparkle = true;
      }
      drawParticles();
      requestAnimationFrame(animateParticles);
    }
    animateParticles();
  }
});
