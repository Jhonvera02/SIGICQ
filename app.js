/**
 * SIGICQ - Motor de Aplicación Principal (app.js)
 * Versión 3.0: Soporta inicio de sesión, ETA, Órdenes de Compra y Control de Precios con Análisis.
 */

// Estado Global de la Aplicación
let state = {
    inventory: [],
    requests: [],
    activeRole: null, // Se establecerá tras el inicio de sesión
    currentView: 'dashboard',
    theme: 'dark'
};

// Configuración de Roles y Permisos de las Áreas (dinámicos)
let ROLES = {};

const SEED_USERS = [
    { username: 'produccion', name: 'Carlos Gómez', roleLabel: 'Jefe de Producción', area: 'Producción', password: '123', permissions: ['dashboard', 'inventory', 'requests', 'containers', 'alerts', 'history'] },
    { username: 'logistica', name: 'Raúl Méndez', roleLabel: 'Jefe de Logística', area: 'Logística', password: '123', permissions: ['dashboard', 'inventory', 'requests', 'alerts', 'history'] },
    { username: 'comercial', name: 'Dr. Luis Torres', roleLabel: 'Jefe Comercial', area: 'Comercial', password: '123', permissions: ['dashboard', 'inventory', 'requests', 'alerts', 'history'] },
    { username: 'mantenimiento', name: 'Ing. Héctor Silva', roleLabel: 'Jefe de Mantenimiento', area: 'Mantenimiento', password: '123', permissions: ['dashboard', 'inventory', 'requests', 'alerts', 'history'] },
    { username: 'compras', name: 'Lucía Ortiz', roleLabel: 'Encargada de Compras', area: 'Compras', password: '123', permissions: ['dashboard', 'inventory', 'requests', 'approvals', 'purchase_orders', 'price_control', 'alerts', 'history'] },
    { username: 'gerente', name: 'Ing. Roberto Prado', roleLabel: 'Gerente General', area: 'Gerencia', password: '123', permissions: ['dashboard', 'inventory', 'requests', 'approvals', 'purchase_orders', 'price_control', 'alerts', 'history'] },
    { username: 'sistemas', name: 'Administrador de Sistemas', roleLabel: 'Jefe de Sistemas', area: 'Sistemas', password: '123', permissions: ['dashboard', 'inventory', 'requests', 'approvals', 'purchase_orders', 'price_control', 'alerts', 'history', 'systems'] }
];

// Datos Semilla (Seed Data) en caso de que localStorage esté vacío
const SEED_INVENTORY = [
    { id: 'mp_1', name: 'Alcohol Etílico', category: 'materia_prima', stock: 1200, min: 500, max: 5000, unit: 'L', price: 5000 },
    { id: 'mp_2', name: 'Ácido Sulfúrico', category: 'materia_prima', stock: 250, min: 200, max: 1000, unit: 'L', price: 12000 },
    { id: 'mp_3', name: 'Soda Cáustica', category: 'materia_prima', stock: 80, min: 150, max: 800, unit: 'kg', price: 8500 },
    { id: 'mp_4', name: 'Glicerina USP', category: 'materia_prima', stock: 45, min: 100, max: 500, unit: 'kg', price: 15000 },
    { id: 'pt_1', name: 'Gel Antibacterial 70%', category: 'producto_terminado', stock: 850, min: 200, max: 2000, unit: 'Unidades', price: 18000 },
    { id: 'pt_2', name: 'Desinfectante Multiusos', category: 'producto_terminado', stock: 140, min: 100, max: 1000, unit: 'Unidades', price: 15000 },
    { id: 'pt_3', name: 'Jabón Líquido Neutro', category: 'producto_terminado', stock: 500, min: 150, max: 1500, unit: 'Unidades', price: 12000 },
    { id: 'en_1', name: 'Botella PET 500ml', category: 'envase', stock: 4500, min: 1000, max: 10000, unit: 'Unidades', price: 450 },
    { id: 'en_2', name: 'Galón PEAD 4L', category: 'envase', stock: 900, min: 500, max: 3000, unit: 'Unidades', price: 1500 },
    { id: 'en_3', name: 'Caneca Plástica 20L', category: 'envase', stock: 8, min: 50, max: 250, unit: 'Unidades', price: 12000 },
    { id: 'en_4', name: 'Tambor Metálico 200L', category: 'envase', stock: 35, min: 20, max: 100, unit: 'Unidades', price: 95000 },
    { id: 'et_1', name: 'Etiqueta Gel 500ml', category: 'etiqueta', stock: 6000, min: 1500, max: 12000, unit: 'Unidades', price: 80 },
    { id: 'et_2', name: 'Etiqueta Galón Desinfectante', category: 'etiqueta', stock: 200, min: 600, max: 4000, unit: 'Unidades', price: 150 },
    { id: 'me_1', name: 'Caja de Cartón x12', category: 'empaque', stock: 450, min: 100, max: 1000, unit: 'Unidades', price: 2500 },
    { id: 'me_2', name: 'Película Estirable (Film)', category: 'empaque', stock: 12, min: 10, max: 50, unit: 'Rollos', price: 45000 }
];

const SEED_REQUESTS = [
    {
        id: 'REQ-101',
        area: 'Producción',
        product: 'Soda Cáustica',
        quantity: 200,
        unit: 'kg',
        justification: 'Completar lote de Jabón Neutro programado',
        requester: 'Carlos Gómez',
        requestedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'recibido',
        totalCost: 1600000,
        priceBase: 8500,
        priceReal: 8000, // Ahorro de 500 por kg
        requiresGerencia: false,
        eta: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        approvalFlow: [
            { role: 'produccion', action: 'Solicitado', by: 'Carlos Gómez', date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString() },
            { role: 'compras', action: 'Orden de Compra Generada - ETA: ' + new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + ' - Precio Real: $8.000', by: 'Lucía Ortiz', date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() },
            { role: 'bodega', action: 'Recibido en Bodega', by: 'Lucía Ortiz (Compras)', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() }
        ]
    },
    {
        id: 'REQ-102',
        area: 'Mantenimiento',
        product: 'Película Estirable (Film)',
        quantity: 10,
        unit: 'Rollos',
        justification: 'Paletizado de despachos críticos',
        requester: 'Héctor Silva',
        requestedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'en_compra',
        totalCost: 450000,
        priceBase: 45000,
        priceReal: 45000,
        requiresGerencia: false,
        eta: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        approvalFlow: [
            { role: 'mantenimiento', action: 'Solicitado', by: 'Héctor Silva', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
            { role: 'compras', action: 'Orden de Compra Generada - ETA: ' + new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + ' - Precio Real: $45.000', by: 'Lucía Ortiz', date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() }
        ]
    },
    {
        id: 'REQ-103',
        area: 'Comercial',
        product: 'Botella PET 500ml',
        quantity: 2000,
        unit: 'Unidades',
        justification: 'Stock inicial de envase para nuevo cliente institucional',
        requester: 'Luis Torres',
        requestedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'aprobado', // Espera que compras le genere la orden
        totalCost: 900000,
        priceBase: 450,
        requiresGerencia: false,
        approvalFlow: [
            { role: 'comercial', action: 'Solicitado', by: 'Luis Torres', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() }
        ]
    },
    {
        id: 'REQ-104',
        area: 'Logística',
        product: 'Caneca Plástica 20L',
        quantity: 60,
        unit: 'Unidades',
        justification: 'Abastecimiento de existencias bajo stock mínimo',
        requester: 'Raúl Méndez',
        requestedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pendiente',
        totalCost: 720000,
        priceBase: 12000,
        requiresGerencia: false,
        approvalFlow: [
            { role: 'logistica', action: 'Solicitado', by: 'Raúl Méndez', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() }
        ]
    },
    {
        id: 'REQ-105',
        area: 'Producción',
        product: 'Alcohol Etílico',
        quantity: 3000,
        unit: 'L',
        justification: 'Aumento estacional de producción desinfectantes (Licitación)',
        requester: 'Carlos Gómez',
        requestedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pendiente',
        totalCost: 15000000,
        priceBase: 5000,
        requiresGerencia: true,
        approvalFlow: [
            { role: 'produccion', action: 'Solicitado', by: 'Carlos Gómez', date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() }
        ]
    }
];

// Inicialización de la Aplicación
document.addEventListener('DOMContentLoaded', () => {
    initAppState();
    setupEventListeners();
});

// Cargar estado e iniciar vista
function initAppState() {
    // 0. Cargar Usuarios y Roles
    const savedUsers = localStorage.getItem('sigicq_users');
    let usersList = [];
    if (savedUsers) {
        usersList = JSON.parse(savedUsers);
    } else {
        usersList = [...SEED_USERS];
        localStorage.setItem('sigicq_users', JSON.stringify(usersList));
    }
    
    ROLES = {};
    usersList.forEach(u => {
        ROLES[u.username] = {
            name: u.name,
            roleLabel: u.roleLabel,
            area: u.area,
            password: u.password || '123',
            permissions: u.permissions || []
        };
    });

    // 1. Cargar Inventario
    const savedInventory = localStorage.getItem('sigicq_inventory');
    if (savedInventory) {
        state.inventory = JSON.parse(savedInventory);
    } else {
        state.inventory = [...SEED_INVENTORY];
        localStorage.setItem('sigicq_inventory', JSON.stringify(state.inventory));
    }

    // 2. Cargar Solicitudes
    const savedRequests = localStorage.getItem('sigicq_requests');
    if (savedRequests) {
        state.requests = JSON.parse(savedRequests);
    } else {
        state.requests = [...SEED_REQUESTS];
        localStorage.setItem('sigicq_requests', JSON.stringify(state.requests));
    }

    // 3. Cargar Tema
    const savedTheme = localStorage.getItem('sigicq_theme') || 'dark';
    state.theme = savedTheme;
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcons();

    // 4. Validar Sesión Activa
    const session = localStorage.getItem('sigicq_session');
    if (session && ROLES[session]) {
        state.activeRole = session;
        showMainApp();
    } else {
        state.activeRole = null;
        showLoginScreen();
    }
}

// Configurar los manejadores de eventos básicos
function setupEventListeners() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const usernameInput = document.getElementById('login-username').value.trim().toLowerCase();
            const passwordInput = document.getElementById('login-password').value;

            const user = ROLES[usernameInput];
            const correctPassword = user ? (user.password || '123') : '';

            if (user && passwordInput === correctPassword) {
                state.activeRole = usernameInput;
                localStorage.setItem('sigicq_session', usernameInput);
                showToast(`Sesión iniciada como ${ROLES[usernameInput].name}`, 'success');
                showMainApp();
            } else {
                showToast('Usuario o clave incorrectos. (Utiliza las credenciales de prueba)', 'danger');
            }
        });
    }

    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            localStorage.removeItem('sigicq_session');
            state.activeRole = null;
            showToast('Sesión cerrada con éxito.', 'info');
            showLoginScreen();
        });
    }

    const navButtons = document.querySelectorAll('.nav-item');
    navButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const button = e.currentTarget;
            const targetView = button.getAttribute('data-view');
            
            navButtons.forEach(b => b.classList.remove('active'));
            button.classList.add('active');
            
            state.currentView = targetView;
            
            const pageTitle = document.getElementById('page-title');
            pageTitle.textContent = button.querySelector('span').textContent;

            renderCurrentView();
        });
    });

    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.addEventListener('click', () => {
        state.theme = state.theme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', state.theme);
        localStorage.setItem('sigicq_theme', state.theme);
        updateThemeIcons();
        showToast(`Tema cambiado a modo ${state.theme === 'dark' ? 'oscuro' : 'claro'}`, 'info');
        
        if (state.currentView === 'dashboard') {
            setTimeout(renderDashboardCharts, 50);
        } else if (state.currentView === 'price_control') {
            setTimeout(renderPriceControlCharts, 50);
        }
    });

    const btnNotifications = document.getElementById('btn-notifications');
    const dropdown = document.getElementById('notifications-dropdown');
    btnNotifications.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('show');
        renderQuickAlertsDropdown();
    });

    document.addEventListener('click', () => {
        dropdown.classList.remove('show');
    });

    const btnClearNotifications = document.getElementById('btn-clear-notifications');
    if (btnClearNotifications) {
        btnClearNotifications.addEventListener('click', (e) => {
            e.stopPropagation();
            showToast('Alertas silenciadas', 'info');
            dropdown.classList.remove('show');
        });
    }

    const btnCloseModal = document.getElementById('btn-modal-close');
    btnCloseModal.addEventListener('click', closeModal);
    const modalOverlay = document.getElementById('detail-modal');
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });
}

function showLoginScreen() {
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('app-container').classList.add('hidden');
    document.getElementById('login-username').value = '';
    document.getElementById('login-password').value = '123';
}

function showMainApp() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('app-container').classList.remove('hidden');
    updateUserProfileDisplay();
    updateAlertBadges();
    triggerViewChange('dashboard');
}

// Renderizar la vista activa de la aplicación
function renderCurrentView() {
    const viewport = document.getElementById('main-viewport');
    
    viewport.style.opacity = '0';
    viewport.style.transform = 'translateY(8px)';
    viewport.style.transition = 'opacity 0.15s ease, transform 0.15s ease';

    setTimeout(() => {
        switch (state.currentView) {
            case 'dashboard':
                viewport.innerHTML = getDashboardTemplate();
                renderDashboardMetrics();
                renderDashboardCharts();
                break;
            case 'inventory':
                viewport.innerHTML = getInventoryTemplate();
                renderInventoryView();
                break;
            case 'requests':
                viewport.innerHTML = getRequestsTemplate();
                renderRequestsView();
                break;
            case 'containers':
                viewport.innerHTML = getContainersTemplate();
                renderContainersView();
                break;
            case 'approvals':
                viewport.innerHTML = getApprovalsTemplate();
                renderApprovalsView();
                break;
            case 'purchase_orders':
                viewport.innerHTML = getPurchaseOrdersTemplate();
                renderPurchaseOrdersView();
                break;
            case 'price_control':
                viewport.innerHTML = getPriceControlTemplate();
                renderPriceControlView();
                break;
            case 'alerts':
                viewport.innerHTML = getAlertsTemplate();
                renderAlertsView();
                break;
            case 'history':
                viewport.innerHTML = getHistoryTemplate();
                renderHistoryView();
                break;
            case 'systems':
                viewport.innerHTML = getSystemsTemplate();
                renderSystemsView();
                break;
        }

        viewport.style.opacity = '1';
        viewport.style.transform = 'translateY(0)';
    }, 120);
}

