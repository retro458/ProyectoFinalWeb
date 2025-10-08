async function cargarReviews() {
  try {
    const res = await fetch('../json/Reviews.json');
    const reviews = await res.json();
    const contenedor = document.getElementById('review-carousel');

    reviews.forEach((r, i) => {
      const card = document.createElement('div');
      card.className = 'review-item';
      if (i === 0) card.classList.add('active');

      card.innerHTML = `
        <div class="card bg-dark text-light border-0 rounded-4 shadow p-4">
          <div class="row align-items-center">
            <div class="col-md-4 text-center">
              <img src="${r.imagen}" class="img-fluid rounded-3" alt="${r.juego}">
            </div>
            <div class="col-md-8">
              <h4>${r.juego}</h4>
              <p class="fst-italic text-secondary">"${r.comentario}"</p>
              <div class="d-flex align-items-center justify-content-between">
                <span class="fw-bold">⭐ ${r.puntuacion}/10</span>
                <span class="text-muted">– ${r.usuario}</span>
              </div>
            </div>
          </div>
        </div>
      `;

      contenedor.appendChild(card);
    });

    iniciarCarrusel();
  } catch (error) {
    console.error('Error cargando reseñas:', error);
  }
}

function iniciarCarrusel() {
  const reviews = document.querySelectorAll('.review-item');
  let index = 0;

  setInterval(() => {
    reviews[index].classList.remove('active');
    index = (index + 1) % reviews.length;
    reviews[index].classList.add('active');
  }, 5000);
}

document.addEventListener('DOMContentLoaded', cargarReviews);