const fontsPerPage = 150; // Anzahl der Schriftarten pro Seite
const DEBUG_MODE = false; // Setze auf false, um Debug-Ausgaben zu deaktivieren
let currentPage = 1;
let fontsData = [];
let sampleText = 'John Doe'; // Default-Wert
let currentFont = 'Roboto'; // Default-Schriftart

// Funktion zum Abrufen der Google Fonts API
async function scrapeGoogleFonts() {
    try {
        const apiUrl = 'https://www.googleapis.com/webfonts/v1/webfonts?sort=alpha&key=AIzaSyAoTCtVcdxmJz4LEL3G6MHVtN9FGDKiwyk';
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data && data.items) {
            fontsData = data.items;
            populateFontDropdown(fontsData);
            renderFonts(currentPage, sampleText);
            setupPagination(fontsData.length, fontsPerPage);
            loadFonts(fontsData); // Lade Schriftarten einzeln
        } else {
            console.error('Fehler beim Abrufen der Schriftarten');
        }
    } catch (error) {
        console.error('Ein Fehler ist aufgetreten:', error);
    } finally {
        removeLoadingScreen(); // Stelle sicher, dass der Ladescreen entfernt wird, auch bei Fehlern
    }
}

// Funktion zum Befüllen des Dropdowns mit Schriftarten
function populateFontDropdown(fonts) {
    const fontSelect = document.getElementById('fontSelect');
    fontSelect.innerHTML = ''; // Dropdown leeren

    fonts.forEach((font, index) => {
        const option = document.createElement('option');
        option.value = font.family;
        option.textContent = font.family;
        if (index === 0) { // Setze den ersten Wert als ausgewählt
            option.selected = true;
            currentFont = font.family; // Setze den aktuellen Wert
        }
        fontSelect.appendChild(option);
    });

    // Sicherstellen, dass der erste Wert korrekt im Rectangle angezeigt wird
    const rectangle = document.getElementById('fontRectangle');
    if (rectangle) {
        rectangle.style.fontFamily = currentFont;
        rectangle.querySelector('#rectangleText').textContent = sampleText;
    }
}

// Funktion zum Laden von Schriftarten einzeln
function loadFonts(fonts) {
    // Entfernen aller bisherigen Schriftarten-Links
    const existingLinks = document.querySelectorAll('link[href^="https://fonts.googleapis.com/css2"]');
    existingLinks.forEach(link => link.remove());

    fonts.forEach(font => {
        const fontLink = document.createElement('link');
        fontLink.href = `https://fonts.googleapis.com/css2?family=${font.family.replace(/ /g, '+')}&display=swap`;
        fontLink.rel = 'stylesheet';
        document.head.appendChild(fontLink);

        if (DEBUG_MODE) {
            console.log(`Lade Schriftart: ${fontLink.href}`);
        }
    });
}

// Funktion zum Abrufen des aktuellen Beispieltextes
function updateSampleText() {
    const sampleTextInput = document.getElementById('sampleTextInput');
    return sampleTextInput ? sampleTextInput.value || 'John Doe' : 'John Doe';
}

// Funktion zum Rendern der Schriftarten im Gitterlayout
function renderFonts(page, text) {
    const container = document.getElementById('fontsContainer');
    container.innerHTML = ''; // Container leeren

    // Bestimmen, welche Schriftarten angezeigt werden sollen
    const start = (page - 1) * fontsPerPage;
    const end = start + fontsPerPage;
    const fontsToShow = fontsData.slice(start, end);

    fontsToShow.forEach(font => {
        // Erstellen des Card-Elements
        const card = document.createElement('div');
        card.className = 'col-md-4 mb-4';
        
        // Erstellen des Links, um das Klicken korrekt zu handhaben
        const cardLink = document.createElement('a');
        cardLink.href = '#'; // Setze eine Dummy-URL, um das Klicken zu ermöglichen
        cardLink.className = 'font-card-link'; // Füge eine Klasse für mögliche zukünftige Styles hinzu
        cardLink.setAttribute('data-font-family', font.family); // Setze das data-Attribut
        
        const cardInner = `
            <div class="card" style="cursor: pointer;">
                <div class="card-body">
                    <p class="card-text" style="font-family: ${font.family}">
                        ${text}
                    </p>
                </div>
            </div>
        `;
        cardLink.innerHTML = cardInner;
        card.appendChild(cardLink); // Füge den Link zum Card-Element hinzu
        container.appendChild(card); // Füge die Karte dem Container hinzu
    });

    // Nach dem Rendern automatisch nach oben scrollen
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Aktualisieren des Rectangle-Textes mit der aktuellen Schriftart und Text
    const rectangle = document.getElementById('fontRectangle');
    if (rectangle) {
        rectangle.style.fontFamily = currentFont;
        rectangle.querySelector('#rectangleText').textContent = text;
    }

    // Event Listener für die Klicks auf die Karten hinzufügen
    container.querySelectorAll('.font-card-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); // Verhindere die Standard-Links-Aktion

            const fontFamily = link.getAttribute('data-font-family');
            console.log(`Karte geklickt mit data-font-family: ${fontFamily}`); // Debug-Ausgabe

            // Überprüfen, ob das `fontSelect`-Element existiert
            const fontSelect = document.getElementById('fontSelect');
            if (fontSelect) {
                const foundOption = Array.from(fontSelect.options).find(option => option.value === fontFamily);
                if (foundOption) {
                    fontSelect.value = fontFamily; // Setze den Wert des select-Feldes auf die ausgewählte Schriftart
                    console.log(`Select value gesetzt auf: ${fontSelect.value}`);
                } else {
                    console.error(`Schriftart ${fontFamily} nicht im Dropdown gefunden.`);
                }
            }

            // Aktualisiere die Vorschau im Rechteck
            const rectangle = document.getElementById('fontRectangle');
            if (rectangle) {
                rectangle.style.fontFamily = fontFamily; // Setze die ausgewählte Schriftart
                rectangle.querySelector('#rectangleText').textContent = updateSampleText(); // Aktualisiere den Text
            }

            currentFont = fontFamily; // Setze die aktuelle Schriftart global
            
            // Optionale Konsolenlog-Ausgabe zur Überprüfung
            console.log(`Selected font: ${fontFamily}`);
        });
    });
}
// Funktion zur Erstellung der Pagination
function setupPagination(totalItems, itemsPerPage) {
    const pagination = document.getElementById('pagination');
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    pagination.innerHTML = ''; // Pagination leeren

    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement('li');
        li.className = 'page-item' + (i === currentPage ? ' active' : '');
        const a = document.createElement('a');
        a.className = 'page-link';
        a.href = '#';
        a.textContent = i;
        a.addEventListener('click', function (e) {
            e.preventDefault();
            currentPage = i;
            const updatedSampleText = updateSampleText();
            renderFonts(currentPage, updatedSampleText);
            setupPagination(totalItems, itemsPerPage);
        });
        li.appendChild(a);
        pagination.appendChild(li);
    }
}

