class IntervalTimer {
  constructor() {
    this.customColors = ["color-1", "color-2", "color-3", "color-4", "color-5"];
    this.items = [];

    this.state = {
      interval: 0,
      time: 0,
      started: false,
      hasStarted: false
    };

    this.rounds = {
      roundsLeft: 1,
      totalRounds: 8
    };

    this.mainTimer = null;

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.initialiseIntervals();
    this.renderIntervals();
    this.updateDisplay();
  }

  setupEventListeners() {
    document.getElementById("startBtn").addEventListener("click", () => this.startBtn());
    document.getElementById("pauseBtn").addEventListener("click", () => this.pauseBtn());
    document.getElementById("resetBtn").addEventListener("click", () => this.reset());

    document.getElementById("addTaskIntervalBtn").addEventListener("click", () => this.addTaskInterval());

    document.getElementById("plusRounds").addEventListener("click", () => this.changeRounds(1));
    document.getElementById("minusRounds").addEventListener("click", () => this.changeRounds(-1));
  }

  initialiseIntervals() {
    this.addTaskInterval("Study", 1500, 1);
    this.addTaskInterval("Break", 300, 2);
  }

  addTaskInterval(name, duration, color) {
    const taskInterval = {
      id: this.getRandomInt(10000000),
      name : name || `Task ${this.items.length + 1}`,
      duration : duration || 300,
      color: color || this.getRandomInt(this.customColors.length),
    };

    this.items.push({ item: taskInterval });
    this.renderIntervals();
  }

  removeTaskInterval(id) {
    this.items = this.items.filter(i => i.item.id !== id);
    this.renderIntervals();
  }

  toggleTaskIntervalColor(id) {
    const item = this.items.find(i => i.item.id === id);
    if (item) {
      item.item.color = (item.item.color + 1) % this.customColors.length;
      this.renderIntervals();
    }
  }

  updateTaskIntervalName(id, newName) {
    const item = this.items.find(i => i.item.id === id);
    if (item) {
      item.item.name = newName;
      this.renderIntervals();
    }
  }

  plusInterval(id) {
    const item = this.items.find(i => i.item.id === id);
    if (!item) return;

    if (item.item.duration < 3600) {
      item.item.duration++;

      if (this.state.interval === this.items.findIndex(i => i.item.id === id)) {
        this.state.time = Math.min(this.state.time, item.item.duration);
      }

      this.renderIntervals();
      this.updateDisplay();
    }
  }

  minusInterval(id) {
    const item = this.items.find(i => i.item.id === id);
    if (!item) return;

    if (item.item.duration > 1) {
      item.item.duration--;

      if (this.state.interval === this.items.findIndex(i => i.item.id === id)) {
        this.state.time = Math.min(this.state.time, item.item.duration);
      }

      this.renderIntervals();
      this.updateDisplay();
    }
  }

  updateIntervalDuration(id, value) {
    const item = this.items.find(i => i.item.id === id);
    if (!item) return;

    const duration = this.parseDurationValue(value);
    if (duration === null) {
      this.renderIntervals();
      return;
    }

    item.item.duration = duration;

    if (this.state.interval === this.items.findIndex(i => i.item.id === id)) {
      this.state.time = Math.min(this.state.time, duration);
    }

    this.renderIntervals();
    this.updateDisplay();
  }

  parseDurationValue(value) {
    if (typeof value !== "string") return null;

    const input = value.trim();

    const mmss = input.match(/^(\d+):([0-5]?\d)$/);
    if (mmss) {
      const m = parseInt(mmss[1], 10);
      const s = parseInt(mmss[2], 10);
      const total = m * 60 + s;
      return total >= 1 && total <= 3600 ? total : null;
    }

    const numeric = input.replace(/[^0-9]/g, "");
    if (!numeric.length) return null;

    const seconds = parseInt(numeric, 10);
    return seconds >= 1 && seconds <= 3600 ? seconds : null;
  }

  changeRounds(delta) {
    this.rounds.totalRounds = Math.max(1, this.rounds.totalRounds + delta);
    document.getElementById("totalRoundsDisplay").textContent = this.rounds.totalRounds;
  }

