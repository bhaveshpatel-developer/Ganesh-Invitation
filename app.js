/* ===========================================================
   Ganesh Chaturthi Invitation — scroll choreography
   Ported from the DCLogic component in
   "Ganesh Chaturthi Invitation.dc.html" (Claude Design).
   =========================================================== */
(function () {
  'use strict';

  /* --- Configuration -------------------------------------- */
  var CONFIG = {
    mapsUrl: 'https://maps.app.goo.gl/14DiG1T6bdTCZxcP8',
    showWhatsApp: true,
    showPetals: true,
    shareMessage: 'Ganpati Bappa Morya! You and your family are invited for darshan ' +
                  'and aarti at our society Ganpati pandal from 14 to 20 September 2026. Directions: '
  };

  /* --- Element lookup ------------------------------------- */
  var el = {};
  ['heroVideo', 'soundBtn', 'heroText', 'sec2', 'sec3', 'stage2', 'stage3',
   'garlandL', 'garlandR', 'bell1', 'bell2', 'bell3', 'bell4', 'diyaL', 'diyaR',
   'invite', 'card', 'cardRegion', 'mouse', 'bubble',
   'petals', 'shareBtn', 'mapBtn', 'scrollBtn', 'scrollBtn2'].forEach(function (id) {
    el[id] = document.getElementById(id);
  });

  var cachedCardScale = 1;
  function updateCardScale() {
    if (el.card && el.cardRegion && el.card.scrollHeight) {
      if (el.cardRegion.clientHeight < el.card.scrollHeight) {
        cachedCardScale = Math.max(0.75, (el.cardRegion.clientHeight - 8) / el.card.scrollHeight);
      } else {
        cachedCardScale = 1;
      }
    }
  }

  /* --- Easing helpers ------------------------------------- */
  function clamp01(v) { return Math.max(0, Math.min(1, v)); }
  function seg(p, a, b) { return clamp01((p - a) / (b - a)); }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  /* Progress 0..1 of a sticky scene.
     0 when the section's top edge first crosses the bottom of the viewport,
     1 once the sticky stage has been scrolled all the way through. Counting
     the entry phase means the choreography is already running as the scene
     slides into view, rather than waiting for the stage to pin. */
  function sceneProgress(node, viewportH) {
    var r = node.getBoundingClientRect();
    return clamp01((viewportH - r.top) / Math.max(1, r.height));
  }

  /* --- Per-frame choreography ----------------------------- */
  /* Thresholds are tuned against the progress above: with a 180svh scene the
     stage pins at about p = 0.55, so the decor lands as it settles and the
     copy resolves just after, leaving a still hold before the scene exits. */
  var BELLS = [
    ['bell1', 0.04, 0.30, -150],
    ['bell2', 0.08, 0.36, -190],
    ['bell3', 0.11, 0.40, -190],
    ['bell4', 0.15, 0.46, -150]
  ];

  function frame() {
    var vh = window.innerHeight;

    /* --- Scene 02: garland, bells, lamps, invitation copy --- */
    if (el.sec2) {
      var p = sceneProgress(el.sec2, vh);

      /* Garland halves: smooth entry, hold, graceful exit */
      var gIn = easeOut(seg(p, 0, 0.26));
      var gOut = easeOut(seg(p, 0.62, 0.90));
      var gOp = 1 - gOut;
      if (el.garlandL) {
        el.garlandL.style.transform = 'translate3d(' + (-110 * (1 - gIn) - 30 * gOut) + '%,0,0)';
        el.garlandL.style.opacity = gOp;
      }
      if (el.garlandR) {
        el.garlandR.style.transform = 'translate3d(' + (110 * (1 - gIn) + 30 * gOut) + '%,0,0)';
        el.garlandR.style.opacity = gOp;
      }

      /* Bells: staggered entry, hold, graceful lift & fade exit */
      var bOut = easeOut(seg(p, 0.60, 0.88));
      var bOp = 1 - bOut;
      BELLS.forEach(function (spec) {
        var node = el[spec[0]];
        if (!node) return;
        var t = easeOut(seg(p, spec[1], spec[2]));
        node.style.transform = 'translate3d(0,' + (spec[3] * (1 - t) - 45 * bOut) + '%,0)';
        node.style.opacity = bOp;
      });

      /* Diya lamps: smooth entry, hold, exit */
      var dIn = easeOut(seg(p, 0.26, 0.54));
      var dOut = easeOut(seg(p, 0.58, 0.86));
      var dOp = 1 - dOut;
      if (el.diyaL) {
        el.diyaL.style.transform = 'translate3d(' + (-130 * (1 - dIn) - 30 * dOut) + '%,0,0)';
        el.diyaL.style.opacity = dOp;
      }
      if (el.diyaR) {
        el.diyaR.style.transform = 'translate3d(' + (130 * (1 - dIn) + 30 * dOut) + '%,0,0) scaleX(-1)';
        el.diyaR.style.opacity = dOp;
      }

      /* Invitation copy & scroll button: smooth fade/drift in and out */
      var fadeIn = seg(p, 0.18, 0.50);
      var fadeOut = 1 - seg(p, 0.57, 0.82);
      var exitDrift = easeOut(seg(p, 0.57, 0.82));
      var i = fadeIn * fadeOut;

      if (el.invite) {
        el.invite.style.opacity = i;
        el.invite.style.transform =
          'translate3d(0,' + (24 * (1 - easeOut(fadeIn)) - 32 * exitDrift) + 'px,0)';
      }
      if (el.scrollBtn2) {
        el.scrollBtn2.style.opacity = i;
        el.scrollBtn2.style.transform =
          'translate3d(0,' + (16 * (1 - easeOut(fadeIn)) - 24 * exitDrift) + 'px,0)';
        el.scrollBtn2.style.pointerEvents = (i > 0.4 && p < 0.65) ? 'auto' : 'none';
      }

      /* Overall stage 2 soft fade to seamlessly clear as stage 3 takes over */
      if (el.stage2) {
        el.stage2.style.opacity = 1 - seg(p, 0.76, 0.96);
      }
    }

    /* --- Scene 03: details card, mushak, speech bubble ------ */
    if (el.sec3) {
      var p3 = sceneProgress(el.sec3, vh);

      var c = seg(p3, 0.08, 0.52);
      if (el.card) {
        var s = cachedCardScale;
        el.card.style.opacity = c;
        if (s < 0.99) {
          el.card.style.transform =
            'translate3d(0,' + (28 * (1 - easeOut(c))) + 'px,0) scale(' + s.toFixed(3) + ')';
        } else {
          el.card.style.transform =
            'translate3d(0,' + (28 * (1 - easeOut(c))) + 'px,0)';
        }
      }

      var m = easeOut(seg(p3, 0.14, 0.52));
      if (el.mouse) {
        el.mouse.style.transform = 'translate3d(' + (135 * (1 - m)) + '%,0,0)';
      }
      if (el.bubble) {
        var b = seg(p3, 0.22, 0.54);
        el.bubble.style.opacity = b;
        el.bubble.style.transform = 'translate3d(0,' + (14 * (1 - easeOut(b))) + 'px,0)';
      }
    }

    /* --- Scene 01: hero copy fades on first scroll ---------- */
    if (el.heroText) {
      var y = window.scrollY || document.documentElement.scrollTop || 0;
      var op = Math.max(0, 1 - y / (vh * 0.45));
      el.heroText.style.opacity = op;
      if (el.scrollBtn) {
        el.scrollBtn.style.pointerEvents = op < 0.05 ? 'none' : 'auto';
      }
    }
  }

  /* --- Render loop ---------------------------------------- */
  var rafId = null;
  var beatId = null;
  var looping = false;

  function loop() {
    frame();
    if (document.hidden) { looping = false; return; }
    looping = true;
    rafId = requestAnimationFrame(loop);
  }

  /* --- Sound toggle & icons ------------------------------- */
  var SVG_MUTE = '<svg class="sound-btn__icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>';
  var SVG_SOUND = '<svg class="sound-btn__icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>';

  var userSoundEnabled = true;

  function updateSoundUI() {
    var v = el.heroVideo;
    var button = el.soundBtn;
    if (!button) return;
    var isSoundActive = userSoundEnabled && v && !v.muted;
    button.innerHTML = (isSoundActive ? SVG_SOUND : SVG_MUTE) +
      '<span class="sound-btn__label">' + (isSoundActive ? 'Sound on' : 'Sound off') + '</span>';
    button.setAttribute('aria-label', isSoundActive ? 'Turn sound off' : 'Turn sound on');
    button.setAttribute('aria-pressed', String(isSoundActive));
  }

  /* Safari/iOS can silently drop autoplay; nudge the video back. */
  function kickVideo() {
    var v = el.heroVideo;
    if (!v || !v.paused) return;
    if (!userSoundEnabled) {
      v.muted = true;
    }
    var pr = v.play();
    if (pr && pr.catch) pr.catch(function () {});
  }

  function initAudioPlayback() {
    var v = el.heroVideo;
    if (!v) return;

    if (userSoundEnabled) {
      v.muted = false;
      var pr = v.play();
      if (pr && pr.catch) {
        pr.catch(function () {
          /* Browser autoplay policy prevented unmuted playback without prior user gesture.
             Play muted initially so visual playback continues, and unmute on user's first gesture! */
          v.muted = true;
          var pr2 = v.play();
          if (pr2 && pr2.catch) pr2.catch(function () {});
          updateSoundUI();

          function unlockAudioOnGesture() {
            if (userSoundEnabled && v) {
              v.muted = false;
              var pr3 = v.play();
              if (pr3 && pr3.catch) pr3.catch(function () {});
              updateSoundUI();
            }
            ['click', 'touchstart', 'touchend', 'pointerdown', 'keydown', 'scroll', 'wheel'].forEach(function (evt) {
              window.removeEventListener(evt, unlockAudioOnGesture, true);
              document.removeEventListener(evt, unlockAudioOnGesture, true);
            });
          }

          ['click', 'touchstart', 'touchend', 'pointerdown', 'keydown', 'scroll', 'wheel'].forEach(function (evt) {
            window.addEventListener(evt, unlockAudioOnGesture, { capture: true, passive: true });
            document.addEventListener(evt, unlockAudioOnGesture, { capture: true, passive: true });
          });
        });
      }
    } else {
      v.muted = true;
      var pr4 = v.play();
      if (pr4 && pr4.catch) pr4.catch(function () {});
    }
    updateSoundUI();
  }

  function toggleSound() {
    var v = el.heroVideo;
    var button = el.soundBtn;
    if (!button || !v) return;

    userSoundEnabled = !userSoundEnabled;
    v.muted = !userSoundEnabled;
    updateSoundUI();

    if (!v.muted) {
      var pr = v.play();
      if (pr && pr.catch) {
        pr.catch(function () {
          v.muted = true;
          userSoundEnabled = false;
          updateSoundUI();
        });
      }
    }
  }

  function tick() {
    frame();
    kickVideo();
  }

  /* --- Interactions --------------------------------------- */
  function openMap() {
    window.open(CONFIG.mapsUrl, '_blank', 'noopener');
  }

  function shareOnWhatsApp() {
    var text = CONFIG.shareMessage + CONFIG.mapsUrl;
    window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank', 'noopener');
  }

  var activeScrollAnim = null;

  function smoothScrollTo(targetY, duration) {
    if (activeScrollAnim) {
      cancelAnimationFrame(activeScrollAnim);
      activeScrollAnim = null;
    }

    duration = duration || 2400;
    var startY = window.pageYOffset || document.documentElement.scrollTop || 0;
    var distance = targetY - startY;
    if (Math.abs(distance) < 4) return;

    var startTime = null;
    var cancelled = false;

    function stopAnim() {
      cancelled = true;
      ['wheel', 'touchstart'].forEach(function (e) {
        window.removeEventListener(e, stopAnim);
      });
    }
    ['wheel', 'touchstart'].forEach(function (e) {
      window.addEventListener(e, stopAnim, { passive: true, once: true });
    });

    /* Gentle sine easing: smooth onset, calm uniform speed, soft arrival without speed spikes */
    function easeInOutSine(t) {
      return -(Math.cos(Math.PI * t) - 1) / 2;
    }

    function step(timestamp) {
      if (cancelled) return;
      if (!startTime) startTime = timestamp;
      var elapsed = timestamp - startTime;
      var progress = Math.min(elapsed / duration, 1);
      var eased = easeInOutSine(progress);

      window.scrollTo(0, startY + distance * eased);

      if (progress < 1) {
        activeScrollAnim = requestAnimationFrame(step);
      } else {
        stopAnim();
      }
    }

    activeScrollAnim = requestAnimationFrame(step);
  }

  function scrollToInvite() {
    if (el.sec2) {
      var rect = el.sec2.getBoundingClientRect();
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
      smoothScrollTo(rect.top + scrollTop, 2200);
    }
  }

  function scrollToDetails() {
    if (el.sec3) {
      var rect = el.sec3.getBoundingClientRect();
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
      smoothScrollTo(rect.top + scrollTop, 2400);
    }
  }

  /* --- Boot ----------------------------------------------- */
  function start() {
    updateCardScale();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(updateCardScale);
    }

    if (el.petals) el.petals.hidden = !CONFIG.showPetals;
    if (el.shareBtn) {
      el.shareBtn.hidden = !CONFIG.showWhatsApp;
      el.shareBtn.addEventListener('click', shareOnWhatsApp);
    }
    if (el.mapBtn) el.mapBtn.addEventListener('click', openMap);
    if (el.scrollBtn) el.scrollBtn.addEventListener('click', scrollToInvite);
    if (el.scrollBtn2) el.scrollBtn2.addEventListener('click', scrollToDetails);
    if (el.soundBtn) {
      updateSoundUI();
      el.soundBtn.addEventListener('click', toggleSound);
    }

    document.addEventListener('scroll', tick, { passive: true, capture: true });
    window.addEventListener('resize', function () {
      updateCardScale();
      tick();
    });
    ['touchstart', 'touchend', 'click'].forEach(function (evt) {
      window.addEventListener(evt, kickVideo, { passive: true });
    });
    document.addEventListener('visibilitychange', function () {
      tick();
      if (!looping) loop();
    });

    if (el.heroVideo) {
      el.heroVideo.addEventListener('loadeddata', initAudioPlayback);
      el.heroVideo.addEventListener('canplay', initAudioPlayback);
    }
    initAudioPlayback();
    beatId = setInterval(tick, 100);
    loop();
  }

  window.addEventListener('pagehide', function () {
    cancelAnimationFrame(rafId);
    clearInterval(beatId);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
