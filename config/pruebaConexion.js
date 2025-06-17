mysql = require('mysql');
oConexion = mysql.createConnection({
    host:'localhost',
    database:'tienda_videojuegos',
    user:'root',
    password:''

});

oConexion.connect(function (posibleError) {
    if (posibleError) {
        throw posibleError;
        oConexion.end();
    } else {
        console.log("conexion correcta");
        oConexion.end();
    }
});


