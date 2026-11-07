/* Splash: animated dusk scene on open. Tap anywhere to start: plays the jingle, then reveals the app
   once it has loaded (index.html fires "app-ready"). Turned off via Settings (st.splash === false). */
(function () {
  const el = document.getElementById('splash');
  if (!el) return;
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem('frase-a-frase-v1') || '{}') || {}; } catch (e) {}
  if (saved.splash === false) { el.remove(); return; }

  const root = document.documentElement, btn = document.getElementById('spGo');
  if ((saved.ui || (/^de\b/i.test(navigator.language || '') ? 'de' : 'en')) === 'de') btn.textContent = 'Tippen zum Starten';
  root.classList.add('splashing');
  let ready = false, tapped = false, gone = false;

  function leave() {
    if (gone) return; gone = true;
    el.classList.add('leaving');
    setTimeout(() => { el.remove(); root.classList.remove('splashing'); }, 620);
  }
  window.addEventListener('app-ready', () => { ready = true; el.classList.add('ready'); if (tapped) setTimeout(leave, 250); });

  function start() {
    if (tapped) return; tapped = true;
    el.classList.add('tapped');
    if (saved.sfx !== false) jingle();
    setTimeout(() => { if (ready) leave(); else btn.textContent = 'Loading…'; }, 1050);
  }
  el.addEventListener('click', start);
  document.addEventListener('keydown', e => {
    if (!tapped && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); start(); }
  });

  /* "Fra-se a Fra-se": two marimba phrases, a splash bloop for the fish, a warm chord with sparkle. */
  function jingle() {
    let ctx;
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
    if (ctx.state === 'suspended') ctx.resume();
    const t0 = ctx.currentTime + 0.04;
    const out = ctx.createGain(), echo = ctx.createDelay(), fb = ctx.createGain(), wet = ctx.createGain();
    out.gain.value = 1.2; echo.delayTime.value = 0.17; fb.gain.value = 0.26; wet.gain.value = 0.32;
    out.connect(ctx.destination); out.connect(echo); echo.connect(fb).connect(echo); echo.connect(wet).connect(ctx.destination);

    const note = (f, t, dur, vol) => { // marimba-like: fundamental + bright 4th partial that dies fast
      [[1, 'sine', vol, dur], [4, 'sine', vol * 0.35, 0.08], [2, 'triangle', vol * 0.18, dur * 0.6]].forEach(([m, type, v, d]) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = type; o.frequency.value = f * m;
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0008, t + d);
        o.connect(g).connect(out); o.start(t); o.stop(t + d + 0.05);
      });
    };
    const bloop = t => { // fish leaping out of the water
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.setValueAtTime(260, t); o.frequency.exponentialRampToValueAtTime(980, t + 0.16);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.16, t + 0.01); g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      o.connect(g).connect(out); o.start(t); o.stop(t + 0.25);
    };
    // Fra - se   a   Fra - se
    [[392, 0, .25], [523.25, .13, .25], [659.25, .30, .45], [392, .52, .25], [523.25, .65, .25], [783.99, .82, .7]]
      .forEach(([f, dt, d]) => note(f, t0 + dt, d, 0.17));
    bloop(t0 + 0.04);
    [261.63, 329.63, 392, 523.25].forEach((f, i) => { // soft chord under the last note
      const o = ctx.createOscillator(), g = ctx.createGain(), t = t0 + 0.82;
      o.type = i ? 'sine' : 'triangle'; o.frequency.value = f;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(i ? 0.05 : 0.08, t + 0.05); g.gain.exponentialRampToValueAtTime(0.0008, t + 1.3);
      o.connect(g).connect(out); o.start(t); o.stop(t + 1.4);
    });
    [1568, 2093, 2637].forEach((f, i) => note(f, t0 + 1.0 + i * 0.07, 0.3, 0.035));
  }
})();
