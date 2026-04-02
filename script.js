function openNav() {
    document.getElementById("sideNav").style.width = "300px";
}

function closeNav() {
    document.getElementById("sideNav").style.width = "0";
}



/* ===== DARK MODE ===== */
const toggle = document.getElementById("themeToggle");

if (toggle) {
    toggle.onclick = () => {
        document.body.classList.toggle("dark");
        toggle.textContent =
            document.body.classList.contains("dark") ? "☀️" : "🌙";
        localStorage.setItem(
            "theme",
            document.body.classList.contains("dark") ? "dark" : "light"
        );
    };

    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark");
        toggle.textContent = "☀️";
    }
}


/* ===== EMOJI REACTION STYLES (injected once) ===== */
(function injectEmojiStyles() {
    if (document.getElementById('emojiReactionStyles')) return;
    const s = document.createElement('style');
    s.id = 'emojiReactionStyles';
    s.textContent = `
        .emoji-reaction {
            display: flex;
            align-items: center;
            gap: 10px;
            margin: 6px 0 12px;
            padding: 10px 16px;
            border-radius: 10px;
            background: rgba(94, 139, 126, 0.07);
            border-left: 4px solid var(--primary, #5e8b7e);
            opacity: 0;
            transform: translateY(-6px);
            transition: opacity 0.35s ease, transform 0.35s ease;
            pointer-events: none;
        }
        .emoji-reaction.show {
            opacity: 1;
            transform: translateY(0);
            pointer-events: auto;
        }
        .emoji-reaction .er-emoji {
            font-size: 28px;
            line-height: 1;
            flex-shrink: 0;
        }
        .emoji-reaction .er-msg {
            font-size: 14px;
            font-weight: 600;
            color: var(--text, #2c3e50);
        }
    `;
    document.head.appendChild(s);
})();


/* ========= STAR RATING (FIXED & ANIMATED) ========= */
document.querySelectorAll(".stars").forEach(starBox => {
    let selectedRating = 0;

    for (let i = 1; i <= 5; i++) {
        const star = document.createElement("span");
        star.innerHTML = "★";
        star.style.fontSize = "32px";
        star.style.cursor = "pointer";
        star.style.color = "#ddd";
        star.style.transition = "all 0.2s ease";
        star.style.display = "inline-block";

        star.onmouseover = () => {
            highlightStars(i);
        };

        star.onmouseout = () => {
            highlightStars(selectedRating);
        };

        star.onclick = () => {
            selectedRating = i;
            starBox.setAttribute('data-rating', i);
            highlightStars(i);
            // Clear any error message
            const errorEl = starBox.nextElementSibling;
            if (errorEl && errorEl.classList.contains('error')) {
                errorEl.textContent = "";
            }
            // Update emoji reaction for this star widget
            updateEmojiReaction(i, reactionEl);
            // Trigger bounce animation on clicked star
            star.classList.remove('star-pop');
            void star.offsetWidth; // force reflow so animation replays
            star.classList.add('star-pop');
            setTimeout(() => star.classList.remove('star-pop'), 300);
        };

        starBox.appendChild(star);
    }

    function highlightStars(n) {
        [...starBox.children].forEach((s, i) => {
            if (i < n) {
                s.style.color = "gold";
                s.style.transform = "scale(1.15)";
            } else {
                s.style.color = "#ddd";
                s.style.transform = "scale(1)";
            }
        });
    }

    // Inject the emoji reaction container after the error <small> that follows .stars
    const errorSmall = starBox.nextElementSibling;
    const reactionEl = document.createElement('div');
    reactionEl.className = 'emoji-reaction';
    reactionEl.innerHTML = '<span class="er-emoji"></span><span class="er-msg"></span>';
    if (errorSmall && errorSmall.tagName === 'SMALL') {
        errorSmall.insertAdjacentElement('afterend', reactionEl);
    } else {
        starBox.insertAdjacentElement('afterend', reactionEl);
    }
});


/* ========= EMOJI REACTION FUNCTION ========= */

const EMOJI_REACTIONS = {
    5: { emoji: '😍', msg: "We’re glad you loved it!" },
    4: { emoji: '😊', msg: "Thanks! We’re happy you liked it!" },
    3: { emoji: '🙂', msg: "Thanks! We’ll try to improve." },
    2: { emoji: '😕', msg: "We’re sorry, tell us what went wrong." },
    1: { emoji: '😔', msg: "We’re really sorry! Your feedback matters." }
};

function updateEmojiReaction(rating, container) {
    const reaction = EMOJI_REACTIONS[rating];
    if (!reaction || !container) return;
    container.querySelector('.er-emoji').textContent = reaction.emoji;
    container.querySelector('.er-msg').textContent = reaction.msg;
    // Trigger animation: remove then re-add .show on next frame
    container.classList.remove('show');
    requestAnimationFrame(() => {
        requestAnimationFrame(() => container.classList.add('show'));
    });
}

/* =========================================== */

