document.addEventListener('DOMContentLoaded', () => {
    // Element selections
    const jsonFileInput = document.getElementById('jsonFile');
    const jsonFileOverlayInput = document.getElementById('jsonFileOverlay');
    const hadithSelector = document.getElementById('hadithSelector');
    const hadithDisplay = document.getElementById('hadithDisplay');
    const newPropContentInput = document.getElementById('newPropContent');
    const darkModeToggle = document.getElementById('darkModeToggle');
    const darkModeIcon = document.getElementById('darkModeIcon');
    const backToTopBtn = document.getElementById('backToTopBtn');
    const guideBtn = document.getElementById('guideBtn');
    const guideModal = document.getElementById('guideModal');
    const closeGuideModal = document.getElementById('closeGuideModal');
    const fileUploadOverlay = document.getElementById('fileUploadOverlay');
    const mainContainer = document.getElementById('mainContainer');
    const hadithSelectorContainer = document.getElementById('hadithSelectorContainer');
    const progressBarContainer = document.getElementById('progressBarContainer');
    const navButtonsTop = document.getElementById('navButtonsTop');

    let hadiths = [];
    let currentHadithIndex = -1;

    // --- Event Listeners ---
    jsonFileInput.addEventListener('change', handleFileUpload);
    jsonFileOverlayInput.addEventListener('change', handleFileUpload);
    hadithSelector.addEventListener('change', displayHadith);
    darkModeToggle.addEventListener('click', toggleDarkMode);
    guideBtn.addEventListener('click', () => guideModal.style.display = 'flex');
    closeGuideModal.addEventListener('click', () => guideModal.style.display = 'none');
    window.addEventListener('scroll', handleScroll);
    backToTopBtn.addEventListener('click', scrollToTop);

    // --- Functions ---

    function handleFileUpload(event) {
        const file = event.target.files[0];
        if (file && file.type === "application/json") {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    hadiths = JSON.parse(e.target.result);
                    if (!Array.isArray(hadiths)) throw new Error("JSON is not an array.");
                    populateHadithSelector();
                    fileUploadOverlay.classList.add('hidden');
                    mainContainer.classList.remove('disabled-ui');
                    hadithSelectorContainer.style.display = 'flex';
                    progressBarContainer.style.display = 'block';
                    navButtonsTop.style.display = 'flex';
                    showToast('موفقیت', 'فایل با موفقیت بارگذاری شد.', 'success');
                } catch (error) {
                    showToast('خطا', `فایل JSON نامعتبر است: ${error.message}`, 'error');
                }
            };
            reader.readAsText(file);
        }
    }

    function populateHadithSelector() {
        hadithSelector.innerHTML = '';
        hadiths.forEach((hadith, index) => {
            const option = document.createElement('option');
            option.value = index;
            // Find a suitable title, fallback to first few words
            const title = hadith.hadith_text.split(' ').slice(0, 5).join(' ') + '...';
            option.textContent = `حدیث ${index + 1}: ${title}`;
            hadithSelector.appendChild(option);
        });
        currentHadithIndex = 0;
        displayHadith();
    }

    function displayHadith() {
        currentHadithIndex = parseInt(hadithSelector.value);
        if (currentHadithIndex >= 0 && currentHadithIndex < hadiths.length) {
            const hadith = hadiths[currentHadithIndex];
            hadithDisplay.innerHTML = `
                <div class="hadith-content">
                    <p>${hadith.hadith_text}</p>
                    <p class="hadith-arabic">${hadith.hadith_arabic || ''}</p>
                </div>
                <div id="propositionsContainer"></div>
                <div id="relationsContainer"></div>
                <div id="graphContainer" style="height: 400px; border: 1px solid var(--border-color); border-radius: 8px; margin-top: 1rem;"></div>
            `;
            renderPropositions();
            renderRelations();
            renderGraph();
            updateHadithCounter();
            updateProgressBar();
        }
    }

    function renderPropositions() { /* ... implementation needed ... */ }
    function renderRelations() { /* ... implementation needed ... */ }
    function renderGraph() { /* ... implementation needed ... */ }

    window.addProposition = function() {
        const content = newPropContentInput.value.trim();
        if (!content) {
            showToast('هشدار', 'لطفاً محتوای گزاره را وارد کنید.', 'warning');
            return;
        }
        // Logic to add proposition to the current hadith
        newPropContentInput.value = '';
        showToast('موفقیت', 'گزاره جدید با موفقیت اضافه شد.', 'success');
        // Re-render
        renderPropositions();
        renderGraph();
    }

    window.navigateHadith = function(direction) {
        let newIndex = currentHadithIndex + direction;
        if (newIndex >= 0 && newIndex < hadiths.length) {
            currentHadithIndex = newIndex;
            hadithSelector.value = currentHadithIndex;
            displayHadith();
        }
    }

    function updateHadithCounter() {
        const counter = document.getElementById('hadithCounter');
        if (counter) {
            counter.textContent = `(${currentHadithIndex + 1} از ${hadiths.length})`;
        }
    }

    function updateProgressBar() {
        const progressBar = document.getElementById('progressBar');
        if (progressBar) {
            const progress = hadiths.length > 0 ? ((currentHadithIndex + 1) / hadiths.length) * 100 : 0;
            progressBar.style.width = `${progress}%`;
        }
    }

    function toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        darkModeIcon.textContent = isDarkMode ? '☀️' : '🌙';
        localStorage.setItem('darkMode', isDarkMode);
        // Re-render graph for dark mode
        renderGraph();
    }

    // Check for saved dark mode preference
    if (localStorage.getItem('darkMode') === 'true') {
        toggleDarkMode();
    }

    function handleScroll() {
        if (window.scrollY > 300) {
            backToTopBtn.style.display = 'block';
        } else {
            backToTopBtn.style.display = 'none';
        }
    }

    function scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    window.showToast = function(title, message, type = 'info') {
        const container = document.getElementById('toastContainer') || createToastContainer();
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };

        toast.innerHTML = `
            <div class="toast-icon">${icons[type]}</div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
        `;

        container.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 100); // Animate in

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300); // Remove from DOM after animation
        }, 5000);
    }

    function createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toastContainer';
        document.body.appendChild(container);
        return container;
    }

    // Initial state setup
    mainContainer.classList.add('disabled-ui');
    hadithSelectorContainer.style.display = 'none';
    progressBarContainer.style.display = 'none';
    navButtonsTop.style.display = 'none';
});