let wallpapers = [];

async function cargarWallpapers() {
  try {
    const res = await fetch('../json/wallpapers.json');
    wallpapers = await res.json();

    renderCategorias();
    renderWallpapers(wallpapers);
  } catch (err) {
    console.error('Error al cargar wallpapers:', err);
  }
}

function renderCategorias() {
  const categorias = [...new Set(wallpapers.map(wp => wp.categoria))];
  const select = document.getElementById('filterCategoria');

  categorias.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    select.appendChild(opt);
  });
}

function renderWallpapers(lista) {
  const grid = document.getElementById('wallpapersGrid');
  grid.innerHTML = '';

  if (lista.length === 0) {
    grid.innerHTML = `<div class="text-center text-muted">No se encontraron resultados.</div>`;
    return;
  }

  lista.forEach(wp => {
    const card = document.createElement('div');
    card.classList.add('col-md-4', 'col-lg-3', 'mb-4');

    card.innerHTML = `
      <div class="card h-100 shadow-sm">
        <img src="${wp.preview}" class="card-img-top" alt="${wp.titulo}">
        <div class="card-body">
          <h5 class="card-title">${wp.titulo}</h5>
          <p class="text-muted mb-2">${wp.categoria} | ${wp.resolucion}</p>
        </div>
        <div class="card-footer text-center">
          <a href="${wp.imagen}" download class="btn btn-outline-danger w-100">
            <i class="fa-solid fa-download"></i> Descargar
          </a>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function filtrarWallpapers() {
  const busqueda = document.getElementById('searchInput').value.toLowerCase();
  const categoria = document.getElementById('filterCategoria').value;

  const filtrados = wallpapers.filter(wp =>
    wp.titulo.toLowerCase().includes(busqueda) &&
    (categoria === '' || wp.categoria === categoria)
  );

  renderWallpapers(filtrados);
}

document.addEventListener('DOMContentLoaded', () => {
  cargarWallpapers();
  document.getElementById('searchInput').addEventListener('input', filtrarWallpapers);
  document.getElementById('filterCategoria').addEventListener('change', filtrarWallpapers);
});
