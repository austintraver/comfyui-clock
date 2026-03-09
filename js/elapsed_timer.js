import { app } from "../../scripts/app.js";
import { api } from "../../scripts/api.js";

app.registerExtension({
    name: "ElapsedTimer",

    async setup() {
        let startTime = null;
        let intervalId = null;
        let resetTimeoutId = null;

        // --- Create the timer element ---
        const timerEl = document.createElement("div");
        timerEl.id = "comfy-elapsed-timer";
        timerEl.textContent = "⏱ 0:00";
        Object.assign(timerEl.style, {
            padding: "0.5rem",
            fontSize: "0.75rem",
            fontFamily: "monospace",
            color: "#aaa",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "2rem",
            width: "6rem",
            boxSizing: "border-box",
            flexShrink: "0",
            opacity: "1",
            transition: "color 0.3s",
            whiteSpace: "nowrap",
            border: "1px solid var(--border-subtle)",
            borderRadius: "0.5rem",
        });

        // --- One-time placement ---
        // Target the "Toggle properties panel" button (rightmost), then step
        // left one sibling to land between the "X" cancel and "0 active" buttons.
        // Also copies the border style directly from .queue-button-group so it
        // always matches the adjacent button group regardless of theme.
        function inject() {
            const panelBtn = document.querySelector('button:has(.icon-\\[lucide--panel-right\\])');
            if (panelBtn) {
                const anchor = panelBtn.previousElementSibling ?? panelBtn;
                anchor.before(timerEl);

                const qbg = document.querySelector('.queue-button-group');
                if (qbg) {
                    const cs = getComputedStyle(qbg);
                    timerEl.style.border = cs.border;
                    timerEl.style.borderRadius = cs.borderRadius;
                    timerEl.style.height = cs.height;
                }

                timerEl.style.fontSize = getComputedStyle(anchor).fontSize;

                return true;
            }
            return false;
        }

        if (!inject()) {
            const observer = new MutationObserver(() => {
                if (inject()) observer.disconnect();
            });
            observer.observe(document.body, { childList: true, subtree: true });
        }

        // --- Timer helpers ---
        function formatElapsed(ms) {
            const totalSec = Math.floor(ms / 1000);
            const m = Math.floor(totalSec / 60);
            const s = totalSec % 60;
            return `⏱ ${m}:${s.toString().padStart(2, "0")}`;
        }

        function resetTimer() {
            timerEl.textContent = "⏱ 0:00";
            timerEl.style.color = "#aaa";
        }

        function startTimer() {
            if (resetTimeoutId) {
                clearTimeout(resetTimeoutId);
                resetTimeoutId = null;
            }
            startTime = Date.now();
            timerEl.style.color = "#aaa";
            if (intervalId) clearInterval(intervalId);
            intervalId = setInterval(() => {
                timerEl.textContent = formatElapsed(Date.now() - startTime);
            }, 500);
        }

        function stopTimer(success) {
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
            }
            if (startTime === null) return;
            const elapsed = formatElapsed(Date.now() - startTime);
            startTime = null;
            timerEl.textContent = success ? `${elapsed} ✓` : `${elapsed} ✗`;
            timerEl.style.color = success ? "#4caf50" : "#f44336";
            resetTimeoutId = setTimeout(resetTimer, 10000);
        }

        // --- Hook into ComfyUI API events ---
        api.addEventListener("execution_start", () => startTimer());
        api.addEventListener("execution_success", () => stopTimer(true));
        api.addEventListener("execution_error", () => stopTimer(false));
        api.addEventListener("execution_interrupted", () => stopTimer(false));

        // Fallback: also watch queue status going to 0
        api.addEventListener("status", ({ detail }) => {
            if (detail?.status?.exec_info?.queue_remaining === 0 && intervalId) {
                stopTimer(true);
            }
        });
    },
});
