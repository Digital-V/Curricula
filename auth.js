(function () {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    // Route guard — redirect to login if no session exists
    // (runs on every page that includes auth.js except login/register themselves)
    if (!loginForm && !registerForm) {
        const session = localStorage.getItem('sessionUser');
        if (!session) {
            window.location.href = 'login.html';
            return;
        }
    }

    // Forgot password — show/hide inline reset form
    const forgotLink = document.getElementById('forgotPasswordLink');
    const forgotForm = document.getElementById('forgotPasswordForm');
    const resetSubmitBtn = document.getElementById('resetSubmitBtn');
    const resetCancelBtn = document.getElementById('resetCancelBtn');

    if (forgotLink) {
        forgotLink.addEventListener('click', function (e) {
            e.preventDefault();
            forgotForm.style.display = 'flex';
            forgotForm.style.flexDirection = 'column';
            forgotForm.style.gap = '16px';
            forgotLink.style.display = 'none';
        });
    }

    if (resetCancelBtn) {
        resetCancelBtn.addEventListener('click', function () {
            forgotForm.style.display = 'none';
            forgotLink.style.display = 'inline';
            document.getElementById('resetId').value = '';
            document.getElementById('resetNewPassword').value = '';
            document.getElementById('resetConfirmPassword').value = '';
        });
    }

    if (resetSubmitBtn) {
        resetSubmitBtn.addEventListener('click', function () {
            const studentId = document.getElementById('resetId').value.trim();
            const newPassword = document.getElementById('resetNewPassword').value.trim();
            const confirmPassword = document.getElementById('resetConfirmPassword').value.trim();

            if (!studentId || !newPassword || !confirmPassword) {
                alert("Please fill out all fields.");
                return;
            }

            if (newPassword !== confirmPassword) {
                alert("Passwords do not match. Please try again.");
                return;
            }

            const storedCredentials = JSON.parse(localStorage.getItem('registeredUser') || 'null');

            if (!storedCredentials || storedCredentials.studentId !== studentId) {
                alert("No account found with that Student Number.");
                return;
            }

            storedCredentials.password = newPassword;
            localStorage.setItem('registeredUser', JSON.stringify(storedCredentials));

            alert("Password reset successfully! You can now log in with your new password.");
            forgotForm.style.display = 'none';
            forgotLink.style.display = 'inline';
            document.getElementById('resetId').value = '';
            document.getElementById('resetNewPassword').value = '';
            document.getElementById('resetConfirmPassword').value = '';
        });
    }

    // Auto-open forgot form if redirected here from register page via #forgot
    if (window.location.hash === '#forgot' && forgotLink) {
        forgotLink.click();
    }


    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const studentId = document.getElementById('loginId').value.trim();
            const password = document.getElementById('loginPassword').value.trim();

            if (!studentId || !password) {
                alert("Please enter both your Student Number and Password.");
                return;
            }

            const storedCredentials = JSON.parse(localStorage.getItem('registeredUser') || 'null');

            if (!storedCredentials) {
                alert("No account found. Please register first.");
                return;
            }

            if (storedCredentials.studentId !== studentId || storedCredentials.password !== password) {
                alert("Incorrect Student Number or Password.");
                return;
            }

            // Set a lightweight session marker (not the password)
            localStorage.setItem('sessionUser', JSON.stringify({ studentId }));

            alert("Login successful! Redirecting to Dashboard...");
            window.location.href = 'home.html';
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const name = document.getElementById('regName').value.trim();
            const email = document.getElementById('regEmail').value.trim();
            const studentId = document.getElementById('regId').value.trim();
            const password = document.getElementById('regPassword').value.trim();

            if (!name || !email || !studentId || !password) {
                alert("Please fill out all fields.");
                return;
            }

            // Store credentials separately from personal info
            localStorage.setItem('registeredUser', JSON.stringify({ studentId, password }));

            const initialInfo = {
                name: name,
                email: email,
                studentId: studentId,
                status: 'enrolled'
            };
            localStorage.setItem('personalInfo', JSON.stringify(initialInfo));

            alert("Account created successfully! Please login.");
            window.location.href = 'login.html';
        });
    }
})();