/* ========= FORM VALIDATION + SAVE ========= */
document.querySelectorAll(".feedback-form").forEach(form => {
    // Disable HTML5 validation to use custom validation
    form.setAttribute('novalidate', 'novalidate');

    // ── Timer Logic: Start on first interaction ──
    let startTime = null;
    const startTimer = () => {
        if (!startTime) startTime = Date.now();
    };
    form.addEventListener('input', startTimer);
    form.addEventListener('focusin', startTimer);

    // Add real-time validation on email input
    form.querySelectorAll("input[type='email']").forEach(emailInput => {
        emailInput.addEventListener('blur', function () {
            const error = this.nextElementSibling;
            if (this.value.trim() && error && error.classList.contains('error')) {
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailPattern.test(this.value.trim())) {
                    error.textContent = "Please enter a valid email address (e.g., example@email.com)";
                    this.style.borderColor = "#e74c3c";
                } else {
                    error.textContent = "";
                    this.style.borderColor = "#e0e0e0";
                }
            }
        });

        emailInput.addEventListener('input', function () {
            const error = this.nextElementSibling;
            if (error && error.textContent) {
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (emailPattern.test(this.value.trim())) {
                    error.textContent = "";
                    this.style.borderColor = "#e0e0e0";
                }
            }
        });
    });

    form.onsubmit = e => {
        e.preventDefault();

        // Clear all errors
        form.querySelectorAll(".error").forEach(err => {
            err.textContent = "";
        });
        form.querySelectorAll("input, select, textarea").forEach(el => {
            el.style.borderColor = "#e0e0e0";
        });
        form.querySelectorAll(".option-group").forEach(group => {
            group.style.borderLeft = "none";
            group.style.paddingLeft = "0";
        });

        const data = {
            type: form.dataset.type,
            date: new Date().toLocaleString()
        };

        // Get form fields by name attribute in order
        const nameInput = form.querySelector('input[name="name"]');
        const emailInput = form.querySelector('input[name="email"]');

        // Validate Name (always first)
        if (nameInput) {
            if (nameInput.value.trim() === "") {
                const error = nameInput.nextElementSibling;
                if (error && error.classList.contains('error')) {
                    error.textContent = "Please enter your name";
                    nameInput.style.borderColor = "#e74c3c";
                }
                nameInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setTimeout(() => nameInput.focus(), 500);
                return false;
            }
            data.name = nameInput.value.trim();
        }

        // Validate Email (always second)
        if (emailInput) {
            if (emailInput.value.trim() === "") {
                const error = emailInput.nextElementSibling;
                if (error && error.classList.contains('error')) {
                    error.textContent = "Please enter your email address";
                    emailInput.style.borderColor = "#e74c3c";
                }
                emailInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setTimeout(() => emailInput.focus(), 500);
                return false;
            }

            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(emailInput.value.trim())) {
                const error = emailInput.nextElementSibling;
                if (error && error.classList.contains('error')) {
                    error.textContent = "Please enter a valid email address (e.g., example@email.com)";
                    emailInput.style.borderColor = "#e74c3c";
                }
                emailInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setTimeout(() => emailInput.focus(), 500);
                return false;
            }
            data.email = emailInput.value.trim();
        }

        // Validate all other text inputs (in order)
        const textInputs = form.querySelectorAll('input[type="text"]:not([name="name"])');
        for (let i = 0; i < textInputs.length; i++) {
            const input = textInputs[i];
            if (input.value.trim() === "") {
                const error = input.nextElementSibling;
                if (error && error.classList.contains('error')) {
                    error.textContent = "Please fill in this field";
                    input.style.borderColor = "#e74c3c";
                }
                input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setTimeout(() => input.focus(), 500);
                return false;
            }
            if (input.name) {
                data[input.name] = input.value.trim();
            }
        }

        // Validate all select dropdowns (in order)
        const selects = form.querySelectorAll('select');
        for (let i = 0; i < selects.length; i++) {
            const select = selects[i];
            if (select.value === "" || !select.value) {
                const error = select.nextElementSibling;
                if (error && error.classList.contains('error')) {
                    error.textContent = "Please select an option from the dropdown";
                    select.style.borderColor = "#e74c3c";
                }
                select.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setTimeout(() => select.focus(), 500);
                return false;
            }
            if (select.name) {
                data[select.name] = select.value;
            }
        }

        // Validate all radio button groups (in order)
        const radioGroups = {};
        form.querySelectorAll('input[type="radio"]').forEach(radio => {
            if (!radioGroups[radio.name]) {
                radioGroups[radio.name] = {
                    radios: [],
                    optionGroup: radio.closest('.option-group')
                };
            }
            radioGroups[radio.name].radios.push(radio);
        });

        for (let groupName in radioGroups) {
            const group = radioGroups[groupName];
            const checked = group.radios.some(r => r.checked);

            if (!checked) {
                const optionGroup = group.optionGroup;
                const error = optionGroup ? optionGroup.nextElementSibling : null;

                if (error && error.classList.contains('error')) {
                    error.textContent = "Please select an option";
                }
                if (optionGroup) {
                    optionGroup.style.borderLeft = "3px solid #e74c3c";
                    optionGroup.style.paddingLeft = "10px";
                    optionGroup.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                return false;
            }

            const selected = group.radios.find(r => r.checked);
            if (selected) {
                data[groupName] = selected.value;
            }
        }

        // Validate all checkbox groups (in order) - NOW REQUIRED
        const checkboxGroups = {};
        form.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            if (checkbox.name) {
                if (!checkboxGroups[checkbox.name]) {
                    checkboxGroups[checkbox.name] = {
                        checkboxes: [],
                        optionGroup: checkbox.closest('.option-group')
                    };
                }
                checkboxGroups[checkbox.name].checkboxes.push(checkbox);
            }
        });

        for (let groupName in checkboxGroups) {
            const group = checkboxGroups[groupName];
            const checked = group.checkboxes.some(cb => cb.checked);

            if (!checked) {
                const optionGroup = group.optionGroup;
                const error = optionGroup ? optionGroup.nextElementSibling : null;

                if (error && error.classList.contains('error')) {
                    error.textContent = "Please select at least one option";
                }
                if (optionGroup) {
                    optionGroup.style.borderLeft = "3px solid #e74c3c";
                    optionGroup.style.paddingLeft = "10px";
                    optionGroup.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                return false;
            }

            const selected = group.checkboxes.filter(cb => cb.checked);
            if (selected.length > 0) {
                data[groupName] = selected.map(cb => cb.value).join(', ');
            }
        }

        // Validate star rating
        const starBox = form.querySelector(".stars");
        if (starBox) {
            const rating = starBox.getAttribute('data-rating');
            const error = starBox.nextElementSibling;

            if (!rating || rating === "0") {
                if (error && error.classList.contains('error')) {
                    error.textContent = "Please select a rating";
                }
                starBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
                return false;
            }
            data.rating = rating;
        }

        // Validate all textareas (in order)
        const textareas = form.querySelectorAll('textarea');
        for (let i = 0; i < textareas.length; i++) {
            const textarea = textareas[i];
            if (textarea.value.trim() === "") {
                const error = textarea.nextElementSibling;
                if (error && error.classList.contains('error')) {
                    error.textContent = "Please fill in this field";
                    textarea.style.borderColor = "#e74c3c";
                }
                textarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setTimeout(() => textarea.focus(), 500);
                return false;
            }
            if (textarea.name) {
                data[textarea.name] = textarea.value.trim();
            }
        }

        // All validation passed — run sentiment analysis then save
        form.querySelector('button[type="submit"]').disabled = true;

        // Collect all textarea text for sentiment analysis
        const textForSentiment = [...form.querySelectorAll('textarea')]
            .map(t => t.value.trim()).join(' ');

        getSentimentHybrid(textForSentiment).then(sentiment => {
            data.sentiment = sentiment;

            // Save to localStorage
            const all = JSON.parse(localStorage.getItem("feedbacks")) || [];
            all.push(data);
            localStorage.setItem("feedbacks", JSON.stringify(all));

            // Store last submission for user PDF download
            lastSubmittedFeedback = data;

            // ── Timer Logic: Calculate time taken ──
            let timeMessage = "";
            if (startTime) {
                const timeTakenSec = Math.max(1, Math.floor((Date.now() - startTime) / 1000));
                const timeStr = timeTakenSec < 60
                    ? `${timeTakenSec} seconds`
                    : `${Math.floor(timeTakenSec / 60)} min ${timeTakenSec % 60} sec`;
                timeMessage = `You completed this in ${timeStr}!`;
                startTime = null; // Reset for next submission
            }

            // Show personalised thank-you toast with optional time tracking message
            showThankYouMessage(data.name, timeMessage);

            // Show download button near the submit button
            showDownloadButton(data, form);

            // Reset form
            form.reset();

            // Reset star rating
            if (starBox) {
                starBox.setAttribute('data-rating', '0');
                [...starBox.children].forEach(star => {
                    star.style.color = "#ddd";
                    star.style.transform = "scale(1)";
                });
            }

            // Reset emoji reaction containers
            form.querySelectorAll('.emoji-reaction').forEach(el => {
                el.classList.remove('show');
            });

            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });

            form.querySelector('button[type="submit"]').disabled = false;
        });

        return false;
    };
});

