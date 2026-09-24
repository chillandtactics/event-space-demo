(() => {
  'use strict';

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  const rooms = {
    light: {
      title: 'Светлый зал',
      description: 'Воздушное пространство с высоким светом для свадеб, ужинов и камерных праздников.',
      mood: 'Свет, живые цветы и мягкая архитектура',
      image: 'assets/hall.jpg',
      index: '01 / 03',
      choose: 'Выбрать светлый зал',
      label: 'Светлый зал'
    },
    loft: {
      title: 'Лофт',
      description: 'Фактурный зал для деловых событий, презентаций и вечерних встреч команды.',
      mood: 'Кирпич, металл и сценический свет',
      image: 'assets/loft.jpg',
      index: '02 / 03',
      choose: 'Выбрать лофт',
      label: 'Лофт'
    },
    terrace: {
      title: 'Терраса',
      description: 'Открытая площадка для летних церемоний, бранчей и частных вечеров.',
      mood: 'Воздух, зелень и закатный свет',
      image: 'assets/terrace.jpg',
      index: '03 / 03',
      choose: 'Выбрать террасу',
      label: 'Терраса'
    }
  };

  const formats = {
    wedding: 'Свадьба',
    corporate: 'Корпоратив',
    private: 'Частное событие'
  };

  const localDate = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - offset).toISOString().slice(0, 10);
  };

  const scrollToInquiry = () => {
    const inquiry = $('#inquiry');
    if (inquiry) inquiry.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  };

  const initialise = () => {
    const root = document.documentElement;
    const prefersDark = matchMedia('(prefers-color-scheme: dark)').matches;
    let savedTheme = null;
    try { savedTheme = localStorage.getItem('event-space-theme'); } catch {}
    const themes = ['light', 'dark', 'chocolate'];
    let currentTheme = themes.includes(savedTheme) ? savedTheme : (prefersDark ? 'dark' : 'light');

    const setTheme = (theme, persist = true) => {
      currentTheme = themes.includes(theme) ? theme : 'light';
      root.dataset.theme = currentTheme;
      $$('[data-theme-choice]').forEach((button) => {
        const active = button.dataset.themeChoice === currentTheme;
        button.setAttribute('aria-pressed', String(active));
      });
      if (persist) { try { localStorage.setItem('event-space-theme', currentTheme); } catch {} }
    };

    setTheme(currentTheme, false);
    $$('[data-theme-choice]').forEach((button) => button.addEventListener('click', () => setTheme(button.dataset.themeChoice)));

    const menuToggle = $('#menu-toggle');
    const mobileMenu = $('#mobile-menu');
    const setMenu = (open) => {
      if (!menuToggle || !mobileMenu) return;
      menuToggle.setAttribute('aria-expanded', String(open));
      menuToggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
      mobileMenu.hidden = !open;
    };
    if (menuToggle && mobileMenu) {
      setMenu(menuToggle.getAttribute('aria-expanded') === 'true');
      menuToggle.addEventListener('click', () => setMenu(menuToggle.getAttribute('aria-expanded') !== 'true'));
      $$('a', mobileMenu).forEach((link) => link.addEventListener('click', () => setMenu(false)));
      document.addEventListener('click', (event) => {
        if (!mobileMenu.hidden && !mobileMenu.contains(event.target) && !menuToggle.contains(event.target)) setMenu(false);
      });
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !mobileMenu.hidden) { setMenu(false); menuToggle.focus(); }
      });
    }

    const roomPhoto = $('#room-photo');
    const roomTitle = $('#room-title');
    const roomDescription = $('#room-description');
    const roomMood = $('#room-mood');
    const roomIndex = $('#room-index');
    const roomChoose = $('#room-choose');
    const roomSelect = $('#event-room');
    let activeRoom = 'light';
    const renderRoom = (roomKey) => {
      const room = rooms[roomKey];
      if (!room) return;
      activeRoom = roomKey;
      if (roomPhoto) {
        roomPhoto.src = room.image;
        roomPhoto.alt = room.title;
      }
      if (roomTitle) roomTitle.textContent = room.title;
      if (roomDescription) roomDescription.textContent = room.description;
      if (roomMood) roomMood.textContent = room.mood;
      if (roomIndex) roomIndex.textContent = room.index;
      if (roomChoose) roomChoose.textContent = room.choose;
      $$('[data-room]').forEach((button) => {
        const selected = button.dataset.room === roomKey;
        button.setAttribute('aria-pressed', String(selected));
      });
    };
    $$('[data-room]').forEach((button) => button.addEventListener('click', () => renderRoom(button.dataset.room)));
    renderRoom(activeRoom);
    if (roomChoose) {
      roomChoose.addEventListener('click', () => {
        if (roomSelect) {
          roomSelect.value = activeRoom;
          roomSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
        scrollToInquiry();
      });
    }

    const formatSelect = $('#event-format');
    $$('[data-event-choice]').forEach((button) => button.addEventListener('click', () => {
      const choice = button.dataset.eventChoice;
      if (formatSelect && formats[choice]) {
        formatSelect.value = choice;
        formatSelect.dispatchEvent(new Event('change', { bubbles: true }));
      }
      scrollToInquiry();
    }));

    const dialog = $('#gallery-dialog');
    const galleryImage = $('#gallery-image');
    const galleryCaption = $('#gallery-caption');
    const galleryClose = $('#gallery-close');
    const galleryPrev = $('#gallery-prev');
    const galleryNext = $('#gallery-next');
    const galleryItems = $$('[data-gallery-src][data-gallery-caption]');
    let galleryIndex = 0;
    let galleryTrigger = null;
    const showGalleryItem = (index) => {
      if (!galleryItems.length) return;
      galleryIndex = (index + galleryItems.length) % galleryItems.length;
      const item = galleryItems[galleryIndex];
      const source = item.dataset.gallerySrc;
      const caption = item.dataset.galleryCaption;
      if (galleryImage) {
        galleryImage.src = source;
        galleryImage.alt = caption;
      }
      if (galleryCaption) galleryCaption.textContent = caption;
    };
    const closeGallery = () => {
      if (dialog && dialog.open) dialog.close();
    };
    if (dialog) {
      galleryItems.forEach((item, index) => item.addEventListener('click', () => {
        galleryTrigger = item;
        showGalleryItem(index);
        if (typeof dialog.showModal === 'function') dialog.showModal();
      }));
      galleryClose?.addEventListener('click', closeGallery);
      galleryPrev?.addEventListener('click', () => showGalleryItem(galleryIndex - 1));
      galleryNext?.addEventListener('click', () => showGalleryItem(galleryIndex + 1));
      dialog.addEventListener('click', (event) => {
        if (event.target === dialog) closeGallery();
      });
      dialog.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          showGalleryItem(galleryIndex - 1);
        }
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          showGalleryItem(galleryIndex + 1);
        }
      });
      dialog.addEventListener('close', () => {
        const trigger = galleryTrigger;
        galleryTrigger = null;
        if (trigger && document.contains(trigger)) trigger.focus();
      });
    }

    const form = $('#event-form');
    const dateInput = $('#event-date');
    const guestsInput = $('#event-guests');
    const nameInput = $('#event-name');
    const contactInput = $('#event-contact');
    const stepOne = $('[data-form-step="1"]');
    const stepTwo = $('[data-form-step="2"]');
    const next = $('#form-next');
    const back = $('#form-back');
    const progress = $('#form-progress');
    const result = $('#form-result');
    const reset = $('#form-result-reset');
    const today = localDate();
    if (dateInput) dateInput.min = today;

    const updateProgress = (step, previewReady = false) => {
      if (progress) progress.textContent = previewReady ? 'Готово' : `${step === 1 ? '01' : '02'} / 02`;
    };
    const showStep = (step) => {
      if (stepOne) {
        stepOne.hidden = step !== 1;
        stepOne.disabled = step !== 1;
      }
      if (stepTwo) {
        stepTwo.hidden = step !== 2;
        stepTwo.disabled = step !== 2;
      }
      updateProgress(step);
    };
    const clearFieldError = (input) => {
      if (input) input.setCustomValidity('');
      if (result && !result.hidden) {
        result.hidden = true;
        result.textContent = '';
        if (reset) reset.hidden = true;
        updateProgress(stepTwo?.hidden ? 1 : 2);
      }
    };
    const validateField = (input) => {
      if (!input) return true;
      const value = input.value.trim();
      let message = '';
      if (input.required && !value) message = 'Заполните это поле.';
      if (!message && input === dateInput && value && value < today) message = 'Выберите дату не раньше сегодняшней.';
      if (!message && input === guestsInput && value) {
        const count = Number(value);
        if (!Number.isInteger(count) || count < 2 || count > 1000) message = 'Укажите от 2 до 1000 гостей.';
      }
      if (!message && input === nameInput && value.length < 2) message = 'Введите имя не короче 2 символов.';
      if (!message && input === contactInput && value) {
        const phoneDigits = value.replace(/\D/g, '');
        const telegram = /^@[A-Za-z0-9_]{5,}$/.test(value);
        const phone = /^[+\d\s().-]+$/.test(value) && phoneDigits.length >= 7 && phoneDigits.length <= 15;
        if (!(telegram || phone)) message = 'Укажите телефон из 7–15 цифр или Telegram вида @username.';
      }
      input.setCustomValidity(message);
      return !message;
    };
    const stepOneFields = [formatSelect, roomSelect, dateInput, guestsInput].filter(Boolean);
    const stepTwoFields = [nameInput, contactInput].filter(Boolean);
    [...stepOneFields, ...stepTwoFields].forEach((input) => { input.required = true; });
    const validateFields = (fields) => {
      let firstInvalid = null;
      fields.forEach(input => { if (!validateField(input) && !firstInvalid) firstInvalid = input; });
      if (firstInvalid) firstInvalid.reportValidity();
      return !firstInvalid;
    };
    [...stepOneFields, ...stepTwoFields].forEach((input) => {
      input.addEventListener('input', () => clearFieldError(input));
      input.addEventListener('change', () => clearFieldError(input));
      input.addEventListener('invalid', () => validateField(input));
    });
    next?.addEventListener('click', () => {
      if (validateFields(stepOneFields)) { showStep(2); nameInput?.focus(); }
    });
    back?.addEventListener('click', () => showStep(1));

    const resetFlow = () => {
      form?.reset();
      if (dateInput) dateInput.min = today;
      [...stepOneFields, ...stepTwoFields].forEach(clearFieldError);
      if (result) {
        result.hidden = true;
        result.textContent = '';
      }
      showStep(1);
      if (reset) reset.hidden = true;
    };
    reset?.addEventListener('click', resetFlow);
    form?.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!validateFields([...stepOneFields, ...stepTwoFields])) {
        showStep(validateFields(stepOneFields) ? 2 : 1);
        return;
      }
      const selectedFormat = formats[formatSelect?.value] || formatSelect?.selectedOptions?.[0]?.textContent || '';
      const selectedRoom = rooms[roomSelect?.value]?.label || roomSelect?.selectedOptions?.[0]?.textContent || '';
      if (result) {
        result.textContent = `Это демонстрация. Заявка не отправлена. Предпросмотр: ${selectedFormat}, ${selectedRoom}, ${dateInput?.value || ''}, ${guestsInput?.value || ''} гостей.`;
        result.hidden = false;
        result.tabIndex = -1;
        result.focus();
      }
      updateProgress(2, true);
      if (reset) reset.hidden = false;
    });
    showStep(1);

    root.classList.add('js', 'js-reveal');
    const revealItems = $$('[data-reveal]');
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealItems.forEach((item) => item.classList.add('is-visible'));
    } else {
      const observer = new IntersectionObserver((entries, currentObserver) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            currentObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });
      revealItems.forEach((item) => observer.observe(item));
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialise, { once: true });
  else initialise();
})();
