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
});


/* ========= FORM VALIDATION + SAVE ========= */
document.querySelectorAll(".feedback-form").forEach(form => {
    // Disable HTML5 validation to use custom validation
    form.setAttribute('novalidate', 'novalidate');

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

        // All validation passed - save to localStorage
        const all = JSON.parse(localStorage.getItem("feedbacks")) || [];
        all.push(data);
        localStorage.setItem("feedbacks", JSON.stringify(all));

        // Show success message
        const successDiv = document.createElement('div');
        successDiv.style.cssText = `
            position: fixed;
            top: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
            color: white;
            padding: 20px 40px;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 10000;
            font-size: 18px;
            font-weight: 600;
            animation: slideDown 0.5s ease;
        `;
        successDiv.textContent = '✅ Feedback submitted successfully!';
        document.body.appendChild(successDiv);

        // Add animation
        if (!document.getElementById('slideDownAnimation')) {
            const style = document.createElement('style');
            style.id = 'slideDownAnimation';
            style.textContent = `
                @keyframes slideDown {
                    from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
                    to { opacity: 1; transform: translateX(-50%) translateY(0); }
                }
            `;
            document.head.appendChild(style);
        }

        // Remove success message after 3 seconds
        setTimeout(() => {
            successDiv.style.transition = 'opacity 0.5s ease';
            successDiv.style.opacity = '0';
            setTimeout(() => successDiv.remove(), 500);
        }, 3000);

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

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });

        return false;
    };
});


/* ===== ADMIN TABLE LOGIC ===== */
const adminTableBody = document.getElementById("adminTable");

if (adminTableBody) {
    const feedbacks = JSON.parse(localStorage.getItem("feedbacks")) || [];

    if (feedbacks.length === 0) {
        adminTableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center; padding:20px; color:#999;">
                    No feedback submitted yet
                </td>
            </tr>
        `;
    } else {
        feedbacks.forEach((feedback, index) => {
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

            // Create data summary with proper labels (excluding type, date, rating, name, and email)
            let dataSummary = [];
            Object.keys(feedback).forEach(key => {
                if (key !== 'type' && key !== 'date' && key !== 'rating' && key !== 'name' && key !== 'email') {
                    const label = fieldLabels[key] || key.charAt(0).toUpperCase() + key.slice(1);
                    dataSummary.push(`<strong>${label}:</strong> ${feedback[key]}`);
                }
            });

            row.innerHTML = `
                <td style="font-weight:600; color:#4a63f3;">${feedback.type}</td>
                <td style="font-weight:500;">${feedback.name || 'N/A'}</td>
                <td style="font-size:14px;">${feedback.email || 'N/A'}</td>
                <td style="max-width:350px; font-size:13px; line-height:1.6;">${dataSummary.join('<br>') || 'N/A'}</td>
                <td style="white-space:nowrap;">
                    <span style="color:gold; font-size:18px;">${'★'.repeat(feedback.rating || 0)}</span>
                    <span style="color:#ddd; font-size:18px;">${'★'.repeat(5 - (feedback.rating || 0))}</span>
                </td>
                <td style="font-size:13px; color:#666; white-space:nowrap;">${feedback.date}</td>
            `;

            adminTableBody.appendChild(row);
        });
    }
}


/* ===== ADMIN CHART LOGIC ===== */
const chartCanvas = document.getElementById("feedbackChart");

if (chartCanvas) {
    const feedbacks = JSON.parse(localStorage.getItem("feedbacks")) || [];

    const counts = {
        Service: 0,
        Product: 0,
        Training: 0,
        Event: 0,
        Website: 0
    };

    feedbacks.forEach(f => {
        if (counts[f.type] !== undefined) {
            counts[f.type]++;
        }
    });

    new Chart(chartCanvas, {
        type: "bar",
        data: {
            labels: Object.keys(counts),
            datasets: [{
                label: "Number of Feedbacks",
                data: Object.values(counts),
                backgroundColor: [
                    '#4a63f3',
                    '#f39c12',
                    '#e74c3c',
                    '#2ecc71',
                    '#9b59b6'
                ],
                borderRadius: 8,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                title: {
                    display: true,
                    text: 'Feedback Distribution by Type',
                    font: {
                        size: 18,
                        weight: 'bold'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}


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


