const express = require("express")
const session = require('express-session');
const mysql = require("mysql2")
var bodyParser = require('body-parser')

const path = require('path');

// La conexión a la DB
var app = express()
const db = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'GaSe_0c',     // GaSe_0c   <-- Mi contraseña xdd (no la quites jaja)
    database:'Desesperanza'
});
    
db.connect((err)=>{
    if(err){
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
app.use(express.urlencoded({extend:true}))
app.use(bodyParser.json())
app.use(express.json())
app.use(express.static(path.join(__dirname,'public')))
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
            return res.status(401).json({ message: 'Credenciales incorrectas.' });
        }

        // Guardar datos del usuario en la sesión
        req.session.id_cliente = resultados[0].id_cliente;
        req.session.nombre_cliente = resultados[0].nombre_cliente;

        console.log(req.session); 

        res.json({ message: 'Inicio de sesión exitoso.' });
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
            res.sendFile(__dirname+'/public/admin.html')
        });
    });
});

/*****         LOG OUT         *****/
app.get('/logout', (req,res)=>{
    req.session.destroy((err)=>{
        if (err) {
            return res.status(500).send('Error al cerrar sesión');
        }
    })
    res.sendFile(__dirname+'/public/index.html')
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
app.post('agregarProductos', autenticarUsuario, (req, res) => {
    const userId = req.session.id_cliente;
    const { productoId } = req.body;

    db.query('INSERT INTO Carrito (id_cliente, id_pan) VALUES (?, ?)', [userId, productoId], (err) => {
        if (err) {
            console.error('Error al agregar al carrito:', err);
            return res.status(500).json({ message: 'Error al agregar al carrito.' });
        }

        res.json({ message: 'Producto agregado al carrito.' });
    });
});

// Ruta para obtener el carrito del usuario autenticado
app.get('/carrito', autenticarUsuario, (req, res) => {
    const userId = req.session.userId;

    db.query('SELECT * FROM Carrito INNER JOIN Inventario ON Carrito.producto_id = Inventario.id WHERE Carrito.usuario_id = ?', [userId], (err, resultados) => {
        if (err) {
            console.error('Error al cargar el carrito:', err);
            return res.status(500).json({ message: 'Error al cargar el carrito.' });
        }

        res.json(resultados);
    });
});

// Ruta para procesar compra
app.post('/carrito/comprar', autenticarUsuario, (req, res) => {
    const userId = req.session.userId;

    // Procesar compra (validar fondos, calcular total, etc.)
    db.query('DELETE FROM Carrito WHERE usuario_id = ?', [userId], (err) => {
        if (err) {
            console.error('Error al procesar la compra:', err);
            return res.status(500).json({ message: 'Error al procesar la compra.' });
        }

        res.json({ message: 'Compra realizada con éxito.' });
    });
});




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
/*app.post('/actualizarProducto', (req, res) => {
    const id = req.body.id_pan;
    const nombre_pan = req.body.nombre_pan;
    const descripcion = req.body.descripcion;
    const precio = req.body.precio;
    const cantidad = req.body.cantidad;

    con.query(
        'UPDATE Inventario SET nombre_pan = ?, descripcion = ?, precio = ?, cantidad = ? WHERE id_pan = ?',
        [nombre_pan, descripcion, precio, cantidad, id],
        (err, resultado) => {
            if (err) {
                console.error("Error al actualizar el producto:", err);
                return res.status(500).send("Error al actualizar el producto");
            }

            if (resultado.affectedRows === 0) {
                return res.status(404).send("Producto no encontrado");
            }

            return res.send(`Producto con ID ${id} actualizado correctamente`);
        }
    );
});*/
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



app.listen(3001, ()=>{
    console.log(`Servidor corriendo en http://localhost:${3001}`)
})