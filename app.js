const express = require("express")
const session = require('express-session');
const mysql = require("mysql2")
var bodyParser = require('body-parser')

const path = require('path');

// La conexión a la DB
var app = express()
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'GaSe_0c',     // GaSe_0c   <-- Mi contraseña xdd (no la quites jaja)
    database: 'Desesperanza'
});

db.connect((err) => {
    if (err) {
        console.log('Error al conectar', err)
        return;
    }
    console.log('Conectado a la BD')
});

app.use(session({
    secret: 'clave_secreta',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 3600000 } // 1 hora
}));


// Cosas xd
app.use(express.urlencoded({ extend: true }))
app.use(bodyParser.json())
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))
//app.use(express.static('public'))

app.use(bodyParser.urlencoded({
    extended: true
}))


/*****         SIGN IN         *****/
app.post('/signin', (req, res) => {
    const { nombre_cliente, password_cliente } = req.body;

    db.query('SELECT * FROM Cliente WHERE nombre_cliente = ? AND password_cliente = ?', [nombre_cliente, password_cliente], (err, resultados) => {
        if (err) {
            console.error('Error al iniciar sesión:', err);
            return res.status(500).json({ message: 'Error en el servidor.' });
        }

        if (resultados.length === 0) {
            const { nombre_cliente, password_cliente } = req.body;

            db.query('SELECT * FROM Administrador WHERE nombre_admin = ? AND password_admin = ?', [nombre_cliente, password_cliente], (err, resultados) => {
                if (err) {
                    console.error('Error al iniciar sesión:', err);
                    return res.status(500).json({ message: 'Error en el servidor.' });
                }

                if (resultados.length === 0) {
                    return res.status(401).json({ message: 'Credenciales incorrectas.' });
                }

                // Guardar datos del usuario en la sesión
                req.session.id_cliente = resultados[0].id_admin;
                req.session.nombre_cliente = resultados[0].nombre_admin;

                console.log(req.session);
                req.session.role = "admin"; // Agregar el rol de admin
                res.json({ message: 'Inicio de sesión exitoso.', role: 'admin' });
            }); 
        } else {
 
        // Guardar datos del usuario en la sesión
        req.session.id_cliente = resultados[0].id_cliente;
        req.session.nombre_cliente = resultados[0].nombre_cliente;

        console.log(req.session);
        req.session.role = "cliente"; // Agregar el rol de cliente
        res.json({ message: 'Inicio de sesión exitoso.', role: 'cliente' });}
    });
});

/*****         SIGN UP         *****/
app.post('/signup', (req, res) => {
    const { username, email, telefono, password } = req.body;

    // Validar los campos
    if (!username || !password || !email || !telefono) {
        return res.status(400).send('Por favor completa todos los campos');
    }

    // Verificar si el usuario ya existe
    const checkUserQuery = 'SELECT * FROM Cliente WHERE nombre_cliente = ? OR email = ? OR telefono = ?';
    db.query(checkUserQuery, [username, email, telefono], (err, results) => {
        if (err) {
            console.error('Error al verificar usuario:', err);
            return res.status(500).send('Error en el servidor');
        }

        if (results.length > 0) {
            return res.status(409).send('El usuario o el correo ya están registrados');
        }

        // Insertar el nuevo usuario en la base de datos
        const insertUserQuery = 'INSERT INTO Cliente (nombre_cliente, email, telefono, password_cliente) VALUES (?, ?, ?, ?)';
        db.query(insertUserQuery, [username, email, telefono, password], (err, results) => {
            if (err) {
                console.error('Error al registrar usuario:', err);
                return res.status(500).send('Error en el servidor');
            }
            res.sendFile(__dirname + '/public/signin.html')
        });
    });
});

/*****         LOG OUT         *****/
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Error al cerrar sesión');
        }
    })
    res.sendFile(__dirname + '/public/index.html')
})

// Verificar si el usuario está autenticado
function autenticarUsuario(req, res, next) {
    if (!req.session.id_cliente) {
        return res.status(401).json({ message: 'Usuario no autenticado.' });
    }
    next();
}



