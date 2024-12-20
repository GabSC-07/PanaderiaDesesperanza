-- CREAR LA BASE DE DATOS
CREATE DATABASE IF NOT EXISTS Desesperanza;
USE Desesperanza;

-- ASEGURARSE QUE NO EXISTAN LAS TABLAS
DROP TABLE IF EXISTS DetalleCompras;
DROP TABLE IF EXISTS HistorialCompras;
DROP TABLE IF EXISTS Carrito;
DROP TABLE IF EXISTS Pedido;
DROP TABLE IF EXISTS Inventario;
DROP TABLE IF EXISTS Cliente;
DROP TABLE IF EXISTS Administrador;

-- CREAR LAS TABLAS
CREATE TABLE IF NOT EXISTS Inventario (
	id_pan INT NOT NULL AUTO_INCREMENT,
    nombre_pan VARCHAR(50) NOT NULL,
    descripcion VARCHAR(255),
    precio DECIMAL(10,2) NOT NULL,
    cantidad INT NOT NULL,
    PRIMARY KEY (id_pan)
);

CREATE TABLE IF NOT EXISTS Cliente (
	id_cliente INT NOT NULL AUTO_INCREMENT,
    nombre_cliente VARCHAR(50) NOT NULL,
    email VARCHAR(50),
    telefono VARCHAR(15),
	password_cliente VARCHAR(25) NOT NULL,
    fondos DECIMAL(10,2) DEFAULT 10,
    PRIMARY KEY (id_cliente)
);

CREATE TABLE IF NOT EXISTS Administrador (
	id_admin INT NOT NULL AUTO_INCREMENT,
    nombre_admin VARCHAR(50) NOT NULL,
    password_admin VARCHAR(25) NOT NULL,
    PRIMARY KEY (id_admin)
);

CREATE TABLE IF NOT EXISTS Pedido (
	id_pedido INT NOT NULL AUTO_INCREMENT,
    fecha_pedido DATE NOT NULL,
    estado_pedido VARCHAR(30) NOT NULL,
    PRIMARY KEY (id_pedido)
); 

CREATE TABLE IF NOT EXISTS Carrito (
    id_carrito INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    id_pan INT NOT NULL,
    FOREIGN KEY (id_cliente) REFERENCES Cliente(id_cliente),
    FOREIGN KEY (id_pan) REFERENCES Inventario(id_pan)
);

CREATE TABLE IF NOT EXISTS HistorialCompras (
    id_compra INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    fecha_compra DATETIME DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (id_cliente) REFERENCES Cliente(id_cliente)
);

CREATE TABLE IF NOT EXISTS DetalleCompras (
    id_detalle INT AUTO_INCREMENT PRIMARY KEY,
    id_compra INT NOT NULL,
    id_pan INT NOT NULL,
    cantidad INT NOT NULL,
    FOREIGN KEY (id_compra) REFERENCES HistorialCompras(id_compra),
    FOREIGN KEY (id_pan) REFERENCES Inventario(id_pan)
);


/*	INSERTAR DATOS	*/

-- CREAR UN ADMIN Y UN CLIENTE
INSERT INTO Administrador (nombre_admin, password_admin) VALUES ('Hector', '12345678');
SELECT * FROM Administrador;

INSERT INTO Cliente (nombre_cliente, email, telefono, password_cliente) VALUES ('Gabriel', 'serratosgab75@gmail.com', '5520329207', '12345678');
SELECT * FROM Cliente;

-- CREAR LA LISTA DE PRODUCTOS DEL INVENTARIO
INSERT INTO Inventario (nombre_pan, descripcion, precio, cantidad) VALUES ('Stollen', 'Pastel de pan dulce relleno de frutas y nueces, cubierto con azúcar glas', 34.99, 20);
INSERT INTO Inventario (nombre_pan, descripcion, precio, cantidad) VALUES ('Momia de Chocolate', 'Pan de chocolate cubierto con líneas de crema pastelera simulando vendajes de momia y ojos de azúcar.', 28.00, 50);
INSERT INTO Inventario (nombre_pan, descripcion, precio, cantidad) VALUES ('Calaverita de Chocolate', 'Pan de leche relleno de crema de chocolate y decorado como calavera con glaseado colorido', 32.50, 66);
INSERT INTO Inventario (nombre_pan, descripcion, precio, cantidad) VALUES ('Esqueleto de Panqué', 'Panqué de vainilla en forma de de esqueleto con detalles en glaseado negro y blanco', 30.00, 25);
INSERT INTO Inventario (nombre_pan, descripcion, precio, cantidad) VALUES ('Cráneo de Pan de Elote', 'Pan de elote en forma de calavera con toques de canela y glaseado rojo.', 28, 40);
INSERT INTO Inventario (nombre_pan, descripcion, precio, cantidad) VALUES ('Tumba de Brownie', 'Pan relleno de mermelada de frutos rojos, cubierto con chocolate oscuro y decorado con colmillos de azúcar.', 27.00, 70);
INSERT INTO Inventario (nombre_pan, descripcion, precio, cantidad) VALUES ('Fantasmitas de Coco', 'Pan de coco espolvoreado con azúcar blanca y con ojitos de chocolate para simular fantasmas.', 27.50, 43);
INSERT INTO Inventario (nombre_pan, descripcion, precio, cantidad) VALUES ('Pan de Muerto de Chocolate', 'Pan de muerto de chocolate, con un toque de canela y azúcar glass en la superficie.', 22.00, 19);
INSERT INTO Inventario (nombre_pan, descripcion, precio, cantidad) VALUES ('Calaverita de Canela', 'Pan en forma de calavera con canela y azúcar morena, decorado con detalles de chocolate.', 23.00, 50);
INSERT INTO Inventario (nombre_pan, descripcion, precio, cantidad) VALUES ('Altar de Churro', 'Churro en forma de cruz, espolvoreado con azúcar y canela, perfecto para ofrendas.', 18.00, 23);

SELECT * FROM Inventario;
