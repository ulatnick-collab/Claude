'use strict';
/* Рисование человечков (SVG). Начало координат — точка под ногами, рост ≈ 60 ед. */
const INK = '#2a2622';
const SW = (w) => `stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

function hatSVG(h, col) {
  switch (h) {
    case 'cap':
      return `<path d="M-7.6 -44.5 Q-7 -54 0 -54 Q7 -54 7.6 -44.5Z" fill="${col}" ${SW(1.2)}/>` +
             `<path d="M3 -45.6 H11.5 Q11.5 -43 8 -43 H3Z" fill="${col}" ${SW(1.2)}/>`;
    case 'top':
      return `<rect x="-10.5" y="-48.5" width="21" height="3.2" rx="1.2" fill="${col}" ${SW(1.2)}/>` +
             `<rect x="-6.2" y="-62.5" width="12.4" height="14.5" rx="1.5" fill="${col}" ${SW(1.2)}/>` +
             `<rect x="-6.2" y="-52.5" width="12.4" height="3" fill="#fff" opacity=".35"/>`;
    case 'beret':
      return `<ellipse cx="-1" cy="-50.5" rx="9.6" ry="4.3" fill="${col}" ${SW(1.2)}/>` +
             `<circle cx="-1" cy="-55" r="1.4" fill="${col}" ${SW(1)}/>`;
    case 'fedora':
      return `<ellipse cx="0" cy="-47.5" rx="12" ry="3.3" fill="${col}" ${SW(1.2)}/>` +
             `<path d="M-6.6 -47.5 Q-6.6 -58.5 0 -58.5 Q6.6 -58.5 6.6 -47.5Z" fill="${col}" ${SW(1.2)}/>` +
             `<rect x="-6.6" y="-51.5" width="13.2" height="2.8" fill="#fff" opacity=".35"/>`;
    case 'chef':
      return `<rect x="-6.5" y="-52" width="13" height="7" fill="${col}" ${SW(1.2)}/>` +
             `<circle cx="-4.5" cy="-55" r="4.4" fill="${col}" ${SW(1.2)}/><circle cx="4.5" cy="-55" r="4.4" fill="${col}" ${SW(1.2)}/>` +
             `<circle cx="0" cy="-57.5" r="4.6" fill="${col}" ${SW(1.2)}/>`;
    case 'scarf':
      return `<path d="M-8 -42.5 Q-9.5 -55.5 0 -55.5 Q9.5 -55.5 8 -42.5 Q4 -47.5 0 -47.5 Q-4 -47.5 -8 -42.5Z" fill="${col}" ${SW(1.2)}/>` +
             `<circle cx="8.8" cy="-41.6" r="2.7" fill="${col}" ${SW(1)}/>`;
    case 'hood':
      return `<path d="M-9.4 -42 Q-9.4 -56.5 0 -56.5 Q9.4 -56.5 9.4 -42 Q6.6 -50.2 0 -50.2 Q-6.6 -50.2 -9.4 -42Z" fill="${col}" ${SW(1.2)}/>`;
    default: return '';
  }
}

function itemSVG(it) {
  switch (it) {
    case 'box':
      return `<g transform="translate(0 -21)"><rect x="-9.5" y="-6.5" width="19" height="13" fill="#e8c48a" ${SW(1.3)}/>` +
             `<path d="M0 -6.5V6.5M-9.5 0H9.5" stroke="#d65a7a" stroke-width="2.2"/></g>`;
    case 'tube':
      return `<g transform="translate(14 -25) rotate(16)"><rect x="-3.4" y="-25" width="6.8" height="50" rx="3.2" fill="#f4efe0" ${SW(1.3)}/>` +
             `<rect x="-3.4" y="-9" width="6.8" height="3.2" fill="#c0392b"/><rect x="-3.4" y="9" width="6.8" height="3.2" fill="#c0392b"/></g>`;
    case 'purse':
      return `<g transform="translate(13 -17)"><rect x="-6" y="-4" width="12" height="9" rx="2.2" fill="#f2c230" ${SW(1.2)}/>` +
             `<circle cx="0" cy="-4" r="1.7" fill="${INK}"/></g>`;
    case 'bag':
      return `<g transform="translate(12.5 -17)"><path d="M-3 -4 Q0 -10 3 -4" fill="none" ${SW(1.1)}/>` +
             `<rect x="-5.5" y="-4" width="11" height="9.5" rx="2" fill="#8a6d4a" ${SW(1.2)}/></g>`;
    case 'case':
      return `<g transform="translate(14 -13)"><path d="M-3.5 -6 v-3.5 h7 v3.5" fill="none" ${SW(1.3)}/>` +
             `<rect x="-8" y="-6" width="16" height="12.5" rx="1.8" fill="#c0262d" ${SW(1.3)}/>` +
             `<rect x="-8" y="-1.6" width="16" height="1.8" fill="#7e1217"/></g>`;
    case 'flowers':
      return `<g transform="translate(12 -22)"><path d="M0 8 L-1 -1" stroke="#2e7d32" stroke-width="2.2" stroke-linecap="round"/>` +
             `<circle cx="-3.2" cy="-3" r="3.3" fill="#e84a7a" ${SW(.9)}/><circle cx="3" cy="-4" r="3.3" fill="#f7c948" ${SW(.9)}/>` +
             `<circle cx="0" cy="-7.5" r="3.3" fill="#ff7b4a" ${SW(.9)}/></g>`;
    case 'dog':
      return `<g transform="translate(-25 -1)"><path d="M8 -9 Q17 -15 24 -22" stroke="#7a2a2a" stroke-width="1" fill="none"/>` +
             `<path d="M-8 -9 q-4 -4 -2 -8" stroke="${INK}" stroke-width="2.2" fill="none" stroke-linecap="round"/>` +
             `<ellipse cx="0" cy="-9" rx="8.4" ry="4.6" fill="#c88a4a" ${SW(1.2)}/>` +
             `<circle cx="8.6" cy="-12.5" r="3.7" fill="#c88a4a" ${SW(1.2)}/><path d="M10.2 -16 l1.6 -3.4 l1.2 3.6Z" fill="#8c5a28" ${SW(.8)}/>` +
             `<path d="M-4 -5 V0 M4 -5 V0" ${SW(1.8)}/></g>`;
    default: return '';
  }
}

/* c — описание человека; o.scale — масштаб */
function figureSVG(c, x = 0, y = 0, o = {}) {
  const s = Object.assign({ skin: '#f1c9a0', hair: '#3b2a1a', body: 'coat', bodyColor: '#555',
    legColor: '#35302b', hat: 'none', hatColor: '#444', item: null, flip: false }, c);
  const sc = o.scale || 1, fl = s.flip ? -1 : 1;
  let g = `<g class="fig"${o.id ? ` data-id="${o.id}"` : ''} transform="translate(${x} ${y}) scale(${fl * sc} ${sc})">`;
  g += `<ellipse cx="0" cy="1" rx="11" ry="3.2" fill="#000" opacity=".14"/>`;
  if (s.item === 'dog') g += itemSVG('dog');
  const dress = s.body === 'dress';
  const legTop = dress ? -11 : -14;
  g += `<path d="M-4 ${legTop}V-1M4 ${legTop}V-1" stroke="${INK}" stroke-width="4.6" stroke-linecap="round"/>` +
       `<path d="M-4 ${legTop}V-1M4 ${legTop}V-1" stroke="${s.legColor}" stroke-width="2.6" stroke-linecap="round"/>`;
  const bodyPath = dress
    ? 'M-7.5 -34 L-12.5 -11 H12.5 L7.5 -34 Q0 -37.5 -7.5 -34Z'
    : 'M-9 -34 Q-10.5 -22 -9 -14 H9 Q10.5 -22 9 -34 Q0 -37.5 -9 -34Z';
  g += `<path d="M-8.5 -32 L-12.5 -19M8.5 -32 L12.5 -19" stroke="${INK}" stroke-width="5.4" stroke-linecap="round"/>` +
       `<path d="M-8.5 -32 L-12.5 -19M8.5 -32 L12.5 -19" stroke="${s.bodyColor}" stroke-width="3.4" stroke-linecap="round"/>`;
  g += `<path d="${bodyPath}" fill="${s.bodyColor}" ${SW(1.4)}/>`;
  if (s.body === 'stripe') g += `<path d="M-9.6 -29H9.6M-10 -24H10M-10 -19H10" stroke="#fff" stroke-width="2.3"/>`;
  if (s.body === 'coat') g += `<path d="M0 -35V-14" stroke="#000" stroke-opacity=".25" stroke-width="1"/>`;
  g += `<circle cx="-12.6" cy="-18.6" r="1.9" fill="${s.skin}"/><circle cx="12.6" cy="-18.6" r="1.9" fill="${s.skin}"/>`;
  if (s.item && s.item !== 'dog') g += itemSVG(s.item);
  g += `<circle cx="0" cy="-43" r="7" fill="${s.skin}" ${SW(1.2)}/>`;
  if (s.hat === 'none') g += `<path d="M-7 -44 Q-6.5 -52 0 -52 Q6.5 -52 7 -44 Q4 -48.6 0 -48.4 Q-4 -48.6 -7 -44Z" fill="${s.hair}" ${SW(1)}/>`;
  g += `<circle cx="-2.4" cy="-43" r=".95" fill="${INK}"/><circle cx="2.4" cy="-43" r=".95" fill="${INK}"/>`;
  g += hatSVG(s.hat, s.hatColor);
  return g + '</g>';
}

/* Отдельные предметы на карте */
function objectSVG(type, x, y) {
  switch (type) {
    case 'cakebox':
      return `<g class="obj" transform="translate(${x} ${y})"><rect x="-15" y="-13" width="30" height="13" rx="1.5" fill="#e8c48a" ${SW(1.5)}/>` +
             `<path d="M0 -13V0M-15 -6.5H15" stroke="#d65a7a" stroke-width="2.6"/><circle cx="0" cy="-15" r="3" fill="#d65a7a" ${SW(1)}/></g>`;
    case 'wrench':
      return `<g class="obj" transform="translate(${x} ${y}) rotate(-25)"><rect x="-13" y="-2.4" width="26" height="4.8" rx="2.2" fill="#a9b2bb" ${SW(1.3)}/>` +
             `<circle cx="-13" cy="0" r="4.4" fill="#a9b2bb" ${SW(1.3)}/><circle cx="-13" cy="0" r="1.8" fill="#efe8d3"/></g>`;
    case 'fedora':
      return `<g class="obj" transform="translate(${x} ${y})"><ellipse cx="0" cy="0" rx="13" ry="4" fill="#1b1b1b" ${SW(1.3)}/>` +
             `<path d="M-7.5 -1 Q-7.5 -12 0 -12 Q7.5 -12 7.5 -1Z" fill="#1b1b1b" ${SW(1.3)}/><rect x="-7.5" y="-5" width="15" height="2.8" fill="#fff" opacity=".35"/></g>`;
    default: return '';
  }
}
