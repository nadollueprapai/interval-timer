class IntervalTimer {
  constructor() {
    this.customColors = [
      "color-1",
      "color-2",
      "color-3",
      "color-4",
      "color-5"
    ];

    this.items = [];

    this.state = {
      interval: 0,
      time: 0,
      started: false,
      paused: false
    };

    this.rounds = {
      roundsLeft: 1,
      totalRounds: 8
    };

    this.mainTimer = null;

    // Shared audio context
    this.audioCtx = new (
      window.AudioContext ||
      window.webkitAudioContext
    )();

    this.clickSoundEnabled = true;

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.initialiseIntervals();

    if (this.items.length) {
      this.state.time =
        this.items[0].item.duration;
    }

    this.renderIntervals();
    this.updateDisplay();
    this.updateButtons();
  }

  setupEventListeners() {
    document
      .getElementById("startBtn")
      .addEventListener("click", () => {
        this.playClickSound(900);
        this.startBtn();
      });

    document
      .getElementById("pauseBtn")
      .addEventListener("click", () => {
        this.playClickSound(400);
        this.pauseBtn();
      });

    document
      .getElementById("resetBtn")
      .addEventListener("click", () => {
        this.playClickSound(300);
        this.reset();
      });

    document
      .getElementById("addTaskIntervalBtn")
      .addEventListener("click", () => {
        this.playClickSound(800);
        this.addTaskInterval();
      });

    document
      .getElementById("plusRounds")
      .addEventListener("click", () => {
        this.playClickSound();
        this.changeRounds(1);
      });

    document
      .getElementById("minusRounds")
      .addEventListener("click", () => {
        this.playClickSound();
        this.changeRounds(-1);
      });
  }

  initialiseIntervals() {
    this.addTaskInterval("Study", 1500, 1);
    this.addTaskInterval("Break", 300, 2);
  }

  updateButtons() {
    const startBtn =
      document.getElementById("startBtn");

    const pauseBtn =
      document.getElementById("pauseBtn");

    if (!this.state.started) {
      startBtn.textContent = "Start";

      startBtn.classList.remove("hide");
      pauseBtn.classList.add("hide");

      return;
    }

    if (this.state.paused) {
      startBtn.textContent = "Resume";

      startBtn.classList.remove("hide");
      pauseBtn.classList.add("hide");

      return;
    }

    startBtn.classList.add("hide");
    pauseBtn.classList.remove("hide");
  }

  addTaskInterval(name, duration, color) {
    const taskInterval = {
      id: this.getRandomInt(10000000),

      name:
        name ||
        `Task ${this.items.length + 1}`,

      duration: duration || 300,

      color:
        color ??
        this.getRandomInt(
          this.customColors.length
        )
    };

    this.items.push({ item: taskInterval });

    if (this.items.length === 1) {
      this.state.time =
        taskInterval.duration;
    }

    this.renderIntervals();
    this.updateDisplay();
  }

  removeTaskInterval(id) {
    this.playClickSound(250);

    const removingCurrent =
      this.items[this.state.interval]?.item
        .id === id;

    this.items = this.items.filter(
      i => i.item.id !== id
    );

    if (!this.items.length) {
      this.reset();

      document.getElementById(
        "taskIntervalName"
      ).textContent = "No Task";

      document.getElementById(
        "currentTime"
      ).textContent = "0:00";

      document.getElementById(
        "progressFill"
      ).style.width = "0%";

      this.renderIntervals();

      return;
    }

    if (
      this.state.interval >=
      this.items.length
    ) {
      this.state.interval = 0;
    }

    if (removingCurrent) {
      this.state.time =
        this.items[this.state.interval].item
          .duration;
    }

    this.renderIntervals();
    this.updateDisplay();
  }

  toggleTaskIntervalColor(id) {
    this.playClickSound(700);

    const item = this.items.find(
      i => i.item.id === id
    );

    if (item) {
      item.item.color =
        (item.item.color + 1) %
        this.customColors.length;

      this.renderIntervals();
      this.updateDisplay();
    }
  }

  updateTaskIntervalName(id, newName) {
    const item = this.items.find(
      i => i.item.id === id
    );

    if (item) {
      item.item.name = newName;

      this.renderIntervals();
      this.updateDisplay();
    }
  }

  plusInterval(id) {
    this.playClickSound(750);

    const item = this.items.find(
      i => i.item.id === id
    );

    if (!item) return;

    if (item.item.duration < 3600) {
      item.item.duration++;

      if (
        this.state.interval ===
        this.items.findIndex(
          i => i.item.id === id
        )
      ) {
        this.state.time = Math.min(
          this.state.time + 1,
          item.item.duration
        );
      }

      this.renderIntervals();
      this.updateDisplay();
    }
  }

  minusInterval(id) {
    this.playClickSound(500);

    const item = this.items.find(
      i => i.item.id === id
    );

    if (!item) return;

    if (item.item.duration > 1) {
      item.item.duration--;

      if (
        this.state.interval ===
        this.items.findIndex(
          i => i.item.id === id
        )
      ) {
        this.state.time = Math.min(
          this.state.time,
          item.item.duration
        );
      }

      this.renderIntervals();
      this.updateDisplay();
    }
  }

  updateIntervalDuration(id, value) {
    const item = this.items.find(
      i => i.item.id === id
    );

    if (!item) return;

    const duration =
      this.parseDurationValue(value);

    if (duration === null) {
      this.renderIntervals();
      return;
    }

    item.item.duration = duration;

    if (
      this.state.interval ===
      this.items.findIndex(
        i => i.item.id === id
      )
    ) {
      this.state.time = Math.min(
        this.state.time,
        duration
      );
    }

    this.renderIntervals();
    this.updateDisplay();
  }

  parseDurationValue(value) {
    if (typeof value !== "string")
      return null;

    const input = value.trim();

    const mmss = input.match(
      /^(\d+):([0-5]?\d)$/
    );

    if (mmss) {
      const m = parseInt(mmss[1], 10);

      const s = parseInt(mmss[2], 10);

      const total = m * 60 + s;

      return total >= 1 &&
        total <= 3600
        ? total
        : null;
    }

    const numeric = input.replace(
      /[^0-9]/g,
      ""
    );

    if (!numeric.length) return null;

    const seconds = parseInt(
      numeric,
      10
    );

    return seconds >= 1 &&
      seconds <= 3600
      ? seconds
      : null;
  }

  changeRounds(delta) {
    this.rounds.totalRounds = Math.max(
      1,
      this.rounds.totalRounds + delta
    );

    document.getElementById(
      "totalRoundsDisplay"
    ).textContent =
      this.rounds.totalRounds;
  }

  renderIntervals() {
    const list =
      document.getElementById(
        "intervalList"
      );

    list.innerHTML = "";

    this.items.forEach(entry => {
      const taskInterval = entry.item;

      const interval_item =
        document.createElement("div");

      interval_item.className =
        "interval-item";

      const color =
        document.createElement("div");

      color.className =
        `interval-color ${this.customColors[taskInterval.color]}`;

      color.onclick = () =>
        this.toggleTaskIntervalColor(
          taskInterval.id
        );

      const info =
        document.createElement("div");

      info.className = "interval-info";

      const name =
        document.createElement("input");

      name.className = "interval-name";

      name.value = taskInterval.name;

      name.onblur = () =>
        this.updateTaskIntervalName(
          taskInterval.id,
          name.value
        );

      const minus =
        document.createElement("button");

      minus.className =
        "duration-button";

      minus.textContent = "−";

      minus.onclick = () =>
        this.minusInterval(
          taskInterval.id
        );

      const duration =
        document.createElement("input");

      duration.className =
        "interval-duration-input";

      duration.value =
        this.formatDuration(
          taskInterval
        );

      duration.onblur = () =>
        this.updateIntervalDuration(
          taskInterval.id,
          duration.value
        );

      const plus =
        document.createElement("button");

      plus.className =
        "duration-button";

      plus.textContent = "+";

      plus.onclick = () =>
        this.plusInterval(
          taskInterval.id
        );

      info.append(
        name,
        minus,
        duration,
        plus
      );

      const del =
        document.createElement("button");

      del.className = "delete-button";

      del.textContent = "✕";

      del.onclick = () =>
        this.removeTaskInterval(
          taskInterval.id
        );

      interval_item.append(
        color,
        info,
        del
      );

      list.appendChild(interval_item);
    });
  }

  startBtn() {
    if (!this.items.length) {
      alert(
        "Add a task interval first"
      );

      return;
    }

    if (!this.state.started) {
      this.state.started = true;

      this.state.paused = false;

      this.state.interval = 0;

      this.rounds.roundsLeft = 1;

      this.state.time =
        this.items[0].item.duration;
    }

    if (this.state.paused) {
      this.state.paused = false;
    }

    this.startLoop();

    this.updateButtons();
    this.updateDisplay();
  }

  pauseBtn() {
    if (!this.state.started) return;

    this.state.paused = true;

    this.stopTimer();

    this.updateButtons();
  }

  reset() {
    this.stopTimer();

    this.state.started = false;

    this.state.paused = false;

    this.state.interval = 0;

    this.rounds.roundsLeft = 1;

    this.state.time = this.items.length
      ? this.items[0].item.duration
      : 0;

    this.updateButtons();
    this.updateDisplay();
  }

  startLoop() {
    this.stopTimer();

    this.mainTimer = setInterval(
      () => {
        this.step();
      },
      1000
    );
  }

  stopTimer() {
    if (this.mainTimer) {
      clearInterval(this.mainTimer);

      this.mainTimer = null;
    }
  }

  step() {
    if (
      !this.state.started ||
      this.state.paused ||
      !this.items.length
    ) {
      return;
    }

    if (this.state.time > 0) {
      this.state.time--;
    }

    const soundEnabled =
      document.getElementById(
        "soundSwitch"
      ).checked;

    if (
      [3, 2, 1].includes(
        this.state.time
      )
    ) {
      if (soundEnabled) {
        this.makeSound(false);
      }
    }

    if (this.state.time === 0) {
      const isLastInterval =
        this.state.interval >=
        this.items.length - 1;

      const isLastRound =
        this.rounds.roundsLeft >=
        this.rounds.totalRounds;

      if (
        isLastInterval &&
        isLastRound
      ) {
        if (soundEnabled) {
          this.makeSound(true);
        }

        this.reset();

        return;
      }

      if (!isLastInterval) {
        this.state.interval++;
      } else {
        this.rounds.roundsLeft++;

        this.state.interval = 0;
      }

      const nextInterval =
        this.items[
          this.state.interval
        ].item;

      this.state.time =
        nextInterval.duration;

      if (soundEnabled) {
        this.makeSound(true);
      }
    }

    this.updateDisplay();
  }

  updateDisplay() {
    if (!this.items.length) return;

    const taskInterval =
      this.items[this.state.interval]
        .item;

    document.getElementById(
      "taskIntervalName"
    ).textContent =
      taskInterval.name;

    document.getElementById(
      "currentTime"
    ).textContent =
      this.secToTime(
        this.state.time
      );

    const percent =
      100 -
      (this.state.time * 100) /
        taskInterval.duration;

    document.getElementById(
      "progressFill"
    ).style.width =
      Math.max(
        0,
        Math.min(100, percent)
      ) + "%";

    document.getElementById(
      "roundCounter"
    ).textContent =
      `Round: ${this.rounds.roundsLeft}/${this.rounds.totalRounds}`;

    document.getElementById(
      "bgColor"
    ).className =
      `background-color ${this.customColors[taskInterval.color]}`;
  }

  formatDuration(taskInterval) {
    const m = Math.floor(
      taskInterval.duration / 60
    );

    const s =
      taskInterval.duration % 60;

    return `${m}:${
      s < 10 ? "0" : ""
    }${s}`;
  }

  secToTime(sec) {
    const m = Math.floor(sec / 60);

    const s = sec % 60;

    return `${m}:${
      s < 10 ? "0" : ""
    }${s}`;
  }

  playClickSound(freq = 600) {
    if (!this.clickSoundEnabled)
      return;

    if (
      this.audioCtx.state ===
      "suspended"
    ) {
      this.audioCtx.resume();
    }

    const osc =
      this.audioCtx.createOscillator();

    const gain =
      this.audioCtx.createGain();

    osc.connect(gain);

    gain.connect(
      this.audioCtx.destination
    );

    osc.type = "triangle";

    osc.frequency.value = freq;

    gain.gain.setValueAtTime(
      0.08,
      this.audioCtx.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
      0.001,
      this.audioCtx.currentTime +
        0.05
    );

    osc.start();

    osc.stop(
      this.audioCtx.currentTime +
        0.05
    );
  }

  makeSound(isEnd) {
    const osc =
      this.audioCtx.createOscillator();

    const gain =
      this.audioCtx.createGain();

    osc.connect(gain);

    gain.connect(
      this.audioCtx.destination
    );

    osc.frequency.value = isEnd
      ? 1000
      : 800;

    gain.gain.setValueAtTime(
      0.3,
      this.audioCtx.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioCtx.currentTime +
        0.3
    );

    osc.start();

    osc.stop(
      this.audioCtx.currentTime +
        0.3
    );
  }

  getRandomInt(max) {
    return Math.floor(
      Math.random() * max
    );
  }
}

document.addEventListener(
  "DOMContentLoaded",
  () => {
    new IntervalTimer();
  }
);