const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const $ = (id) => document.getElementById(id);

const telaInicial = $("telaInicial");
const telaFinal = $("telaFinal");

const teclas = {
  esquerda: false,
  direita: false
};

let estado = "inicio";
let camera = 0;
let pontos = 0;
let moedas = 0;
let vidas = 3;
let frame = 0;
let invencivel = 0;

const mundoLargura = 3000;
const chaoY = 430;

const gato = {
  x: 60,
  y: 350,
  w: 36,
  h: 42,
  vx: 0,
  vy: 0,
  velocidade: 4.2,
  forcaPulo: -12.5,
  noChao: false,
  olhando: 1
};

const plataformas = [
  { x: 0, y: 430, w: 650, h: 70 },
  { x: 730, y: 430, w: 470, h: 70 },
  { x: 1280, y: 430, w: 490, h: 70 },
  { x: 1850, y: 430, w: 420, h: 70 },
  { x: 2350, y: 430, w: 650, h: 70 },

  { x: 180, y: 335, w: 125, h: 20 },
  { x: 385, y: 275, w: 125, h: 20 },
  { x: 570, y: 350, w: 100, h: 20 },
  { x: 800, y: 335, w: 120, h: 20 },
  { x: 1010, y: 285, w: 120, h: 20 },
  { x: 1350, y: 340, w: 120, h: 20 },
  { x: 1530, y: 275, w: 130, h: 20 },
  { x: 1900, y: 340, w: 120, h: 20 },
  { x: 2080, y: 280, w: 120, h: 20 },
  { x: 2440, y: 335, w: 120, h: 20 },
  { x: 2630, y: 270, w: 130, h: 20 }
];

let listaMoedas = [];
let inimigos = [];

function criarFase() {
  listaMoedas = [];
  inimigos = [];

  const grupos = [
    [210, 290, 370],
    [410, 450, 490],
    [590, 625],
    [800, 850, 900],
    [1030, 1070, 1110],
    [1370, 1420, 1460],
    [1550, 1600, 1640],
    [1920, 1970],
    [2100, 2150, 2190],
    [2460, 2510, 2550],
    [2660, 2710, 2750],
    [2820, 2880, 2940]
  ];

  grupos.forEach((grupo, i) => {
    grupo.forEach((x, j) => {
      listaMoedas.push({
        x,
        y: 225 + ((i + j) % 3) * 18,
        coletada: false
      });
    });
  });

  const posicoesInimigos = [330, 550, 880, 1130, 1420, 1690, 1990, 2200, 2500, 2800];

  inimigos = posicoesInimigos.map((x, i) => ({
    x,
    y: 394,
    w: 30,
    h: 30,
    inicio: x - 65,
    fim: x + 65,
    direcao: i % 2 === 0 ? 1 : -1,
    vivo: true
  }));
}

function reiniciar() {
  gato.x = 60;
  gato.y = 350;
  gato.vx = 0;
  gato.vy = 0;
  gato.noChao = false;
  gato.olhando = 1;

  camera = 0;
  pontos = 0;
  moedas = 0;
  vidas = 3;
  frame = 0;
  invencivel = 0;

  teclas.esquerda = false;
  teclas.direita = false;

  criarFase();
  atualizarHUD();
}

function atualizarHUD() {
  $("moedas").textContent = moedas;
  $("vidas").textContent = vidas;
  $("pontos").textContent = pontos;
}

function comecar() {
  reiniciar();
  estado = "jogando";
  telaInicial.classList.add("escondido");
  telaFinal.classList.add("escondido");
}

function terminar(venceu) {
  if (estado !== "jogando") return;

  estado = venceu ? "venceu" : "perdeu";

  $("emojiFinal").textContent = venceu ? "🏆🐱" : "😿";
  $("tituloFinal").textContent = venceu ? "FASE CONCLUÍDA!" : "FIM DE JOGO!";
  $("mensagemFinal").textContent = venceu
    ? "O gatinho chegou ao final da aventura!"
    : "Não desista! Tente novamente.";

  $("totalMoedas").textContent = moedas;
  $("totalPontos").textContent = pontos;

  telaFinal.classList.remove("escondido");
}

function pular() {
  if (estado === "jogando" && gato.noChao) {
    gato.vy = gato.forcaPulo;
    gato.noChao = false;
  }
}

$("btnJogar").addEventListener("click", comecar);
$("btnReiniciar").addEventListener("click", comecar);

