const hero  = document.getElementById('hero');
const orb   = document.getElementById('orb');
const dot   = document.getElementById('dot');
const typed = document.getElementById('typed');
const nav   = document.getElementById('nav');
const icon  = document.getElementById('icon');

/* ================= CONFIGURACIÓN ================= */
const PHRASES = [// <- edita tus frases aquí
  "Hola, soy Ariel, diseñador",
  "Branding",
  "Fotografía y video",
  "Edición"
];
const HOLD = 2600;  // ms que se queda cada frase visible
const STAGGER = 35;    // ms entre letra y letra al entrar
const START_DELAY = 900;   // ms antes de la primera frase (espera a que se abra la barra)

// Seguir el cursor: FOLLOW = qué tanto se acerca (0 a 1), MAX = límite en px
const FOLLOW_CLOSED = 0.22, MAX_CLOSED = 160;  // círculo cerrado
const FOLLOW_OPEN   = 0.05, MAX_OPEN   = 40;   // barra abierta
const EASE          = 0.08;                    // suavidad (menor = más lento y suave)
/* ================================================= */

let isOpen = false;
let timers = [];

/* ---------- Frases que cambian ---------- */
function showPhrase(index, delay){
  const text = PHRASES[index];
  typed.classList.remove('leaving');
  typed.innerHTML = '';
  typed.style.setProperty('--d', delay + 'ms');
  typed.style.setProperty('--stagger', STAGGER + 'ms');

  text.split('').forEach((ch, i) => {
    const s = document.createElement('span');
    s.className = 'char';
    s.style.setProperty('--i', i);
    s.textContent = ch;
    typed.appendChild(s);
  });

  const enterTime = delay + text.length * STAGGER + 800;

  // La navegación aparece cuando termina de entrar la primera frase
  if (index === 0){
    timers.push(setTimeout(() => nav.classList.add('show'), delay + text.length * STAGGER + 300));
  }

  // Después de HOLD: sale la frase y entra la siguiente
  timers.push(setTimeout(() => {
    typed.classList.add('leaving');
    const leaveTime = text.length * 14 + 500;
    timers.push(setTimeout(() => {
      showPhrase((index + 1) % PHRASES.length, 0);
    }, leaveTime));
  }, enterTime + HOLD));
}

/* ---------- Abrir / cerrar ---------- */
function open(){
  if (isOpen) return;
  isOpen = true;
  hero.classList.add('open');
  showPhrase(0, START_DELAY);
}

function close(){
  timers.forEach(clearTimeout);
  timers = [];
  isOpen = false;
  hero.classList.remove('open');
  nav.classList.remove('show');
  typed.classList.remove('leaving');
  typed.innerHTML = '';
}

orb.addEventListener('click', open);
icon.addEventListener('click', e => {
  if (isOpen){ e.stopPropagation(); close(); }
});

/* ---------- Seguir el cursor ---------- */
const clamp = (v, m) => Math.max(-m, Math.min(m, v));
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
let mouseX = innerWidth / 2, mouseY = innerHeight / 2;
let hasMouse = false;
let ox = 0, oy = 0, nx = 0, ny = 0;   // posiciones actuales (suavizadas)

// Escala según el tamaño de pantalla (para 4K / TVs)
let scale = 1;
function updateScale(){
  scale = parseFloat(getComputedStyle(document.documentElement).fontSize) / 16;
}
updateScale();
addEventListener('resize', updateScale);

addEventListener('pointermove', e => {
  if (e.pointerType !== 'mouse') return;   // solo con mouse
  hasMouse = true;
  mouseX = e.clientX;
  mouseY = e.clientY;
  lookDot(e.clientX, e.clientY);
});

// Si el mouse sale de la ventana, regresa al centro
document.addEventListener('mouseleave', () => {
  mouseX = innerWidth / 2;
  mouseY = innerHeight / 2;
});

// El punto de adentro mira hacia el cursor (solo con el círculo cerrado)
function lookDot(x, y){
  if (isOpen) return;
  const r  = orb.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  const a  = Math.atan2(y - cy, x - cx);
  const d  = Math.min(Math.hypot(x - cx, y - cy) / 8, 18 * scale);
  dot.style.setProperty('--dx', Math.cos(a) * d + 'px');
  dot.style.setProperty('--dy', Math.sin(a) * d + 'px');
}

function loop(){
  if (hasMouse && !reduceMotion){
    const f = isOpen ? FOLLOW_OPEN : FOLLOW_CLOSED;
    const m = (isOpen ? MAX_OPEN : MAX_CLOSED) * scale;
    const tx = clamp((mouseX - innerWidth  / 2) * f, m);
    const ty = clamp((mouseY - innerHeight / 2) * f, m);

    ox += (tx - ox) * EASE;
    oy += (ty - oy) * EASE;
    // los links se mueven la mitad, da sensación de profundidad
    nx += (tx * 0.5 - nx) * EASE;
    ny += (ty * 0.5 - ny) * EASE;

    orb.style.setProperty('--ox', ox.toFixed(2) + 'px');
    orb.style.setProperty('--oy', oy.toFixed(2) + 'px');
    nav.style.setProperty('--nx', nx.toFixed(2) + 'px');
    nav.style.setProperty('--ny', ny.toFixed(2) + 'px');
  }
  requestAnimationFrame(loop);
}
loop();