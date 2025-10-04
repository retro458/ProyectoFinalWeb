document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        console.error('No hay usuario logueado');
        window.location.href = 'login.html';
        return;
    }

    // Cargar datos del usuario (tu código actual)
    document.getElementById("username").textContent = currentUser.name;
    document.getElementById("email").textContent = currentUser.email;
    
    if(currentUser.avatar){
        document.getElementById("avatar").src = currentUser.avatar;
    }
    if(currentUser.bio){
        document.getElementById("bio").textContent = currentUser.bio;
    }
    if(currentUser.background){
        document.getElementById("profileBody").style.backgroundImage = `url(${currentUser.background})`;
        document.getElementById("profileBody").style.backgroundSize = "cover";
        document.getElementById("profileBody").style.backgroundPosition = "center";
    }

    // Función para convertir archivo a Base64
    function readFileAsBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Sweet Alert - Editar perfil con selección de archivos
    document.getElementById("editProfileBtn").addEventListener("click", async () => {
        
        const html = `
            <div class="container-fluid">
                <!-- Nombre de usuario -->
                <div class="row mb-3">
                    <div class="col-12">
                        <label class="form-label text-white mb-2"><strong>👤 Nombre de usuario:</strong></label>
                        <input id="swal-name" class="swal2-input" value="${currentUser.name}" placeholder="Tu nombre de usuario">
                    </div>
                </div>
    
                <!-- Avatar -->
                <div class="row mb-3">
                    <div class="col-12">
                        <label class="form-label text-white mb-2"><strong>🖼️ Avatar:</strong></label>
                        <input type="file" id="swal-avatar" class="form-control" accept="image/*" style="background: white; color: black;">
                        <div id="avatar-preview" class="mt-2">
                            ${currentUser.avatar ? 
                                '<small class="text-success">✅ Avatar actual cargado</small>' : 
                                '<small class="text-warning">⚠️ No hay avatar actual</small>'
                            }
                        </div>
                    </div>
                </div>
    
                <!-- Fondo -->
                <div class="row mb-3">
                    <div class="col-12">
                        <label class="form-label text-white mb-2"><strong>🎨 Fondo de perfil:</strong></label>
                        <input type="file" id="swal-bg" class="form-control" accept="image/*" style="background: white; color: black;">
                        <div id="bg-preview" class="mt-2">
                            ${currentUser.background ? 
                                '<small class="text-success">✅ Fondo actual cargado</small>' : 
                                '<small class="text-warning">⚠️ No hay fondo actual</small>'
                            }
                        </div>
                    </div>
                </div>
    
                <!-- Biografía -->
                <div class="row mb-3">
                    <div class="col-12">
                        <label class="form-label text-white mb-2"><strong>📝 Biografía:</strong></label>
                        <textarea id="swal-bio" class="swal2-textarea" placeholder="Cuéntanos sobre tus juegos favoritos, logros gaming..." style="height: 120px; resize: vertical">${currentUser.bio || ""}</textarea>
                    </div>
                </div>
            </div>
        `;
    
        const { value: formValues } = await Swal.fire({
            title: "✏️ Editar Perfil",
            html: html,
            focusConfirm: false,
            confirmButtonText: "💾 Guardar Cambios",
            cancelButtonText: "❌ Cancelar",
            showCancelButton: true,
            background: "#1f1f1f",
            color: "#f0f0f0",
            confirmButtonColor: "#66c0f4",
            cancelButtonColor: "#6c757d",
            width: "650px",
            didOpen: () => {
                // Agregar eventos para vista previa en tiempo real
                document.getElementById('swal-avatar').addEventListener('change', function(e) {
                    const preview = document.getElementById('avatar-preview');
                    if (this.files && this.files[0]) {
                        preview.innerHTML = '<small class="text-info">📸 Nueva imagen seleccionada: ' + this.files[0].name + '</small>';
                    }
                });
    
                document.getElementById('swal-bg').addEventListener('change', function(e) {
                    const preview = document.getElementById('bg-preview');
                    if (this.files && this.files[0]) {
                        preview.innerHTML = '<small class="text-info">🎨 Nueva imagen de fondo seleccionada: ' + this.files[0].name + '</small>';
                    }
                });
            },
            preConfirm: async () => {
                const name = document.getElementById("swal-name").value;
                const avatarFile = document.getElementById("swal-avatar").files[0];
                const bgFile = document.getElementById("swal-bg").files[0];
                const bio = document.getElementById("swal-bio").value;

                let avatarBase64 = currentUser.avatar;
                let backgroundBase64 = currentUser.background;

                // Convertir nuevos archivos a Base64 si se seleccionaron
                try {
                    if (avatarFile) {
                        avatarBase64 = await readFileAsBase64(avatarFile);
                    }
                    if (bgFile) {
                        backgroundBase64 = await readFileAsBase64(bgFile);
                    }
                } catch (error) {
                    Swal.showValidationMessage(`Error al procesar imágenes: ${error}`);
                    return false;
                }

                return {
                    name: name,
                    avatar: avatarBase64,
                    background: backgroundBase64,
                    bio: bio,
                    email: currentUser.email,
                    password: currentUser.password
                };
            }
        });

        if(formValues){
            // Actualizar currentUser
            Object.assign(currentUser, formValues);
            localStorage.setItem("currentUser", JSON.stringify(currentUser));

            // Actualizar en la lista de usuarios
            let users = JSON.parse(localStorage.getItem("users")) || [];
            let index = users.findIndex(u => u.email === currentUser.email);
            if(index !== -1) {
                users[index] = currentUser;
                localStorage.setItem("users", JSON.stringify(users));
            }

            Swal.fire("Perfil actualizado", "Tus cambios se guardaron correctamente.", "success");

            // Refrescar datos en pantalla
            document.getElementById("username").textContent = currentUser.name;
            
            if(currentUser.avatar){
                document.getElementById("avatar").src = currentUser.avatar;
            }
            
            document.getElementById("bio").textContent = currentUser.bio || "Aquí puedes escribir tu biografía ...";
            
            if(currentUser.background){
                document.getElementById("profileBody").style.backgroundImage = `url(${currentUser.background})`;
                document.getElementById("profileBody").style.backgroundSize = "cover";
                document.getElementById("profileBody").style.backgroundPosition = "center";
            } else {
                document.getElementById("profileBody").style.backgroundImage = "none";
            }
        }
    });
});