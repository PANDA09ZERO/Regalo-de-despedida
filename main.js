// ==================== CONFIGURACIÓN ====================
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const speedDisplay = document.getElementById('speedDisplay');
const gridDisplay = document.getElementById('gridDisplay');

// controles móviles
const upBtn = document.getElementById('upBtn');
const downBtn = document.getElementById('downBtn');
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');

const GRID = 20;            
const COLS = canvas.width / GRID;
const ROWS = canvas.height / GRID;

let speed = 8;              
let snake = [];
let dir = {x:1,y:0};        
let nextDir = {x:1,y:0};
let food = {};
let score = 0;
let running = false;
let tickInterval = null;

// ==================== IMÁGENES ====================
const imgHead = new Image();
imgHead.src = "img/myMelody_sinfondo.png";   

const imgApple = new Image();
imgApple.src = "img/pastelito.png"; 

const imgMain = new Image();
imgMain.src = "img/pastelitomor.png";

// ==================== FUNCIONES PRINCIPALES ====================
function resetGame(){
  speed = 8;
  snake = [
    {x:Math.floor(COLS/2), y:Math.floor(ROWS/2)}, 
  ];
  dir = {x:1,y:0};
  nextDir = {x:1,y:0};
  placeFood();
  score = 0;
  updateUI();
  draw();
  stopLoop();
  running = false;
}

function startGame(){
  if(running) return;
  running = true;
  stopLoop();
  tickInterval = setInterval(tick, 1000 / speed);
}

function pauseGame(){
  running = false;
  stopLoop();
}

function stopLoop(){
  if(tickInterval) clearInterval(tickInterval);
  tickInterval = null;
}

function placeFood(){
  let valid = false;
  while(!valid){
    const fx = Math.floor(Math.random()*COLS);
    const fy = Math.floor(Math.random()*ROWS);
    valid = !snake.some(s=>s.x===fx && s.y===fy);
    if(valid){ food = {x:fx,y:fy}; }
  }
}

function tick(){
  if((nextDir.x !== -dir.x || nextDir.y !== -dir.y)) dir = nextDir;

  const head = {x: snake[0].x + dir.x, y: snake[0].y + dir.y};

  if(head.x < 0) head.x = COLS - 1;
  if(head.x >= COLS) head.x = 0;
  if(head.y < 0) head.y = ROWS - 1;
  if(head.y >= ROWS) head.y = 0;

  if(snake.some(seg=>seg.x===head.x && seg.y===head.y)){
    gameOver();
    return;
  }

  snake.unshift(head);

  if(head.x === food.x && head.y === food.y){
    score += 1;
    placeFood();
    if(score % 5 === 0){
      speed = Math.min(20, speed + 1);
      restartInterval();
    }
  } else {
    snake.pop();
  }

  updateUI();
  draw();
}

function restartInterval(){
  if(running){
    stopLoop();
    tickInterval = setInterval(tick, 1000 / speed);
  }
  speedDisplay.textContent = speed;
}

function gameOver() {
  pauseGame();

  // Si ya existe un modal anterior, lo quitamos
  const oldModal = document.querySelector('.gameover-modal');
  if (oldModal) oldModal.remove();

  // Crear contenedor
  const modal = document.createElement('div');
  modal.className = 'gameover-modal';
  modal.innerHTML = `
    <div class="gameover-box">
      <h2>💔 ¡Juego terminado!</h2>
      <p>Tu puntuación final fue: <strong>${score}</strong></p>
      <button id="restartBtn">Reiniciar</button>
    </div>
  `;
  document.body.appendChild(modal);

  // Botón de reinicio
  document.getElementById('restartBtn').addEventListener('click', () => {
    modal.classList.add('fadeOut');
    setTimeout(() => {
      modal.remove();
      resetGame();
      startGame();
    }, 400);
  });
}


function updateUI(){
  scoreEl.textContent = score;
  speedDisplay.textContent = speed;
  gridDisplay.textContent = GRID;
}

// dificultad manual
const difficultySelect = document.getElementById('difficulty');
difficultySelect.addEventListener('change', () => {
  speed = parseInt(difficultySelect.value);
  restartInterval();
  speedDisplay.textContent = speed;
});

// ==================== DIBUJO ====================
function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  ctx.fillStyle = '#ffe6f055'; // fondo suave con tu paleta
  ctx.fillRect(0,0,canvas.width,canvas.height);

  ctx.drawImage(imgApple, food.x * GRID, food.y * GRID, GRID, GRID);

  for(let i=0;i<snake.length;i++){
    const s = snake[i];
    if(i===0){
      ctx.drawImage(imgHead, s.x * GRID, s.y * GRID, GRID, GRID);
    } else {
      ctx.drawImage(imgMain, s.x * GRID, s.y * GRID, GRID, GRID);
    }
  }
}

// ==================== CONTROLES ====================
window.addEventListener('keydown', e => {
  const k = e.key;
  if(k === 'ArrowUp' || k === 'w'){ nextDir = {x:0,y:-1}; }
  if(k === 'ArrowDown' || k === 's'){ nextDir = {x:0,y:1}; }
  if(k === 'ArrowLeft' || k === 'a'){ nextDir = {x:-1,y:0}; }
  if(k === 'ArrowRight' || k === 'd'){ nextDir = {x:1,y:0}; }
  if(k === ' '){ if(running) pauseGame(); else startGame(); }
});

// botones UI
startBtn.addEventListener('click', () => startGame());
pauseBtn.addEventListener('click', () => pauseGame());
resetBtn.addEventListener('click', () => resetGame());

// botones móviles
if(upBtn && downBtn && leftBtn && rightBtn){
  upBtn.addEventListener('click', ()=> nextDir = {x:0,y:-1});
  downBtn.addEventListener('click', ()=> nextDir = {x:0,y:1});
  leftBtn.addEventListener('click', ()=> nextDir = {x:-1,y:0});
  rightBtn.addEventListener('click', ()=> nextDir = {x:1,y:0});
}

// swipe en móvil
let touchStart = null;
canvas.addEventListener('touchstart', e=>{
  const t = e.touches[0];
  touchStart = {x:t.clientX, y:t.clientY};
});
canvas.addEventListener('touchend', e=>{
  if(!touchStart) return;
  const t = e.changedTouches[0];
  const dx = t.clientX - touchStart.x;
  const dy = t.clientY - touchStart.y;
  if(Math.abs(dx) > Math.abs(dy)){
    if(dx > 10) nextDir = {x:1,y:0}; 
    else if(dx < -10) nextDir = {x:-1,y:0};
  } else {
    if(dy > 10) nextDir = {x:0,y:1}; 
    else if(dy < -10) nextDir = {x:0,y:-1};
  }
  touchStart = null;
});

// teclas +/- para velocidad
window.addEventListener('keydown', e=>{
  if(e.key === '+'){ speed = Math.min(30, speed + 1); restartInterval(); }
  if(e.key === '-'){ speed = Math.max(2, speed - 1); restartInterval(); }
});

// ==================== ORIENTACIÓN ====================
// Detectar si el celular está en vertical y pedir que se gire
function checkOrientation(){
  if(window.innerHeight > window.innerWidth){
    alert("📱 Por favor gira el celular en horizontal para jugar mejor.");
  }
}
window.addEventListener("resize", checkOrientation);
window.addEventListener("orientationchange", checkOrientation);

// inicio
resetGame();
checkOrientation();
