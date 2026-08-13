const THEME_VIDEO_ID = 'eCemS3f-LDU';
const TRISHA_PHOTO_SRC = 'assets/img/trisha.jpg';

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
  // Next step: swap in the Dothraki celebration video once it's shared, and reveal date/time/place.
  document.getElementById('btn-issa').classList.add('accepted');
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
