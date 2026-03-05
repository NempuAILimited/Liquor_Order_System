// ============================
// Liquor Order System - Frontend
// ============================

const API_BASE = '';  // same origin

// App state
let allItems = [];
let cart = [];
let currentStep = 1;
let selectedItem = null;
let currentOrderId = null;
let lastPdfHtml = null;
let lastOrderNumber = null;

// ============================
// PDF Generation Helper (iframe-based)
// ============================
async function generatePdfFromHtml(html, filename) {
  // Create a hidden iframe — gives us a clean, isolated document
  // where <style> tags in <head> work properly for html2canvas
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.left = '0';
  iframe.style.top = '0';
  iframe.style.width = '794px';
  iframe.style.height = '1123px'; // A4 proportions
  iframe.style.border = 'none';
  iframe.style.opacity = '0.01';
  iframe.style.zIndex = '-9999';
  iframe.style.pointerEvents = 'none';
  document.body.appendChild(iframe);

  // Write the full HTML document into the iframe
  const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
  iframeDoc.open();
  iframeDoc.write(html);
  iframeDoc.close();

  // Wait for iframe content to fully render
  await new Promise(resolve => {
    iframe.onload = resolve;
    // Fallback timeout in case onload already fired
    setTimeout(resolve, 800);
  });

  // Extra delay for style computation and layout
  await new Promise(resolve => setTimeout(resolve, 300));

  try {
    // Capture the iframe body with html2canvas
    const canvas = await html2canvas(iframeDoc.body, {
      scale: 2,
      useCORS: true,
      scrollX: 0,
      scrollY: 0,
      width: 794,
      windowWidth: 794,
      logging: false,
    });

    // Convert canvas to PDF using jsPDF
    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    const pdf = new jspdf.jsPDF({
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth - 20; // 10mm margins
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 10; // top margin

    // First page
    pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);
    heightLeft -= (pdfHeight - 20);

    // Additional pages if content overflows
    while (heightLeft > 0) {
      position = -(pdfHeight - 20) + 10;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 10, position - (imgHeight - heightLeft - (pdfHeight - 20)), imgWidth, imgHeight);
      heightLeft -= (pdfHeight - 20);
    }

    pdf.save(filename);
  } finally {
    document.body.removeChild(iframe);
  }
}

// ============================
// Initialization
// ============================
document.addEventListener('DOMContentLoaded', async () => {
  await loadBarProfile();
  await loadItems();
  await loadCategories();

  // Set up search debounce
  const searchInput = document.getElementById('searchInput');
  let searchTimeout;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => filterItems(), 300);
  });

  document.getElementById('categoryFilter').addEventListener('change', filterItems);
});

// ============================
// Data Loading
// ============================
async function loadBarProfile() {
  try {
    const res = await fetch(`${API_BASE}/api/orders/profile/bar`);
    const data = await res.json();
    if (data.success) {
      document.getElementById('barName').textContent = data.data.barName;
      document.getElementById('licenseNo').textContent = `License: ${data.data.barLicenseNumber}`;
    }
  } catch (err) {
    console.error('Failed to load bar profile:', err);
  }
}

async function loadItems() {
  try {
    const res = await fetch(`${API_BASE}/api/liquor`);
    const data = await res.json();
    if (data.success) {
      allItems = data.data;
      renderItems(allItems);
    }
  } catch (err) {
    console.error('Failed to load items:', err);
  }
}

async function loadCategories() {
  try {
    const res = await fetch(`${API_BASE}/api/liquor/categories`);
    const data = await res.json();
    if (data.success) {
      const select = document.getElementById('categoryFilter');
      data.data.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.value;
        option.textContent = cat.label;
        select.appendChild(option);
      });
    }
  } catch (err) {
    console.error('Failed to load categories:', err);
  }
}