/* ===== USER PDF DOWNLOAD ===== */

// Holds the most recently submitted feedback for PDF generation
let lastSubmittedFeedback = null;

// Lazy-load jsPDF from CDN if not already present, then run callback
function loadJsPDF(callback) {
    if (window.jspdf) { callback(); return; }
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    s.onload = callback;
    s.onerror = () => console.warn('[PDF] Failed to load jsPDF CDN');
    document.head.appendChild(s);
}

function generateUserPDF(feedback) {
    loadJsPDF(() => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const margin = 18;
        const pageW = doc.internal.pageSize.getWidth();
        const maxW = pageW - margin * 2;
        const lineH = 8;
        let y = 24;

        // Field label map (reuse same set as admin dashboard)
        const fieldLabels = {
            serviceType: 'Service Type', staffBehaviour: 'Staff Behaviour',
            suggestions: 'Suggestions', productQuality: 'Product Quality',
            features: 'Features Used', comments: 'Comments',
            courseName: 'Course Name', instructorName: 'Instructor Name',
            difficultyLevel: 'Difficulty Level', contentQuality: 'Content Quality',
            feedback: 'Feedback', eventName: 'Event Name',
            eventType: 'Event Type', organization: 'Organization Quality',
            section: 'Website Section', ease: 'Ease of Use'
        };

        // Helper: add a line, create new page if needed
        function addLine(text, isBold) {
            if (y + lineH > doc.internal.pageSize.getHeight() - 20) {
                doc.addPage(); y = 20;
            }
            if (isBold) doc.setFont('helvetica', 'bold');
            else doc.setFont('helvetica', 'normal');
            doc.text(text, margin, y);
            y += lineH;
        }

        // Helper: wrapped text block (for long textarea values)
        function addWrapped(label, value) {
            if (!value) return;
            const lines = doc.splitTextToSize(`${label}: ${value}`, maxW);
            lines.forEach((ln, idx) => addLine(ln, idx === 0));
            y += 2;
        }

        // ── Title ──
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('Your Feedback Submission', pageW / 2, y, { align: 'center' });
        y += 12;

        // ── Divider ──
        doc.setDrawColor(74, 99, 243);
        doc.setLineWidth(0.8);
        doc.line(margin, y, pageW - margin, y);
        y += 10;

        // ── Core fields ──
        doc.setFontSize(11);
        addLine(`Name   : ${feedback.name || 'N/A'}`, false);
        addLine(`Email  : ${feedback.email || 'N/A'}`, false);
        addLine(`Type   : ${feedback.type || 'N/A'}`, false);
        addLine(`Rating : ${feedback.rating || 0}/5`, false);
        addLine(`Date   : ${feedback.date || 'N/A'}`, false);
        if (feedback.sentiment) {
            addLine(`Sentiment : ${feedback.sentiment}`, false);
        }
        y += 4;

        // ── Form-specific fields (with wrapping) ──
        const SKIP = new Set(['name', 'email', 'type', 'rating', 'date', 'sentiment', '_origIndex']);
        Object.keys(feedback).forEach(key => {
            if (SKIP.has(key)) return;
            const label = fieldLabels[key] || (key.charAt(0).toUpperCase() + key.slice(1));
            addWrapped(label, feedback[key]);
        });

        // ── Footer ──
        y += 4;
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.4);
        doc.line(margin, y, pageW - margin, y);
        y += 6;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(150);
        doc.text('Generated by Feedback Hub · Cyber Flames © 2026', pageW / 2, y, { align: 'center' });

        // ── Save ──
        const safeName = (feedback.name || 'user').replace(/[^a-z0-9]/gi, '_').toLowerCase();
        doc.save(`feedback-${safeName}.pdf`);
    });
}

// Creates (or replaces) a download button below the form's submit button
function showDownloadButton(feedbackData, form) {
    // Remove any previous download button for this form
    const prev = form.querySelector('.user-pdf-btn');
    if (prev) prev.remove();

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'user-pdf-btn';
    btn.innerHTML = '📄 Download Your Response';
    btn.style.cssText = `
        margin-top: 12px;
        background: linear-gradient(135deg, #5e8b7e 0%, #4a7567 100%);
        opacity: 0;
        transform: translateY(8px);
        transition: opacity 0.4s ease, transform 0.4s ease;
    `;

    btn.onclick = () => generateUserPDF(feedbackData);

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.insertAdjacentElement('afterend', btn);
    } else {
        form.appendChild(btn);
    }

    // Fade-in after one frame
    requestAnimationFrame(() => requestAnimationFrame(() => {
        btn.style.opacity = '1';
        btn.style.transform = 'translateY(0)';
    }));
}

