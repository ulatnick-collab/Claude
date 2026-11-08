'use strict';
/* Карта города: 2400 × 1600. Дороги и кварталы, здания, толпа. */
const MAP_W = 2400, MAP_H = 1600;
const ROAD = 80;
const VROADS = [600, 1200, 1800];
const HROADS = [520, 1060];
const BLOCK_X = [[0, 560], [640, 1160], [1240, 1760], [1840, 2400]];
const BLOCK_Y = [[0, 480], [560, 1020], [1100, 1600]];

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildCity(scenes, objects, signatures) {
  const obst = [];                      // препятствия для толпы
  const rect = (x, y, w, h, pad = 8) => obst.push({ t: 'r', x: x - pad, y: y - pad, w: w + 2 * pad, h: h + 2 * pad });
  const circ = (x, y, r, pad = 8) => obst.push({ t: 'c', x, y, r: r + pad });
  let s = '';

  // земля и дороги
  s += `<rect width="${MAP_W}" height="${MAP_H}" fill="#efe8d3"/>`;
  VROADS.forEach(x => s += `<rect x="${x - ROAD / 2}" y="0" width="${ROAD}" height="${MAP_H}" fill="#d9d3c1"/>` +
    `<path d="M${x} 0V${MAP_H}" stroke="#fbf8ee" stroke-width="3" stroke-dasharray="26 22"/>`);
  HROADS.forEach(y => s += `<rect x="0" y="${y - ROAD / 2}" width="${MAP_W}" height="${ROAD}" fill="#d9d3c1"/>` +
    `<path d="M0 ${y}H${MAP_W}" stroke="#fbf8ee" stroke-width="3" stroke-dasharray="26 22"/>`);
  VROADS.forEach(x => HROADS.forEach(y =>
    s += `<rect x="${x - 40}" y="${y - 40}" width="80" height="80" fill="#d9d3c1"/>` +
         `<path d="M${x - 40} ${y - 26}h80M${x - 40} ${y - 18}h80M${x - 40} ${y + 18}h80M${x - 40} ${y + 26}h80" stroke="#fbf8ee" stroke-width="3" stroke-dasharray="7 6"/>`));

  // кварталы
  const blockFill = { '1,0': '#d3e5b4' };
  BLOCK_X.forEach(([x0, x1], c) => BLOCK_Y.forEach(([y0, y1], r) => {
    s += `<rect x="${x0 + 6}" y="${y0 + 6}" width="${x1 - x0 - 12}" height="${y1 - y0 - 12}" rx="16" fill="${blockFill[c + ',' + r] || '#f4eedb'}" stroke="#b9b19a" stroke-width="2.5"/>`;
  }));

  const label = (t, x, y, size = 30) => `<text x="${x}" y="${y}" text-anchor="middle" font-size="${size}" font-weight="700" fill="#5a5247" stroke="#f4eedb" stroke-width="5" paint-order="stroke" font-family="ui-rounded,system-ui,sans-serif" letter-spacing="1">${t}</text>`;

  const bld = (x, y, w, h, o) => {
    rect(x, y, w, h, 6);
    let b = `<rect x="${x + 5}" y="${y + 7}" width="${w}" height="${h}" rx="6" fill="#000" opacity=".1"/>`;
    b += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${o.fill}" ${SW(2.5)}/>`;
    b += `<rect x="${x}" y="${y}" width="${w}" height="${Math.min(34, h * .25)}" rx="6" fill="${o.roof}" ${SW(2.5)}/>`;
    const cols = Math.max(2, Math.floor((w - 30) / 46)), rows = Math.max(1, Math.floor((h - 90) / 52));
    for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
      const wx = x + 20 + i * ((w - 40) / cols) + ((w - 40) / cols - 24) / 2, wy = y + 52 + j * 52;
      b += `<rect x="${wx}" y="${wy}" width="24" height="30" rx="3" fill="#cfe6f1" ${SW(1.6)}/><path d="M${wx + 12} ${wy}v30M${wx} ${wy + 15}h24" stroke="${INK}" stroke-width="1.2"/>`;
    }
    const dx = o.doorX != null ? o.doorX : x + w / 2;
    b += `<rect x="${dx - 15}" y="${y + h - 38}" width="30" height="38" rx="3" fill="#8a6a4a" ${SW(2)}/><circle cx="${dx + 8}" cy="${y + h - 18}" r="2.2" fill="#f2c230"/>`;
    if (o.label) b += label(o.label, x + w / 2, y - 12);
    return b;
  };
  const tree = (x, y, r = 24) => { circ(x, y, r, 4);
    return `<circle cx="${x + 4}" cy="${y + 7}" r="${r}" fill="#000" opacity=".1"/><rect x="${x - 3}" y="${y}" width="6" height="${r}" fill="#7a5a3a"/>` +
           `<circle cx="${x}" cy="${y}" r="${r}" fill="#79b05a" ${SW(2)}/><circle cx="${x - r / 3}" cy="${y - r / 3}" r="${r / 2.6}" fill="#9bcb78"/>`; };
  const bench = (x, y) => { rect(x - 28, y - 8, 56, 18, 2);
    return `<rect x="${x - 28}" y="${y - 10}" width="56" height="7" rx="2" fill="#a37a4e" ${SW(1.6)}/><rect x="${x - 28}" y="${y}" width="56" height="9" rx="2" fill="#c49a64" ${SW(1.6)}/>` +
           `<path d="M${x - 24} ${y + 9}v6M${x + 24} ${y + 9}v6" ${SW(2)}/>`; };

  // (0,0) Пекарня
  s += bld(100, 100, 320, 200, { fill: '#f2d9a8', roof: '#c0723a', label: 'Пекарня', doorX: 265 });
  s += `<path d="M232 262h66v-14q-8 -10 -16.5 0q-8 -10 -16.5 0q-8 -10 -16.5 0q-8 -10 -16.5 0Z" fill="#e2573b" ${SW(1.5)}/>`;
  s += bld(450, 110, 90, 130, { fill: '#e3c9c0', roof: '#7b5e57' });

  // (1,0) Парк
  const pond = { x: 900, y: 250, rx: 120, ry: 70 };
  obst.push({ t: 'e', x: pond.x, y: pond.y, rx: pond.rx + 10, ry: pond.ry + 10 });
  s += `<path d="M640 480 Q760 420 900 420 T1160 400" stroke="#eadfbf" stroke-width="26" fill="none" stroke-linecap="round"/>`;
  s += `<ellipse cx="${pond.x}" cy="${pond.y}" rx="${pond.rx}" ry="${pond.ry}" fill="#a9d4e6" ${SW(2.5)}/>` +
       `<path d="M820 240q14 -8 28 0t28 0M930 270q14 -8 28 0t28 0M880 215q14 -8 28 0" stroke="#fff" stroke-width="2.5" fill="none" opacity=".8"/>`;
  [[700, 90], [760, 150], [1060, 100], [1100, 200], [1096, 330], [690, 230], [716, 330], [1000, 60], [860, 80], [800, 40]]
    .forEach(([x, y]) => s += tree(x, y, 22 + ((x + y) % 7)));
  s += bench(810, 365) + bench(960, 365);

  // (2,0) Музей
  s += bld(1330, 80, 340, 220, { fill: '#e7e0d0', roof: '#8c8473', label: 'Музей', doorX: 1500 });
  for (let i = 0; i < 6; i++) s += `<rect x="${1352 + i * 54}" y="118" width="14" height="150" fill="#fbf8ee" ${SW(1.6)}/>`;
  s += `<rect x="1470" y="262" width="60" height="38" rx="3" fill="#8a6a4a" ${SW(2)}/>`;

  // (3,0) Вокзал
  s += bld(1940, 80, 400, 170, { fill: '#d9c9d9', roof: '#7c607e', label: 'Вокзал', doorX: 2140 });
  s += `<rect x="1940" y="262" width="400" height="40" fill="#e7e1cf" ${SW(2)}/>`;
  s += `<path d="M1900 345H2400M1900 375H2400" stroke="#7a7266" stroke-width="4"/>`;
  for (let x = 1900; x < 2400; x += 20) s += `<path d="M${x} 338v44" stroke="#9a8e78" stroke-width="3"/>`;
  rect(1990, 322, 280, 72, 4);
  s += `<rect x="1990" y="322" width="280" height="72" rx="14" fill="#c0262d" ${SW(2.5)}/>`;
  for (let i = 0; i < 6; i++) s += `<rect x="${2008 + i * 44}" y="338" width="30" height="22" rx="4" fill="#cfe6f1" ${SW(1.5)}/>`;
  s += `<circle cx="2030" cy="396" r="7" fill="${INK}"/><circle cx="2230" cy="396" r="7" fill="${INK}"/>`;

  // (0,1) Рынок
  s += label('Рынок', 280, 612);
  const stallCol = ['#e2573b', '#3b8fe2', '#f2b630', '#5ea35a'];
  [640, 800].forEach((sy, row) => [60, 170, 280, 390].forEach((sx, i) => {
    rect(sx, sy, 80, 60, 4);
    const c = stallCol[(i + row) % 4];
    s += `<rect x="${sx + 3}" y="${sy + 8}" width="80" height="60" rx="3" fill="#000" opacity=".1"/><rect x="${sx}" y="${sy + 22}" width="80" height="38" fill="#c9a26a" ${SW(2)}/>`;
    s += `<path d="M${sx - 4} ${sy + 24}L${sx + 4} ${sy}H${sx + 76}L${sx + 84} ${sy + 24}Z" fill="${c}" ${SW(2)}/>`;
    for (let k = 1; k < 4; k++) s += `<path d="M${sx + k * 19 + 2} ${sy}L${sx + k * 19 - 2} ${sy + 24}" stroke="#fff" stroke-width="5" opacity=".7"/>`;
    s += `<circle cx="${sx + 22}" cy="${sy + 40}" r="5" fill="#d9442b"/><circle cx="${sx + 40}" cy="${sy + 42}" r="5" fill="#f2c230"/><circle cx="${sx + 58}" cy="${sy + 40}" r="5" fill="#79b05a"/>`;
  }));

  // (1,1) Площадь с фонтаном
  s += label('Площадь', 900, 612);
  const fountain = { x: 900, y: 790, r: 70 };
  circ(fountain.x, fountain.y, fountain.r, 6);
  s += `<circle cx="900" cy="790" r="110" fill="none" stroke="#e4dcc3" stroke-width="2" stroke-dasharray="3 9"/>`;
  s += `<circle cx="900" cy="790" r="70" fill="#a9d4e6" ${SW(3)}/><circle cx="900" cy="790" r="48" fill="#bfe3f1" ${SW(2)}/>` +
       `<circle cx="900" cy="790" r="10" fill="#d9d3c1" ${SW(2)}/><path d="M900 780q-14 -34 -34 -26M900 780q14 -34 34 -26M900 780v-36" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" stroke-dasharray="2 7"/>`;

  // (2,1) Кафе и Кино
  s += bld(1320, 600, 240, 160, { fill: '#f0d2c0', roof: '#b5503a', label: 'Кафе', doorX: 1440 });
  s += bld(1580, 600, 120, 160, { fill: '#cfd3e8', roof: '#4a4f86', label: 'Кино', doorX: 1640 });
  [[1340, 860], [1540, 860], [1360, 970], [1560, 970]].forEach(([x, y]) => { circ(x, y, 14, 4);
    s += `<circle cx="${x + 3}" cy="${y + 4}" r="14" fill="#000" opacity=".1"/><circle cx="${x}" cy="${y}" r="14" fill="#fbf8ee" ${SW(2)}/><circle cx="${x - 22}" cy="${y}" r="6" fill="#b5503a" ${SW(1.4)}/><circle cx="${x + 22}" cy="${y}" r="6" fill="#b5503a" ${SW(1.4)}/>`; });

  // (3,1) Школа
  s += bld(1940, 600, 360, 200, { fill: '#e8d98c', roof: '#a8902c', label: 'Школа', doorX: 2120 });
  s += `<path d="M1900 830H2340M1900 990H2340" stroke="#9a8e78" stroke-width="3" stroke-dasharray="3 7"/>`;

  // (0,2) Дома
  [[60, 1150, 130], [220, 1150, 130], [380, 1150, 120], [60, 1370, 130], [220, 1370, 130], [380, 1370, 120]].forEach(([x, y, w], i) =>
    s += bld(x, y, w, 130, { fill: ['#e3c9c0', '#cfe0d2', '#e7dcb9'][i % 3], roof: ['#7b5e57', '#58795f', '#8f7a3f'][i % 3] }));
  s += label('Дома', 280, 1136);

  // (1,2) Банк
  s += bld(760, 1180, 280, 200, { fill: '#d9dfe7', roof: '#5c6b82', label: 'Банк', doorX: 900 });
  for (let i = 0; i < 4; i++) s += `<rect x="${786 + i * 66}" y="1230" width="12" height="100" fill="#fbf8ee" ${SW(1.5)}/>`;
  s += `<rect x="885" y="1342" width="30" height="38" rx="3" fill="#8a6a4a" ${SW(2)}/>`;
  [[690, 1200], [1100, 1230], [690, 1500], [1110, 1520]].forEach(([x, y]) => s += tree(x, y, 24));

  // (2,2) Ярмарка
  s += label('Ярмарка', 1500, 1160);
  circ(1500, 1330, 120, 6);
  s += `<path d="M1500 1330L1440 1480M1500 1330L1560 1480" stroke="#7a7266" stroke-width="6"/>`;
  s += `<circle cx="1500" cy="1330" r="120" fill="none" ${SW(5)}/><circle cx="1500" cy="1330" r="80" fill="none" ${SW(2)}/>`;
  for (let i = 0; i < 8; i++) {
    const a = i * Math.PI / 4, px = 1500 + 120 * Math.cos(a), py = 1330 + 120 * Math.sin(a);
    s += `<path d="M1500 1330L${px} ${py}" stroke="${INK}" stroke-width="2"/><rect x="${px - 11}" y="${py - 8}" width="22" height="16" rx="4" fill="${['#e2573b', '#3b8fe2', '#f2b630', '#5ea35a'][i % 4]}" ${SW(1.6)}/>`;
  }
  s += `<circle cx="1500" cy="1330" r="9" fill="#f2c230" ${SW(2)}/>`;
  circ(1330, 1200, 50, 6);
  s += `<circle cx="1330" cy="1200" r="50" fill="#f3cfd6" ${SW(2.5)}/><circle cx="1330" cy="1200" r="14" fill="#e2573b" ${SW(2)}/>` +
       `<path d="M1330 1200L1330 1150M1330 1200L1373 1225M1330 1200L1287 1225" stroke="${INK}" stroke-width="2"/>`;
  [[1620, 1180], [1620, 1280]].forEach(([x, y]) => { rect(x, y, 90, 70, 4);
    s += `<path d="M${x} ${y + 70}V${y + 28}L${x + 45} ${y}L${x + 90} ${y + 28}V${y + 70}Z" fill="#fbf8ee" ${SW(2)}/><path d="M${x + 18} ${y + 16}L${x + 20} ${y + 70}M${x + 45} ${y}V${y + 70}M${x + 72} ${y + 16}L${x + 70} ${y + 70}" stroke="#e2573b" stroke-width="9"/>`; });

  // (3,2) Порт
  s += label('Порт', 2120, 1136);
  s += `<rect x="1846" y="1400" width="548" height="194" rx="14" fill="#a9d4e6" ${SW(2.5)}/>`;
  rect(1846, 1400, 548, 194, 0);
  for (let i = 0; i < 9; i++) s += `<path d="M${1880 + i * 60} 1520q10 -8 20 0t20 0" stroke="#fff" stroke-width="2.5" fill="none" opacity=".8"/>`;
  s += `<path d="M1846 1400H2394" stroke="#9a8e78" stroke-width="10"/>`;
  s += bld(1900, 1150, 200, 130, { fill: '#d6c4a8', roof: '#8a7650', label: 'Склад' });
  s += bld(2150, 1150, 200, 130, { fill: '#c9d3c0', roof: '#667a5c' });

  // предметы на карте
  (objects || []).forEach(o => s += objectSVG(o.type, o.x, o.y));

  // люди
  const rng = mulberry32(20240607);
  const keyPts = scenes.map(sc => [sc.x, sc.y]);
  const crowd = [];
  const inObst = (x, y) => obst.some(o => o.t === 'r' ? (x > o.x && x < o.x + o.w && y > o.y && y < o.y + o.h)
    : o.t === 'c' ? ((x - o.x) ** 2 + (y - o.y) ** 2 < o.r ** 2)
    : (((x - o.x) / o.rx) ** 2 + ((y - o.y) / o.ry) ** 2 < 1));
  const zones = [];
  VROADS.forEach(x => zones.push([x - 30, 20, 60, MAP_H - 40]));
  HROADS.forEach(y => zones.push([20, y - 30, MAP_W - 40, 60]));
  zones.push([660, 40, 460, 420], [1260, 310, 480, 160], [1880, 410, 500, 60], [1960, 266, 400, 30],
    [40, 700, 500, 90], [40, 860, 500, 140], [660, 600, 480, 400], [1260, 790, 480, 220], [1860, 840, 520, 160],
    [20, 1290, 540, 70], [670, 1400, 460, 180], [1260, 1110, 480, 480], [1860, 1290, 520, 100], [1860, 1100, 520, 40]);
  const weights = zones.map(z => z[2] * z[3]);
  const total = weights.reduce((a, b) => a + b, 0);
  const pick = () => { let t = rng() * total, i = 0; while (t > weights[i]) { t -= weights[i]; i++; } return zones[i]; };
  const CROWD_COLORS = ['#6c7a89', '#a0856c', '#8a6fb0', '#5d9c9c', '#c28b5a', '#7d8f69', '#b56576', '#4a6fa5'];
  const HATS = ['none', 'none', 'cap', 'beret', 'hood'];
  const SK = ['#f1c9a0', '#e0ac84', '#c68642', '#8d5524', '#f6d7b8'];
  const HAIR = ['#2b1d12', '#5a3a1e', '#a9741f', '#d8b25a', '#8a8a8a', '#6b2d1a'];
  let tries = 0;
  while (crowd.length < 300 && tries++ < 20000) {
    const z = pick(), x = z[0] + rng() * z[2], y = z[1] + 30 + rng() * (z[3] - 30);
    if (x < 20 || x > MAP_W - 20 || y < 70 || y > MAP_H - 6) continue;
    if (inObst(x, y)) continue;
    if (keyPts.some(p => Math.hypot(p[0] - x, p[1] - y) < 46)) continue;
    if (crowd.some(p => Math.hypot(p.x - x, p.y - y) < 24)) continue;
    const hat = HATS[Math.floor(rng() * HATS.length)];
    let hatColor = CROWD_COLORS[Math.floor(rng() * CROWD_COLORS.length)];
    if (signatures.has(hat + '|' + hatColor)) hatColor = '#9aa5b1';
    const kind = rng();
    crowd.push({ x, y, spec: {
      hat, hatColor, skin: SK[Math.floor(rng() * SK.length)], hair: HAIR[Math.floor(rng() * HAIR.length)],
      body: kind < .25 ? 'dress' : kind < .45 ? 'stripe' : 'coat',
      bodyColor: CROWD_COLORS[Math.floor(rng() * CROWD_COLORS.length)],
      item: rng() < .12 ? 'bag' : null, flip: rng() < .5 } });
  }
  const all = crowd.map(c => ({ y: c.y, svg: figureSVG(c.spec, c.x, c.y) }));
  scenes.forEach(sc => all.push({ y: sc.y, svg: figureSVG(sc.spec, sc.x, sc.y) }));
  all.sort((a, b) => a.y - b.y);
  s += `<g id="people">${all.map(a => a.svg).join('')}</g>`;
  return s;
}
