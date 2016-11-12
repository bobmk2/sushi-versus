var express = require('express')
var app = express()

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/../../public'))

app.get('/js/client.js', function(req, res) {
  res.sendFile('client.js', {root: __dirname + '/..'});
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})
