'use strict';
(function () {
  const $ = (id) => document.getElementById(id);
  const KEY = 'citylens-v1';
  let progress = {};
  try { progress = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { progress = {}; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(progress)); } catch (e) { /* приватный режим */ } };

  const map = $('map'), wrap = $('mapwrap');
  const MIN_VW = 220, MAX_VW = MAP_W;
  let view = { cx: MAP_W / 2, cy: MAP_H / 2, vw: 1100 };
  let cur = null, st = null, marker = null;

  /* ---------- карта ---------- */
  function buildMap() {
    const scenes = [], objects = [], sig = new Set();
    CASES.forEach(c => {
      scenes.push(...c.scenes); objects.push(...(c.objects || []));
      c.scenes.forEach(sc => sig.add(sc.spec.hat + '|' + sc.spec.hatColor));
    });
    map.innerHTML = buildCity(scenes, objects, sig) + '<g id="overlay" pointer-events="none"></g>';
  }
  const rectOf = () => wrap.getBoundingClientRect();
  function applyView() {
    const r = rectOf(); if (!r.width) return;
    const vh = view.vw * r.height / r.width;
    map.setAttribute('viewBox', `${view.cx - view.vw / 2} ${view.cy - vh / 2} ${view.vw} ${vh}`);
  }
  function clampView(v) {
    v.vw = Math.min(MAX_VW, Math.max(MIN_VW, v.vw));
    v.cx = Math.min(MAP_W, Math.max(0, v.cx)); v.cy = Math.min(MAP_H, Math.max(0, v.cy));
    return v;
  }
  function setView(v) { view = clampView(v); applyView(); }
  function toWorld(px, py, v = view) {
    const r = rectOf(), vh = v.vw * r.height / r.width;
    return { x: v.cx - v.vw / 2 + (px - r.left) / r.width * v.vw, y: v.cy - vh / 2 + (py - r.top) / r.height * vh };
  }
  function zoomAt(px, py, factor) {
    const w = toWorld(px, py), r = rectOf();
    const vw = Math.min(MAX_VW, Math.max(MIN_VW, view.vw * factor)), vh = vw * r.height / r.width;
    const left = w.x - (px - r.left) / r.width * vw, top = w.y - (py - r.top) / r.height * vh;
    setView({ cx: left + vw / 2, cy: top + vh / 2, vw });
  }
  let anim = 0;
  function animateTo(t, ms = 650) {
    const from = Object.assign({}, view), to = clampView(Object.assign({}, t)), t0 = performance.now(), id = ++anim;
    (function step(now) {
      if (id !== anim) return;
      let k = Math.min(1, (now - t0) / ms); k = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      const lg = (a, b) => Math.exp(Math.log(a) + (Math.log(b) - Math.log(a)) * k);
      view = { cx: from.cx + (to.cx - from.cx) * k, cy: from.cy + (to.cy - from.cy) * k, vw: lg(from.vw, to.vw) };
      applyView(); if (k < 1) requestAnimationFrame(step);
    })(t0);
  }

  /* ---------- жесты ---------- */
  const ptrs = new Map();
  let g = null;
  wrap.addEventListener('pointerdown', e => {
    anim++;
    try { wrap.setPointerCapture(e.pointerId); } catch (_) {}
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    g = { t: performance.now(), moved: 0, n: ptrs.size, start: Object.assign({}, view) };
    if (ptrs.size === 2) {
      const [a, b] = [...ptrs.values()];
      g.d0 = Math.hypot(a.x - b.x, a.y - b.y) || 1; g.vw0 = view.vw;
      g.mid0 = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      g.w0 = toWorld(g.mid0.x, g.mid0.y);
    }
  });
  wrap.addEventListener('pointermove', e => {
    const p = ptrs.get(e.pointerId); if (!p || !g) return;
    const dx = e.clientX - p.x, dy = e.clientY - p.y;
    p.x = e.clientX; p.y = e.clientY;
    g.moved += Math.abs(dx) + Math.abs(dy);
    const r = rectOf();
    if (ptrs.size === 1) {
      const k = view.vw / r.width;
      setView({ cx: view.cx - dx * k, cy: view.cy - dy * k, vw: view.vw });
    } else if (ptrs.size === 2) {
      const [a, b] = [...ptrs.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y) || 1, mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      const vw = Math.min(MAX_VW, Math.max(MIN_VW, g.vw0 * g.d0 / d)), vh = vw * r.height / r.width;
      const left = g.w0.x - (mx - r.left) / r.width * vw, top = g.w0.y - (my - r.top) / r.height * vh;
      setView({ cx: left + vw / 2, cy: top + vh / 2, vw });
    }
  });
  const endPtr = e => {
    if (!ptrs.has(e.pointerId)) return;
    ptrs.delete(e.pointerId);
    if (g && g.n === 1 && ptrs.size === 0 && g.moved < 10 && performance.now() - g.t < 450 && e.type === 'pointerup') onTap(e.clientX, e.clientY);
    if (ptrs.size === 1) { g = { t: 0, moved: 99, n: 2 }; } else if (!ptrs.size) g = null;
  };
  wrap.addEventListener('pointerup', endPtr);
  wrap.addEventListener('pointercancel', endPtr);
  wrap.addEventListener('wheel', e => { e.preventDefault(); zoomAt(e.clientX, e.clientY, Math.exp(e.deltaY * 0.0015)); }, { passive: false });
  ['gesturestart', 'gesturechange'].forEach(n => document.addEventListener(n, e => e.preventDefault()));
  document.addEventListener('dblclick', e => e.preventDefault());
  window.addEventListener('resize', applyView);
  $('zin').onclick = () => { const r = rectOf(); zoomAt(r.left + r.width / 2, r.top + r.height / 2, 0.6); };
  $('zout').onclick = () => { const r = rectOf(); zoomAt(r.left + r.width / 2, r.top + r.height / 2, 1.6); };

  /* ---------- оверлей: маркер и подсказки ---------- */
  const overlay = () => $('overlay');
  function drawMarker() {
    const o = overlay(); o.querySelector('#mk') && o.querySelector('#mk').remove();
    if (!marker) return;
    o.insertAdjacentHTML('beforeend', `<g id="mk" transform="translate(${marker.x} ${marker.y})"><circle r="${Math.max(14, view.vw / 40)}" fill="#d6532f" fill-opacity=".18" stroke="#d6532f" stroke-width="${Math.max(2.5, view.vw / 300)}"/><circle r="${Math.max(3, view.vw / 300)}" fill="#d6532f"/></g>`);
  }
  function drawRing(f, color = '#d6532f') {
    const o = overlay(); o.querySelector('#ring') && o.querySelector('#ring').remove();
    if (!f) return;
    o.insertAdjacentHTML('beforeend', `<circle id="ring" class="ring-hint" cx="${f.x}" cy="${f.y}" r="${f.r}" fill="none" stroke="${color}" stroke-width="5" stroke-dasharray="14 9"/>`);
  }
  function toast(t, ms = 2600) {
    const el = $('toast'); el.textContent = t; el.classList.remove('hidden');
    clearTimeout(toast.id); toast.id = setTimeout(() => el.classList.add('hidden'), ms);
  }

  /* ---------- шиты ---------- */
  function openSheet(html) { $('sheet').innerHTML = '<div class="grab"></div>' + html; $('sheet').scrollTop = 0; $('sheet').classList.remove('hidden'); $('sheetBack').classList.remove('hidden'); }
  function closeSheet() { $('sheet').classList.add('hidden'); $('sheetBack').classList.add('hidden'); }
  $('sheetBack').addEventListener('click', closeSheet);
  const stars = (n, max = 3) => '★'.repeat(n) + '☆'.repeat(max - n);

  function faces(c) {
    return '<div class="faces">' + c.show.map(id => {
      const p = CAST[id];
      return `<div class="face"><svg viewBox="-26 -68 52 74">${figureSVG(p, 0, 0)}</svg><b>${p.name}</b>${p.desc ? `<span>${p.desc}</span>` : ''}</div>`;
    }).join('') + '</div>';
  }
  function caseSheet() {
    const c = cur;
    openSheet(`<h2>${c.title}</h2><div class="lvl">Сложность: ${stars(c.level, 4)}</div>
      <p>${c.story}</p>${faces(c)}<p class="q">${c.question}</p>
      <button class="btn" id="go">К карте</button>`);
    $('go').onclick = closeSheet;
  }
  function choiceSheet() {
    const c = cur;
    openSheet(`<h2>${c.question}</h2><div class="opts">${c.options.map((o, i) => `<button class="opt" data-i="${i}">${o}</button>`).join('')}</div>
      <button class="btn alt" id="cancel">Назад к карте</button>`);
    $('cancel').onclick = closeSheet;
    $('sheet').querySelectorAll('.opt').forEach(b => b.onclick = () => {
      if (+b.dataset.i === c.correct) win(); else { st.wrong++; b.classList.add('bad'); toast('Не сходится. Проверьте ещё раз по карте.'); }
    });
  }
  function win() {
    const score = st.hints === 0 && st.wrong === 0 ? 3 : st.hints <= 1 && st.wrong <= 2 ? 2 : 1;
    progress[cur.id] = Math.max(progress[cur.id] || 0, score); save();
    if (cur.kind === 'tap') drawRing({ x: cur.answer.x, y: cur.answer.y, r: cur.answer.r }, '#3f9a55');
    const idx = CASES.indexOf(cur), next = CASES[idx + 1];
    openSheet(`<p class="big">🔎</p><h2 class="center">Дело раскрыто!</h2><div class="lvl center" style="font-size:28px">${stars(score)}</div>
      <p>${cur.solution}</p>
      ${next ? '<button class="btn" id="nextCase">Следующее дело</button>' : ''}
      <button class="btn alt" id="toList">К списку дел</button>`);
    if (next) $('nextCase').onclick = () => { closeSheet(); openCase(next.id); };
    $('toList').onclick = () => { closeSheet(); showHome(); };
  }
  function howtoSheet() {
    openSheet(`<h2>Как играть</h2>
      <p>1. Откройте дело и прочитайте историю. Там описано, кого искать.</p>
      <p>2. Двигайте карту пальцем, а двумя пальцами приближайте и отдаляйте её. Люди крошечные, поэтому приближайте как можно сильнее.</p>
      <p>3. Идите по следу героя: он появляется на карте несколько раз в разных местах. Следите за шляпой, одеждой и вещами.</p>
      <p>4. Ответьте на вопрос дела: коснитесь нужного места на карте и нажмите «Проверить» или выберите вариант.</p>
      <p>Меньше подсказок и ошибок даёт больше звёзд.</p>
      <button class="btn" id="ok">Понятно</button>`);
    $('ok').onclick = closeSheet;
  }

  /* ---------- экраны ---------- */
  function showHome() {
    $('game').classList.add('hidden'); $('home').classList.remove('hidden');
    $('caseList').innerHTML = CASES.map((c, i) => {
      const s = progress[c.id] || 0;
      return `<button class="card${s ? ' done' : ''}" data-id="${c.id}"><div class="num">${s ? '✓' : i + 1}</div>
        <div><h3>${c.title}</h3><p>${c.blurb}</p></div>
        <div class="meta"><div class="stars">${s ? stars(s) : ''}</div>${'●'.repeat(c.level)}</div></button>`;
    }).join('');
    $('caseList').querySelectorAll('.card').forEach(b => b.onclick = () => openCase(b.dataset.id));
  }
  function openCase(id) {
    cur = CASES.find(c => c.id === id);
    st = { hints: 0, wrong: 0 }; marker = null;
    $('home').classList.add('hidden'); $('game').classList.remove('hidden');
    $('topTitle').textContent = cur.title;
    $('hintBtn').textContent = 'Подсказка';
    $('answerBtn').textContent = cur.kind === 'tap' ? 'Проверить' : 'Ответить';
    $('answerBtn').disabled = cur.kind === 'tap';
    $('toast').classList.add('hidden');
    drawMarker(); drawRing(null);
    const r = rectOf(); view = clampView({ cx: MAP_W / 2, cy: MAP_H / 2, vw: r.width > r.height ? 1500 : 900 }); applyView();
    caseSheet();
  }
  function onTap(px, py) {
    if (!cur || cur.kind !== 'tap' || !$('sheet').classList.contains('hidden')) return;
    marker = toWorld(px, py); drawMarker(); $('answerBtn').disabled = false;
  }
  $('answerBtn').onclick = () => {
    if (!cur) return;
    if (cur.kind === 'choice') return choiceSheet();
    if (!marker) return;
    const a = cur.answer;
    if (Math.hypot(marker.x - a.x, marker.y - a.y) <= a.r) win();
    else { st.wrong++; toast('Мимо. Присмотритесь: тот ли это человек и то ли место?'); }
  };
  $('hintBtn').onclick = () => {
    if (!cur) return;
    const i = Math.min(st.hints, cur.hints.length - 1), h = cur.hints[i];
    if (st.hints < cur.hints.length) st.hints++;
    $('hintBtn').textContent = `Подсказка ${st.hints}/${cur.hints.length}`;
    toast(h.text, 5200); drawRing(h.focus);
    animateTo({ cx: h.focus.x, cy: h.focus.y, vw: Math.max(420, h.focus.r * 4.2) });
  };
  $('caseBtn').onclick = caseSheet;
  $('back').onclick = () => { cur = null; closeSheet(); showHome(); };
  $('howto').onclick = howtoSheet;
  $('reset').onclick = () => { if (confirm('Сбросить пройденные дела и звёзды?')) { progress = {}; save(); showHome(); } };

  /* ---------- запуск ---------- */
  buildMap(); showHome();
  if (/iphone|ipad|ipod/i.test(navigator.userAgent) && !window.navigator.standalone) $('installTip').classList.remove('hidden');
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) navigator.serviceWorker.register('sw.js').catch(() => {});
  window.__citylens = { CASES, get view() { return view; }, setView, toWorld };
})();
