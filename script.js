(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- mobile navigation ---- */
  var burger = document.querySelector('.burger');
  var panel = document.querySelector('.mobile-panel');
  if (burger && panel) {
    burger.addEventListener('click', function () {
      var open = panel.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    panel.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        panel.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---- active nav link ---- */
  var here = window.location.pathname.replace(/\/$/, '') || '/index.html';
  document.querySelectorAll('.nav a, .mobile-panel a').forEach(function (a) {
    var target = a.getAttribute('href').split('#')[0].replace(/\/$/, '');
    if (target === here || (here === '/' && target === '/index.html')) {
      a.classList.add('active');
    }
  });

  /* ---- scroll reveal with stagger ---- */
  var revealables = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, index) {
        if (entry.isIntersecting) {
          setTimeout(function () {
            entry.target.classList.add('in');
          }, index * 40);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealables.forEach(function (el) { io.observe(el); });
  }

  /* ---- count-up ---- */
  var counters = document.querySelectorAll('[data-count]');
  function setFinal(el) {
    el.textContent = Number(el.dataset.count).toLocaleString('de-CH');
  }
  if (reduceMotion || !('IntersectionObserver' in window)) {
    counters.forEach(setFinal);
  } else {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        cio.unobserve(el);
        var target = Number(el.dataset.count);
        var start = null;
        var duration = 1200;
        function tick(ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / duration, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased).toLocaleString('de-CH');
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ---- language switcher (pages without their own inline handler) ---- */
  if (!window.__seetLangBound) {
    document.querySelectorAll('.lang-switch button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var lang = btn.getAttribute('data-lang');
        if (window.I18N && typeof window.I18N.setLanguage === 'function') {
          window.I18N.setLanguage(lang);
        }
      });
    });
  }

  /* ---- copy to clipboard ---- */
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy');
      var done = function () {
        var original = btn.textContent;
        btn.textContent = 'Kopiert!';
        setTimeout(function () { btn.textContent = original; }, 2000);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, done);
      } else {
        var ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(ta);
        done();
      }
    });
  });

  /* ---- newsletter form ---- */
  var form = document.getElementById('newsletter-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.querySelector('input[name="name"]').value;
      var email = form.querySelector('input[name="email"]').value;
      var msg = document.getElementById('form-message');

      if (!name || !email) return;

      form.style.display = 'none';
      msg.style.display = 'block';
      msg.textContent = 'Vielen Dank! Du erhältst in Kürze eine Bestätigungsmail.';
      setTimeout(function () {
        form.reset();
        form.style.display = 'flex';
        msg.style.display = 'none';
      }, 3000);
    });
  }

  /* ---- PHASE 2: SCROLL EFFECTS ---- */

  /* Scroll progress indicator */
  var scrollProgress = document.createElement('div');
  scrollProgress.className = 'scroll-progress';
  document.body.appendChild(scrollProgress);

  window.addEventListener('scroll', function () {
    var scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    scrollProgress.style.width = scrollPercentage + '%';
  });

  /* Parallax effect on scroll */
  var parallaxElements = document.querySelectorAll('.parallax-image img, .hero-photo img');
  if ('IntersectionObserver' in window && parallaxElements.length > 0) {
    parallaxElements.forEach(function (el) {
      window.addEventListener('scroll', function () {
        var elementTop = el.getBoundingClientRect().top;
        var windowHeight = window.innerHeight;

        if (elementTop < windowHeight && elementTop > -window.innerHeight) {
          var scrollAmount = (windowHeight - elementTop) * 0.1;
          el.style.transform = 'translateY(' + scrollAmount + 'px)';
        }
      });
    });
  }

  /* Scroll-triggered reveal animations */
  var observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -80px 0px'
  };

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
      }
    });
  }, observerOptions);

  /* Observe elements for scroll reveal */
  document.querySelectorAll('.section-fade-in, .card.gradient-animate, .image-mask-reveal, .blur-reveal').forEach(function (el) {
    observer.observe(el);
  });

  /* Text reveal animation */
  var textReveals = document.querySelectorAll('.text-reveal');
  textReveals.forEach(function (el) {
    var text = el.textContent;
    el.textContent = '';
    var words = text.split(' ');
    words.forEach(function (word, index) {
      var span = document.createElement('span');
      span.textContent = word + ' ';
      span.style.display = 'inline-block';
      el.appendChild(span);
    });
  });

  var textObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
      }
    });
  }, observerOptions);

  textReveals.forEach(function (el) {
    textObserver.observe(el);
  });

  /* Header underline animation */
  var headerUnderlines = document.querySelectorAll('.header-underline');
  var underlineObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        setTimeout(function () {
          entry.target.classList.add('animated');
        }, 200);
      }
    });
  }, observerOptions);

  headerUnderlines.forEach(function (el) {
    underlineObserver.observe(el);
  });

  /* Staggered list animation */
  var staggerLists = document.querySelectorAll('.stagger-list');
  var listObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
      }
    });
  }, observerOptions);

  staggerLists.forEach(function (el) {
    listObserver.observe(el);
  });

  /* Tilt effect on cards (advanced) */
  var tiltCards = document.querySelectorAll('.card.tilt-effect');
  tiltCards.forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var rect = card.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;

      var centerX = rect.width / 2;
      var centerY = rect.height / 2;

      var rotateX = (y - centerY) / 10;
      var rotateY = (centerX - x) / 10;

      card.style.transform = 'translateY(-12px) scale(1.02) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg)';
    });

    card.addEventListener('mouseleave', function () {
      card.style.transform = 'translateY(-12px) scale(1.02) rotateX(0deg) rotateY(0deg)';
    });
  });

  /* Smooth scroll for anchor links */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var href = this.getAttribute('href');
      if (href && href !== '#') {
        e.preventDefault();
        var target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });

  /* ---- PHASE 3: ADVANCED EFFECTS ---- */

  /* Advanced mask-image animations */
  var maskElements = document.querySelectorAll('.mask-diagonal, .mask-radial, .mask-wipe');
  var maskObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry, index) {
      if (entry.isIntersecting) {
        setTimeout(function () {
          entry.target.classList.add('in-view');
        }, index * 150);
      }
    });
  }, observerOptions);

  maskElements.forEach(function (el) {
    maskObserver.observe(el);
  });

  /* 3D card tilt with mouse tracking (advanced) */
  var card3dElements = document.querySelectorAll('.card-3d');
  card3dElements.forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var rect = card.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;

      var centerX = rect.width / 2;
      var centerY = rect.height / 2;

      var rotateX = (y - centerY) / 15;
      var rotateY = (centerX - x) / 15;
      var rotateZ = Math.atan2(y - centerY, x - centerX) * 5;

      card.style.transform = 'translateY(-12px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) rotateZ(' + rotateZ + 'deg) scale(1.02)';
    });

    card.addEventListener('mouseleave', function () {
      card.style.transform = 'translateY(0) rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(1)';
    });
  });

  /* Sequence animation framework */
  var sequenceContainers = document.querySelectorAll('.sequence-container');
  var sequenceObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var items = entry.target.querySelectorAll('.sequence-item');
        items.forEach(function (item, index) {
          setTimeout(function () {
            item.classList.add('animate');
          }, index * 100);
        });
      }
    });
  }, observerOptions);

  sequenceContainers.forEach(function (el) {
    sequenceObserver.observe(el);
  });

  /* Staggered reveal with sequencing */
  var staggerReveals = document.querySelectorAll('.stagger-reveal');
  var staggerObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry, index) {
      if (entry.isIntersecting) {
        setTimeout(function () {
          entry.target.classList.add('visible');
        }, index * 100);
      }
    });
  }, observerOptions);

  staggerReveals.forEach(function (el) {
    staggerObserver.observe(el);
  });

  /* Container query simulation for older browsers */
  if (!CSS.supports('container-type: inline-size')) {
    function handleContainerQueries() {
      var containers = document.querySelectorAll('.card-grid-container');
      containers.forEach(function (container) {
        var width = container.offsetWidth;

        if (width >= 900) {
          container.style.gridTemplateColumns = 'repeat(3, 1fr)';
        } else if (width >= 600) {
          container.style.gridTemplateColumns = 'repeat(2, 1fr)';
        } else {
          container.style.gridTemplateColumns = '1fr';
        }
      });
    }

    handleContainerQueries();
    window.addEventListener('resize', handleContainerQueries);
  }

  /* Light ray effect */
  var lightRayElements = document.querySelectorAll('.light-ray');
  lightRayElements.forEach(function (el) {
    el.style.position = 'relative';
  });

  /* Neon glow pulse on interaction */
  var neonGlowElements = document.querySelectorAll('.neon-glow');
  neonGlowElements.forEach(function (el) {
    el.addEventListener('click', function () {
      el.style.animation = 'none';
      setTimeout(function () {
        el.style.animation = '';
      }, 10);
    });
  });

  /* Advanced parallax with depth */
  window.addEventListener('mousemove', function (e) {
    var parallaxElements = document.querySelectorAll('.float-3d, .float-parallax');
    parallaxElements.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width - 0.5;
      var y = (e.clientY - rect.top) / rect.height - 0.5;

      var moveX = x * 20;
      var moveY = y * 20;

      el.style.transform = 'translate(' + moveX + 'px, ' + moveY + 'px)';
    });
  });

  /* Scroll-triggered 3D effects */
  var scroll3dElements = document.querySelectorAll('[data-scroll-3d]');
  window.addEventListener('scroll', function () {
    scroll3dElements.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      var scrollPercent = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);

      if (scrollPercent > 0 && scrollPercent < 1) {
        var rotateX = (scrollPercent - 0.5) * 20;
        el.style.transform = 'rotateX(' + rotateX + 'deg) scale(' + (0.9 + scrollPercent * 0.2) + ')';
      }
    });
  });

  /* Performance optimization: toggle will-change */
  var animatedElements = document.querySelectorAll('.will-animate');
  var perfObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
      } else {
        entry.target.classList.remove('in-view');
      }
    });
  }, { threshold: 0 });

  animatedElements.forEach(function (el) {
    perfObserver.observe(el);
  });

  /* Dynamic animation control */
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    document.documentElement.setAttribute('data-reduced-motion', 'true');
  }

  /* Text shimmer effect trigger */
  var shimmerElements = document.querySelectorAll('.text-shimmer');
  var shimmerObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
      } else {
        entry.target.style.animationPlayState = 'paused';
      }
    });
  }, observerOptions);

  shimmerElements.forEach(function (el) {
    el.style.animationPlayState = 'paused';
    shimmerObserver.observe(el);
  });
})();
