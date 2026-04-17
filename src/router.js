function parseQuery(search = '') {
  const query = {};
  const params = new URLSearchParams(search);
  params.forEach((value, key) => {
    query[key] = value;
  });
  return query;
}

export function buildHash(path, query = {}) {
  const queryString = new URLSearchParams(
    Object.entries(query).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  ).toString();

  return `#${path}${queryString ? `?${queryString}` : ''}`;
}

export function navigate(path, query = {}) {
  const targetHash = buildHash(path, query);
  if (window.location.hash === targetHash) {
    window.dispatchEvent(new Event('hashchange'));
    return;
  }
  window.location.hash = targetHash;
}

export function getCurrentRoute() {
  const currentHash = window.location.hash.replace(/^#/, '') || '/';
  const [pathname, search = ''] = currentHash.split('?');
  const cleanedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const segments = cleanedPath.split('/').filter(Boolean);

  if (segments.length === 0) {
    return { name: 'home', path: '/', params: {}, query: parseQuery(search) };
  }

  if (segments[0] === 'events' && segments[1]) {
    return {
      name: 'event-detail',
      path: cleanedPath,
      params: { eventId: segments[1] },
      query: parseQuery(search),
    };
  }

  const routeMap = {
    events: 'events',
    map: 'map',
    timetable: 'timetable',
    food: 'food',
    favorites: 'favorites',
  };

  const name = routeMap[segments[0]] ?? 'not-found';
  return {
    name,
    path: cleanedPath,
    params: {},
    query: parseQuery(search),
  };
}