/* ==========================================================================
   PLANTILLAS HTML DE VISTAS (SPA)
   ========================================================================== */

function getDashboardTemplate() {
    const isCostVisible = (state.activeRole === 'compras' || state.activeRole === 'gerente');
    return `
        <!-- Métricas Principales -->
        <div class="dashboard-grid" id="dashboard-metrics-container">
            <!-- Se carga dinámicamente -->
        </div>

        <div class="dashboard-top-widgets">
            <!-- Gráfico del nivel de abastecimiento general -->
            <div class="chart-card">
                <div class="chart-header">
                    <h3>Abastecimiento General</h3>
                </div>
                <div class="chart-body" id="gauge-supply-container">
                    <!-- Gauge SVG -->
                </div>
            </div>

            <!-- Panel de Productos Críticos -->
            <div class="chart-card">
                <div class="chart-header">
                    <h3>Productos Críticos (Stock Bajo)</h3>
                </div>
                <div class="critical-items-list" id="critical-products-list">
                    <!-- Se carga dinámicamente -->
                </div>
            </div>
        </div>

        <!-- Fila de Gráficos -->
        <div class="charts-grid">
            <div class="chart-card">
                <div class="chart-header">
                    <h3>Consumo de Materiales Solicitados</h3>
                </div>
                <div class="chart-body" id="bar-chart-consumption">
                    <!-- SVG Bar Chart -->
                </div>
            </div>
            
            <div class="chart-card">
                <div class="chart-header">
                    <h3>Distribución de Solicitudes por Área</h3>
                </div>
                <div class="chart-body" id="donut-chart-areas">
                    <!-- SVG Donut Chart -->
                </div>
            </div>
        </div>

        <div class="chart-card">
            <div class="chart-header">
                <h3>${isCostVisible ? 'Costos de Compras Acumulados por Mes' : 'Solicitudes de Abastecimiento por Mes'}</h3>
            </div>
            <div class="chart-body" id="line-chart-costs" style="min-height: 240px;">
                <!-- SVG Line Chart -->
            </div>
        </div>
    `;
}

function getInventoryTemplate() {
    return `
        <div class="section-header">
            <h3>Existencias en Bodegas</h3>
            ${(state.activeRole === 'compras' || state.activeRole === 'gerente') ? 
                `<button class="btn-primary" id="btn-add-item">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    Nuevo Producto
                </button>` : ''
            }
        </div>

        <div class="actions-row">
            <div class="search-input-wrapper">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input type="text" class="input-field" id="inventory-search" placeholder="Buscar producto o código...">
            </div>
            <div class="filter-tabs">
                <button class="tab-btn active" data-category="all">Todos</button>
                <button class="tab-btn" data-category="materia_prima">Materias Primas</button>
                <button class="tab-btn" data-category="producto_terminado">Terminados</button>
                <button class="tab-btn" data-category="envase">Envases</button>
                <button class="tab-btn" data-category="etiqueta">Etiquetas</button>
                <button class="tab-btn" data-category="empaque">Empaque</button>
            </div>
        </div>

        <!-- Tabla de Inventario -->
        <div class="table-wrapper">
            <table class="responsive-table" id="inventory-table">
                <thead>
                    <tr>
                        <th>Código</th>
                        <th>Producto</th>
                        <th>Categoría</th>
                        <th>Existencias</th>
                        <th>Nivel de Stock</th>
                        <th>Precio Base</th>
                        <th>Acción</th>
                    </tr>
                </thead>
                <tbody id="inventory-table-body">
                    <!-- Se carga dinámicamente -->
                </tbody>
            </table>
        </div>
    `;
}

function getRequestsTemplate() {
    const userRole = ROLES[state.activeRole];
    const isJefe = state.activeRole !== 'compras';

    return `
        <div class="section-header">
            <h3>Solicitudes de Sugeridos</h3>
        </div>

        <div class="layout-split">
            <!-- Formulario de Creación (Solo disponible para Jefes y Gerencia) -->
            <div class="form-card">
                <h4>Crear Nueva Sugerencia</h4>
                ${isJefe ? `
                    <form id="form-create-request" class="form-card-form" style="display: flex; flex-direction: column; gap: 16px;">
                        <div class="form-group">
                            <label>Área Solicitante</label>
                            <input type="text" class="form-control" value="${userRole.area}" readonly id="req-form-area">
                        </div>
                        <div class="form-group">
                            <label for="req-form-product">Producto / Material</label>
                            <select class="form-control" id="req-form-product" required>
                                <option value="">Selecciona un producto...</option>
                                ${state.inventory.map(item => `<option value="${item.name}" data-unit="${item.unit}">${item.name} (${item.unit})</option>`).join('')}
                                <option value="OTRO">Otro (Especificar en justificación)</option>
                            </select>
                        </div>
                        <div class="form-group id-custom-product-container hidden" id="custom-product-wrapper">
                            <label for="req-form-custom-product">Nombre del Producto Especial</label>
                            <input type="text" class="form-control" id="req-form-custom-product" placeholder="Ej. Reactivo Z">
                        </div>
                        <div class="form-group">
                            <label for="req-form-qty">Cantidad Sugerida</label>
                            <div style="display: flex; gap: 10px;">
                                <input type="number" class="form-control" id="req-form-qty" min="1" required style="flex-grow: 1;">
                                <input type="text" class="form-control" id="req-form-unit" readonly placeholder="Unidad" style="width: 80px; text-align: center;">
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="req-form-justification">Justificación de Abastecimiento</label>
                            <textarea class="form-control" id="req-form-justification" placeholder="Escriba los motivos de la solicitud..." required></textarea>
                        </div>
                        <button type="submit" class="btn-primary" style="justify-content: center; width: 100%;">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                            Enviar Solicitud
                        </button>
                    </form>
                ` : `
                    <div class="empty-state" style="padding: 10px;">
                        <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-secondary); margin-bottom: 12px;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                        <p style="font-size: 0.85rem; font-weight: 500;">Creación bloqueada.</p>
                        <p style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 4px;">Las sugerencias solo pueden ser creadas por Jefaturas de área.</p>
                    </div>
                `}
            </div>

            <!-- Tabla de Solicitudes -->
            <div style="display: flex; flex-direction: column; gap: 16px;">
                <div class="table-wrapper">
                    <table class="responsive-table">
                        <thead>
                            <tr>
                                <th>Folio</th>
                                <th>Fecha</th>
                                <th>Área</th>
                                <th>Producto</th>
                                <th>Cantidad</th>
                                <th>Estado</th>
                                <th>Trazabilidad</th>
                            </tr>
                        </thead>
                        <tbody id="requests-table-body">
                            <!-- Se carga dinámicamente -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

function getContainersTemplate() {
    return `
        <div class="section-header">
            <h3>Sugerido de Envases y Empaques</h3>
        </div>

        <div class="actions-row" style="margin-bottom: 24px;">
            <p style="font-size: 0.85rem; color: var(--text-secondary); max-width: 700px;">
                Solicitud directa de envases químicos y embalajes. Selecciona el tipo de contenedor, ingresa la cantidad y genera una sugerencia al sistema.
            </p>
        </div>

        <!-- Rejilla de Tarjetas de Envases -->
        <div class="packaging-grid" id="packaging-cards-container">
            <!-- Se carga dinámicamente -->
        </div>
    `;
}

function getApprovalsTemplate() {
    return `
        <div class="section-header">
            <h3>Bandeja de Aprobaciones</h3>
        </div>

        <div class="actions-row" style="margin-bottom: 24px;">
            <p style="font-size: 0.85rem; color: var(--text-secondary);" id="approvals-view-description">
                Cargando autorizaciones pendientes...
            </p>
        </div>

        <!-- Tabla de Aprobaciones -->
        <div class="table-wrapper">
            <table class="responsive-table">
                <thead>
                    <tr>
                        <th>Folio</th>
                        <th>Solicitante / Área</th>
                        <th>Producto</th>
                        <th>Cant.</th>
                        <th>Valor Est.</th>
                        <th>Justificación</th>
                        <th>Acción Requerida</th>
                    </tr>
                </thead>
                <tbody id="approvals-table-body">
                    <!-- Se carga dinámicamente -->
                </tbody>
            </table>
        </div>
    `;
}

function getPurchaseOrdersTemplate() {
    return `
        <div class="section-header">
            <h3>Control de Órdenes de Compra (OC)</h3>
        </div>

        <!-- Fila de Métricas Operativas de Compra -->
        <div class="price-metrics-container" style="margin-bottom: 24px;">
            <div class="price-card-mini">
                <span class="price-card-label">Órdenes Activas</span>
                <span class="price-card-value" id="po-metric-active" style="color: var(--accent-color);">0</span>
            </div>
            <div class="price-card-mini">
                <span class="price-card-label">Pedidos Retrasados</span>
                <span class="price-card-value" id="po-metric-delayed" style="color: var(--danger);">0</span>
            </div>
            <div class="price-card-mini">
                <span class="price-card-label">Órdenes Entregadas</span>
                <span class="price-card-value" id="po-metric-received" style="color: var(--success);">0</span>
            </div>
            <div class="price-card-mini">
                <span class="price-card-label">Inversión en Tránsito</span>
                <span class="price-card-value" id="po-metric-cost" style="font-size: 1.3rem;">$0</span>
            </div>
        </div>

        <div class="actions-row">
            <div class="filter-tabs">
                <button class="tab-btn active" data-po-filter="all">Todas</button>
                <button class="tab-btn" data-po-filter="en_compra">En Tránsito</button>
                <button class="tab-btn" data-po-filter="demorado">Retrasadas</button>
                <button class="tab-btn" data-po-filter="recibido">Recibidas</button>
            </div>
        </div>

        <!-- Tabla Órdenes de Compra -->
        <div class="table-wrapper">
            <table class="responsive-table">
                <thead>
                    <tr>
                        <th>Folio</th>
                        <th>Fecha Creación</th>
                        <th>Área</th>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Costo Real</th>
                        <th>ETA (Estimado)</th>
                        <th>Estado</th>
                        <th>Acción</th>
                    </tr>
                </thead>
                <tbody id="po-table-body">
                    <!-- Se carga dinámicamente -->
                </tbody>
            </table>
        </div>
    `;
}

function getPriceControlTemplate() {
    return `
        <div class="section-header">
            <h3>Control y Análisis de Precios</h3>
        </div>

        <!-- Tarjetas analíticas superiores -->
        <div class="price-metrics-container" style="margin-bottom: 24px;">
            <div class="price-card-mini">
                <span class="price-card-label">Ahorro Neto Acumulado</span>
                <span class="price-card-value" id="price-metric-savings">$0</span>
            </div>
            <div class="price-card-mini">
                <span class="price-card-label">Monto Comprado Base</span>
                <span class="price-card-value" id="price-metric-base-total" style="font-size: 1.4rem;">$0</span>
            </div>
            <div class="price-card-mini">
                <span class="price-card-label">Monto Comprado Real</span>
                <span class="price-card-value" id="price-metric-real-total" style="font-size: 1.4rem;">$0</span>
            </div>
            <div class="price-card-mini">
                <span class="price-card-label">Variación de Compra Prom.</span>
                <span class="price-card-value" id="price-metric-avg-var">0%</span>
            </div>
        </div>

        <!-- Gráfico de Tendencia Histórica y Selector -->
        <div class="price-trend-section" style="margin-bottom: 32px;">
            <div class="price-trend-sidebar">
                <h4 style="font-weight:600; font-size: 1rem;">Historial de Fluctuación</h4>
                <p style="font-size:0.8rem; color:var(--text-secondary);">Selecciona un material para analizar sus precios unitarios en los diferentes ingresos registrados.</p>
                <div class="form-group" style="margin-top: 10px;">
                    <label for="price-trend-select">Material / Producto</label>
                    <select class="form-control" id="price-trend-select">
                        <!-- Se llena dinámicamente -->
                    </select>
                </div>
            </div>
            <div class="price-trend-chart-container" id="price-trend-chart-body">
                <!-- Gráfico SVG dinámico -->
            </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1.2fr; gap: 24px; align-items: start;">
            <!-- Catálogo de Precios Base (Izquierda) -->
            <div>
                <h4 style="font-weight: 600; font-size: 1.05rem; margin-bottom: 12px;">Catálogo de Precios Base</h4>
                <div class="table-wrapper">
                    <table class="responsive-table">
                        <thead>
                            <tr>
                                <th>Material</th>
                                <th>Precio Base</th>
                                <th>Acción</th>
                            </tr>
                        </thead>
                        <tbody id="price-catalog-tbody">
                            <!-- Se carga dinámicamente -->
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Bitácora de Variaciones (Derecha) -->
            <div>
                <h4 style="font-weight: 600; font-size: 1.05rem; margin-bottom: 12px;">Bitácora de Desviación de Precios</h4>
                <div class="table-wrapper">
                    <table class="responsive-table" style="font-size: 0.85rem;">
                        <thead>
                            <tr>
                                <th>Folio</th>
                                <th>Material</th>
                                <th>Cant.</th>
                                <th>Base vs Real</th>
                                <th>Desviación</th>
                                <th>Impacto Neto</th>
                            </tr>
                        </thead>
                        <tbody id="price-variations-tbody">
                            <!-- Se carga dinámicamente -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

function getAlertsTemplate() {
    return `
        <div class="section-header">
            <h3>Notificaciones y Alertas Inteligentes</h3>
        </div>
        <div class="alerts-grid" id="alerts-page-grid">
            <!-- Se carga dinámicamente -->
        </div>
    `;
}

