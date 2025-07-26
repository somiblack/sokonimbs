// reload-style.js
// Adds a modern, animated reload overlay for the website

(function() {
  // Create overlay element
  const overlay = document.createElement('div');
  overlay.id = 'modern-reload-overlay';
  overlay.style.position = 'fixed';
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.zIndex = 9999;
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.background = 'linear-gradient(135deg, #4ecdc4 0%, #ff6b6b 100%)';
  overlay.style.transition = 'opacity 0.5s';
  overlay.style.opacity = 1;
  overlay.innerHTML = `
    <link href='https://fonts.googleapis.com/css2?family=Montserrat+Alternates:ital,wght@1,700&display=swap' rel='stylesheet'>
    <div style="display:flex;flex-direction:column;align-items:center;">
      <div class="modern-reload-spinner" style="width:64px;height:64px;border:6px solid #fff;border-top:6px solid #4ecdc4;border-radius:50%;animation:spin 1s linear infinite;"></div>
      <div aria-live="polite" style="margin-top:18px;font-size:2.1rem;color:#fff;font-weight:900;letter-spacing:0.14em;font-family:'Montserrat Alternates',sans-serif;font-style:italic;text-transform:uppercase;text-shadow:0 0 12px #4ecdc4,0 0 24px #ff6b6b,0 0 32px #fff,0 0 2px #fff;filter:contrast(1.2);">Refreshing...</div>
    </div>
    <style>
      @keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }
    </style>
  `;
  overlay.style.pointerEvents = 'none';
  overlay.style.userSelect = 'none';
  overlay.style.fontFamily = 'Segoe UI, Arial, sans-serif';
  overlay.style.backdropFilter = 'blur(6px)';
  overlay.style.webkitBackdropFilter = 'blur(6px)';
  overlay.style.boxShadow = '0 0 80px 0 rgba(0,0,0,0.18)';
  overlay.style.visibility = 'hidden';

  document.body.appendChild(overlay);

  function showReloadOverlay() {
    overlay.style.visibility = 'visible';
    overlay.style.opacity = 1;
  }
  function hideReloadOverlay() {
    overlay.style.opacity = 0;
    setTimeout(() => { overlay.style.visibility = 'hidden'; }, 500);
  }

  window.addEventListener('beforeunload', showReloadOverlay);
  window.addEventListener('pageshow', hideReloadOverlay);
})();
