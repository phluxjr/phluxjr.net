(function() {
  var COOKIE_NAME = "phluxjr_arcade";
  var consentAsked = false;
  var consentGiven = null;
 
  function readCookie(name) {
    var m = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return m ? decodeURIComponent(m[2]) : null;
  }
 
  function writeCookie(name, value, days) {
    var d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = name + "=" + encodeURIComponent(value) + ";expires=" + d.toUTCString() + ";path=/";
  }
 
  function loadState() {
    var raw = readCookie(COOKIE_NAME);
    if (!raw) return {};
    try { return JSON.parse(raw); } catch (e) { return {}; }
  }
 
  function saveState(state) {
    if (consentGiven !== true) return;
    writeCookie(COOKIE_NAME, JSON.stringify(state), 365);
  }
 
  var state = loadState();
 
  var tabs = document.querySelectorAll('.tab');
  var panels = {
    "2560": document.getElementById('panel2560'),
    "snake": document.getElementById('panelSnake'),
    "ttt": document.getElementById('panelTTT'),
    "breakout": document.getElementById('panelBreakout'),
    "memory": document.getElementById('panelMemory')
  };
  tabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      tabs.forEach(function(t) { t.classList.remove('active'); });
      Object.values(panels).forEach(function(p) { p.classList.remove('active'); });
      tab.classList.add('active');
      panels[tab.dataset.tab].classList.add('active');
    });
  });
 
  // ================= 2560 =================
  var SIZE = 5;
  var TARGET = 2560;
  var grid2560, score2560, best2560, gameOver2560;
  var board2560El = document.getElementById('board2560');
  var scoreEl = document.getElementById('score2560');
  var bestEl = document.getElementById('best2560');
  var msgEl = document.getElementById('msg2560');
  var cellEls2560 = [];
 
  function newGame2560(fromState) {
    if (fromState && state.grid2560) {
      grid2560 = state.grid2560;
      score2560 = state.score2560 || 0;
      gameOver2560 = state.gameOver2560 || false;
    } else {
      grid2560 = [];
      for (var i = 0; i < SIZE; i++) grid2560.push(new Array(SIZE).fill(0));
      score2560 = 0;
      gameOver2560 = false;
      addTile2560();
      addTile2560();
    }
    best2560 = state.best2560 || 0;
    buildBoard2560();
    render2560([], []);
  }
 
  function buildBoard2560() {
    board2560El.innerHTML = '';
    cellEls2560 = [];
    for (var i = 0; i < SIZE * SIZE; i++) {
      var c = document.createElement('div');
      c.className = 'cell';
      board2560El.appendChild(c);
      cellEls2560.push(c);
    }
  }
 
  function addTile2560() {
    var empty = [];
    for (var r = 0; r < SIZE; r++) {
      for (var c = 0; c < SIZE; c++) {
        if (grid2560[r][c] === 0) empty.push([r, c]);
      }
    }
    if (empty.length === 0) return null;
    var pick = empty[Math.floor(Math.random() * empty.length)];
    grid2560[pick[0]][pick[1]] = Math.random() < 0.9 ? 2 : 4;
    return pick[0] * SIZE + pick[1];
  }
 
  function render2560(mergedIdx, spawnIdx) {
    for (var r = 0; r < SIZE; r++) {
      for (var c = 0; c < SIZE; c++) {
        var idx = r * SIZE + c;
        var el = cellEls2560[idx];
        var v = grid2560[r][c];
        el.className = 'cell';
        if (v) {
          el.textContent = v;
          el.setAttribute('data-v', v);
        } else {
          el.textContent = '';
          el.removeAttribute('data-v');
        }
        if (mergedIdx.indexOf(idx) !== -1) {
          void el.offsetWidth;
          el.classList.add('pop');
        }
        if (spawnIdx.indexOf(idx) !== -1) {
          void el.offsetWidth;
          el.classList.add('spawn');
        }
      }
    }
    scoreEl.textContent = score2560;
    if (score2560 > best2560) best2560 = score2560;
    bestEl.textContent = best2560;
    msgEl.textContent = gameOver2560 ? "game over, press new game" : "";
    persist2560();
  }
 
  function persist2560() {
    state.grid2560 = grid2560;
    state.score2560 = score2560;
    state.best2560 = best2560;
    state.gameOver2560 = gameOver2560;
    saveState(state);
  }
 
  function slideLine(line, baseIdx, step) {
    var vals = [];
    var origIdx = [];
    for (var i = 0; i < line.length; i++) {
      if (line[i] !== 0) { vals.push(line[i]); origIdx.push(i); }
    }
    var merged = [];
    var mergedFlags = [];
    var gained = 0;
    for (var i = 0; i < vals.length; i++) {
      if (vals[i] === vals[i + 1]) {
        var newVal = vals[i] * 2;
        merged.push(newVal);
        mergedFlags.push(true);
        gained += newVal;
        if (newVal === TARGET) msgEl.textContent = "you hit " + TARGET + "! keep going or start fresh";
        i++;
      } else {
        merged.push(vals[i]);
        mergedFlags.push(false);
      }
    }
    while (merged.length < line.length) { merged.push(0); mergedFlags.push(false); }
    return { line: merged, gained: gained, flags: mergedFlags };
  }
 
  function move2560(dir) {
    if (gameOver2560) return;
    var moved = false;
    var totalGain = 0;
    var mergedIdx = [];
    var r, c;
 
    if (dir === 'left' || dir === 'right') {
      for (r = 0; r < SIZE; r++) {
        var row = grid2560[r].slice();
        if (dir === 'right') row.reverse();
        var result = slideLine(row);
        if (dir === 'right') { result.line.reverse(); result.flags.reverse(); }
        if (result.line.join(',') !== grid2560[r].join(',')) moved = true;
        grid2560[r] = result.line;
        totalGain += result.gained;
        for (c = 0; c < SIZE; c++) if (result.flags[c]) mergedIdx.push(r * SIZE + c);
      }
    } else {
      for (c = 0; c < SIZE; c++) {
        var col = [];
        for (r = 0; r < SIZE; r++) col.push(grid2560[r][c]);
        if (dir === 'down') col.reverse();
        var result2 = slideLine(col);
        if (dir === 'down') { result2.line.reverse(); result2.flags.reverse(); }
        for (r = 0; r < SIZE; r++) {
          if (grid2560[r][c] !== result2.line[r]) moved = true;
          grid2560[r][c] = result2.line[r];
          if (result2.flags[r]) mergedIdx.push(r * SIZE + c);
        }
        totalGain += result2.gained;
      }
    }
 
    if (moved) {
      score2560 += totalGain;
      var spawnAt = addTile2560();
      if (!hasMoves2560()) gameOver2560 = true;
      render2560(mergedIdx, spawnAt !== null ? [spawnAt] : []);
    }
  }
 
  function hasMoves2560() {
    for (var r = 0; r < SIZE; r++) {
      for (var c = 0; c < SIZE; c++) {
        if (grid2560[r][c] === 0) return true;
        if (c < SIZE - 1 && grid2560[r][c] === grid2560[r][c + 1]) return true;
        if (r < SIZE - 1 && grid2560[r][c] === grid2560[r + 1][c]) return true;
      }
    }
    return false;
  }
 
  document.getElementById('new2560').addEventListener('click', function() {
    state.grid2560 = null;
    newGame2560(false);
  });
 
  // ================= snake =================
  var GRID = 20;
  var snake, direction, nextDirection, food, scoreSnake, bestSnake, gameOverSnake, snakeTimer;
  var boardSnakeEl = document.getElementById('boardSnake');
  var scoreSnakeEl = document.getElementById('scoreSnake');
  var bestSnakeEl = document.getElementById('bestSnake');
  var msgSnakeEl = document.getElementById('msgSnake');
  var snakeCells = [];
 
  function buildSnakeGrid() {
    boardSnakeEl.innerHTML = '';
    snakeCells = [];
    for (var i = 0; i < GRID * GRID; i++) {
      var c = document.createElement('div');
      c.className = 'scell';
      boardSnakeEl.appendChild(c);
      snakeCells.push(c);
    }
  }
 
  function newGameSnake(fromState) {
    buildSnakeGrid();
    if (fromState && state.snake) {
      snake = state.snake;
      direction = state.direction || 'right';
      nextDirection = direction;
      food = state.food || randomFood();
      scoreSnake = state.scoreSnake || 0;
      gameOverSnake = state.gameOverSnake || false;
    } else {
      snake = [[10, 10], [10, 9], [10, 8]];
      direction = 'right';
      nextDirection = 'right';
      food = randomFood();
      scoreSnake = 0;
      gameOverSnake = false;
    }
    bestSnake = state.bestSnake || 0;
    renderSnake();
    if (snakeTimer) clearInterval(snakeTimer);
    if (!gameOverSnake) snakeTimer = setInterval(tickSnake, 130);
  }
 
  function randomFood() {
    var pos;
    do {
      pos = [Math.floor(Math.random() * GRID), Math.floor(Math.random() * GRID)];
    } while (snake && snake.some(function(s) { return s[0] === pos[0] && s[1] === pos[1]; }));
    return pos;
  }
 
  function tickSnake() {
    if (gameOverSnake) return;
    direction = nextDirection;
    var head = snake[0].slice();
    if (direction === 'up') head[0]--;
    if (direction === 'down') head[0]++;
    if (direction === 'left') head[1]--;
    if (direction === 'right') head[1]++;
 
    if (head[0] < 0 || head[0] >= GRID || head[1] < 0 || head[1] >= GRID ||
        snake.some(function(s) { return s[0] === head[0] && s[1] === head[1]; })) {
      gameOverSnake = true;
      clearInterval(snakeTimer);
      msgSnakeEl.textContent = "game over, press new game";
      persistSnake();
      return;
    }
 
    snake.unshift(head);
    if (head[0] === food[0] && head[1] === food[1]) {
      scoreSnake += 10;
      food = randomFood();
    } else {
      snake.pop();
    }
    renderSnake();
  }
 
  function renderSnake() {
    snakeCells.forEach(function(c) { c.className = 'scell'; });
    snake.forEach(function(s) {
      var idx = s[0] * GRID + s[1];
      if (snakeCells[idx]) snakeCells[idx].className = 'scell snake';
    });
    var fidx = food[0] * GRID + food[1];
    if (snakeCells[fidx]) snakeCells[fidx].className = 'scell food';
 
    scoreSnakeEl.textContent = scoreSnake;
    if (scoreSnake > bestSnake) bestSnake = scoreSnake;
    bestSnakeEl.textContent = bestSnake;
    persistSnake();
  }
 
  function persistSnake() {
    state.snake = snake;
    state.direction = direction;
    state.food = food;
    state.scoreSnake = scoreSnake;
    state.bestSnake = bestSnake;
    state.gameOverSnake = gameOverSnake;
    saveState(state);
  }
 
  document.getElementById('newSnake').addEventListener('click', function() {
    state.snake = null;
    newGameSnake(false);
  });
 
  // ================= tic tac toe =================
  var boardTTTEl = document.getElementById('boardTTT');
  var msgTTTEl = document.getElementById('msgTTT');
  var tttCells, tttOver;
  var tttX = 0, tttO = 0, tttT = 0;
 
  function buildTTT() {
    boardTTTEl.innerHTML = '';
    tttCells = new Array(9).fill(null);
    tttOver = false;
    msgTTTEl.textContent = 'your move';
    for (var i = 0; i < 9; i++) {
      var c = document.createElement('div');
      c.className = 'tcell';
      c.dataset.i = i;
      c.addEventListener('click', tttClick);
      boardTTTEl.appendChild(c);
    }
  }
 
  function newGameTTT(fromState) {
    if (fromState) {
      tttX = state.tttX || 0;
      tttO = state.tttO || 0;
      tttT = state.tttT || 0;
    }
    document.getElementById('scoreTTTx').textContent = tttX;
    document.getElementById('scoreTTTo').textContent = tttO;
    document.getElementById('scoreTTTt').textContent = tttT;
    buildTTT();
    persistTTT();
  }
 
  var TTT_LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
 
  function tttWinner(cells) {
    for (var i = 0; i < TTT_LINES.length; i++) {
      var l = TTT_LINES[i];
      if (cells[l[0]] && cells[l[0]] === cells[l[1]] && cells[l[1]] === cells[l[2]]) return cells[l[0]];
    }
    if (cells.every(function(c) { return c; })) return 'tie';
    return null;
  }
 
  function tttClick(e) {
    if (tttOver) return;
    var i = parseInt(e.target.dataset.i, 10);
    if (tttCells[i]) return;
    tttCells[i] = 'x';
    renderTTT();
    var w = tttWinner(tttCells);
    if (w) { finishTTT(w); return; }
    setTimeout(cpuMoveTTT, 300);
  }
 
  function cpuMoveTTT() {
    if (tttOver) return;
    var empties = [];
    for (var i = 0; i < 9; i++) if (!tttCells[i]) empties.push(i);
    if (empties.length === 0) return;
    var pick = empties[Math.floor(Math.random() * empties.length)];
    for (var i = 0; i < TTT_LINES.length; i++) {
      var l = TTT_LINES[i];
      var vals = [tttCells[l[0]], tttCells[l[1]], tttCells[l[2]]];
      var oCount = vals.filter(function(v){return v==='o';}).length;
      var empty = vals.filter(function(v){return !v;}).length;
      if (oCount === 2 && empty === 1) {
        pick = l[vals.indexOf(null)];
        break;
      }
    }
    tttCells[pick] = 'o';
    renderTTT();
    var w = tttWinner(tttCells);
    if (w) finishTTT(w);
  }
 
  function renderTTT() {
    var els = boardTTTEl.children;
    for (var i = 0; i < 9; i++) {
      els[i].textContent = tttCells[i] ? tttCells[i] : '';
      els[i].className = 'tcell' + (tttCells[i] === 'x' ? ' x' : tttCells[i] === 'o' ? ' o' : '');
    }
  }
 
  function finishTTT(w) {
    tttOver = true;
    if (w === 'x') { tttX++; msgTTTEl.textContent = 'you win'; }
    else if (w === 'o') { tttO++; msgTTTEl.textContent = 'cpu wins'; }
    else { tttT++; msgTTTEl.textContent = "it's a tie"; }
    document.getElementById('scoreTTTx').textContent = tttX;
    document.getElementById('scoreTTTo').textContent = tttO;
    document.getElementById('scoreTTTt').textContent = tttT;
    persistTTT();
  }
 
  function persistTTT() {
    state.tttX = tttX;
    state.tttO = tttO;
    state.tttT = tttT;
    saveState(state);
  }
 
  document.getElementById('newTTT').addEventListener('click', function() { buildTTT(); });
 
  // ================= breakout =================
  var canvasB = document.getElementById('canvasBreakout');
  var ctxB = canvasB.getContext('2d');
  var msgBreakoutEl = document.getElementById('msgBreakout');
  var bW = 360, bH = 360;
  var paddle, ball, bricks, scoreBreakout, bestBreakout, breakoutTimer, breakoutRunning;
 
  function initBreakoutState() {
    paddle = { w: 70, h: 10, x: bW / 2 - 35, y: bH - 20, speed: 6 };
    ball = { x: bW / 2, y: bH - 30, r: 6, dx: 3, dy: -3 };
    bricks = [];
    var rows = 4, cols = 8;
    var bw = bW / cols;
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        bricks.push({ x: c * bw, y: r * 18 + 20, w: bw - 4, h: 14, alive: true });
      }
    }
    scoreBreakout = 0;
    breakoutRunning = true;
    msgBreakoutEl.textContent = '';
  }
 
  function newGameBreakout() {
    initBreakoutState();
    bestBreakout = state.bestBreakout || 0;
    document.getElementById('bestBreakout').textContent = bestBreakout;
    document.getElementById('scoreBreakout').textContent = scoreBreakout;
    if (breakoutTimer) clearInterval(breakoutTimer);
    breakoutTimer = setInterval(breakoutTick, 16);
  }
 
  var leftDown = false, rightDown = false;
 
  document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') leftDown = true;
    if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') rightDown = true;
  });
  document.addEventListener('keyup', function(e) {
    if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') leftDown = false;
    if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') rightDown = false;
  });
  canvasB.addEventListener('mousemove', function(e) {
    var rect = canvasB.getBoundingClientRect();
    var scale = bW / rect.width;
    var x = (e.clientX - rect.left) * scale;
    paddle.x = Math.max(0, Math.min(bW - paddle.w, x - paddle.w / 2));
  });
 
  function breakoutTick() {
    if (!breakoutRunning) return;
    if (leftDown) paddle.x = Math.max(0, paddle.x - paddle.speed);
    if (rightDown) paddle.x = Math.min(bW - paddle.w, paddle.x + paddle.speed);
 
    ball.x += ball.dx;
    ball.y += ball.dy;
 
    if (ball.x - ball.r < 0 || ball.x + ball.r > bW) ball.dx *= -1;
    if (ball.y - ball.r < 0) ball.dy *= -1;
 
    if (ball.y + ball.r > paddle.y && ball.y + ball.r < paddle.y + paddle.h &&
        ball.x > paddle.x && ball.x < paddle.x + paddle.w) {
      ball.dy = -Math.abs(ball.dy);
      var hitPos = (ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2);
      ball.dx = hitPos * 4;
    }
 
    if (ball.y - ball.r > bH) {
      breakoutRunning = false;
      clearInterval(breakoutTimer);
      msgBreakoutEl.textContent = 'game over, press new game';
      if (scoreBreakout > bestBreakout) bestBreakout = scoreBreakout;
      document.getElementById('bestBreakout').textContent = bestBreakout;
      persistBreakout();
      return;
    }
 
    bricks.forEach(function(b) {
      if (!b.alive) return;
      if (ball.x > b.x && ball.x < b.x + b.w && ball.y - ball.r < b.y + b.h && ball.y + ball.r > b.y) {
        b.alive = false;
        ball.dy *= -1;
        scoreBreakout += 10;
      }
    });
 
    if (bricks.every(function(b) { return !b.alive; })) {
      breakoutRunning = false;
      clearInterval(breakoutTimer);
      msgBreakoutEl.textContent = 'you cleared it, press new game';
      if (scoreBreakout > bestBreakout) bestBreakout = scoreBreakout;
      document.getElementById('bestBreakout').textContent = bestBreakout;
      persistBreakout();
    }
 
    document.getElementById('scoreBreakout').textContent = scoreBreakout;
    drawBreakout();
  }
 
  function drawBreakout() {
    ctxB.clearRect(0, 0, bW, bH);
    ctxB.fillStyle = '#585b70';
    ctxB.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);
    ctxB.fillStyle = '#f9e2af';
    ctxB.beginPath();
    ctxB.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctxB.fill();
    bricks.forEach(function(b) {
      if (!b.alive) return;
      ctxB.fillStyle = '#89b4fa';
      ctxB.fillRect(b.x, b.y, b.w, b.h);
    });
  }
 
  function persistBreakout() {
    state.bestBreakout = bestBreakout;
    saveState(state);
  }
 
  document.getElementById('newBreakout').addEventListener('click', newGameBreakout);
 
  // ================= memory =================
  var boardMemoryEl = document.getElementById('boardMemory');
  var msgMemoryEl = document.getElementById('msgMemory');
  var memCards, memFlipped, memMoves, memMatched, memBest, memLock;
  var MEM_SYMBOLS = ['*', '#', '@', '%', '&', '+', '=', '~'];
 
  function newGameMemory() {
    var pairs = MEM_SYMBOLS.concat(MEM_SYMBOLS);
    for (var i = pairs.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = pairs[i]; pairs[i] = pairs[j]; pairs[j] = tmp;
    }
    memCards = pairs;
    memFlipped = [];
    memMoves = 0;
    memMatched = 0;
    memLock = false;
    memBest = state.memBest || null;
    document.getElementById('movesMemory').textContent = memMoves;
    document.getElementById('bestMemory').textContent = memBest !== null ? memBest : '-';
    msgMemoryEl.textContent = '';
    buildMemoryBoard();
  }
 
  function buildMemoryBoard() {
    boardMemoryEl.innerHTML = '';
    memCards.forEach(function(sym, i) {
      var c = document.createElement('div');
      c.className = 'mcell';
      c.dataset.i = i;
      c.addEventListener('click', memoryClick);
      boardMemoryEl.appendChild(c);
    });
  }
 
  function memoryClick(e) {
    if (memLock) return;
    var i = parseInt(e.currentTarget.dataset.i, 10);
    if (memFlipped.indexOf(i) !== -1) return;
    var el = e.currentTarget;
    if (el.classList.contains('matched')) return;
 
    el.classList.add('flipped');
    el.textContent = memCards[i];
    memFlipped.push(i);
 
    if (memFlipped.length === 2) {
      memMoves++;
      document.getElementById('movesMemory').textContent = memMoves;
      memLock = true;
      var a = memFlipped[0], b = memFlipped[1];
      var elA = boardMemoryEl.children[a];
      var elB = boardMemoryEl.children[b];
      if (memCards[a] === memCards[b]) {
        setTimeout(function() {
          elA.classList.add('matched');
          elB.classList.add('matched');
          memMatched += 2;
          memFlipped = [];
          memLock = false;
          if (memMatched === memCards.length) {
            if (memBest === null || memMoves < memBest) {
              memBest = memMoves;
              document.getElementById('bestMemory').textContent = memBest;
              persistMemory();
            }
            msgMemoryEl.textContent = 'solved in ' + memMoves + ' moves';
          }
        }, 400);
      } else {
        setTimeout(function() {
          elA.classList.remove('flipped');
          elB.classList.remove('flipped');
          elA.textContent = '';
          elB.textContent = '';
          memFlipped = [];
          memLock = false;
        }, 700);
      }
    }
  }
 
  function persistMemory() {
    state.memBest = memBest;
    saveState(state);
  }
 
  document.getElementById('newMemory').addEventListener('click', newGameMemory);
 
  // ================= input dispatch (2560 vs breakout use arrows too) =================
  document.addEventListener('keydown', function(e) {
    var activePanel = document.querySelector('.panel.active').id;
    if (activePanel !== 'panel2560') return;
    var key = e.key.toLowerCase();
    if (key === 'arrowleft' || key === 'a') move2560('left');
    else if (key === 'arrowright' || key === 'd') move2560('right');
    else if (key === 'arrowup' || key === 'w') move2560('up');
    else if (key === 'arrowdown' || key === 's') move2560('down');
    else return;
    e.preventDefault();
  });
 
  document.addEventListener('keydown', function(e) {
    var activePanel = document.querySelector('.panel.active').id;
    if (activePanel !== 'panelSnake') return;
    var key = e.key.toLowerCase();
    if ((key === 'arrowleft' || key === 'a') && direction !== 'right') nextDirection = 'left';
    else if ((key === 'arrowright' || key === 'd') && direction !== 'left') nextDirection = 'right';
    else if ((key === 'arrowup' || key === 'w') && direction !== 'down') nextDirection = 'up';
    else if ((key === 'arrowdown' || key === 's') && direction !== 'up') nextDirection = 'down';
    else return;
    e.preventDefault();
  });
 
  // ================= consent popup =================
  var consentBox = document.getElementById('consentBox');
 
  function checkConsentCookie() {
    var c = readCookie(COOKIE_NAME);
    if (c !== null) { consentGiven = true; return true; }
    return false;
  }
 
  function showConsent() {
    if (consentAsked) return;
    consentAsked = true;
    consentBox.classList.add('show');
  }
 
  document.getElementById('consentYes').addEventListener('click', function() {
    consentGiven = true;
    consentBox.classList.remove('show');
    saveState(state);
  });
 
  document.getElementById('consentNo').addEventListener('click', function() {
    consentGiven = false;
    consentBox.classList.remove('show');
    document.cookie = COOKIE_NAME + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  });

  // ================= init =================
  var hasSave = checkConsentCookie();
  newGame2560(hasSave);
  newGameSnake(hasSave);
  newGameTTT(hasSave);
  newGameBreakout();
  newGameMemory();

  if (!hasSave && !consentAsked) {
    showConsent();
  }
})();
