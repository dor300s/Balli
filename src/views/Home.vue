<template>
  <div
    class="home"
    :style="{
      'background-image': `url(${require('../style/images/background.jpg')})`,
    }"
  >
    <div
      class="ball"
      :style="{
        left: ball.pos.x + 'px',
        top: ball.pos.y + 'px',
        //'background-image': `url(${require('../style/images/ball.svg')})`,
      }"
    ></div>

    <div
      class="indicator fs24"
      v-if="isDragMode"
      :style="{
        left: startPos.x + 'px',
        top: startPos.y + 'px',
        width: getWidth + 'px',
        transform: getDirection,
      }"
    >
      <img src="@/style/images/arrow.svg" />
    </div>

    <div
      v-for="(wall, idx) in walls"
      :key="idx"
      ref="wall"
      class="wall"
      :style="{
        left: wall.pos.x + 'vw',
        top: wall.pos.y + 'vh',
        height: wall.height + 'vh',
        'background-image': `url(${require('../style/images/brick.jpg')})`,
      }"
    ></div>

    <div
      ref="target"
      :style="{
        left: target.left + 'vw',
        top: targetTop + 'px',
        height: target.height + 'px',
      }"
      class="target"
      v-bind:class="{ anim: isGameOn }"
    ></div>

    <div class="info-action-container">
      <div class="current-level">Level: {{ getLevel }}</div>
      <button @click="resetGame">Reset</button>
      <button @click="onOpenLevelsModal">Levels</button>
    </div>

    <div
      class="victory-modal flex column justify-center align-center"
      v-show="isVictory"
    >
      <h2>Good Job!</h2>
      <div class="buttons-wrapper flex space-between">
        <button @click="resetGame">Reset</button>
        <button @click="onNextLevel" v-show="getLevel !== getStagesLength">
          Next Level
        </button>
      </div>
    </div>

    <div
      v-show="isLevelModalOpen"
      ref="levelModal"
      class="change-level-modal flex column align-center justify-center"
    >
      <h3>levels</h3>
      <div class="levels-wrapper flex">
        <div
          v-for="stage in getUnlockedStages"
          :key="stage.level"
          class="level"
          @click="() => onSelectLevel(stage.level)"
        >
          {{ stage.level }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'Home',
  components: {
  },
  data() {
    return {
      startPos: {},
      ball: {
        pos: {
          x: null,
          y: null
        },
      },
      walls: [],
      target: {
        el: null,
        height: 150,
        left: 90,
      },
      force: {
        x: 0,
        y: 0
      },
      wallAreas: [],
      targetArea: {},
      gravity: 0.5,
      isGameOn: true,
      ballInterval: null,
      isDragMode: false,
      isVictory: false,
      isLevelModalOpen: false
    }
  },
  computed: {
    targetTop() {
      if (!this.isGameOn) return this.targetArea.yStart;
    },
    getDirection() {
      const m = (this.ball.pos.y - this.startPos.y) / (this.ball.pos.x - this.startPos.x);
      let rad = Math.atan(m);
      if (this.ball.pos.x >= this.startPos.x) rad += Math.PI;
      return `translate(-50%,-50%) rotate(${rad}rad)`;
    },
    getWidth() {
      return Math.sqrt(this.force.x ** 2 + this.force.y ** 2);
    },
    getLevel() {
      return this.$store.state.currLevel;
    },
    getStagesLength() {
      return this.$store.getters.stagesLength;
    },
    getUnlockedStages() {
      return this.$store.getters.getUnlockedStages;
    }

  },
  methods: {
    onDragMode(ev) {
      if (this.ball.pos !== this.startPos) return;
      if ((ev.which === 1 || ev.touches?.length === 1) && ev.target.classList[0] === 'ball') {
        this.isDragMode = true;
      }
    },
    changeBallPos(ev) {
      if (!this.isDragMode) return;
      const evX = typeof ev.clientX === 'number' ? ev.clientX : ev.touches[0].clientX;
      const evY = typeof ev.clientY === 'number' ? ev.clientY : ev.touches[0].clientY;

      if (Math.sqrt(((evX - this.startPos.x) ** 2) + ((evY - this.startPos.y) ** 2)) <= 100) {
        this.ball.pos = { x: evX, y: evY }
      } else {
        const m = Math.abs(evY - this.startPos.y) / Math.abs(evX - this.startPos.x);
        const rad = Math.atan(m);
        if (Math.abs(evX - this.startPos.x) > (Math.cos(rad) * 100)) {
          this.ball.pos.x = evX - this.startPos.x > 0 ? this.startPos.x + (Math.cos(rad) * 100) : this.startPos.x - (Math.cos(rad) * 100);
        } else this.ball.pos.x = evX;
        if (Math.abs(evY - this.startPos.y) > (Math.sin(rad) * 100)) {
          this.ball.pos.y = evY - this.startPos.y > 0 ? this.startPos.y + (Math.sin(rad) * 100) : this.startPos.y - (Math.sin(rad) * 100);
        } else this.ball.pos.y = evY;
      }
      this.force.x = -(this.ball.pos.x - this.startPos.x) / 2;
      this.force.y = (this.ball.pos.y - this.startPos.y) / 2;


    },
    throwBall(ev) {
      this.isDragMode = false;
      if (this.ball.pos === this.startPos || !this.isGameOn) return;
      else {
        clearInterval(this.ballInterval)
        this.ballInterval = setInterval(() => {
          this.gravity = this.gravity + 0.5;
          this.ball.pos.y = this.ball.pos.y - this.force.y + this.gravity;
          this.ball.pos.x = this.ball.pos.x + this.force.x;
          this.setTargetArea();

          let ballTouchWalls = this.wallAreas.map(wall => {
            if (this.ball.pos.x + 15 >= wall.xStart && this.ball.pos.x - 15 <= wall.xEnd &&
              this.ball.pos.y + 15 >= wall.yStart && this.ball.pos.y - 15 <= wall.yEnd) return true;
            else return false;
          })

          if (this.ball.pos.y > window.innerHeight || this.ball.pos.x > window.innerWidth || ballTouchWalls.some(Boolean)) {
            clearInterval(this.ballInterval);
            this.resetGame();
          } else if (this.force.x < 0 && this.ball.pos.x <= 0) {
            this.force.x = Math.abs(this.force.x);
          } else if (this.ball.pos.x + 15 >= this.targetArea.xStart && this.ball.pos.x - 15 <= this.targetArea.xEnd &&
            this.ball.pos.y + 15 >= this.targetArea.yStart && this.ball.pos.y - 15 <= this.targetArea.yEnd) {
            clearInterval(this.ballInterval)
            this.isGameOn = false;
            this.victory();
          }
        }, 20)
      }
    },
    setTargetArea() {
      const target = this.target.el;
      this.targetArea = {
        xStart: target.offsetLeft,
        xEnd: target.offsetLeft + target.offsetWidth,
        yStart: target.offsetTop,
        yEnd: target.offsetTop + target.offsetHeight
      }
    },
    resetGame() {
      clearInterval(this.ballInterval)
      this.ball.pos = this.startPos;
      this.force = { x: 0, y: 0 };
      this.gravity = 0.5;
      this.isGameOn = true;
      this.ballInterval = null;
      this.isDragMode = false;
      this.isVictory = false;
    },
    victory() {
      this.isVictory = true;
      this.$store.commit('unlockNextLevel');
    },
    setWallsArea() {
      this.wallAreas = this.$refs.wall.map(wall => {
        return {
          xStart: wall.offsetLeft,
          xEnd: wall.offsetLeft + wall.offsetWidth,
          yStart: wall.offsetTop,
          yEnd: wall.offsetTop + wall.offsetHeight
        }
      })
    },
    onNextLevel() {
      this.$store.commit('nextLevel');
      this.onGetWalls();
      this.$nextTick(() => {
        this.setWallsArea();
      });
      this.resetGame();
    },
    onGetWalls() {
      this.walls = this.$store.getters.getWalls;
    },
    setStartPos() {
      this.startPos = {
        x: window.innerWidth * 0.1 < 120 ? 120 : window.innerWidth * 0.1,
        y: window.innerHeight - (window.innerHeight * .75) < 120 ? window.innerHeight - 120 : window.innerHeight * .75
      };
      this.ball.pos = this.startPos;
    },
    onWindowResize() {
      if (this.ballInterval) return;
      this.setStartPos();
      this.setWallsArea();
    },
    onOpenLevelsModal() {
      this.isLevelModalOpen = true;
    },
    onSelectLevel(level) {
      this.$store.commit('setLevel', level);
      this.onGetWalls();
      this.$nextTick(() => {
        this.setWallsArea();
      });
      this.isLevelModalOpen = false;
    },
    handleClick(e) {
      if (!this.isLevelModalOpen) return;
      if (!this.$refs.levelModal.contains(e.target)) this.isLevelModalOpen = false;
    }
  },
  mounted() {
    this.setStartPos();
    this.onGetWalls();
    this.$nextTick(() => {
      this.setWallsArea();
      this.target.el = this.$refs.target;
    });


    window.addEventListener('mousedown', this.onDragMode);
    window.addEventListener('touchstart', this.onDragMode);
    window.addEventListener('mousemove', this.changeBallPos);
    window.addEventListener('touchmove', this.changeBallPos);
    window.addEventListener('mouseup', this.throwBall);
    window.addEventListener('touchend', this.throwBall);
    window.addEventListener('resize', this.onWindowResize);
    window.addEventListener('mousedown', this.handleClick);
  },
  created() {

  },
  beforeDestroy() {
    window.removeEventListener('mousedown', this.onDragMode);
    window.removeEventListener('touchstart', this.onDragMode);
    window.removeEventListener('mousemove', this.changeBallPos);
    window.removeEventListener('touchmove', this.changeBallPos);
    window.removeEventListener('mouseup', this.throwBall);
    window.removeEventListener('touchend', this.throwBall);
    window.removeEventListener('resize', this.onWindowResize);
    window.removeEventListener('mousedown', this.handleClick);
  }

}
</script>
