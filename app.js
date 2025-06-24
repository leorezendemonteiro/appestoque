        import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
        import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
        import { getFirestore, collection, doc, onSnapshot, addDoc, deleteDoc, query, updateDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

        const firebaseConfig = {
            apiKey: "AIzaSyBJbyfICQFEfzL7EKbaH-08mQmZWOM8FhU",
            authDomain: "appestoquecozinha.firebaseapp.com",
            projectId: "appestoquecozinha",
            storageBucket: "appestoquecozinha.firebasestorage.app",
            messagingSenderId: "705934517110",
            appId: "1:705934517110:web:b4d5b79059feb7e6485057"
        };

        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getFirestore(app);
        
        let appState = { 
            stockItems: [], 
            productionItems: [], 
            suppliers: [], 
            currentSupplierFilter: 'TODOS', 
            currentSectorFilter: 'TODOS', 
            unsubscribeStock: null, 
            unsubscribeProduction: null, 
            unsubscribeSuppliers: null,
            shoppingListItems: []
        };

        const loginView = document.getElementById("login-view");
        const signupView = document.getElementById("signup-view");
        const mainAppView = document.getElementById("main-app-view");
        const tabsContainer = document.getElementById("tabs-container");
        const tabContents = document.querySelectorAll(".tab-content");
        const loginForm = document.getElementById("login-form");
        const signupForm = document.getElementById("signup-form");
        const addItemForm = document.getElementById("add-item-form");
        const addProductionForm = document.getElementById("add-production-form");
        const showSignupBtn = document.getElementById("show-signup-btn");
        const showLoginBtn = document.getElementById("show-login-btn");
        const logoutBtn = document.getElementById("logout-btn");
        const messageContainer = document.getElementById("message-container");
        const generateStockReportBtn = document.getElementById("generate-stock-report-btn");
        const generateShoppingListBtn = document.getElementById("generate-shopping-list-btn");
        const generateKitchenReportBtn = document.getElementById("generate-kitchen-report-btn");
        const generateParrillaReportBtn = document.getElementById("generate-parrilla-report-btn");
        const stockListDiv = document.getElementById("stock-list");
        const productionListDiv = document.getElementById("production-list");
        const supplierFilter = document.getElementById("supplier-filter");
        const sectorFilter = document.getElementById("sector-filter");
        const newSupplierNameInput = document.getElementById("new-supplier-name");
        const addSupplierBtn = document.getElementById("add-supplier-btn");
        const suppliersListDiv = document.getElementById("suppliers-list");
        const reportDisplayArea = document.getElementById("report-display-area");

        // Helper Functions
        function showMessage(msg, isError = false) {
            const msgDiv = document.createElement("div");
            msgDiv.textContent = msg;
            msgDiv.className = `p-3 rounded-lg shadow-md mb-2 ${isError ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`;
            messageContainer.prepend(msgDiv);
            setTimeout(() => msgDiv.remove(), 5000);
        }

        function toggleViews(activeViewId) {
            const views = [loginView, signupView, mainAppView];
            views.forEach(view => {
                if (view.id === activeViewId) {
                    view.classList.remove("hidden");
                } else {
                    view.classList.add("hidden");
                }
            });
        }

        function switchTab(tabName) {
            tabContents.forEach(tabContent => {
                if (tabContent.id === `tab-${tabName}`) {
                    tabContent.classList.add("active");
                } else {
                    tabContent.classList.remove("active");
                }
            });
            document.querySelectorAll(".tab-button").forEach(button => {
                if (button.dataset.tab === tabName) {
                    button.classList.add("active");
                } else {
                    button.classList.remove("active");
                }
            });
        }

        function escapeHtml(unsafe) {
            return unsafe
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }

        // Render Functions
        function renderStockList() {
            stockListDiv.innerHTML = "";
            const filteredItems = appState.stockItems.filter(item => 
                appState.currentSupplierFilter === 'TODOS' || item.fornecedor === appState.currentSupplierFilter
            );
            if (filteredItems.length === 0) {
                stockListDiv.innerHTML = "<p class=\"text-gray-500\">Nenhum item no estoque para este fornecedor.</p>";
                return;
            }
            filteredItems.forEach(item => {
                const itemDiv = document.createElement("div");
                itemDiv.className = "bg-gray-50 p-3 rounded-lg shadow-sm flex items-center justify-between";
                itemDiv.innerHTML = `
                    <div>
                        <p class="font-semibold text-gray-800">${escapeHtml(item.item || '')}</p>
                        <p class="text-sm text-gray-600">Fornecedor: ${escapeHtml(item.fornecedor || '')}</p>
                        <p class="text-sm text-gray-600">Atual: ${item.atual} ${escapeHtml(item.unidade || '')}</p>
                        <p class="text-sm text-gray-600">Mínima: ${item.minimo} ${escapeHtml(item.unidade || '')}</p>
                        <p class="text-sm text-gray-600">Ideal: ${item.ideal} ${escapeHtml(item.unidade || '')}</p>
                    </div>
                    <div class="flex items-center space-x-2">
                        <input type="number" data-item-id="${item.id}" data-update-type="stock" value="${item.atual}" step="any" class="w-24 p-1 border rounded text-center text-sm">
                        <button onclick="updateStockItem('${item.id}')" class="bg-blue-500 hover:bg-blue-700 text-white text-xs font-bold py-1 px-2 rounded">Atualizar</button>
                        <button onclick="deleteStockItem('${item.id}')" class="bg-red-500 hover:bg-red-700 text-white text-xs font-bold py-1 px-2 rounded">Excluir</button>
                    </div>
                `;
                stockListDiv.appendChild(itemDiv);
            });
        }

        function renderProductionList() {
            productionListDiv.innerHTML = "";
            const filteredItems = appState.productionItems.filter(item => 
                appState.currentSectorFilter === 'TODOS' || item.setor === appState.currentSectorFilter
            );
            if (filteredItems.length === 0) {
                productionListDiv.innerHTML = "<p class=\"text-gray-500\">Nenhum item na produção para este setor.</p>";
                return;
            }
            filteredItems.forEach(item => {
                const itemDiv = document.createElement("div");
                itemDiv.className = "bg-gray-50 p-3 rounded-lg shadow-sm flex items-center justify-between";
                itemDiv.innerHTML = `
                    <div>
                        <p class="font-semibold text-gray-800">${escapeHtml(item.item || '')}</p>
                        <p class="text-sm text-gray-600">Setor: ${escapeHtml(item.setor || '')}</p>
                        <p class="text-sm text-gray-600">Quantidade: ${item.quantidade} ${escapeHtml(item.unidade || '')}</p>
                    </div>
                    <div class="flex items-center space-x-2">
                        <input type="number" data-item-id="${item.id}" data-update-type="production" value="${item.quantidade}" step="any" class="w-24 p-1 border rounded text-center text-sm">
                        <button onclick="updateProductionItem('${item.id}')" class="bg-blue-500 hover:bg-blue-700 text-white text-xs font-bold py-1 px-2 rounded">Atualizar</button>
                        <button onclick="deleteProductionItem('${item.id}')" class="bg-red-500 hover:bg-red-700 text-white text-xs font-bold py-1 px-2 rounded">Excluir</button>
                    </div>
                `;
                productionListDiv.appendChild(itemDiv);
            });
        }

        function renderSuppliersList() {
            suppliersListDiv.innerHTML = "";
            if (appState.suppliers.length === 0) {
                suppliersListDiv.innerHTML = "<p class=\"text-gray-500\">Nenhum fornecedor cadastrado.</p>";
                return;
            }
            appState.suppliers.forEach(supplier => {
                const supplierDiv = document.createElement("div");
                supplierDiv.className = "bg-gray-50 p-2 rounded-lg shadow-sm flex items-center justify-between";
                supplierDiv.innerHTML = `
                    <p class="font-semibold text-gray-800">${escapeHtml(supplier.nome)}</p>
                    <button onclick="deleteSupplier('${supplier.id}')" class="bg-red-500 hover:bg-red-700 text-white text-xs font-bold py-1 px-2 rounded">Excluir</button>
                `;
                suppliersListDiv.appendChild(supplierDiv);
            });
        }

        function updateSupplierFilter() {
            supplierFilter.innerHTML = `<option value="TODOS">TODOS</option>`;
            appState.suppliers.forEach(supplier => {
                const option = document.createElement("option");
                option.value = supplier.nome;
                option.textContent = supplier.nome;
                supplierFilter.appendChild(option);
            });
        }

        function renderSupplierSelect() {
            const productSupplierSelect = document.getElementById('product-supplier');
            if (!productSupplierSelect) return;
            
            const sortedSuppliers = [...appState.suppliers].sort((a, b) => (a.nome || '').localeCompare(b.nome || ''));
            
            productSupplierSelect.innerHTML = `
                <option value="">Selecione um fornecedor</option>
                ${sortedSuppliers.map(supplier => `<option value="${escapeHtml(supplier.nome)}">${escapeHtml(supplier.nome)}</option>`).join('')}
            `;
        }

        // Função para escutar mudanças nos dados do Firebase
        function listenToDataChanges() {
            const stockCollectionRef = collection(db, "estoque");
            appState.unsubscribeStock = onSnapshot(stockCollectionRef, (snapshot) => {
                appState.stockItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                updateSupplierFilter();
                renderStockList();
            }, (error) => console.error("Erro ao carregar estoque:", error));

            const productionCollectionRef = collection(db, "producao");
            appState.unsubscribeProduction = onSnapshot(productionCollectionRef, (snapshot) => {
                appState.productionItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                renderProductionList();
            }, (error) => console.error("Erro ao carregar produção:", error));

            const suppliersCollectionRef = collection(db, "fornecedores");
            appState.unsubscribeSuppliers = onSnapshot(suppliersCollectionRef, (snapshot) => {
                appState.suppliers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                renderSuppliersList();
                renderSupplierSelect(); // Garante que o select de fornecedores seja atualizado
            }, (error) => console.error("Erro ao carregar fornecedores:", error));
        }

        // PDF Generation Functions
        function generateStockReportBySupplier() {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            const supplierGroups = {};
            appState.stockItems.forEach(item => {
                const supplier = item.fornecedor;
                if (!supplierGroups[supplier]) {
                    supplierGroups[supplier] = [];
                }
                supplierGroups[supplier].push(item);
            });

            const sortedSuppliers = Object.keys(supplierGroups).sort();

            sortedSuppliers.forEach((supplier, supplierIndex) => {
                if (supplierIndex > 0) {
                    doc.addPage();
                }

                doc.setFontSize(18);
                doc.setFont(undefined, "bold");
                doc.text("Relatório de Estoque", 20, 20);

                doc.setFontSize(14);
                doc.text(`Fornecedor: ${supplier}`, 20, 35);

                doc.setFontSize(12);
                doc.setFont(undefined, "normal");
                doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 20, 45);
                doc.text(`Hora: ${new Date().toLocaleTimeString('pt-BR')}`, 20, 55);

                let yPosition = 75;
                doc.setFontSize(10);
                doc.setFont(undefined, "bold");
                doc.text("Produto", 20, yPosition);
                doc.text("Qtd. Atual", 100, yPosition);

                doc.line(20, yPosition + 2, 190, yPosition + 2);
                yPosition += 10;

                doc.setFont(undefined, "normal");
                const items = supplierGroups[supplier].sort((a, b) => a.item.localeCompare(b.item));
                items.forEach(item => {
                    if (yPosition > 270) {
                        doc.addPage();
                        yPosition = 20;
                        doc.setFontSize(10);
                        doc.setFont(undefined, "bold");
                        doc.text("Produto", 20, yPosition);
                        doc.text("Qtd. Atual", 100, yPosition);
                        doc.line(20, yPosition + 2, 190, yPosition + 2);
                        yPosition += 10;
                        doc.setFont(undefined, "normal");
                    }
                    doc.text(item.item.substring(0, 30), 20, yPosition);
                    doc.text(`${item.atual} ${item.unidade}`, 100, yPosition);
                    yPosition += 8;
                });

                yPosition += 10;
                if (yPosition > 260) {
                    doc.addPage();
                    yPosition = 20;
                }
                doc.setFont(undefined, "bold");
                doc.text(`Total de Itens: ${items.length}`, 20, yPosition);
            });

            doc.save("relatorio-estoque.pdf");
            showMessage("Relatório de estoque gerado com sucesso!");
        }

        function generateProductionReport(sector) {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            doc.setFontSize(18);
            doc.setFont(undefined, "bold");
            doc.text(`Relatório de Produção - ${sector}`, 20, 20);
            doc.setFontSize(10);
            doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 20, 30);
            
            let yPosition = 50;
            const filteredItems = appState.productionItems.filter(item => item.setor === sector).sort((a, b) => a.item.localeCompare(b.item));

            if (filteredItems.length === 0) {
                doc.setFontSize(12);
                doc.text(`Nenhum item encontrado para o setor ${sector}.`, 20, yPosition);
            } else {
                doc.setFontSize(12);
                doc.text(`Total de itens: ${filteredItems.length}`, 20, yPosition);
                yPosition += 20;
                
                filteredItems.forEach((item, index) => {
                    if (yPosition > 270) {
                        doc.addPage();
                        yPosition = 20;
                    }
                    
                    const itemName = item.item || item.name || 'Item sem nome';
                    const sectorName = item.setor || item.sector || '';
                    const quantity = parseFloat(item.quantidade || item.quantity || 0);
                    const unit = item.unidade || item.unit || '';
                    
                    doc.setFontSize(12);
                    doc.text(`${index + 1}. ${itemName}`, 20, yPosition);
                    doc.setFontSize(10);
                    doc.text(`Setor: ${sectorName}`, 25, yPosition + 8);
                    doc.text(`Quantidade: ${quantity.toFixed(2)} ${unit}`, 25, yPosition + 16);
                    
                    yPosition += 35;
                });
            }
            
            doc.save(`relatorio-producao-${sector.toLowerCase()}.pdf`);
            showMessage(`Relatório de produção ${sector} gerado com sucesso!`);
        }

        function generateShoppingList() {
            reportDisplayArea.classList.remove('hidden');
            reportDisplayArea.classList.add('interactive-list');
            reportDisplayArea.innerHTML = `
                <div class="p-6">
                    <h2 class="text-lg font-semibold mb-4 text-gray-700">Lista de Compras</h2>
                    <p class="text-sm text-gray-500 mb-4">Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
                    <div class="mb-4">
                        <label for="shopping-list-supplier-filter" class="block text-gray-700 text-sm font-bold mb-2">Filtrar por fornecedor:</label>
                        <select id="shopping-list-supplier-filter" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 bg-white">
                            <option value="TODOS">Todos os fornecedores</option>
                            ${appState.suppliers.map(supplier => `<option value="${escapeHtml(supplier.nome)}">${escapeHtml(supplier.nome)}</option>`).join('')}
                        </select>
                    </div>
                    <button id="generate-shopping-list-pdf-btn" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4">Gerar Lista de Compras PDF</button>
                    <div id="shopping-list-items-container" class="space-y-3"></div>
                </div>
            `;

            const shoppingListSupplierFilter = document.getElementById('shopping-list-supplier-filter');
            const shoppingListItemsContainer = document.getElementById('shopping-list-items-container');
            const generateShoppingListPdfBtn = document.getElementById('generate-shopping-list-pdf-btn');

            const renderShoppingListItems = () => {
                shoppingListItemsContainer.innerHTML = '';
                const selectedSupplier = shoppingListSupplierFilter.value;
                
                const filteredItems = appState.stockItems.filter(item => 
                    selectedSupplier === 'TODOS' || item.fornecedor === selectedSupplier
                ).sort((a, b) => a.item.localeCompare(b.item));

                if (filteredItems.length === 0) {
                    shoppingListItemsContainer.innerHTML = "<p class=\"text-gray-500\">Nenhum item no estoque para este fornecedor.</p>";
                    return;
                }

                // Agrupar por fornecedor para exibição
                const groupedBySupplier = {};
                filteredItems.forEach(item => {
                    if (!groupedBySupplier[item.fornecedor]) {
                        groupedBySupplier[item.fornecedor] = [];
                    }
                    groupedBySupplier[item.fornecedor].push(item);
                });

                Object.keys(groupedBySupplier).sort().forEach(supplier => {
                    const supplierHeader = document.createElement('h3');
                    supplierHeader.className = 'text-md font-medium text-gray-700 mt-4 mb-2';
                    supplierHeader.textContent = `Fornecedor: ${supplier}`;
                    shoppingListItemsContainer.appendChild(supplierHeader);

                    groupedBySupplier[supplier].forEach(item => {
                        const itemDiv = document.createElement('div');
                        itemDiv.className = 'flex items-center justify-between bg-gray-50 p-2 rounded-lg shadow-sm shopping-list-item';
                        itemDiv.dataset.supplier = item.fornecedor;
                        itemDiv.dataset.itemName = item.item;
                        itemDiv.dataset.currentQty = item.atual;
                        itemDiv.dataset.itemUnit = item.unidade;
                        itemDiv.innerHTML = `
                            <p class="font-semibold text-gray-800 w-1/3">${escapeHtml(item.item || '')}</p>
                            <p class="text-sm text-gray-600 w-1/4">${item.atual} ${escapeHtml(item.unidade || '')}</p>
                            <input type="number" class="w-1/4 p-1 border rounded text-center text-sm shopping-quantity-input" value="0" step="any" oninput="if(this.value == '') this.value = '0';">
                            <button onclick="this.closest('.shopping-list-item').remove()" class="bg-red-500 hover:bg-red-700 text-white text-xs font-bold py-1 px-2 rounded">Excluir</button>
                        `;
                        shoppingListItemsContainer.appendChild(itemDiv);
                    });
                });
            };

            shoppingListSupplierFilter.addEventListener('change', renderShoppingListItems);
            generateShoppingListPdfBtn.addEventListener('click', generateShoppingListPDF);
            renderShoppingListItems(); // Initial render
        }

        function generateShoppingListPDF() {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            const selectedSupplier = reportDisplayArea.querySelector("#shopping-list-supplier-filter").value;
            const visibleItems = Array.from(reportDisplayArea.querySelectorAll(".shopping-list-item"))
                .filter(item => {
                    const itemSupplier = item.dataset.supplier;
                    const quantityInput = item.querySelector(".shopping-quantity-input");
                    const quantity = parseFloat(quantityInput.value) || 0;
                    
                    // Incluir apenas itens visíveis (filtro) e com quantidade > 0
                    const isVisible = selectedSupplier === "TODOS" || itemSupplier === selectedSupplier;
                    return isVisible && quantity > 0;
                });

            if (visibleItems.length === 0) {
                showMessage("Nenhum item com quantidade pedida encontrado!", true);
                return;
            }

            // Agrupar itens por fornecedor
            const supplierGroups = {};
            visibleItems.forEach(item => {
                const supplier = item.dataset.supplier;
                if (!supplierGroups[supplier]) {
                    supplierGroups[supplier] = [];
                }
                
                const itemName = item.dataset.itemName;
                const currentQty = parseFloat(item.dataset.currentQty);
                const requestedQty = parseFloat(item.querySelector(".shopping-quantity-input").value) || 0;
                const unit = item.dataset.itemUnit;
                
                supplierGroups[supplier].push({
                    name: itemName,
                    currentQty: currentQty,
                    requestedQty: requestedQty,
                    unit: unit
                });
            });

            const sortedSuppliers = Object.keys(supplierGroups).sort();
            
            sortedSuppliers.forEach((supplier, supplierIndex) => {
                if (supplierIndex > 0) {
                    doc.addPage();
                }
                
                const items = supplierGroups[supplier].sort((a, b) => a.name.localeCompare(b.name));
                
                // Cabeçalho da página
                doc.setFontSize(18);
                doc.setFont(undefined, "bold");
                doc.text("Lista de Compras", 20, 20);
                
                doc.setFontSize(14);
                doc.text(`Fornecedor: ${supplier}`, 20, 35);
                
                doc.setFontSize(12);
                doc.setFont(undefined, "normal");
                doc.text(`Data: ${new Date().toLocaleDateString("pt-BR")}`, 20, 45);
                doc.text(`Hora: ${new Date().toLocaleTimeString("pt-BR")}`, 20, 55);
                
                // Cabeçalho da tabela
                let yPosition = 75;
                doc.setFontSize(10);
                doc.setFont(undefined, "bold");
                doc.text("Item", 20, yPosition);
                doc.text("Qtd. Atual", 90, yPosition);
                doc.text("Qtd. Pedida", 140, yPosition);
                
                // Linha separadora
                doc.line(20, yPosition + 2, 190, yPosition + 2);
                yPosition += 10;
                
                // Itens
                doc.setFont(undefined, "normal");
                items.forEach(item => {
                    if (yPosition > 270) {
                        doc.addPage();
                        yPosition = 20;
                        
                        // Repetir cabeçalho na nova página
                        doc.setFontSize(10);
                        doc.setFont(undefined, "bold");
                        doc.text("Item", 20, yPosition);
                        doc.text("Qtd. Atual", 90, yPosition);
                        doc.text("Qtd. Pedida", 140, yPosition);
                        doc.line(20, yPosition + 2, 190, yPosition + 2);
                        yPosition += 10;
                        doc.setFont(undefined, "normal");
                    }
                    
                    doc.text(item.name.substring(0, 25), 20, yPosition);
                    doc.text(`${item.currentQty.toFixed(2)} ${item.unit}`, 90, yPosition);
                    doc.text(`${item.requestedQty.toFixed(2)} ${item.unit}`, 140, yPosition);
                    
                    yPosition += 8;
                });
                
                // Resumo no final da página do fornecedor
                yPosition += 10;
                if (yPosition > 260) {
                    doc.addPage();
                    yPosition = 20;
                }
                
                doc.setFont(undefined, "bold");
                doc.text(`Total de itens: ${items.length}`, 20, yPosition);
            });
            
            doc.save("lista-de-compras.pdf");
            showMessage("Lista de compras gerada com sucesso!");
        }

        // Global functions for inline event handlers
        window.updateStockItem = async (id) => {
            const input = document.querySelector(`input[data-item-id="${id}"][data-update-type="stock"]`);
            if (!input) return;
            
            const newQuantity = parseFloat(input.value);
            if (isNaN(newQuantity)) {
                showMessage('Quantidade inválida', true);
                return;
            }
            
            try {
                await updateDoc(doc(db, 'estoque', id), {
                    atual: newQuantity
                });
                showMessage('Quantidade atualizada com sucesso!');
            } catch (error) {
                console.error('Erro ao atualizar item:', error);
                showMessage('Erro ao atualizar quantidade', true);
            }
        };

        window.deleteStockItem = async (id) => {
            if (confirm('Tem certeza que deseja excluir este item?')) {
                try {
                    await deleteDoc(doc(db, 'estoque', id));
                    showMessage('Item excluído com sucesso!');
                } catch (error) {
                    console.error('Erro ao excluir item:', error);
                    showMessage('Erro ao excluir item', true);
                }
            }
        };

        window.updateProductionItem = async (id) => {
            const input = document.querySelector(`input[data-item-id="${id}"][data-update-type="production"]`);
            if (!input) return;
            
            const newQuantity = parseFloat(input.value);
            if (isNaN(newQuantity)) {
                showMessage('Quantidade inválida', true);
                return;
            }
            
            try {
                await updateDoc(doc(db, 'producao', id), {
                    quantidade: newQuantity
                });
                showMessage('Quantidade atualizada com sucesso!');
            } catch (error) {
                console.error('Erro ao atualizar item:', error);
                showMessage('Erro ao atualizar quantidade', true);
            }
        };

        window.deleteProductionItem = async (id) => {
            if (confirm('Tem certeza que deseja excluir este item?')) {
                try {
                    await deleteDoc(doc(db, 'producao', id));
                    showMessage('Item excluído com sucesso!');
                } catch (error) {
                    console.error('Erro ao excluir item:', error);
                    showMessage('Erro ao excluir item', true);
                }
            }
        };

        window.deleteSupplier = async (id) => {
            if (confirm('Tem certeza que deseja excluir este fornecedor?')) {
                try {
                    await deleteDoc(doc(db, 'fornecedores', id));
                    showMessage('Fornecedor excluído com sucesso!');
                } catch (error) {
                    console.error('Erro ao excluir fornecedor:', error);
                    showMessage('Erro ao excluir fornecedor', true);
                }
            }
        };

        // Event Listeners
        showSignupBtn.addEventListener('click', () => {
            loginView.classList.add('hidden');
            signupView.classList.remove('hidden');
        });

        showLoginBtn.addEventListener('click', () => {
            signupView.classList.add('hidden');
            loginView.classList.remove('hidden');
        });

        onAuthStateChanged(auth, (user) => {
            if (user) {
                document.getElementById('user-email').textContent = user.email;
                toggleViews('main-app-view');
                switchTab('stock');
                listenToDataChanges();
            } else {
                toggleViews('login-view');
                // Limpar listeners quando usuário faz logout
                if (appState.unsubscribeStock) appState.unsubscribeStock();
                if (appState.unsubscribeProduction) appState.unsubscribeProduction();
                if (appState.unsubscribeSuppliers) appState.unsubscribeSuppliers();
            }
        });

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            try {
                await signInWithEmailAndPassword(auth, email, password);
                showMessage('Login realizado com sucesso!');
            } catch (error) {
                console.error('Erro no login:', error);
                showMessage('Erro no login: ' + error.message, true);
            }
        });

        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            
            try {
                await createUserWithEmailAndPassword(auth, email, password);
                showMessage('Conta criada com sucesso!');
            } catch (error) {
                console.error('Erro no cadastro:', error);
                showMessage('Erro no cadastro: ' + error.message, true);
            }
        });

        logoutBtn.addEventListener('click', async () => {
            try {
                await signOut(auth);
                showMessage('Logout realizado com sucesso!');
            } catch (error) {
                console.error('Erro no logout:', error);
                showMessage('Erro no logout', true);
            }
        });

        addItemForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('product-name').value;
            const supplier = document.getElementById('product-supplier').value;
            const quantity = parseFloat(document.getElementById('product-quantity').value);
            const min = parseFloat(document.getElementById('product-min').value) || 0;
            const ideal = parseFloat(document.getElementById('product-ideal').value) || 0;
            const unit = document.getElementById('product-unit').value;
            
            try {
                await addDoc(collection(db, 'estoque'), {
                    item: name,
                    fornecedor: supplier,
                    atual: quantity,
                    minimo: min,
                    ideal: ideal,
                    unidade: unit,
                    timestamp: new Date()
                });
                showMessage('Item adicionado com sucesso!');
                addItemForm.reset();
            } catch (error) {
                console.error('Erro ao adicionar item:', error);
                showMessage('Erro ao adicionar item', true);
            }
        });

        addProductionForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('production-name').value;
            const sector = document.getElementById('production-sector').value;
            const quantity = parseFloat(document.getElementById('production-quantity').value);
            const unit = document.getElementById('production-unit').value;
            
            try {
                await addDoc(collection(db, 'producao'), {
                    item: name,
                    setor: sector,
                    quantidade: quantity,
                    unidade: unit,
                    timestamp: new Date()
                });
                showMessage('Item de produção adicionado com sucesso!');
                addProductionForm.reset();
            } catch (error) {
                console.error('Erro ao adicionar item de produção:', error);
                showMessage('Erro ao adicionar item de produção', true);
            }
        });

        addSupplierBtn.addEventListener('click', async () => {
            const name = newSupplierNameInput.value.trim();
            if (!name) {
                showMessage('Nome do fornecedor é obrigatório', true);
                return;
            }
            
            try {
                await addDoc(collection(db, 'fornecedores'), {
                    nome: name,
                    timestamp: new Date()
                });
                showMessage('Fornecedor adicionado com sucesso!');
                newSupplierNameInput.value = '';
            } catch (error) {
                console.error('Erro ao adicionar fornecedor:', error);
                showMessage('Erro ao adicionar fornecedor', true);
            }
        });

        supplierFilter.addEventListener('change', (e) => {
            appState.currentSupplierFilter = e.target.value;
            renderStockList();
        });

        sectorFilter.addEventListener('change', (e) => {
            appState.currentSectorFilter = e.target.value;
            renderProductionList();
        });

        tabsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab-button')) {
                const tabName = e.target.getAttribute('data-tab');
                switchTab(tabName);
                
                // Esconder área de relatórios quando mudar de aba
                if (tabName !== 'reports') {
                    reportDisplayArea.classList.add('hidden');
                    reportDisplayArea.classList.remove('interactive-list');
                }
            }
        });

        generateStockReportBtn.addEventListener('click', generateStockReportBySupplier);
        generateShoppingListBtn.addEventListener('click', generateShoppingList);
        generateKitchenReportBtn.addEventListener('click', () => generateProductionReport('COZINHA'));
        generateParrillaReportBtn.addEventListener('click', () => generateProductionReport('PARRILLA'));

