// Pointer-driven motion: hero tilt and magnetic buttons.
// Only on a fine pointer with motion allowed; everything else is CSS.
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

// Split the headline into words so it can assemble on load. Screen readers still get the full text.
const headline = document.querySelector('#intro-title');
let wordIndex = 0;
const splitWords = (node) => {
  [...node.childNodes].forEach((child) => {
    if (child.nodeType === Node.ELEMENT_NODE) { splitWords(child); return; }
    if (child.nodeType !== Node.TEXT_NODE || !child.textContent.trim()) return;
    const fragment = document.createDocumentFragment();
    child.textContent.split(/(\s+)/).forEach((part) => {
      if (!part) return;
      if (/^\s+$/.test(part)) { fragment.append(part); return; }
      const word = document.createElement('span');
      word.className = 'rise';
      word.style.setProperty('--d', wordIndex++);
      word.textContent = part;
      fragment.append(word);
    });
    child.replaceWith(fragment);
  });
};
if (headline && !reducedMotion.matches) splitWords(headline);

// Integration icons pop in one after another.
document.querySelectorAll('.greg-integrations li').forEach((item, index) => item.style.setProperty('--i', index));

if (finePointer.matches && !reducedMotion.matches) {
  const lerp = (from, to, amount) => from + (to - from) * amount;
  const pointer = { x: innerWidth / 2, y: innerHeight / 2 };

  // Hero objects tilt toward the pointer, like turning a desk lamp over them.
  const desk = document.querySelector('.hero-objects');
  const tilt = { x: 0, y: 0, tx: 0, ty: 0 };

  // Magnetic glass buttons lean toward the pointer while it is over them.
  document.querySelectorAll('.hero-link, .more-work').forEach((element) => {
    element.classList.add('magnetic');
    element.addEventListener('pointermove', (event) => {
      const rect = element.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      element.style.translate = `${dx * 0.22}px ${dy * 0.3}px`;
    });
    element.addEventListener('pointerleave', () => { element.style.translate = ''; });
  });

  window.addEventListener('pointermove', (event) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    if (desk) {
      const rect = desk.getBoundingClientRect();
      tilt.tx = Math.max(-1, Math.min(1, (event.clientX - (rect.left + rect.width / 2)) / rect.width));
      tilt.ty = Math.max(-1, Math.min(1, (event.clientY - (rect.top + rect.height / 2)) / rect.height));
    }
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => {
    tilt.tx = 0; tilt.ty = 0;
  });

  const frame = () => {
    if (desk) {
      tilt.x = lerp(tilt.x, tilt.tx, 0.08);
      tilt.y = lerp(tilt.y, tilt.ty, 0.08);
      desk.style.transform = `rotateX(${tilt.y * -7}deg) rotateY(${tilt.x * 9}deg)`;
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