function getHistoryTemplate() {
    return `
        <div class="section-header">
            <h3>Historial General y Auditoría</h3>
        </div>

        <div class="actions-row">
            <div class="search-input-wrapper">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input type="text" class="input-field" id="history-search" placeholder="Filtrar por producto, folio o solicitante...">
            </div>
            <select class="control-select" id="history-status-filter">
                <option value="all">Todos los estados</option>
                <option value="pendiente">Pendientes</option>
                <option value="pendiente_gerencia">Pendiente Gerencia</option>
                <option value="aprobado">Aprobadas</option>
                <option value="en_compra">En Compra</option>
                <option value="demorado">Demoradas</option>
                <option value="recibido">Recibidas</option>
                <option value="rechazado">Rechazadas</option>
                <option value="agotado">Agotadas</option>
            </select>
        </div>

        <div class="table-wrapper">
            <table class="responsive-table">
                <thead>
                    <tr>
                        <th>Folio</th>
                        <th>Fecha Creación</th>
                        <th>Área</th>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Última Firma</th>
                        <th>Estado</th>
                        <th>Detalle</th>
                    </tr>
                </thead>
                <tbody id="history-table-body">
                    <!-- Se carga dinámicamente -->
                </tbody>
            </table>
        </div>
    `;
}

// Auxiliares para el Dashboard
window.suggestCriticalOrder = function(name, unit, qtyNeeded) {
    state.currentView = 'requests';
    const btnNav = document.getElementById('btn-nav-requests');
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    btnNav.classList.add('active');
    document.getElementById('page-title').textContent = 'Solicitudes';
    
    renderCurrentView();
    
    setTimeout(() => {
        const prodSelect = document.getElementById('req-form-product');
        const qtyInput = document.getElementById('req-form-qty');
        const unitInput = document.getElementById('req-form-unit');
        
        if (prodSelect && qtyInput) {
            prodSelect.value = name;
            qtyInput.value = qtyNeeded > 0 ? qtyNeeded : 100;
            unitInput.value = unit;
            
            const justTextarea = document.getElementById('req-form-justification');
            if (justTextarea) {
                justTextarea.value = `Reposición automática crítica. Stock por debajo del mínimo de seguridad.`;
            }
        }
    }, 200);
};

/* ==========================================================================
   RENDERIZADORES ESPECÍFICOS DE MÓDULOS
   ========================================================================== */

// --- 1. DASHBOARD ---
function renderDashboardMetrics() {
    const container = document.getElementById('dashboard-metrics-container');
    if (!container) return;

    const totalItems = state.inventory.length;
    const criticalItems = state.inventory.filter(item => item.stock <= item.min).length;
    
    // Tareas pendientes según rol
    const currentRole = state.activeRole;
    const pendingApprovalsCount = state.requests.filter(req => {
        if (currentRole === 'gerente') {
            return req.status === 'pendiente_gerencia';
        } else if (currentRole === 'compras') {
            return req.status === 'pendiente'; // Compras cotiza todas
        }
        return false;
    }).length;

    const isCostVisible = (currentRole === 'compras' || currentRole === 'gerente');
    let fourthCardHtml = '';

    if (isCostVisible) {
        const totalCosts = state.requests
            .filter(req => req.status === 'recibido')
            .reduce((sum, req) => sum + (req.totalCost || 0), 0);

        fourthCardHtml = `
            <div class="metric-card" onclick="triggerViewChange('price_control')">
                <div class="metric-info">
                    <h4>Inversión Recibida</h4>
                    <div class="metric-val" style="font-size: 1.35rem;">$${totalCosts.toLocaleString('es-CO')}</div>
                </div>
                <div class="metric-icon green">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                </div>
            </div>
        `;
    } else {
        const userArea = ROLES[currentRole] ? ROLES[currentRole].area : '';
        const myRequestsCount = state.requests.filter(req => req.area === userArea).length;

        fourthCardHtml = `
            <div class="metric-card" onclick="triggerViewChange('requests')">
                <div class="metric-info">
                    <h4>Mis Solicitudes</h4>
                    <div class="metric-val">${myRequestsCount}</div>
                </div>
                <div class="metric-icon green">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                </div>
            </div>
        `;
    }

    container.innerHTML = `
        <div class="metric-card" onclick="triggerViewChange('inventory')">
            <div class="metric-info">
                <h4>Materiales Registrados</h4>
                <div class="metric-val">${totalItems}</div>
            </div>
            <div class="metric-icon blue">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            </div>
        </div>

        <div class="metric-card" onclick="triggerViewChange('alerts')">
            <div class="metric-info">
                <h4>Stocks Críticos</h4>
                <div class="metric-val" style="color: ${criticalItems > 0 ? 'var(--danger)' : 'var(--text-primary)'}">${criticalItems}</div>
            </div>
            <div class="metric-icon ${criticalItems > 0 ? 'red' : 'green'}">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            </div>
        </div>

        <div class="metric-card" onclick="triggerViewChange('approvals')">
            <div class="metric-info">
                <h4>Por Procesar (Tu Rol)</h4>
                <div class="metric-val" style="color: ${pendingApprovalsCount > 0 ? 'var(--warning)' : 'var(--text-primary)'}">${pendingApprovalsCount}</div>
            </div>
            <div class="metric-icon orange">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
            </div>
        </div>

        ${fourthCardHtml}
    `;

    // Renderizar lista de productos críticos
    const criticalList = document.getElementById('critical-products-list');
    const criticalProducts = state.inventory.filter(item => item.stock <= item.min).slice(0, 4);

    if (criticalProducts.length === 0) {
        criticalList.innerHTML = '<p class="empty-state">No hay productos en estado crítico de abastecimiento.</p>';
    } else {
        criticalList.innerHTML = criticalProducts.map(item => `
            <div class="critical-item-row">
                <div class="critical-item-info">
                    <span class="critical-item-name">${item.name}</span>
                    <span class="critical-item-stock">Stock actual: <strong style="color: var(--danger)">${item.stock} ${item.unit}</strong> (Mín: ${item.min})</span>
                </div>
                ${(state.activeRole !== 'compras') ? 
                    `<button class="btn-small approve" onclick="suggestCriticalOrder('${item.name}', '${item.unit}', ${item.min * 2 - item.stock})" title="Generar Sugerido Automatizado">
                        Auto-Sugerido
                    </button>` : ''
                }
            </div>
        `).join('');
    }
}

function renderDashboardCharts() {
    const totalItems = state.inventory.length;
    const itemsAboveMin = state.inventory.filter(item => item.stock > item.min).length;
    const fillPercentage = totalItems > 0 ? Math.round((itemsAboveMin / totalItems) * 100) : 0;
    Charts.drawGaugeChart('gauge-supply-container', fillPercentage);

    const requestGroup = {};
    state.requests.forEach(req => {
        if (req.status !== 'rechazado') {
            requestGroup[req.product] = (requestGroup[req.product] || 0) + req.quantity;
        }
    });
    const barData = Object.keys(requestGroup).map(key => ({
        label: key,
        value: requestGroup[key]
    })).sort((a,b) => b.value - a.value).slice(0, 5);
    Charts.drawBarChart('bar-chart-consumption', barData);

    const areaGroup = {};
    state.requests.forEach(req => {
        areaGroup[req.area] = (areaGroup[req.area] || 0) + 1;
    });
    const donutData = Object.keys(areaGroup).map(key => ({
        label: key,
        value: areaGroup[key]
    }));
    Charts.drawDonutChart('donut-chart-areas', donutData);

    const isCostVisible = (state.activeRole === 'compras' || state.activeRole === 'gerente');
    let lineData = [];

    if (isCostVisible) {
        const currentMonthReceived = state.requests
            .filter(req => req.status === 'recibido')
            .reduce((sum, req) => sum + (req.totalCost || 0), 0);

        lineData = [
            { label: 'Ene', value: 8500000 },
            { label: 'Feb', value: 9400000 },
            { label: 'Mar', value: 12000000 },
            { label: 'Abr', value: 7800000 },
            { label: 'May', value: 10500000 },
            { label: 'Jun (Actual)', value: currentMonthReceived }
        ];
    } else {
        const userArea = ROLES[state.activeRole] ? ROLES[state.activeRole].area : '';
        const currentMonthReqs = state.requests
            .filter(req => req.area === userArea)
            .length;

        lineData = [
            { label: 'Ene', value: 1 },
            { label: 'Feb', value: 2 },
            { label: 'Mar', value: 3 },
            { label: 'Abr', value: 4 },
            { label: 'May', value: 6 },
            { label: 'Jun (Actual)', value: currentMonthReqs }
        ];
    }
    Charts.drawLineChart('line-chart-costs', lineData);
}

// --- 2. INVENTARIO ---
function renderInventoryView() {
    const tableBody = document.getElementById('inventory-table-body');
    const searchInput = document.getElementById('inventory-search');
    const tabButtons = document.querySelectorAll('.tab-btn');

    let activeFilter = 'all';
    let searchQuery = '';

    function filterAndRenderTable() {
        let filtered = state.inventory;

        if (activeFilter !== 'all') {
            filtered = filtered.filter(item => item.category === activeFilter);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(item => 
                item.name.toLowerCase().includes(query) || 
                item.id.toLowerCase().includes(query)
            );
        }

        tableBody.innerHTML = '';
        if (filtered.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7" class="empty-state">No se encontraron productos en bodega.</td></tr>`;
            return;
        }

        filtered.forEach(item => {
            const range = item.max - item.min;
            const percentage = Math.min(100, Math.max(0, Math.round(((item.stock) / item.max) * 100)));
            
            let colorClass = 'success';
            let badgeClass = 'success';
            let badgeText = 'Óptimo';

            if (item.stock <= item.min) {
                colorClass = 'danger';
                badgeClass = 'danger';
                badgeText = 'Crítico';
            } else if (item.stock <= item.min * 1.3) {
                colorClass = 'warning';
                badgeClass = 'warning';
                badgeText = 'Bajo';
            }

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong style="color: var(--accent-color); font-size: 0.8rem;">${item.id.toUpperCase()}</strong></td>
                <td>
                    <div style="font-weight: 600;">${item.name}</div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary);">Unidad: ${item.unit}</div>
                </td>
                <td><span style="font-size: 0.8rem; text-transform: capitalize;">${item.category.replace('_', ' ')}</span></td>
                <td>
                    <div style="font-weight: 700; font-size: 1rem;">${item.stock}</div>
                    <div style="font-size: 0.7rem; color: var(--text-secondary);">Mín: ${item.min} / Máx: ${item.max}</div>
                </td>
                <td>
                    <div class="stock-level-wrapper">
                        <div class="stock-level-label">
                            <span class="stock-badge ${badgeClass}">${badgeText}</span>
                            <span>${percentage}%</span>
                        </div>
                        <div class="progress-bar-container">
                            <div class="progress-bar-fill ${colorClass}" style="width: ${percentage}%"></div>
                        </div>
                    </div>
                </td>
                <td style="font-weight: 500;">$${item.price.toLocaleString('es-CO')}</td>
                <td>
                    <div style="display: flex; gap: 8px;">
                        <button class="btn-icon btn-small" onclick="adjustStockModal('${item.id}')" title="Ajustar Stock Manualmente" style="width: 32px; height: 32px;">
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                        </button>
                    </div>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }

    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        filterAndRenderTable();
    });

    tabButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            tabButtons.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            activeFilter = e.target.getAttribute('data-category');
            filterAndRenderTable();
        });
    });

    const btnAdd = document.getElementById('btn-add-item');
    if (btnAdd) {
        // Enlazar evento si ya existe en el DOM
        btnAdd.replaceWith(btnAdd.cloneNode(true));
        document.getElementById('btn-add-item').addEventListener('click', openNewItemModal);
    }

    filterAndRenderTable();
}

// --- 3. SOLICITUDES DE SUGERIDOS ---
function renderRequestsView() {
    const tableBody = document.getElementById('requests-table-body');
    const form = document.getElementById('form-create-request');

    function updateRequestsTable() {
        tableBody.innerHTML = '';
        if (state.requests.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7" class="empty-state">No hay solicitudes generadas todavía.</td></tr>`;
            return;
        }

        state.requests.forEach(req => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong style="color: var(--accent-color); font-size: 0.8rem;">${req.id}</strong></td>
                <td style="font-size: 0.8rem; color: var(--text-secondary);">${new Date(req.requestedAt).toLocaleDateString('es-CO')}</td>
                <td style="font-weight: 500;">${req.area}</td>
                <td>
                    <div style="font-weight: 600;">${req.product}</div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary);">${req.requester}</div>
                </td>
                <td style="font-weight: 600;">${req.quantity} ${req.unit}</td>
                <td><span class="status-pill ${req.status}">${getStatusLabel(req.status)}</span></td>
                <td>
                    <button class="btn-secondary btn-small" onclick="openTimelineModal('${req.id}')">
                        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        Ver Flujo
                    </button>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }

    const prodSelect = document.getElementById('req-form-product');
    const unitInput = document.getElementById('req-form-unit');
    const customProductWrapper = document.getElementById('custom-product-wrapper');
    
    if (prodSelect) {
        prodSelect.addEventListener('change', (e) => {
            if (e.target.value === 'OTRO') {
                customProductWrapper.classList.remove('hidden');
                document.getElementById('req-form-custom-product').setAttribute('required', 'true');
                unitInput.value = 'Unidades';
                unitInput.removeAttribute('readonly');
            } else {
                customProductWrapper.classList.add('hidden');
                document.getElementById('req-form-custom-product').removeAttribute('required');
                const selectedOpt = prodSelect.options[prodSelect.selectedIndex];
                const unit = selectedOpt.getAttribute('data-unit') || '';
                unitInput.value = unit;
                unitInput.setAttribute('readonly', 'true');
            }
        });
    }

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const productSelect = document.getElementById('req-form-product').value;
            const customProduct = document.getElementById('req-form-custom-product') ? document.getElementById('req-form-custom-product').value : '';
            const qty = parseInt(document.getElementById('req-form-qty').value);
            const unit = document.getElementById('req-form-unit').value;
            const justification = document.getElementById('req-form-justification').value;

            let productName = productSelect;
            if (productSelect === 'OTRO') productName = customProduct;

            const matchedInv = state.inventory.find(i => i.name.toLowerCase() === productName.toLowerCase());
            const unitPrice = matchedInv ? matchedInv.price : 15000;
            const totalCost = qty * unitPrice;

            // Alto valor si supera 2M COP o 1000 unidades
            const requiresGerencia = (totalCost >= 2000000 || qty >= 1000);

            const activeUser = ROLES[state.activeRole];
            const folio = `REQ-${Math.floor(100 + Math.random() * 900)}`;

            const newRequest = {
                id: folio,
                area: activeUser.area,
                product: productName,
                quantity: qty,
                unit: unit,
                justification: justification,
                requester: activeUser.name,
                requestedAt: new Date().toISOString(),
                status: 'pendiente',
                totalCost: totalCost,
                priceBase: unitPrice, // Se congela el precio base al solicitar
                requiresGerencia: requiresGerencia,
                approvalFlow: [
                    { role: state.activeRole, action: 'Solicitado', by: activeUser.name, date: new Date().toISOString() }
                ]
            };

            state.requests.unshift(newRequest);
            localStorage.setItem('sigicq_requests', JSON.stringify(state.requests));

            showToast(`Solicitud ${folio} registrada en el sistema.`, 'success');
            form.reset();
            if (customProductWrapper) customProductWrapper.classList.add('hidden');
            
            updateAlertBadges();
            updateRequestsTable();
        });
    }

    updateRequestsTable();
}

