// Scroll-driven map journey for page 1 (slide 0).
// Two data sources of truth:
//   CITIES   — full story content, keyed by the pin's data-city / chapter's data-chapter.
//   Everything else (pins, chapter sections) reads from this object, so adding a new
//   city later only requires a new entry here plus a matching pin + chapter in index.html.
const CITIES = {
  bulacan: {
    label: 'Bulacan',
    kicker: 'Seat of House Limmies',
    caption: 'Ruled by Lord Lomer — a patient man, kind to a fault.',
    detail: 'Ruled by Lord Lomer — a patient man, kind to a fault, whose words are known in every hall: "Pinahan mo na yan."',
  },
  nuvali: {
    label: 'Nuvali',
    kicker: 'Capital of House Jalandoni',
    caption: 'A city of glass towers and quiet water, ruled by Chalyn.',
    detail: 'A city of glass towers and quiet water, ruled by Chalyn — bannermen of the Koi, whose house words are carved above every gate: "Men are trash."',
  },
};

const INTRO = {
  kicker: 'For over a thousand years, Luzon has been divided',
  title: 'The North against the South',
  text: 'Scroll to see how far apart they really are.',
};

const journeyEl = document.getElementById('map-journey');
const stickyEl = document.querySelector('.map-journey-sticky');
const trackEl = document.getElementById('map-journey-track');
const mapImg = document.getElementById('journey-map');
const captionKicker = document.querySelector('.map-journey-kicker');
const captionTitle = document.getElementById('journey-title');
const captionText = document.getElementById('journey-text');
const scrollHint = document.getElementById('scroll-hint');
const pins = Array.from(document.querySelectorAll('.map-pin'));
const detailPanel = document.getElementById('map-detail-panel');
const detailTitle = document.getElementById('map-detail-title');
const detailText = document.getElementById('map-detail-text');
const detailClose = document.getElementById('map-detail-close');

function setCaption(kicker, title, text) {
  captionKicker.textContent = kicker;
  captionTitle.textContent = title;
  captionText.textContent = text;
}

function setActivePin(cityKey) {
  pins.forEach((pin) => pin.classList.toggle('active', pin.dataset.city === cityKey));
}

function openDetail(cityKey) {
  const city = CITIES[cityKey];
  if (!city) return;
  detailTitle.textContent = city.label;
  detailText.textContent = city.detail;
  detailPanel.classList.add('visible');
  detailPanel.setAttribute('aria-hidden', 'false');
}

function closeDetail() {
  detailPanel.classList.remove('visible');
  detailPanel.setAttribute('aria-hidden', 'true');
}

pins.forEach((pin) => {
  pin.addEventListener('click', () => openDetail(pin.dataset.city));
});
detailClose.addEventListener('click', closeDetail);

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const gsapAvailable = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';

if (!gsapAvailable || prefersReducedMotion) {
  // Fallback: static intro, no pin/zoom choreography, but pins stay clickable
  // and the continue button (already in the DOM) remains reachable by scrolling.
  journeyEl.classList.add('map-journey-static');
  setCaption(INTRO.kicker, INTRO.title, INTRO.text);
} else {
  gsap.registerPlugin(ScrollTrigger);
  setCaption(INTRO.kicker, INTRO.title, INTRO.text);

  const chapters = Array.from(trackEl.querySelectorAll('.map-journey-chapter'));

  chapters.forEach((chapter) => {
    const key = chapter.dataset.chapter;
    ScrollTrigger.create({
      trigger: chapter,
      scroller: '#story-overlay',
      start: 'top center',
      end: 'bottom center',
      onEnter: () => activateChapter(key),
      onEnterBack: () => activateChapter(key),
    });
  });

  function activateChapter(key) {
    if (key === 'intro') {
      setCaption(INTRO.kicker, INTRO.title, INTRO.text);
      setActivePin(null);
      scrollHint.classList.remove('hidden');
    } else if (key === 'outro') {
      setActivePin(null);
      scrollHint.classList.add('hidden');
    } else {
      const city = CITIES[key];
      if (city) setCaption(city.kicker, city.label, city.caption);
      setActivePin(key);
      scrollHint.classList.add('hidden');
    }
  }

  // The sticky visual (map + pins + caption) is pinned via native CSS
  // `position: sticky` (see .map-journey-sticky) rather than GSAP's pin
  // option — GSAP's pin inserts its own spacer sized to the pin duration,
  // which double-counts scroll distance against the track's own real
  // height and throws off every other trigger's measured position.

  // Each chapter drives its own zoom/pan independently, scrubbed to that
  // chapter's own scroll range — avoids having to hand-compute fractions
  // of a shared timeline, and stays correct regardless of chapter count.
  chapters.forEach((chapter) => {
    const key = chapter.dataset.chapter;
    const city = CITIES[key];
    const pin = city ? pins.find((p) => p.dataset.city === key) : null;
    const target = pin
      ? { scale: 1.35, transformOrigin: `${pin.style.getPropertyValue('--pin-x')} ${pin.style.getPropertyValue('--pin-y')}` }
      : { scale: 1, transformOrigin: '50% 50%' };

    gsap.to(mapImg, {
      ...target,
      ease: 'none',
      scrollTrigger: {
        trigger: chapter,
        scroller: '#story-overlay',
        start: 'top bottom',
        end: 'top top',
        scrub: true,
      },
    });
  });

  // The map image is large; ScrollTrigger's initial measurement can happen
  // before it finishes loading and the page reaches its final height, which
  // leaves the pin's cached scroll positions stale. Refresh once it's loaded.
  if (mapImg.complete) {
    ScrollTrigger.refresh();
  } else {
    mapImg.addEventListener('load', () => ScrollTrigger.refresh());
  }
  window.addEventListener('load', () => ScrollTrigger.refresh());
}
