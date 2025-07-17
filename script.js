/* global Vue */
const BALL_PATH_RADIUS = 40;
const loopTapApp = Vue.createApp({
  data() {
    return {
      arc: [180, 270],
      taps: 0,
      score: 0,
      best: window.localStorage.best || 0,
      state: "init",
      prevTapTime: 0,
      colors: [
        "#ED5565",
        "#D9444F",
        "#ED5F56",
        "#DA4C43",
        "#F87D52",
        "#E7663F",
        "#FAB153",
        "#F59B43",
        "#FDCE55",
        "#F6BA43",
        "#C2D568",
        "#B1C353",
        "#99D469",
        "#83C251",
        "#42CB70",
        "#3CB85D",
        "#47CEC0",
        "#3BBEB0",
        "#4FC2E7",
        "#3CB2D9",
        "#5C9DED",
        "#4C8CDC",
        "#9398EC",
        "#7277D5",
        "#CC93EF",
        "#B377D9",
        "#ED87BF",
        "#D870AE",
      ],
      ballAngle: 0, // NEW: angle in degrees
      animationFrameId: null, // NEW: for rAF
    };
  },
  computed: {
    arcDValue() {
      return this.describeArc(
        50,
        50,
        BALL_PATH_RADIUS,
        this.arc[0],
        this.arc[1]
      );
    },
    ballCx() {
      // Ball X position based on angle
      return (
        50 +
        BALL_PATH_RADIUS * Math.cos(((this.ballAngle - 90) * Math.PI) / 180)
      );
    },
    ballCy() {
      // Ball Y position based on angle
      return (
        50 +
        BALL_PATH_RADIUS * Math.sin(((this.ballAngle - 90) * Math.PI) / 180)
      );
    },
  },
  methods: {
    polarToCartesian(centerX, centerY, radius, angleInDegrees) {
      const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
      return {
        x: centerX + radius * Math.cos(angleInRadians),
        y: centerY + radius * Math.sin(angleInRadians),
      };
    },

    describeArc(x, y, radius, startAngle, endAngle) {
      const start = this.polarToCartesian(x, y, radius, endAngle);
      const end = this.polarToCartesian(x, y, radius, startAngle);
      const arcFlag = endAngle - startAngle <= 180 ? "0" : "1";
      const d = [
        "M",
        start.x,
        start.y,
        "A",
        radius,
        radius,
        0,
        arcFlag,
        0,
        end.x,
        end.y,
      ].join(" ");
      return d;
    },

    getAngle(cx, cy, ex, ey) {
      const dy = ey - cy;
      const dx = ex - cx;
      let theta = Math.atan2(dx, -dy);
      theta *= 180 / Math.PI;
      theta = theta < 0 ? theta + 360 : theta;
      return theta;
    },

    getBallAngle() {
      // Use the current ballAngle instead of DOM
      return this.ballAngle;
    },

    setArc() {
      const random = (i, j) => Math.floor(Math.random() * (j - i)) + i;
      let arc = [];
      arc.push(random(0, 300));
      arc.push(random(arc[0] + 10, arc[0] + 110));
      arc[1] = arc[1] > 360 ? 360 : arc[1];
      this.arc = arc;
    },

    animateBall() {
      if (this.state !== "started") return;
      // Speed: base duration minus taps*5, as before
      const speed = Math.max(500, 2000 - this.taps * 5); // ms for full circle
      const now = performance.now();
      if (!this._lastFrameTime) this._lastFrameTime = now;
      const delta = now - this._lastFrameTime;
      this._lastFrameTime = now;
      // Advance angle
      this.ballAngle = (this.ballAngle + (360 * delta) / speed) % 360;
      this.animationFrameId = requestAnimationFrame(this.animateBall);
    },

    startPlay() {
      this.state = "started";
      this.taps = 0;
      this.score = 0;
      this.prevTapTime = Date.now();
      this.ballAngle = 0;
      this._lastFrameTime = null;
      if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = requestAnimationFrame(this.animateBall);
    },
    stopPlay() {
      if (this.state === "started") {
        this.state = "stopped";
        if (this.score > this.best)
          window.localStorage.best = this.best = this.score;
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
    },

    tap(e) {
      e.preventDefault();
      e.stopPropagation();
      if (this.state === "started") {
        const ballAngle = this.getBallAngle();
        // adding a 6 for better accuracy as the arc stroke extends beyond the angle.
        if (ballAngle + 6 > this.arc[0] && ballAngle - 6 < this.arc[1]) {
          const currentTapTime = Date.now();
          const tapInterval = currentTapTime - this.prevTapTime;
          this.taps++;
          this.score =
            this.score + (tapInterval < 500 ? 5 : tapInterval < 1000 ? 2 : 1);
          this.prevTapTime = currentTapTime;
          this.setArc();
        } else this.stopPlay();
      }
    },
    shareScore() {
      if (navigator.share) {
        navigator
          .share({
            title: "Looptap",
            text: `Beat my score: ${this.score}\nLooptap - a minimal game to waste your time.`,
            url: "https://vasanthv.github.io/looptap/",
          })
          .catch(() => {});
      } else {
        alert("Sharing is not supported on this browser.");
      }
    },
  },
  mounted() {
    // Clean up on destroy
    window.addEventListener("beforeunload", () => {
      if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    });
  },
}).mount("#canvas");

if ("ontouchstart" in window) {
  window.addEventListener("touchstart", loopTapApp.tap);
} else {
  window.addEventListener("mousedown", loopTapApp.tap);
  window.onkeypress = (e) => {
    if (e.keyCode == 32) {
      if (loopTapApp.state === "stopped") {
        loopTapApp.startPlay();
      } else {
        loopTapApp.tap(e);
      }
    }
  };
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js");
}
