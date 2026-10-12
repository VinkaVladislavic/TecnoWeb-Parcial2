const API_KEY = '843bf643f30d8b0ad4d1856b270139f7'; 
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_URL = 'https://image.tmdb.org/t/p/w500';

const seriesGrid    = document.getElementById('series-grid');
const loadingDiv    = document.getElementById('loading');
const errorDiv      = document.getElementById('error');
const errorMessage  = document.getElementById('error-message');
const resultsTitle  = document.getElementById('results-title'); //utilizado
const resultsCount  = document.getElementById('results-count'); //utilizado
const searchInput   = document.getElementById('search'); //utilizado
const clearBtn      = document.getElementById('clear-search');
const retryBtn      = document.getElementById('retry-btn');
const themeToggle   = document.getElementById('theme-toggle');
const modal         = document.getElementById('serie-modal');
const modalBody     = document.getElementById('modal-body');
const modalClose    = document.getElementById('modal-close');
const modalOverlay  = document.getElementById('modal-overlay');


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
    const imagen = poster_path?`${IMAGE_URL}${poster_path}`: 'Error en la carga de la imagen';
    const rating = vote_average?vote_average.toFixed(1):'N/A';

    return `
        <article class="serie-card">
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
        throw new Error(`Error en la consulta`,error);
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
    const series = await obtenerSeriesPopulares();
    mostrarSeries(series);
    resultsTitle.textContent = 'Series Populares';
    ocultarLoading();
};

clearBtn.addEventListener('click', async () => {
    searchInput.value = '';
    await cargarSeriesPopulares();
});

cargarSeriesPopulares();
