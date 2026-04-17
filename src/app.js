import { renderShell } from './components/shell.js';
import { foodTypes } from './data/mockData.js';
import { favoritesPage } from './pages/favoritesPage.js';
import { eventDetailPage } from './pages/eventDetailPage.js';
import { eventsPage } from './pages/eventsPage.js';
import { foodPage } from './pages/foodPage.js';
import { homePage } from './pages/homePage.js';
import { mapPage } from './pages/mapPage.js';
import { notFoundPage } from './pages/notFoundPage.js';
import { timetablePage } from './pages/timetablePage.js';
import { getCurrentRoute, navigate } from './router.js';
import { getFavorites, toggleFavorite } from './store/favoritesStore.js';
import { getById } from './utils/helpers.js';

const pageRegistry = {
  home: homePage,
  events: eventsPage,
  'event-detail': eventDetailPage,
  map: mapPage,
  timetable: timetablePage,
  food: foodPage,
  favorites: favoritesPage,
  'not-found': notFoundPage,
};

const pageTitles = {
  home: 'ホーム',
  events: 'イベント',
  'event-detail': 'イベント詳細',
  map: 'マップ',
  timetable: 'タイムテーブル',
  food: 'フード',
  favorites: 'お気に入り',
  'not-found': 'Not Found',
};

export class FestivalGuideApp {
  constructor({ root, repository }) {
    this.root = root;
    this.repository = repository;
    this.data = null;
    this.favorites = getFavorites();
    this.handleHashChange = this.handleHashChange.bind(this);
    this.handleFavoritesUpdated = this.handleFavoritesUpdated.bind(this);
  }

  async init() {
    this.root.innerHTML = `
      <div class="loading-screen">
        <div class="loading-card">
          <span class="eyebrow">Loading</span>
          <h1>SFC Festival Guide</h1>
          <p>学園祭ガイドを準備しています...</p>
        </div>
      </div>
    `;

    this.data = await this.repository.getBootstrapData();
    window.addEventListener('hashchange', this.handleHashChange);
    window.addEventListener('favorites:updated', this.handleFavoritesUpdated);

    if (!window.location.hash) {
      navigate('/');
      return;
    }

    this.render();
  }

  destroy() {
    window.removeEventListener('hashchange', this.handleHashChange);
    window.removeEventListener('favorites:updated', this.handleFavoritesUpdated);
  }

  handleHashChange() {
    this.render();
  }

  handleFavoritesUpdated() {
    this.favorites = getFavorites();
    this.render();
  }

  getEventRelations(event) {
    return {
      location: getById(this.data.locations, event.locationId),
      category: getById(this.data.categories, event.categoryId),
    };
  }

  getFoodRelations(booth) {
    return {
      location: getById(this.data.locations, booth.locationId),
      foodTypeLabel: foodTypes.find((type) => type.id === booth.type)?.label ?? 'フード',
    };
  }

  isFavorite(eventId) {
    return this.favorites.includes(eventId);
  }

  buildContext() {
    return {
      data: this.data,
      favorites: this.favorites,
      isFavorite: (eventId) => this.isFavorite(eventId),
      getEventRelations: (event) => this.getEventRelations(event),
      getFoodRelations: (booth) => this.getFoodRelations(booth),
      navigate,
      render: (options) => this.render(options),
    };
  }

  bindCommonInteractions() {
    this.root.querySelectorAll('[data-route]').forEach((node) => {
      node.addEventListener('click', (event) => {
        event.preventDefault();
        navigate(node.dataset.route);
      });
    });

    this.root.querySelectorAll('[data-map-location]').forEach((node) => {
      node.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        navigate('/map', { location: node.dataset.mapLocation });
      });
    });

    this.root.querySelectorAll('[data-favorite-id]').forEach((node) => {
      node.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleFavorite(node.dataset.favoriteId);
      });
    });

    this.root.querySelectorAll('[data-event-card]').forEach((node) => {
      const openEvent = () => navigate(`/events/${node.dataset.eventCard}`);

      node.addEventListener('click', (event) => {
        if (event.target.closest('[data-favorite-id], [data-map-location], [data-route]')) {
          return;
        }
        openEvent();
      });

      node.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openEvent();
        }
      });
    });
  }

  render(options = {}) {
    if (!this.data) {
      return;
    }

    this.favorites = getFavorites();
    const route = getCurrentRoute();
    const page = pageRegistry[route.name] ?? notFoundPage;
    const context = this.buildContext();
    const pageContent = page.render(context, route);

    this.root.innerHTML = renderShell({
      routeName: route.name,
      pageClass: `page--${route.name}`,
      content: pageContent,
    });

    document.title = `SFC Festival Guide | ${pageTitles[route.name] ?? 'Guide'}`;

    this.bindCommonInteractions();
    page.bind?.(this.root, context, route);

    if (options.focusSelector) {
      const element = this.root.querySelector(options.focusSelector);
      if (element) {
        element.focus();
        if (element.setSelectionRange && typeof element.value === 'string') {
          const valueLength = element.value.length;
          element.setSelectionRange(valueLength, valueLength);
        }
      }
    }
  }
}
