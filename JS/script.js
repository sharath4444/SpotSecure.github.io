// Enhanced Entry Class with additional properties
class Entry {
    constructor(owner, car, licensePlate, entryTime, exitTime, date, parkingType, mobileNumber) {
        this.id = this.generateId();
        this.owner = owner;
        this.car = car;
        this.licensePlate = licensePlate;
        this.entryTime = entryTime;
        this.exitTime = exitTime;
        this.date = date;
        this.parkingType = parkingType;
        this.mobileNumber = mobileNumber;
        this.createdAt = new Date().toISOString();
        this.status = 'active';
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    calculateDuration() {
        const entry = new Date(`${this.date} ${this.entryTime}`);
        const exit = new Date(`${this.date} ${this.exitTime}`);
        const diffMs = exit - entry;
        const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
        return diffHours;
    }

    calculateCost() {
        const hours = this.calculateDuration();
        const hourlyRate = this.parkingType === 'Paid' ? 5 : 0; // $5 per hour for paid parking
        return hours * hourlyRate;
    }
}

// Enhanced UI Class with additional features
class UI {
    static displayEntries() {
        const entries = Store.getEntries();
        const tableBody = document.querySelector('#tableBody');
        tableBody.innerHTML = ''; // Clear existing entries
        
        if (entries.length === 0) {
            UI.showEmptyState();
            return;
        }

        entries.forEach((entry) => UI.addEntryToTable(entry));
        UI.updateStatistics();
    }

    static showEmptyState() {
        const tableBody = document.querySelector('#tableBody');
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center py-4">
                    <div class="empty-state">
                        <i class="fas fa-car" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                        <p class="text-muted">No parking entries found</p>
                        <p class="text-muted">Add your first vehicle to get started</p>
                    </div>
                </td>
            </tr>
        `;
    }

    static addEntryToTable(entry) {
        const tableBody = document.querySelector('#tableBody');
        const row = document.createElement('tr');
        row.setAttribute('data-id', entry.id);
        
        const duration = entry.calculateDuration();
        const cost = entry.calculateCost();
        
        row.innerHTML = `
            <td>${this.escapeHtml(entry.owner)}</td>
            <td>${this.escapeHtml(entry.car)}</td>
            <td><span class="license-plate">${this.escapeHtml(entry.licensePlate)}</span></td>
            <td>${entry.entryTime}</td>
            <td>${entry.exitTime}</td>
            <td>${entry.date}</td>
            <td>
                <span class="badge ${entry.parkingType === 'Paid' ? 'badge-warning' : 'badge-success'}">
                    ${entry.parkingType === 'Paid' ? 'Paid' : 'Free'}
                </span>
                ${entry.parkingType === 'Paid' ? `<br><small>$${cost}</small>` : ''}
            </td>
            <td>${this.escapeHtml(entry.mobileNumber)}</td>
            ${isLoggedIn() ? `
                <td class="actions-column">
                    <button class="btn btn-sm btn-info edit-btn" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger delete-btn" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            ` : ''}
        `;
        tableBody.appendChild(row);
    }

    static escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    static clearInput() {
        const inputs = document.querySelectorAll('.form-control');
        inputs.forEach((input) => (input.value = ''));
        
        // Set default date to today
        const dateInput = document.querySelector('#entryDate');
        if (dateInput) {
            dateInput.value = new Date().toISOString().split('T')[0];
        }
    }

    static deleteEntry(target) {
        if (target.classList.contains('delete-btn') || target.closest('.delete-btn')) {
            const row = target.closest('tr');
            const licensePlate = row.querySelector('td:nth-child(3)').textContent;
            
            if (confirm('Are you sure you want to delete this parking entry?')) {
                row.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => {
                    row.remove();
                    Store.removeEntry(licensePlate);
                    UI.updateStatistics();
                    UI.showAlert('Parking entry successfully removed', 'success');
                }, 300);
            }
        }
    }

    static editEntry(target) {
        if (target.classList.contains('edit-btn') || target.closest('.edit-btn')) {
            const row = target.closest('tr');
            const cells = row.querySelectorAll('td');
            
            // Populate form with existing data
            document.querySelector('#owner').value = cells[0].textContent;
            document.querySelector('#car').value = cells[1].textContent;
            document.querySelector('#licensePlate').value = cells[2].textContent;
            document.querySelector('#entryTime').value = cells[3].textContent;
            document.querySelector('#exitTime').value = cells[4].textContent;
            document.querySelector('#entryDate').value = cells[5].textContent;
            document.querySelector('#parkingType').value = cells[6].textContent.includes('Paid') ? 'Paid' : 'Free';
            document.querySelector('#mobileNumber').value = cells[7].textContent;
            
            // Change button text
            const submitBtn = document.querySelector('#btnOne');
            submitBtn.textContent = 'Update Entry';
            submitBtn.dataset.mode = 'edit';
            submitBtn.dataset.editId = row.dataset.id;
            
            // Scroll to form
            document.querySelector('.form-container').scrollIntoView({ behavior: 'smooth' });
        }
    }

    static showAlert(message, className) {
        // Remove existing alerts
        const existingAlert = document.querySelector('.alert');
        if (existingAlert) {
            existingAlert.remove();
        }

        const div = document.createElement('div');
        div.className = `alert alert-${className} w-50 mx-auto`;
        div.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fas fa-${className === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2"></i>
                <span>${message}</span>
            </div>
        `;
        
        const formContainer = document.querySelector('.form-container');
        const form = document.querySelector('#entryForm');
        formContainer.insertBefore(div, form);
        
        setTimeout(() => {
            if (div.parentNode) {
                div.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => div.remove(), 300);
            }
        }, 4000);
    }

