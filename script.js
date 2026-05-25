let cart = JSON.parse(localStorage.getItem('vibe_cart')) || [];
let currentUser = JSON.parse(localStorage.getItem('vibe_user')) || null;

const cartCount = document.getElementById('cart-count');
const cartItemsContainer = document.getElementById('cart-items-container');
const cartTotalValue = document.getElementById('cart-total-value');
const authNavLink = document.getElementById('auth-nav-link');

// Inicializar la tienda
document.addEventListener('DOMContentLoaded', () => {
    updateCartUI();
    updateAuthUI();
    
    // Asignar evento a los botones directos de "Añadir a la cesta" (Catálogo)
    document.querySelectorAll('.btn-add-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.product-card');
            addToCart(
                card.dataset.id, 
                card.dataset.name, 
                parseFloat(card.dataset.price)
            );
            showPage('cart-page');
        });
    });

    // Asignar evento para abrir el modal al dar clic en la imagen
    document.querySelectorAll('.img-container img').forEach(img => {
        img.style.cursor = 'pointer'; 
        img.addEventListener('click', (e) => {
            const card = e.target.closest('.product-card');
            abrirProducto(card);
        });
    });
});

// --- SISTEMA DE PÁGINAS (SPA ROUTING) ---
function showPage(pageId) {
    document.querySelectorAll('.page-section').forEach(sec => {
        sec.classList.add('hidden');
    });
    document.getElementById(pageId).classList.remove('hidden');
    window.scrollTo(0,0);
}

// Eventos de navegación principal
document.getElementById('cart-btn').addEventListener('click', () => showPage('cart-page'));

authNavLink.addEventListener('click', () => {
    if (currentUser) {
        localStorage.removeItem('vibe_user');
        currentUser = null;
        updateAuthUI();
        alert("Has cerrado sesión exitosamente.");
        showPage('home-page');
    } else {
        showPage('auth-page');
    }
});


// --- LÓGICA DE LA CESTA ---
function addToCart(id, name, price) {
    const item = cart.find(i => i.id === id);
    if (item) item.quantity++;
    else cart.push({ id, name, price, quantity: 1 });
    
    localStorage.setItem('vibe_cart', JSON.stringify(cart));
    updateCartUI();
}

function removeCartItem(id) {
    cart = cart.filter(i => i.id !== id);
    localStorage.setItem('vibe_cart', JSON.stringify(cart));
    updateCartUI();
}