/*****         EL CARRITO         *****/

// Mostrar el inventario (si otra vez)
app.get('/mostrarProductos', (req, res) => {
    db.query('SELECT * FROM Inventario', (err, resultados) => {
        if (err) {
            console.error('Error al cargar los productos:', err);
            return res.status(500).json({ message: 'Error al cargar los productos.' });
        }

        const productos = resultados.map(producto => ({
            id: producto.id_pan,
            nombre: producto.nombre_pan,
            precio: producto.precio
        }));

        res.json(productos);
    });
});

// Agregar los productos al carrito
app.post('/agregarProductos', autenticarUsuario, (req, res) => {
    const userId = req.session.id_cliente;
    const { productoId } = req.body;

    // Verificar si hay stock disponible
    db.query('SELECT cantidad FROM Inventario WHERE id_pan = ?', [productoId], (err, resultados) => {
        if (err) {
            console.error('Error al verificar el stock:', err);
            return res.status(500).json({ message: 'Error al verificar el stock.' });
        }

        if (resultados.length === 0 || resultados[0].cantidad <= 0) {
            return res.status(400).json({ message: 'Producto agotado. No se puede agregar al carrito.' });
        }

        // Si hay stock, agregar al carrito
        db.query('INSERT INTO Carrito (id_cliente, id_pan) VALUES (?, ?)', [userId, productoId], (err) => {
            if (err) {
                console.error('Error al agregar al carrito:', err);
                return res.status(500).json({ message: 'Error al agregar al carrito.' });
            }

            res.json({ message: 'Producto agregado al carrito.' });
        });
    });
});

// Mostrar el carrito
app.get('/mostrarCarrito', autenticarUsuario, (req, res) => {
    const userId = req.session.id_cliente;

    db.query('SELECT * FROM Carrito INNER JOIN Inventario ON Carrito.id_pan = Inventario.id_pan WHERE Carrito.id_cliente = ?', [userId], (err, resultados) => {
        if (err) {
            console.error('Error al cargar el carrito:', err);
            return res.status(500).json({ message: 'Error al cargar el carrito.' });
        }

        res.json(resultados);
    });
});

// Eliminar producto del carrito
app.delete('/eliminarProducto', autenticarUsuario, (req, res) => {
    const { id_carrito } = req.body;

    db.query('DELETE FROM Carrito WHERE id_carrito = ?', [id_carrito], (err, resultado) => {
        if (err) {
            console.error('Error al eliminar del carrito:', err);
            return res.status(500).json({ message: 'Error al eliminar del carrito.' });
        }

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ message: 'Producto no encontrado en el carrito.' });
        }

        res.json({ message: 'Producto eliminado del carrito.' });
    });
});



/*****         COMPRAS Y DINERO         *****/

// Consultar el dinero del usuario
app.get('/consultarDinero', autenticarUsuario, (req, res) => {
    const userId = req.session.id_cliente;

    db.query('SELECT fondos FROM Cliente WHERE id_cliente = ?', [userId], (err, resultados) => {
        if (err || resultados.length === 0) {
            console.error('Error al consultar los fondos:', err);
            return res.status(500).json({ message: 'Error al consultar los fondos.' });
        }
        res.json({ fondos: resultados[0].fondos });
    });
});

// Agregar dinero
app.post('/agregarDinero', autenticarUsuario, (req, res) => {
    const userId = req.session.id_cliente; // Usuario autenticado
    const { monto } = req.body;

    // Validar el monto
    if (monto <= 0 || monto > 999999999999) {
        return res.status(400).json({ message: 'Monto inválido.' });
    }

    // Consultar fondos actuales
    db.query('SELECT fondos FROM Cliente WHERE id_cliente = ?', [userId], (err, resultados) => {
        if (err || resultados.length === 0) {
            console.error('Error al consultar los fondos actuales:', err);
            return res.status(500).json({ message: 'Error al recargar fondos.' });
        }

        const fondosActuales = parseFloat(resultados[0].fondos);
        const nuevosFondos = fondosActuales + parseFloat(monto);

        // Actualizar fondos en la base de datos
        db.query('UPDATE Cliente  SET fondos = ? WHERE id_cliente = ?', [nuevosFondos, userId], (err) => {
            if (err) {
                console.error('Error al actualizar los fondos:', err);
                return res.status(500).json({ message: 'Error al recargar fondos.' });
            }

            // Confirmar la recarga
            res.json({ message: 'Fondos recargados con éxito.', nuevosFondos });
        });
    });
});

