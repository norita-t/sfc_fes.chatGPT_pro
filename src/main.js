import { FestivalGuideApp } from './app.js';
import { mockFestivalRepository } from './services/mockFestivalRepository.js';

const root = document.querySelector('#app');

const app = new FestivalGuideApp({
  root,
  repository: mockFestivalRepository,
});

app.init();
