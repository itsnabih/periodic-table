/**
 * welcome-modal.js — First-Visit Onboarding & Welcome Modal
 * Authentic human-developer welcome modal with persistent localStorage memory.
 */

export function initWelcomeModal() {
  const modal = document.getElementById('welcomeModal');
  const btnClose = document.getElementById('btnCloseWelcome');
  const btnStart = document.getElementById('btnStartExplore');
  const btnOpen = document.getElementById('btnOpenWelcome');
  const chkDontShow = document.getElementById('chkDontShowWelcome');

  if (!modal) return;

  function openModal() {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    if (chkDontShow && chkDontShow.checked) {
      try {
        localStorage.setItem('pt_welcome_seen', 'true');
      } catch (_) {}
    }
  }

  // Auto-open on first visit
  try {
    const seen = localStorage.getItem('pt_welcome_seen');
    if (!seen) {
      setTimeout(() => {
        openModal();
      }, 200);
    }
  } catch (_) {}

  if (btnClose) btnClose.addEventListener('click', closeModal);
  if (btnStart) btnStart.addEventListener('click', closeModal);
  if (btnOpen) btnOpen.addEventListener('click', openModal);

  // Close when clicking the backdrop
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Close on Escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }
  });
}