    static validateInputs() {
        const owner = document.querySelector('#owner').value.trim();
        const car = document.querySelector('#car').value.trim();
        const licensePlate = document.querySelector('#licensePlate').value.trim();
        const entryTime = document.querySelector('#entryTime').value;
        const exitTime = document.querySelector('#exitTime').value;
        const date = document.querySelector('#entryDate').value;
        const mobileNumber = document.querySelector('#mobileNumber').value.trim();

        // Enhanced validation
        if (!owner || !car || !licensePlate || !entryTime || !exitTime || !date) {
            UI.showAlert('All fields must be filled!', 'danger');
            return false;
        }

        // License plate validation
        const licensePlateRegex = /^(?:[A-Z]{2}-\d{2}-\d{2})|(?:\d{2}-[A-Z]{2}-\d{2})|(?:\d{2}-\d{2}-[A-Z]{2})$/;
        if (!licensePlateRegex.test(licensePlate)) {
            UI.showAlert('License Plate must be in format: NN-NN-LL, NN-LL-NN, or LL-NN-NN', 'danger');
            return false;
        }

        // Time validation
        if (exitTime <= entryTime) {
            UI.showAlert('Exit Time must be after Entry Time', 'danger');
            return false;
        }

        // Mobile number validation
        const mobileRegex = /^\d{10}$/;
        if (mobileNumber && !mobileRegex.test(mobileNumber)) {
            UI.showAlert('Mobile number must be 10 digits', 'danger');
            return false;
        }

        // Check for duplicate license plate
        const entries = Store.getEntries();
        const isEditMode = document.querySelector('#btnOne').dataset.mode === 'edit';
        const editId = document.querySelector('#btnOne').dataset.editId;
        
        const duplicate = entries.find(entry => 
            entry.licensePlate === licensePlate && 
            (!isEditMode || entry.id !== editId)
        );
        
        if (duplicate) {
            UI.showAlert('A vehicle with this license plate already exists!', 'danger');
            return false;
        }

        return true;
    }

    static updateStatistics() {
        const entries = Store.getEntries();
        const totalEntries = entries.length;
        const paidEntries = entries.filter(entry => entry.parkingType === 'Paid').length;
        const freeEntries = totalEntries - paidEntries;
        const totalRevenue = entries.reduce((sum, entry) => sum + entry.calculateCost(), 0);
        const occupancyRate = ((totalEntries / Store.capacity) * 100).toFixed(1);

        // Create or update statistics display
        let statsContainer = document.querySelector('#statsContainer');
        if (!statsContainer) {
            statsContainer = document.createElement('div');
            statsContainer.id = 'statsContainer';
            statsContainer.className = 'stats-container mt-4 mb-4';
            document.querySelector('.table-container').insertBefore(statsContainer, document.querySelector('.table-container h5'));
        }

        statsContainer.innerHTML = `
            <div class="row text-center">
                <div class="col-md-3">
                    <div class="stat-card">
                        <h3>${totalEntries}</h3>
                        <p>Total Vehicles</p>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="stat-card">
                        <h3>${paidEntries}</h3>
                        <p>Paid Parking</p>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="stat-card">
                        <h3>$${totalRevenue}</h3>
                        <p>Total Revenue</p>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="stat-card">
                        <h3>${occupancyRate}%</h3>
                        <p>Occupancy Rate</p>
                    </div>
                </div>
            </div>
        `;
    }

