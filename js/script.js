const hero  = document.getElementById('hero');
const orb   = document.getElementById('orb');
const dot   = document.getElementById('dot');
const typed = document.getElementById('typed');
const nav   = document.getElementById('nav');
const icon  = document.getElementById('icon');

const TEXT = "Ariel Aguilar — Diseñador y Productor Multimedia"; // <- edita aquí
let isOpen = false;
let timers = [];

// El punto sigue el cursor mientras el círculo está cerrado
function look(x, y){
  if (isOpen) return;
  const r  = orb.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  const a  = Math.atan2(y - cy, x - cx);
  const d  = Math.min(Math.hypot(x - cx, y - cy) / 6, 30);
  dot.style.setProperty('--dx', Math.cos(a) * d + 'px');
  dot.style.setProperty('--dy', Math.sin(a) * d + 'px');
}
addEventListener('pointermove', e => look(e.clientX, e.clientY));

// Efecto de escritura
function type(i = 0){
  typed.textContent = TEXT.slice(0, i);
  if (i < TEXT.length){
    timers.push(setTimeout(() => type(i + 1), 45));
  } else {
    timers.push(setTimeout(() => nav.classList.add('show'), 200));
  }
}

// Abrir: círculo -> barra
function open(){
  if (isOpen) return;
  isOpen = true;
  hero.classList.add('open');
  timers.push(setTimeout(() => type(), 900));
}

// Cerrar: barra -> círculo (para repetir la animación)
function close(){
  timers.forEach(clearTimeout);
  timers = [];
  isOpen = false;
  hero.classList.remove('open');
  nav.classList.remove('show');
  typed.textContent = '';
}

orb.addEventListener('click', open);
orb.addEventListener('pointerenter', () => {
  if (!isOpen) timers.push(setTimeout(open, 600));
});
icon.addEventListener('click', e => {
  if (isOpen){
    e.stopPropagation();
    close();
    setTimeout(open, 1200);
  }
});

// Se abre solo si no interactúas
setTimeout(open, 2800);