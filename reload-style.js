// reload-style.js
// Adds a modern, animated reload overlay for the website

document.addEventListener('DOMContentLoaded', function() {
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
  overlay.style.background = '#181c24';
  overlay.style.transition = 'opacity 0.5s';
  overlay.style.opacity = 1;
  overlay.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;width:100vw;">
      <div class="reload-bg-rotator" style="width:120px;height:120px;display:flex;align-items:center;justify-content:center;">
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;">
          <!-- All-to-all edge connections for 10-point star -->