/* ============================= */


/* ===== PERSONALISED THANK-YOU TOAST ===== */

// Inject CSS once
(function injectThankYouStyles() {
    if (document.getElementById('thankYouStyles')) return;
    const s = document.createElement('style');
    s.id = 'thankYouStyles';
    s.textContent = `
        @keyframes tySlideDown {
            from { opacity: 0; transform: translateX(-50%) translateY(-24px) scale(0.96); }
            to   { opacity: 1; transform: translateX(-50%) translateY(0)   scale(1);    }
        }
        .ty-toast {
            position: fixed;
            top: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
            color: white;
            padding: 18px 36px;
            border-radius: 16px;
            box-shadow: 0 12px 35px rgba(46, 204, 113, 0.45);
            z-index: 10000;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
            text-align: center;
            animation: tySlideDown 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both;
            max-width: 90vw;
        }
        .ty-toast .ty-main {
            font-size: 18px;
            font-weight: 700;
            letter-spacing: 0.2px;
        }
        .ty-toast .ty-sub {
            font-size: 13px;
            font-weight: 500;
            opacity: 0.88;
        }
    `;
    document.head.appendChild(s);
})();

const APPRECIATION_MESSAGES = [
    "You're awesome! 🙌",
    "Thanks for helping us grow 🚀",
    "Your feedback makes a difference 🌟",
    "You just made us better 😄",
    "Thanks for sharing your thoughts 🙏"
];

function getRandomMessage() {
    return APPRECIATION_MESSAGES[Math.floor(Math.random() * APPRECIATION_MESSAGES.length)];
}

function showThankYouMessage(name, timeMessage = "") {
    const displayName = (name && name.trim()) ? name.trim() : null;
    const randomMsg = getRandomMessage();

    const mainText = displayName
        ? `🙌 Thanks, ${displayName}! ${randomMsg}`
        : `🙌 Thank you! ${randomMsg}`;

    const toast = document.createElement('div');
    toast.className = 'ty-toast';
    toast.innerHTML = `
        <span class="ty-main">${mainText}</span>
        <span class="ty-sub">We appreciate you taking the time ❤️</span>
        ${timeMessage ? `<span class="ty-sub" style="margin-top:6px; font-weight:600; color:#e0f2fe; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 6px;">⏱️ ${timeMessage}</span>` : ''}
    `;
    document.body.appendChild(toast);

    // Auto-dismiss after 3.5 s
    setTimeout(() => {
        toast.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(-10px)';
        setTimeout(() => toast.remove(), 500);
    }, 3500);
}

/* ======================================== */