// ============================
// Rendering
// ============================
function renderItems(items) {
  const grid = document.getElementById('itemsGrid');
  
  if (items.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #94a3b8;">
        <p style="font-size: 40px; margin-bottom: 10px;">🔍</p>
        <p style="font-size: 16px;">No items found. Try a different search or category.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = items.map(item => {
    const inCart = cart.some(c => c.itemId === item.id);
    const tagClass = getCategoryTagClass(item.category);
    const categoryLabel = getCategoryLabel(item.category);

    return `
      <div class="item-card ${inCart ? 'in-cart' : ''}" onclick="openItemModal('${item.id}')">
        <span class="item-category-tag ${tagClass}">${categoryLabel}</span>
        <div class="item-name">${item.name}</div>
        <div class="item-brand">${item.brand}</div>
        <div class="item-details">
          <div class="item-price">₹${item.pricePerUnit.toLocaleString('en-IN')} <small>/bottle</small></div>
          <div class="item-size">${item.size}</div>
        </div>
        <div class="item-excise">Excise: ₹${item.exciseDuty}/bottle</div>
      </div>
    `;
  }).join('');
}

function getCategoryTagClass(category) {
  const map = {
    IMFL_WHISKY: 'tag-whisky',
    IMFL_RUM: 'tag-rum',
    IMFL_VODKA: 'tag-vodka',
    IMFL_GIN: 'tag-gin',
    IMFL_BRANDY: 'tag-brandy',
    BEER: 'tag-beer',
    WINE: 'tag-wine',
    COUNTRY_LIQUOR: 'tag-country',
  };
  return map[category] || '';
}

function getCategoryLabel(category) {
  const labels = {
    IMFL_WHISKY: 'Whisky',
    IMFL_RUM: 'Rum',
    IMFL_VODKA: 'Vodka',
    IMFL_GIN: 'Gin',
    IMFL_BRANDY: 'Brandy',
    BEER: 'Beer',
    WINE: 'Wine',
    COUNTRY_LIQUOR: 'Country Liquor',
  };
  return labels[category] || category;
}

// ============================
// Filtering
// ============================
function filterItems() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  const category = document.getElementById('categoryFilter').value;

  let filtered = allItems;

  if (search) {
    filtered = filtered.filter(item =>
      item.name.toLowerCase().includes(search) ||
      item.brand.toLowerCase().includes(search)
    );
  }

  if (category) {
    filtered = filtered.filter(item => item.category === category);
  }

  renderItems(filtered);
}

