const express = require('express')
mysql = require('mysql');
oConexion = mysql.createConnection({
  host: 'localhost',
  database: 'tienda_videojuegos',
  user: 'root',
  password: '',
  multipleStatements: true
});

const app = express()
const port = 3000



const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/rs'); // Carpeta donde se guardarán las imágenes
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Nombre único
  }
});
const upload = multer({ storage: storage });

app.use(express.urlencoded({ extended: false }))

app.get('/', (req, res) => {
  res.redirect('Inicio-sesion');
});
app.get('/inicio-sesion', (req, res) => {
  res.render('Inicio-sesion');
});
app.get('/menu', (req, res) => {
  res.render('Menu');
});
app.get('/FatalFury', (req, res) => {
  res.render('FatalFury');
});
app.get('/FFXVI', (req, res) => {
  res.render('FFXVI');
});
app.get('/Ofertas', (req, res) => {
  const sql = `
    SELECT 
      juegos.*,
      plataformas.nombre AS plataforma
    FROM juegos
    LEFT JOIN plataformas ON juegos.plataforma_id = plataformas.id
    ORDER BY juegos.id DESC
    LIMIT 12
  `;
  oConexion.query(sql, (error, juegos) => {
    if (error) return res.status(500).send("Error al cargar juegos");
    res.render('Ofertas', { juegos });
  });
});
app.get('/MisJuegos', (req, res) => {
  res.render('MisJuegos');
});
app.get('/Assassins', (req, res) => {
  res.render('Assassins');
});
app.get('/agregarJuegos', (req, res) => {
  const sqlJuegos = `
    SELECT 
      juegos.*,
      plataformas.nombre AS plataforma,
      distribuidores.nombre AS distribuidor,
      desarrolladores.nombre AS desarrollador
    FROM juegos
    LEFT JOIN plataformas ON juegos.plataforma_id = plataformas.id
    LEFT JOIN distribuidores ON juegos.distribuidor_id = distribuidores.id
    LEFT JOIN desarrolladores ON juegos.desarrollador_id = desarrolladores.id
  `;
  const sqlPlataformas = "SELECT * FROM plataformas";
  const sqlDistribuidores = "SELECT * FROM distribuidores";
  const sqlDesarrolladores = "SELECT * FROM desarrolladores";
  oConexion.query(sqlJuegos, (error, juegos) => {
    if (error) return res.status(500).send("Error en juegos");
    oConexion.query(sqlPlataformas, (err, plataformas) => {
      if (err) return res.status(500).send("Error en plataformas");
      oConexion.query(sqlDistribuidores, (err2, distribuidores) => {
        if (err2) return res.status(500).send("Error en distribuidores");
        oConexion.query(sqlDesarrolladores, (err3, desarrolladores) => {
          if (err3) return res.status(500).send("Error en desarrolladores");
          res.render('agregarJuegos', { juegos, plataformas, distribuidores, desarrolladores });
        });
      });
    });
  });
});




app.get('/admin', (req, res) => {
  const sql = "SELECT * FROM usuarios";
  oConexion.query(sql, function (error, results) {
    if (error) {
      console.error("Error en la consulta:", error);
      return res.status(500).send("Error en el servidor");
    }
    res.render('admin', { personas: results });
  });
});

app.get('/home', (req, res) => {
  const sql = "SELECT * FROM usuarios";
  oConexion.query(sql, function (error, results) {
    if (error) {
      throw error;
    } else {
      console.log("Resultados:", results);
      res.render('home', { personas: results });
    }
  });
});

  app.get('/editarPersona/:id', (req, res) => {
    id = req.params.id;
    sql = "SELECT * FROM usuarios WHERE id = "+id+"";
    oConexion.query(sql, (error, results) => {
      if (error) {
        throw error;
      } else {
        res.render('editarPersona', { persona: results[0] });
      }
    });
  });

app.post("/insertar", (req, res) => {
  result = req.body;
  sql = "insert into usuarios values (null,'" + result.nombre + "','" + result.apellido + "','" + result.correo + "','" + result.contrasena + "','" + result.telefono + "','" + result.direccion + "','" + result.pais + "')";
  oConexion.query(sql, function (error) {
    if (error) {
      throw error;
    } else {
      res.redirect("/home");
      console.log("Registro correcto");
    }
  })
})

app.post('/login', (req, res) => {
  const { usuar, password } = req.body;
  const sql = "SELECT * FROM usuarios WHERE correo = ? AND contrasena = ?";
  oConexion.query(sql, [usuar, password], function (error, results) {
    if (error) {
      return res.status(500).send("Error en el servidor");
    }
    if (results.length > 0) {
      return res.status(200).send("ok");
    } else {
      return res.status(401).send("Credenciales incorrectas");
    }
  });
});

