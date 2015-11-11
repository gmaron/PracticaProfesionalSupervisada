var express = require("express");
var app = express();

var path = require('path');
var appDir = path.dirname(require.main.filename);
var fs = require('fs');
var exec = require('child_process').exec;
var Sequence =  require('sequence').Sequence;
var sequence = Sequence.create();


app.set('view options', { layout: false });
app.set('view engine', 'ejs');

var comandoTop = "";
var comandoFree = "";
var comandoWho = "";


var intervalWho;
var intervalTop; 
var intervalFree;

function ejecutarTop(){
    child = exec("top -n 1 -b > top.txt", function (error, stdout, stderr) {
          if (error !== null) {
            console.log('exec error: ' + error);
          }
      });
}
         
function ejecutarWho(){
    child = exec("w > who.txt", function (error, stdout, stderr) {
        if (error !== null) {
            console.log('exec error: ' + error);
        }
    });
}

function ejecutarFree(){
    child = exec("free -m > free.txt", function (error, stdout, stderr) {
        if (error !== null) {
            console.log('exec error: ' + error);
        }
    });   
}


app.get("/", function (req, res) {
    intervalTop = setInterval (ejecutarTop,500);
    clearInterval(intervalWho);
    clearInterval(intervalFree);
    res.render(appDir + '/app.ejs', {title:"Galileo / Comando Top",comando:"top",commandMessage:"Monitoreo de procesos activos (top -i)"});        
});

app.get("/top",function(req,res){

    fs.readFile(appDir+'/top.txt', 'utf8', function (err,data) {   
      if (err) {
        return console.log(err);
      }else{ 
          if (data.length > 0)
            comandoTop = data;  
      }
    });
    res.end(comandoTop);
});

app.get("/who",function(req,res){
     fs.readFile(appDir+'/who.txt', 'utf8', function (err,data) {   
      if (err) {
        return console.log(err);
      }else{ 
          if (data.length > 0)
            comandoWho = data;
      }
    });
    res.end(comandoWho);
});

app.get("/free",function(req,res){
    fs.readFile(appDir+'/free.txt', 'utf8', function (err,data) {   
      if (err) {
        return console.log(err);
      }else{
          if (data.length > 0)
            comandoFree = data;
      }
    });
    res.end(comandoFree);
});

var result ="";
app.get("/com",function(req,res){
    var command = req.query.com;
    result += "Galileo ejecutando: "+command+"\n";
    sequence
    .then(function(next){ 
        setTimeout(function(){
            child = exec(command, function (error, stdout, stderr) {
                if (error !== null) {
                    console.log('exec error: ' + error);
                    result += error;
                }else{
                    result += stdout;
                }
            });
            next();
        },100);
    })
    .then(function(next){
        setTimeout(function(){
            res.end(result);
            next();
        },100);
    });
    
    
});

app.get("/topRender",function(req,res){
    intervalTop = setInterval (ejecutarTop,500);
    clearInterval(intervalWho);
    clearInterval(intervalFree);
res.render(appDir + '/app.ejs', {title:"Galileo / Comando Top",comando:"top",commandMessage:"Monitoreo de procesos activos (top -i)"}); 
});

app.get("/whoRender",function(req,res){
    intervalWho = setInterval (ejecutarWho,500);
    clearInterval(intervalTop);
    clearInterval(intervalFree);
    res.render(appDir + '/app.ejs', {title:"Galileo / Comando Who",comando:"who",commandMessage:"Usuarios registrados en el sistema (w)"}); 
});

app.get("/freeRender",function(req,res){
    intervalFree = setInterval (ejecutarFree,500);
    clearInterval(intervalTop);
    clearInterval(intervalWho);
        res.render(appDir + '/app.ejs', {title:"Galileo / Comando Free",comando:"free",commandMessage:"Monitoreo de procesos activos (free -m)"}); 
});

app.get("/comRender",function(req,res){
    result="";
    res.render(appDir + '/com.ejs', {title:"Galileo"});
});

// serves all the static files 
app.get(/^(.+)$/, function(req, res){ 
     console.log('static file request : ' + req.params);
     res.sendfile( appDir + req.params[0]); 
 });
 
var port = process.env.PORT || 5000;
app.listen(port, function() {
   console.log("Listening on " + port);
});


