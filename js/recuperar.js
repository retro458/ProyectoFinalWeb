let currentRecoveryUser = null;

function verifyEmail() {
    const email = document.getElementById('recovery-email').value.trim();
    
    if (!email) {
        Swal.fire({
            title: "Error",
            text: "Por favor ingresa tu correo electrónico.",
            icon: "error",
            background: "#1f1f1f",
            color: "#f0f0f0",
            confirmButtonColor: "#ff4d4d"
        });
        return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email);
    
    if (!user) {
        Swal.fire({
            title: "Error",
            text: "No se encontró una cuenta con ese correo electrónico.",
            icon: "error",
            background: "#1f1f1f",
            color: "#f0f0f0",
            confirmButtonColor: "#ff4d4d"
        });
        return;
    }

    currentRecoveryUser = user;
    
    // Mostrar paso 2 con la pregunta de seguridad
    document.getElementById('step1').style.display = 'none';
    document.getElementById('step2').style.display = 'block';
    document.getElementById('security-question-text').textContent = user.securityQuestion;
}

function verifyAnswer() {
    const answer = document.getElementById('security-answer-input').value.trim().toLowerCase();
    
    if (!answer) {
        Swal.fire({
            title: "Error",
            text: "Por favor ingresa tu respuesta.",
            icon: "error",
            background: "#1f1f1f",
            color: "#f0f0f0",
            confirmButtonColor: "#ff4d4d"
        });
        return;
    }

    if (answer === currentRecoveryUser.securityAnswer) {
        // Respuesta correcta, mostrar paso 3
        document.getElementById('step2').style.display = 'none';
        document.getElementById('step3').style.display = 'block';
    } else {
        Swal.fire({
            title: "Error",
            text: "Respuesta incorrecta. Por favor intenta nuevamente.",
            icon: "error",
            background: "#1f1f1f",
            color: "#f0f0f0",
            confirmButtonColor: "#ff4d4d"
        });
    }
}

function resetPassword() {
    const newPassword = document.getElementById('new-password').value;
    const confirmNewPassword = document.getElementById('confirm-new-password').value;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!newPassword || !confirmNewPassword) {
        Swal.fire({
            title: "Error",
            text: "Todos los campos son obligatorios.",
            icon: "error",
            background: "#1f1f1f",
            color: "#f0f0f0",
            confirmButtonColor: "#ff4d4d"
        });
        return;
    }

    if (newPassword !== confirmNewPassword) {
        Swal.fire({
            title: "Error",
            text: "Las contraseñas no coinciden.",
            icon: "error",
            background: "#1f1f1f",
            color: "#f0f0f0",
            confirmButtonColor: "#ff4d4d"
        });
        return;
    }

    if (!passwordRegex.test(newPassword)) {
        Swal.fire({
            title: "Error",
            text: "La contraseña debe tener al menos 8 caracteres, incluyendo una letra mayúscula, una minúscula, un número y un carácter especial.",
            icon: "error",
            background: "#1f1f1f",
            color: "#f0f0f0",
            confirmButtonColor: "#ff4d4d"
        });
        return;
    }

    // Actualizar la contraseña en localStorage
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.email === currentRecoveryUser.email);
    
    if (userIndex !== -1) {
        users[userIndex].password = newPassword;
        localStorage.setItem('users', JSON.stringify(users));
        
        Swal.fire({
            title: "¡Contraseña actualizada!",
            text: "Tu contraseña ha sido restablecida exitosamente.",
            icon: "success",
            background: "#1f1f1f",
            color: "#f0f0f0",
            confirmButtonColor: "#ff4d4d"
        }).then(() => {
            window.location.href = 'Login.html';
        });
    }
}