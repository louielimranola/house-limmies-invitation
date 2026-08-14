const THEME_VIDEO_ID = 'eCemS3f-LDU';
const TRISHA_PHOTO_SRC = 'assets/img/trisha.jpg';

// Placeholder event details — update these once a real date/time/place is set.
// Start/end are UTC (with the Z suffix); ctz controls the timezone Google Calendar displays them in.
const EVENT_TITLE = 'Break Bread — House Limmies & Trisha';
const EVENT_START_UTC = '20260828T070000Z'; // placeholder: Aug 28, 2026, 3:00 PM Asia/Manila
const EVENT_END_UTC = '20260828T080000Z';   // placeholder: Aug 28, 2026, 4:00 PM Asia/Manila
const EVENT_TIMEZONE = 'Asia/Manila';
const EVENT_LOCATION = 'TBD';
const EVENT_DETAILS = 'Date, time, and place are still placeholders — House Limmies will confirm soon.';

function buildCalendarUrl() {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: EVENT_TITLE,
    dates: `${EVENT_START_UTC}/${EVENT_END_UTC}`,
    details: EVENT_DETAILS,
    location: EVENT_LOCATION,
    ctz: EVENT_TIMEZONE,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

const slides = Array.from(document.querySelectorAll('.story-slide'));
const storyOverlay = document.getElementById('story-overlay');
const invitationPage = document.getElementById('invitation-page');
const dragonOverlay = document.getElementById('dragon-overlay');
const themeAudio = document.getElementById('theme-audio');
const themeToggle = document.getElementById('theme-toggle');
const dracarysPhoto = document.getElementById('dracarys-photo');

let currentSlide = 0;
let themePlaying = false;

function startTheme() {
  themeAudio.innerHTML = `<iframe src="https://www.youtube.com/embed/${THEME_VIDEO_ID}?autoplay=1&enablejsapi=1"
    allow="autoplay" frameborder="0"></iframe>`;
  themePlaying = true;
  themeToggle.textContent = '🔇 Theme';
}

function stopTheme() {
  themeAudio.innerHTML = '';
  themePlaying = false;
  themeToggle.textContent = '🎵 Theme';
}

themeToggle.addEventListener('click', () => {
  if (themePlaying) {
    stopTheme();
  } else {
    startTheme();
  }
});

function goToNextSlide() {
  if (!themePlaying) startTheme();
  slides[currentSlide].classList.remove('active');
  currentSlide += 1;
  if (currentSlide < slides.length) {
    slides[currentSlide].classList.add('active');
  }
}

function enterInvitation() {
  storyOverlay.classList.add('fade-out');
  setTimeout(() => {
    storyOverlay.style.display = 'none';
    invitationPage.classList.add('revealed');
  }, 900);
}

slides.forEach((slide) => {
  const btn = slide.querySelector('.continue-btn');
  if (btn.id === 'enter-invitation') {
    btn.addEventListener('click', enterInvitation);
  } else {
    btn.addEventListener('click', goToNextSlide);
  }
});

function handleAccept() {
  // Next step: swap in the Dothraki celebration video once it's shared.
  document.getElementById('btn-issa').classList.add('accepted');
  document.getElementById('calendar-link').href = buildCalendarUrl();
  document.getElementById('calendar-cta').classList.add('visible');
}

function handleRefuse() {
  dragonOverlay.classList.add('active');
  dracarysPhoto.innerHTML = `<img src="${TRISHA_PHOTO_SRC}" alt="">`;
}

function resetChoice() {
  dragonOverlay.classList.remove('active');
  dracarysPhoto.innerHTML = '';
}

document.getElementById('btn-issa').addEventListener('click', handleAccept);
document.getElementById('btn-daor').addEventListener('click', handleRefuse);
document.getElementById('try-again').addEventListener('click', resetChoice);
