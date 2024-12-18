async function cargarCarrito() {
    try {
        const response = await fetch(`/mostrarCarrito`);
        const productos = await response.json();

        const listaCarrito = document.getElementById('listaCarrito');
        listaCarrito.innerHTML = '';

        productos.forEach((producto) => {
            listaCarrito.innerHTML += `
        <tr>
            <td>${producto.nombre_pan}</td>
            <td>${producto.precio} pesos</td>
            <td>
                <button data-id="${producto.id_carrito}" onclick="eliminarDelCarrito(this)">Eliminar</button>
            </td>
        </tr>
    `;
        });
    } catch (error) {
        console.error('Error al cargar el carrito:', error);
    }
}

async function eliminarDelCarrito(boton) {
    const id_carrito = boton.getAttribute('data-id');

    if (!id_carrito) {
        return alert('No se pudo identificar el producto a eliminar.');
    }

    const response = await fetch(`/eliminarProducto`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_carrito }),
    });

    const data = await response.json();
    alert(data.message);

    if (response.ok) {
        cargarCarrito(); // Recargar la tabla del carrito
    }
}


async function comprarCarrito() {
    try {
        const response = await fetch(`/comprarCarrito`, { method: "POST" });
        const data = await response.json();

        if (response.ok) {
            alert(data.message);

            // Generar ticket de compra
            if (data.ticket) {
                const ticket = data.ticket;
                let ticketHTML = `
            <h2>${ticket.negocio}</h2>
            <p><strong>Fecha:</strong> ${ticket.fecha}</p>
            <p><strong>Número de Venta:</strong> ${ticket.idCompra}</p>
            <h3>Productos Comprados:</h3>
            <ul>
        `;

                ticket.productos.forEach((producto) => {
                    ticketHTML += `<li>${producto.nombre_pan} x${producto.cantidad}</li>`;
                });

                ticketHTML += `</ul><p><strong>Total:</strong> $${ticket.total} pesos</p>`;

                // Mostrar el ticket
                const ventanaTicket = window.open("", "_blank");
                ventanaTicket.document.write(ticketHTML);
                ventanaTicket.document.close();
            }

            cargarCarrito(); // Actualizar carrito
            consultarFondos(); // Actualizar fondos
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error("Error al realizar la compra:", error);
        alert("No se pudo completar la compra.");
    }
} 






async function consultarFondos() {
    const response = await fetch(`/consultarDinero`);
    const data = await response.json();
    if (response.ok) {
        document.getElementById('fondos').innerText = `Fondos: $${data.fondos} pesos`;
    } else {
        alert(data.message);
    }
}

async function recargarFondos() {
    const monto = parseFloat(prompt("Ingresa el monto a recargar:"));
    if (isNaN(monto) || monto <= 0) {
        return alert("Monto inválido.");
    }

    try {
        const response = await fetch(`/agregarDinero`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ monto })
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.message);
            consultarFondos(); // Actualizar fondos en el frontend
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error("Error al recargar fondos:", error);
        alert("Error al recargar fondos.");
    }
}




consultarFondos();
cargarCarrito();