import './style.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flip } from 'gsap/Flip';
import Lenis from 'lenis';
import { sets } from './sets.js';

gsap.registerPlugin(ScrollTrigger, Flip);
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
if (!location.hash) window.scrollTo(0, 0);

const DM_URL = 'https://ig.me/m/blushnail.studio';
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const byId = new Map(sets.map((s) => [s.id, s]));
const pad = (n) => String(n).padStart(2, '0');
const FINISH = { painted: 'Freehand', '3d': '3D gel', chrome: 'Chrome', crystal: 'Crystals', french: 'French' };
const finish = (s) => s.tags.map((t) => FINISH[t]).join(' · ');
// a stable little tilt per tip, so the board looks hand-pinned
const tilt = (id) => (((Number(id) * 37) % 9) - 4) * 0.6;

function nailHTML(s, { sizes = '(min-width: 1100px) 12vw, (min-width: 600px) 20vw, 28vw', eager = false } = {}) {
  return `<span class="nail nail--${s.shape.toLowerCase()}"><img
    src="/img/tips/${s.id}-360.webp" srcset="/img/tips/${s.id}-360.webp 360w, /img/tips/${s.id}-720.webp 720w"
    sizes="${sizes}" width="360" height="558" alt="" ${eager ? '' : 'loading="lazy"'} decoding="async" /></span>`;
}
function tipInner(s, opts) {
  return `<span class="tip__shadow">${nailHTML(s, opts)}</span>
    <span class="dymo tip__no">No. ${pad(s.no)}</span>
    <span class="tip__name">${s.name}</span>`;
}

/* ---------- render: hero tips, board, close row ---------- */
document.querySelectorAll('.hero__tips [data-open]').forEach((btn) => {
  const s = byId.get(btn.dataset.open);
  btn.innerHTML = tipInner(s, { sizes: '(min-width: 900px) 8vw, 20vw', eager: true });
  btn.setAttribute('aria-label', `No. ${pad(s.no)} ${s.name}, ${s.shape.toLowerCase()}. See the set`);
  btn.style.setProperty('--tilt', `${tilt(s.id) * 1.4}deg`);
});

const grid = document.querySelector('[data-grid]');
const order = [...sets].reverse(); // newest first
grid.innerHTML = order.map((s) => `
  <li><button class="tip" type="button" data-open="${s.id}" data-shape="${s.shape}" data-tags="${s.tags.join(' ')}"
    style="--tilt:${tilt(s.id)}deg" aria-label="No. ${pad(s.no)} ${s.name}, ${s.shape.toLowerCase()}, ${finish(s).replaceAll(' · ', ', ')}. See the set">
    ${tipInner(s)}
  </button></li>`).join('');

const closeRow = document.querySelector('[data-close-tips]');
closeRow.innerHTML = ['113', '052', '000', '121', '069', '115', '110']
  .map((id) => `<li style="transform: rotate(${tilt(id) * 1.6}deg)">${nailHTML(byId.get(id), { sizes: '(min-width: 900px) 10vw, 18vw' })}</li>`)
  .join('');

