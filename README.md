# SpotSecure - Parking Management System

A modern, responsive parking management system built with HTML, CSS, and JavaScript. SpotSecure helps manage parking slots, track vehicle entries/exits, and provides real-time notifications.

## Features

- **Vehicle Registration**: Add cars to parking slots with detailed information
- **Real-time Search**: Search through parking records instantly
- **Staff Management**: Secure login system for staff members
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Local Storage**: Data persistence using browser's local storage
- **Push Notifications**: Integration with Infobip for real-time notifications
- **License Plate Validation**: Ensures proper license plate format
- **Capacity Management**: Prevents overbooking of parking slots

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Bootstrap 4.6, Custom CSS
- **Storage**: Local Storage API
- **Notifications**: Infobip Push API
- **Fonts**: Google Fonts (Roboto)

## File Structure

```
SpotSecure/
├── CSS/
│   ├── bootstrap.min.css
│   └── style.css
├── Images/
│   ├── fav.png
│   ├── parking.jpeg
│   └── parking.svg
├── JS/
│   └── script.js
├── index.html              # Main parking management interface
├── index-staff.html        # Staff-only interface with delete capabilities
├── stafflogin.html         # Staff login page
├── T&C.html               # Terms and Conditions page
├── logout.html            # Logout page
└── README.md              # This file
```

## Getting Started

1. **Clone or Download** the project files
2. **Open** `index.html` in your web browser
3. **Start** adding parking entries

## Usage

### For Regular Users
- Navigate to the main page (`index.html`)
- Fill in vehicle details (owner, car model, license plate, etc.)
- Submit the form to add a car to the parking slot
- Use the search functionality to find specific records

### For Staff Members
- Login using credentials (username: `sharath`, password: `1234`)
- Access enhanced features including delete capabilities
- Manage all parking entries with administrative privileges

## Configuration

### Infobip Push Notifications
To enable push notifications, update the following in `JS/script.js`:

```javascript
const infobipConfig = {
    apiKey: "YOUR_INFOBIP_API_KEY",
    apiUrl: "YOUR_INFOBIP_API_URL",
};
```

### Parking Capacity
Modify the capacity in `JS/script.js`:

```javascript
static capacity = 10; // Change this number as needed
```

## Features in Detail

### Vehicle Registration
- Owner name
- Vehicle model
- License plate (with format validation)
- Entry/exit times
- Parking type (Free/Paid)
- Mobile number for notifications

### Search Functionality
- Real-time search across all fields
- Case-insensitive matching
- Instant filtering of results

### Data Validation
- Required field validation
- License plate format validation (NN-NN-LL, NN-LL-NN, LL-NN-NN)
- Time validation (exit time must be after entry time)

### Security Features
- Session-based authentication
- Staff-only delete capabilities
- Secure logout functionality

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Local Storage

The application uses browser's local storage to persist data. Data includes:
- Vehicle entries
- User session information
- Search preferences

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For support or questions, please contact the development team.

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Developer**: SpotSecure Team 