app.post('/actualizar/:id', (req, res) => {
  id = req.params.id;
  result = req.body;
  sql = "UPDATE usuarios SET nombre = '"+result.nombre+"', apellido = '"+result.apellido+"', correo = '"+result.correo+"', pais = '"+result.pais+"' WHERE id = "+id+"";
  oConexion.query(sql, (error) => {
    if (error) {
    } else {
      res.redirect('/admin');
      console.log("Registro actualizado correctamente");
    }
  })
})

app.post('/borrar', (req, res) => {
  id = req.body.idpersona;
  sql = "DELETE FROM usuarios WHERE id = "+id+"";
  oConexion.query(sql, (error) => {
    if (error) {
    } else {
      res.redirect('/admin');
      console.log("Registro eliminado correctamente");
    }
  })
})








app.post('/borrarJuego', (req, res) => {
  const id = req.body.idjuego;
  const sql = "DELETE FROM juegos WHERE id = ?";
  oConexion.query(sql, [id], (error) => {
    if (error) {
      console.error("Error al borrar juego:", error);
      return res.status(500).send("Error al borrar juego");
    }
    res.redirect('/agregarJuegos');
  });
});


app.get('/editarJuego/:id', (req, res) => {
  const id = req.params.id;
  const sql = `
    SELECT * FROM juegos WHERE id = ?
  `;
  oConexion.query(sql, [id], (error, results) => {
    if (error) {
      console.error("Error al consultar juego:", error);
      return res.status(500).send("Error en el servidor");
    }
    if (results.length === 0) {
      return res.status(404).send("Juego no encontrado");
    }
    // Puedes consultar plataformas, distribuidores y desarrolladores para los selects
    const juego = results[0];
    oConexion.query(
      "SELECT * FROM plataformas; SELECT * FROM distribuidores; SELECT * FROM desarrolladores;",
      (err, results2) => {
        if (err) return res.status(500).send("Error cargando datos relacionados");
        res.render('editarJuego', {
          juego,
          plataformas: results2[0],
          distribuidores: results2[1],
          desarrolladores: results2[2]
        });
      }
    );
  });
});


app.post('/actualizarJuego/:id', (req, res) => {
  const id = req.params.id;
  const {
    nombre, precio, formato, stock, plataforma_id, fecha_lanzamiento,
    distribuidor_id, desarrollador_id, peso_mb, online, esrb
  } = req.body;
  const sql = `
    UPDATE juegos SET
      nombre = ?, precio = ?, formato = ?, stock = ?, plataforma_id = ?,
      fecha_lanzamiento = ?, distribuidor_id = ?, desarrollador_id = ?,
      peso_mb = ?, online = ?, esrb = ?
    WHERE id = ?
  `;
  oConexion.query(sql, [
    nombre, precio, formato, stock, plataforma_id, fecha_lanzamiento,
    distribuidor_id, desarrollador_id, peso_mb, online ? 1 : 0, esrb, id
  ], (error) => {
    if (error) {
      console.error("Error al actualizar juego:", error);
      return res.status(500).send("Error al actualizar juego");
    }
    res.redirect('/agregarJuegos');
  });
});




app.post('/insertarJuego', upload.single('imagenFile'), (req, res) => {
  // Aquí req.body debe tener los campos del formulario
  // req.file tendrá la imagen
  const {
    nombre, precio, formato, stock, plataforma_id, fecha_lanzamiento,
    distribuidor_id, desarrollador_id, peso_mb, online, esrb
  } = req.body;
  let imagen = '';
  if (req.file) {
    imagen = '/rs/' + req.file.filename;
  }
  const sql = `
    INSERT INTO juegos
    (nombre, precio, formato, stock, plataforma_id, fecha_lanzamiento, distribuidor_id, desarrollador_id, peso_mb, online, esrb, imagen)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  oConexion.query(sql, [
    nombre, precio, formato, stock || null, plataforma_id, fecha_lanzamiento || null,
    distribuidor_id, desarrollador_id, peso_mb || null, online ? 1 : 0, esrb, imagen
  ], (error) => {
    if (error) {
      console.error("Error al insertar juego:", error);
      return res.status(500).send("Error al insertar juego");
    }
    res.redirect('/agregarJuegos');
  });
});

app.set("view engine", "ejs");
app.set("views", __dirname + "/../views");

app.use(express.static("public"))

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
