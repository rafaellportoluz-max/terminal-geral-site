/* ═══════════════════════════════════════════════════════════════════════
   Terminal Geral — landing · microinterações
   ═══════════════════════════════════════════════════════════════════════ */

// —— destino do GitHub (preenchido pela skill conectar-github após publicar) ——
const GITHUB_URL = "https://github.com/rafaellportoluz-max/terminal-geral-site";
document.querySelectorAll('[id^="gh-link"]').forEach((a) => { a.href = GITHUB_URL; });

// —— tema (escuro ⇄ claro), persistido ——
const html = document.documentElement;
const btnTema = document.getElementById("tema-toggle");
const temaSalvo = localStorage.getItem("tg-tema");
if (temaSalvo) html.setAttribute("data-theme", temaSalvo);
const pintarBotao = () => { btnTema.textContent = html.getAttribute("data-theme") === "light" ? "☀️" : "🌙"; };
pintarBotao();
btnTema.addEventListener("click", () => {
  const novo = html.getAttribute("data-theme") === "light" ? "dark" : "light";
  html.setAttribute("data-theme", novo);
  localStorage.setItem("tg-tema", novo);
  pintarBotao();
});

// —— navbar ganha hairline ao rolar ——
const nav = document.getElementById("topnav");
const aoRolar = () => nav.classList.toggle("rolado", window.scrollY > 8);
aoRolar();
window.addEventListener("scroll", aoRolar, { passive: true });

// —— reveal on scroll ——
const io = new IntersectionObserver((entradas) => {
  entradas.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("visivel"); io.unobserve(e.target); } });
}, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

// —— máquina de escrever na command palette ——
const alvo = document.getElementById("paleta-q");
const frases = [
  "mostrar todos os PDFs de matemática",
  "abrir agente responsável pelos estudos",
  "quais projetos foram alterados hoje",
  "backup do terminal geral",
];
if (alvo && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  let fi = 0, ci = 0, apagando = false;
  const tick = () => {
    const f = frases[fi];
    if (!apagando) {
      alvo.textContent = f.slice(0, ++ci);
      if (ci === f.length) { apagando = true; return setTimeout(tick, 1700); }
    } else {
      alvo.textContent = f.slice(0, --ci);
      if (ci === 0) { apagando = false; fi = (fi + 1) % frases.length; }
    }
    setTimeout(tick, apagando ? 28 : 52);
  };
  tick();
} else if (alvo) {
  alvo.textContent = frases[0];
}
