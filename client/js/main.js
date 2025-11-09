// client/js/main.js
const socket = io();

// === USER + ROOM ===
const username = localStorage.getItem('username') || `User${Math.floor(Math.random() * 1000)}`;
const room = localStorage.getItem('room') || 'main';
socket.emit('joinRoom', room);
socket.emit('newUser', username);

const roomLabel = document.getElementById('roomLabel');
const statusEl = document.getElementById('status');
roomLabel.textContent = `Room: ${room}`;

// === CANVAS SETUP ===
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  const headerH = document.querySelector('nav').offsetHeight;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - headerH;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// === DRAWING STATE ===
let drawing = false;
let tool = 'brush';
let color = '#000000';
let lineWidth = 4;

const strokes = [];
const undone = [];
let currentStroke = null;

// === TOOLBAR ===
document.getElementById('brushBtn').onclick = () => tool = 'brush';
document.getElementById('eraserBtn').onclick = () => tool = 'eraser';
document.getElementById('colorPicker').oninput = e => color = e.target.value;
document.getElementById('widthRange').oninput = e => lineWidth = parseInt(e.target.value);

document.getElementById('undoBtn').onclick = () => {
  if (!strokes.length) return;
  undone.push(strokes.pop());
  redrawAll();
  socket.emit('undo');
};

document.getElementById('redoBtn').onclick = () => {
  if (!undone.length) return;
  strokes.push(undone.pop());
  redrawAll();
  socket.emit('redo');
};

document.getElementById('clearBtn').onclick = () => {
  strokes.length = 0;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  socket.emit('clear');
};

document.getElementById('saveBtn').onclick = () => socket.emit('saveCanvas', canvas.toDataURL());
document.getElementById('loadBtn').onclick = () => socket.emit('loadCanvas');
document.getElementById('downloadBtn').onclick = () => {
  const link = document.createElement('a');
  link.download = `canvas_${room}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
};

// === DRAWING HANDLERS ===
function getPos(e) {
  const rect = canvas.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

canvas.addEventListener('mousedown', (e) => {
  drawing = true;
  const pos = getPos(e);
  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y);
  ctx.strokeStyle = tool === 'eraser' ? '#fff' : color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  currentStroke = { tool, color, width: lineWidth, points: [pos] };
});

canvas.addEventListener('mousemove', (e) => {
  if (!drawing) return;
  const pos = getPos(e);
  ctx.lineTo(pos.x, pos.y);
  ctx.stroke();
  currentStroke.points.push(pos);
});

canvas.addEventListener('mouseup', () => {
  if (!drawing) return;
  drawing = false;
  ctx.closePath();
  strokes.push(currentStroke);
  socket.emit('draw_point', currentStroke);
  currentStroke = null;
});

function redrawAll() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const s of strokes) {
    ctx.beginPath();
    ctx.strokeStyle = s.tool === 'eraser' ? '#fff' : s.color;
    ctx.lineWidth = s.width;
    s.points.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();
    ctx.closePath();
  }
}

// === SOCKET HANDLERS ===
socket.on('connect', () => statusEl.textContent = '🟢 Connected');
socket.on('disconnect', () => statusEl.textContent = '🔴 Disconnected');

socket.on('clear', () => {
  strokes.length = 0;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

socket.on('undo', () => {
  if (!strokes.length) return;
  undone.push(strokes.pop());
  redrawAll();
});

socket.on('redo', () => {
  if (!undone.length) return;
  strokes.push(undone.pop());
  redrawAll();
});

socket.on('draw_point', (s) => {
  strokes.push(s);
  redrawAll();
});

socket.on('loadCanvasData', (dataURL) => {
  const img = new Image();
  img.src = dataURL;
  img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
});

// === CHAT ===
const chatInput = document.getElementById('chatInput');
const chatMessages = document.getElementById('chatMessages');

chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && chatInput.value.trim()) {
    socket.emit('chatMessage', chatInput.value.trim());
    chatInput.value = '';
  }
});

socket.on('chatMessage', (m) => {
  const div = document.createElement('div');
  div.textContent = `${m.user}: ${m.text}`;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// === USER LIST ===
socket.on('userList', (list) => {
  const ul = document.getElementById('usersList');
  ul.innerHTML = '';
  list.forEach((u) => {
    const li = document.createElement('li');
    li.textContent = u.name;
    ul.appendChild(li);
  });
});