// --- 4. SUGERIDO DE ENVASES ---
function renderContainersView() {
    const container = document.getElementById('packaging-cards-container');
    if (!container) return;

    const packagingItems = state.inventory.filter(item => item.category === 'envase' || item.category === 'empaque');

    container.innerHTML = packagingItems.map(item => {
        const pendingQty = state.requests
            .filter(r => r.product === item.name && (r.status === 'pendiente' || r.status === 'aprobado' || r.status === 'en_compra'))
            .reduce((sum, r) => sum + r.quantity, 0);

        return `
            <div class="packaging-card">
                <div class="packaging-header">
                    <div class="packaging-icon">
                        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
                    </div>
                    <div class="packaging-title">
                        <h4>${item.name}</h4>
                        <span>Categoría: ${item.category === 'envase' ? 'Envase' : 'Embalaje'}</span>
                    </div>
                </div>

                <div class="packaging-details">
                    <div>Stock Actual:</div>
                    <div><strong>${item.stock} Unid.</strong></div>
                    <div>Mínimo:</div>
                    <div><strong>${item.min} Unid.</strong></div>
                    <div>Sugeridos Activos:</div>
                    <div style="color: ${pendingQty > 0 ? 'var(--accent-color)' : 'var(--text-secondary)'}">
                        <strong>${pendingQty > 0 ? `+${pendingQty}` : '0'} Unid.</strong>
                    </div>
                </div>

                <div class="packaging-actions">
                    <input type="number" class="form-control qty-input" id="qty-card-${item.id}" value="${item.min * 2}" min="1">
                    ${(state.activeRole !== 'compras') ? `
                        <button class="btn-primary" onclick="submitPackagingRequest('${item.id}')" style="flex-grow: 1; padding: 10px;">
                            Solicitar
                        </button>
                    ` : `
                        <button class="btn-secondary" disabled style="flex-grow: 1; padding: 10px; cursor: not-allowed; opacity: 0.5;">
                            Bloqueado
                        </button>
                    `}
                </div>
            </div>
        `;
    }).join('');
}