/* ---------- filters ---------- */
const state = { shape: 'all', tag: 'all' };
const count = document.querySelector('[data-count]');
document.querySelectorAll('[data-filter-group]').forEach((group) => {
  group.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    state[group.dataset.filterGroup] = chip.dataset.value;
    group.querySelectorAll('.chip').forEach((c) => {
      const on = c === chip;
      c.classList.toggle('is-on', on);
      c.setAttribute('aria-pressed', String(on));
    });
    applyFilter();
  });
});
function matches(btn) {
  return (state.shape === 'all' || btn.dataset.shape === state.shape)
    && (state.tag === 'all' || btn.dataset.tags.split(' ').includes(state.tag));
}
function applyFilter() {
  // matching tips move to the front of the board; the rest stay pinned behind, faded
  const items = [...grid.children];
  const flip = reduceMotion.matches ? null : Flip.getState(items);
  let n = 0;
  const on = [], off = [];
  order.forEach((s) => {
    const li = items.find((x) => x.firstElementChild.dataset.open === s.id);
    const btn = li.firstElementChild;
    const ok = matches(btn);
    if (ok) n++;
    btn.toggleAttribute('inert', !ok);
    btn.classList.toggle('is-low', !ok);
    (ok ? on : off).push(li);
  });
  grid.append(...on, ...off);
  if (flip) Flip.from(flip, { duration: .7, ease: 'power3.inOut', stagger: .012, absolute: false });
  // any tip not yet pressed on by the scroll reveal is pressed on now
  gsap.to(grid.querySelectorAll('.tip__shadow'), { opacity: 1, scale: 1, y: 0, duration: .4, overwrite: 'auto' });
  ScrollTrigger.refresh();
  count.textContent = n === sets.length ? `Showing all ${n} sets`
    : n === 0 ? 'No sets match both. Try another shape or finish.'
    : `Showing ${n} of ${sets.length} sets`;
}

/* ---------- tip viewer ---------- */
const viewer = document.querySelector('[data-viewer]');
const v = {
  img: viewer.querySelector('[data-v-img]'), no: viewer.querySelector('[data-v-no]'),
  name: viewer.querySelector('[data-v-name]'), meta: viewer.querySelector('[data-v-meta]'),
  desc: viewer.querySelector('[data-v-desc]'), pos: viewer.querySelector('[data-v-pos]'),
};
let current = null;
let lastFocus = null;
const viewerList = () => {
  const visible = order.filter((s) => !grid.querySelector(`[data-open="${s.id}"]`).classList.contains('is-low'));
  return visible.length ? visible : order;
};
function fill(id) {
  const s = byId.get(id);
  current = id;
  v.img.src = `/img/sets/${s.id}-1200.webp`;
  v.img.alt = `Genevieve's ${s.name} set: ${s.desc}`;
  v.no.textContent = `No. ${pad(s.no)}`;
  v.name.textContent = s.name;
  v.meta.textContent = `${s.shape} · ${finish(s)} · ${s.date}`;
  v.desc.textContent = s.desc;
  const list = viewerList();
  v.pos.textContent = `${list.findIndex((x) => x.id === id) + 1} / ${list.length}`;
}
function openViewer(id, from) {
  lastFocus = from;
  fill(id);
  viewer.showModal();
  lenis?.stop();
}
function step(dir) {
  const list = viewerList();
  const i = list.findIndex((x) => x.id === current);
  fill(list[(i + dir + list.length) % list.length].id);
}
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-open]');
  if (btn) openViewer(btn.dataset.open, btn);
});
viewer.querySelector('[data-close]').addEventListener('click', () => viewer.close());
viewer.querySelector('[data-prev]').addEventListener('click', () => step(-1));
viewer.querySelector('[data-next]').addEventListener('click', () => step(1));
viewer.addEventListener('click', (e) => { if (e.target === viewer) viewer.close(); });
viewer.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') step(-1);
  if (e.key === 'ArrowRight') step(1);
});
viewer.addEventListener('close', () => {
  lenis?.start();
  lastFocus?.focus?.({ preventScroll: true });
});

/* "Ask for this set": copy a ready-made message, then open the DM */
const toast = document.querySelector('[data-toast]');
let toastTimer;
function say(msg) {
  toast.textContent = msg;
  toast.classList.add('is-on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-on'), 3400);
}
viewer.querySelector('[data-ask]').addEventListener('click', () => {
  const s = byId.get(current);
  const msg = `Hi Genevieve! I'd love a set like No. ${pad(s.no)} "${s.name}" (${s.shape.toLowerCase()}, ${s.date}) from your tip board.`;
  const fallback = `Mention “No. ${pad(s.no)} ${s.name}” in your DM.`;
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(msg).then(() => say('Message copied. Paste it into your DM.'), () => say(fallback));
  } else say(fallback);
  window.open(DM_URL, '_blank', 'noopener');
});

