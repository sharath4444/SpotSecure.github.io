// Entry Class: Represent each entry in the parking lot
class Entry {
    constructor(owner, car, licensePlate, entryTime, exitTime, date, parkingType, mobileNumber) {
        this.owner = owner;
        this.car = car;
        this.licensePlate = licensePlate;
        this.entryTime = entryTime;
        this.exitTime = exitTime;
        this.date = date;
        this.parkingType = parkingType;
        this.mobileNumber = mobileNumber;
    }
}
function showActionsColumn() {
    const actionsColumn = document.querySelector("#tableBody .actions-column");
    if (actionsColumn) {
        actionsColumn.style.display = "table-cell";
    }
}

function isLoggedIn() {
    // Add your login status check here
    // For simplicity, let's use a flag. Replace this with your actual login logic.
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true'; // Change this based on your login status
    return isLoggedIn;
}

// UI Class: Handle User Interface Tasks
class UI {
    static displayEntries() {
        const entries = Store.getEntries();
        entries.forEach((entry) => UI.addEntryToTable(entry));
    }

    static addEntryToTable(entry) {
        const tableBody = document.querySelector('#tableBody');
        const row = document.createElement('tr');
        row.innerHTML = `<td>${entry.owner}</td>
                        <td>${entry.car}</td>
                        <td>${entry.licensePlate}</td>
                        <td>${entry.entryTime}</td>
                        <td>${entry.exitTime}</td>
                        <td>${entry.date}</td>
                        <td>${entry.parkingType === 'Paid' ? 'Paid Parking' : 'Free Parking'}</td>
                        <td>${entry.mobileNumber}</td>
                        ${isLoggedIn() ? '<td class="actions-column"><button class="btn btn-danger delete">X</button></td>' : ''}`;
        tableBody.appendChild(row);
    }

    static clearInput() {
        const inputs = document.querySelectorAll('.form-control');
        inputs.forEach((input) => (input.value = ''));
    }

    static deleteEntry(target) {
        if (target.classList.contains('delete')) {
            const licensePlate = target.parentElement.previousElementSibling.previousElementSibling.previousElementSibling.textContent;
            target.parentElement.parentElement.remove();
            Store.removeEntry(licensePlate);

            // Clear local storage if all entries are deleted
            if (document.querySelectorAll('#tableBody tr').length === 0) {
                localStorage.removeItem('entries');
            }

            UI.showAlert('Car successfully removed from the parking Slot list', 'success');
        }
    }

    static showAlert(message, className) {
        const div = document.createElement('div');
        div.className = `alert alert-${className} w-50 mx-auto`;
        div.appendChild(document.createTextNode(message));
        const formContainer = document.querySelector('.form-container');
        const form = document.querySelector('#entryForm');
        formContainer.insertBefore(div, form);
        setTimeout(() => document.querySelector('.alert').remove(), 3000);
    }

    static validateInputs() {
        const owner = document.querySelector('#owner').value;
        const car = document.querySelector('#car').value;
        const licensePlate = document.querySelector('#licensePlate').value;
        const entryTime = document.querySelector('#entryTime').value;
        const exitTime = document.querySelector('#exitTime').value;
        var licensePlateRegex = /^(?:[A-Z]{2}-\d{2}-\d{2})|(?:\d{2}-[A-Z]{2}-\d{2})|(?:\d{2}-\d{2}-[A-Z]{2})$/;
        if (owner === '' || car === '' || licensePlate === '' || entryTime === '' || exitTime === '') {
            UI.showAlert('All fields must be filled!', 'danger');
            return false;
        }
        if (exitTime < entryTime) {
            UI.showAlert('Exit Time cannot be lower than Entry Time', 'danger');
            return false;
        }
        if (!licensePlateRegex.test(licensePlate)) {
            UI.showAlert('License Plate must be like NN-NN-LL, NN-LL-NN, LL-NN-NN', 'danger');
            return false;
        }
        return true;
    }

    static sendNotification(entry) {
        // Initialize Infobip with your credentials
        const infobipConfig = {
            apiKey: "e1d6c6e8255beb7dc7d78117b53d5368-ea8bcfd1-61a0-4f7a-bb4f-e179a3f600ba",
            apiUrl: "https://439zlp.api.infobip.com",
        };

        const message = {
            to: entry.mobileNumber,
            body: `Dear ${entry.owner}, your car with license plate ${entry.licensePlate} has been added to the parking slot.`,
            title: "Car Added to Parking Slot",
            channel: "push",
            // Add other relevant parameters based on Infobip API documentation
        };

        fetch(`${infobipConfig.apiUrl}/push/2/message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `App ${infobipConfig.apiKey}`,
            },
            body: JSON.stringify(message),
        })
        .then(response => response.json())
        .then(data => console.log('Notification sent successfully:', data))
        .catch(error => console.error('Error sending notification:', error));
    }
}

// Store Class: Handle Local Storage
class Store {
    static capacity = 10; // Set your parking lot capacity here

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
            UI.showAlert('Parking Slots are full!', 'danger');
            return;
        }
        entries.push(entry);
        localStorage.setItem('entries', JSON.stringify(entries));
        // Send Infobip notification when adding an entry
        UI.sendNotification(entry);
    }

    static removeEntry(licensePlate) {
        const entries = Store.getEntries();
        const updatedEntries = entries.filter((entry) => entry.licensePlate !== licensePlate);
        localStorage.setItem('entries', JSON.stringify(updatedEntries));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Display entries when the page loads
    UI.displayEntries();

    // Check login status and show/hide actions column
    if (isLoggedIn()) {
        showActionsColumn();
    }
});

document.querySelector('#entryForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const owner = document.querySelector('#owner').value;
    const car = document.querySelector('#car').value;
    const licensePlate = document.querySelector('#licensePlate').value;
    const entryTime = document.querySelector('#entryTime').value;
    const exitTime = document.querySelector('#exitTime').value;
    const date = document.querySelector('#entryDate').value;
    const parkingType = document.querySelector('#parkingType').value;
    const mobileNumber = document.querySelector('#mobileNumber').value;

    if (!UI.validateInputs()) {
        return;
    }

    const entry = new Entry(owner, car, licensePlate, entryTime, exitTime, date, parkingType, mobileNumber);
    UI.addEntryToTable(entry);
    Store.addEntries(entry);
    UI.clearInput();

    UI.showAlert('Car successfully added to the parking Slot', 'success');
    if (isLoggedIn()) {
        showActionsColumn();
    }
});

document.querySelector('#tableBody').addEventListener('click', (e) => {
    const target = e.target;
    UI.deleteEntry(target);
});

document.querySelector('#searchInput').addEventListener('keyup', function searchTable() {
    const searchValue = document.querySelector('#searchInput').value.toUpperCase();
    const tableLine = document.querySelector('#tableBody').querySelectorAll('tr');
    for (let i = 0; i < tableLine.length; i++) {
        var count = 0;
        const lineValues = tableLine[i].querySelectorAll('td');
        for (let j = 0; j < lineValues.length - 1; j++) {
            if ((lineValues[j].innerHTML.toUpperCase()).startsWith(searchValue)) {
                count++;
            }
        }
        if (count > 0) {
            tableLine[i].style.display = '';
        } else {
            tableLine[i].style.display = 'none';
        }
    }
});