// --- 5. APROBACIONES (Workflow - Precompra) ---
function renderApprovalsView() {
    const tableBody = document.getElementById('approvals-table-body');
    const desc = document.getElementById('approvals-view-description');
    const currentRole = state.activeRole;

    const pendingList = state.requests.filter(req => {
        // Rol Gerente: ve solicitudes cotizadas por Compras que requieren visto bueno
        if (currentRole === 'gerente') {
            return req.status === 'pendiente_gerencia';
        }
        // Rol Compras: ve todas las solicitudes pendientes para cotizarlas por primera vez
        if (currentRole === 'compras') {
            return req.status === 'pendiente';
        }
        return false;
    });

    if (desc) {
        if (currentRole === 'compras') {
            desc.innerHTML = `Mostrando solicitudes **Pendientes de Cotización**. Cotiza el precio negociado y define la ETA.`;
        } else if (currentRole === 'gerente') {
            desc.innerHTML = `Mostrando solicitudes cotizadas de **Alto Valor** (>= $2'000.000 COP) que requieren tu firma.`;
        } else {
            desc.textContent = `Ventanilla de aprobación inactiva para el área de ${ROLES[currentRole].area}.`;
        }
    }

    tableBody.innerHTML = '';
    if (pendingList.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" class="empty-state">No tienes solicitudes pendientes en tu bandeja de firmas.</td></tr>`;
        return;
    }

    pendingList.forEach(req => {
        let actionButtonsHtml = '';

        if (currentRole === 'gerente') {
            actionButtonsHtml = `
                <div class="actions-buttons">
                    <button class="btn-small approve" onclick="workflowTransition('${req.id}', 'aprobar')">Dar Vto. Bueno</button>
                    <button class="btn-small reject" onclick="workflowTransition('${req.id}', 'rechazar')">Rechazar</button>
                </div>
            `;
        } else if (currentRole === 'compras') {
            actionButtonsHtml = `
                <button class="btn-small buy" onclick="openPurchaseDialog('${req.id}')">Cotizar y Procesar Compra</button>
            `;
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong style="color: var(--accent-color); font-size: 0.8rem;">${req.id}</strong></td>
            <td>
                <div style="font-weight: 600;">${req.requester}</div>
                <div style="font-size: 0.75rem; color: var(--text-secondary);">${req.area}</div>
            </td>
            <td>
                <div style="font-weight: 600;">${req.product}</div>
            </td>
            <td style="font-weight: 500;">${req.quantity} ${req.unit}</td>
            <td style="font-weight: 700;">$${req.totalCost.toLocaleString('es-CO')}</td>
            <td style="font-size: 0.8rem; max-width: 200px;">${req.justification}</td>
            <td>${actionButtonsHtml}</td>
        `;
        tableBody.appendChild(tr);
    });
}

// Modal para cotizar y comprar (ETA, Precio y selección de estado)
window.openPurchaseDialog = function(id) {
    const req = state.requests.find(r => r.id === id);
    if (!req) return;

    const basePrice = req.priceBase || 5000;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 3);
    const defaultDateStr = tomorrow.toISOString().split('T')[0];

    openModal(`Procesar Cotización - ${req.id}`, `
        <div style="display: flex; flex-direction: column; gap: 16px;">
            <p style="font-size: 0.85rem; color: var(--text-secondary);">Selecciona la acción a tomar para la sugerencia del material <strong>${req.product}</strong>.</p>
            
            <div class="form-group">
                <label for="modal-purchase-status">Nuevo Estado del Pedido</label>
                <select class="form-control" id="modal-purchase-status" onchange="toggleModalFields()">
                    <option value="compra_realizada">Compra Realizada (En tránsito)</option>
                    <option value="recibido">Solicitud Recibida (Ingresar a Bodega)</option>
                    <option value="agotado">Material Agotado (Cancelar sugerencia)</option>
                </select>
            </div>

            <div id="modal-details-fields" style="display: flex; flex-direction: column; gap: 16px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                    <div class="form-group">
                        <label>Precio Unitario Catálogo</label>
                        <div class="form-control-static" style="padding: 10px 14px; background-color: rgba(255, 255, 255, 0.01); border: 1px solid var(--border-color); border-radius: var(--border-radius-sm); color: var(--text-secondary); font-weight: 600;">$${basePrice.toLocaleString('es-CO')} COP</div>
                    </div>
                    <div class="form-group">
                        <label for="modal-purchase-price">Precio Real de Compra ($)</label>
                        <input type="number" class="form-control" id="modal-purchase-price" value="${basePrice}">
                    </div>
                </div>
                <div class="form-group" id="modal-eta-group">
                    <label for="modal-eta-date">Fecha Estimada de Llegada (ETA)</label>
                    <input type="date" class="form-control" id="modal-eta-date" value="${defaultDateStr}" required>
                </div>
            </div>

            <button class="btn-primary" onclick="confirmPurchase('${req.id}')" style="justify-content: center; margin-top: 10px;">
                Confirmar Cambio de Estado
            </button>
        </div>
    `);
};

window.toggleModalFields = function() {
    const status = document.getElementById('modal-purchase-status').value;
    const detailsContainer = document.getElementById('modal-details-fields');
    const etaGroup = document.getElementById('modal-eta-group');
    
    if (status === 'agotado') {
        detailsContainer.style.display = 'none';
    } else if (status === 'recibido') {
        detailsContainer.style.display = 'flex';
        etaGroup.style.display = 'none';
    } else { // compra_realizada
        detailsContainer.style.display = 'flex';
        etaGroup.style.display = 'block';
    }
};

window.confirmPurchase = function(id) {
    const statusVal = document.getElementById('modal-purchase-status').value;
    const priceRealVal = parseFloat(document.getElementById('modal-purchase-price').value);
    const etaVal = document.getElementById('modal-eta-date').value;

    const reqIndex = state.requests.findIndex(r => r.id === id);
    if (reqIndex === -1) return;
    
    const req = state.requests[reqIndex];
    const userRole = ROLES[state.activeRole];
    const now = new Date().toISOString();

    if (statusVal === 'agotado') {
        req.status = 'agotado';
        req.priceReal = 0;
        req.totalCost = 0;
        req.requiresGerencia = false;
        req.approvalFlow.push({
            role: 'compras',
            action: 'Marcado como Agotado por Proveedor',
            by: userRole.name,
            date: now
        });
        showToast(`Sugerencia ${req.id} marcada como Agotado.`, 'warning');
    } 
    else if (statusVal === 'recibido') {
        if (isNaN(priceRealVal) || priceRealVal <= 0) {
            showToast('Ingresa un precio real de compra válido.', 'danger');
            return;
        }
        req.status = 'recibido';
        req.priceReal = priceRealVal;
        req.totalCost = req.quantity * priceRealVal;
        req.eta = new Date().toISOString().split('T')[0]; // ETA es hoy
        req.requiresGerencia = false;

        // Sumar stock en inventario
        const matchedInv = state.inventory.find(i => i.name.toLowerCase() === req.product.toLowerCase());
        if (matchedInv) {
            matchedInv.stock += req.quantity;
            localStorage.setItem('sigicq_inventory', JSON.stringify(state.inventory));
        }

        req.approvalFlow.push({
            role: 'compras',
            action: `Recibido Directamente en Bodega - Precio Real: $${priceRealVal.toLocaleString('es-CO')}`,
            by: `${userRole.name} (Compras)`,
            date: now
        });
        showToast(`Materiales de la solicitud ${req.id} ingresados directamente a bodega.`, 'success');
    } 
    else { // compra_realizada
        if (isNaN(priceRealVal) || priceRealVal <= 0) {
            showToast('Ingresa un precio real de compra válido.', 'danger');
            return;
        }
        if (!etaVal) {
            showToast('Debes seleccionar una fecha estimada (ETA).', 'danger');
            return;
        }

        req.priceReal = priceRealVal;
        req.totalCost = req.quantity * priceRealVal;
        req.eta = etaVal;
        req.requiresGerencia = (req.totalCost >= 2000000 || req.quantity >= 1000);

        if (req.requiresGerencia) {
            req.status = 'pendiente_gerencia';
            req.approvalFlow.push({
                role: 'compras',
                action: `Compra Realizada - Esperando Vto Bueno Gerencia - ETA: ${etaVal} - Precio Real: $${priceRealVal.toLocaleString('es-CO')}`,
                by: userRole.name,
                date: now
            });
            showToast(`Cotización registrada. Requiere visto bueno de Gerencia por monto elevado ($${req.totalCost.toLocaleString('es-CO')} COP)`, 'warning');
        } else {
            req.status = 'en_compra';
            req.approvalFlow.push({
                role: 'compras',
                action: `Compra Realizada (Pedido en Tránsito) - ETA: ${etaVal} - Real: $${priceRealVal.toLocaleString('es-CO')}`,
                by: userRole.name,
                date: now
            });
            showToast(`Orden de compra emitida con éxito. Pedido en tránsito.`, 'success');
        }
    }

    localStorage.setItem('sigicq_requests', JSON.stringify(state.requests));
    closeModal();
    updateAlertBadges();
    renderApprovalsView();
};

window.workflowTransition = function(id, action) {
    const reqIndex = state.requests.findIndex(r => r.id === id);
    if (reqIndex === -1) return;

    const req = state.requests[reqIndex];
    const userRole = ROLES[state.activeRole];
    const now = new Date().toISOString();

    if (action === 'aprobar') {
        req.status = 'en_compra';
        req.approvalFlow.push({
            role: 'gerencia',
            action: 'Firma y Vto. Bueno Gerencial',
            by: userRole.name,
            date: now
        });
        showToast(`Orden de compra ${req.id} autorizada por Gerencia General.`, 'success');
    } else if (action === 'rechazar') {
        req.status = 'rechazado';
        req.approvalFlow.push({
            role: state.activeRole,
            action: 'Rechazado',
            by: userRole.name,
            date: now
        });
        showToast(`Solicitud ${req.id} rechazada.`, 'danger');
    } else if (action === 'demorar') {
        req.status = 'demorado';
        req.approvalFlow.push({
            role: 'compras',
            action: 'Envío Retrasado - Alerta de Demora',
            by: userRole.name,
            date: now
        });
        showToast(`Pedido ${req.id} reportado como demorado.`, 'warning');
    } else if (action === 'recibir') {
        const matchedInv = state.inventory.find(i => i.name.toLowerCase() === req.product.toLowerCase());
        if (matchedInv) {
            matchedInv.stock += req.quantity;
            localStorage.setItem('sigicq_inventory', JSON.stringify(state.inventory));
        }

        req.status = 'recibido';
        req.approvalFlow.push({
            role: 'bodega',
            action: 'Recibido en Bodega',
            by: `${userRole.name} (Compras)`,
            date: now
        });
        showToast(`Materiales de la solicitud ${req.id} ingresados a bodega física. Existencias actualizadas.`, 'success');
    }

    localStorage.setItem('sigicq_requests', JSON.stringify(state.requests));
    
    updateAlertBadges();
    
    // Redirigir el renderizado según el módulo de origen
    if (state.currentView === 'approvals') renderApprovalsView();
    else if (state.currentView === 'purchase_orders') renderPurchaseOrdersView();
};

// --- 6. CONTROL DE ÓRDENES DE COMPRA (Fulfillment) ---
function renderPurchaseOrdersView() {
    const tableBody = document.getElementById('po-table-body');
    const filterButtons = document.querySelectorAll('[data-po-filter]');
    
    let activeFilter = 'all';

    function renderPOTable() {
        // Filtrar órdenes operativas (en compra, demoradas, recibidas)
        let filtered = state.requests.filter(req => req.status === 'en_compra' || req.status === 'demorado' || req.status === 'recibido');

        // Filtrar por tab activo
        if (activeFilter !== 'all') {
            filtered = filtered.filter(req => req.status === activeFilter);
        }

        // Renderizar métricas del módulo
        const activeCount = state.requests.filter(r => r.status === 'en_compra' || r.status === 'demorado').length;
        const delayedCount = calculateCurrentAlerts().filter(a => a.type === 'pedido_retrasado').length;
        const receivedCount = state.requests.filter(r => r.status === 'recibido').length;
        const inTransitCosts = state.requests
            .filter(r => r.status === 'en_compra' || r.status === 'demorado')
            .reduce((sum, r) => sum + (r.totalCost || 0), 0);

        document.getElementById('po-metric-active').textContent = activeCount;
        document.getElementById('po-metric-delayed').textContent = delayedCount;
        document.getElementById('po-metric-received').textContent = receivedCount;
        document.getElementById('po-metric-cost').textContent = `$${inTransitCosts.toLocaleString('es-CO')}`;

        tableBody.innerHTML = '';
        if (filtered.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="9" class="empty-state">No hay órdenes de compra registradas en este estado.</td></tr>`;
            return;
        }

        filtered.forEach(req => {
            let actionBtnHtml = '';
            
            // Acciones operativas exclusivas de compras
            if (state.activeRole === 'compras') {
                if (req.status === 'en_compra' || req.status === 'demorado') {
                    actionBtnHtml = `
                        <div class="actions-buttons" style="flex-direction: column; gap: 4px;">
                            <button class="btn-small receive" onclick="workflowTransition('${req.id}', 'recibir')" style="width:100%;">Marcar Recibido</button>
                            <div style="display: flex; gap: 4px; width: 100%;">
                                ${req.status === 'en_compra' ? `<button class="btn-small delay" onclick="workflowTransition('${req.id}', 'demorar')" style="flex-grow:1;">Reportar Demora</button>` : ''}
                                <button class="btn-secondary btn-small" onclick="openRescheduleDialog('${req.id}')" style="flex-grow:1; padding: 6px;" title="Reprogramar Fecha ETA">Re-programar</button>
                            </div>
                        </div>
                    `;
                }
            }

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong style="color: var(--accent-color); font-size: 0.8rem;">${req.id}</strong></td>
                <td style="font-size: 0.8rem; color: var(--text-secondary);">${new Date(req.requestedAt).toLocaleDateString('es-CO')}</td>
                <td>
                    <div style="font-weight: 600;">${req.requester}</div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary);">${req.area}</div>
                </td>
                <td style="font-weight: 600;">${req.product}</td>
                <td>${req.quantity} ${req.unit}</td>
                <td style="font-weight: 700;">$${(req.totalCost || 0).toLocaleString('es-CO')}</td>
                <td style="font-weight: 600; color: var(--warning); font-size: 0.85rem;">
                    ${formatDate(req.eta)}
                </td>
                <td><span class="status-pill ${req.status}">${getStatusLabel(req.status)}</span></td>
                <td>${actionBtnHtml}</td>
            `;
            tableBody.appendChild(tr);
        });
    }

    // Eventos de tabs
    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterButtons.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            activeFilter = e.target.getAttribute('data-po-filter');
            renderPOTable();
        });
    });

    renderPOTable();
}

// Modal para reprogramar el ETA de una orden de compra
window.openRescheduleDialog = function(id) {
    const req = state.requests.find(r => r.id === id);
    if (!req) return;

    openModal(`Reprogramar ETA - ${req.id}`, `
        <div style="display: flex; flex-direction: column; gap: 16px;">
            <p style="font-size: 0.85rem; color: var(--text-secondary);">Ajusta la fecha estimada de llegada de este pedido de <strong>${req.product}</strong>.</p>
            <div class="form-group">
                <label for="modal-resched-eta">Nueva Fecha de Arribo</label>
                <input type="date" class="form-control" id="modal-resched-eta" value="${req.eta}">
            </div>
            <button class="btn-primary" onclick="confirmReschedule('${req.id}')" style="justify-content: center; margin-top: 10px;">
                Guardar Nueva Fecha
            </button>
        </div>
    `);
};

window.confirmReschedule = function(id) {
    const newEta = document.getElementById('modal-resched-eta').value;

    if (!newEta) {
        showToast('Selecciona una fecha válida.', 'danger');
        return;
    }

    const reqIndex = state.requests.findIndex(r => r.id === id);
    if (reqIndex !== -1) {
        const req = state.requests[reqIndex];
        const oldEta = req.eta;
        req.eta = newEta;

        const userRole = ROLES[state.activeRole];
        req.approvalFlow.push({
            role: 'compras',
            action: `ETA reprogramado de ${oldEta} a ${newEta}`,
            by: userRole.name,
            date: new Date().toISOString()
        });

        localStorage.setItem('sigicq_requests', JSON.stringify(state.requests));
        showToast(`Fecha de entrega reprogramada para ${formatDate(newEta)}`, 'success');
        closeModal();
        updateAlertBadges();
        renderPurchaseOrdersView();
    }
};

// --- 7. CONTROL Y ANÁLISIS DE PRECIOS ---
function renderPriceControlView() {
    const catalogTbody = document.getElementById('price-catalog-tbody');
    const variationsTbody = document.getElementById('price-variations-tbody');
    const trendSelect = document.getElementById('price-trend-select');

    // 1. Calcular Métricas del Panel de Precios
    let totalBase = 0;
    let totalReal = 0;

    // Solo evaluar compras recibidas que tengan registros de precios
    const receivedPurchases = state.requests.filter(r => r.status === 'recibido' && r.priceBase);
    
    receivedPurchases.forEach(req => {
        const priceReal = req.priceReal || req.priceBase; // Si no hay real, se asume base
        totalBase += req.quantity * req.priceBase;
        totalReal += req.quantity * priceReal;
    });

    const netSavings = totalBase - totalReal;
    const avgVarPercentage = totalBase > 0 ? ((totalReal - totalBase) / totalBase) * 100 : 0;

    const savingsSpan = document.getElementById('price-metric-savings');
    savingsSpan.textContent = `${netSavings >= 0 ? '+' : ''}$${netSavings.toLocaleString('es-CO')}`;
    savingsSpan.className = `price-card-value ${netSavings >= 0 ? 'saving' : 'overcost'}`;

    document.getElementById('price-metric-base-total').textContent = `$${totalBase.toLocaleString('es-CO')}`;
    document.getElementById('price-metric-real-total').textContent = `$${totalReal.toLocaleString('es-CO')}`;
    
    const varSpan = document.getElementById('price-metric-avg-var');
    varSpan.textContent = `${avgVarPercentage.toFixed(2)}%`;
    varSpan.style.color = avgVarPercentage <= 0 ? 'var(--success)' : 'var(--danger)';

    // 2. Renderizar Tabla del Catálogo de Precios Base
    catalogTbody.innerHTML = state.inventory.map(item => `
        <tr>
            <td>
                <div style="font-weight:600;">${item.name}</div>
                <div style="font-size:0.75rem; color:var(--text-secondary);">${item.category.replace('_', ' ')} (${item.unit})</div>
            </td>
            <td style="font-weight: 600;">$${item.price.toLocaleString('es-CO')}</td>
            <td>
                ${(state.activeRole === 'compras' || state.activeRole === 'gerente') ? `
                    <button class="btn-icon btn-small" onclick="openBasePriceEditModal('${item.id}')" title="Editar Precio Base Catalogal" style="width: 32px; height: 32px;">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                ` : `<span style="font-size:0.75rem; color:var(--text-secondary);">Lectura</span>`}
            </td>
        </tr>
    `).join('');

    // 3. Renderizar Bitácora de Desviaciones de Precios
    if (receivedPurchases.length === 0) {
        variationsTbody.innerHTML = `<tr><td colspan="6" class="empty-state">No hay registros de compras entregadas.</td></tr>`;
    } else {
        variationsTbody.innerHTML = receivedPurchases.map(req => {
            const priceReal = req.priceReal || req.priceBase;
            const diffPrice = priceReal - req.priceBase;
            const percentageVar = ((priceReal - req.priceBase) / req.priceBase) * 100;
            const netImpact = (req.priceBase - priceReal) * req.quantity;

            return `
                <tr>
                    <td><strong style="color:var(--accent-color);">${req.id}</strong></td>
                    <td><div style="font-weight:500;">${req.product}</div></td>
                    <td>${req.quantity} ${req.unit}</td>
                    <td>
                        <div style="font-size:0.75rem; color:var(--text-secondary);">Base: $${req.priceBase.toLocaleString('es-CO')}</div>
                        <div style="font-weight:600;">Real: $${priceReal.toLocaleString('es-CO')}</div>
                    </td>
                    <td>
                        <span class="variation-badge ${percentageVar <= 0 ? 'saving' : 'overcost'}">
                            ${percentageVar <= 0 ? '' : '+'}${percentageVar.toFixed(1)}%
                        </span>
                    </td>
                    <td style="font-weight:600; color: ${netImpact >= 0 ? 'var(--success)' : 'var(--danger)'}">
                        ${netImpact >= 0 ? '+' : ''}$${netImpact.toLocaleString('es-CO')}
                    </td>
                </tr>
            `;
        }).join('');
    }

    // 4. Llenar Select de Tendencias Históricas
    trendSelect.innerHTML = state.inventory.map(item => `<option value="${item.name}">${item.name}</option>`).join('');
    
    // Escuchar cambios de selección
    trendSelect.addEventListener('change', () => {
        renderPriceControlCharts();
    });

    // Cargar gráfico inicial
    renderPriceControlCharts();
}

window.openBasePriceEditModal = function(id) {
    const item = state.inventory.find(i => i.id === id);
    if (!item) return;

    openModal('Editar Precio Base del Catálogo', `
        <div style="display: flex; flex-direction: column; gap: 16px;">
            <p style="font-size: 0.85rem; color: var(--text-secondary);">Ajusta el precio base de referencia en el catálogo para <strong>${item.name}</strong>.</p>
            <div class="form-group">
                <label for="modal-catalog-price">Precio Base por ${item.unit} ($)</label>
                <input type="number" class="form-control" id="modal-catalog-price" value="${item.price}">
            </div>
            <button class="btn-primary" onclick="saveBasePrice('${item.id}')" style="justify-content: center; margin-top: 10px;">
                Actualizar Catálogo
            </button>
        </div>
    `);
};

window.saveBasePrice = function(id) {
    const priceInput = document.getElementById('modal-catalog-price');
    const newPrice = parseFloat(priceInput.value);

    if (isNaN(newPrice) || newPrice <= 0) {
        showToast('Ingresa un precio base válido.', 'danger');
        return;
    }

    const item = state.inventory.find(i => i.id === id);
    if (item) {
        const oldPrice = item.price;
        item.price = newPrice;
        localStorage.setItem('sigicq_inventory', JSON.stringify(state.inventory));
        showToast(`Precio catálogo de ${item.name} modificado a $${newPrice.toLocaleString('es-CO')}`, 'success');
        closeModal();
        renderPriceControlView();
    }
};

// Generar gráfico dinámico SVG de tendencia de precios unitarios
function renderPriceControlCharts() {
    const select = document.getElementById('price-trend-select');
    const container = document.getElementById('price-trend-chart-body');
    if (!select || !container) return;

    const productName = select.value;
    
    // Obtener todas las compras recibidas de ese producto
    const purchases = state.requests
        .filter(r => r.product === productName && r.status === 'recibido' && r.priceBase);

    const item = state.inventory.find(i => i.name === productName);
    const basePrice = item ? item.price : 5000;

    // Calcular dinámicamente los últimos 6 meses en orden cronológico
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const now = new Date();
    const last6Months = [];
    
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        last6Months.push({
            year: d.getFullYear(),
            month: d.getMonth(),
            label: monthNames[d.getMonth()] + (i === 0 ? ' (Actual)' : '')
        });
    }

    const chartPoints = [];
    let lastKnownPrice = basePrice;

    last6Months.forEach(m => {
        const matches = purchases.filter(p => {
            const pDate = new Date(p.requestedAt);
            if (isNaN(pDate.getTime())) return false;
            return pDate.getFullYear() === m.year && pDate.getMonth() === m.month;
        });

        if (matches.length > 0) {
            const sum = matches.reduce((acc, p) => acc + (p.priceReal || p.priceBase), 0);
            lastKnownPrice = Math.round(sum / matches.length);
        }

        chartPoints.push({
            label: m.label,
            value: lastKnownPrice
        });
    });

    // Dibujar gráfico de línea unitaria
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 240;
    const paddingLeft = 55;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 30;

    const maxVal = Math.max(...chartPoints.map(p => p.value)) * 1.15 || 1000;
    const minVal = Math.min(...chartPoints.map(p => p.value)) * 0.85 || 0;
    const diff = maxVal - minVal || 100;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    let svgHtml = `<svg viewBox="0 0 ${width} ${height}" class="svg-chart">`;

    // Eje Y Grid
    const ticksY = 3;
    for (let i = 0; i <= ticksY; i++) {
        const gridVal = minVal + (diff * i) / ticksY;
        const y = height - paddingBottom - (chartHeight * i) / ticksY;
        svgHtml += `
            <line x1="${paddingLeft}" y1="${y}" x2="${width - paddingRight}" y2="${y}" stroke="var(--border-color)" stroke-dasharray="3 3" />
            <text x="${paddingLeft - 10}" y="${y + 4}" text-anchor="end">$${Math.round(gridVal).toLocaleString('es-CO')}</text>
        `;
    }

    // Puntos del gráfico
    const stepX = chartWidth / (chartPoints.length - 1 || 1);
    const points = chartPoints.map((pt, index) => {
        const x = paddingLeft + index * stepX;
        const y = height - paddingBottom - ((pt.value - minVal) / diff) * chartHeight;
        return { x, y, label: pt.label, value: pt.value };
    });

    // Trazar línea
    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
        pathD += ` L ${points[i].x} ${points[i].y}`;
    }
    
    // Trazar área
    let areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`;

    svgHtml += `
        <!-- Relleno de área de gradiente -->
        <path d="${areaD}" fill="url(#price-chart-grad)" opacity="0.1" />
        <defs>
            <linearGradient id="price-chart-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="var(--success)" />
                <stop offset="100%" stop-color="var(--success)" stop-opacity="0" />
            </linearGradient>
        </defs>
    `;

    svgHtml += `<path class="chart-line" d="${pathD}" fill="none" stroke="var(--success)" stroke-width="2.5" stroke-linecap="round" />`;

    // Dibujar puntos e hitos
    points.forEach((pt) => {
        svgHtml += `
            <text x="${pt.x}" y="${height - 10}" text-anchor="middle" font-size="9">${pt.label}</text>
            <circle class="chart-point" cx="${pt.x}" cy="${pt.y}" r="4.5" fill="var(--bg-secondary)" stroke="var(--success)" stroke-width="2" data-val="$${pt.value.toLocaleString('es-CO')}" data-label="${pt.label}" />
        `;
    });

    svgHtml += `</svg>`;
    container.innerHTML = svgHtml;
    
    // Activar tooltips para el gráfico
    Charts.setupTooltips(container);
}

// === VISTA DE SISTEMAS Y ADMINISTRACIÓN DE USUARIOS ===
function getSystemsTemplate() {
    return `
        <div style="display: grid; grid-template-columns: 1fr; gap: 24px;">
            <!-- Panel de Mantenimiento y Respaldos -->
            <div class="card" style="padding: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 12px; margin-bottom: 20px;">
                    <h3 style="font-size: 1.1rem; display: flex; align-items: center; gap: 8px;">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                        Mantenimiento General del Sistema
                    </h3>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px;">
                    <div class="card" style="background-color: rgba(255,255,255,0.01); border: 1px solid var(--border-color); padding: 16px; border-radius: var(--border-radius); display: flex; flex-direction: column; justify-content: space-between; gap: 12px;">
                        <div>
                            <strong style="display: block; margin-bottom: 4px; font-size: 0.95rem;">Respaldar Base de Datos</strong>
                            <p style="font-size: 0.8rem; color: var(--text-secondary); margin: 0;">Exporta todo el estado de la aplicación (inventario, solicitudes, usuarios) en un archivo JSON descargable.</p>
                        </div>
                        <button class="btn-primary" onclick="exportDatabase()" style="width: 100%; justify-content: center; gap: 8px;">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                            Exportar Backup JSON
                        </button>
                    </div>

                    <div class="card" style="background-color: rgba(255,255,255,0.01); border: 1px solid var(--border-color); padding: 16px; border-radius: var(--border-radius); display: flex; flex-direction: column; justify-content: space-between; gap: 12px;">
                        <div>
                            <strong style="display: block; margin-bottom: 4px; font-size: 0.95rem;">Restaurar Copia de Seguridad</strong>
                            <p style="font-size: 0.8rem; color: var(--text-secondary); margin: 0;">Carga un archivo de respaldo JSON para sobrescribir todo el estado de la aplicación actual.</p>
                        </div>
                        <div>
                            <input type="file" id="import-db-file" accept=".json" onchange="importDatabase(event)" style="display: none;">
                            <button class="btn-primary" onclick="triggerImportDatabase()" style="width: 100%; justify-content: center; gap: 8px; background-color: var(--warning); border-color: var(--warning); color: #000;">
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                                Importar Backup JSON
                            </button>
                        </div>
                    </div>

                    <div class="card" style="background-color: rgba(255,255,255,0.01); border: 1px solid var(--border-color); padding: 16px; border-radius: var(--border-radius); display: flex; flex-direction: column; justify-content: space-between; gap: 12px;">
                        <div>
                            <strong style="display: block; margin-bottom: 4px; font-size: 0.95rem; color: var(--danger);">Restablecimiento de Fábrica</strong>
                            <p style="font-size: 0.8rem; color: var(--text-secondary); margin: 0;">Borra toda la base de datos de local storage y recarga la configuración y registros semilla originales.</p>
                        </div>
                        <button class="btn-primary" onclick="resetAppDatabase()" style="width: 100%; justify-content: center; gap: 8px; background-color: var(--danger); border-color: var(--danger);">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                            Formatear Base de Datos
                        </button>
                    </div>
                </div>
            </div>

            <!-- Panel de Control de Usuarios -->
            <div class="card" style="padding: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 12px; margin-bottom: 20px;">
                    <h3 style="font-size: 1.1rem; display: flex; align-items: center; gap: 8px;">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        Gestión de Usuarios y Permisos
                    </h3>
                    <button class="btn-primary" onclick="openAddUserModal()">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        Crear Nuevo Usuario
                    </button>
                </div>

                <div class="table-container">
                    <table class="responsive-table">
                        <thead>
                            <tr>
                                <th>Nombre / Usuario</th>
                                <th>Área y Cargo</th>
                                <th>Permisos de Vistas</th>
                                <th style="text-align: right;">Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="systems-users-tbody">
                            <!-- Se carga dinámicamente -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

function renderSystemsView() {
    const tbody = document.getElementById('systems-users-tbody');
    if (!tbody) return;

    const savedUsers = localStorage.getItem('sigicq_users');
    const users = savedUsers ? JSON.parse(savedUsers) : [];

    const viewLabels = {
        dashboard: 'Dashboard',
        inventory: 'Inventario',
        requests: 'Solicitudes',
        containers: 'Envases',
        approvals: 'Aprobaciones',
        purchase_orders: 'Compras',
        price_control: 'Precios',
        alerts: 'Alertas',
        history: 'Historial',
        systems: 'Sistemas'
    };

    tbody.innerHTML = users.map(user => {
        const permissions = user.permissions || [];
        const isSelf = user.username === state.activeRole;

        const permPills = permissions.map(p => `
            <span class="status-pill recibido" style="font-size: 0.7rem; padding: 2px 6px; background-color: var(--accent-light); color: var(--accent-color); border: none;">
                ${viewLabels[p] || p}
            </span>
        `).join(' ');

        return `
            <tr>
                <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div class="avatar" style="width: 30px; height: 30px; font-size: 0.85rem; font-weight: 700; display: flex; align-items: center; justify-content: center; border-radius: 50%; background-color: var(--accent-light); color: var(--accent-color);">${user.name.charAt(0)}</div>
                        <div>
                            <div style="font-weight: 600;">${user.name}</div>
                            <div style="font-size: 0.75rem; color: var(--text-secondary); font-family: monospace;">@${user.username}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <div style="font-weight: 500;">${user.area}</div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary);">${user.roleLabel}</div>
                </td>
                <td>
                    <div style="display: flex; flex-wrap: wrap; gap: 4px; max-width: 450px;">
                        ${permPills || '<span style="font-size: 0.75rem; color: var(--danger);">Ninguno</span>'}
                    </div>
                </td>
                <td style="text-align: right;">
                    <div style="display: flex; gap: 6px; justify-content: flex-end;">
                        <button class="btn-icon btn-small" onclick="openEditPermissionsModal('${user.username}')" title="Editar Permisos" style="width: 32px; height: 32px;">
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        ${(!isSelf) ? `
                            <button class="btn-icon btn-small" onclick="deleteUser('${user.username}')" title="Eliminar Usuario" style="width: 32px; height: 32px; color: var(--danger); border-color: rgba(239, 68, 68, 0.1); background-color: rgba(239, 68, 68, 0.05);">
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

window.openAddUserModal = function() {
    openModal('Registrar Nuevo Usuario', `
        <form id="modal-add-user-form" onsubmit="saveNewUser(event)" style="display: flex; flex-direction: column; gap: 14px;">
            <div class="form-group">
                <label for="reg-username">Nombre de Usuario (Login)</label>
                <input type="text" class="form-control" id="reg-username" required placeholder="ej. carlos_p" style="text-transform: lowercase;">
            </div>
            <div class="form-group">
                <label for="reg-password">Contraseña</label>
                <input type="password" class="form-control" id="reg-password" required placeholder="ej. 123" value="123">
            </div>
            <div class="form-group">
                <label for="reg-name">Nombre Completo</label>
                <input type="text" class="form-control" id="reg-name" required placeholder="ej. Carlos Pérez">
            </div>
            <div class="form-group">
                <label for="reg-area">Área de la Empresa</label>
                <select class="form-control" id="reg-area" required>
                    <option value="Producción">Producción</option>
                    <option value="Logística">Logística</option>
                    <option value="Comercial">Comercial</option>
                    <option value="Mantenimiento">Mantenimiento</option>
                    <option value="Compras">Compras</option>
                    <option value="Gerencia">Gerencia</option>
                    <option value="Sistemas">Sistemas</option>
                </select>
            </div>
            <div class="form-group">
                <label for="reg-role-label">Cargo o Título</label>
                <input type="text" class="form-control" id="reg-role-label" required placeholder="ej. Coordinador de Bodega">
            </div>
            <button type="submit" class="btn-primary" style="justify-content: center; margin-top: 10px;">
                Crear Usuario
            </button>
        </form>
    `);
};

window.saveNewUser = function(e) {
    e.preventDefault();
    const username = document.getElementById('reg-username').value.trim().toLowerCase();
    const password = document.getElementById('reg-password').value;
    const name = document.getElementById('reg-name').value.trim();
    const area = document.getElementById('reg-area').value;
    const roleLabel = document.getElementById('reg-role-label').value.trim();

    if (!username || !password || !name || !roleLabel) {
        showToast('Por favor, rellena todos los campos.', 'danger');
        return;
    }

    const savedUsers = localStorage.getItem('sigicq_users');
    const users = savedUsers ? JSON.parse(savedUsers) : [];

    if (users.some(u => u.username === username)) {
        showToast('El nombre de usuario ya está registrado.', 'danger');
        return;
    }

    const defaultPermissions = ['dashboard', 'inventory', 'requests', 'history'];

    const newUser = {
        username,
        password,
        name,
        area,
        roleLabel,
        permissions: defaultPermissions
    };

    users.push(newUser);
    localStorage.setItem('sigicq_users', JSON.stringify(users));

    ROLES[username] = {
        name,
        roleLabel,
        area,
        password,
        permissions: defaultPermissions
    };

    showToast(`Usuario @${username} creado con éxito. Permisos iniciales asignados.`, 'success');
    closeModal();
    renderSystemsView();
};

window.deleteUser = function(username) {
    if (username === state.activeRole) {
        showToast('No puedes eliminar tu propio usuario de sesión activa.', 'danger');
        return;
    }

    if (confirm(`¿Estás seguro de que deseas eliminar permanentemente al usuario @${username}?`)) {
        const savedUsers = localStorage.getItem('sigicq_users');
        let users = savedUsers ? JSON.parse(savedUsers) : [];

        users = users.filter(u => u.username !== username);
        localStorage.setItem('sigicq_users', JSON.stringify(users));

        delete ROLES[username];

        showToast(`Usuario @${username} eliminado correctamente.`, 'success');
        renderSystemsView();
    }
};

window.openEditPermissionsModal = function(username) {
    const savedUsers = localStorage.getItem('sigicq_users');
    const users = savedUsers ? JSON.parse(savedUsers) : [];
    const user = users.find(u => u.username === username);
    if (!user) return;

    const allViews = [
        { key: 'dashboard', name: 'Dashboard' },
        { key: 'inventory', name: 'Inventario (Stock y Ajustes)' },
        { key: 'requests', name: 'Solicitudes (Crear Solicitudes)' },
        { key: 'containers', name: 'Sugeridos Envases (Envases)' },
        { key: 'approvals', name: 'Aprobaciones (Bandeja Compras/Gerente)' },
        { key: 'purchase_orders', name: 'Órdenes de Compra (Pedidos)' },
        { key: 'price_control', name: 'Control de Precios (Métricas y Gráfica)' },
        { key: 'alerts', name: 'Alertas (Nivel Crítico)' },
        { key: 'history', name: 'Historial y Trazabilidad (Auditoría)' },
        { key: 'systems', name: 'Sistemas (Administración y Respaldos)' }
    ];

    const currentPermissions = user.permissions || [];

    const checkboxesHtml = allViews.map(view => {
        const checked = currentPermissions.includes(view.key) ? 'checked' : '';
        return `
            <div style="display: flex; align-items: center; gap: 10px; padding: 6px 0;">
                <input type="checkbox" id="perm-${view.key}" class="form-checkbox" value="${view.key}" ${checked} style="width: 18px; height: 18px; cursor: pointer;">
                <label for="perm-${view.key}" style="font-weight: 500; cursor: pointer; user-select: none;">${view.name}</label>
            </div>
        `;
    }).join('');

    openModal(`Editar Permisos de @${username}`, `
        <div style="display: flex; flex-direction: column; gap: 16px;">
            <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0;">Selecciona las vistas a las que tendrá acceso <strong>${user.name}</strong>:</p>
            <div style="max-height: 280px; overflow-y: auto; padding-right: 8px; border: 1px solid var(--border-color); border-radius: var(--border-radius); padding: 12px; background-color: rgba(0,0,0,0.15);">
                ${checkboxesHtml}
            </div>
            <div style="display: flex; gap: 10px;">
                <button class="btn-primary" onclick="saveUserPermissions('${username}')" style="flex: 1; justify-content: center;">
                    Guardar Cambios
                </button>
                <button class="btn-primary" onclick="closeModal()" style="background-color: transparent; border-color: var(--border-color); color: var(--text-primary); flex: 1; justify-content: center;">
                    Cancelar
                </button>
            </div>
        </div>
    `);
};

window.saveUserPermissions = function(username) {
    const savedUsers = localStorage.getItem('sigicq_users');
    const users = savedUsers ? JSON.parse(savedUsers) : [];
    const userIndex = users.findIndex(u => u.username === username);

    if (userIndex === -1) {
        showToast('Usuario no encontrado.', 'danger');
        return;
    }

    const allViewKeys = ['dashboard', 'inventory', 'requests', 'containers', 'approvals', 'purchase_orders', 'price_control', 'alerts', 'history', 'systems'];
    const newPermissions = [];

    allViewKeys.forEach(key => {
        const checkbox = document.getElementById(`perm-${key}`);
        if (checkbox && checkbox.checked) {
            newPermissions.push(key);
        }
    });

    users[userIndex].permissions = newPermissions;
    localStorage.setItem('sigicq_users', JSON.stringify(users));

    if (ROLES[username]) {
        ROLES[username].permissions = newPermissions;
    }

    showToast(`Permisos de @${username} actualizados con éxito.`, 'success');
    closeModal();
    renderSystemsView();

    if (username === state.activeRole) {
        updateUserProfileDisplay();
        if (!newPermissions.includes(state.currentView)) {
            triggerViewChange('dashboard');
        }
    }
};

window.resetAppDatabase = function() {
    if (confirm('¡ATENCIÓN CRÍTICA! ¿Estás seguro de que deseas formatear la base de datos completa de la aplicación? Esto borrará todas las solicitudes, registros de inventario y usuarios creados, restableciendo los valores de fábrica.')) {
        localStorage.clear();
        showToast('Base de datos restablecida. Recargando aplicación...', 'warning');
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }
};

window.exportDatabase = function() {
    const backupData = {
        sigicq_inventory: JSON.parse(localStorage.getItem('sigicq_inventory')),
        sigicq_requests: JSON.parse(localStorage.getItem('sigicq_requests')),
        sigicq_users: JSON.parse(localStorage.getItem('sigicq_users')),
        sigicq_theme: localStorage.getItem('sigicq_theme') || 'dark'
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 4));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href",     dataStr);
    downloadAnchor.setAttribute("download", `sigicq_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Copia de seguridad del sistema exportada con éxito.', 'success');
};

window.triggerImportDatabase = function() {
    document.getElementById('import-db-file').click();
};

window.importDatabase = function(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            
            if (!importedData.sigicq_inventory || !importedData.sigicq_requests || !importedData.sigicq_users) {
                showToast('Error: El archivo de respaldo JSON no tiene el formato o estructura válidos.', 'danger');
                return;
            }

            localStorage.setItem('sigicq_inventory', JSON.stringify(importedData.sigicq_inventory));
            localStorage.setItem('sigicq_requests', JSON.stringify(importedData.sigicq_requests));
            localStorage.setItem('sigicq_users', JSON.stringify(importedData.sigicq_users));
            if (importedData.sigicq_theme) {
                localStorage.setItem('sigicq_theme', importedData.sigicq_theme);
            }

            showToast('Base de datos restaurada correctamente. Recargando sistema...', 'success');
            setTimeout(() => {
                window.location.reload();
            }, 1200);

        } catch (err) {
            showToast('Error al procesar el archivo JSON de respaldo.', 'danger');
            console.error(err);
        }
    };
    reader.readAsText(file);
};

// --- 8. ALERTAS INTELIGENTES ---
function renderAlertsView() {
    const grid = document.getElementById('alerts-page-grid');
    if (!grid) return;

    const currentAlerts = calculateCurrentAlerts();

    if (currentAlerts.length === 0) {
        grid.innerHTML = '<div class="empty-state" style="grid-column: 1/-1;">No hay alertas críticas en el sistema. Todo marcha correctamente.</div>';
        return;
    }

    grid.innerHTML = currentAlerts.map(alert => {
        let actionBtnHtml = '';

        if (alert.type === 'stock_min') {
            actionBtnHtml = `
                <button class="btn-primary btn-small alert-item-action" onclick="suggestCriticalOrder('${alert.name}', '${alert.unit}', ${alert.qtyNeeded})">
                    Generar Sugerido
                </button>
            `;
        } else if (alert.type === 'antiguo') {
            actionBtnHtml = `
                <button class="btn-secondary btn-small alert-item-action" onclick="triggerViewChange('approvals')">
                    Ver Aprobaciones
                </button>
            `;
        } else if (alert.type === 'pedido_retrasado' || alert.type === 'pendiente_compra') {
            actionBtnHtml = `
                <button class="btn-secondary btn-small alert-item-action" onclick="triggerViewChange('purchase_orders')">
                    Ver en Órdenes
                </button>
            `;
        }

        return `
            <div class="alert-item-card ${alert.level}">
                <div class="alert-item-icon ${alert.level}">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                </div>
                <div class="alert-item-content">
                    <span class="alert-item-title">${alert.title}</span>
                    <span class="alert-item-desc">${alert.desc}</span>
                    ${actionBtnHtml}
                </div>
            </div>
        `;
    }).join('');
}

// Calcular Alertas de Forma Dinámica
function calculateCurrentAlerts() {
    const alerts = [];
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Alertas de Inventario
    state.inventory.forEach(item => {
        if (item.stock <= item.min) {
            alerts.push({
                type: 'stock_min',
                name: item.name,
                unit: item.unit,
                qtyNeeded: item.min * 2 - item.stock,
                level: 'danger',
                title: `Stock Crítico: ${item.name}`,
                desc: `Existencia en bodega de (${item.stock} ${item.unit}) está por debajo del mínimo de seguridad (${item.min} ${item.unit}).`
            });
        } else if (item.stock <= item.min * 1.3) {
            alerts.push({
                type: 'stock_min',
                name: item.name,
                unit: item.unit,
                qtyNeeded: item.min * 1.5 - item.stock,
                level: 'warning',
                title: `Stock Bajo: ${item.name}`,
                desc: `Existencia en bodega de (${item.stock} ${item.unit}) está próxima a agotarse. Mín: (${item.min} ${item.unit}).`
            });
        }
    });

    // 2. Alertas de retraso de firmas
    state.requests.forEach(req => {
        if (req.status === 'pendiente') {
            const daysPending = Math.floor((Date.now() - new Date(req.requestedAt).getTime()) / (1000 * 60 * 60 * 24));
            if (daysPending >= 3) {
                alerts.push({
                    type: 'antiguo',
                    id: req.id,
                    level: 'warning',
                    title: `Aprobación Retrasada: ${req.id}`,
                    desc: `La sugerencia de ${req.product} (${req.quantity} ${req.unit}) solicitada por ${req.requester} lleva ${daysPending} días sin ser cotizada.`
                });
            }
        }
    });

    // 3. Alertas de llegada de pedidos (ETA)
    state.requests.forEach(req => {
        if (req.status === 'en_compra' || req.status === 'demorado') {
            if (req.eta) {
                const isOverdue = new Date(todayStr).getTime() > parseDate(req.eta).getTime();
                if (isOverdue || req.status === 'demorado') {
                    alerts.push({
                        type: 'pedido_retrasado',
                        id: req.id,
                        level: 'danger',
                        title: `Pedido Excedió Fecha ETA: ${req.id}`,
                        desc: `El pedido de ${req.product} (${req.quantity} ${req.unit}) sobrepasó su fecha estimada de llegada (${formatDate(req.eta)}).`
                    });
                } else {
                    alerts.push({
                        type: 'pendiente_compra',
                        id: req.id,
                        level: 'info',
                        title: `Orden en Tránsito: ${req.id}`,
                        desc: `En tránsito. Fecha estimada de recepción: ${formatDate(req.eta)}.`
                    });
                }
            }
        }
    });

    return alerts;
}

// --- 9. HISTORIAL Y TRAZABILIDAD ---
function renderHistoryView() {
    const tableBody = document.getElementById('history-table-body');
    const searchInput = document.getElementById('history-search');
    const statusFilter = document.getElementById('history-status-filter');

    let filterStatus = 'all';
    let searchQuery = '';

    function filterAndRenderHistory() {
        let filtered = state.requests;

        if (filterStatus !== 'all') {
            filtered = filtered.filter(req => req.status === filterStatus);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(req => 
                req.product.toLowerCase().includes(query) || 
                req.id.toLowerCase().includes(query) ||
                req.requester.toLowerCase().includes(query) ||
                req.area.toLowerCase().includes(query)
            );
        }

        tableBody.innerHTML = '';
        if (filtered.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="8" class="empty-state">No se registraron transacciones coincidentes.</td></tr>`;
            return;
        }

        filtered.forEach(req => {
            const lastStep = req.approvalFlow[req.approvalFlow.length - 1];
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong style="color: var(--accent-color); font-size: 0.8rem;">${req.id}</strong></td>
                <td style="font-size: 0.8rem; color: var(--text-secondary);">${new Date(req.requestedAt).toLocaleString('es-CO')}</td>
                <td style="font-weight: 500;">${req.area}</td>
                <td>
                    <div style="font-weight: 600;">${req.product}</div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary);">Solicitó: ${req.requester}</div>
                </td>
                <td style="font-weight: 500;">
                    <div>${req.quantity} ${req.unit}</div>
                    ${req.eta ? `<div style="font-size: 0.7rem; color: var(--warning); font-weight: 500;">ETA: ${formatDate(req.eta)}</div>` : ''}
                </td>
                <td style="font-size: 0.8rem;">
                    <div>${lastStep.action}</div>
                    <div style="font-size: 0.7rem; color: var(--text-secondary);">Por: ${lastStep.by}</div>
                </td>
                <td><span class="status-pill ${req.status}">${getStatusLabel(req.status)}</span></td>
                <td>
                    <button class="btn-icon btn-small" onclick="openTimelineModal('${req.id}')" title="Ver línea de tiempo detallada" style="width: 32px; height: 32px;">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    </button>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }

    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        filterAndRenderHistory();
    });

    statusFilter.addEventListener('change', (e) => {
        filterStatus = e.target.value;
        filterAndRenderHistory();
    });

    filterAndRenderHistory();
}

// Modal Timeline de Trazabilidad y Firmas
window.openTimelineModal = function(requestId) {
    const req = state.requests.find(r => r.id === requestId);
    if (!req) return;

    const formattedCost = `$${req.totalCost.toLocaleString('es-CO')}`;

    let timelineStepsHtml = '';

    const rolesFlow = [
        { role: req.approvalFlow[0].role, label: 'Jefatura de Área (Solicitud)', icon: '📝' },
        { role: 'gerente', label: 'Visto Bueno Gerencia (Autorización)', icon: '✍️', conditional: req.requiresGerencia },
        { role: 'compras', label: 'Adquisición de Compras (En Compra)', icon: '🛒' },
        { role: 'bodega', label: 'Recepción en Bodega (Existencia Física)', icon: '📦' }
    ];

    rolesFlow.forEach(step => {
        if (step.conditional === false) return;

        const matchedFirma = req.approvalFlow.find(f => {
            if (step.role === 'bodega') return f.role === 'bodega';
            if (step.role === 'compras') return f.action.includes('Orden') || f.action.includes('Cotizado') || f.action.includes('Retrasado') || f.action.includes('ETA reprogramado');
            if (step.role === 'gerente') return f.role === 'gerencia' || f.role === 'gerente';
            return f.role === step.role;
        });

        let statusClass = '';
        let dateHtml = 'Pendiente de cotizar / procesar';
        let actorHtml = '';

        if (matchedFirma) {
            statusClass = 'completed';
            if (matchedFirma.action === 'Rechazado') {
                statusClass = 'rejected';
                dateHtml = `Rechazado el ${new Date(matchedFirma.date).toLocaleString('es-CO')}`;
                actorHtml = `Firmado por: ${matchedFirma.by}`;
            } else {
                dateHtml = `Procesado el ${new Date(matchedFirma.date).toLocaleString('es-CO')}`;
                actorHtml = `Firmado por: ${matchedFirma.by}`;
            }
        } else {
            if (req.status === 'rechazado') {
                statusClass = 'rejected';
                dateHtml = 'Flujo Cancelado';
            } else {
                const lastFirmaIndex = req.approvalFlow.length - 1;
                const lastFirmaRole = req.approvalFlow[lastFirmaIndex].role;
                
                let isActive = false;
                if (step.role === 'gerente' && req.status === 'pendiente_gerencia') isActive = true;
                if (step.role === 'compras' && req.status === 'pendiente') isActive = true;
                if (step.role === 'compras' && req.status === 'aprobado') isActive = true;
                if (step.role === 'bodega' && (req.status === 'en_compra' || req.status === 'demorado')) isActive = true;

                if (isActive) statusClass = 'active';
            }
        }

        timelineStepsHtml += `
            <div class="timeline-step ${statusClass}">
                <div class="timeline-icon">${step.icon}</div>
                <div class="timeline-content">
                    <h4>${step.label}</h4>
                    <span>${dateHtml}</span>
                    ${actorHtml ? `<p style="font-weight: 500; font-size: 0.75rem;">${actorHtml}</p>` : ''}
                </div>
            </div>
        `;
    });

    const bodyHtml = `
        <div style="display: flex; flex-direction: column; gap: 20px;">
            <!-- Ficha resumen -->
            <div style="background-color: rgba(255,255,255,0.01); border: 1px solid var(--border-color); border-radius: var(--border-radius-md); padding: 16px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 0.85rem;">
                <div>Folio: <strong style="color: var(--accent-color);">${req.id}</strong></div>
                <div>Estado: <span class="status-pill ${req.status}">${getStatusLabel(req.status)}</span></div>
                <div>Producto: <strong>${req.product}</strong></div>
                <div>Cantidad: <strong>${req.quantity} ${req.unit}</strong></div>
                <div>Costo Est: <strong>${formattedCost}</strong></div>
                <div>Firma Gerencial Requerida: <strong>${req.requiresGerencia ? 'SÍ (> $2M COP)' : 'NO (Normal)'}</strong></div>
                ${req.priceReal ? `<div>Precio Unit. Real: <strong>$${req.priceReal.toLocaleString('es-CO')}</strong> (Base: $${req.priceBase.toLocaleString('es-CO')})</div>` : ''}
                ${req.eta ? `<div style="grid-column: 1/-1; border-top: 1px solid var(--border-color); padding-top: 10px; margin-top: 4px;">ETA (Entrega Estimada): <strong style="color: var(--warning);">${formatDate(req.eta)}</strong></div>` : ''}
                <div style="grid-column: 1/-1; border-top: 1px solid var(--border-color); padding-top: 10px; margin-top: 4px;">
                    Justificación: <span style="color: var(--text-secondary);">${req.justification}</span>
                </div>
            </div>

            <h4 style="font-weight: 600; font-size: 0.95rem; border-bottom: 1px solid var(--border-color); padding-bottom: 8px; margin-top: 10px;">Línea de Trazabilidad e Historial</h4>
            
            <div class="timeline">
                ${timelineStepsHtml}
            </div>
        </div>
    `;

    openModal(`Trazabilidad - ${req.id}`, bodyHtml);
};

/* ==========================================================================
   ALERTAS Y NOTIFICACIONES AUXILIARES
   ========================================================================== */

function updateAlertBadges() {
    const currentAlerts = calculateCurrentAlerts();
    const criticalCount = currentAlerts.filter(a => a.level === 'danger' || a.level === 'warning').length;

    const sidebarBadge = document.getElementById('badge-alerts-sidebar');
    const topbarBadge = document.getElementById('badge-alerts-top');

    if (sidebarBadge) {
        sidebarBadge.textContent = criticalCount;
        if (criticalCount === 0) sidebarBadge.classList.add('hidden');
        else sidebarBadge.classList.remove('hidden');
    }

    if (topbarBadge) {
        topbarBadge.textContent = criticalCount;
        if (criticalCount === 0) {
            topbarBadge.style.display = 'none';
        } else {
            topbarBadge.style.display = 'flex';
        }
    }

    // Tareas del rol actual
    const currentRole = state.activeRole;
    const approvalCount = state.requests.filter(req => {
        if (currentRole === 'gerente') {
            return req.status === 'pendiente_gerencia';
        } else if (currentRole === 'compras') {
            return req.status === 'pendiente';
        }
        return false;
    }).length;

    const approvalsBadge = document.getElementById('badge-approvals');
    if (approvalsBadge) {
        approvalsBadge.textContent = approvalCount;
        if (approvalCount === 0) approvalsBadge.classList.add('hidden');
        else approvalsBadge.classList.remove('hidden');
    }

    // Alertas operativas en Órdenes de Compra (OC en tránsito)
    const activePOCount = state.requests.filter(r => r.status === 'en_compra' || r.status === 'demorado').length;
    const poBadge = document.getElementById('badge-purchase-orders');
    if (poBadge) {
        poBadge.textContent = activePOCount;
        if (activePOCount === 0) poBadge.classList.add('hidden');
        else poBadge.classList.remove('hidden');
    }
}

function renderQuickAlertsDropdown() {
    const listContainer = document.getElementById('notifications-dropdown-list');
    if (!listContainer) return;

    const currentAlerts = calculateCurrentAlerts();
    const criticalList = currentAlerts.filter(a => a.level === 'danger' || a.level === 'warning').slice(0, 5);

    if (criticalList.length === 0) {
        listContainer.innerHTML = '<p class="empty-state">No hay alertas críticas en tránsito.</p>';
        return;
    }

    listContainer.innerHTML = criticalList.map(alert => {
        return `
            <div class="notification-item" onclick="triggerViewChange('alerts')">
                <div class="notification-icon-wrapper ${alert.level}">
                    ⚠️
                </div>
                <div class="notification-info">
                    <span class="notification-title">${alert.title}</span>
                    <span class="notification-desc">${Charts.truncateText(alert.desc, 45)}</span>
                </div>
            </div>
        `;
    }).join('');
}

window.adjustStockModal = function(id) {
    const item = state.inventory.find(i => i.id === id);
    if (!item) return;

    openModal('Ajustar Stock Manual', `
        <div style="display: flex; flex-direction: column; gap: 16px;">
            <p style="font-size: 0.85rem; color: var(--text-secondary);">Introduce el nuevo stock físico para <strong>${item.name}</strong>.</p>
            <div class="form-group">
                <label>Producto</label>
                <input type="text" class="form-control" value="${item.name} (${item.unit})" readonly>
            </div>
            <div class="form-group">
                <label for="modal-adjust-qty">Cantidad en Bodega</label>
                <input type="number" class="form-control" id="modal-adjust-qty" value="${item.stock}">
            </div>
            <button class="btn-primary" onclick="saveStockAdjustment('${item.id}')" style="justify-content: center; margin-top: 10px;">
                Guardar Ajuste
            </button>
        </div>
    `);
};

window.saveStockAdjustment = function(id) {
    const qtyInput = document.getElementById('modal-adjust-qty');
    const newQty = parseInt(qtyInput.value);

    if (isNaN(newQty) || newQty < 0) {
        showToast('Cantidad inválida.', 'danger');
        return;
    }

    const item = state.inventory.find(i => i.id === id);
    if (item) {
        const oldStock = item.stock;
        item.stock = newQty;
        localStorage.setItem('sigicq_inventory', JSON.stringify(state.inventory));
        showToast(`Stock de ${item.name} ajustado de ${oldStock} a ${newQty}.`, 'success');
        
        // Registrar en bitácora
        const customReq = {
            id: `AJUS-${Math.floor(1000 + Math.random() * 9000)}`,
            area: ROLES[state.activeRole].area,
            product: item.name,
            quantity: Math.abs(newQty - oldStock),
            unit: item.unit,
            justification: `Ajuste manual por auditoría física.`,
            requester: ROLES[state.activeRole].name,
            requestedAt: new Date().toISOString(),
            status: 'recibido',
            totalCost: 0,
            priceBase: item.price,
            requiresGerencia: false,
            approvalFlow: [
                { role: state.activeRole, action: 'Ajustado Manualmente', by: ROLES[state.activeRole].name, date: new Date().toISOString() }
            ]
        };
        state.requests.unshift(customReq);
        localStorage.setItem('sigicq_requests', JSON.stringify(state.requests));

        closeModal();
        updateAlertBadges();
        renderCurrentView();
    }
};

function openNewItemModal() {
    openModal('Agregar Nuevo Producto', `
        <form id="modal-form-add-product" style="display: flex; flex-direction: column; gap: 16px;">
            <div class="form-group">
                <label for="new-prod-name">Nombre del Producto</label>
                <input type="text" class="form-control" id="new-prod-name" required placeholder="Ej. Ácido Nítrico">
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div class="form-group">
                    <label for="new-prod-cat">Categoría</label>
                    <select class="form-control" id="new-prod-cat" required>
                        <option value="materia_prima">Materia Prima</option>
                        <option value="producto_terminado">Producto Terminado</option>
                        <option value="envase">Envase</option>
                        <option value="etiqueta">Etiqueta</option>
                        <option value="empaque">Material Empaque</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="new-prod-unit">Unidad de Medida</label>
                    <input type="text" class="form-control" id="new-prod-unit" required placeholder="Ej. L, kg, Unidades">
                </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
                <div class="form-group">
                    <label for="new-prod-stock">Stock Inicial</label>
                    <input type="number" class="form-control" id="new-prod-stock" min="0" required value="0">
                </div>
                <div class="form-group">
                    <label for="new-prod-min">Mínimo</label>
                    <input type="number" class="form-control" id="new-prod-min" min="0" required placeholder="10">
                </div>
                <div class="form-group">
                    <label for="new-prod-max">Máximo</label>
                    <input type="number" class="form-control" id="new-prod-max" min="1" required placeholder="100">
                </div>
            </div>
            <div class="form-group">
                <label for="new-prod-price">Precio Promedio Unitario ($)</label>
                <input type="number" class="form-control" id="new-prod-price" min="0" required placeholder="8000">
            </div>
            <button type="submit" class="btn-primary" style="justify-content: center; margin-top: 10px;">
                Agregar a Bodega
            </button>
        </form>
    `);

    const form = document.getElementById('modal-form-add-product');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('new-prod-name').value;
        const category = document.getElementById('new-prod-cat').value;
        const unit = document.getElementById('new-prod-unit').value;
        const stock = parseInt(document.getElementById('new-prod-stock').value);
        const min = parseInt(document.getElementById('new-prod-min').value);
        const max = parseInt(document.getElementById('new-prod-max').value);
        const price = parseFloat(document.getElementById('new-prod-price').value);

        if (min >= max) {
            showToast('El stock mínimo no puede ser mayor o igual al máximo.', 'danger');
            return;
        }

        const prefix = category === 'materia_prima' ? 'mp' :
                       category === 'producto_terminado' ? 'pt' :
                       category === 'envase' ? 'en' :
                       category === 'etiqueta' ? 'et' : 'me';
        const id = `${prefix}_${state.inventory.length + 1}`;

        const newItem = { id, name, category, stock, min, max, unit, price };
        state.inventory.push(newItem);
        localStorage.setItem('sigicq_inventory', JSON.stringify(state.inventory));

        showToast(`Producto ${name} agregado con éxito.`, 'success');
        closeModal();
        updateAlertBadges();
        renderCurrentView();
    });
}

window.submitPackagingRequest = function(itemId) {
    const item = state.inventory.find(i => i.id === itemId);
    if (!item) return;

    const qtyInput = document.getElementById(`qty-card-${itemId}`);
    const qty = parseInt(qtyInput.value);

    if (isNaN(qty) || qty <= 0) {
        showToast('Ingrese una cantidad válida superior a 0.', 'danger');
        return;
    }

    const activeUser = ROLES[state.activeRole];
    const totalCost = qty * item.price;
    const requiresGerencia = (totalCost >= 2000000 || qty >= 1000);
    const folio = `REQ-${Math.floor(100 + Math.random() * 900)}`;

    const newRequest = {
        id: folio,
        area: activeUser.area,
        product: item.name,
        quantity: qty,
        unit: 'Unidades',
        justification: `Sugerido de Envases/Empaques por área de ${activeUser.area}.`,
        requester: activeUser.name,
        requestedAt: new Date().toISOString(),
        status: 'pendiente',
        totalCost: totalCost,
        priceBase: item.price,
        requiresGerencia: requiresGerencia,
        approvalFlow: [
            { role: state.activeRole, action: 'Solicitado', by: activeUser.name, date: new Date().toISOString() }
        ]
    };

    state.requests.unshift(newRequest);
    localStorage.setItem('sigicq_requests', JSON.stringify(state.requests));

    showToast(`Solicitud de Envases ${folio} registrada.`, 'success');
    renderContainersView();
    updateAlertBadges();
};

window.triggerViewChange = function(viewName) {
    const user = ROLES[state.activeRole];
    const userPermissions = user ? (user.permissions || []) : [];
    
    // Proteger vistas según permisos del usuario activo
    if (!userPermissions.includes(viewName)) {
        if (userPermissions.includes('dashboard')) {
            viewName = 'dashboard';
        } else if (userPermissions.length > 0) {
            viewName = userPermissions[0];
        } else {
            viewName = 'dashboard';
        }
    }
    
    state.currentView = viewName;
    const btnNav = document.getElementById(`btn-nav-${viewName}`);
    if (btnNav) {
        document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
        btnNav.classList.add('active');
        document.getElementById('page-title').textContent = btnNav.querySelector('span').textContent;
    }
    renderCurrentView();
};

window.showToast = function(message, type = 'info') {
    let container = document.getElementById('toast-box-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-box-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3500);
};

function updateUserProfileDisplay() {
    const userRole = ROLES[state.activeRole];
    if (!userRole) return;
    
    const label = document.getElementById('current-user-role-label');
    const nameSpan = document.getElementById('current-user-name');
    const avatar = document.getElementById('current-avatar');
    const badge = document.getElementById('role-display-badge');

    if (label) label.textContent = userRole.roleLabel;
    if (nameSpan) nameSpan.textContent = userRole.name;
    if (avatar) avatar.textContent = userRole.name.charAt(0);
    if (badge) badge.textContent = `Área: ${userRole.area}`;

    // Mostrar/ocultar accesos del menú lateral según los permisos dinámicos del usuario
    const userPermissions = userRole.permissions || [];
    document.querySelectorAll('.nav-menu .nav-item').forEach(btn => {
        const view = btn.getAttribute('data-view');
        if (userPermissions.includes(view)) {
            btn.classList.remove('hidden');
        } else {
            btn.classList.add('hidden');
        }
    });
}

function updateThemeIcons() {
    const sunIcon = document.querySelector('.sun-icon');
    const moonIcon = document.querySelector('.moon-icon');
    if (!sunIcon || !moonIcon) return;

    if (state.theme === 'dark') {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
    } else {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
    }
}

// === UTILERÍAS DE MODALES GLOBALES ===
function openModal(title, contentHtml) {
    const modal = document.getElementById('detail-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');
    
    if (modal && modalTitle && modalContent) {
        modalTitle.textContent = title;
        modalContent.innerHTML = contentHtml;
        modal.classList.add('show');
    }
}

function closeModal() {
    const modal = document.getElementById('detail-modal');
    if (modal) {
        modal.classList.remove('show');
    }
}

// === TRADUCCIÓN DE ESTADOS PARA EL USUARIO ===
function getStatusLabel(status) {
    if (!status) return 'Pendiente';
    switch (status) {
        case 'pendiente': return 'Pendiente';
        case 'pendiente_gerencia': return 'Pendiente Gerencia';
        case 'aprobado': return 'Aprobado';
        case 'en_compra': return 'Compra Realizada';
        case 'demorado': return 'Demorado';
        case 'recibido': return 'Recibido';
        case 'rechazado': return 'Rechazado';
        case 'agotado': return 'Agotado';
        default: return status.toString().replace('_', ' ');
    }
}

// === PARSEO SEGURO DE FECHAS EVITANDO CAÍDAS ===
function parseDate(dateStr) {
    if (!dateStr) return new Date();
    const parts = dateStr.split(/[\/\-]/);
    if (parts.length === 3) {
        if (parts[0].length === 4) {
            // YYYY-MM-DD
            return new Date(parts[0], parts[1] - 1, parts[2]);
        }
        if (parts[2].length === 4) {
            // DD/MM/YYYY
            return new Date(parts[2], parts[1] - 1, parts[0]);
        }
    }
    return new Date(dateStr);
}

// === FORMATEO SEGURO DE FECHAS SIN DESFASE HORARIO ===
function formatDate(dateStr) {
    if (!dateStr) return 'No definida';
    
    // Si ya viene en formato DD/MM/YYYY
    const parts = dateStr.split(/[\/\-]/);
    if (parts.length === 3) {
        if (parts[2].length === 4) {
            return `${parts[0].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[2]}`;
        }
        if (parts[0].length === 4) {
            return `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`;
        }
    }
    
    if (dateStr.includes('T')) {
        const datePart = dateStr.split('T')[0];
        const subParts = datePart.split('-');
        if (subParts.length === 3) {
            return `${subParts[2].padStart(2, '0')}/${subParts[1].padStart(2, '0')}/${subParts[0]}`;
        }
    }
    
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
        return dateStr;
    }
    
    const day = String(d.getUTCDate()).padStart(2, '0');
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const year = d.getUTCFullYear();
    return `${day}/${month}/${year}`;
}
