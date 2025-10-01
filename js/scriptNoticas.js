async function cargarNoticias() {
    try {
      const response = await fetch("https://api.rss2json.com/v1/api.json?rss_url=https://vandal.elespanol.com/xml.cgi");
      const data = await response.json();
      let html = "";
      data.items.slice(0, 5).forEach(noticia => {
        html += `
          <li class="list-group-item bg-dark text-light">
            <a href="${noticia.link}" target="_blank" class="text-decoration-none text-light">
              ${noticia.title}
            </a>
          </li>`;
      });
      document.getElementById("listaNoticias").innerHTML = html;
    } catch (error) {
      document.getElementById("listaNoticias").innerHTML = "<li class='list-group-item bg-dark text-light'>Error al cargar noticias</li>";
      console.error(error);
    }
  }
  
  cargarNoticias();