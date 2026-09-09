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
  ['heroVideo', 'heroText', 'sec2', 'sec3', 'garlandL', 'garlandR',
   'bell1', 'bell2', 'bell3', 'bell4', 'diyaL', 'diyaR',
   'invite', 'card', 'cardRegion', 'mouse', 'bubble',
   'petals', 'shareBtn', 'mapBtn', 'scrollBtn', 'scrollBtn2'].forEach(function (id) {
    el[id] = document.getElementById(id);
  });

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

      /* Each garland half sweeps in from the edge it hangs against. */
      var g = easeOut(seg(p, 0, 0.26));
      if (el.garlandL) {
        el.garlandL.style.transform = 'translate3d(' + (-110 * (1 - g)) + '%,0,0)';
      }
      if (el.garlandR) {
        el.garlandR.style.transform = 'translate3d(' + (110 * (1 - g)) + '%,0,0)';
      }

      BELLS.forEach(function (spec) {
        var node = el[spec[0]];
        if (!node) return;
        var t = easeOut(seg(p, spec[1], spec[2]));
        node.style.transform = 'translate3d(0,' + (spec[3] * (1 - t)) + '%,0)';
      });

      var d = easeOut(seg(p, 0.26, 0.54));
      if (el.diyaL) {
        el.diyaL.style.transform = 'translate3d(' + (-130 * (1 - d)) + '%,0,0)';
      }
      if (el.diyaR) {
        el.diyaR.style.transform = 'translate3d(' + (130 * (1 - d)) + '%,0,0) scaleX(-1)';
      }

      var i = seg(p, 0.44, 0.70);
      if (el.invite) {
        el.invite.style.opacity = i;
        el.invite.style.transform =
          'translate3d(0,' + (26 * (1 - easeOut(i))) + 'px,0) scale(' + (0.96 + 0.04 * i) + ')';
      }
      if (el.scrollBtn2) {
        el.scrollBtn2.style.opacity = i;
        el.scrollBtn2.style.transform =
          'translate3d(0,' + (16 * (1 - easeOut(i))) + 'px,0)';
        el.scrollBtn2.style.pointerEvents = (i > 0.4 && p < 0.95) ? 'auto' : 'none';
      }
    }

    /* --- Scene 03: details card, mushak, speech bubble ------ */
    if (el.sec3) {
      var p3 = sceneProgress(el.sec3, vh);

      var c = seg(p3, 0.10, 0.42);
      if (el.card) {
        /* Shrink the card if it would overflow its region on short screens. */
        var s = 1;
        if (el.cardRegion && el.card.scrollHeight) {
          s = Math.max(0.7, Math.min(1, (el.cardRegion.clientHeight - 10) / el.card.scrollHeight));
        }
        el.card.style.opacity = c;
        el.card.style.transform =
          'translate3d(0,' + (30 * (1 - easeOut(c))) + 'px,0) scale(' + s + ')';
      }

      var m = easeOut(seg(p3, 0.22, 0.58));
      if (el.mouse) {
        el.mouse.style.transform = 'translate3d(' + (135 * (1 - m)) + '%,0,0)';
      }
      if (el.bubble) {
        el.bubble.style.opacity = seg(p3, 0.58, 0.74);
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

  /* Safari/iOS can silently drop autoplay; nudge the video back. */
  function kickVideo() {
    var v = el.heroVideo;
    if (!v || !v.paused) return;
    v.muted = true;
    var pr = v.play();
    if (pr && pr.catch) pr.catch(function () {});
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

  function scrollToInvite() {
    if (el.sec2) {
      var rect = el.sec2.getBoundingClientRect();
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
      window.scrollTo({
        top: rect.top + scrollTop,
        behavior: 'smooth'
      });
    }
  }

  function scrollToDetails() {
    if (el.sec3) {
      var rect = el.sec3.getBoundingClientRect();
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
      window.scrollTo({
        top: rect.top + scrollTop,
        behavior: 'smooth'
      });
    }
  }

  /* --- Boot ----------------------------------------------- */
  function start() {
    if (el.petals) el.petals.hidden = !CONFIG.showPetals;
    if (el.shareBtn) {
      el.shareBtn.hidden = !CONFIG.showWhatsApp;
      el.shareBtn.addEventListener('click', shareOnWhatsApp);
    }
    if (el.mapBtn) el.mapBtn.addEventListener('click', openMap);
    if (el.scrollBtn) el.scrollBtn.addEventListener('click', scrollToInvite);
    if (el.scrollBtn2) el.scrollBtn2.addEventListener('click', scrollToDetails);

    document.addEventListener('scroll', tick, { passive: true, capture: true });
    window.addEventListener('resize', tick);
    ['touchstart', 'touchend', 'click'].forEach(function (evt) {
      window.addEventListener(evt, kickVideo, { passive: true });
    });
    document.addEventListener('visibilitychange', function () {
      tick();
      if (!looping) loop();
    });

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
