
var express = require("express"),
    port = parseInt(process.env.PORT, 10) || 4567;

var app = express();

app.get("/", function (req, res) {
  res.redirect(200, "/index.html");
});

app.use(express.static(__dirname + '/public'));

console.log('Server running on port ' + port);
app.listen(port);