    static exportData() {
        const entries = Store.getEntries();
        if (entries.length === 0) {
            UI.showAlert('No data to export', 'warning');
            return;
        }

        const csvContent = this.convertToCSV(entries);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `parking_data_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    static convertToCSV(entries) {
        const headers = ['Owner', 'Car', 'License Plate', 'Entry Time', 'Exit Time', 'Date', 'Parking Type', 'Mobile Number', 'Duration (hours)', 'Cost ($)'];
        const csvRows = [headers.join(',')];
        
        entries.forEach(entry => {
            const row = [
                entry.owner,
                entry.car,
                entry.licensePlate,
                entry.entryTime,
                entry.exitTime,
                entry.date,
                entry.parkingType,
                entry.mobileNumber,
                entry.calculateDuration(),
                entry.calculateCost()
            ].map(field => `"${field}"`).join(',');
            csvRows.push(row);
        });
        
        return csvRows.join('\n');
    }

    static sendNotification(entry) {
        // Enhanced notification with better error handling
        if (!entry.mobileNumber) {
            console.log('No mobile number provided for notification');
            return;
        }

        const infobipConfig = {
            apiKey: "e1d6c6e8255beb7dc7d78117b53d5368-ea8bcfd1-61a0-4f7a-bb4f-e179a3f600ba",
            apiUrl: "https://439zlp.api.infobip.com",
        };

        const message = {
            to: entry.mobileNumber,
            body: `Dear ${entry.owner}, your car (${entry.licensePlate}) has been successfully added to the parking slot. Entry time: ${entry.entryTime}, Exit time: ${entry.exitTime}. Thank you for choosing SpotSecure!`,
            title: "Parking Confirmation - SpotSecure",
            channel: "push",
        };

        fetch(`${infobipConfig.apiUrl}/push/2/message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `App ${infobipConfig.apiKey}`,
            },
            body: JSON.stringify(message),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Notification sent successfully:', data);
            UI.showAlert('Notification sent to vehicle owner', 'success');
        })
        .catch(error => {
            console.error('Error sending notification:', error);
            UI.showAlert('Failed to send notification', 'warning');
        });
    }
}

// Enhanced Store Class
class Store {
    static capacity = 20; // Increased capacity

    static getEntries() {
        let entries;
        if (localStorage.getItem('entries') === null) {
            entries = [];
        } else {
            entries = JSON.parse(localStorage.getItem('entries'));
        }
        return entries;
    }

    static addEntries(entry) {
        const entries = Store.getEntries();
        if (entries.length >= Store.capacity) {
            UI.showAlert(`Parking lot is full! Maximum capacity is ${Store.capacity} vehicles.`, 'danger');
            return false;
        }
        entries.push(entry);
        localStorage.setItem('entries', JSON.stringify(entries));
        return true;
    }

    static updateEntry(entryId, updatedEntry) {
        const entries = Store.getEntries();
        const index = entries.findIndex(entry => entry.id === entryId);
        if (index !== -1) {
            entries[index] = { ...entries[index], ...updatedEntry };
            localStorage.setItem('entries', JSON.stringify(entries));
            return true;
        }
        return false;
    }

    static removeEntry(licensePlate) {
        const entries = Store.getEntries();
        const updatedEntries = entries.filter((entry) => entry.licensePlate !== licensePlate);
        localStorage.setItem('entries', JSON.stringify(updatedEntries));
    }

    static clearAllEntries() {
        if (confirm('Are you sure you want to clear all parking data? This action cannot be undone.')) {
            localStorage.removeItem('entries');
            UI.displayEntries();
            UI.showAlert('All parking data has been cleared', 'success');
        }
    }
}

// Enhanced search functionality
function enhancedSearch() {
    const searchValue = document.querySelector('#searchInput').value.toLowerCase();
    const tableRows = document.querySelectorAll('#tableBody tr');
    let visibleCount = 0;

    tableRows.forEach(row => {
        const cells = row.querySelectorAll('td');
        let shouldShow = false;

        cells.forEach(cell => {
            if (cell.textContent.toLowerCase().includes(searchValue)) {
                shouldShow = true;
            }
        });

        if (shouldShow) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });

    // Show no results message if needed
    const noResultsRow = document.querySelector('#noResultsRow');
    if (visibleCount === 0 && searchValue !== '') {
        if (!noResultsRow) {
            const tbody = document.querySelector('#tableBody');
            const row = document.createElement('tr');
            row.id = 'noResultsRow';
            row.innerHTML = `
                <td colspan="9" class="text-center py-4">
                    <p class="text-muted">No results found for "${searchValue}"</p>
                </td>
            `;
            tbody.appendChild(row);
        }
    } else if (noResultsRow) {
        noResultsRow.remove();
    }
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    // Display entries when the page loads
    UI.displayEntries();

    // Check login status and show/hide actions column
    if (isLoggedIn()) {
        showActionsColumn();
    }

    // Set default date to today
    const dateInput = document.querySelector('#entryDate');
    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }

    // Add export button if not exists
    if (!document.querySelector('#exportBtn')) {
        const exportBtn = document.createElement('button');
        exportBtn.id = 'exportBtn';
        exportBtn.className = 'btn btn-success ms-2';
        exportBtn.innerHTML = '<i class="fas fa-download"></i> Export Data';
        exportBtn.onclick = () => UI.exportData();
        
        const tableContainer = document.querySelector('.table-container');
        const title = tableContainer.querySelector('h5');
        title.appendChild(exportBtn);
    }

    // Add clear all button for staff
    if (isLoggedIn() && !document.querySelector('#clearAllBtn')) {
        const clearBtn = document.createElement('button');
        clearBtn.id = 'clearAllBtn';
        clearBtn.className = 'btn btn-warning ms-2';
        clearBtn.innerHTML = '<i class="fas fa-trash"></i> Clear All';
        clearBtn.onclick = () => Store.clearAllEntries();
        
        const tableContainer = document.querySelector('.table-container');
        const title = tableContainer.querySelector('h5');
        title.appendChild(clearBtn);
    }
});

