import Vue from 'vue';
import Vuex from 'vuex';

import { stagesData } from './stageState';

Vue.use(Vuex);

export const store = new Vuex.Store({
  state: {
    currLevel: 1,
    stages: stagesData
  },
  getters: {
    getWalls: (state) => {
      const currStage = state.stages.find(stage => stage.level === state.currLevel);
      return currStage.walls;
    },
    stagesLength: (state) => {
      return state.stages.length;
    },
    getUnlockedStages: (state) => {
      return state.stages.filter(stage => stage.isUnlock);
    }
  },
  mutations: {
    nextLevel(state) {
      state.currLevel = state.currLevel + 1 > state.stages.length ? state.currLevel : state.currLevel + 1;
      const stageIdxToUnlock = state.stages.findIndex(stage => stage.level === state.currLevel);
      state.stages[stageIdxToUnlock].isUnlock = true;
    },
    setLevel(state, level) {
      state.currLevel = level;
    },
    unlockNextLevel(state) {
      const stageIdxToUnlock = state.stages.findIndex(stage => stage.level === state.currLevel + 1);
      if (stageIdxToUnlock === -1) return;
      state.stages[stageIdxToUnlock].isUnlock = true;

    }
  },
  actions: {
  },
  modules: {
  }
})