function updateCartUI() {
    cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p style="color:#999; padding: 2rem 0; text-transform:none;">Tu cesta está vacía. ¡Descubre la nueva colección!</p>';
        cartTotalValue.textContent = '0.00';
        return;
    }
    
    let total = 0;
    cart.forEach(item => {
        total += item.price * item.quantity;
        cartItemsContainer.innerHTML += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <strong>${item.name}</strong>
                    <p>${item.quantity} pieza(s) x $${item.price} MXN</p>
                    <button class="remove-item" onclick="removeCartItem('${item.id}')">Eliminar artículo</button>
                </div>
                <strong>$${(item.price * item.quantity).toFixed(2)}</strong>
            </div>
        `;
    });
    cartTotalValue.textContent = total.toFixed(2);
}

document.getElementById('btn-checkout').addEventListener('click', () => {
    if (cart.length === 0) {
        alert("Tu cesta está vacía. Añade artículos antes de procesar el pago.");
        return;
    }
    if (!currentUser) {
        alert("Para finalizar tu compra, por favor inicia sesión o crea una cuenta.");
        showPage('auth-page');
        return;
    }
    
    alert(`¡PAGO CONFIRMADO!\n\nGracias por tu compra, ${currentUser.name}. El cargo simulado por $${cartTotalValue.textContent} MXN ha sido procesado.`);
    cart = [];
    localStorage.removeItem('vibe_cart');
    updateCartUI();
    showPage('home-page');
});


// --- LÓGICA DE AUTENTICACIÓN ---
document.getElementById('register-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('reg-email').value;
    let users = JSON.parse(localStorage.getItem('vibe_users')) || [];
    
    if (users.find(u => u.email === email)) {
        alert("Ya existe una cuenta con este correo electrónico.");
        return;
    }
    
    users.push({
        name: document.getElementById('reg-name').value,
        email: email,
        password: document.getElementById('reg-password').value
    });
    localStorage.setItem('vibe_users', JSON.stringify(users));
    
    alert("¡CUENTA CREADA EXITOSAMENTE! Ahora inicia sesión en el panel izquierdo.");
    document.getElementById('register-form').reset();
});

document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem('vibe_users')) || [];
    const user = users.find(u => 
        u.email === document.getElementById('login-email').value && 
        u.password === document.getElementById('login-password').value
    );
    
    if (!user) {
        alert("Correo o contraseña incorrectos. Intenta de nuevo.");
        return;
    }
    
    currentUser = { name: user.name, email: user.email };
    localStorage.setItem('vibe_user', JSON.stringify(currentUser));
    
    alert(`¡Hola ${user.name.split(' ')[0]}! Bienvenido a VIBE.`);
    document.getElementById('login-form').reset();
    updateAuthUI();
    
    if(cart.length > 0) showPage('cart-page');
    else showPage('home-page');
});

function updateAuthUI() {
    if (currentUser) {
        authNavLink.textContent = `CERRAR SESIÓN`;
    } else {
        authNavLink.textContent = "INICIAR SESIÓN";
    }
}

// --- LÓGICA DEL MODAL DE PRODUCTO (MODIFICADA PARA 3 IMÁGENES) ---
let productoModalActual = null; 

function abrirProducto(card) {
    const id = card.dataset.id;
    const name = card.dataset.name;
    const price = parseFloat(card.dataset.price);
    
    // Obtenemos las rutas de las 3 imágenes desde los atributos del HTML
    const img1 = card.dataset.img1;
    const img2 = card.dataset.img2;
    const img3 = card.dataset.img3;

    productoModalActual = { id, name, price };

    document.getElementById('modal-titulo').textContent = name;
    document.getElementById('modal-precio').textContent = `$${price.toFixed(2)} MXN`;
    
    // Ponemos la primera imagen como principal al abrir
    document.getElementById('modal-img-principal').src = img1;

    // Llenamos las miniaturas con las 3 imágenes distintas
    const miniaturasContainer = document.getElementById('modal-miniaturas');
    miniaturasContainer.innerHTML = `
        <img src="${img1}" class="miniatura activa" onclick="cambiarImagen(this)">
        <img src="${img2}" class="miniatura" onclick="cambiarImagen(this)">
        <img src="${img3}" class="miniatura" onclick="cambiarImagen(this)">
    `;

    document.getElementById('modal-producto').style.display = 'block';
}

function cerrarProducto() {
    document.getElementById('modal-producto').style.display = 'none';
}

window.addEventListener('click', function(event) {
    let modal = document.getElementById('modal-producto');
    if (event.target === modal) {
        cerrarProducto();
    }
});

function cambiarImagen(elemento) {
    document.getElementById('modal-img-principal').src = elemento.src;
    let miniaturas = document.querySelectorAll('.miniatura');
    miniaturas.forEach(min => min.classList.remove('activa'));
    elemento.classList.add('activa');
}

document.getElementById('modal-btn-agregar').addEventListener('click', () => {
    if(productoModalActual) {
        addToCart(productoModalActual.id, productoModalActual.name, productoModalActual.price);
        cerrarProducto();
        showPage('cart-page');
    }
});

// --- NUEVO: BUSCADOR GLOBAL FLOTANTE ---
function buscarProductosGlobal(textoBusqueda) {
    let texto = textoBusqueda.toLowerCase().trim();
    let productos = document.querySelectorAll('.product-card');

    productos.forEach(producto => {
        let nombre = producto.dataset.name.toLowerCase();
        // Si el nombre incluye el texto, lo muestra, si no, lo oculta
        if (nombre.includes(texto)) {
            producto.style.display = 'block';
        } else {
            producto.style.display = 'none';
        }
    });
}

// --- NUEVO: FILTROS DE CATEGORÍA ---
function filtrarCategoria(categoria, btnActivo, idSeccion) {
    // Quitar la clase "activo" de todos los botones en esa sección específica
    let contenedorBotones = btnActivo.parentElement;
    let todosLosBotones = contenedorBotones.querySelectorAll('.btn-filtro');
    todosLosBotones.forEach(btn => btn.classList.remove('activo'));
    
    // Agregar clase "activo" al botón presionado
    btnActivo.classList.add('activo');

    // Filtrar los productos solo dentro de esa sección (Hombre o Mujer)
    let seccion = document.getElementById(idSeccion);
    let productos = seccion.querySelectorAll('.product-card');

    productos.forEach(producto => {
        let categoriaProducto = producto.dataset.category;
        if (categoria === 'todo' || categoriaProducto === categoria) {
            producto.style.display = 'block';
        } else {
            producto.style.display = 'none';
        }
    });
}