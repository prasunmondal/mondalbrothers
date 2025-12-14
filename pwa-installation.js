// ------------------------------
// GLOBALS
// ------------------------------
let deferredPrompt = null;

// ------------------------------
// Detect installation mode
// ------------------------------
function isPwaInstalled() {
    return (
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true || // iOS
        localStorage.getItem("pwaInstalled") === "yes"
    );
}

// ------------------------------
// Hide or show install button
// ------------------------------
function updateInstallButton() {
    const installBtn = document.getElementById("installBtn");
    if (!installBtn) return; // No button on this page

    if (isPwaInstalled()) {
        installBtn.style.display = "none";
    }
}

// ------------------------------
// Handle beforeinstallprompt
// ------------------------------
window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;

    const installBtn = document.getElementById("installBtn");
    if (!installBtn) return;

    if (!isPwaInstalled()) {
        installBtn.style.display = "block";
    }
});

// ------------------------------
// Handle user clicking install button
// ------------------------------
async function installPwa() {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;

    if (result.outcome === "accepted") {
        localStorage.setItem("pwaInstalled", "yes");
    }
    deferredPrompt = null;

    updateInstallButton();
}

// ------------------------------
// Handle install event
// ------------------------------
window.addEventListener("appinstalled", () => {
    localStorage.setItem("pwaInstalled", "yes");
    updateInstallButton();
});

// ------------------------------
// Initialize on page load
// ------------------------------
window.addEventListener("DOMContentLoaded", () => {
    updateInstallButton();
});
