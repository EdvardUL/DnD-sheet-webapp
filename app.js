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
  pool.query("SELECT * FROM users", function(err, data) {
    if(err) return console.log(err);
    for(let i=0; i < data.length; i++){
      if(name == data[i].name && password == data[i].password)
      {
        res.send("<h2>Hello</h2>");
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
 
app.listen(3000, function(){
  console.log("Сервер ожидает подключения...");
});