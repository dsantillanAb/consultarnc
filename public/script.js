// Cambiar entre tabs
function switchTab(tab) {
    const tabRnc = document.getElementById('tab-rnc');
    const tabNombre = document.getElementById('tab-nombre');
    
    if (tab === 'rnc') {
        tabRnc.className = 'flex-1 py-3 px-4 text-center font-semibold text-[var(--medium-green)] border-b-2 border-[var(--medium-green)]';
        tabNombre.className = 'flex-1 py-3 px-4 text-center font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors duration-200';
        document.getElementById('rnc-search').style.display = 'flex';
        document.getElementById('nombre-search').style.display = 'none';
    } else {
        tabNombre.className = 'flex-1 py-3 px-4 text-center font-semibold text-[var(--medium-green)] border-b-2 border-[var(--medium-green)]';
        tabRnc.className = 'flex-1 py-3 px-4 text-center font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors duration-200';
        document.getElementById('nombre-search').style.display = 'flex';
        document.getElementById('rnc-search').style.display = 'none';
    }
    
    document.getElementById('results').innerHTML = '';
}

// Buscar por RNC
async function buscarPorRNC() {
    const rnc = document.getElementById('rnc-input').value.trim();
    
    if (!rnc) {
        mostrarError('Por favor ingresa un RNC');
        return;
    }
    
    mostrarLoading(true);
    
    try {
        const response = await fetch(`/api/rnc/${rnc}`);
        const data = await response.json();
        
        if (response.ok) {
            mostrarResultado(data);
        } else {
            mostrarError(data.error || 'RNC no encontrado');
        }
    } catch (error) {
        mostrarError('Error al realizar la búsqueda');
    } finally {
        mostrarLoading(false);
    }
}

// Buscar por nombre
async function buscarPorNombre() {
    const nombre = document.getElementById('nombre-input').value.trim();
    
    if (!nombre) {
        mostrarError('Por favor ingresa un nombre');
        return;
    }
    
    mostrarLoading(true);
    
    try {
        const response = await fetch(`/api/buscar?nombre=${encodeURIComponent(nombre)}&limit=20`);
        const data = await response.json();
        
        if (response.ok) {
            if (data.length === 0) {
                mostrarError('No se encontraron resultados');
            } else {
                mostrarResultados(data);
            }
        } else {
            mostrarError(data.error || 'Error en la búsqueda');
        }
    } catch (error) {
        mostrarError('Error al realizar la búsqueda');
    } finally {
        mostrarLoading(false);
    }
}

// Mostrar un resultado
function mostrarResultado(data) {
    const resultsDiv = document.getElementById('results');
    const estadoBadge = data.estado === 'ACTIVO' 
        ? '<span class="inline-flex items-center px-3 py-1 mt-1 text-sm font-semibold text-green-800 bg-green-100 rounded-full border border-green-200"><span class="w-2 h-2 mr-2 bg-green-500 rounded-full"></span>ACTIVO</span>'
        : '<span class="inline-flex items-center px-3 py-1 mt-1 text-sm font-semibold text-red-800 bg-red-100 rounded-full border border-red-200"><span class="w-2 h-2 mr-2 bg-red-500 rounded-full"></span>' + data.estado + '</span>';
    
    resultsDiv.innerHTML = `
        <section class="bg-white p-6 md:p-8 rounded-lg border border-gray-200 shadow-sm">
            <div class="border-b border-gray-200 pb-4 mb-6">
                <h2 class="text-xl font-bold text-gray-900">${data.razon_social}</h2>
                <p class="text-sm text-gray-500 mt-1">RNC: ${data.rnc}</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                    <h3 class="text-sm font-medium text-gray-500">Estado</h3>
                    ${estadoBadge}
                </div>
                <div>
                    <h3 class="text-sm font-medium text-gray-500">Fecha de Inicio</h3>
                    <p class="text-base font-semibold text-gray-900 mt-1">${data.fecha_inicio_operaciones || 'N/A'}</p>
                </div>
                <div>
                    <h3 class="text-sm font-medium text-gray-500">Régimen de Pago</h3>
                    <p class="text-base font-semibold text-gray-900 mt-1">${data.regimen_pago}</p>
                </div>
            </div>
            <div>
                <h3 class="text-sm font-medium text-gray-500">Actividad Económica</h3>
                <p class="text-base text-gray-800 mt-1">${data.actividad_economica || 'N/A'}</p>
            </div>
        </section>
    `;
}

