(function () {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (!loginForm && !registerForm) {
        const session = localStorage.getItem('sessionUser');
        if (!session) {
            window.location.href = 'login.html';
            return;
        }
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