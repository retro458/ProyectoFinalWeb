// funcionalidadesNoticias.js - VERSIÓN COMPLETA CORREGIDA AL FIN HIJUESUPTMR AAAAAAAAAA

AOS.init();

// Variables globales
let noticias = [];
let noticiasFiltradas = [];
let categoriaActiva = 'TODAS';
let terminoBusqueda = '';
let paginaActual = 1;
const NOTICIAS_POR_PAGINA = 6;

// Cargar noticias desde LocalStorage
function cargarNoticiasDesdeStorage() {
    const noticiasGuardadas = localStorage.getItem('noticiasGamer');
    noticias = noticiasGuardadas ? JSON.parse(noticiasGuardadas) : [];
    noticias.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    aplicarFiltrosYRenderizar();
}

// Aplicar filtros
function aplicarFiltros() {
    noticiasFiltradas = noticias.filter(noticia => {
        const coincideCategoria = categoriaActiva === 'TODAS' || noticia.categoria === categoriaActiva;
        const coincideBusqueda = !terminoBusqueda || 
            noticia.titulo.toLowerCase().includes(terminoBusqueda) ||
            noticia.descripcionCorta.toLowerCase().includes(terminoBusqueda);
        return coincideCategoria && coincideBusqueda;
    });
    paginaActual = 1; // Reset a página 1
}

// Renderizar noticias de la página actual
function renderizarNoticias() {
    const gridNoticias = document.getElementById('gridNoticias');
    const sinNoticias = document.getElementById('sinNoticias');
    const mensajeBusqueda = document.getElementById('mensajeBusqueda');
    
    // Mensaje de búsqueda
    if (mensajeBusqueda) {
        if (terminoBusqueda) {
            mensajeBusqueda.textContent = noticiasFiltradas.length > 0
                ? `${noticiasFiltradas.length} noticias encontradas para "${terminoBusqueda}"`
                : `No se encontraron noticias para "${terminoBusqueda}"`;
            mensajeBusqueda.classList.remove('d-none');
        } else {
            mensajeBusqueda.classList.add('d-none');
        }
    }
    
    // Obtener noticias de la página actual
    const inicio = (paginaActual - 1) * NOTICIAS_POR_PAGINA;
    const fin = inicio + NOTICIAS_POR_PAGINA;
    const noticiasPagina = noticiasFiltradas.slice(inicio, fin);
    
    // Renderizar
    if (noticiasPagina.length > 0) {
        if (sinNoticias) sinNoticias.classList.add('d-none');
        
        gridNoticias.innerHTML = noticiasPagina.map((noticia, index) => `
            <div class="col-md-6 mb-4" data-aos="fade-up" data-aos-delay="${index * 100}">
                <article class="card news-card h-100">
                    <img src="${noticia.imagen}" class="card-img-top news-image" alt="${noticia.titulo}" 
                        onerror="this.src='https://via.placeholder.com/400x200/333/666?text=Imagen+No+Disponible'">
                    <div class="card-body d-flex flex-column">
                        <span class="badge-categoria mb-2 align-self-start">${noticia.categoria}</span>
                        <h5 class="card-title">${noticia.titulo}</h5>
                        <p class="card-text flex-grow-1">${noticia.descripcionCorta}</p>
                        <div class="mt-auto">
                            <small class="text-muted">
                                <i class="fas fa-calendar me-1"></i>${new Date(noticia.fecha).toLocaleDateString('es-ES')}
                            </small>
                            <a href="../html/detalle-noticia.html?id=${noticia.id}" class="btn btn-outline-danger btn-sm float-end">
                                Leer más
                            </a>
                        </div>
                    </div>
                </article>
            </div>
        `).join('');
        
        AOS.refresh();
    } else {
        if (sinNoticias) {
            if (noticias.length === 0) {
                sinNoticias.classList.remove('d-none');
            } else {
                sinNoticias.innerHTML = `
                    <div class="col-12 text-center py-5">
                        <i class="fas fa-search fa-3x text-muted mb-3"></i>
                        <h4 class="text-muted">No se encontraron noticias</h4>
                        <p class="text-muted">Intenta con otros términos</p>
                    </div>
                `;
                sinNoticias.classList.remove('d-none');
            }
        }
        gridNoticias.innerHTML = '';
    }
}

// Generar paginación
function generarPaginacion() {
    const totalPaginas = Math.ceil(noticiasFiltradas.length / NOTICIAS_POR_PAGINA);
    const paginacion = document.getElementById('paginacion');
    const container = document.getElementById('paginacionContainer');
    
    if (totalPaginas <= 1) {
        container?.classList.add('d-none');
        return;
    }
    
    container?.classList.remove('d-none');
    
    let html = '';
    const maxVisibles = 5;
    
    // Anterior
    html += `
        <li class="page-item ${paginaActual === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" data-pagina="${paginaActual - 1}">
                <i class="fas fa-chevron-left"></i>
            </a>
        </li>
    `;
    
    // Números
    let inicio = Math.max(1, paginaActual - Math.floor(maxVisibles / 2));
    let fin = Math.min(totalPaginas, inicio + maxVisibles - 1);
    
    if (fin - inicio + 1 < maxVisibles) {
        inicio = Math.max(1, fin - maxVisibles + 1);
    }
    
    for (let i = inicio; i <= fin; i++) {
        html += `
            <li class="page-item ${paginaActual === i ? 'active' : ''}">
                <a class="page-link" href="#" data-pagina="${i}">${i}</a>
            </li>
        `;
    }
    
    // Siguiente
    html += `
        <li class="page-item ${paginaActual === totalPaginas ? 'disabled' : ''}">
            <a class="page-link" href="#" data-pagina="${paginaActual + 1}">
                <i class="fas fa-chevron-right"></i>
            </a>
        </li>
    `;
    
    if (paginacion) paginacion.innerHTML = html;
    
    // Event listeners
    document.querySelectorAll('#paginacion .page-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const pagina = parseInt(this.getAttribute('data-pagina'));
            if (pagina >= 1 && pagina <= totalPaginas) {
                cambiarPagina(pagina);
            }
        });
    });
    
    // Info de página
    actualizarInfoPagina(totalPaginas);
}

