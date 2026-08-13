const slides = Array.from(document.querySelectorAll('.story-slide'));
const storyOverlay = document.getElementById('story-overlay');
const invitationPage = document.getElementById('invitation-page');
const dragonOverlay = document.getElementById('dragon-overlay');

let currentSlide = 0;

function goToNextSlide() {
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
  // Next step: reveal date/time/place once those are decided.
  document.getElementById('btn-issa').classList.add('accepted');
}

function handleRefuse() {
  dragonOverlay.classList.add('active');
}

function resetChoice() {
  dragonOverlay.classList.remove('active');
}

document.getElementById('btn-issa').addEventListener('click', handleAccept);
document.getElementById('btn-daor').addEventListener('click', handleRefuse);
document.getElementById('try-again').addEventListener('click', resetChoice);
