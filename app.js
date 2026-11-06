// Appearance is progressive enhancement: CSS follows the system without JS.
const appearance = document.querySelector('#appearance');
const validThemes = ['system', 'light', 'dark'];
try {
  const saved = localStorage.getItem('natboa-theme');
  if (validThemes.includes(saved)) appearance.value = saved;
} catch { /* Storage may be unavailable in private or restricted contexts. */ }
document.querySelector('.appearance').hidden = false;
appearance.addEventListener('change', () => {
  const mode = appearance.value;
  if (mode === 'system') delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = mode;
  try {
    if (mode === 'system') localStorage.removeItem('natboa-theme');
    else localStorage.setItem('natboa-theme', mode);
  } catch {}
});

// Keep a static preview until its stop control is ready. Without JavaScript,
// the HTML image stays still. A system request for reduced motion always wins.
const animation = document.querySelector('#terrain-animation');
const animationToggle = document.querySelector('#animation-toggle');
if (animation && animationToggle) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const stillSource = animation.getAttribute('src');
  let animationStopped = false;
  try {
    animationStopped = localStorage.getItem('natboa-animation-stopped') === 'true';
  } catch { /* The control still works when storage is unavailable. */ }

  const updateAnimation = () => {
    const source = reducedMotion.matches || animationStopped
      ? stillSource : animation.dataset.animationSrc;
    if (animation.getAttribute('src') !== source) animation.setAttribute('src', source);
    animationToggle.textContent = animationStopped ? 'Play animation' : 'Stop animation';
    animationToggle.hidden = reducedMotion.matches;
    document.querySelector('#animation-motion-note').hidden = !reducedMotion.matches;
  };

  animationToggle.addEventListener('click', () => {
    animationStopped = !animationStopped;
    try {
      if (animationStopped) localStorage.setItem('natboa-animation-stopped', 'true');
      else localStorage.removeItem('natboa-animation-stopped');
    } catch {}
    updateAnimation();
  });
  reducedMotion.addEventListener('change', updateAnimation);
  updateAnimation();
  document.querySelector('.animation-controls').hidden = false;
}
