/**
 * WhatsApp Form Handler & Newsletter Mock for NS Souvenir
 * Intercepts submissions to .php-email-form on Vercel to avoid 405 Method Not Allowed errors.
 */
document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  // 1. Inject the WhatsApp Preview Modal HTML into the document body dynamically
  const modalHTML = `
    <div class="modal fade" id="whatsappModal" tabindex="-1" aria-labelledby="whatsappModalLabel" aria-hidden="true" style="z-index: 1060;">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header border-bottom-0 pb-0">
            <h5 class="modal-title fw-bold" id="whatsappModalLabel" style="font-family: 'Questrial', sans-serif; color: #1a1a1a;">Pratinjau Pesan WhatsApp</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="p-3 bg-light rounded-3 border" style="font-family: monospace; white-space: pre-wrap; font-size: 0.9rem; color: #333; line-height: 1.5; text-align: left;" id="whatsappMessageContent">
              <!-- Formatted WhatsApp message preview will go here -->
            </div>
          </div>
          <div class="modal-footer border-top-0 pt-0 d-flex justify-content-end align-items-center">
            <button type="button" class="btn btn-link text-secondary text-decoration-none me-3 fw-semibold" data-bs-dismiss="modal" style="font-size: 0.95rem;">Ubah</button>
            <button type="button" class="btn btn-primary px-4 py-2 fw-semibold" id="btnSendWhatsApp" style="background-color: #0d6efd; border-color: #0d6efd; border-radius: 6px; font-size: 0.95rem;">Buka WhatsApp</button>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // Initialize Bootstrap modal instance
  let whatsappModalInstance = null;
  const modalEl = document.getElementById('whatsappModal');
  if (modalEl && typeof bootstrap !== 'undefined') {
    whatsappModalInstance = new bootstrap.Modal(modalEl);
  }

  // 2. Select all forms with class '.php-email-form'
  const forms = document.querySelectorAll('.php-email-form');

  forms.forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();

      const thisForm = this;
      const action = thisForm.getAttribute('action') || '';
      
      // Determine if it is a Newsletter form (e.g., has action forms/newsletter.php or only an email input)
      const isNewsletter = action.includes('newsletter') || (!thisForm.querySelector('[name="name"]') && thisForm.querySelector('[name="email"]'));

      // Elements for feedback status
      const loadingEl = thisForm.querySelector('.loading');
      const errorEl = thisForm.querySelector('.error-message');
      const sentEl = thisForm.querySelector('.sent-message');

      if (loadingEl) loadingEl.classList.add('d-block');
      if (errorEl) errorEl.classList.remove('d-block');
      if (sentEl) sentEl.classList.remove('d-block');

      if (isNewsletter) {
        // Newsletter mock handler
        setTimeout(function () {
          if (loadingEl) loadingEl.classList.remove('d-block');
          if (sentEl) {
            sentEl.classList.add('d-block');
            sentEl.innerHTML = 'Terima kasih! Anda telah berhasil berlangganan newsletter kami.';
          }
          thisForm.reset();
        }, 800);
        return;
      }

      // Contact or Consultation form handler
      const nameVal = thisForm.querySelector('[name="name"]')?.value || '';
      const emailVal = thisForm.querySelector('[name="email"]')?.value || '';
      const phoneVal = thisForm.querySelector('[name="phone"]')?.value || '';
      const subjectVal = thisForm.querySelector('[name="subject"]')?.value || 'Permintaan Hubungi';
      const messageVal = thisForm.querySelector('[name="message"]')?.value || '';

      // Simple validation
      if (!nameVal || !emailVal || !messageVal) {
        if (loadingEl) loadingEl.classList.remove('d-block');
        if (errorEl) {
          errorEl.innerHTML = 'Harap isi semua kolom yang wajib diisi (Nama, Email, Pesan).';
          errorEl.classList.add('d-block');
        }
        return;
      }

      // Format WhatsApp message text
      const waTitle = subjectVal.includes('Consultation') || subjectVal.includes('Konsultasi') || subjectVal.includes('Souvenir')
        ? 'Permintaan Konsultasi — NS Souvenir'
        : `Hubungi Kami — ${subjectVal}`;
        
      const formattedMessage = `${waTitle}\n\n` +
                               `Nama: ${nameVal}\n` +
                               `Email: ${emailVal}\n` +
                               `WA: ${phoneVal || '-'}\n` +
                               `Subjek: ${subjectVal}\n\n` +
                               `Pesan:\n${messageVal}`;

      // Populate preview modal
      const previewContainer = document.getElementById('whatsappMessageContent');
      if (previewContainer) {
        previewContainer.textContent = formattedMessage;
      }

      if (loadingEl) loadingEl.classList.remove('d-block');

      // Bind Send button event handler
      const sendBtn = document.getElementById('btnSendWhatsApp');
      if (sendBtn) {
        // Clear previous listener to avoid multiple triggers
        const newSendBtn = sendBtn.cloneNode(true);
        sendBtn.parentNode.replaceChild(newSendBtn, sendBtn);

        newSendBtn.addEventListener('click', function () {
          // NS Souvenir target WhatsApp number
          const targetPhone = '6282338030619';
          const waUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(formattedMessage)}`;
          
          // Open WhatsApp in a new tab
          window.open(waUrl, '_blank');

          // Close modal
          if (whatsappModalInstance) {
            whatsappModalInstance.hide();
          }

          // Show success status on form
          if (sentEl) {
            sentEl.classList.add('d-block');
            sentEl.innerHTML = 'Pesan Anda telah disiapkan untuk WhatsApp. Terima kasih!';
          }
          thisForm.reset();
        });
      }

      // Show the preview modal
      if (whatsappModalInstance) {
        whatsappModalInstance.show();
      } else {
        // Fallback: If Bootstrap JS is not loaded properly, open WhatsApp directly
        const targetPhone = '6282338030619';
        const waUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(formattedMessage)}`;
        window.open(waUrl, '_blank');
        if (sentEl) {
          sentEl.classList.add('d-block');
        }
        thisForm.reset();
      }
    });
  });
});
