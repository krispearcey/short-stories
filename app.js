const stories = [
  {
    slug: 'winter-waiting',
    title: 'Winter Waiting',
    description: 'A fly tier tries to ignore the slow pressure building inside a house full of old gear, memory, and weather that never fully leaves.',
    author: 'Kristopher Pearcey',
    pages: 17,
    published: 'February 2026',
    year: 2026,
    excerpt: 'His desk was crowded as it always was. Fly boxes sat half-open in uneven stacks, the task lamp at eye-level illuminating every drift of dubbing and feather that scattered the maple top.'
  },
  {
    slug: 'the-fog-took-the-road',
    title: 'The Fog Took the Road',
    description: 'A late drive through the coast turns wrong when the road ahead seems to remember every person who has vanished on it.',
    author: 'Kristopher Pearcey',
    pages: 11,
    published: 'January 2026',
    year: 2026,
    excerpt: 'By the time the shoulder line disappeared, Evan had already told himself three different lies about why he kept driving.'
  },
  {
    slug: 'salt-in-the-floorboards',
    title: 'Salt in the Floorboards',
    description: 'In a weather-beaten house near the water, something keeps rising through the wood whenever the tide comes in hard enough.',
    author: 'Kristopher Pearcey',
    pages: 9,
    published: 'November 2025',
    year: 2025,
    excerpt: 'The first stain showed up beside the kitchen table. It looked harmless until it dried white.'
  },
  {
    slug: 'stillwater-mouth',
    title: 'Stillwater Mouth',
    description: 'A forgotten pond and a voice from childhood open into a quieter, stranger kind of haunting.',
    author: 'Kristopher Pearcey',
    pages: 14,
    published: 'August 2025',
    year: 2025,
    excerpt: 'There are places you remember by weather first and shape second. Stillwater was one of them.'
  }
];

const state = {
  query: '',
  view: 'card',
  newsletterEmail: '',
  newsletterLoading: false,
  newsletterSubmitted: false
};

const app = document.getElementById('app');
const drawerBackdrop = document.getElementById('drawerBackdrop');
const menuToggle = document.getElementById('menuToggle');
const siteDrawer = document.getElementById('siteDrawer');
const menuSubscribeForm = document.getElementById('menuSubscribeForm');
const menuSubscribeButton = document.getElementById('menuSubscribeButton');
const menuEmailInput = document.getElementById('menuEmailInput');
const clearEmailInputButton = document.getElementById('clearEmailInput');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');

menuToggle.addEventListener('click', () => setMenuState());
drawerBackdrop.addEventListener('click', () => setMenuState(false));

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setMenuState(false);
});

document.querySelectorAll('[data-nav]').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    navigate(link.dataset.nav);
    setMenuState(false);
  });
});

menuSubscribeButton.innerHTML = renderButtonContent();

menuSubscribeForm.addEventListener('submit', (event) => {
  event.preventDefault();
  handleNewsletterSubmit(menuEmailInput, menuSubscribeButton);
});
menuEmailInput.addEventListener('input', (event) => {
  if (state.newsletterSubmitted) return;
  state.newsletterEmail = event.target.value;
  syncNewsletterUI();
});
clearEmailInputButton.addEventListener('click', () => {
  if (menuEmailInput.readOnly || menuEmailInput.disabled) return;
  state.newsletterEmail = '';
  syncNewsletterUI();
  menuEmailInput.focus();
});

themeToggle.addEventListener('click', () => {
  setTheme(document.body.classList.contains('dark') ? 'light' : 'dark');
});

window.addEventListener('hashchange', renderRoute);
window.addEventListener('resize', syncHeaderHeight);
window.addEventListener('DOMContentLoaded', () => {
  initTheme();
  syncHeaderHeight();
  syncNewsletterUI();
  renderRoute();
});

function setTheme(mode) {
  const dark = mode === 'dark';
  document.body.classList.toggle('dark', dark);
  localStorage.setItem('kp-theme', mode);
  themeIcon.textContent = dark ? 'light_mode' : 'dark_mode';
}

function initTheme() {
  const saved = localStorage.getItem('kp-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  setTheme(saved || (prefersDark ? 'dark' : 'light'));
}

function syncHeaderHeight() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const height = Math.round(header.getBoundingClientRect().height);
  document.documentElement.style.setProperty('--header-height', `${height}px`);
}

