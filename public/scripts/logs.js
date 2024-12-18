document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");
    const username = document.getElementById("username");
    const password = document.getElementById("password");
    const email = document.getElementById("email");
    const telefono = document.getElementById("telefono");

    form.addEventListener("submit", function (event) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const telefonoRegex = /^\d{10}$/;
        event.preventDefault();
        if (username.value.trim() === "" || password.value.trim() === "" || email.value.trim() === "" || telefono.value.trim() === "") {
            alert("Por favor llena todos los campos");
        }

        // Validación de nombre de usuario
         else if (username.value.length < 3 || username.value.length > 15) {

            alert("El nombre de usuario debe tener entre 3 y 15 caracteres.");
        }

        // Validación de contraseña
         else if (password.value.length < 8) {

            alert("La contraseña debe tener al menos 8 caracteres.");
        }

        // Validación de correo electrónico
        
         else if (!emailRegex.test(email.value)) {

            alert("El correo electrónico no tiene un formato válido.");
        }

        // Validación de teléfono
        
         else if (!telefonoRegex.test(telefono.value)) {

            alert("El teléfono debe contener exactamente 10 dígitos.");
        }
    });
});