  renderIntervals() {
    const list = document.getElementById("intervalList");
    list.innerHTML = "";

    this.items.forEach(entry => {
      const taskInterval = entry.item;

      const interval_item = document.createElement("div");
      interval_item.className = "interval-item";

      const color = document.createElement("div");
      color.className = `interval-color ${this.customColors[taskInterval.color]}`;
      color.onclick = () => this.toggleTaskIntervalColor(taskInterval.id);

      const info = document.createElement("div");
      info.className = "interval-info";

      const name = document.createElement("input");
      name.className = "interval-name";
      name.value = taskInterval.name;
      name.onblur = () => this.updateTaskIntervalName(taskInterval.id, name.value);

      const minus = document.createElement("button");
      minus.className = "duration-button";
      minus.textContent = "−";
      minus.onclick = () => this.minusInterval(taskInterval.id);

      const duration = document.createElement("input");
      duration.className = "interval-duration-input";
      duration.value = this.formatDuration(taskInterval);
      duration.onblur = () => this.updateIntervalDuration(taskInterval.id, duration.value);

      const plus = document.createElement("button");
      plus.className = "duration-button";
      plus.textContent = "+";
      plus.onclick = () => this.plusInterval(taskInterval.id);

      info.append(name, minus, duration, plus);

      const del = document.createElement("button");
      del.className = "delete-button";
      del.textContent = "✕";
      del.onclick = () => this.removeTaskInterval(taskInterval.id);

      interval_item.append(color, info, del);
      list.appendChild(interval_item);
    });
  }

  startBtn() {
    if (!this.items.length) return alert("Add a task interval first");

    document.getElementById("startBtn").classList.add("hide");
    document.getElementById("pauseBtn").classList.remove("hide");

    if (!this.state.hasStarted) {
      this.reset();
      this.state.hasStarted = true;
    }

    this.state.started = true;
    this.startLoop();
  }

  pauseBtn() {
    this.state.started = false;
    this.stopTimer();

    document.getElementById("pauseBtn").classList.add("hide");
    document.getElementById("startBtn").classList.remove("hide");
  }

  reset() {
    this.stopTimer();

    this.state.started = false;
    this.rounds.roundsLeft = 1;
    this.state.interval = 0;

    if (this.items.length) {
      this.onStartTaskInterval(this.items[0].item);
    }
  }

  onStartTaskInterval(taskInterval) {
    this.state.time = taskInterval.duration;
  }

  startLoop() {
    this.stopTimer();
    this.mainTimer = setInterval(() => this.step(), 1000);
  }

  stopTimer() {
    clearInterval(this.mainTimer);
    this.mainTimer = null;
  }

  step() {
    if (!this.state.started) return;

    const taskInterval = this.items[this.state.interval].item;
    this.state.time--;

    this.updateDisplay();

    if ([3, 2, 1].includes(this.state.time) &&
      document.getElementById("soundSwitch").checked) {
      this.makeSound(false);
    }

    if (this.state.time <= 0) {
      if (this.state.interval < this.items.length - 1) {
        this.state.interval++;
      } else if (this.rounds.roundsLeft < this.rounds.totalRounds) {
        this.rounds.roundsLeft++;
        this.state.interval = 0;
      } else {
        return this.stop();
      }

      this.onStartTaskInterval(this.items[this.state.interval].item);

      if (document.getElementById("soundSwitch").checked) {
        this.makeSound(true);
      }
    }
  }

  stop() {
    this.stopTimer();
    this.state.started = false;

    document.getElementById("pauseBtn").classList.add("hide");
    document.getElementById("startBtn").classList.remove("hide");
  }

  updateDisplay() {
    const taskInterval = this.items[this.state.interval].item;

    document.getElementById("taskIntervalName").textContent = taskInterval.name;
    document.getElementById("currentTime").textContent = this.secToTime(this.state.time);

    const percent = 100 - (this.state.time * 100) / taskInterval.duration;
    document.getElementById("progressFill").style.width =
      Math.max(0, Math.min(100, percent)) + "%";

    document.getElementById("roundCounter").textContent =
      `Round: ${this.rounds.roundsLeft}/${this.rounds.totalRounds}`;

    document.getElementById("bgColor").className =
      `background-color ${this.customColors[taskInterval.color]}`;
  }

  formatDuration(taskInterval) {
    const m = Math.floor(taskInterval.duration / 60);
    const s = taskInterval.duration % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  }

  secToTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  }

  makeSound(isEnd) {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.value = isEnd ? 1000 : 800;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  }

  getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new IntervalTimer();
});