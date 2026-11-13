// Appearance: a three-way glass control (System / Light / Dark) that collapses into
// a single lens once the page is scrolled, and morphs open again on hover, focus or tap.
const root = document.documentElement;
const themeControl = document.querySelector('.theme-control');
const themeButtons = [...themeControl.querySelectorAll('[data-mode]')];
const compact = window.matchMedia('(max-width: 767px)');

const currentMode = () => root.dataset.theme || 'system';
const syncTheme = () => {
  const mode = currentMode();
  themeButtons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.mode === mode)));
  themeControl.style.setProperty('--i', themeButtons.findIndex((button) => button.dataset.mode === mode));
};

let expandedByUser = false;
let collapseTimer;
const shouldCollapse = () => compact.matches || window.scrollY > 240;
const setCollapsed = (collapsed) => { themeControl.dataset.collapsed = String(collapsed); };
const updateCollapse = () => setCollapsed(!expandedByUser && shouldCollapse());
const expand = () => { clearTimeout(collapseTimer); expandedByUser = true; setCollapsed(false); };
const collapseSoon = (delay) => {
  clearTimeout(collapseTimer);
  collapseTimer = setTimeout(() => { expandedByUser = false; updateCollapse(); }, delay);
};

themeButtons.forEach((button) => button.addEventListener('click', () => {
  if (themeControl.dataset.collapsed === 'true') { expand(); return; }
  const mode = button.dataset.mode;
  const apply = () => {
    if (mode === 'system') delete root.dataset.theme;
    else root.dataset.theme = mode;
    syncTheme();
  };
  try {
    if (mode === 'system') localStorage.removeItem('natboa-theme');
    else localStorage.setItem('natboa-theme', mode);
  } catch {}
  // The new appearance spreads out as a circle from the button that was pressed.
  if (document.startViewTransition && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const rect = button.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    document.startViewTransition(apply).ready.then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 650, easing: 'cubic-bezier(.77, 0, .175, 1)', pseudoElement: '::view-transition-new(root)' },
      );
    });
  } else {
    apply();
  }
  collapseSoon(900);
}));
themeControl.addEventListener('pointerenter', (event) => { if (event.pointerType === 'mouse') expand(); });
themeControl.addEventListener('pointerleave', (event) => { if (event.pointerType === 'mouse') collapseSoon(350); });
themeControl.addEventListener('focusin', expand);
themeControl.addEventListener('focusout', () => collapseSoon(350));
compact.addEventListener('change', updateCollapse);

// Navigation: one lens that slides and stretches to the section in view.
const links = [...document.querySelectorAll('.nav-links a[data-section]')];
const indicator = document.querySelector('.nav-indicator');
let activeLink = null;
const placeIndicator = () => {
  links.forEach((link) => link.toggleAttribute('aria-current', link === activeLink));
  if (!activeLink) { indicator.style.opacity = '0'; return; }
  indicator.style.width = `${activeLink.offsetWidth}px`;
  indicator.style.transform = `translateX(${activeLink.offsetLeft}px)`;
  indicator.style.opacity = '1';
};
const visible = new Set();
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => (entry.isIntersecting ? visible.add(entry.target.id) : visible.delete(entry.target.id)));
  activeLink = links.find((link) => visible.has(link.dataset.section)) || null;
  placeIndicator();
}, { rootMargin: '-40% 0px -55% 0px' });
links.forEach((link) => { const section = document.getElementById(link.dataset.section); if (section) observer.observe(section); });
window.addEventListener('resize', placeIndicator);
document.fonts?.ready.then(placeIndicator);

// Scroll state drives the edge effect and the collapsing control.
const onScroll = () => {
  document.body.classList.toggle('is-scrolled', window.scrollY > 8);
  if (!expandedByUser) updateCollapse();
};
window.addEventListener('scroll', onScroll, { passive: true });

// Specular highlight follows the pointer across interactive glass.
document.addEventListener('pointermove', (event) => {
  const element = event.target.closest?.('.glass--interactive');
  if (!element) return;
  const rect = element.getBoundingClientRect();
  element.style.setProperty('--mx', `${event.clientX - rect.left}px`);
  element.style.setProperty('--my', `${event.clientY - rect.top}px`);
}, { passive: true });

syncTheme();
onScroll();
