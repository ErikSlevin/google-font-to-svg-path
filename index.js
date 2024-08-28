async function scrapeGoogleFonts() {
    try {
        const apiUrl = 'https://www.googleapis.com/webfonts/v1/webfonts?sort=alpha&key=AIzaSyAoTCtVcdxmJz4LEL3G6MHVtN9FGDKiwyk';
        const response = await fetch(apiUrl);
        const data = await response.json();
    } catch (error) {
        console.error('Ein Fehler ist aufgetreten:', error);
    }
}
scrapeGoogleFonts();
