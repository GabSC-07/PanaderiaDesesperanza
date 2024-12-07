CREATE DATABASE IF NOT EXISTS Desesperanza;
USE Desesperanza;

DROP TABLE IF EXISTS Inventario;
DROP TABLE IF EXISTS Factura_Cliente;
DROP TABLE IF EXISTS Direccion_Cliente;
DROP TABLE IF EXISTS Cliente;
DROP TABLE IF EXISTS Direccion;
DROP TABLE IF EXISTS Factura;
DROP TABLE IF EXISTS Pedido;

CREATE TABLE Inventario (
	id_pan INT NOT NULL AUTO_INCREMENT,
    nombre_pan VARCHAR(50) NOT NULL,
    descripcion VARCHAR(255),
    precio DECIMAL(10,2) NOT NULL,
    cantidad INT NOT NULL,
    PRIMARY KEY (id_pan)
);

CREATE TABLE Cliente (
	id_cliente INT NOT NULL AUTO_INCREMENT,
    nombre_cliente VARCHAR(50) NOT NULL,
    apellido_materno VARCHAR(50) NOT NULL,
    apellido_paterno VARCHAR(50) NOT NULL,
    sexo VARCHAR(10) NOT NULL,
    email VARCHAR(50),
    telefono VARCHAR(15),
	password_cliente VARCHAR(25) NOT NULL,
    PRIMARY KEY (id_cliente)
);

CREATE TABLE Administrador (
	id_admin INT NOT NULL AUTO_INCREMENT,
    nombre_admin VARCHAR(50) NOT NULL,
    password_admin VARCHAR(25) NOT NULL,
    PRIMARY KEY (id_admin)
);

CREATE TABLE Direccion (
	id_direccion INT NOT NULL AUTO_INCREMENT,
    calle VARCHAR(100) NOT NULL,
    numero_exterior SMALLINT NOT NULL,
    numero_interior INT,
    colonia VARCHAR(100) NOT NULL,
    alcaldia VARCHAR(100) NOT NULL,
    estado VARCHAR(100) NOT NULL,
    codigo_postal INT NOT NULL,
    pais VARCHAR(100) NOT NULL,
    PRIMARY KEY (id_direccion)
);

CREATE TABLE Direccion_Cliente (
    id_cliente INT NOT NULL,
    id_direccion INT NOT NULL,
    FOREIGN KEY (id_cliente) REFERENCES Cliente(id_cliente) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_direccion) REFERENCES Direccion(id_direccion) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Factura (
	id_factura INT NOT NULL AUTO_INCREMENT,
    fecha DATE NOT NULL,
    total DECIMAL NOT NULL,
    PRIMARY KEY(id_factura)
);

CREATE TABLE Factura_Cliente (
    id_cliente INT NOT NULL,
    id_factura INT NOT NULL,
    FOREIGN KEY (id_cliente) REFERENCES Cliente(id_cliente) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_factura) REFERENCES Factura(id_factura) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Pedido (
	id_pedido INT NOT NULL AUTO_INCREMENT,
    fecha_pedido DATE NOT NULL,
    estado_pedido VARCHAR(30) NOT NULL,
    PRIMARY KEY (id_pedido)
);


INSERT INTO Inventario (nombre_pan, descripcion, precio, cantidad) VALUES ('Pan de Muerto Tradicional', 'Pan de muerto clásico espolvoreado con azúcar y decorado con huesitos de masa.', 20.00, 30);
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

INSERT INTO Cliente (nombre_cliente, apellido_materno, appelido_paterno, sexo, email, telefono, password_cliente) VALUES ('Gabriel', 'Serratos', 'Cortés', 'Másculino', 'serratosgab75@gmail.com', '5520329207', '123456');
SELECT * FROM Cliente;

INSERT INTO Administrador (nombre_admin, password_admin) VALUES ('A', '1234');
SELECT * FROM Administrador;