// Event Listener für den Beispieltext
document.addEventListener('DOMContentLoaded', () => {
    // Funktion zum Umschalten des Modus
    function toggleMode() {
        const currentMode = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
        const newMode = currentMode === 'light' ? 'dark' : 'light';

        // Modus ändern
        document.body.classList.remove(`${currentMode}-mode`);
        document.body.classList.add(`${newMode}-mode`);

        // Modus im Local Storage speichern
        localStorage.setItem('theme', newMode);

        // Modus-Text aktualisieren
        const modeText = document.getElementById('modeText');
        if (modeText) {
            modeText.textContent = newMode === 'light' ? 'Light Mode' : 'Dark Mode';
        }
    }

    // Event Listener für den Mode Toggle Button
    const modeToggle = document.getElementById('modeToggle');
    if (modeToggle) {
        modeToggle.addEventListener('click', toggleMode);
    }

    // Event Listener für das Eingabefeld
    const sampleTextInput = document.getElementById('sampleTextInput');
    if (sampleTextInput) {
        sampleTextInput.addEventListener('input', () => {
            sampleText = updateSampleText(); // Update global sampleText variable
            const rectangleText = document.getElementById('rectangleText');
            if (rectangleText) {
                rectangleText.textContent = sampleText;
            }
            renderFonts(currentPage, sampleText); // Aktualisiere die Schriftvorschau, wenn der Text sich ändert
        });
    }

    // Event Listener für das Schriftarten-Dropdown
    const fontSelect = document.getElementById('fontSelect');
    if (fontSelect) {
        fontSelect.addEventListener('change', (event) => {
            currentFont = event.target.value; // Die aktuell ausgewählte Schriftart speichern
            const updatedSampleText = updateSampleText();
            const rectangleText = document.getElementById('rectangleText');
            if (rectangleText) {
                rectangleText.textContent = updatedSampleText;
            }
            renderFonts(currentPage, updatedSampleText); // Aktualisiere die Schriftvorschau mit der neuen Schriftart
        });
    }

    // Beim Laden der Seite den gespeicherten Modus anwenden
    const savedMode = localStorage.getItem('theme') || 'light';
    document.body.classList.add(`${savedMode}-mode`);
    
    // Modus-Text beim Laden der Seite initialisieren
    const modeText = document.getElementById('modeText');
    if (modeText) {
        modeText.textContent = savedMode === 'light' ? 'Light Mode' : 'Dark Mode';
    }
    
    // Initiales Rendern mit dem Standard-Beispieltext
    renderFonts(currentPage, sampleText);
});

function removeLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.style.display = 'none';
    }
}

function saveAsSVG() {
    // Holen des aktuellen Textes und der Schriftart
    const rectangle = document.getElementById('fontRectangle');
    const text = rectangle.querySelector('#rectangleText').textContent;
    const fontFamily = rectangle.style.fontFamily.replace(/"/g, ''); // Entfernen von Anführungszeichen

    // Holen der URL für die Google Fonts CSS
    const fontUrl = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/ /g, '+')}&display=swap`;

    // SVG-Inhalt mit Verknüpfung zur Schriftart
    const svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" width="600" height="200">
            <style>
                @import url('${fontUrl}');
                text {
                    font-family: '${fontFamily}';
                    font-size: 40px;
                    fill: black;
                }
            </style>
            <text x="10" y="50">${text}</text>
        </svg>
    `;

    // Erstellen des Blob-Objekts und der URL
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    // Erstellen eines Links, um die Datei herunterzuladen
    const link = document.createElement('a');
    link.href = url;
    link.download = 'font-preview.svg'; // Name der heruntergeladenen Datei
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Aufräumen der URL
    URL.revokeObjectURL(url);
}

// Beispiel: Füge einen Button hinzu, um die SVG-Datei zu speichern
document.getElementById('saveSVGButton').addEventListener('click', saveAsSVG);


// Initiales Laden der Schriftarten
scrapeGoogleFonts();