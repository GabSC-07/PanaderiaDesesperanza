document.addEventListener("DOMContentLoaded", () => {
    const borrarProductoButton = document.getElementById("borrarProductoButton");
    const borrarProductoForm = document.getElementById("borrarProductoForm");

    // Borrar
    borrarProductoButton.addEventListener("click", async () => {
        const id = borrarProductoForm.id.value;
        if (!id) {
            alert("Por favor ingresa el ID del producto a borrar.");
            return;
        }

        if (isNaN(id)) {
            alert("Por favor ingresa un ID válido");
            return;
        }

        try {
            const response = await fetch("/borrarProducto", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: id })
            });

            const result = await response.json();

            if (response.ok) {
                alert(result.message);  
            } else {
                alert(result.message);
            }
        } catch (error) {
            alert("Ocurrió un error al intentar borrar el producto.");
            console.error("Error:", error);
        }
    });

    // Agregar
    const agregarProductoButton = document.getElementById("agregarProductoButton");
    const agregarProductoForm = document.getElementById("agregarProductoForm");

    agregarProductoButton.addEventListener("click", async () => {
        const nombre_pan = agregarProductoForm.nombre_pan.value;
        const descripcion = agregarProductoForm.descripcion.value || "Sin descripción";
        const precio = agregarProductoForm.precio.value;
        const cantidad = agregarProductoForm.cantidad.value;

        if (!nombre_pan || isNaN(precio) || isNaN(cantidad)) {
            alert("Por favor ingresa valores válidos para todos los campos.");
            return;
        }

        if (precio > 10000 || precio <= 0) {
            alert("Por favor ingresa un precio válido")
            return
        }

        if (cantidad > 500 || cantidad < 0) {
            alert("Por favor, ingresa una cantidad válida")
            return
        }

        try {
            const response = await fetch("/agregarProducto", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nombre_pan, descripcion, precio, cantidad })
            });

            const result = await response.json();

            if (response.ok) {
                alert("Producto agregado correctamente");
            } else {
                alert(result.message || "Ocurrió un error al agregar el producto. Intente nuevamente");
            }
        } catch (error) {
            alert("Error al conectar con el servidor.");
            console.error("Error:", error);
        }
    });

    // Update
    const actualizarProductoButton = document.getElementById("actualizarProductoButton");
    const actualizarProductoForm = document.getElementById("actualizarProductoForm");

    actualizarProductoButton.addEventListener("click", async () => {
        const id_pan = actualizarProductoForm.id_pan.value;
        const nombre_pan = actualizarProductoForm.nombre_pan.value;
        const descripcion = actualizarProductoForm.descripcion.value || "Sin descripción";
        const precio = actualizarProductoForm.precio.value;
        const cantidad = actualizarProductoForm.cantidad.value;

        if (!id_pan || isNaN(precio) || isNaN(cantidad)) {
            alert("Por favor, ingresa valores válidos para todos los campos.");
            return;
        }

        if (precio > 10000 || precio <= 0) {
            alert("Por favor ingresa un precio válido")
            return
        }

        if (cantidad > 500 || cantidad < 0) {
            alert("Por favor, ingresa una cantidad válida")
            return
        }

        try {
            const response = await fetch("/actualizarProducto", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id_pan, nombre_pan, descripcion, precio, cantidad })
            });

            const result = await response.json();

            if (response.ok) {
                alert(result.message || "Producto actualizado correctamente.");
            } else {
                alert(result.message || "Error al actualizar el producto.");
            }
        } catch (error) {
            alert("Error al conectar con el servidor.");
            console.error("Error:", error);
        }
    });
});

// Leer
document.addEventListener("DOMContentLoaded", async () => {
    const inventarioContainer = document.getElementById("inventarioContainer");

    try {
        const response = await fetch("/verInventario");
        const html = await response.text();

        inventarioContainer.innerHTML = html;
    } catch (error) {
        alert("Error al cargar el inventario.");
        console.error("Error:", error);
    }
});
