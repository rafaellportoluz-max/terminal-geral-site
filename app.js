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

/* ═══════════════════════════════════════════════════════════════════════
   Botão "Abrir o Terminal Geral" — sondagem do app local (localhost:4610)
   ───────────────────────────────────────────────────────────────────────
   O Terminal Geral é um app LOCAL: só responde se `node server.mjs` estiver
   no ar. Sem isso, o link http://localhost:4610 despeja o usuário num
   ERR_CONNECTION_REFUSED do Chrome. Aqui sondamos a porta antes e, se estiver
   offline, mostramos um aviso amigável explicando como subir o servidor —
   em vez de deixar o navegador dar o erro cru.

   Detalhe técnico: esta página é servida por HTTPS (GitHub Pages), mas
   http://localhost é uma origem "potentially trustworthy", então Chrome/Edge/
   Firefox NÃO bloqueiam o fetch por mixed-content. Usamos mode:"no-cors"
   (resposta opaca) só para saber se ALGO respondeu: se resolve → app no ar;
   se rejeita (conexão recusada) ou estoura o timeout → app desligado.
   ═══════════════════════════════════════════════════════════════════════ */
(() => {
  const APP_URL = "http://localhost:4610";
  const PROBE = APP_URL + "/api/lockinfo"; // rota leve e pública (não exige PIN)
  const botoes = [...document.querySelectorAll("#abrir-app, #abrir-app-2")];
  if (!botoes.length) return;

  // último estado conhecido: null = ainda não sabemos, true/false = sondado.
  // O clique usa o último estado (não dá para await dentro do gesto sem
  // esbarrar no bloqueador de pop-up), então sondamos no load e de tempos em
  // tempos. Quando online (ou desconhecido), deixamos o link navegar normal.
  let appOnline = null;

  async function sondar(timeout = 1500) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeout);
    try {
      await fetch(PROBE, { mode: "no-cors", cache: "no-store", signal: ctrl.signal });
      return true;
    } catch {
      return false;
    } finally {
      clearTimeout(t);
    }
  }

  function pintarStatus() {
    botoes.forEach((b) => {
      let dot = b.querySelector(".app-status-dot");
      if (!dot) {
        dot = document.createElement("span");
        dot.className = "app-status-dot";
        b.appendChild(dot);
      }
      dot.dataset.estado = appOnline === true ? "on" : appOnline === false ? "off" : "";
      dot.title = appOnline === true ? "App local no ar" : appOnline === false ? "App local desligado" : "";
    });
  }

  async function checar() { appOnline = await sondar(); pintarStatus(); }

  // aviso amigável (injetado sob demanda)
  function mostrarAviso() {
    let ov = document.getElementById("aviso-local");
    if (!ov) {
      ov = document.createElement("div");
      ov.id = "aviso-local";
      ov.className = "aviso-overlay";
      ov.innerHTML = `
        <div class="aviso-card" role="dialog" aria-modal="true" aria-labelledby="aviso-tit">
          <button class="aviso-x" aria-label="Fechar">&times;</button>
          <div class="aviso-emoji">🖥️</div>
          <h3 id="aviso-tit">O Terminal Geral roda no seu computador</h3>
          <p>Ele é um app <strong>local</strong>: o site é só a apresentação. Para abrir o painel,
             o servidor Node precisa estar no ar na sua máquina.</p>
          <p class="aviso-passo">No Windows, é 1 clique:</p>
          <div class="aviso-cmd"><code class="mono">terminal-geral\\iniciar.cmd</code></div>
          <p class="aviso-passo">Ou, no terminal, dentro da pasta do projeto:</p>
          <div class="aviso-cmd">
            <code class="mono" id="aviso-code">cd terminal-geral &amp;&amp; node server.mjs</code>
            <button class="aviso-copy" type="button">Copiar</button>
          </div>
          <p class="aviso-nota">Depois de subir, é só clicar em <strong>Abrir o Terminal Geral</strong>
             de novo — ou ir direto em <a href="${APP_URL}" target="_blank" rel="noopener">localhost:4610</a>.</p>
          <div class="aviso-acoes">
            <button class="btn btn-secundario" data-fechar>Entendi</button>
            <a class="btn btn-primario" href="${APP_URL}" target="_blank" rel="noopener" data-abrir>Tentar abrir mesmo assim</a>
          </div>
        </div>`;
      document.body.appendChild(ov);
      const fechar = () => ov.classList.remove("aberto");
      ov.addEventListener("click", (e) => { if (e.target === ov) fechar(); });
      ov.querySelector(".aviso-x").addEventListener("click", fechar);
      ov.querySelector("[data-fechar]").addEventListener("click", fechar);
      ov.querySelector(".aviso-copy").addEventListener("click", async (e) => {
        try {
          await navigator.clipboard.writeText("cd terminal-geral && node server.mjs");
          e.target.textContent = "Copiado ✓";
          setTimeout(() => { e.target.textContent = "Copiar"; }, 1600);
        } catch { /* sem clipboard: ignora */ }
      });
      // re-sonda ao tentar abrir mesmo assim (pode ter subido nesse meio-tempo)
      ov.querySelector("[data-abrir]").addEventListener("click", () => setTimeout(checar, 800));
      document.addEventListener("keydown", (e) => { if (e.key === "Escape") fechar(); });
    }
    requestAnimationFrame(() => ov.classList.add("aberto"));
  }

  botoes.forEach((b) => b.addEventListener("click", (e) => {
    // só interceptamos quando SABEMOS que está offline; caso contrário deixamos
    // o link abrir normalmente (preserva o gesto do usuário / sem pop-up bloqueado).
    if (appOnline === false) { e.preventDefault(); mostrarAviso(); }
  }));

  checar();
  setInterval(checar, 8000);
})();
