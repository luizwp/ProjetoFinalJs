// script.js

const API_URL = 'https://fakestoreapi.com/products'; // API para buscar produtos
const CEP_API_URL = 'https://viacep.com.br/ws/';

const productCatalog = document.getElementById('productCatalog');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const checkoutButton = document.getElementById('checkoutButton');
const cartEmptyMessage = document.getElementById('cartEmptyMessage');
const zipcodeInput = document.getElementById('zipcode');
const calculateShippingButton = document.getElementById('calculateShipping');
const shippingCost = document.getElementById('shippingCost');

let cart = [];

// Função para buscar produtos da API
async function fetchProducts() {
    try {
        const response = await fetch(API_URL);
        const products = await response.json();
        renderProductCatalog(products);
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        productCatalog.innerHTML = '<p>Não foi possível carregar os produtos.</p>';
    }
}

// Função para renderizar o catálogo de produtos
function renderProductCatalog(products) {
    productCatalog.innerHTML = '';
    products.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.className = 'product';
        productDiv.innerHTML = `
            <img src="${product.image}" alt="${product.title}">
            <h3>${product.title}</h3>
            <p>Preço: R$ ${product.price.toFixed(2)}</p>
            <button onclick="addToCart(${product.id})">Adicionar ao Carrinho</button>
        `;
        productCatalog.appendChild(productDiv);
    });
}

// Função para adicionar um produto ao carrinho
function addToCart(productId) {
    fetch(`${API_URL}/${productId}`)
        .then(response => response.json())
        .then(product => {
            const cartProduct = cart.find(p => p.id === productId);
            if (cartProduct) {
                cartProduct.quantity += 1;
            } else {
                cart.push({ ...product, quantity: 1 });
            }
            renderCart();
        })
        .catch(error => console.error('Erro ao adicionar ao carrinho:', error));
}

// Função para renderizar o carrinho de compras
function renderCart() {
    cartItems.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        cartEmptyMessage.style.display = 'block';
        checkoutButton.disabled = true;
    } else {
        cartEmptyMessage.style.display = 'none';
        checkoutButton.disabled = false;
        cart.forEach(item => {
            const cartItem = document.createElement('li');
            cartItem.textContent = `${item.title} - R$ ${item.price.toFixed(2)} x ${item.quantity}`;
            cartItems.appendChild(cartItem);
            total += item.price * item.quantity;
        });
        cartTotal.textContent = `Total: R$ ${total.toFixed(2)}`;
    }
}

// Função para calcular o frete usando a API ViaCEP
async function calculateShipping() {
    const cep = zipcodeInput.value.replace(/\D/g, '');
    if (cep.length !== 8) {
        shippingCost.textContent = 'Digite um CEP válido.';
        return;
    }

    try {
        const response = await fetch(`${CEP_API_URL}${cep}/json/`);
        const data = await response.json();
        if (data.erro) {
            shippingCost.textContent = 'CEP não encontrado.';
        } else {
            // Supondo um valor fixo de frete para simplificação
            const shippingFee = 15.00; // Valor fixo de frete
            shippingCost.textContent = `Frete: R$ ${shippingFee.toFixed(2)}`;
        }
    } catch (error) {
        console.error('Erro ao calcular frete:', error);
        shippingCost.textContent = 'Erro ao calcular frete.';
    }
}

// Adiciona o evento de clique no botão de calcular frete
calculateShippingButton.addEventListener('click', calculateShipping);

// Função para finalizar a compra
checkoutButton.addEventListener('click', () => {
    if (cart.length === 0) {
        alert('Seu carrinho está vazio.');
        return;
    }

    const confirmMessage = `Você tem certeza que deseja finalizar a compra?\n\nTotal do Carrinho: R$ ${cartTotal.textContent.split('R$ ')[1]}`;
    if (confirm(confirmMessage)) {
        alert('Compra finalizada com sucesso!');
        cart = [];
        renderCart();
    }
});


// Inicializa o catálogo de produtos ao carregar a página
fetchProducts();