// ============================
// Modal (Item Selection)
// ============================
function openItemModal(itemId) {
  selectedItem = allItems.find(i => i.id === itemId);
  if (!selectedItem) return;

  document.getElementById('modalItemName').textContent = selectedItem.name;
  document.getElementById('modalBrand').textContent = selectedItem.brand;
  document.getElementById('modalCategory').textContent = getCategoryLabel(selectedItem.category);
  document.getElementById('modalPrice').textContent = `₹ ${selectedItem.pricePerUnit.toLocaleString('en-IN')}`;
  document.getElementById('modalExcise').textContent = `₹ ${selectedItem.exciseDuty.toLocaleString('en-IN')}`;

  // Populate sizes
  const sizeSelect = document.getElementById('modalSize');
  sizeSelect.innerHTML = selectedItem.availableSizes.map(size =>
    `<option value="${size}" ${size === selectedItem.size ? 'selected' : ''}>${size}</option>`
  ).join('');

  // Reset quantity
  document.getElementById('modalQuantity').value = 1;
  document.getElementById('modalUnitsPerCase').value = '12';

  updateModalTotal();

  document.getElementById('quantityModal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('quantityModal').classList.add('hidden');
  selectedItem = null;
}

function adjustQty(delta) {
  const input = document.getElementById('modalQuantity');
  let val = parseInt(input.value) || 1;
  val = Math.max(1, Math.min(999, val + delta));
  input.value = val;
  updateModalTotal();
}

function updateModalSize() {
  // Could update price based on size in future
  updateModalTotal();
}

function updateModalTotal() {
  if (!selectedItem) return;

  const quantity = parseInt(document.getElementById('modalQuantity').value) || 1;
  const unitsPerCase = parseInt(document.getElementById('modalUnitsPerCase').value) || 12;
  const totalBottles = quantity * unitsPerCase;
  const totalAmount = totalBottles * selectedItem.pricePerUnit;
  const totalExcise = totalBottles * selectedItem.exciseDuty;
  const lineTotal = totalAmount + totalExcise;

  document.getElementById('modalTotalBottles').textContent = totalBottles.toLocaleString('en-IN');
  document.getElementById('modalTotalAmount').textContent = `₹ ${totalAmount.toLocaleString('en-IN')}`;
  document.getElementById('modalTotalExcise').textContent = `₹ ${totalExcise.toLocaleString('en-IN')}`;
  document.getElementById('modalLineTotal').textContent = `₹ ${lineTotal.toLocaleString('en-IN')}`;
}

// ============================
// Cart Management
// ============================
function addToCart() {
  if (!selectedItem) return;

  const quantity = parseInt(document.getElementById('modalQuantity').value) || 1;
  const unitsPerCase = parseInt(document.getElementById('modalUnitsPerCase').value) || 12;

  // Check if already in cart — update quantity
  const existingIndex = cart.findIndex(c => c.itemId === selectedItem.id);
  if (existingIndex >= 0) {
    cart[existingIndex].quantity += quantity;
    cart[existingIndex].unitsPerCase = unitsPerCase;
  } else {
    cart.push({
      itemId: selectedItem.id,
      item: selectedItem,
      quantity,
      unitsPerCase,
    });
  }

  closeModal();
  updateCartUI();
  renderItems(getFilteredItems());
}

function removeFromCart(index) {
  cart.splice(index, 1);
  updateCartUI();
  renderCartTable();

  if (cart.length === 0 && currentStep === 2) {
    goToStep(1);
  }
}

function clearCart() {
  if (!confirm('Are you sure you want to clear all items from your cart?')) return;
  cart = [];
  updateCartUI();
  goToStep(1);
}

function updateCartUI() {
  const fab = document.getElementById('cartFab');
  const count = document.getElementById('cartCount');
  const total = document.getElementById('cartFabTotal');

  if (cart.length === 0) {
    fab.classList.add('hidden');
  } else {
    fab.classList.remove('hidden');
    count.textContent = cart.length;

    const grandTotal = cart.reduce((sum, c) => {
      const bottles = c.quantity * c.unitsPerCase;
      return sum + (bottles * c.item.pricePerUnit) + (bottles * c.item.exciseDuty);
    }, 0);

    total.textContent = `₹ ${grandTotal.toLocaleString('en-IN')}`;
  }
}

function getFilteredItems() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  const category = document.getElementById('categoryFilter').value;

  let filtered = allItems;
  if (search) {
    filtered = filtered.filter(item =>
      item.name.toLowerCase().includes(search) ||
      item.brand.toLowerCase().includes(search)
    );
  }
  if (category) {
    filtered = filtered.filter(item => item.category === category);
  }
  return filtered;
}