// Mostrar múltiples resultados
function mostrarResultados(data) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `
        <section class="bg-white p-6 md:p-8 rounded-lg border border-gray-200 shadow-sm">
            <h3 class="text-xl font-bold text-gray-900 mb-6">Se encontraron ${data.length} resultado(s)</h3>
            <div class="space-y-4">
                ${data.map(item => {
                    const estadoBadge = item.estado === 'ACTIVO' 
                        ? '<span class="inline-flex items-center px-3 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full border border-green-200"><span class="w-2 h-2 mr-2 bg-green-500 rounded-full"></span>ACTIVO</span>'
                        : '<span class="inline-flex items-center px-3 py-1 text-xs font-semibold text-red-800 bg-red-100 rounded-full border border-red-200"><span class="w-2 h-2 mr-2 bg-red-500 rounded-full"></span>' + item.estado + '</span>';
                    
                    return `
                        <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div class="flex justify-between items-start mb-3">
                                <div>
                                    <h4 class="font-bold text-gray-900">${item.razon_social}</h4>
                                    <p class="text-sm text-gray-500">RNC: ${item.rnc}</p>
                                </div>
                                ${estadoBadge}
                            </div>
                            <div class="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span class="text-gray-500">Régimen:</span>
                                    <span class="font-semibold text-gray-900 ml-1">${item.regimen_pago}</span>
                                </div>
                                <div>
                                    <span class="text-gray-500">Fecha:</span>
                                    <span class="font-semibold text-gray-900 ml-1">${item.fecha_inicio_operaciones || 'N/A'}</span>
                                </div>
                            </div>
                            <div class="mt-3 text-sm">
                                <span class="text-gray-500">Actividad:</span>
                                <p class="text-gray-800 mt-1">${item.actividad_economica || 'N/A'}</p>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </section>
    `;
}

// Mostrar error
function mostrarError(mensaje) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `
        <section class="bg-white p-6 md:p-8 rounded-lg border border-red-200 shadow-sm">
            <div class="flex items-center gap-3 text-red-800">
                <span class="material-symbols-outlined text-3xl">error</span>
                <p class="text-lg font-semibold">${mensaje}</p>
            </div>
        </section>
    `;
}

// Mostrar/ocultar loading
function mostrarLoading(show) {
    document.getElementById('loading').style.display = show ? 'block' : 'none';
    if (!show) {
        document.getElementById('results').style.display = 'block';
    }
}

// Cargar estadísticas al inicio
async function cargarEstadisticas() {
    try {
        const response = await fetch('/api/stats');
        const data = await response.json();
        
        const statsContent = document.getElementById('stats-content');
        statsContent.innerHTML = `
            <div class="bg-[var(--dark-green)] text-white p-6 rounded-lg shadow-lg">
                <p class="text-sm text-gray-300">Total Contribuyentes</p>
                <p class="text-4xl font-bold mt-1">${data.total.toLocaleString()}</p>
            </div>
            <div class="bg-[var(--dark-green)] text-white p-6 rounded-lg shadow-lg">
                <p class="text-sm text-gray-300">Activos</p>
                <p class="text-4xl font-bold mt-1">${data.activos.toLocaleString()}</p>
            </div>
            ${data.regimenes.map(r => `
                <div class="bg-[var(--dark-green)] text-white p-6 rounded-lg shadow-lg">
                    <p class="text-sm text-gray-300">Régimen ${r.regimen_pago}</p>
                    <p class="text-4xl font-bold mt-1">${parseInt(r.cantidad).toLocaleString()}</p>
                </div>
            `).join('')}
        `;
    } catch (error) {
        console.error('Error cargando estadísticas:', error);
    }
}

// Enter para buscar
document.addEventListener('DOMContentLoaded', () => {
    cargarEstadisticas();
    
    document.getElementById('rnc-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') buscarPorRNC();
    });
    
    document.getElementById('nombre-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') buscarPorNombre();
    });
});
