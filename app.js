const API_KEY = '843bf643f30d8b0ad4d1856b270139f7'; 
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_URL = 'https://image.tmdb.org/t/p/w500';

const seriesGrid    = document.getElementById('series-grid');//utilizado
const loadingDiv    = document.getElementById('loading');//utilizado
const errorDiv      = document.getElementById('error');//utilizado
const errorMessage  = document.getElementById('error-message'); //utilizado
const resultsTitle  = document.getElementById('results-title'); //utilizado
const resultsCount  = document.getElementById('results-count'); //utilizado
const searchInput   = document.getElementById('search'); //utilizado
const clearBtn      = document.getElementById('clear-search');//utilizado
const retryBtn      = document.getElementById('retry-btn');//utilizado
const themeToggle   = document.getElementById('theme-toggle');
const modal         = document.getElementById('serie-modal');//utilizado
const modalBody     = document.getElementById('modal-body'); //utilizado
const modalClose    = document.getElementById('modal-close');//utilizado
const modalOverlay  = document.getElementById('modal-overlay');//utilizado


// ============================================================================
// UTILIDADES DE UI (DADO - no modificar)
// ============================================================================
const mostrarLoading = () => {
    loadingDiv.style.display = 'flex';
    errorDiv.style.display = 'none';
    seriesGrid.innerHTML = '';
}

const ocultarLoading = () => {
    loadingDiv.style.display = 'none';
};

const mostrarError = (mensaje) => {
    ocultarLoading();
    errorMessage.textContent = mensaje;
    errorDiv.style.display = 'flex';
    seriesGrid.innerHTML = '';
};


// ============================================================================
// DARK MODE (DADO - no modificar)
// ============================================================================
const aplicarTema = (tema) => {
    document.documentElement.setAttribute('data-theme', tema);
    themeToggle.textContent = tema === 'dark' ? '☀️' : '🌙';
    localStorage.setItem('theme', tema);
};

const cargarTema = () => {
    const guardado = localStorage.getItem('theme');
    const preferido = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    aplicarTema(guardado || preferido);
};

themeToggle.addEventListener('click', () => {
    const actual = document.documentElement.getAttribute('data-theme');
    aplicarTema(actual === 'dark' ? 'light' : 'dark');
});

cargarTema();


// ############################################################################
// #                                                                          #
// #                          TU CÓDIGO AQUÍ                    #
// #                                                                          #
// ############################################################################

    
const obtenerSeriesPopulares = async() => {
    const url = `${BASE_URL}/tv/popular?api_key=${API_KEY}&language=es-ES`;
    const respuesta = await fetch(url);
    if (!respuesta.ok) {
        throw new Error(`Error en la consulta`);
    }
    const datos = await respuesta.json();
    return datos.results;
}   

const probarSeries = async () => {
    try {
        const series = await obtenerSeriesPopulares();
        console.log(series);
    } catch (error) {
        console.error('Error al obtener las series:', error);
    }
};

//probarSeries(); pruebas previas en consola

const crearTarjetaSerie = (serie) => {
    const { poster_path, name, first_air_date, vote_average } = serie;
    const año = first_air_date? first_air_date.split('-')[0]:'N/A';
    const imagen = poster_path?`${IMAGE_URL}${poster_path}`: '';
    const rating = vote_average?vote_average.toFixed(1):'N/A';

    return `
        <article class="serie-card" data-id="${serie.id}">
            <div class="serie-card__poster">
                <img class="serie-card__image" src="${imagen}" alt="${name}">
                <span class="serie-card__rating">★ ${rating}</span>
            </div>

            <div class="serie-card__content">
                <h3 class="serie-card__title">${name}</h3>
                <p class="serie-card__year">${año}</p>
            </div>
        </article>
    `;
};

const probarTarjeta = async () => {
    try {
        const series = await obtenerSeriesPopulares();

        console.log('Series recibidas:', series);
        console.log('Primera serie:', series[0]);
        console.log('Tarjeta generada:', crearTarjetaSerie(series[0]));

    } catch (error) {
        console.error('Error al obtener las series:', error);
    }
};
probarTarjeta(); // pruebas previas en consola


const buscarSeries = async (consulta) => {
    const url = `${BASE_URL}/search/tv?api_key=${API_KEY}&language=es-ES&query=${encodeURIComponent(consulta)}`;
    const respuesta = await fetch(url);
    if (!respuesta.ok) {
        throw new Error(`Error en la consulta`);
    }
    const datos = await respuesta.json();
    return datos.results;
};

const mostrarSeries = (series) => {
    seriesGrid.innerHTML = series.map(crearTarjetaSerie).join('');
    resultsCount.textContent = `${series.length} resultados`;
};

const cargarSeriesPopulares = async () => {
    mostrarLoading();
    try {
        const series = await obtenerSeriesPopulares();
        mostrarSeries(series);
        resultsTitle.textContent = 'Series Populares';
        ocultarLoading();
    } catch (error) {
        console.error('Error al cargar series populares:', error);
        mostrarError(error.message);
    }
};

clearBtn.addEventListener('click', async () => {
    searchInput.value = '';
    await cargarSeriesPopulares();
});

searchInput.addEventListener('input', async () => {
    const consulta = searchInput.value.trim();
    mostrarLoading();
    try {
        const series = await buscarSeries(consulta);
        mostrarSeries(series);
        resultsTitle.textContent = 'Resultados';
        ocultarLoading();
    } catch (error) {
        console.error('Error al buscar series:', error);
        let mensaje = 'No se pudieron encontrar las series';
        if (error.message.includes('401')) {
            mensaje = 'API Key invAlida';
        } else if (error.message.includes('fetch')) {
            mensaje = 'Error de red';
        }
        mostrarError(mensaje);
    }
});

const obtenerDetallesSerie = async (id) => {
    const url = `${BASE_URL}/tv/${id}?api_key=${API_KEY}&language=es-ES`;
    const respuesta = await fetch(url);

    if (!respuesta.ok) {
        throw new Error(`Error HTTP ${respuesta.status}`);
    }
    const serie = await respuesta.json();
    return serie;
};

const mostrarDetallesSerie = (serie) => {
    const generos = serie.genres.length > 0 ? serie.genres.map(genero => genero.name).join(', '):'No disponible';
    modalBody.innerHTML = `
        <div class="serie-detalle">
            <div class="serie-detalle__contenido">
                <p>
                    <strong>Sinopsis:</strong>
                    ${serie.overview}
                </p>
                <p>
                    <strong>Temporadas:</strong>
                    ${serie.number_of_seasons}
                </p>
                <p>
                    <strong>Episodios:</strong>
                    ${serie.number_of_episodes}
                </p>
                <p>
                    <strong>Géneros:</strong>
                    ${generos}
                </p>
                <p>
                    <strong>Estado:</strong>
                    ${serie.status}
                </p>
            </div>
        </div>
    `;
    modal.style.display = 'block';
};

seriesGrid.addEventListener('click', async (event) => {
    const tarjeta = event.target.closest('.serie-card');
    const id = tarjeta.getAttribute('data-id');
    try {
        const serie = await obtenerDetallesSerie(id);
        mostrarDetallesSerie(serie);
    } catch (error) {
        console.error('Error al obtener los detalles:', error);
        alert('No se pudieron cargar los detalles de la serie.');
    }
});


const cerrarModal = () => {
    modal.style.display = 'none';
};

modalClose.addEventListener('click', cerrarModal);
modalOverlay.addEventListener('click', cerrarModal);

cargarSeriesPopulares();