// Form submission handler
document.querySelector('#entryForm').addEventListener('submit', (e) => {
    e.preventDefault();

    if (!UI.validateInputs()) {
        return;
    }

    const owner = document.querySelector('#owner').value.trim();
    const car = document.querySelector('#car').value.trim();
    const licensePlate = document.querySelector('#licensePlate').value.trim();
    const entryTime = document.querySelector('#entryTime').value;
    const exitTime = document.querySelector('#exitTime').value;
    const date = document.querySelector('#entryDate').value;
    const parkingType = document.querySelector('#parkingType').value;
    const mobileNumber = document.querySelector('#mobileNumber').value.trim();

    const submitBtn = document.querySelector('#btnOne');
    const isEditMode = submitBtn.dataset.mode === 'edit';

    if (isEditMode) {
        // Update existing entry
        const editId = submitBtn.dataset.editId;
        const updatedEntry = {
            owner, car, licensePlate, entryTime, exitTime, date, parkingType, mobileNumber
        };
        
        if (Store.updateEntry(editId, updatedEntry)) {
            UI.displayEntries();
            UI.clearInput();
            submitBtn.textContent = 'Add Car';
            delete submitBtn.dataset.mode;
            delete submitBtn.dataset.editId;
            UI.showAlert('Parking entry updated successfully', 'success');
        }
    } else {
        // Add new entry
        const entry = new Entry(owner, car, licensePlate, entryTime, exitTime, date, parkingType, mobileNumber);
        
        if (Store.addEntries(entry)) {
            UI.addEntryToTable(entry);
            UI.clearInput();
            UI.updateStatistics();
            UI.showAlert('Car successfully added to parking slot', 'success');
            
            // Send notification
            UI.sendNotification(entry);
        }
    }
});

// Table event handlers
document.querySelector('#tableBody').addEventListener('click', (e) => {
    UI.deleteEntry(e.target);
    UI.editEntry(e.target);
});

// Enhanced search with debouncing
let searchTimeout;
document.querySelector('#searchInput').addEventListener('input', function() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(enhancedSearch, 300);
});

// Helper functions
function showActionsColumn() {
    const actionsColumn = document.querySelector("#tableBody .actions-column");
    if (actionsColumn) {
        actionsColumn.style.display = "table-cell";
    }
}

function isLoggedIn() {
    return sessionStorage.getItem('isLoggedIn') === 'true';
}

// Add CSS for new elements
const style = document.createElement('style');
style.textContent = `
    .stat-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 1rem;
        border-radius: 15px;
        margin: 0.5rem;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }
    
    .stat-card h3 {
        font-size: 2rem;
        font-weight: 700;
        margin: 0;
    }
    
    .stat-card p {
        margin: 0;
        opacity: 0.9;
    }
    
    .license-plate {
        background: #f8f9fa;
        padding: 0.25rem 0.5rem;
        border-radius: 5px;
        font-family: monospace;
        font-weight: bold;
    }
    
    .badge {
        padding: 0.25rem 0.5rem;
        border-radius: 10px;
        font-size: 0.8rem;
    }
    
    .badge-success {
        background: #28a745;
        color: white;
    }
    
    .badge-warning {
        background: #ffc107;
        color: #212529;
    }
    
    @keyframes slideOut {
        to {
            opacity: 0;
            transform: translateX(-100%);
        }
    }
    
    .empty-state {
        text-align: center;
        padding: 2rem;
    }
    
    .btn-sm {
        padding: 0.25rem 0.5rem;
        font-size: 0.8rem;
        margin: 0 0.25rem;
    }
`;
document.head.appendChild(style);
