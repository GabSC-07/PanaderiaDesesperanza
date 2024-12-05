const express = require("express")
const mysql = require("mysql2")
var bodyParser = require('body-parser')
const session = require('express-session');

const path = require('path');

var app = express()
const db = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'n0m3l0',
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
    secret:'clave_secreta',
    resave:false,
    saveUninitialized:true
}));

app.use(express.urlencoded({extend:true}))
app.use(bodyParser.json())
app.use(express.json())
app.use(express.static(path.join(__dirname,'public')))

app.use(bodyParser.urlencoded({
    extended: true
}))
//app.use(express.static('public'))

app.post('/login', (req,res)=>{
    const{username, password}=req.body;

    if(!username || !password){
        return res.status(400).send('Por favor ingresa usuario y contraseña')
    }

    const sql = 'SELECT * FROM Administrador WHERE nombre_admin=?';
    db.query(sql,[username],(err,results)=>{
        if(err){
            console.log('Error al conectar', err)
            return res.status(500).send('Error en el servidor')
        }

        if (results.length===0) {
            const sql = 'SELECT * FROM Cliente WHERE nombre_cliente=?';
            db.query(sql,[username],(err,results)=>{
                if(err){
                    console.log('Error al conectar', err)
                    return res.status(500).send('Error en el servidor')
                }
                if (results.length===0) {
                    return res.status(401).send('Usuario no encontrado')
                }
                const user = results[0]
        
                if (password===user.password_cliente) {
                    req.session.userId=user.id;
                    req.session.username=user.username;
                    /*if (user.password_admin === '123456') {
                        res.sendFile(__dirname+'/public/admin.html')
                    } else {
                        res.sendFile(__dirname+'/public/cliente.html')
                    }*/
                        res.sendFile(__dirname+'/public/cliente.html')
                        
                } else {
                    res.status(401).send('Contraseña ncorrecta');
                }
            })
        } else {
        const user = results[0]

        if (password===user.password_admin) {
            req.session.userId=user.id;
            req.session.username=user.username;
                res.sendFile(__dirname+'/public/admin.html')

        } else {
            res.status(401).send('Contraseña Incorrecta');
        }
    }
    })
    
})

app.get('/logout', (req,res)=>{
    req.session.destroy((err)=>{
        if (err) {
            return res.status(500).send('Error al cerrar sesión');
        }
    })
    res.send('Sesión cerrada');
})



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