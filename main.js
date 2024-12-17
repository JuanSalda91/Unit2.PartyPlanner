
// Cohort-specific API base URL
const COHORT = '2410-FTB-ET-WEB-PT';
const BASE_URL = `https://fsa-crud-2aa9294fe819.herokuapp.com/api/${COHORT}/events`;

// State to manage events
let state = {
    events: []
};

// Render events to the DOM
function renderEvents() {
    const eventsContainer = document.getElementById('events-container');
    eventsContainer.innerHTML = ''; // Clear existing events

    console.log('Total events in state:', state.events.length);

    // If no events, show a message
    if (state.events.length === 0) {
        eventsContainer.innerHTML = '<p>No events available. Add a new event!</p>';
        return;
    }

    // Select 3 random events (or all if less than 3)
    const randomEvents = state.events
        .sort(() => 0.5 - Math.random()) // Shuffle the array
        .slice(0, 3); // Take first 3 events

    console.log('Random events to display:', randomEvents);

    // Create event cards for random events
    randomEvents.forEach(event => {
        const eventCard = document.createElement('div');
        eventCard.classList.add('event-card');
        eventCard.innerHTML = `
            <button class="delete-btn" onclick="deleteEvent(${event.id})">Delete</button>
            <h3>${event.name}</h3>
            <p><strong>Date:</strong> ${new Date(event.date).toLocaleString()}</p>
            <p><strong>Location:</strong> ${event.location}</p>
            <p>${event.description}</p>
        `;
        eventsContainer.appendChild(eventCard);
    });
}

// Fetch events from API
async function fetchEvents() {
    try {
        console.log('Fetching events from:', BASE_URL);
        
        // Add error handling for network issues
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch(BASE_URL, { 
            method: 'GET',
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        console.log('Response status:', response.status);
        
        const result = await response.json();
        
        console.log('Full API response:', result);

        if (result.success) {
            // Ensure we have an array
            state.events = Array.isArray(result.data) ? result.data : [];
            renderEvents();
        } else {
            console.error('API returned unsuccessful response:', result.error);
            alert(`Failed to fetch events: ${result.error.message || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error fetching events:', error);
        
        // More detailed error handling
        if (error.name === 'AbortError') {
            alert('Request timed out. Please check your internet connection.');
        } else if (error instanceof TypeError) {
            alert('Network error. Please check your internet connection.');
        } else {
            alert('An unexpected error occurred. Check the console for details.');
        }
    }
}

// Function to pre-populate events if none exist
async function ensureEvents() {
    if (state.events.length === 0) {
        console.log('No events found. Adding sample events.');
        const sampleEvents = [
            {
                name: "Summer Music Festival",
                date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
                location: "City Park",
                description: "Annual summer music celebration with local bands"
            },
            {
                name: "Tech Conference 2024",
                date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days from now
                location: "Convention Center",
                description: "Cutting-edge technology discussions and networking"
            },
            {
                name: "Charity Fundraiser Gala",
                date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days from now
                location: "Grand Hotel Ballroom",
                description: "Fundraising event for local community projects"
            }
        ];

        for (const event of sampleEvents) {
            await addEvent(event);
        }
    }
}

// Add a new event to the API
async function addEvent(eventData) {
    try {
        const response = await fetch(BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(eventData)
        });

        const result = await response.json();

        if (result.success) {
            await fetchEvents(); // Refresh the list
        } else {
            console.error('Failed to add event:', result.error);
            alert(`Failed to add event: ${result.error.message}`);
        }
    } catch (error) {
        console.error('Error adding event:', error);
        alert('Unable to add event. Check console for details.');
    }
}

// Delete an event from the API
async function deleteEvent(eventId) {
    try {
        const response = await fetch(`${BASE_URL}/${eventId}`, {
            method: 'DELETE'
        });

        if (response.status === 204) {
            await fetchEvents(); // Refresh the list
        } else {
            const result = await response.json();
            console.error('Failed to delete event:', result.error);
            alert(`Failed to delete event: ${result.error.message}`);
        }
    } catch (error) {
        console.error('Error deleting event:', error);
        alert('Unable to delete event. Check console for details.');
    }
}

// Event listener for new event form
document.getElementById('new-event-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const eventData = {
        name: document.getElementById('name').value,
        date: new Date(document.getElementById('date').value).toISOString(),
        location: document.getElementById('location').value,
        description: document.getElementById('description').value
    };

    await addEvent(eventData);

    // Reset form
    event.target.reset();
});

// Initial setup when page loads
async function initializePage() {
    await fetchEvents();
    await ensureEvents();
}

// Start the initialization
initializePage();