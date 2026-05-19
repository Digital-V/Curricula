(function() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault(); 
            
            const studentId = document.getElementById('loginId').value.trim();
            const password = document.getElementById('loginPassword').value.trim();

            if (!studentId || !password) {
                alert("Please enter both your Student Number and Password.");
                return;
            }

            //no database so pass either way :)))
            alert("Login successful! Redirecting to Dashboard...");
            window.location.href = 'home.html';
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('regName').value.trim();
            const email = document.getElementById('regEmail').value.trim();
            const studentId = document.getElementById('regId').value.trim();
            const password = document.getElementById('regPassword').value.trim();

            if (!name || !email || !studentId || !password) {
                alert("Please fill out all fields.");
                return;
            }

            const initialInfo = {
                name: name,
                email: email,
                studentId: studentId,
                status: 'enrolled'
            };

            // Save to localStorage so personalinfo.js can pick it up
            localStorage.setItem('personalInfo', JSON.stringify(initialInfo));

            alert("Account created successfully! Please login.");
            window.location.href = 'login.html';
        });
    }
})();