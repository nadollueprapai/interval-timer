class IntervalTimer {
  constructor() {
    this.customColors = ["color-1", "color-2", "color-3", "color-4", "color-5"];
    this.items = [];
    this.state = {
      interval: 0,
      time: 0,
      started: false
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
    document.getElementById("addExerciseBtn").addEventListener("click", () => this.addExercise());
    document.getElementById("plusRounds").addEventListener("click", () => this.changeRounds(1));
    document.getElementById("minusRounds").addEventListener("click", () => this.changeRounds(-1));
  }

  initialiseIntervals() {
    this.addInterval("Interval 1", 20, 0);
    this.addInterval("Interval 2", 20, 1);
    this.addInterval("Interval 3", 20, 2);
    this.addInterval("Rest", 10, 3);
  }

  addInterval(name, duration, color) {
    const exercise = {
      id: this.getRandomInt(10000000),
      name: name,
      duration: duration,
      color: color
    };

    this.items.push({
      item: exercise
    });

    this.renderIntervals();
  }

  removeExercise(id) {
    this.items = this.items.filter(item => item.item.id !== id);
    this.renderIntervals();
  }

  plusInterval(id) {
    const item = this.items.find(i => i.item.id === id);
    if (item && item.item.duration < 3600) {
      item.item.duration += 1;
      this.renderIntervals();
    }
  }

  minusInterval(id) {
    const item = this.items.find(i => i.item.id === id);
    if (item && item.item.duration > 1) {
      item.item.duration -= 1;
      this.renderIntervals();
    }
  }

  toggleExerciseColor(id) {
    const item = this.items.find(i => i.item.id === id);
    if (item) {
      item.item.color = (item.item.color + 1) % this.customColors.length;
      this.renderIntervals();
    }
  }

  updateIntervalName(id, newName) {
    const item = this.items.find(i => i.item.id === id);
    if (item) {
      item.item.name = newName;
      this.renderIntervals();
    }
  }

  changeRounds(delta) {
    if (this.rounds.totalRounds === 0 && delta === -1) {
      return;
    }
    this.rounds.totalRounds = Math.max(1, this.rounds.totalRounds + delta);
    document.getElementById("totalRoundsDisplay").textContent = this.rounds.totalRounds;
  }

  renderIntervals() {
    const intervalsList = document.getElementById("intervalsList");
    intervalsList.innerHTML = "";

    this.items.forEach(item => {
      const exercise = item.item;
      const intervalDiv = document.createElement("div");
      intervalDiv.className = "interval-item";

      const colorDiv = document.createElement("div");
      colorDiv.className = `interval-color ${this.customColors[exercise.color]}`;
      colorDiv.addEventListener("click", () => this.toggleExerciseColor(exercise.id));
      colorDiv.title = "Click to change color";

      const infoDiv = document.createElement("div");
      infoDiv.className = "interval-info";

      const nameDiv = document.createElement("input");
      nameDiv.type = "text";
      nameDiv.className = "interval-name";
      nameDiv.value = exercise.name;
      nameDiv.id = `name-${exercise.id}`;
      nameDiv.addEventListener("blur", () => this.updateIntervalName(exercise.id, nameDiv.value));
      nameDiv.addEventListener("keypress", (e) => {
        if (e.key === "Enter") nameDiv.blur();
      });

      const durationDiv = document.createElement("div");
      durationDiv.className = "interval-duration";
      
      const durationLabel = document.createElement("span");
      durationLabel.textContent = `Duration: ${this.formatDuration(exercise)}`;

      const durationControls = document.createElement("div");
      durationControls.className = "duration-controls";

      const minusBtn = document.createElement("button");
      minusBtn.className = "btn-icon btn-icon-minus";
      minusBtn.textContent = "−";
      minusBtn.addEventListener("click", () => this.minusInterval(exercise.id));

      const plusBtn = document.createElement("button");
      plusBtn.className = "btn-icon btn-icon-plus";
      plusBtn.textContent = "+";
      plusBtn.addEventListener("click", () => this.plusInterval(exercise.id));

      durationControls.appendChild(minusBtn);
      durationControls.appendChild(durationLabel);
      durationControls.appendChild(plusBtn);

      durationDiv.appendChild(durationControls);

      infoDiv.appendChild(nameDiv);
      infoDiv.appendChild(durationDiv);

      const actionsDiv = document.createElement("div");
      actionsDiv.className = "interval-actions";

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "btn-icon btn-icon-delete";
      deleteBtn.textContent = "✕";
      deleteBtn.addEventListener("click", () => this.removeExercise(exercise.id));

      actionsDiv.appendChild(deleteBtn);

      intervalDiv.appendChild(colorDiv);
      intervalDiv.appendChild(infoDiv);
      intervalDiv.appendChild(actionsDiv);

      intervalsList.appendChild(intervalDiv);
    });
  }

  startBtn() {
    if (this.items.length === 0) {
      alert("Add an interval to start");
      return;
    }

    document.getElementById("pauseBtn").classList.remove("hide");
    document.getElementById("startBtn").classList.add("hide");

    if (this.state.started === true) {
      this.startLoop();
    } else {
      this.reset();
      this.state.started = true;
      this.startLoop();
    }
  }

  pauseBtn() {
    document.getElementById("pauseBtn").classList.add("hide");
    document.getElementById("startBtn").classList.remove("hide");
    this.stopTimer();
  }

  reset() {
    this.rounds.roundsLeft = 1;
    this.state.interval = 0;
    this.state.started = false;
    const nextExercise = this.items[this.state.interval].item;
    this.onStartExercise(nextExercise);
    this.updateDisplay();
  }

  onStartExercise(exercise) {
    this.state.time = exercise.duration;
    this.updateDisplay();
  }

  startLoop() {
    this.mainTimer = setInterval(() => this.step(), 1000);
  }

  stopTimer() {
    clearInterval(this.mainTimer);
  }

  step() {
    if (!this.state.started) {
      return;
    }

    const exercise = this.items[this.state.interval].item;
    this.state.time -= 1;
    this.updateDisplay();

    // Sound warnings at 3, 2, 1 seconds
    if ((this.state.time === 3 || this.state.time === 2 || this.state.time === 1) &&
        document.getElementById("soundSwitch").checked) {
      this.makeSound(false);
    }

    if (this.state.time <= 0) {
      if (this.state.interval < this.items.length - 1) {
        // Next interval
        this.state.interval += 1;
        const nextExercise = this.items[this.state.interval].item;
        this.onStartExercise(nextExercise);
        if (document.getElementById("soundSwitch").checked) {
          this.makeSound(true);
        }
      } else {
        // Check if there is a round left
        if (this.rounds.roundsLeft < this.rounds.totalRounds) {
          this.rounds.roundsLeft += 1;
          this.state.interval = 0;
          const nextExercise = this.items[this.state.interval].item;
          this.onStartExercise(nextExercise);
          if (document.getElementById("soundSwitch").checked) {
            this.makeSound(true);
          }
        } else {
          // Workout complete
          this.stop();
          if (document.getElementById("soundSwitch").checked) {
            this.makeSound(true);
          }
        }
      }
    }
  }

  stop() {
    this.stopTimer();
    this.reset();
    this.pauseBtn();
    document.getElementById("bgColor").className = "background-color";
  }

  updateDisplay() {
    const exercise = this.items[this.state.interval].item;
    const timeString = this.secToTime(this.state.time);
    const percent = 100 - ((this.state.time * 100) / exercise.duration);

    document.getElementById("exerciseName").textContent = exercise.name;
    document.getElementById("currentTime").textContent = timeString;
    document.getElementById("progressFill").style.width = Math.max(0, Math.min(100, percent)) + "%";
    document.getElementById("roundCounter").textContent = `Round: ${this.rounds.roundsLeft}/${this.rounds.totalRounds}`;

    // Update background color
    const bgColorDiv = document.getElementById("bgColor");
    bgColorDiv.className = `background-color ${this.customColors[exercise.color]}`;
  }

  makeSound(isEnd) {
    // Simple beep using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    const frequency = isEnd ? 1000 : 800;
    const duration = isEnd ? 0.5 : 0.2;

    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.3, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  }

  formatDuration(exercise) {
    const mins = Math.floor(exercise.duration / 60);
    const secs = exercise.duration % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  }

  secToTime(sec) {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  }

  getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new IntervalTimer();
});
