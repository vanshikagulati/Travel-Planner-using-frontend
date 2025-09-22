// script.js
document.addEventListener('DOMContentLoaded', function() {
    // State management
    const appState = {
        currentTrip: null,
        itinerary: [],
        budget: {
            total: 0,
            expenses: []
        },
        packingList: [],
        memories: [],
        darkMode: false
    };

    // DOM Elements
    const elements = {
        themeToggle: document.getElementById('themeToggle'),
        startPlanningBtn: document.getElementById('startPlanningBtn'),
        generateItineraryBtn: document.getElementById('generateItineraryBtn'),
        addDayBtn: document.getElementById('addDayBtn'),
        saveItineraryBtn: document.getElementById('saveItineraryBtn'),
        exportPdfBtn: document.getElementById('exportPdfBtn'),
        setBudgetBtn: document.getElementById('setBudgetBtn'),
        addExpenseBtn: document.getElementById('addExpenseBtn'),
        addItemBtn: document.getElementById('addItemBtn'),
        saveMemoryBtn: document.getElementById('saveMemoryBtn'),
        generateStoryBtn: document.getElementById('generateStoryBtn'),
        itineraryDays: document.getElementById('itineraryDays'),
        expenseList: document.getElementById('expenseList'),
        categoryTabs: document.getElementById('categoryTabs'),
        itemsList: document.getElementById('itemsList'),
        memoriesList: document.getElementById('memoriesList'),
        storyContent: document.getElementById('storyContent')
    };

    // Initialize the application
    function init() {
        loadSavedData();
        setupEventListeners();
        updateUI();
        setupDateDefaults();
    }

    // Load saved data from localStorage
    function loadSavedData() {
        const savedData = localStorage.getItem('travelEaseData');
        if (savedData) {
            const data = JSON.parse(savedData);
            Object.assign(appState, data);
        }
    }

    // Save data to localStorage
    function saveData() {
        localStorage.setItem('travelEaseData', JSON.stringify(appState));
    }

    // Set up event listeners
    function setupEventListeners() {
        // Theme toggle
        elements.themeToggle.addEventListener('click', toggleTheme);

        // Navigation smooth scrolling
        document.querySelectorAll('nav a').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                if (targetId !== '#') {
                    document.querySelector(targetId).scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            });
        });

        // Start planning button
        elements.startPlanningBtn.addEventListener('click', function() {
            document.getElementById('tripCreation').scrollIntoView({
                behavior: 'smooth'
            });
        });

        // Generate itinerary
        elements.generateItineraryBtn.addEventListener('click', generateItinerary);

        // Itinerary controls
        elements.addDayBtn.addEventListener('click', addDay);
        elements.saveItineraryBtn.addEventListener('click', saveItinerary);
        elements.exportPdfBtn.addEventListener('click', exportToPDF);

        // Budget controls
        elements.setBudgetBtn.addEventListener('click', setBudget);
        elements.addExpenseBtn.addEventListener('click', addExpense);

        // Packing list controls
        elements.addItemBtn.addEventListener('click', addPackingItem);

        // Memories controls
        elements.saveMemoryBtn.addEventListener('click', saveMemory);
        elements.generateStoryBtn.addEventListener('click', generateTripStory);

        // Form validation
        setupFormValidation();
    }

    // Set default dates to today and tomorrow
    function setupDateDefaults() {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        document.getElementById('startDate').valueAsDate = today;
        document.getElementById('endDate').valueAsDate = tomorrow;
        document.getElementById('expenseDate').valueAsDate = today;
        document.getElementById('memoryDate').valueAsDate = today;
    }

    // Toggle dark/light theme
    function toggleTheme() {
        appState.darkMode = !appState.darkMode;
        document.body.classList.toggle('dark-mode', appState.darkMode);
        elements.themeToggle.innerHTML = appState.darkMode ? 
            '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        saveData();
    }

    // Generate itinerary based on trip details
    function generateItinerary() {
        const tripName = document.getElementById('tripName').value;
        const destination = document.getElementById('destination').value;
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const travelers = document.getElementById('travelers').value;
        const travelerNames = document.getElementById('travelerNames').value;

        // Validation
        if (!tripName || !destination || !startDate || !endDate) {
            alert('Please fill in all required trip details.');
            return;
        }

        // Create trip object
        appState.currentTrip = {
            name: tripName,
            destination: destination,
            startDate: startDate,
            endDate: endDate,
            travelers: travelers,
            travelerNames: travelerNames
        };

        // Calculate number of days
        const start = new Date(startDate);
        const end = new Date(endDate);
        const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

        // Generate empty itinerary days
        appState.itinerary = [];
        for (let i = 0; i < daysDiff; i++) {
            const currentDate = new Date(start);
            currentDate.setDate(start.getDate() + i);
            
            appState.itinerary.push({
                day: i + 1,
                date: currentDate.toISOString().split('T')[0],
                title: `Day ${i + 1} Activities`,
                activities: []
            });
        }

        // Update UI
        updateItineraryDisplay();
        document.getElementById('itinerary').scrollIntoView({
            behavior: 'smooth'
        });

        saveData();
    }

    // Add a new day to the itinerary
    function addDay() {
        if (!appState.currentTrip) {
            alert('Please create a trip first.');
            return;
        }

        const lastDay = appState.itinerary[appState.itinerary.length - 1];
        const lastDate = new Date(lastDay.date);
        lastDate.setDate(lastDate.getDate() + 1);

        appState.itinerary.push({
            day: appState.itinerary.length + 1,
            date: lastDate.toISOString().split('T')[0],
            title: `Day ${appState.itinerary.length + 1} Activities`,
            activities: []
        });

        updateItineraryDisplay();
        saveData();
    }

    // Update the itinerary display
    function updateItineraryDisplay() {
        elements.itineraryDays.innerHTML = '';

        appState.itinerary.forEach(day => {
            const dayElement = document.createElement('div');
            dayElement.className = 'itinerary-day';
            dayElement.innerHTML = `
                <div class="day-header">
                    <h3>Day ${day.day} - ${formatDate(day.date)}</h3>
                    <button class="btn-small delete-day" data-day="${day.day}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="day-title-section">
                    <input type="text" class="day-title-input" value="${day.title}" placeholder="Day title" data-day="${day.day}">
                    <button class="btn-small save-title-btn" data-day="${day.day}">Save Title</button>
                </div>
                <div class="activities">
                    ${day.activities.map(activity => `
                        <div class="activity">
                            <div class="activity-details">
                                <h4>${activity.title}</h4>
                                <p>${activity.description}</p>
                                ${activity.location ? `<p class="activity-location"><i class="fas fa-map-marker-alt"></i> ${activity.location}</p>` : ''}
                                ${activity.cost ? `<p class="activity-cost"><i class="fas fa-dollar-sign"></i> ${activity.cost.toFixed(2)}</p>` : ''}
                            </div>
                            <button class="btn-icon delete-activity" data-day="${day.day}" data-index="${day.activities.indexOf(activity)}">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    `).join('')}
                </div>
                <div class="add-activity">
                    <input type="text" class="activity-title-input" placeholder="Activity title" data-day="${day.day}">
                    <textarea class="activity-desc-input" placeholder="Description" data-day="${day.day}" rows="2"></textarea>
                    <input type="text" class="activity-location-input" placeholder="Location" data-day="${day.day}">
                    <input type="number" class="activity-cost-input" placeholder="Cost ($)" data-day="${day.day}" step="0.01">
                    <button class="btn-primary add-activity-btn" data-day="${day.day}">Add Activity</button>
                </div>
            `;

            elements.itineraryDays.appendChild(dayElement);
        });

        // Add event listeners for dynamic elements
        document.querySelectorAll('.delete-day').forEach(btn => {
            btn.addEventListener('click', function() {
                const dayNum = parseInt(this.getAttribute('data-day'));
                deleteDay(dayNum);
            });
        });

        document.querySelectorAll('.save-title-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const dayNum = parseInt(this.getAttribute('data-day'));
                saveDayTitle(dayNum);
            });
        });

        document.querySelectorAll('.delete-activity').forEach(btn => {
            btn.addEventListener('click', function() {
                const dayNum = parseInt(this.getAttribute('data-day'));
                const activityIndex = parseInt(this.getAttribute('data-index'));
                deleteActivity(dayNum, activityIndex);
            });
        });

        document.querySelectorAll('.add-activity-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const dayNum = parseInt(this.getAttribute('data-day'));
                addActivity(dayNum);
            });
        });
    }

    // Save day title
    function saveDayTitle(dayNum) {
        const day = appState.itinerary.find(d => d.day === dayNum);
        if (!day) return;

        const titleInput = document.querySelector(`.day-title-input[data-day="${dayNum}"]`);
        day.title = titleInput.value;
        saveData();
    }

    // Delete a day from itinerary
    function deleteDay(dayNum) {
        if (confirm('Are you sure you want to delete this day?')) {
            appState.itinerary = appState.itinerary.filter(day => day.day !== dayNum);
            // Re-number days
            appState.itinerary.forEach((day, index) => {
                day.day = index + 1;
            });
            updateItineraryDisplay();
            saveData();
        }
    }

    // Add an activity to a day
    function addActivity(dayNum) {
        const day = appState.itinerary.find(d => d.day === dayNum);
        if (!day) return;

        const titleInput = document.querySelector(`.activity-title-input[data-day="${dayNum}"]`);
        const descInput = document.querySelector(`.activity-desc-input[data-day="${dayNum}"]`);
        const locationInput = document.querySelector(`.activity-location-input[data-day="${dayNum}"]`);
        const costInput = document.querySelector(`.activity-cost-input[data-day="${dayNum}"]`);

        if (!titleInput.value) {
            alert('Please enter at least a title for the activity.');
            return;
        }

        day.activities.push({
            title: titleInput.value,
            description: descInput.value,
            location: locationInput.value,
            cost: costInput.value ? parseFloat(costInput.value) : 0
        });

        // Clear inputs
        titleInput.value = '';
        descInput.value = '';
        locationInput.value = '';
        costInput.value = '';

        updateItineraryDisplay();
        saveData();
    }

    // Delete an activity from a day
    function deleteActivity(dayNum, activityIndex) {
        const day = appState.itinerary.find(d => d.day === dayNum);
        if (day && day.activities[activityIndex]) {
            day.activities.splice(activityIndex, 1);
            updateItineraryDisplay();
            saveData();
        }
    }

    // Save itinerary
    function saveItinerary() {
        if (!appState.currentTrip) {
            alert('Please create a trip first.');
            return;
        }

        saveData();
        alert('Itinerary saved successfully!');
    }

    // Export to PDF (simplified version)
    function exportToPDF() {
        if (!appState.currentTrip) {
            alert('Please create a trip first.');
            return;
        }

        // In a real implementation, you would use a library like jsPDF
        // This is a simplified version that creates a printable view
        const printContent = document.createElement('div');
        printContent.innerHTML = `
            <h1>${appState.currentTrip.name} - Itinerary</h1>
            <p><strong>Destination:</strong> ${appState.currentTrip.destination}</p>
            <p><strong>Dates:</strong> ${formatDate(appState.currentTrip.startDate)} to ${formatDate(appState.currentTrip.endDate)}</p>
            <p><strong>Travelers:</strong> ${appState.currentTrip.travelerNames || appState.currentTrip.travelers}</p>
            <hr>
            ${appState.itinerary.map(day => `
                <div style="margin-bottom: 20px;">
                    <h2>Day ${day.day} - ${formatDate(day.date)}: ${day.title}</h2>
                    ${day.activities.map(activity => `
                        <div style="margin: 10px 0; padding: 10px; border-left: 3px solid #007bff;">
                            <h3 style="margin: 0;">${activity.title}</h3>
                            ${activity.description ? `<p style="margin: 5px 0;">${activity.description}</p>` : ''}
                            ${activity.location ? `<p style="margin: 5px 0;"><strong>Location:</strong> ${activity.location}</p>` : ''}
                            ${activity.cost ? `<p style="margin: 5px 0;"><strong>Cost:</strong> $${activity.cost.toFixed(2)}</p>` : ''}
                        </div>
                    `).join('')}
                </div>
            `).join('')}
        `;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>${appState.currentTrip.name} - Itinerary</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        h1 { color: #007bff; }
                        h2 { color: #333; border-bottom: 1px solid #eee; padding-bottom: 5px; }
                    </style>
                </head>
                <body>
                    ${printContent.innerHTML}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }

    // Set budget
    function setBudget() {
        const totalBudget = parseFloat(document.getElementById('totalBudget').value);
        
        if (isNaN(totalBudget) || totalBudget <= 0) {
            alert('Please enter a valid budget amount.');
            return;
        }

        appState.budget.total = totalBudget;
        updateBudgetDisplay();
        saveData();
        alert('Budget set successfully!');
    }

    // Add expense
    function addExpense() {
        if (appState.budget.total === 0) {
            alert('Please set a budget first.');
            return;
        }

        const date = document.getElementById('expenseDate').value;
        const category = document.getElementById('expenseCategory').value;
        const description = document.getElementById('expenseDescription').value;
        const amount = parseFloat(document.getElementById('expenseAmount').value);

        if (!date || !description || isNaN(amount) || amount <= 0) {
            alert('Please fill in all expense details correctly.');
            return;
        }

        appState.budget.expenses.push({
            id: Date.now(),
            date: date,
            category: category,
            description: description,
            amount: amount
        });

        // Clear form
        document.getElementById('expenseDescription').value = '';
        document.getElementById('expenseAmount').value = '';

        updateBudgetDisplay();
        saveData();
    }

    // Update budget display
    function updateBudgetDisplay() {
        const totalSpent = appState.budget.expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const remaining = appState.budget.total - totalSpent;
        const percentageUsed = appState.budget.total > 0 ? (totalSpent / appState.budget.total) * 100 : 0;

        // Update summary cards
        document.getElementById('summaryTotal').textContent = `$${appState.budget.total.toFixed(2)}`;
        document.getElementById('summarySpent').textContent = `$${totalSpent.toFixed(2)}`;
        document.getElementById('summaryRemaining').textContent = `$${remaining.toFixed(2)}`;
        document.getElementById('summaryPercentage').textContent = `${percentageUsed.toFixed(1)}%`;

        // Update progress bar
        const progressBar = document.getElementById('budgetProgress');
        progressBar.style.width = `${Math.min(percentageUsed, 100)}%`;
        
        // Change color based on percentage
        if (percentageUsed > 90) {
            progressBar.style.backgroundColor = '#dc3545'; // Red
        } else if (percentageUsed > 75) {
            progressBar.style.backgroundColor = '#ffc107'; // Yellow
        } else {
            progressBar.style.backgroundColor = '#28a745'; // Green
        }

        // Update expense list
        elements.expenseList.innerHTML = appState.budget.expenses.map(expense => `
            <div class="expense-item">
                <div class="expense-info">
                    <div class="expense-date"><strong>${formatDate(expense.date)}</strong></div>
                    <div class="expense-category-badge">${expense.category}</div>
                    <div class="expense-description">${expense.description}</div>
                    <div class="expense-amount">$${expense.amount.toFixed(2)}</div>
                </div>
                <button class="btn-icon delete-expense" data-id="${expense.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');

        // Add event listeners for delete buttons
        document.querySelectorAll('.delete-expense').forEach(btn => {
            btn.addEventListener('click', function() {
                const expenseId = parseInt(this.getAttribute('data-id'));
                deleteExpense(expenseId);
            });
        });
    }

    // Delete expense
    function deleteExpense(expenseId) {
        if (confirm('Are you sure you want to delete this expense?')) {
            appState.budget.expenses = appState.budget.expenses.filter(expense => expense.id !== expenseId);
            updateBudgetDisplay();
            saveData();
        }
    }

    // Add packing item
    function addPackingItem() {
        const category = document.getElementById('itemCategory').value;
        const name = document.getElementById('itemName').value;
        const quantity = parseInt(document.getElementById('itemQuantity').value);
        const packed = document.getElementById('itemPacked').checked;

        if (!name || isNaN(quantity) || quantity <= 0) {
            alert('Please enter a valid item name and quantity.');
            return;
        }

        appState.packingList.push({
            id: Date.now(),
            category: category,
            name: name,
            quantity: quantity,
            packed: packed
        });

        // Clear form
        document.getElementById('itemName').value = '';
        document.getElementById('itemQuantity').value = '1';
        document.getElementById('itemPacked').checked = false;

        updatePackingDisplay();
        saveData();
    }

    // Update packing display
    function updatePackingDisplay() {
        // Update category tabs
        const categories = [...new Set(appState.packingList.map(item => item.category))];
        elements.categoryTabs.innerHTML = `
            <button class="category-tab active" data-category="all">All Items</button>
            ${categories.map(category => `
                <button class="category-tab" data-category="${category}">${category.charAt(0).toUpperCase() + category.slice(1)}</button>
            `).join('')}
        `;

        // Add event listeners to tabs
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.addEventListener('click', function() {
                document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                filterPackingItems(this.getAttribute('data-category'));
            });
        });

        // Show all items by default
        filterPackingItems('all');
        updatePackingProgress();
    }

    // Filter packing items by category
    function filterPackingItems(category) {
        const filteredItems = category === 'all' 
            ? appState.packingList 
            : appState.packingList.filter(item => item.category === category);

        elements.itemsList.innerHTML = filteredItems.map(item => `
            <div class="packing-item ${item.packed ? 'packed' : ''}">
                <label class="checkbox-label">
                    <input type="checkbox" ${item.packed ? 'checked' : ''} data-id="${item.id}">
                    <span class="checkmark"></span>
                </label>
                <div class="item-info">
                    <div class="item-name">${item.name}</div>
                    <div class="item-quantity">Qty: ${item.quantity}</div>
                    <div class="item-category">${item.category}</div>
                </div>
                <button class="btn-icon delete-item" data-id="${item.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');

        // Add event listeners for checkboxes and delete buttons
        document.querySelectorAll('.packing-item input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const itemId = parseInt(this.getAttribute('data-id'));
                togglePackedStatus(itemId, this.checked);
            });
        });

        document.querySelectorAll('.delete-item').forEach(btn => {
            btn.addEventListener('click', function() {
                const itemId = parseInt(this.getAttribute('data-id'));
                deletePackingItem(itemId);
            });
        });
    }

    // Toggle packed status
    function togglePackedStatus(itemId, packed) {
        const item = appState.packingList.find(item => item.id === itemId);
        if (item) {
            item.packed = packed;
            updatePackingProgress();
            saveData();
        }
    }

    // Delete packing item
    function deletePackingItem(itemId) {
        if (confirm('Are you sure you want to delete this item?')) {
            appState.packingList = appState.packingList.filter(item => item.id !== itemId);
            updatePackingDisplay();
            saveData();
        }
    }

    // Update packing progress
    function updatePackingProgress() {
        const totalItems = appState.packingList.length;
        const packedItems = appState.packingList.filter(item => item.packed).length;
        const percentage = totalItems > 0 ? (packedItems / totalItems) * 100 : 0;

        document.getElementById('packingProgress').style.width = `${percentage}%`;
        document.getElementById('packingPercentage').textContent = `${percentage.toFixed(1)}%`;
    }

    // Save memory
    function saveMemory() {
        const date = document.getElementById('memoryDate').value;
        const title = document.getElementById('memoryTitle').value;
        const content = document.getElementById('memoryContent').value;
        const photoFile = document.getElementById('memoryPhoto').files[0];

        if (!date || !title || !content) {
            alert('Please fill in date, title, and content for your memory.');
            return;
        }

        let photoUrl = null;
        if (photoFile) {
            // In a real app, you would upload this to a server
            // For this demo, we'll create a local URL
            photoUrl = URL.createObjectURL(photoFile);
        }

        appState.memories.push({
            id: Date.now(),
            date: date,
            title: title,
            content: content,
            photoUrl: photoUrl
        });

        // Clear form
        document.getElementById('memoryTitle').value = '';
        document.getElementById('memoryContent').value = '';
        document.getElementById('memoryPhoto').value = '';

        updateMemoriesDisplay();
        saveData();
        alert('Memory saved successfully!');
    }

    // Update memories display
    function updateMemoriesDisplay() {
        elements.memoriesList.innerHTML = appState.memories.map(memory => `
            <div class="memory-item">
                <div class="memory-date">${formatDate(memory.date)}</div>
                <h4>${memory.title}</h4>
                <p>${memory.content}</p>
                ${memory.photoUrl ? `<img src="${memory.photoUrl}" alt="${memory.title}">` : ''}
                <button class="btn-icon delete-memory" data-id="${memory.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');

        // Add event listeners for delete buttons
        document.querySelectorAll('.delete-memory').forEach(btn => {
            btn.addEventListener('click', function() {
                const memoryId = parseInt(this.getAttribute('data-id'));
                deleteMemory(memoryId);
            });
        });
    }

    // Delete memory
    function deleteMemory(memoryId) {
        if (confirm('Are you sure you want to delete this memory?')) {
            const memory = appState.memories.find(m => m.id === memoryId);
            if (memory && memory.photoUrl) {
                URL.revokeObjectURL(memory.photoUrl); // Clean up the blob URL
            }
            
            appState.memories = appState.memories.filter(m => m.id !== memoryId);
            updateMemoriesDisplay();
            saveData();
        }
    }

    // Generate trip story
    function generateTripStory() {
        if (!appState.currentTrip) {
            alert('Please create a trip first.');
            return;
        }

        if (appState.memories.length === 0) {
            alert('Please add some memories first to generate a story.');
            return;
        }

        // Sort memories by date
        const sortedMemories = [...appState.memories].sort((a, b) => new Date(a.date) - new Date(b.date));

        let storyHTML = `
            <h2>${appState.currentTrip.name}</h2>
            <p><strong>Destination:</strong> ${appState.currentTrip.destination}</p>
            <p><strong>Travel Dates:</strong> ${formatDate(appState.currentTrip.startDate)} to ${formatDate(appState.currentTrip.endDate)}</p>
            <p><strong>Travel Companions:</strong> ${appState.currentTrip.travelerNames || appState.currentTrip.travelers}</p>
            <hr>
        `;

        sortedMemories.forEach(memory => {
            storyHTML += `
                <div class="memory-story">
                    <h3>${formatDate(memory.date)}: ${memory.title}</h3>
                    <p>${memory.content}</p>
                    ${memory.photoUrl ? `<img src="${memory.photoUrl}" alt="${memory.title}">` : ''}
                </div>
            `;
        });

        elements.storyContent.innerHTML = storyHTML;
        document.getElementById('tripStory').scrollIntoView({
            behavior: 'smooth'
        });
    }

    // Format date for display
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    // Setup form validation
    function setupFormValidation() {
        // Simple validation for required fields
        const requiredFields = document.querySelectorAll('input[required], textarea[required]');
        requiredFields.forEach(field => {
            field.addEventListener('blur', function() {
                if (!this.value) {
                    this.classList.add('error');
                } else {
                    this.classList.remove('error');
                }
            });
        });
    }

    // Update UI based on app state
    function updateUI() {
        // Apply saved theme
        if (appState.darkMode) {
            document.body.classList.add('dark-mode');
            elements.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }

        // Update displays if data exists
        if (appState.currentTrip) {
            updateItineraryDisplay();
        }
        
        if (appState.budget.total > 0) {
            updateBudgetDisplay();
        }
        
        if (appState.packingList.length > 0) {
            updatePackingDisplay();
        }
        
        if (appState.memories.length > 0) {
            updateMemoriesDisplay();
        }
    }

    // Initialize the app
    init();
});