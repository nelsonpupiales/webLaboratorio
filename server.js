const express = require ('express');
const app=express();

app.use(express.static(_dirname + '/dist/web'));

app.listen(process.env.PORT || 8080);

app.get('/*', function(req, res){
    res.sendFile(path.join(_dirname + '/dist/web/index.html'));
})

console.log('Consoles listening');