/* ---------- nav + dock ---------- */
const nav = document.querySelector('[data-nav]');
const dock = document.querySelector('[data-dock]');
const hero = document.querySelector('.hero');
const closeSec = document.querySelector('.close');
const stick = () => nav.classList.toggle('is-stuck', window.scrollY > 8);
window.addEventListener('scroll', stick, { passive: true });
stick();
ScrollTrigger.create({
  trigger: hero, start: 'bottom 60%', endTrigger: closeSec, end: 'top 70%',
  onToggle: (self) => dock.classList.toggle('is-on', self.isActive),
});

/* ---------- smooth scroll ---------- */
let lenis = null;
if (!reduceMotion.matches) {
  lenis = new Lenis({ duration: 1.1, easing: (t) => 1 - Math.pow(1 - t, 4) });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(target, { offset: a.getAttribute('href') === '#top' ? 0 : -70 });
    else target.scrollIntoView();
  });
});

/* ---------- motion ---------- */
if (!reduceMotion.matches) {
  // split the hero title + statement into words
  document.querySelectorAll('[data-split], [data-words]').forEach((el) => {
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) frag.append(part);
            else { const w = document.createElement('span'); w.className = 'w'; w.textContent = part; frag.append(w); }
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el);
  });

  // intro: title words drop in, then the board is screwed to the wall and the tips are pressed on
  const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
  intro
    .from('.hero__title .w', { yPercent: 110, rotate: 4, opacity: 0, duration: .9, stagger: .08 })
    .from('[data-rise]', { y: 24, opacity: 0, duration: .8, stagger: .08 }, '-=.55')
    .from('[data-hero-board]', { y: 80, rotate: 6, opacity: 0, duration: 1.1, ease: 'expo.out' }, .15)
    .from('[data-hero-board] .screw', { rotate: -180, scale: 0, duration: .6, stagger: .05, ease: 'back.out(2)' }, .7)
    .from('[data-hero-board] [data-press]', { scale: 1.18, y: -14, opacity: 0, duration: .55, stagger: .09, ease: 'back.out(2.2)' }, .8)
    .from('.nav', { y: -20, opacity: 0, duration: .7 }, .1);

  // hero board drifts as you leave the hero
  gsap.to('[data-hero-board]', {
    yPercent: -8, rotate: -5, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  });

  // statement words light up as you read
  const words = gsap.utils.toArray('[data-words] .w');
  gsap.set(words, { opacity: .4 });
  gsap.to(words, {
    opacity: 1, stagger: .1, ease: 'none',
    scrollTrigger: { trigger: '.statement__text', start: 'top 78%', end: 'bottom 45%', scrub: .4 },
  });
  gsap.matchMedia().add('(min-width: 1101px)', () => {
    gsap.fromTo('[data-pin]', { yPercent: 30, rotate: 14 }, {
      yPercent: -20, rotate: 4, ease: 'none',
      scrollTrigger: { trigger: '.statement', start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });

  // tips get pressed onto the board as it scrolls in
  gsap.set('.grid .tip__shadow', { opacity: 0, scale: 1.16, y: -18 });
  ScrollTrigger.batch('.grid li', {
    start: 'top 92%', once: true,
    onEnter: (batch) => gsap.to(batch.map((li) => li.querySelector('.tip__shadow')), {
      opacity: 1, scale: 1, y: 0, duration: .55, stagger: .06, ease: 'back.out(2.4)',
    }),
  });

  // tape steps get printed on
  gsap.from('[data-step] .dymo', {
    clipPath: 'inset(0 100% 0 0)', duration: .7, stagger: .15, ease: 'steps(12)',
    scrollTrigger: { trigger: '.steps', start: 'top 80%' },
  });

  // closing tips rise up from the bottom edge
  gsap.from('.close__tips li', {
    yPercent: 70, duration: 1, stagger: .06, ease: 'power3.out',
    scrollTrigger: { trigger: '.close', start: 'top 60%' },
  });
}