// ============================
// Cart Table Rendering
// ============================
function renderCartTable() {
  const tbody = document.getElementById('cartTableBody');
  
  if (cart.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="11" style="padding: 40px; color: #94a3b8; font-size: 16px;">
          Your cart is empty. Go back and add items.
        </td>
      </tr>
    `;
    updateCartSummary();
    return;
  }

  tbody.innerHTML = cart.map((c, index) => {
    const bottles = c.quantity * c.unitsPerCase;
    const amount = bottles * c.item.pricePerUnit;
    const excise = bottles * c.item.exciseDuty;

    return `
      <tr>
        <td>${index + 1}</td>
        <td class="item-name-cell">${c.item.name}</td>
        <td>${c.item.brand}</td>
        <td>${c.item.size}</td>
        <td>${c.quantity}</td>
        <td>${c.unitsPerCase}</td>
        <td>${bottles}</td>
        <td class="amount-cell">₹${c.item.pricePerUnit.toLocaleString('en-IN')}</td>
        <td class="amount-cell">₹${amount.toLocaleString('en-IN')}</td>
        <td class="amount-cell">₹${excise.toLocaleString('en-IN')}</td>
        <td>
          <button class="remove-btn" onclick="removeFromCart(${index})">✕ Remove</button>
        </td>
      </tr>
    `;
  }).join('');

  updateCartSummary();
}

function updateCartSummary() {
  let subtotal = 0;
  let totalExcise = 0;

  cart.forEach(c => {
    const bottles = c.quantity * c.unitsPerCase;
    subtotal += bottles * c.item.pricePerUnit;
    totalExcise += bottles * c.item.exciseDuty;
  });

  const grandTotal = subtotal + totalExcise;

  document.getElementById('cartSubtotal').textContent = `₹ ${subtotal.toLocaleString('en-IN')}`;
  document.getElementById('cartExcise').textContent = `₹ ${totalExcise.toLocaleString('en-IN')}`;
  document.getElementById('cartGrandTotal').textContent = `₹ ${grandTotal.toLocaleString('en-IN')}`;
}

// ============================
// Step Navigation
// ============================
function goToStep(step) {
  // Hide all steps
  document.getElementById('step1').classList.add('hidden');
  document.getElementById('step2').classList.add('hidden');
  document.getElementById('step3').classList.add('hidden');

  // Show target step
  document.getElementById(`step${step}`).classList.remove('hidden');

  // Update step indicators
  document.querySelectorAll('.step').forEach(el => {
    const s = parseInt(el.dataset.step);
    el.classList.remove('active', 'completed');
    if (s === step) el.classList.add('active');
    else if (s < step) el.classList.add('completed');
  });

  currentStep = step;

  if (step === 2) {
    renderCartTable();
  }

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================
// Order Submission
// ============================
async function submitOrder() {
  if (cart.length === 0) {
    alert('Your cart is empty!');
    return;
  }

  // Show loading
  document.getElementById('loadingOverlay').classList.remove('hidden');

  try {
    // 1. Create the order
    const orderPayload = {
      items: cart.map(c => ({
        itemId: c.itemId,
        quantity: c.quantity,
        unitsPerCase: c.unitsPerCase,
      })),
    };

    const orderRes = await fetch(`${API_BASE}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload),
    });

    const orderData = await orderRes.json();

    if (!orderData.success) {
      throw new Error(orderData.message);
    }

    const orderId = orderData.data.id;
    currentOrderId = orderId;

    // 2. Generate PDF HTML from server
    const pdfRes = await fetch(`${API_BASE}/api/pdf/generate/${orderId}`, {
      method: 'POST',
    });

    const pdfData = await pdfRes.json();

    if (!pdfData.success) {
      throw new Error(pdfData.message);
    }

    // 3. Generate PDF client-side using html2pdf.js
    const pdfHtml = pdfData.data.html;
    const orderNumber = orderData.data.orderNumber;

    await generatePdfFromHtml(pdfHtml, `${orderNumber.replace(/\//g, '-')}.pdf`);

    // Store for re-download
    lastPdfHtml = pdfHtml;
    lastOrderNumber = orderNumber;

    // 4. Update UI - Show success
    document.getElementById('generatedOrderNumber').textContent = orderNumber;

    // Clear cart
    cart = [];
    updateCartUI();

    // Load order history
    await loadOrderHistory();

    // Go to Step 3
    goToStep(3);

  } catch (err) {
    console.error('Order submission failed:', err);
    alert(`Failed to submit order: ${err.message}`);
  } finally {
    document.getElementById('loadingOverlay').classList.add('hidden');
  }
}

// ============================
// Order History
// ============================
async function loadOrderHistory() {
  try {
    const res = await fetch(`${API_BASE}/api/orders`);
    const data = await res.json();

    if (data.success && data.data.length > 0) {
      const list = document.getElementById('orderHistoryList');
      list.innerHTML = data.data.slice(0, 10).map(order => `
        <div class="order-history-item">
          <div class="order-info">
            <strong>${order.orderNumber}</strong><br>
            ${order.orderDate} | ${order.items.length} items | ₹${order.grandTotal.toLocaleString('en-IN')}
          </div>
          <div>
            <span class="order-status ${order.status === 'PDF_GENERATED' ? 'status-pdf' : 'status-draft'}">
              ${order.status === 'PDF_GENERATED' ? '📄 PDF Generated' : '📝 Draft'}
            </span>
          </div>
        </div>
      `).join('');
    }
  } catch (err) {
    console.error('Failed to load order history:', err);
  }
}

// ============================
// New Order
// ============================
function startNewOrder() {
  cart = [];
  currentOrderId = null;
  lastPdfHtml = null;
  lastOrderNumber = null;
  updateCartUI();
  goToStep(1);
}

// ============================
// Re-download PDF
// ============================
async function redownloadPdf() {
  if (!lastPdfHtml || !lastOrderNumber) {
    alert('No PDF available. Please create a new order.');
    return;
  }

  await generatePdfFromHtml(lastPdfHtml, `${lastOrderNumber.replace(/\//g, '-')}.pdf`);
}
