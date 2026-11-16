'use strict';

/* ==========================================================
   Jogo da Velha — arquitetura MVC (JavaScript puro, ES2020)
   - GameModel:      estado e regras de negócio (sem DOM)
   - GameView:       renderização e eventos do DOM (sem regras)
   - GameController: conecta Model e View
   ========================================================== */
(function () {
  // As 8 combinações vencedoras: 3 linhas, 3 colunas, 2 diagonais (RF05 / RN03)
  const WIN_LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  /* ---------------------------- MODEL ---------------------------- */
  class GameModel {
    constructor() {
      this.score = { X: 0, O: 0, draws: 0 };
      this.newRound();
    }

    /** Limpa só o tabuleiro; X começa; placar intacto (RF06, RN01, RN06). */
    newRound() {
      this.board = Array(9).fill(null);
      this.current = 'X';
      this.status = 'playing'; // 'playing' | 'won' | 'draw'
      this.winner = null;
      this.winningLine = [];
    }

    /** Zera as pontuações (RF08). A confirmação é responsabilidade do Controller. */
    resetScore() {
      this.score = { X: 0, O: 0, draws: 0 };
    }

    /** Tenta registrar uma jogada e informa o resultado (RF02, RF03, RF04). */
    play(index) {
      if (!Number.isInteger(index) || index < 0 || index > 8) {
        return { ok: false, reason: 'invalid' };
      }
      if (this.status !== 'playing') {
        return { ok: false, reason: 'finished' }; // RN04: tabuleiro bloqueado
      }
      if (this.board[index] !== null) {
        return { ok: false, reason: 'occupied' }; // RN02: sem sobreposição, turno mantido
      }

      const mark = this.current;
      this.board[index] = mark;

      const line = this.findWinningLine(mark);
      if (line) {
        this.status = 'won';
        this.winner = mark;
        this.winningLine = line;
        this.score[mark] += 1;
      } else if (this.board.every((cell) => cell !== null)) {
        this.status = 'draw'; // RN05
        this.score.draws += 1;
      } else {
        this.current = mark === 'X' ? 'O' : 'X'; // RF03
      }
      return { ok: true, index, mark };
    }

    findWinningLine(mark) {
      return WIN_LINES.find((line) => line.every((i) => this.board[i] === mark)) || null;
    }

    /** Devolve uma cópia do estado, para que a View nunca altere o Model. */
    getState() {
      return {
        board: [...this.board],
        current: this.current,
        status: this.status,
        winner: this.winner,
        winningLine: [...this.winningLine],
        score: { ...this.score }
      };
    }
  }

  /* ---------------------------- VIEW ----------------------------- */
  class GameView {
    constructor() {
      this.boardEl = document.getElementById('board');
      this.statusEl = document.getElementById('status');
      this.scoreEls = {
        X: document.getElementById('score-x'),
        O: document.getElementById('score-o'),
        draws: document.getElementById('score-draws')
      };
      this.newBtn = document.getElementById('btn-new');
      this.resetBtn = document.getElementById('btn-reset');
      this.badgeX = document.getElementById('badge-x');
      this.badgeO = document.getElementById('badge-o');
      this.winLine = document.getElementById('win-line');
      this.cells = [];
      this.audioCtx = null;
      this.buildBoard();
    }

    /** RF01: cria as 9 casas como <button>, sem innerHTML. */
    buildBoard() {
      for (let i = 0; i < 9; i += 1) {
        const cell = document.createElement('button');
        cell.type = 'button';
        cell.className = 'cell cell--empty';
        cell.dataset.index = String(i);

        cell.appendChild(this.createMarks());
        this.boardEl.appendChild(cell);
        this.cells.push(cell);
      }
    }

    /** Cria (sem innerHTML) o SVG com os dois desenhos possíveis: X e O. O CSS mostra o correto. */
    createMarks() {
      const NS = 'http://www.w3.org/2000/svg';
      const make = (tag, attrs) => {
        const el = document.createElementNS(NS, tag);
        Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, String(value)));
        return el;
      };
      const svg = make('svg', { viewBox: '0 0 100 100', class: 'cell__svg', 'aria-hidden': 'true' });
      const x = make('g', { class: 'mark-x' });
      x.append(
        make('line', { x1: 24, y1: 24, x2: 76, y2: 76, pathLength: 1 }),
        make('line', { x1: 76, y1: 24, x2: 24, y2: 76, pathLength: 1 })
      );
      const o = make('circle', { class: 'mark-o', cx: 50, cy: 50, r: 28, pathLength: 1 });
      svg.append(x, o);
      return svg;
    }

    onCellActivate(handler) {
      this.boardEl.addEventListener('click', (event) => {
        const cell = event.target.closest('.cell');
        if (cell) handler(Number(cell.dataset.index));
      });
    }
    onNewGame(handler) { this.newBtn.addEventListener('click', handler); }
    onResetScore(handler) { this.resetBtn.addEventListener('click', handler); }

    /** Desenha o estado recebido. `notice` é um aviso opcional (ex.: jogada inválida). */
    render(state, notice) {
      const over = state.status !== 'playing';
      this.boardEl.dataset.turn = state.current;
      this.boardEl.classList.toggle('board--over', over);

      state.board.forEach((mark, i) => {
        const cell = this.cells[i];
        const isWin = state.winningLine.includes(i);
        cell.classList.toggle('cell--empty', mark === null);
        cell.classList.toggle('cell--x', mark === 'X');
        cell.classList.toggle('cell--o', mark === 'O');
        cell.classList.toggle('cell--win', isWin);
        cell.setAttribute('aria-disabled', String(over));
        cell.setAttribute('aria-label', this.describeCell(i, mark, isWin));
      });

      let text;
      let tone;
      if (state.status === 'won') {
        text = `Jogador ${state.winner} venceu a partida!`;
        tone = 'won';
      } else if (state.status === 'draw') {
        text = 'Partida empatada!';
        tone = 'draw';
      } else {
        text = `Vez do Jogador ${state.current}`;
        tone = state.current.toLowerCase();
      }
      this.statusEl.textContent = notice ? `${notice} ${text}` : text;
      this.statusEl.className = `status status--${tone}`;

      // Tema da página: cor do jogador da vez (ou do vencedor); cinza no empate
      document.body.dataset.theme = state.status === 'draw' ? 'draw' : state.current.toLowerCase();
      const active = state.status === 'draw' ? null : state.current;
      this.badgeX.classList.toggle('is-active', active === 'X');
      this.badgeO.classList.toggle('is-active', active === 'O');
      this.renderWinLine(state.winningLine);

      this.scoreEls.X.textContent = String(state.score.X);
      this.scoreEls.O.textContent = String(state.score.O);
      this.scoreEls.draws.textContent = String(state.score.draws);
    }

    /** Risca a trinca vencedora ligando o centro da primeira ao centro da última casa. */
    renderWinLine(line) {
      if (line.length === 0) {
        this.winLine.classList.remove('is-on');
        return;
      }
      const first = line[0];
      const last = line[2];
      this.winLine.setAttribute('x1', String((first % 3) + 0.5));
      this.winLine.setAttribute('y1', String(Math.floor(first / 3) + 0.5));
      this.winLine.setAttribute('x2', String((last % 3) + 0.5));
      this.winLine.setAttribute('y2', String(Math.floor(last / 3) + 0.5));
      this.winLine.classList.add('is-on');
    }

    describeCell(index, mark, isWin) {
      const row = Math.floor(index / 3) + 1;
      const col = (index % 3) + 1;
      let label = `Casa ${index + 1}, linha ${row}, coluna ${col}, `;
      label += mark ? `marcada com ${mark}` : 'vazia';
      if (isWin) label += ', faz parte da trinca vencedora';
      return label;
    }

    /** Alerta visual (tremor) e sonoro para jogada inválida (CT05). */
    signalInvalid(index) {
      this.animate(this.cells[index], 'shake');
      this.beep();
    }

    animate(element, className) {
      element.classList.remove(className);
      void element.offsetWidth; // reinicia a animação
      element.classList.add(className);
      element.addEventListener('animationend', () => element.classList.remove(className), { once: true });
    }

    beep() {
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;
        if (!this.audioCtx) this.audioCtx = new AudioContextClass();
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.value = 180;
        gain.gain.value = 0.05;
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.12);
      } catch (error) {
        /* Som é opcional: o aviso visual e o texto continuam funcionando. */
      }
    }
  }

  /* ------------------------- CONTROLLER -------------------------- */
  class GameController {
    constructor(model, view) {
      this.model = model;
      this.view = view;
      this.view.onCellActivate((index) => this.handleCell(index));
      this.view.onNewGame(() => this.handleNewGame());
      this.view.onResetScore(() => this.handleResetScore());
      this.refresh();
    }

    handleCell(index) {
      const result = this.model.play(index);
      if (result.ok) {
        this.refresh();
      } else if (result.reason === 'occupied') {
        this.refresh('Jogada inválida: casa ocupada.');
        this.view.signalInvalid(index);
      }
      // Pós-fim ('finished'): nenhuma marca é registrada (CT06).
    }

    handleNewGame() {
      this.model.newRound();
      this.refresh();
    }

    /** RF08 / RN07: só zera depois da confirmação explícita do usuário. */
    handleResetScore() {
      const confirmed = window.confirm('Zerar o placar? Todas as vitórias e empates serão apagados.');
      if (!confirmed) return;
      this.model.resetScore();
      this.model.newRound();
      this.refresh();
    }

    refresh(notice) {
      this.view.render(this.model.getState(), notice);
    }
  }

  new GameController(new GameModel(), new GameView());
})();
