async function cargarNoticiasMejorada() {
  const lista = document.getElementById("listaNoticias");
  
  try {
      // Mostrar loading
      lista.innerHTML = `
          <div class="text-center">
              <div class="spinner-border text-danger" role="status">
                  <span class="visually-hidden">Cargando...</span>
              </div>
              <p class="mt-2 text-light">Cargando noticias...</p>
          </div>`;
      
      // Intentar con timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      const response = await fetch(
          "https://api.rss2json.com/v1/api.json?rss_url=https://vandal.elespanol.com/xml.cgi",
          { signal: controller.signal }
      );
      
      clearTimeout(timeoutId);
      
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      
      const data = await response.json();
      
      if (data.status !== 'ok') throw new Error("API returned error");
      if (!data.items || data.items.length === 0) throw new Error("No items found");
      
      renderizarNoticias(data.items);
      
  } catch (error) {
      console.warn("⚠️ Usando noticias de ejemplo:", error);
      cargarNoticiasDeEjemplo();
  }
}

function renderizarNoticias(items) {
  let html = "";
  
  items.slice(0, 6).forEach((noticia) => {
      const fecha = noticia.pubDate ? new Date(noticia.pubDate).toLocaleDateString('es-ES') : '';
      const titulo = noticia.title.length > 80 ? 
          noticia.title.substring(0, 80) + '...' : noticia.title;
      
      html += `
          <div class="col-md-6 col-lg-4 mb-4">
              <div class="card h-100 bg-dark text-light border-secondary news-card">
                  <div class="card-body d-flex flex-column">
                      <div class="news-icon mb-3 text-center">
                          <i class="fas fa-gamepad text-danger fs-2"></i>
                      </div>
                      <h6 class="card-title">${titulo}</h6>
                      ${fecha ? `<p class="card-text mt-auto"><small class="text-muted"><i class="fas fa-calendar me-1"></i>${fecha}</small></p>` : ''}
                      <a href="${noticia.link}" target="_blank" class="btn btn-outline-danger btn-sm mt-2">
                          <i class="fas fa-external-link-alt me-1"></i>Leer más
                      </a>
                  </div>
              </div>
          </div>`;
  });
  
  document.getElementById("listaNoticias").innerHTML = `<div class="row">${html}</div>`;
  
  // Agregar efectos hover después de renderizar
  agregarEfectosHover();
}

function cargarNoticiasDeEjemplo() {
  const noticiasEjemplo = [
      {
          title: "Battlefield 5 ya promete contenido gratuito para su primera temporada",
          link: "#",
          pubDate: new Date().toISOString()
      },
      {
          title: "Estos 40 juegos de Steam están a su mínimo histórico en las ofertas de Otoño",
          link: "#",
          pubDate: new Date().toISOString()
      },
      {
          title: "343 Industries revelará el futuro de Halo muy pronto con Unreal Engine 5",
          link: "#", 
          pubDate: new Date().toISOString()
      },
      {
          title: "Bethesda por fin pone fecha a la esperada edición física de Skyrim Remastered",
          link: "#",
          pubDate: new Date().toISOString()
      },
      {
          title: "Ya puedes probar gratis PowerWash Simulator 2 en Steam",
          link: "#",
          pubDate: new Date().toISOString()
      },
      {
          title: "Nuevo DLC gratuito disponible para todos los jugadores esta semana",
          link: "#",
          pubDate: new Date().toISOString()
      }
  ];
  
  renderizarNoticias(noticiasEjemplo);
}

function agregarEfectosHover() {
  document.querySelectorAll('.news-card').forEach(card => {
      card.addEventListener('mouseenter', function() {
          this.style.transform = 'translateY(-5px)';
          this.style.boxShadow = '0 5px 15px rgba(255, 0, 0, 0.3)';
          this.style.borderColor = '#dc3545';
      });
      
      card.addEventListener('mouseleave', function() {
          this.style.transform = 'translateY(0)';
          this.style.boxShadow = 'none';
          this.style.borderColor = '#444';
      });
  });
}

// Iniciar
document.addEventListener('DOMContentLoaded', cargarNoticiasMejorada);