function setMenuState(force) {
  const open = typeof force === 'boolean' ? force : !document.body.classList.contains('menu-open');
  document.body.classList.toggle('menu-open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  siteDrawer.setAttribute('aria-hidden', String(!open));
  drawerBackdrop.hidden = !open;
  document.body.style.overflow = open ? 'hidden' : '';
  if (open) syncHeaderHeight();
}

function renderRoute() {
  const hash = window.location.hash.replace(/^#/, '') || 'home';
  const [route, slug] = hash.split('/');

  if (route === 'story' && slug) return renderStoryPage(slug);
  if (route === 'about') return renderAboutPage();
  if (route === 'contact') return renderContactPage();
  return renderHomePage();
}

function navigate(route) {
  window.location.hash = `#${route}`;
}

function applyFilter(query, closeMenu = false) {
  state.query = query.trim();
  syncSearchUI();

  const currentRoute = (window.location.hash.replace(/^#/, '') || 'home').split('/')[0];
  if (currentRoute !== 'home') {
    window.location.hash = '#home';
  } else {
    updateStories();
  }

  if (closeMenu) setMenuState(false);
}

function syncSearchUI() {
  const pageSearch = document.getElementById('storySearch');
  const clearSearchButton = document.getElementById('clearSearchInput');

  if (pageSearch && pageSearch !== document.activeElement) {
    pageSearch.value = state.query;
  }

  if (pageSearch) {
    pageSearch.classList.toggle('has-clear', state.query.length > 0);
  }

  if (clearSearchButton) {
    clearSearchButton.classList.toggle('show', state.query.length > 0);
  }
}

function getFilteredStories() {
  return stories.filter((story) => {
    const haystack = `${story.title} ${story.description} ${story.author} ${story.published} ${story.year} ${story.pages} ${story.excerpt}`.toLowerCase();
    return haystack.includes(state.query.toLowerCase());
  });
}

function currentViewIcon() {
  return state.view === 'card' ? 'view_stream' : 'notes';
}

function currentViewModeClass() {
  return state.view === 'card' ? 'is-card' : 'is-list';
}

function renderViewToggleIcon() {
  return `
    <span class="view-toggle-icon-stack" aria-hidden="true">
      <span class="view-toggle-icon view-toggle-icon--card">
        <span class="material-symbols-outlined">view_stream</span>
      </span>
      <span class="view-toggle-icon view-toggle-icon--list">
        <span class="material-symbols-outlined">notes</span>
      </span>
    </span>
  `;
}

function renderHomePage() {
  app.innerHTML = `
    <section class="page home-page">
      <div class="home-intro">
        <h1 class="intro-title">Short Horror Rooted in Atlantic Canada</h1>
        <p class="intro-copy">Stories grounded in Atlantic weather, coastlines, memory, and the quieter kinds of dread.</p>
      </div>

      <div class="section-head" id="stories">
        <div class="section-kicker">Stories</div>
      </div>

      <div class="search-row">
        <div class="input-shell">
          <input id="storySearch" class="search-input" type="search" placeholder="Search stories" value="${escapeHtml(state.query)}" aria-label="Search stories" />
          <button id="clearSearchInput" class="clear-input-btn" type="button" aria-label="Clear search">×</button>
        </div>
        <button id="viewToggle" class="view-toggle ${currentViewModeClass()}" type="button" aria-label="Switch view" title="${state.view === 'card' ? 'Switch to list view' : 'Switch to card view'}">
          ${renderViewToggleIcon()}
        </button>
      </div>

      <div id="storyGrid" class="story-grid ${state.view === 'list' ? 'list-view' : ''}">
        ${renderStoriesMarkup(getFilteredStories())}
      </div>

      ${renderNewsletterMarkup()}
    </section>
  `;

  const searchInput = document.getElementById('storySearch');
  const clearSearchButton = document.getElementById('clearSearchInput');
  const viewToggle = document.getElementById('viewToggle');

  searchInput.addEventListener('input', (event) => {
    state.query = event.target.value;
    syncSearchUI();
    updateStories();
  });

  clearSearchButton?.addEventListener('click', () => {
    state.query = '';
    syncSearchUI();
    updateStories();
    searchInput.focus();
  });

  viewToggle.addEventListener('click', () => {
    state.view = state.view === 'card' ? 'list' : 'card';
    updateStories();
    viewToggle.classList.toggle('is-card', state.view === 'card');
    viewToggle.classList.toggle('is-list', state.view === 'list');
    viewToggle.title = state.view === 'card' ? 'Switch to list view' : 'Switch to card view';
  });


  wireNewsletter();
  syncSearchUI();
  syncNewsletterUI();
}

function updateStories() {
  const storyGrid = document.getElementById('storyGrid');
  if (!storyGrid) return;
  storyGrid.classList.toggle('list-view', state.view === 'list');
  storyGrid.innerHTML = renderStoriesMarkup(getFilteredStories());
}

function renderStoriesMarkup(filtered) {
  if (!filtered.length) {
    return '<div class="empty-state">No stories matched your search.</div>';
  }
  return filtered.map(renderStoryCard).join('');
}

function renderStoryCard(story) {
  if (state.view === 'list') {
    return `
      <a class="story-card" href="#story/${story.slug}">
        <div class="story-title-row">
          <span class="story-year">${story.year}</span>
          <h2 class="story-title">${escapeHtml(story.title)}</h2>
        </div>
        <div class="story-meta">
          <span class="story-pages">${story.pages} pages</span>
        </div>
      </a>
    `;
  }

  return `
    <a class="story-card" href="#story/${story.slug}">
      <div class="story-meta">
        <span class="story-author">${escapeHtml(story.author)}</span>
        <span class="sep">•</span>
        <span class="story-month">${escapeHtml(story.published)}</span>
        <span class="sep">•</span>
        <span>${story.pages} pages</span>
      </div>
      <h2 class="story-title">${escapeHtml(story.title)}</h2>
      <p class="story-description">${escapeHtml(story.description)}</p>
    </a>
  `;
}

function renderButtonContent() {
  return `
    <span class="button-content-stack" aria-hidden="true">
      <span class="button-face button-face--subscribe">Subscribe</span>
      <span class="button-face button-face--spinner"><span class="spinner" aria-hidden="true"></span></span>
      <span class="button-face button-face--thanks">Thank you!</span>
    </span>
  `;
}

function renderNewsletterMarkup() {
  const buttonContent = renderButtonContent();

  return `
    <section class="newsletter-block" aria-labelledby="newsletterTitle">
      <h2 id="newsletterTitle" class="newsletter-title">Looking for more?</h2>
      <p class="newsletter-copy">Join the mailing list — get notified when new stories are posted!</p>
      <form id="newsletterForm" class="newsletter-form">
        <div class="input-shell">
          <input
            id="newsletterEmail"
            class="newsletter-input"
            type="email"
            placeholder="Email address"
            value="${escapeHtml(state.newsletterEmail)}"
            aria-label="Email address"
            required
          />
          <button id="clearNewsletterInput" class="clear-input-btn" type="button" aria-label="Clear email">×</button>
        </div>
        <button
          id="newsletterButton"
          class="newsletter-button ${state.newsletterLoading ? 'is-loading' : ''} ${state.newsletterSubmitted ? 'is-success' : ''}"
          type="submit"
          ${state.newsletterLoading || state.newsletterSubmitted ? 'disabled' : ''}
        >${buttonContent}</button>
      </form>
    </section>
  `;
}

function wireNewsletter() {
  const form = document.getElementById('newsletterForm');
  const emailInput = document.getElementById('newsletterEmail');
  const button = document.getElementById('newsletterButton');
  const clearButton = document.getElementById('clearNewsletterInput');
  if (!form || !emailInput || !button) return;

  emailInput.addEventListener('input', (event) => {
    if (state.newsletterSubmitted) return;
    state.newsletterEmail = event.target.value;
    syncNewsletterUI();
  });

  clearButton?.addEventListener('click', () => {
    if (state.newsletterSubmitted || emailInput.readOnly) return;
    state.newsletterEmail = '';
    syncNewsletterUI();
    emailInput.focus();
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    handleNewsletterSubmit(emailInput, button);
  });
}

function handleNewsletterSubmit(input, button) {
  if (state.newsletterLoading || state.newsletterSubmitted) return;

  const email = input.value.trim();
  if (!isValidEmail(email)) {
    input.reportValidity();
    return;
  }

  state.newsletterEmail = email;
  state.newsletterLoading = true;
  syncNewsletterUI();

  button.disabled = true;

  window.setTimeout(() => {
    state.newsletterLoading = false;
    state.newsletterSubmitted = true;
    syncNewsletterUI();
  }, 800);
}

function syncNewsletterUI() {
  const homeEmailInput = document.getElementById('newsletterEmail');
  const homeClearButton = document.getElementById('clearNewsletterInput');
  const allEmailInputs = [menuEmailInput, homeEmailInput].filter(Boolean);
  const allButtons = [menuSubscribeButton, document.getElementById('newsletterButton')].filter(Boolean);

  allEmailInputs.forEach((input) => {
    input.value = state.newsletterEmail;
    input.readOnly = state.newsletterSubmitted;
    input.disabled = false;
    input.setAttribute('aria-disabled', state.newsletterSubmitted ? 'true' : 'false');
    input.classList.toggle('is-locked', state.newsletterSubmitted);
  });

  allButtons.forEach((button) => {
    button.disabled = state.newsletterLoading || state.newsletterSubmitted;
    button.classList.toggle('is-loading', state.newsletterLoading);
    button.classList.toggle('is-success', state.newsletterSubmitted);
    if (!button.querySelector('.button-content-stack')) {
      button.innerHTML = renderButtonContent();
    }
  });

  const showEmailClear = state.newsletterEmail.length > 0 && !state.newsletterSubmitted;
  menuEmailInput.classList.toggle('has-clear', showEmailClear);
  homeEmailInput?.classList.toggle('has-clear', showEmailClear);
  clearEmailInputButton.classList.toggle('show', showEmailClear);
  homeClearButton?.classList.toggle('show', showEmailClear);
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function renderAboutPage() {
  app.innerHTML = `
    <section class="page">
      <h1 class="page-title">About</h1>
      <div class="page-copy">
        <p>Kristopher Pearcey writes short horror rooted in weather, coastlines, silence, memory, and the uneasy textures of Atlantic Canada.</p>
        <p>This site is built as a simple mobile-first reading space: stories up front, clean navigation, and typography that gives the writing room to breathe.</p>
        <p>His fiction leans atmospheric before it turns sharp, often beginning in ordinary rooms, roads, woods, and shorelines before letting something stranger arrive.</p>
      </div>
    </section>
  `;
  syncNewsletterUI();
}

function renderContactPage() {
  app.innerHTML = `
    <section class="page">
      <h1 class="page-title">Contact</h1>
      <div class="page-copy">
        <p>For publication inquiries, collaborations, or general correspondence, use the details below.</p>
      </div>

      <div class="contact-list">
        <div class="contact-card">
          <h3>Email</h3>
          <a href="mailto:hello@kristopherpearcey.com">hello@kristopherpearcey.com</a>
        </div>
        <div class="contact-card">
          <h3>Location</h3>
          <p>Atlantic Canada</p>
        </div>
        <div class="contact-card">
          <h3>Notes</h3>
          <p>Story rights, readings, and editorial inquiries are welcome.</p>
        </div>
      </div>
    </section>
  `;
  syncNewsletterUI();
}

async function renderStoryPage(slug) {
  const story = stories.find((item) => item.slug === slug);
  if (!story) {
    app.innerHTML = `
      <section class="page">
        <a class="back-link" href="#home">← Back home</a>
        <h1 class="page-title">Story not found</h1>
      </section>
    `;
    return;
  }

  app.innerHTML = `
    <section class="page story-article">
      <a class="back-link" href="#home">← Back home</a>
      <div class="story-header">
        <p class="story-eyebrow">${escapeHtml(story.published)}</p>
        <h1 class="story-page-title">${escapeHtml(story.title)}</h1>
        <p class="story-byline"><span>${escapeHtml(story.author)}</span><span class="sep">•</span><span>${story.pages} pages</span></p>
        <p class="story-excerpt">${escapeHtml(story.excerpt)}</p>
      </div>
      <div id="markdownBody" class="markdown-body"><p>Loading story…</p></div>
    </section>
  `;

  try {
    const response = await fetch(`stories/${slug}.md`);
    const markdown = await response.text();
    document.getElementById('markdownBody').innerHTML = parseMarkdown(markdown);
  } catch (error) {
    document.getElementById('markdownBody').innerHTML = '<p>Unable to load this story right now.</p>';
  }
}

function parseMarkdown(markdown) {
  const lines = markdown.replace(/\r/g, '').split('\n');
  let html = '';
  let paragraph = [];
  let blockquote = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    html += `<p>${inlineMarkdown(paragraph.join(' '))}</p>`;
    paragraph = [];
  };

  const flushBlockquote = () => {
    if (!blockquote.length) return;
    html += `<blockquote>${inlineMarkdown(blockquote.join(' '))}</blockquote>`;
    blockquote = [];
  };

  lines.forEach((line) => {
    if (/^###\s+/.test(line)) {
      flushParagraph();
      flushBlockquote();
      html += `<h3>${inlineMarkdown(line.replace(/^###\s+/, ''))}</h3>`;
      return;
    }
    if (/^##\s+/.test(line)) {
      flushParagraph();
      flushBlockquote();
      html += `<h2>${inlineMarkdown(line.replace(/^##\s+/, ''))}</h2>`;
      return;
    }
    if (/^>\s?/.test(line)) {
      flushParagraph();
      blockquote.push(line.replace(/^>\s?/, ''));
      return;
    }
    if (!line.trim()) {
      flushParagraph();
      flushBlockquote();
      return;
    }
    paragraph.push(line.trim());
  });

  flushParagraph();
  flushBlockquote();
  return html;
}

function inlineMarkdown(text) {
  return escapeHtml(text)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
