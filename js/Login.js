// Registro de usuario
const registerForm = document.querySelector('form');

if(registerForm && window.location.pathname.includes('registro.html')) {
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = registerForm.querySelector('input[type="text"]').value.trim();
    const email = registerForm.querySelector('input[type="email"]').value.trim();
    const password = document.getElementById('password').value;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const confirmPassword = document.getElementById('confirm-password').value;
    if(!name || !email || !password) {
      alert('Todos los campos son obligatorios.');
      return;
    }

    let users = JSON.parse(localStorage.getItem('users')) || [];
    //confirm password
    if (password !== confirmPassword) {
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
    // Validar complejidad de la contraseña
    if (!passwordRegex.test(password)) {
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
    // Verifica si el correo ya existe
    if(users.some(u => u.email === email)) {
        Swal.fire({
            title: "Error",
            text: "El correo ya está registrado.",
            icon: "error",
            background: "#1f1f1f",
            color: "#f0f0f0",
            confirmButtonColor: "#ff4d4d"
        });
      return;
    }

    users.push({ name, email, password });
    localStorage.setItem('users', JSON.stringify(users));
    Swal.fire({
      title: "¡Registro exitoso!",
      text: "Ahora puedes iniciar sesión.",
      icon: "success",
      background: "#1f1f1f",
      color: "#f0f0f0",
      confirmButtonColor: "#ff4d4d",
      timer: 2000,
     showConfirmButton: false
    }).then(() => {
      window.location.href = 'Login.html';
    });
    
  });
}

// Login de usuario
const loginForm = document.querySelector('form');

if(loginForm && window.location.pathname.includes('Login.html')) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = loginForm.querySelector('input[type="email"]').value.trim();
    const password = loginForm.querySelector('input[type="password"]').value.trim();

    let users = JSON.parse(localStorage.getItem('users')) || [];

    const user = users.find(u => u.email === email && u.password === password);
    if(user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        Swal.fire({
          title: `¡Bienvenido, ${user.name}!`,
          text: "Has iniciado sesión correctamente.",
          icon: "success",
          background: "#1f1f1f",
          color: "#f0f0f0",
          confirmButtonColor: "#ff4d4d"
        }).then(() => {
          window.location.href = 'Index.html';
        });
      } else {
        Swal.fire({
          title: "Error de inicio de sesión",
          text: "Correo o contraseña incorrectos.",
          icon: "error",
          background: "#1f1f1f",
          color: "#f0f0f0",
          confirmButtonColor: "#ff4d4d"
        });
      }
  });
  
   
}

// Mantener sesión activa en Home
const currentUser = JSON.parse(localStorage.getItem('currentUser'));
// Ocultar links de login/registro si hay usuario
if(currentUser && window.location.pathname.includes('Index.html')) {
    const loginLink = document.querySelector('a[href="Login.html"]');
    const registroLink = document.querySelector('a[href="Registro.html"]'); 
    if (loginLink) loginLink.style.display = 'none';
    if (registroLink) registroLink.style.display = 'none';
}


if(currentUser && window.location.pathname.includes('Index.html')) {
  const nav = document.querySelector('.navbar-nav');

  const welcome = document.createElement('li');
  welcome.classList.add('nav-item');
  welcome.innerHTML =  `<a class="nav-link" href="perfil.html">Hola, ${currentUser.name}</a>`;
  nav.appendChild(welcome);

  const logout = document.createElement('li');
  logout.classList.add('nav-item');
  logout.innerHTML = `<a class="nav-link" href="#" id="logoutBtn">Cerrar sesión</a>`;
  nav.appendChild(logout);

  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('currentUser');
    window.location.reload(); // tras recargar, los links volverán a mostrarse
  });
}