window.addEventListener("keydown", (e) => {
  if (["ArrowLeft", "ArrowRight", "ArrowUp", "Space"].includes(e.code)) {
    e.preventDefault();
  }

  if (e.code === "ArrowLeft" || e.code === "KeyA") {
    teclas.esquerda = true;
  }

  if (e.code === "ArrowRight" || e.code === "KeyD") {
    teclas.direita = true;
  }

  if (
    (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") &&
    !e.repeat
  ) {
    pular();
  }

  if (e.code === "Enter" && estado !== "jogando") {
    comecar();
  }
});

window.addEventListener("keyup", (e) => {
  if (e.code === "ArrowLeft" || e.code === "KeyA") {
    teclas.esquerda = false;
  }

  if (e.code === "ArrowRight" || e.code === "KeyD") {
    teclas.direita = false;
  }
});

function configurarBotao(id, direcao) {
  const botao = $(id);

  const pressionar = (e) => {
    e.preventDefault();

    if (direcao === "pular") {
      pular();
    } else {
      teclas[direcao] = true;
    }
  };

  const soltar = (e) => {
    e.preventDefault();

    if (direcao !== "pular") {
      teclas[direcao] = false;
    }
  };

  botao.addEventListener("pointerdown", pressionar);
  botao.addEventListener("pointerup", soltar);
  botao.addEventListener("pointercancel", soltar);
  botao.addEventListener("lostpointercapture", soltar);
  botao.addEventListener("contextmenu", (e) => e.preventDefault());
}

configurarBotao("esquerda", "esquerda");
configurarBotao("direita", "direita");
configurarBotao("pular", "pular");

function colidiu(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function atualizar() {
  if (estado !== "jogando") return;

  frame++;

  if (invencivel > 0) invencivel--;

  gato.vx = 0;

  if (teclas.esquerda) {
    gato.vx = -gato.velocidade;
    gato.olhando = -1;
  }

  if (teclas.direita) {
    gato.vx = gato.velocidade;
    gato.olhando = 1;
  }

  gato.x += gato.vx;
  gato.x = Math.max(0, Math.min(mundoLargura - gato.w, gato.x));

  const yAnterior = gato.y;

  gato.vy += 0.55;
  gato.vy = Math.min(gato.vy, 13);
  gato.y += gato.vy;

  gato.noChao = false;

  for (const p of plataformas) {
    const sobreHorizontal =
      gato.x + gato.w > p.x &&
      gato.x < p.x + p.w;

    const estavaAcima =
      yAnterior + gato.h <= p.y + 5;

    const atravessouTopo =
      gato.y + gato.h >= p.y;

    if (
      sobreHorizontal &&
      estavaAcima &&
      atravessouTopo &&
      gato.vy >= 0
    ) {
      gato.y = p.y - gato.h;
      gato.vy = 0;
      gato.noChao = true;
    }
  }

  // Coletar moedas
  for (const moeda of listaMoedas) {
    if (moeda.coletada) continue;

    const caixaMoeda = {
      x: moeda.x - 10,
      y: moeda.y - 10,
      w: 20,
      h: 20
    };

    if (colidiu(gato, caixaMoeda)) {
      moeda.coletada = true;
      moedas++;
      pontos += 10;
      atualizarHUD();
    }
  }

  // Movimentar e enfrentar inimigos
  for (const inimigo of inimigos) {
    if (!inimigo.vivo) continue;

    inimigo.x += inimigo.direcao * 1.1;

    if (inimigo.x < inimigo.inicio || inimigo.x > inimigo.fim) {
      inimigo.direcao *= -1;
    }

    if (invencivel > 0 || !colidiu(gato, inimigo)) continue;

    const caiuSobreInimigo =
      gato.vy > 0 &&
      yAnterior + gato.h <= inimigo.y + 10;

    if (caiuSobreInimigo) {
      inimigo.vivo = false;
      gato.y = inimigo.y - gato.h;
      gato.vy = -8;
      pontos += 20;
      atualizarHUD();
    } else {
      vidas--;
      invencivel = 100;
      atualizarHUD();

      gato.vx = 0;
      gato.vy = -7;
      gato.x = Math.max(0, gato.x - gato.olhando * 35);

      if (vidas <= 0) {
        terminar(false);
        return;
      }
    }
  }

  // Cair fora do cenário
  if (gato.y > canvas.height + 100) {
    vidas--;
    atualizarHUD();

    if (vidas <= 0) {
      terminar(false);
      return;
    }

    gato.x = Math.max(30, gato.x - 100);
    gato.y = 250;
    gato.vy = 0;
    invencivel = 100;
  }

  camera = Math.max(
    0,
    Math.min(mundoLargura - canvas.width, gato.x - 300)
  );

  // Chegar ao final da fase
  if (gato.x + gato.w >= mundoLargura - 40) {
    terminar(true);
  }
}

function desenharNuvem(x, y, escala = 1) {
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(x, y, 18 * escala, 0, Math.PI * 2);
  ctx.arc(x + 23 * escala, y - 12 * escala, 24 * escala, 0, Math.PI * 2);
  ctx.arc(x + 48 * escala, y, 18 * escala, 0, Math.PI * 2);
  ctx.fill();
}

function desenharFundo() {
  const ceu = ctx.createLinearGradient(0, 0, 0, 500);
  ceu.addColorStop(0, "#55cfff");
  ceu.addColorStop(1, "#b9f4ff");

  ctx.fillStyle = ceu;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Nuvens que acompanham o cenário
  for (let i = 0; i < 9; i++) {
    const x = ((i * 240 - camera * 0.25) % 1150 + 1150) % 1150 - 100;
    desenharNuvem(x, 65 + (i % 3) * 45, 0.8);
  }

  // Montanhas distantes
  ctx.fillStyle = "#76dca0";

  for (let i = 0; i < 10; i++) {
    const x = i * 190 - (camera * 0.45) % 190;

    ctx.beginPath();
    ctx.moveTo(x - 60, 430);
    ctx.lineTo(x + 75, 220 + (i % 3) * 40);
    ctx.lineTo(x + 210, 430);
    ctx.fill();
  }

  // Arbustos
  for (let i = 0; i < 18; i++) {
    const x = i * 190 - camera * 0.75;

    ctx.fillStyle = "#32b95d";
    ctx.beginPath();
    ctx.arc(x + 25, 415, 28, Math.PI, 0);
    ctx.arc(x + 55, 415, 22, Math.PI, 0);
    ctx.fill();
  }
}

function desenharChao() {
  for (const p of plataformas) {
    const x = p.x - camera;

    if (x > canvas.width || x + p.w < 0) continue;

    ctx.fillStyle = "#a75b32";
    ctx.fillRect(x, p.y, p.w, p.h);

    ctx.fillStyle = "#63d642";
    ctx.fillRect(x, p.y, p.w, 12);

    ctx.fillStyle = "#318b37";

    for (let tx = x; tx < x + p.w; tx += 32) {
      ctx.fillRect(tx, p.y + 12, 16, 5);
      ctx.fillStyle = "#cf824b";
      ctx.fillRect(tx + 4, p.y + 27, 8, 8);
      ctx.fillStyle = "#318b37";
    }
  }

  // Blocos flutuantes
  for (const p of plataformas) {
    if (p.y >= 400) continue;

    const x = p.x - camera;
    if (x > canvas.width || x + p.w < 0) continue;

    ctx.fillStyle = "#e99b43";
    ctx.fillRect(x, p.y, p.w, p.h);

    ctx.strokeStyle = "#a45a2d";
    ctx.lineWidth = 3;
    ctx.strokeRect(x, p.y, p.w, p.h);

    for (let tx = x + 8; tx < x + p.w; tx += 28) {
      ctx.fillStyle = "#ffd36a";
      ctx.fillRect(tx, p.y + 5, 12, 5);
    }
  }
}

function desenharMoeda(moeda) {
  if (moeda.coletada) return;

  const x = moeda.x - camera;
  const largura = 7 + Math.abs(Math.sin(frame * 0.12)) * 5;

  ctx.fillStyle = "#f5a900";
  ctx.beginPath();
  ctx.ellipse(x, moeda.y, largura + 3, 13, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffe95b";
  ctx.beginPath();
  ctx.ellipse(x, moeda.y, largura, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#fff4a4";
  ctx.fillRect(x - 2, moeda.y - 6, 3, 12);
}

function desenharInimigo(inimigo) {
  if (!inimigo.vivo) return;

  const x = inimigo.x - camera;
  const y = inimigo.y;

  ctx.fillStyle = "#8b4bba";
  ctx.beginPath();
  ctx.ellipse(x + 15, y + 17, 16, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#fff";
  ctx.fillRect(x + 6, y + 9, 7, 9);
  ctx.fillRect(x + 17, y + 9, 7, 9);

  ctx.fillStyle = "#20203a";
  ctx.fillRect(x + 9, y + 13, 4, 5);
  ctx.fillRect(x + 19, y + 13, 4, 5);

  ctx.fillStyle = "#543075";
  ctx.fillRect(x + 2, y + 27, 10, 4);
  ctx.fillRect(x + 19, y + 27, 10, 4);
}

function desenharGato() {
  if (invencivel > 0 && Math.floor(frame / 5) % 2 === 0) return;

  const x = gato.x - camera;
  const y = gato.y;

  ctx.save();

  if (gato.olhando === -1) {
    ctx.translate(x + gato.w, 0);
    ctx.scale(-1, 1);
  } else {
    ctx.translate(x, 0);
  }

  // Cauda
  ctx.strokeStyle = "#f5a45c";
  ctx.lineWidth = 7;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(9, y + 29);
  ctx.quadraticCurveTo(-7, y + 20, 3, y + 12);
  ctx.stroke();

  // Pernas animadas
  ctx.fillStyle = "#b86b38";

  if (Math.abs(gato.vx) > 0 && gato.noChao) {
    const passo = Math.sin(frame * 0.3) * 4;
    ctx.fillRect(7, y + 31, 9, 10 + passo);
    ctx.fillRect(23, y + 31, 9, 10 - passo);
  } else {
    ctx.fillRect(7, y + 32, 9, 9);
    ctx.fillRect(23, y + 32, 9, 9);
  }

  // Corpo
  ctx.fillStyle = "#f5a45c";
  ctx.fillRect(5, y + 17, 27, 20);

  // Cabeça
  ctx.fillStyle = "#ffbd72";
  ctx.fillRect(2, y + 3, 32, 25);

  // Orelhas
  ctx.fillStyle = "#f5a45c";
  ctx.beginPath();
  ctx.moveTo(3, y + 12);
  ctx.lineTo(5, y - 5);
  ctx.lineTo(16, y + 5);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(21, y + 5);
  ctx.lineTo(32, y - 5);
  ctx.lineTo(34, y + 13);
  ctx.fill();

  // Interior das orelhas
  ctx.fillStyle = "#ff82a8";
  ctx.fillRect(7, y + 2, 4, 7);
  ctx.fillRect(26, y + 2, 4, 7);

  // Olhos
  ctx.fillStyle = "#2c2444";
  ctx.fillRect(9, y + 12, 4, 7);
  ctx.fillRect(24, y + 12, 4, 7);

  // Focinho
  ctx.fillStyle = "#fff2db";
  ctx.fillRect(11, y + 19, 13, 7);

  ctx.fillStyle = "#ff75a0";
  ctx.fillRect(16, y + 19, 4, 3);

  // Bigodes
  ctx.strokeStyle = "#6c452f";
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  ctx.moveTo(11, y + 22);
  ctx.lineTo(1, y + 20);
  ctx.moveTo(11, y + 25);
  ctx.lineTo(2, y + 27);
  ctx.moveTo(24, y + 22);
  ctx.lineTo(34, y + 20);
  ctx.moveTo(24, y + 25);
  ctx.lineTo(34, y + 27);
  ctx.stroke();

  // Barriguinha
  ctx.fillStyle = "#fff0d1";
  ctx.fillRect(13, y + 29, 12, 7);

  ctx.restore();
}

function desenharBandeira() {
  const x = mundoLargura - 65 - camera;

  ctx.fillStyle = "#fff";
  ctx.fillRect(x, 265, 7, 165);

  ctx.fillStyle = "#ff4e83";
  ctx.fillRect(x + 7, 270, 55, 35);

  ctx.fillStyle = "#fff";
  ctx.font = "22px sans-serif";
  ctx.fillText("★", x + 22, 296);

  ctx.fillStyle = "#f4b932";
  ctx.fillRect(x - 10, 425, 30, 10);
}

function desenhar() {
  desenharFundo();
  desenharChao();

  for (const moeda of listaMoedas) {
    desenharMoeda(moeda);
  }

  for (const inimigo of inimigos) {
    desenharInimigo(inimigo);
  }

  desenharBandeira();
  desenharGato();

  // Indicador de chegada
  ctx.fillStyle = "#fff";
  ctx.font = "12px monospace";
  ctx.fillText("CHEGADA ➜", mundoLargura - 125 - camera, 245);
}

function loop() {
  atualizar();
  desenhar();
  requestAnimationFrame(loop);
}

criarFase();
atualizarHUD();
loop();