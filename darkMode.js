const DarkMode = (function () {
    const DARK_MODE_KEY = 'darkMode';
    const toggleButton = document.getElementById('darkModeToggle');

    function applyDarkMode(isDarkMode) {
        document.body.classList.toggle('dark-mode', isDarkMode);
        if (toggleButton) {
            toggleButton.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        }
        document.dispatchEvent(new Event('darkModeChange'));
    }

    function toggleDarkMode() {
        const isDarkMode = !document.body.classList.contains('dark-mode');
        localStorage.setItem(DARK_MODE_KEY, isDarkMode);
        applyDarkMode(isDarkMode);
    }

    function initialize() {
        const savedDarkMode = localStorage.getItem(DARK_MODE_KEY) === 'true';
        applyDarkMode(savedDarkMode);
        if (toggleButton) {
            toggleButton.addEventListener('click', toggleDarkMode);
        }
    }

    document.addEventListener('DOMContentLoaded', initialize);

    return { applyDarkMode, toggleDarkMode };
})();