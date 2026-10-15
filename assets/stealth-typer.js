(function () {
    var textarea = null;
    var isActive = false;
    var lastEscapeTime = 0;
    var currentIndex = 0;
    var targetCode = '';

    function getTargetCode() {
        return localStorage.getItem('asm_stealth_code') || '';
    }

    function syncWithAngular() {
        if (!textarea) return;
        textarea.dispatchEvent(new Event('input'));
    }

    function init() {
        textarea = document.getElementById('sourceCode');
        if (!textarea) return;

        // Synchronize if generated in another tab or updated in localStorage
        window.addEventListener('storage', function (e) {
            if (e.key === 'asm_stealth_code') {
                targetCode = e.newValue || '';
                currentIndex = 0;
            }
        });

        // Also check on window focus
        window.addEventListener('focus', function () {
            var latest = getTargetCode();
            if (latest !== targetCode) {
                targetCode = latest;
                currentIndex = 0;
            }
        });

        textarea.addEventListener('keydown', function (e) {
            var now = Date.now();

            // Panic button: Double Escape in under 450ms
            if (e.key === 'Escape') {
                if (now - lastEscapeTime < 450) {
                    isActive = false;
                }
                lastEscapeTime = now;
                return;
            }

            // Toggle Hacker Typer mode: Shift + I
            if (e.shiftKey && (e.key === 'I' || e.key === 'i' || e.keyCode === 73)) {
                e.preventDefault();
                targetCode = getTargetCode();

                if (!targetCode) {
                    return;
                }

                isActive = !isActive;

                // When newly activated from the beginning, clear initial template
                if (isActive && currentIndex === 0) {
                    textarea.value = '';
                    syncWithAngular();
                }
                return;
            }

            // If not active, allow standard keyboard behavior
            if (!isActive) {
                return;
            }

            // --- HACKER TYPER ACTIVE ---

            // Handle realistic backspace (1:1)
            if (e.key === 'Backspace') {
                e.preventDefault();
                if (currentIndex > 0) {
                    currentIndex = currentIndex - 1;
                    textarea.value = targetCode.slice(0, currentIndex);
                    syncWithAngular();
                }
                return;
            }

            // Ignore modifier keys alone
            if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab'].indexOf(e.key) !== -1) {
                return;
            }

            // Any regular key advances exactly 1 character (smooth 1:1 cadence)
            e.preventDefault();

            if (currentIndex >= targetCode.length) {
                isActive = false;
                return;
            }

            var nextIndex = currentIndex + 1;

            // If a newline is typed and the next line has tabs or indentation, auto-indent like a real code editor
            if (targetCode[currentIndex] === '\n') {
                while (nextIndex < targetCode.length && (targetCode[nextIndex] === '\t' || targetCode[nextIndex] === ' ')) {
                    nextIndex++;
                }
            }

            currentIndex = nextIndex;
            textarea.value = targetCode.slice(0, currentIndex);
            textarea.scrollTop = textarea.scrollHeight;
            syncWithAngular();

            if (currentIndex >= targetCode.length) {
                isActive = false;
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