// Actualizar info de página
function actualizarInfoPagina(totalPaginas) {
    let infoPagina = document.getElementById('infoPagina');
    
    if (!infoPagina) {
        infoPagina = document.createElement('div');
        infoPagina.id = 'infoPagina';
        infoPagina.className = 'pagination-info';
        const container = document.getElementById('paginacionContainer');
        container?.parentNode.insertBefore(infoPagina, container);
    }
    
    if (noticiasFiltradas.length > 0) {
        const inicio = (paginaActual - 1) * NOTICIAS_POR_PAGINA + 1;
        const fin = Math.min(paginaActual * NOTICIAS_POR_PAGINA, noticiasFiltradas.length);
        infoPagina.innerHTML = `Página ${paginaActual} de ${totalPaginas} - Mostrando ${inicio}-${fin} de ${noticiasFiltradas.length} noticias`;
        infoPagina.classList.remove('d-none');
    } else {
        infoPagina.classList.add('d-none');
    }
}

// Cambiar página
function cambiarPagina(nuevaPagina) {
    const totalPaginas = Math.ceil(noticiasFiltradas.length / NOTICIAS_POR_PAGINA);
    
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
        paginaActual = nuevaPagina;
        renderizarNoticias();
        generarPaginacion();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Combinar filtros y renderizado
function aplicarFiltrosYRenderizar() {
    aplicarFiltros();
    renderizarNoticias();
    actualizarNoticiasPopulares();
    generarPaginacion();
}

// Noticias populares (sidebar)
function actualizarNoticiasPopulares() {
    const noticiasPopulares = document.getElementById('noticiasPopulares');
    const noticiasRecientes = noticias.slice(0, 3);
    
    if (noticiasPopulares) {
        noticiasPopulares.innerHTML = noticiasRecientes.length > 0
            ? noticiasRecientes.map(noticia => `
                <a href="../html/detalle-noticia.html?id=${noticia.id}" class="list-group-item list-group-item-action">
                    <div class="d-flex w-100 justify-content-between">
                        <small class="text-muted">${new Date(noticia.fecha).toLocaleDateString('es-ES')}</small>
                    </div>
                    <strong class="mb-1">${noticia.titulo}</strong>
                </a>
            `).join('')
            : `<div class="text-center text-muted py-3">
                <i class="fas fa-newspaper fa-2x mb-2"></i>
                <p>No hay noticias</p>
            </div>`;
    }
}

// Búsqueda
function buscarNoticias() {
    terminoBusqueda = document.getElementById('inputBusqueda').value.toLowerCase().trim();
    aplicarFiltrosYRenderizar();
}

function limpiarBusqueda() {
    document.getElementById('inputBusqueda').value = '';
    terminoBusqueda = '';
    aplicarFiltrosYRenderizar();
}

// Filtrar por categoría
function filtrarPorCategoria(categoria) {
    categoriaActiva = categoria;
    
    document.querySelectorAll('.categoria-filtro').forEach(badge => {
        badge.classList.remove('bg-danger');
        badge.classList.add('bg-secondary');
    });
    
    document.querySelector(`[data-categoria="${categoria}"]`)?.classList.remove('bg-secondary');
    document.querySelector(`[data-categoria="${categoria}"]`)?.classList.add('bg-danger');
    
    aplicarFiltrosYRenderizar();
}

function limpiarFiltros() {
    document.getElementById('inputBusqueda').value = '';
    terminoBusqueda = '';
    filtrarPorCategoria('TODAS');
}

// Inicializar eventos
function inicializarEventos() {
    const btnBuscar = document.getElementById('btnBuscar');
    const inputBusqueda = document.getElementById('inputBusqueda');
    const btnLimpiarBusqueda = document.getElementById('btnLimpiarBusqueda');
    const btnLimpiarFiltros = document.getElementById('btnLimpiarFiltros');
    
    btnBuscar?.addEventListener('click', buscarNoticias);
    inputBusqueda?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') buscarNoticias();
    });
    btnLimpiarBusqueda?.addEventListener('click', limpiarBusqueda);
    btnLimpiarFiltros?.addEventListener('click', limpiarFiltros);

    document.querySelectorAll('.categoria-filtro').forEach(badge => {
        badge.addEventListener('click', () => {
            filtrarPorCategoria(badge.dataset.categoria);
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') limpiarFiltros();
    });

    window.addEventListener('focus', cargarNoticiasDesdeStorage);
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    console.log('Iniciando sistema de noticias...');
    cargarNoticiasDesdeStorage();
    inicializarEventos();
});