// Rule-based sentiment using keyword matching with negation handling
function ruleBasedSentiment(text) {
    const POSITIVE_WORDS = [
        "good", "great", "excellent", "amazing", "fantastic", "fast", "love",
        "nice", "awesome", "wonderful", "helpful", "outstanding", "perfect",
        "happy", "satisfied", "impressive", "clean", "easy", "smooth", "best"
    ];
    const NEGATIVE_WORDS = [
        "bad", "poor", "slow", "worst", "hate", "issue", "problem", "terrible",
        "awful", "horrible", "disappointing", "broken", "useless", "difficult",
        "wrong", "fail", "failed", "ugly", "frustrating", "confusing", "error"
    ];
    // Negators: if the word before a positive word is one of these,
    // the whole phrase flips to negative (e.g. "not good", "never great")
    const NEGATORS = new Set([
        "not", "no", "never", "don't", "dont", "doesn't", "doesnt",
        "isn't", "isnt", "wasn't", "wasnt", "without", "hardly", "barely"
    ]);

    const lower = text.toLowerCase();
    const words = lower.match(/\b[\w']+\b/g) || [];

    let pos = 0, neg = 0;
    words.forEach((w, i) => {
        const prev = i > 0 ? words[i - 1] : "";
        const negated = NEGATORS.has(prev);

        if (POSITIVE_WORDS.includes(w)) {
            if (negated) neg++;   // "not good" → negative
            else pos++;
        }
        if (NEGATIVE_WORDS.includes(w)) {
            if (negated) pos++;   // "not bad" → positive
            else neg++;
        }
    });

    if (pos > neg) return "Positive";
    if (neg > pos) return "Negative";
    return "Neutral"; // equal or no matches → let API decide
}

// Hugging Face API fallback — called only when rule-based returns "Neutral"
async function analyzeWithAPI(text) {
    try {
        const response = await fetch(
            "https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english",
            {
                method: "POST",
                headers: {
                    "Authorization": "Bearer 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",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ inputs: text })
            }
        );
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        const result = await response.json();
        // Response shape: [[{label, score}, ...]]
        const best = Array.isArray(result[0])
            ? result[0].reduce((a, b) => (a.score > b.score ? a : b))
            : result[0];
        if (best.label === "POSITIVE") return "Positive";
        if (best.label === "NEGATIVE") return "Negative";
        return "Neutral";
    } catch (err) {
        console.warn("[Sentiment API] Failed, defaulting to Neutral:", err.message);
        return "Neutral"; // safe fallback — never breaks submission
    }
}

// Hybrid: rule-based first; API only if uncertain (Neutral)
async function getSentimentHybrid(text) {
    if (!text || text.trim() === "") return "Neutral";
    const ruleBased = ruleBasedSentiment(text);
    if (ruleBased !== "Neutral") return ruleBased;  // fast path
    return await analyzeWithAPI(text);              // uncertain → ask AI
}

/* ============================== */


/* ===== ADMIN TABLE LOGIC ===== */
const adminTableBody = document.getElementById("adminTable");

// Renders any subset of feedback data into the admin table
function renderAdminTable(data) {
    if (!adminTableBody) return;

    adminTableBody.innerHTML = "";

    if (data.length === 0) {
        adminTableBody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align:center; padding:20px; color:#999;">
                    No feedback found
                </td>
            </tr>
        `;
        return;
    }

    data.forEach((feedback, index) => {
        const row = document.createElement("tr");
        row.style.animation = `fadeIn 0.5s ease ${index * 0.1}s both`;

        // Field name mappings for better display
        const fieldLabels = {
            'serviceType': 'Service Type',
            'staffBehaviour': 'Staff Behaviour',
            'suggestions': 'Suggestions',
            'productQuality': 'Product Quality',
            'features': 'Features Used',
            'comments': 'Comments',
            'courseName': 'Course Name',
            'instructorName': 'Instructor Name',
            'difficultyLevel': 'Difficulty Level',
            'contentQuality': 'Content Quality',
            'feedback': 'Feedback',
            'eventName': 'Event Name',
            'eventType': 'Event Type',
            'organization': 'Organization Quality',
            'section': 'Website Section',
            'ease': 'Ease of Use'
        };

        // Create data summary with proper labels
        // Excludes internal/meta fields that should not be displayed
        const DISPLAY_SKIP = new Set(['type', 'date', 'rating', 'name', 'email', 'sentiment', '_origIndex']);
        let dataSummary = [];
        Object.keys(feedback).forEach(key => {
            if (DISPLAY_SKIP.has(key)) return;
            const label = fieldLabels[key] || key.charAt(0).toUpperCase() + key.slice(1);
            dataSummary.push(`<strong>${label}:</strong> ${feedback[key]}`);
        });

        // Sentiment badge helper
        const sentimentMap = {
            "Positive": { emoji: "\uD83D\uDE0A", cls: "sentiment-positive" },
            "Negative": { emoji: "\uD83D\uDE21", cls: "sentiment-negative" },
            "Neutral": { emoji: "\uD83D\uDE10", cls: "sentiment-neutral" }
        };
        const sLabel = feedback.sentiment || "Neutral";
        const sInfo = sentimentMap[sLabel] || sentimentMap["Neutral"];

        row.innerHTML = `
            <td style="text-align:center;">
                <input type="checkbox" class="row-select" data-index="${feedback._origIndex}"
                    style="transform:scale(1.2); cursor:pointer; accent-color:#5e8b7e;">
            </td>
            <td style="font-weight:600; color:#5e8b7e;">${feedback.type}</td>
            <td style="font-weight:500;">${feedback.name || 'N/A'}</td>
            <td style="font-size:14px;">${feedback.email || 'N/A'}</td>
            <td style="max-width:350px; font-size:13px; line-height:1.6;">${dataSummary.join('<br>') || 'N/A'}</td>
            <td style="white-space:nowrap;">
                <span style="color:gold; font-size:18px;">${'\u2605'.repeat(feedback.rating || 0)}</span>
                <span style="color:#ddd; font-size:18px;">${'\u2605'.repeat(5 - (feedback.rating || 0))}</span>
            </td>
            <td class="${sInfo.cls}" style="white-space:nowrap; font-size:14px;">
                ${sInfo.emoji} ${sLabel}
            </td>
            <td style="font-size:13px; color:#666; white-space:nowrap;">${feedback.date}</td>
        `;

        adminTableBody.appendChild(row);
    });
}


/* ===== FILTER LOGIC ===== */

// Safely parse the date string stored by the app (toLocaleString format, e.g. "3/29/2026, 12:30:00 AM")
// new Date() is unreliable on locale strings in all browsers, so we parse manually.
function parseFeedbackDate(dateStr) {
    if (!dateStr) return NaN;
    // Try native parse first (works in most modern browsers for en-US locale strings)
    const ts = Date.parse(dateStr);
    if (!isNaN(ts)) return ts;
    // Fallback: manually extract parts from "M/D/YYYY, H:MM:SS AM/PM" format
    const match = dateStr.match(
        /(\d{1,2})\/(\d{1,2})\/(\d{4}),?\s+(\d{1,2}):(\d{2}):(\d{2})\s*(AM|PM)?/i
    );
    if (!match) return NaN;
    let [, month, day, year, hours, minutes, seconds, ampm] = match;
    hours = parseInt(hours);
    if (ampm) {
        if (ampm.toUpperCase() === "PM" && hours !== 12) hours += 12;
        if (ampm.toUpperCase() === "AM" && hours === 12) hours = 0;
    }
    return new Date(
        parseInt(year), parseInt(month) - 1, parseInt(day),
        hours, parseInt(minutes), parseInt(seconds)
    ).getTime();
}

function applyFilters() {
    if (!adminTableBody) return;

    const allFeedbacks = JSON.parse(localStorage.getItem("feedbacks")) || [];

    // Tag each entry with its original localStorage index (needed by export checkboxes)
    const tagged = allFeedbacks.map((f, i) => ({ ...f, _origIndex: i }));

    const dateVal = document.getElementById("filterDate") ? document.getElementById("filterDate").value : "all";
    const ratingVal = document.getElementById("filterRating") ? document.getElementById("filterRating").value : "all";
    const sentimentVal = document.getElementById("filterSentiment") ? document.getElementById("filterSentiment").value : "all";
    const searchVal = document.getElementById("filterSearch") ? document.getElementById("filterSearch").value.trim().toLowerCase() : "";

    const now = Date.now();

    const filtered = tagged.filter(f => {

        // ── Date Range Filter ──────────────────────────────────────────────
        // Uses parseFeedbackDate() to reliably handle toLocaleString() format
        if (dateVal !== "all") {
            const days = parseInt(dateVal);
            const cutoff = now - days * 24 * 60 * 60 * 1000;
            const entryTime = parseFeedbackDate(f.date);
            if (isNaN(entryTime) || entryTime < cutoff) return false;
        }

        // ── Star Rating Filter ─────────────────────────────────────────────
        if (ratingVal !== "all") {
            if (String(f.rating) !== ratingVal) return false;
        }

        // ── Sentiment Filter ───────────────────────────────────────────────
        if (sentimentVal !== "all") {
            const fbSentiment = f.sentiment || "Neutral";
            if (fbSentiment !== sentimentVal) return false;
        }

        // ── Text Search Filter ─────────────────────────────────────────────
        // Only scan actual text fields — exclude _origIndex (number) to avoid false hits
        if (searchVal !== "") {
            const TEXT_KEYS = ["name", "email", "type", "date",
                "serviceType", "staffBehaviour", "suggestions",
                "productQuality", "features", "comments",
                "courseName", "instructorName", "difficultyLevel", "contentQuality",
                "feedback", "eventName", "eventType", "organization",
                "section", "ease"];
            const searchable = TEXT_KEYS
                .map(k => (f[k] || "").toString().toLowerCase())
                .join(" ");
            if (!searchable.includes(searchVal)) return false;
        }

        return true;
    });

    // Update result badge
    const countEl = document.getElementById("filterResultCount");
    if (countEl) {
        countEl.textContent = filtered.length === allFeedbacks.length
            ? `${allFeedbacks.length} entr${allFeedbacks.length === 1 ? "y" : "ies"}`
            : `${filtered.length} of ${allFeedbacks.length} entr${allFeedbacks.length === 1 ? "y" : "ies"}`;
    }

    renderAdminTable(filtered);

    // Refresh negative alert whenever the table re-renders
    checkNegativeFeedback();

    // Refresh smart summary with the full (unfiltered) dataset so it always
    // reflects the complete picture, regardless of active filter controls
    generateSmartSummary(allFeedbacks);

    // Refresh both charts with the full (unfiltered) dataset so they always
    // reflect the complete picture regardless of active filter controls
    renderSentimentChart(allFeedbacks);
    renderFeedbackChart(allFeedbacks);
}

// Resets all filter controls to defaults and re-renders the full table
function resetFilters() {
    const dateEl = document.getElementById("filterDate");
    const ratingEl = document.getElementById("filterRating");
    const sentimentEl = document.getElementById("filterSentiment");
    const searchEl = document.getElementById("filterSearch");

    if (dateEl) dateEl.value = "all";
    if (ratingEl) ratingEl.value = "all";
    if (sentimentEl) sentimentEl.value = "all";
    if (searchEl) searchEl.value = "";

    applyFilters();
}


/* ===== CHART INSTANCE VARIABLES ===== */
// Declared here — BEFORE the IIFE that calls applyFilters() — so that
// renderFeedbackChart() and renderSentimentChart() can reference them
// without hitting the `let` Temporal Dead Zone (which causes a ReferenceError
// and silently prevents both charts from rendering).
let _feedbackChartInstance = null;
let _sentimentChartInstance = null;
/* ===================================== */


/* ===== FILTER EVENT LISTENERS ===== */
(function () {
    const dateEl = document.getElementById("filterDate");
    const ratingEl = document.getElementById("filterRating");
    const sentimentEl = document.getElementById("filterSentiment");
    const searchEl = document.getElementById("filterSearch");

    if (dateEl) dateEl.addEventListener("change", applyFilters);
    if (ratingEl) ratingEl.addEventListener("change", applyFilters);
    if (sentimentEl) sentimentEl.addEventListener("change", applyFilters);
    if (searchEl) searchEl.addEventListener("input", applyFilters);

    // Initial render (replaces the old static render on page load)
    applyFilters();
})();




/* ===== FEEDBACK BAR CHART ===== */
function renderFeedbackChart(feedbacks) {
    const canvas = document.getElementById('feedbackChart');
    if (!canvas) return; // Not on admin page — exit silently

    // ── Destroy previous instance to prevent duplication ──────────────────
    if (_feedbackChartInstance) {
        _feedbackChartInstance.destroy();
        _feedbackChartInstance = null;
    }

    // ── Empty state ───────────────────────────────────────────────────────
    if (!feedbacks || feedbacks.length === 0) {
        // Chart.js needs a fresh canvas after innerHTML changes, so just
        // leave the blank canvas — the chart shows all-zero bars.
        // Render a zero-bar chart so the layout stays consistent.
    }

    // ── Aggregate counts by feedback type ─────────────────────────────────
    const counts = { Service: 0, Product: 0, Training: 0, Event: 0, Website: 0 };
    (feedbacks || []).forEach(f => {
        if (counts[f.type] !== undefined) counts[f.type]++;
    });

    // ── Build bar chart ────────────────────────────────────────────────────
    _feedbackChartInstance = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: Object.keys(counts),
            datasets: [{
                label: 'Number of Feedbacks',
                data: Object.values(counts),
                backgroundColor: ['#4f46e5', '#f59e0b', '#ef4444', '#818cf8', '#6366f1'],
                borderRadius: 8,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            animation: { duration: 500, easing: 'easeInOutQuart' },
            plugins: {
                legend: { display: true, position: 'top' },
                title: {
                    display: true,
                    text: 'Feedback Distribution by Type',
                    font: { size: 18, weight: 'bold' }
                }
            },
            scales: {
                y: { beginAtZero: true, ticks: { stepSize: 1 } }
            }
        }
    });
}
/* =============================== */


/* ===== CLEAR FEEDBACK FUNCTION ===== */
function clearFeedback() {
    if (confirm("⚠️ Are you sure you want to delete all feedback data? This action cannot be undone.")) {
        localStorage.removeItem("feedbacks");
        alert("✅ All feedback data has been cleared!");
        location.reload();
    }
}


/* ===== FADE IN ANIMATION ===== */
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

/* ===== LOGOUT FUNCTION ===== */
function logout() {

    let confirmLogout = confirm("Are you sure you want to log out?");

    if (confirmLogout) {
        localStorage.removeItem("isAdmin");
        window.location.href = "secure-access.html";
    }

}

// --- SELECT ALL CHECKBOX ---
const selectAllCheckbox = document.getElementById("selectAll");
if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener("change", function () {
        document.querySelectorAll(".row-select").forEach(cb => {
            cb.checked = this.checked;
        });
    });
}
// ----------------------------


/* ===== EXPORT HELPERS ===== */

// Returns selected feedback entries, or ALL if none are checked
function getSelectedFeedbacks() {
    const feedbacks = JSON.parse(localStorage.getItem("feedbacks")) || [];
    const checked = document.querySelectorAll(".row-select:checked");
    if (checked.length === 0) return feedbacks;
    return Array.from(checked).map(cb => feedbacks[parseInt(cb.dataset.index)]);
}

// Export selected (or all) feedback as a CSV file
function exportCSV() {
    const data = getSelectedFeedbacks();
    if (data.length === 0) { alert("No feedback data to export."); return; }

    const headers = ["Type", "Name", "Email", "Rating", "Date"];
    const rows = data.map(f => [
        f.type || "",
        f.name || "",
        f.email || "",
        f.rating || "",
        f.date || ""
    ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(","));

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "feedbacks.csv";
    a.click();
    URL.revokeObjectURL(url);
}

// Export selected (or all) feedback as a PDF file using jsPDF
function exportPDF() {
    const data = getSelectedFeedbacks();
    if (data.length === 0) { alert("No feedback data to export."); return; }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;
    const lineH = 7;

    // Title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Feedback Report", 105, 20, { align: "center" });

    let y = 35;

    data.forEach((f, i) => {
        // Add a new page if remaining space is insufficient
        if (y + 45 > pageHeight - 20) { doc.addPage(); y = 20; }

        // Entry heading
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text(`${i + 1}. ${f.type || "N/A"} Feedback`, 14, y);
        y += lineH;

        // Entry fields
        doc.setFont("helvetica", "normal");
        doc.text(`Name   : ${f.name || "N/A"}`, 18, y); y += lineH;
        doc.text(`Email  : ${f.email || "N/A"}`, 18, y); y += lineH;
        doc.text(`Rating : ${f.rating || 0}/5`, 18, y); y += lineH;
        doc.text(`Date   : ${f.date || "N/A"}`, 18, y); y += lineH + 3;

        // Separator line
        doc.setDrawColor(200, 200, 200);
        doc.line(14, y, 196, y);
        y += 5;
    });

    doc.save("feedbacks.pdf");
}
/* ========================== */


// --- HIDDEN ADMIN ACCESS SYSTEM ---
// Safely scoped to prevent variable conflicts
(function () {
    const adminTrigger = document.getElementById("adminTrigger");

    // Null check: no runtime errors if element is absent on other pages
    if (!adminTrigger) return;

    let clickCount = 0;
    let clickTimer = null;

    adminTrigger.addEventListener("click", function () {
        clickCount++;

        // Requirement 4 & 5: Start timer ONLY on first click; prevent stacking timers
        if (clickCount === 1) {
            clearTimeout(clickTimer); // Safety: clear any stale timer before starting
            clickTimer = setTimeout(function () {
                clickCount = 0;  // Requirement 2: auto-reset if 5 clicks not reached in time
                clickTimer = null;
            }, 3000);
        }

        // Requirement 1 & 3: Redirect on 5th click; reset all state after success
        if (clickCount >= 5) {
            clearTimeout(clickTimer); // Requirement 5: stop the running timer
            clickTimer = null;
            clickCount = 0;          // Requirement 3: reset counter after redirection
            window.location.href = "secure-access.html";
        }
    });
})();
// ----------------------------------

/* ===== NEGATIVE FEEDBACK ALERT ===== */

/**
 * A feedback is "negative" if rating <= 2 OR sentiment === "Negative".
 * Shows/hides the alert div and updates its message count.
 */
function checkNegativeFeedback() {
    const alertEl = document.getElementById('negativeAlert');
    const titleEl = document.getElementById('negAlertTitle');
    if (!alertEl || !titleEl) return; // not on admin page

    const feedbacks = JSON.parse(localStorage.getItem('feedbacks')) || [];
    const negativeItems = feedbacks.filter(f =>
        parseInt(f.rating) <= 2 || f.sentiment === 'Negative'
    );
    const count = negativeItems.length;

    if (count > 0) {
        titleEl.textContent = `Alert: ${count} user${count === 1 ? ' is' : 's are'} unhappy! Immediate attention needed.`;
        alertEl.classList.add('show');
    } else {
        alertEl.classList.remove('show');
    }
}

/**
 * "View Issues" button handler.
 * Applies rating=1 and rating=2 can't be combined in one dropdown,
 * so we filter the table directly to show only negative entries.
 */
function viewNegativeIssues() {
    const allFeedbacks = JSON.parse(localStorage.getItem('feedbacks')) || [];
    const negatives = allFeedbacks
        .map((f, i) => ({ ...f, _origIndex: i }))
        .filter(f => parseInt(f.rating) <= 2 || f.sentiment === 'Negative');

    // Reset filter controls to default so the label stays accurate
    const dateEl = document.getElementById('filterDate');
    const ratingEl = document.getElementById('filterRating');
    const searchEl = document.getElementById('filterSearch');
    if (dateEl) dateEl.value = 'all';
    if (ratingEl) ratingEl.value = 'all';
    if (searchEl) searchEl.value = '';

    // Update result count badge
    const countEl = document.getElementById('filterResultCount');
    if (countEl) {
        countEl.textContent = negatives.length === allFeedbacks.length
            ? `${allFeedbacks.length} entries`
            : `${negatives.length} of ${allFeedbacks.length} entries (negative only)`;
    }

    // Render only negative entries (does NOT call applyFilters to avoid loop)
    renderAdminTable(negatives);

    // Scroll table into view
    const tableEl = document.querySelector('.admin-table');
    if (tableEl) tableEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ==================================== */

/* ===== SMART SUMMARY (MINI AI INSIGHT) ===== */
function generateSmartSummary(feedbacks) {
    const summaryBox = document.getElementById('smart-summary');
    if (!summaryBox) return; // Not on admin page — exit silently

    // ── Fallback: no data ──────────────────────────────────────────────────
    if (!feedbacks || feedbacks.length === 0) {
        summaryBox.style.borderLeftColor = 'var(--gray)';
        summaryBox.innerHTML = `
            <span class="summary-icon">📊</span>
            <span class="summary-text">No feedback data available yet.</span>
        `;
        return;
    }

    // ── Single-pass aggregation ────────────────────────────────────────────
    let pos = 0, neg = 0, neu = 0;
    const KEYWORDS = [
        'delivery', 'support', 'quality', 'price', 'staff',
        'website', 'content', 'course', 'organization',
        'features', 'speed', 'service', 'event', 'training'
    ];
    const kwCounts = {};

    feedbacks.forEach(f => {
        // Count sentiments
        const s = (f.sentiment || 'Neutral').trim();
        if (s === 'Positive') pos++;
        else if (s === 'Negative') neg++;
        else neu++;

        // Scan all string values in this feedback object for keywords
        Object.values(f).forEach(val => {
            if (typeof val !== 'string') return;
            const lower = val.toLowerCase();
            KEYWORDS.forEach(kw => {
                if (lower.includes(kw)) {
                    kwCounts[kw] = (kwCounts[kw] || 0) + 1;
                }
            });
        });
    });

    // ── Determine overall sentiment label ──────────────────────────────────
    const total = feedbacks.length;
    let overallLabel, icon, borderColor;

    if (pos >= total * 0.5) {
        overallLabel = 'happy overall';
        icon = '🌟';
        borderColor = '#2ecc71';
    } else if (neg >= total * 0.5) {
        overallLabel = 'mostly unhappy';
        icon = '⚠️';
        borderColor = '#e74c3c';
    } else {
        overallLabel = 'mixed opinions';
        icon = '💡';
        borderColor = '#f39c12';
    }

    // ── Find top keyword/topic ─────────────────────────────────────────────
    let topTopic = '';
    let maxCount = 0;
    Object.entries(kwCounts).forEach(([kw, count]) => {
        if (count > maxCount) { maxCount = count; topTopic = kw; }
    });

    // ── Build the insight sentence ─────────────────────────────────────────
    let sentence;
    const topicTag = topTopic
        ? `<span class="summary-highlight">${topTopic}</span>`
        : '';

    if (overallLabel === 'happy overall') {
        sentence = topTopic
            ? `Users are happy overall, frequently praising ${topicTag}.`
            : `Users are happy overall with their experience.`;
    } else if (overallLabel === 'mostly unhappy') {
        sentence = topTopic
            ? `Users are mostly unhappy, especially regarding ${topicTag}.`
            : `Users are mostly unhappy with their experience.`;
    } else {
        sentence = topTopic
            ? `Users have mixed opinions, with prominent mentions of ${topicTag}.`
            : `Users have mixed opinions across the board.`;
    }

    // ── Inject UI ──────────────────────────────────────────────────────────
    summaryBox.style.borderLeftColor = borderColor;
    summaryBox.innerHTML = `
        <span class="summary-icon">${icon}</span>
        <div class="summary-body">
            <span class="summary-label">💡 Insight</span>
            <span class="summary-text">${sentence}</span>
        </div>
    `;
}
/* =========================================== */


/* ===== SENTIMENT PIE CHART ===== */
function renderSentimentChart(feedbacks) {
    const canvas = document.getElementById('sentimentChart');
    if (!canvas) return; // Not on admin page — exit silently

    // ── Destroy previous chart instance to avoid duplication ──────────────
    if (_sentimentChartInstance) {
        _sentimentChartInstance.destroy();
        _sentimentChartInstance = null;
    }

    // ── Empty state ───────────────────────────────────────────────────────
    if (!feedbacks || feedbacks.length === 0) {
        // Show a plain message inside the container instead of a blank chart
        const container = canvas.closest('.sentiment-chart-container');
        if (container) {
            container.innerHTML = `
                <p class="sentiment-chart-empty">No sentiment data available yet.</p>
            `;
        }
        return;
    }

    // ── Count sentiments in a single pass ─────────────────────────────────
    let pos = 0, neu = 0, neg = 0;
    feedbacks.forEach(f => {
        const s = (f.sentiment || 'Neutral').trim();
        if (s === 'Positive') pos++;
        else if (s === 'Negative') neg++;
        else neu++;
    });

    // ── Build Chart.js pie chart ───────────────────────────────────────────
    _sentimentChartInstance = new Chart(canvas, {
        type: 'pie',
        data: {
            labels: ['Positive', 'Neutral', 'Negative'],
            datasets: [{
                data: [pos, neu, neg],
                backgroundColor: ['#22c55e', '#f59e0b', '#ef4444'],
                borderColor: ['#16a34a', '#d97706', '#dc2626'],
                borderWidth: 2,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            animation: {
                animateRotate: true,
                animateScale: true,
                duration: 600,
                easing: 'easeInOutQuart'
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        font: { size: 13, weight: '600' },
                        boxWidth: 14,
                        boxHeight: 14
                    }
                },
                title: {
                    display: true,
                    text: 'Sentiment Distribution',
                    font: { size: 16, weight: 'bold' },
                    padding: { bottom: 16 }
                },
                tooltip: {
                    callbacks: {
                        label: function (ctx) {
                            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                            const pct = total > 0
                                ? ((ctx.parsed / total) * 100).toFixed(1)
                                : 0;
                            return ` ${ctx.label}: ${ctx.parsed} (${pct}%)`;
                        }
                    }
                }
            }
        }
    });
}
/* ================================= */


/* ===== SMART DYNAMIC PLACEHOLDER ===== */
(function initSmartPlaceholders() {

    const PLACEHOLDER_POOL = [
        "Tell us what you loved ❤️",
        "What can we improve?",
        "Be honest, we're listening 👀",
        "Share your experience with us ✍️",
        "Your feedback matters a lot 💬"
    ];

    // Default shown when textarea is empty and loses focus
    const DEFAULT_PLACEHOLDER = "Write your feedback here...";

    function pickRandom(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    function attachSmartPlaceholder(textarea) {
        // Store the placeholder that was in the HTML (could be blank/empty)
        // We fall back to DEFAULT_PLACEHOLDER if none was set.
        const originalPlaceholder =
            textarea.getAttribute('placeholder') || DEFAULT_PLACEHOLDER;

        // Set the default on first load so the field always shows something
        textarea.setAttribute('placeholder', originalPlaceholder);

        textarea.addEventListener('focus', function () {
            // Only swap the placeholder when the field is empty (no typed text)
            if (!this.value.trim()) {
                // Brief opacity dip via class, then swap text
                this.classList.add('ph-fade');
                setTimeout(() => {
                    this.setAttribute('placeholder', pickRandom(PLACEHOLDER_POOL));
                    this.classList.remove('ph-fade');
                }, 120);
            }
        });

        textarea.addEventListener('blur', function () {
            // If the user left the textarea empty, restore the original placeholder
            if (!this.value.trim()) {
                this.classList.add('ph-fade');
                setTimeout(() => {
                    this.setAttribute('placeholder', originalPlaceholder);
                    this.classList.remove('ph-fade');
                }, 120);
            }
            // If they typed something, leave it completely alone
        });
    }

    // Attach to every textarea inside a feedback form (all pages share script.js)
    document.querySelectorAll('.feedback-form textarea').forEach(attachSmartPlaceholder);

})();
/* ======================================= */
