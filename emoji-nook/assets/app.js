const cards = [...document.querySelectorAll('.emoji-card')];
const filters = [...document.querySelectorAll('.filter-button')];
const search = document.querySelector('#emoji-search');
const emptyState = document.querySelector('#empty-state');
const toast = document.querySelector('#copy-toast');
let activeFilter = 'all';
let toastTimer;

async function copyText(value) {
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    const field = document.createElement('textarea');
    field.value = value;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.opacity = '0';
    document.body.append(field);
    field.select();
    document.execCommand('copy');
    field.remove();
  }

  window.clearTimeout(toastTimer);
  toast.textContent = `Copied ${value}`;
  toast.classList.add('show');
  toastTimer = window.setTimeout(() => toast.classList.remove('show'), 1800);
}

function updateCards() {
  const query = search.value.trim().toLowerCase();
  let visibleCount = 0;

  cards.forEach((card) => {
    const matchesFilter = activeFilter === 'all' || card.dataset.category === activeFilter;
    const haystack = `${card.dataset.copy} ${card.dataset.label} ${card.dataset.category}`.toLowerCase();
    const matchesSearch = !query || haystack.includes(query);
    const visible = matchesFilter && matchesSearch;
    card.hidden = !visible;
    if (visible) visibleCount += 1;
  });

  emptyState.hidden = visibleCount !== 0;
}

cards.forEach((card) => card.addEventListener('click', () => copyText(card.dataset.copy)));

filters.forEach((button) => {
  button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    filters.forEach((filter) => {
      const selected = filter === button;
      filter.classList.toggle('active', selected);
      filter.setAttribute('aria-pressed', String(selected));
    });
    updateCards();
  });
});

search.addEventListener('input', updateCards);
document.querySelector('#current-year').textContent = new Date().getFullYear();
