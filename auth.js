(function () {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const studentId = document.getElementById('loginId').value.trim();
            const password = document.getElementById('loginPassword').value.trim();

            if (!studentId || !password) {
                alert("Please enter both your Student Number and Password.");
                return;
            }

            let storedInfo = JSON.parse(localStorage.getItem('personalInfo') || '{}');

            if (storedInfo.studentId !== studentId) {
                storedInfo.studentId = studentId;

                if (!storedInfo.name) {
                    storedInfo.name = "Student";
                }
                if (!storedInfo.status) {
                    storedInfo.status = "enrolled";
                }

                localStorage.setItem('personalInfo', JSON.stringify(storedInfo));
            }

            //no database so pass either way :)))
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