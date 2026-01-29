let allPlaces = [];
let favorites = new Set(JSON.parse(localStorage.getItem('favorites') || '[]'));
let showingFavoritesOnly = false;

fetch('data.json')
  .then(res => res.json())
  .then(data => {
    allPlaces = data;
    populateCategoryFilter();
    renderPlaces(allPlaces);
  });

function populateCategoryFilter() {
  const categories = [...new Set(allPlaces.map(p => p.category))];
  const filter = document.getElementById('categoryFilter');
  
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    filter.appendChild(option);
  });
}

function renderPlaces(places) {
  const container = document.getElementById('places');
  const emptyState = document.getElementById('emptyState');
  
  container.innerHTML = '';
  
  if (places.length === 0) {
    emptyState.style.display = 'block';
    return;
  }
  emptyState.style.display = 'none';
  
  places.forEach((place, idx) => {
    const isFavorite = favorites.has(place.name);
    const card = document.createElement('div');
    card.className = 'card';
    card.style.animationDelay = `${idx * 0.05}s`;
    card.innerHTML = `
      <div class="card-image">
        <img src="${place.image}" alt="${place.name}">
        <button class="favorite-btn ${isFavorite ? 'active' : ''}" data-place="${place.name}">
          <i class="fas fa-heart${isFavorite ? '' : ' fa-regular'}"></i>
        </button>
      </div>
      <div class="card-content">
        <h3>${place.name}</h3>
        <p class="category">${place.category}</p>
        <p class="distance">${place.distance} KM away</p>
      </div>
    `;
    
    card.querySelector('.favorite-btn').addEventListener('click', toggleFavorite);
    container.appendChild(card);
  });
}

function toggleFavorite(e) {
  const button = e.currentTarget;
  const placeName = button.dataset.place;
  const icon = button.querySelector('i');
  
  if (favorites.has(placeName)) {
    favorites.delete(placeName);
    icon.classList.remove('fas');
    icon.classList.add('fa-regular');
    button.classList.remove('active');
  } else {
    favorites.add(placeName);
    icon.classList.remove('fa-regular');
    icon.classList.add('fas');
    button.classList.add('active');
  }
  
  localStorage.setItem('favorites', JSON.stringify([...favorites]));
}

function filterAndSort() {
  let filtered = allPlaces;
  
  if (showingFavoritesOnly) {
    filtered = filtered.filter(p => favorites.has(p.name));
  }
  
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  if (searchTerm) {
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(searchTerm) ||
      p.category.toLowerCase().includes(searchTerm)
    );
  }
  
  const category = document.getElementById('categoryFilter').value;
  if (category) {
    filtered = filtered.filter(p => p.category === category);
  }
  
  const sortBy = document.getElementById('sortSelect').value;
  if (sortBy === 'distance') {
    filtered.sort((a, b) => a.distance - b.distance);
  } else if (sortBy === 'name') {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  }
  
  renderPlaces(filtered);
}

document.getElementById('searchInput').addEventListener('input', filterAndSort);
document.getElementById('categoryFilter').addEventListener('change', filterAndSort);
document.getElementById('sortSelect').addEventListener('change', filterAndSort);

document.getElementById('favoritesBtn').addEventListener('click', () => {
  showingFavoritesOnly = !showingFavoritesOnly;
  const btn = document.getElementById('favoritesBtn');
  btn.classList.toggle('active', showingFavoritesOnly);
  filterAndSort();
});

// Modal functions
function openModal(place) {
  const modal = document.getElementById('placeModal');
  
  document.getElementById('modalImage').src = place.image;
  document.getElementById('modalName').textContent = place.name;
  document.getElementById('modalDescription').textContent = place.description || 'No description available.';
  document.getElementById('modalDistance').textContent = `${place.distance} KM away`;
  document.getElementById('modalBestTime').textContent = place.bestTime || 'Year-round';
  document.getElementById('modalDifficulty').textContent = place.difficulty || 'Not specified';
  
  // Populate activities
  const activitiesContainer = document.getElementById('modalActivities');
  activitiesContainer.innerHTML = '';
  if (place.activities && place.activities.length > 0) {
    place.activities.forEach(activity => {
      const tag = document.createElement('span');
      tag.className = 'tag';
      tag.textContent = activity;
      activitiesContainer.appendChild(tag);
    });
  }
  
  // Populate facilities
  const facilitiesContainer = document.getElementById('modalFacilities');
  facilitiesContainer.innerHTML = '';
  if (place.facilities && place.facilities.length > 0) {
    place.facilities.forEach(facility => {
      const tag = document.createElement('span');
      tag.className = 'tag facility-tag';
      tag.textContent = facility;
      facilitiesContainer.appendChild(tag);
    });
  }
  
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const modal = document.getElementById('placeModal');
  modal.style.display = 'none';
  document.body.style.overflow = 'auto';
}

document.getElementById('placeModal').addEventListener('click', (e) => {
  if (e.target.id === 'placeModal') {
    closeModal();
  }
});

document.querySelector('.modal-close').addEventListener('click', closeModal);

// Close on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal();
  }
});

