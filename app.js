const mysql = require("mysql2");
const express = require("express");
 
const app = express();
const urlencodedParser = express.urlencoded({extended: false});
app.use(express.static('public'));
 
const pool = mysql.createPool({
  connectionLimit: 5,
  host: "localhost",
  user: "root",
  database: "test",
  password: "root"
});
 
app.set("view engine", "hbs");

current_id = 0;


// получение списка пользователей
app.get("/", function(req, res){
    pool.query("SELECT * FROM users", function(err, data) {
      if(err) return console.log(err);
      res.render("index.hbs", {
          users: data
      });
    });
});
app.get("/check",function(req,res){
  res.render("check.hbs");
});
app.post("/check",urlencodedParser,function(req,res)
{
  if(!req.body) return res.sendStatus(400);
  let _i = 0;
  const name = req.body.name;
  const password = req.body.password;
  const id = req.params.id;
  pool.query("SELECT * FROM users", function(err, data) {
    if(err) return console.log(err);
    for(let i=0; i < data.length; i++){
      if(name == data[i].name && password == data[i].password)
      {
        current_id = data[i].id
        res.redirect("/characters");
      }
      else _i++;
    }
    if(_i == data.length){res.redirect("/inputError");}
  });
});
app.get("/inputError",function(req,res){
  res.render("inputError.hbs")
})
// возвращаем форму для добавления данных
app.get("/create", function(req, res){
    res.render("create.hbs");
});
// получаем отправленные данные и добавляем их в БД 
app.post("/create", urlencodedParser, function (req, res) {
         
    if(!req.body) return res.sendStatus(400);
    const name = req.body.name;
    const password = req.body.password;
    pool.query("INSERT INTO users (name, password) VALUES (?,?)", [name, password], function(err, data) {
      if(err) return console.log(err);
      res.redirect("/");
    });
});
app.get("/edit/:id", function(req, res){
  const id = req.params.id;
  pool.query("SELECT * FROM users WHERE id=?", [id], function(err, data) {
    if(err) return console.log(err);
     res.render("edit.hbs", {
        user: data[0]
    });
  });
});
// получаем отредактированные данные и отправляем их в БД
app.post("/edit", urlencodedParser, function (req, res) {
         
  if(!req.body) return res.sendStatus(400);
  const name = req.body.name;
  const password = req.body.password;
  const id = req.body.id;
  pool.query("UPDATE users SET name=?, password=? WHERE id=?", [name, password, id], function(err, data) {
    if(err) return console.log(err);
    res.redirect("/");
  });
});
 
// получаем id удаляемого пользователя и удаляем его из бд
app.post("/delete/:id", function(req, res){
  const id = req.params.id;
  pool.query("DELETE FROM users WHERE id=?", [id], function(err, data) {
    if(err) return console.log(err);
    res.redirect("/");
  });
});
app.get("/characters", function(req, res){
  pool.query("SELECT * FROM characters WHERE id_user=?",[current_id], function(err, data) {
    if(err) return console.log(err);
    res.render("characters.hbs", {
      characters: data
    });
  });
});
app.get("/edit_character/:id", function(req, res){
  const id = req.params.id;
  pool.query("SELECT * FROM characters WHERE id=?", [id], function(err, data) {
    if(err) return console.log(err);
     res.render("edit_character.hbs", {
        character: data[0]
    });
  });
});
app.post("/edit_character", urlencodedParser, function (req, res) {
         
  if(!req.body) return res.sendStatus(400);
  const name = req.body.name;
  const Class = req.body.class;
  const id = req.body.id;
  pool.query("UPDATE characters SET name=?, class=? WHERE id=?", [name, Class, id], function(err, data) {
    if(err) return console.log(err);
    res.redirect("/characters");
  });
});
app.get("/create_character", function(req, res){
  res.render("create_character.hbs");
});
// получаем отправленные данные и добавляем их в БД 
app.post("/create_character", urlencodedParser, function (req, res) {
  if(!req.body) return res.sendStatus(400);
  const name = req.body.name;
  const Class = req.body.class;
  const race = req.body.race;
  pool.query("INSERT INTO characters (id_user, name, class, race) VALUES (?,?,?,?)", [current_id,name, Class,race], function(err, data) {
    if(err) return console.log(err);
    res.redirect("/characters");
  });
});
app.post("/sort_character", function(req, res){
  pool.query("SELECT * FROM characters WHERE id_user=? ORDER BY name",[current_id], function(err, data) {
    if(err) return console.log(err);
    res.render("characters.hbs", {
      characters: data
    });
  });
});
app.post("/find_character",urlencodedParser,function(req,res)
{
  if(!req.body) return res.sendStatus(400);
  let _i = 0;
  const name = req.body.needble_name;
  const id = req.params.id;
  pool.query("SELECT * FROM characters WHERE id_user =?",[current_id], function(err, data) {
    if(err) return console.log(err);
    for(let i=0; i < data.length; i++){
      if(name == data[i].name)
      {
        res.render("<h2>Hello</h2>");
      }
      else _i++;
    }
    if(_i == data.length){res.redirect("/inputError");}
  });
});
app.listen(3000, function(){
  console.log("Сервер ожидает подключения...");
});