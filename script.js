// Helper function to parse time string (e.g., "8:30 Pagi", "1:00 Petang") and return hours and minutes in 24-hour format
function parseTime(timeStr) {
    let [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (period.toLowerCase() === 'petang' && hours !== 12) {
        hours += 12;
    } else if (period.toLowerCase() === 'pagi' && hours === 12) { // Midnight (12 AM)
        hours = 0;
    }
    return { hours, minutes };
}

// Fungsi untuk menguruskan butang kembali ke atas
let mybutton = document.getElementById("backToTopBtn");

window.onscroll = function() {scrollFunction()};

function scrollFunction() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        mybutton.style.display = "block";
    } else {
        mybutton.style.display = "none";
    }
}

function topFunction() {
    document.body.scrollTop = 0; // Untuk Safari
    document.documentElement.scrollTop = 0; // Untuk Chrome, Firefox, IE dan Opera
}

// Fungsi untuk menandakan acara langsung dan mengendalikan butang "Tonton Live Sekarang"
document.addEventListener('DOMContentLoaded', function() {
    const eventCards = document.querySelectorAll('#acara .card');
    const watchLiveBtn = document.getElementById('watchLiveBtn');
    const liveStreamContainer = document.getElementById('live-stream-container');
    const liveSectionTitle = document.getElementById('live-section-title'); // Get the h2 element
    const summaryModal = document.getElementById('summaryModal');
    const closeButton = document.querySelector('.close-button');
    const summaryContent = document.getElementById('summaryContent');
    const summaryLoading = document.getElementById('summaryLoading');

    // Explicitly hide the modal on load to prevent any flicker or unintended display
    summaryModal.style.display = 'none';

    let liveEventsToday = []; // Stores events that are live today
    let allEventsData = []; // Stores data for all events to sort if no live events

    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth(); // Month is 0-indexed (e.g., July is 6, August is 7)
    const currentYear = today.getFullYear(); // Assuming 2025 based on the page title and hero section
    const currentDateTime = new Date(); // Current time with full date and time

    // Mapping for month names to 0-indexed month numbers
    const monthMap = {
        'JAN': 0, 'FEB': 1, 'MAC': 2, 'APR': 3, 'MEI': 4, 'JUN': 5,
        'JULAI': 6, 'JUL': 6,
        'OGOS': 7, 'OGS': 7,
        'SEP': 8, 'OKT': 9, 'NOV': 10, 'DIS': 11
    };

    eventCards.forEach(card => {
        const dateElement = card.querySelector('.event-date');
        const eventNameElement = card.querySelector('.event-name');
        const eventLocationElement = card.querySelector('p:nth-of-type(2)'); // Second p tag for location
        const eventTimeElement = card.querySelector('p:nth-of-type(3)'); // Third p tag for time
        const liveBadge = card.querySelector('.live-badge');
        const generateSummaryBtn = card.querySelector('.generate-summary-btn');

        // Ensure the badge is hidden by default
        if (liveBadge) {
            liveBadge.classList.add('hidden');
        }

        if (dateElement && eventNameElement && eventLocationElement && eventTimeElement && liveBadge) {
            const dateText = dateElement.textContent.trim(); // e.g., "11 OGOS" or "3 JULAI"
            const eventName = eventNameElement.textContent.trim(); // e.g., "Dodgeball" or "LUMBA"
            const parts = dateText.split(' ');
            const day = parseInt(parts[0]);
            const monthName = parts[1].toUpperCase();
            const eventMonth = monthMap[monthName] !== undefined ? monthMap[monthName] : -1;

            const timeText = eventTimeElement.textContent.trim().replace('Masa: ', ''); // "8:30 Pagi - 1:00 Petang"
            const [startTimeStr, endTimeStr] = timeText.split(' - ');

            const parsedStartTime = parseTime(startTimeStr);
            const parsedEndTime = parseTime(endTimeStr);

            // Create Date objects for comparison, using the event's date (day, month, year)
            const eventStartDateTime = new Date(currentYear, eventMonth, day, parsedStartTime.hours, parsedStartTime.minutes, 0);
            const eventEndDateTime = new Date(currentYear, eventMonth, day, parsedEndTime.hours, parsedEndTime.minutes, 0);


            // Determine YouTube URL based on event name (ADD YOUR SPECIFIC YOUTUBE EMBED LINKS HERE)
            let youtubeUrl = "https://www.youtube.com/embed/live_stream?channel=UC_x5zY0nKk8L1k7kR2_K_gQ&autoplay=1"; // Default placeholder
            switch (eventName.toLowerCase()) {
                case 'dodgeball':
                    youtubeUrl = "https://www.youtube.com/embed/PJCgK-eE148"; // Gantikan dengan pautan Dodgeball sebenar
                    break;
                case 'netball':
                    youtubeUrl = "https://www.youtube.com/embed/R0cVMNhUMrU"; // Gantikan dengan pautan Netball sebenar
                    break;
                case 'futsal':
                    youtubeUrl = "https://www.youtube.com/embed/KcNSvONDA44"; // Gantikan dengan pautan Futsal sebenar
                    break;
                case 'pickeball':
                    youtubeUrl = "https://www.youtube.com/embed/jTW2RNEKjyk"; // Gantikan dengan pautan Pickeball sebenar
                    break;
                // Tambah kes lain jika ada acara baru
            }

            const eventData = {
                day: day,
                month: eventMonth,
                year: currentYear, // Use current year for comparison
                name: eventName,
                location: eventLocationElement.textContent.trim(), // Get text content
                time: eventTimeElement.textContent.trim(), // Get text content
                normalizedName: eventName.toLowerCase().replace(/[^a-z0-9]+/g, ''),
                youtubeUrl: youtubeUrl, // Store the specific YouTube URL
                startDateTime: eventStartDateTime, // Add parsed start date/time
                endDateTime: eventEndDateTime // Add parsed end date/time
            };
            allEventsData.push(eventData); // Collect all event data

            // Check if the event date matches today's date and year AND current time is within event time
            if (day === currentDay && eventMonth === currentMonth && currentYear === eventData.year &&
                currentDateTime >= eventData.startDateTime && currentDateTime <= eventData.endDateTime) {
                card.classList.add('live-event');
                liveBadge.classList.remove('hidden'); // Show the LIVE badge
                liveEventsToday.push(eventData); // Collect live events
            }
        }
    });

    // Function to create a live stream card HTML
    function getLiveStreamCardHtml(event, isLiveCard = false) { // Added isLiveCard parameter
        // Determine the ID for the live stream card based on the event name
        const liveStreamId = `live-${event.normalizedName}`;
        const title = `Langsung: ${event.name}`;
        const description = `${event.location}, ${event.time}`; // Using location and time from event data

        // Add live-event class and live-badge if it's a live card
        const liveClass = isLiveCard ? 'live-event' : '';
        const liveBadgeHtml = isLiveCard ? '<span class="live-badge">LIVE</span>' : '';

        return `
            <div class="bg-white rounded-lg shadow-xl overflow-hidden card relative ${liveClass}" id="${liveStreamId}">
                <div class="p-6">
                    <h3 class="text-2xl font-semibold mb-4 text-center text-gray-800">${title}</h3>
                    <div class="video-container">
                        <!-- Gantikan src dengan embed URL YouTube Live sebenar Anda -->
                        <iframe
                            src="${event.youtubeUrl}"
                            frameborder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowfullscreen>
                        </iframe>
                    </div>
                    <p class="text-gray-600 mt-4 text-center">${description}</p>
                    ${liveBadgeHtml}
                </div>
            </div>
        `;
    }

    // Render the Live Stream section based on live events
    liveStreamContainer.innerHTML = ''; // Clear existing content

    if (liveEventsToday.length > 0) {
        // Show only live events
        liveEventsToday.forEach(event => {
            liveStreamContainer.innerHTML += getLiveStreamCardHtml(event, true); // Pass true for isLiveCard
        });
        // Set the "Tonton Live Sekarang" button to open the YouTube URL in a new tab
        watchLiveBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.open(liveEventsToday[0].youtubeUrl, '_blank'); // Open in new tab
        });
        liveSectionTitle.textContent = 'Sedang Berlangsung'; // Set title if live events
    } else {
        // No live events, show all events sorted by date
        allEventsData.sort((a, b) => {
            const dateA = new Date(a.year, a.month, a.day);
            const dateB = new Date(b.year, b.month, b.day);
            return dateA - dateB;
        });

        allEventsData.forEach(event => {
            liveStreamContainer.innerHTML += getLiveStreamCardHtml(event, false); // Pass false for isLiveCard
        });
        // Set the "Tonton Live Sekarang" button to scroll to the top of the live section
        watchLiveBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const targetElement = document.getElementById('live');
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
        liveSectionTitle.textContent = 'Acara Sukan'; // Change title if no live events
    }

    // Gemini API Integration: Event Summary Generator
    const generateSummaryButtons = document.querySelectorAll('.generate-summary-btn');
    generateSummaryButtons.forEach(button => {
        button.addEventListener('click', async function() {
            const card = this.closest('.card');
            const eventName = card.querySelector('.event-name').textContent.trim();
            const eventLocation = card.querySelector('p:nth-of-type(2)').textContent.trim();
            const eventTime = card.querySelector('p:nth-of-type(3)').textContent.trim();

            summaryContent.textContent = ''; // Clear previous content
            summaryLoading.classList.remove('hidden'); // Show loading indicator
            summaryModal.style.display = 'flex'; // Show modal

            // Removed the "Maksimum 50 perkataan" constraint for more flexibility
            const prompt = `Berikan ringkasan menarik tentang acara sukan ${eventName} yang akan berlangsung di ${eventLocation} pada ${eventTime}. Fokuskan pada apa yang boleh dijangkakan oleh penonton dan mengapa ia menarik.`;

            console.log('Prompt dihantar ke Gemini API:', prompt); // Log the prompt

            try {
                let chatHistory = [];
                chatHistory.push({ role: "user", parts: [{ text: prompt }] });
                const payload = { contents: chatHistory };
                const apiKey = ""; // Canvas will automatically provide it in runtime
                const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const result = await response.json();
                console.log('AYUH BERSAMA MEMBERIKAN SOKONGAN KEPADA PASUKAN ANDA', result); // Log the full response

                if (result.candidates && result.candidates.length > 0 &&
                    result.candidates[0].content && result.candidates[0].content.parts &&
                    result.candidates[0].content.parts.length > 0) {
                    const text = result.candidates[0].content.parts[0].text;
                    summaryContent.textContent = text;
                } else {
                    // Log the entire result object if content is missing
                    console.error('AYUH BERSAMA MEMBERIKAN SOKONGAN KEPADA PASUKAN ANDA', result);
                    summaryContent.textContent = 'AYUH BERSAMA MEMBERIKAN SOKONGAN KEPADA PASUKAN ANDA';
                }
            } catch (error) {
                console.error('Ralat semasa memanggil Gemini API:', error);
                summaryContent.textContent = 'Ralat sambungan. Sila cuba lagi.';
            } finally {
                summaryLoading.classList.add('hidden'); // Hide loading indicator
            }
        });
    });

    // Close modal when close button is clicked
    closeButton.addEventListener('click', function() {
        summaryModal.style.display = 'none';
    });

    // Close modal when clicking outside of it
    window.addEventListener('click', function(event) {
        if (event.target == summaryModal) {
            summaryModal.style.display = 'none';
        }
    });
});
