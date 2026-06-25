async function checkSaleStatus() {
    const banner = document.getElementById('saleBanner');
    const textContainer = document.getElementById('saleTextContainer');
    const nav = document.getElementById('mainNav');

    try {
        // Fetch the local JSON configuration file
        // To avoid browser caching older results, we append a timestamp
        const response = await fetch(`./sale-status.json?t=${Date.now()}`);
        if (!response.ok) return;

        const data = await response.json();

        if (data.showSale) {
            // Apply text and make elements visible
            textContainer.innerHTML = data.saleText;
            banner.style.display = 'flex';
            if (nav) nav.style.top = '40px'; 
        } else {
            banner.style.display = 'none';
            if (nav) nav.style.top = '0px';
        }
    } catch (error) {
        console.error("Error reading sale configuration:", error);
    }
}

// Run the configuration check on page load
window.addEventListener('DOMContentLoaded', checkSaleStatus);