// Comprar los productos del carrito
app.post('/comprarCarrito', async (req, res) => {
    try {
        const idCliente = req.session.id_cliente;
        if (!idCliente) {
            return res.status(400).json({ message: "Cliente no identificado." });
        }

        db.query('SELECT SUM(I.precio) AS total FROM Carrito C INNER JOIN Inventario I ON C.id_pan = I.id_pan WHERE C.id_cliente = ?', [idCliente], (err, resultados) => {
            if (err) {
                console.error('Error al calcular el total del carrito:', err);
                return res.status(500).json({ message: "Error interno del servidor." });
            }

            const total = parseFloat(resultados[0]?.total || 0);
            if (total <= 0) {
                return res.status(400).json({ message: "El carrito está vacío o el total es inválido." });
            }

            db.query('SELECT fondos FROM Cliente WHERE id_cliente = ?', [idCliente], (err, resultadosCliente) => {
                if (err || resultadosCliente.length === 0) {
                    console.error('Error al consultar los fondos del cliente:', err);
                    return res.status(500).json({ message: "Error al consultar los fondos." });
                }

                const fondosActuales = parseFloat(resultadosCliente[0].fondos);
                if (fondosActuales < total) {
                    return res.status(400).json({ message: "Fondos insuficientes." });
                }

                const nuevosFondos = fondosActuales - total;

                db.beginTransaction((err) => {
                    if (err) {
                        console.error('Error al iniciar la transacción:', err);
                        return res.status(500).json({ message: "Error interno del servidor." });
                    }

                    // Actualizar fondos
                    db.query('UPDATE Cliente SET fondos = ? WHERE id_cliente = ?', [nuevosFondos, idCliente], (err) => {
                        if (err) {
                            return db.rollback(() => {
                                console.error('Error al actualizar fondos:', err);
                                res.status(500).json({ message: "Error al actualizar fondos." });
                            });
                        }

                        // Registrar la compra
                        db.query('INSERT INTO HistorialCompras (id_cliente, total) VALUES (?, ?)', [idCliente, total], (err, resultado) => {
                            if (err) {
                                return db.rollback(() => {
                                    console.error('Error al registrar la compra:', err);
                                    res.status(500).json({ message: "Error al registrar la compra." });
                                });
                            }

                            const idCompra = resultado.insertId;

                            // Obtener productos del carrito
                            db.query('SELECT I.nombre_pan, COUNT(C.id_pan) AS cantidad FROM Carrito C INNER JOIN Inventario I ON C.id_pan = I.id_pan WHERE C.id_cliente = ? GROUP BY C.id_pan', [idCliente], (err, productos) => {
                                if (err) {
                                    return db.rollback(() => {
                                        console.error('Error al obtener productos del carrito:', err);
                                        res.status(500).json({ message: "Error al procesar la compra." });
                                    });
                                }

                                // Limpiar el carrito
                                db.query('DELETE FROM Carrito WHERE id_cliente = ?', [idCliente], (err) => {
                                    if (err) {
                                        return db.rollback(() => {
                                            console.error('Error al limpiar el carrito:', err);
                                            res.status(500).json({ message: "Error al limpiar el carrito." });
                                        });
                                    }

                                    db.commit((err) => {
                                        if (err) {
                                            return db.rollback(() => {
                                                console.error('Error al confirmar la transacción:', err);
                                                res.status(500).json({ message: "Error interno del servidor." });
                                            });
                                        }

                                        // Devuelve datos para el ticket
                                        res.json({
                                            message: "Compra realizada con éxito.",
                                            ticket: {
                                                negocio: "Panadería La Desesperanza",
                                                fecha: new Date().toLocaleString(),
                                                productos,
                                                total,
                                                idCompra
                                            }
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    } catch (error) {
        console.error('Error al realizar la compra:', error);
        res.status(500).json({ message: "Error interno del servidor." });
    }
});



/*****         HISTORIAL DE COMPRAS DEL ADMIN         *****/

app.get('/historialCompras', (req, res) => {
    const { fechaInicio, fechaFin } = req.query;

    if (!fechaInicio || !fechaFin) {
        return res.status(400).json({ message: "Debe proporcionar las fechas de inicio y fin." });
    }

    db.query(
        'SELECT H.id_compra, H.fecha_compra, H.total, C.nombre_cliente FROM HistorialCompras H INNER JOIN Cliente C ON H.id_cliente = C.id_cliente WHERE H.fecha_compra BETWEEN ? AND ? ORDER BY H.fecha_compra DESC',
        [fechaInicio, fechaFin],
        (err, resultados) => {
            if (err) {
                console.error('Error al consultar el historial de compras:', err);
                return res.status(500).json({ message: "Error interno del servidor." });
            }

            res.json(resultados);
        }
    );
});



/*****         EL INVENTARIO         *****/

// Crear producto
app.post('/agregarProducto', (req, res) => {
    let nombre_pan = req.body.nombre_pan;
    let descripcion = req.body.descripcion;
    let precio = req.body.precio;
    let cantidad = req.body.cantidad;

    db.query(
        'INSERT INTO Inventario (nombre_pan, descripcion, precio, cantidad) VALUES (?, ?, ?, ?)',
        [nombre_pan, descripcion, precio, cantidad],
        (err, respuesta) => {
            if (err) {
                console.log("Error al conectar", err);
                return res.status(500).send("Error al conectar");
            }
            if (descripcion === '') {
                descripcion = 'Sin descripción';
            }
            return res.json({ message: "Producto agregado correctamente", producto: { id: respuesta.insertId, nombre_pan, descripcion, precio, cantidad } });

        }
    );
});

// Ver Productos
app.get('/verInventario', (req, res) => {
    db.query('SELECT * FROM Inventario', (err, respuesta) => {
        if (err) return res.status(500).send('Error al cargar el inventario.');

        let inventarioHTML = `
            <table class="productos" border="5">
                <tr class="lawea">
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th>Precio</th>
                    <th>Cantidad</th>
                </tr>`;

        respuesta.forEach((producto, index) => {
            inventarioHTML += `
                <tr class="dos">
                    <td>${index + 1}</td>
                    <td>${producto.nombre_pan}</td>
                    <td>${producto.descripcion}</td>
                    <td>${producto.precio}</td>
                    <td>${producto.cantidad}</td>
                </tr>`;
        });

        inventarioHTML += `</table>`;
        return res.send(inventarioHTML);
    });
});

// Borrar producto
app.post('/borrarProducto', (req, res) => {
    const id = req.body.id;
    db.query('DELETE FROM Inventario WHERE id_pan = ?', [id], (err, resultado, fields) => {
        if (err) {
            console.error('Error al borrar el producto:', err);
            return res.status(500).json({ message: "Error al borrar el producto" });
        }
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }
        return res.json({ message: "Producto eliminado correctamente" });
    });
});

// Actualizar producto
app.post('/actualizarProducto', (req, res) => {
    const { id_pan, nombre_pan, descripcion, precio, cantidad } = req.body;

    db.query(
        'UPDATE Inventario SET nombre_pan = ?, descripcion = ?, precio = ?, cantidad = ? WHERE id_pan = ?',
        [nombre_pan, descripcion, precio, cantidad, id_pan],
        (err, resultado) => {
            if (err) {
                console.error("Error al actualizar el producto:", err);
                return res.status(500).json({ message: "Error al actualizar el producto" });
            }

            if (resultado.affectedRows === 0) {
                return res.status(404).json({ message: "Producto no encontrado" });
            }

            return res.json({ message: `Producto actualizado correctamente` });
        }
    );
});



// Ya aqui acabo
app.listen(3001, () => {
    console.log(`Servidor corriendo en http://localhost:${3001}`)
})