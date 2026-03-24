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
const menuButton = document.getElementById('menuButton');
const mobileMenu = document.getElementById('mobileMenu');
const menuOverlay = document.getElementById('menuOverlay');

menuButton.addEventListener('click', () => {
  setMenuState(!mobileMenu.classList.contains('open'));
});

menuOverlay.addEventListener('click', () => setMenuState(false));

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setMenuState(false);
});

mobileMenu.querySelectorAll('[data-nav]').forEach((link) => {
  link.addEventListener('click', () => setMenuState(false));
});

window.addEventListener('hashchange', () => {
  setMenuState(false);
  renderRoute();
});

window.addEventListener('DOMContentLoaded', renderRoute);
window.addEventListener('resize', () => {
  if (window.innerWidth >= 760) {
    document.body.style.overflow = '';
    menuOverlay.hidden = true;
  }
});

function setMenuState(isOpen) {
  mobileMenu.classList.toggle('open', isOpen);
  menuButton.classList.toggle('is-open', isOpen);
  menuButton.setAttribute('aria-expanded', String(isOpen));
  mobileMenu.setAttribute('aria-hidden', String(!isOpen));

  const showOverlay = isOpen && window.innerWidth >= 760;
  menuOverlay.hidden = !showOverlay;
  document.body.style.overflow = isOpen && window.innerWidth < 760 ? 'hidden' : '';
}

function renderRoute() {
  const hash = window.location.hash.replace(/^#/, '') || 'home';
  const [route, slug] = hash.split('/');

  if (route === 'story' && slug) return renderStoryPage(slug);
  if (route === 'about') return renderAboutPage();
  if (route === 'contact') return renderContactPage();
  return renderHomePage();
}

function getFilteredStories() {
  return stories.filter((story) => {
    const haystack = `${story.title} ${story.description} ${story.author} ${story.published} ${story.year} ${story.pages}`.toLowerCase();
    return haystack.includes(state.query.toLowerCase().trim());
  });
}

function currentViewIcon() {
  return state.view === 'card' ? 'view_stream' : 'notes';
}

function renderHomePage() {
  app.innerHTML = `
    <section class="page home-page">
      <div class="hero">
        <div class="hero-card">
          <img class="hero-image" src="assets/hero-river.png" alt="River and forest landscape at dusk" />
        </div>
        <div class="hero-copy">
          <h1 class="hero-title">Short Horror from Atlantic Canada</h1>
          <a class="hero-readmore" id="exploreCollection" href="#stories">Explore the Collection</a>
        </div>
      </div>

      <div class="section-head" id="stories">
        <div class="section-kicker">Stories</div>
      </div>

      <div class="search-row">
        <input id="storySearch" class="search-input" type="search" placeholder="Search stories" value="${escapeHtml(state.query)}" aria-label="Search stories" />
        <button id="viewToggle" class="view-toggle" type="button" aria-label="Switch view" title="${state.view === 'card' ? 'Switch to list view' : 'Switch to card view'}">
          <span class="material-symbols-outlined">${currentViewIcon()}</span>
        </button>
      </div>

      <div id="storyGrid" class="story-grid ${state.view === 'list' ? 'list-view' : ''}">
        ${renderStoriesMarkup(getFilteredStories())}
      </div>

      ${renderNewsletterMarkup()}
    </section>
  `;

  const searchInput = document.getElementById('storySearch');
  const viewToggle = document.getElementById('viewToggle');
  const exploreCollection = document.getElementById('exploreCollection');

  searchInput.addEventListener('input', (event) => {
    state.query = event.target.value;
    updateStories();
  });

  viewToggle.addEventListener('click', () => {
    state.view = state.view === 'card' ? 'list' : 'card';
    viewToggle.querySelector('.material-symbols-outlined').textContent = currentViewIcon();
    viewToggle.title = state.view === 'card' ? 'Switch to list view' : 'Switch to card view';
    updateStories();
  });

  exploreCollection.addEventListener('click', (event) => {
    event.preventDefault();
    const target = document.getElementById('stories');
    if (!target) return;
    const top = target.getBoundingClientRect().top + window.scrollY - 18;
    window.scrollTo({ top, behavior: 'smooth' });
  });

  wireNewsletter();
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

function renderNewsletterMarkup() {
  const buttonContent = state.newsletterLoading
    ? '<span class="spinner" aria-hidden="true"></span><span>Subscribing…</span>'
    : state.newsletterSubmitted
      ? 'Thank you!'
      : 'Subscribe';

  return `
    <section class="newsletter-block" aria-labelledby="newsletterTitle">
      <h2 id="newsletterTitle" class="newsletter-title">Looking for more?</h2>
      <p class="newsletter-copy">Join the mailing list — get notified when new stories are posted!</p>
      <form id="newsletterForm" class="newsletter-form">
        <input
          id="newsletterEmail"
          class="newsletter-input"
          type="email"
          placeholder="Email address"
          value="${escapeHtml(state.newsletterEmail)}"
          ${state.newsletterSubmitted ? 'disabled' : ''}
          aria-label="Email address"
          required
        />
        <button
          id="newsletterButton"
          class="newsletter-button ${state.newsletterSubmitted ? 'is-success' : ''}"
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
  if (!form || !emailInput || !button) return;

  emailInput.addEventListener('input', (event) => {
    state.newsletterEmail = event.target.value;
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (state.newsletterLoading || state.newsletterSubmitted) return;

    const email = emailInput.value.trim();
    if (!isValidEmail(email)) {
      emailInput.reportValidity();
      return;
    }

    state.newsletterEmail = email;
    state.newsletterLoading = true;
    button.disabled = true;
    button.innerHTML = '<span class="spinner" aria-hidden="true"></span><span>Subscribing…</span>';

    window.setTimeout(() => {
      state.newsletterLoading = false;
      state.newsletterSubmitted = true;
      emailInput.disabled = true;
      button.disabled = true;
      button.classList.add('is-success');
      button.textContent = 'Thank you!';
    }, 800);
  });
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
