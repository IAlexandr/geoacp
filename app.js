var express = require('express');

var app = express();
/*var cors = require('cors');

app.use(cors({
    origin: true,
    headers: 'X-Requested-With',
    credentials: true
}));

app.options('*', cors());*/

require('./appsetup')(app);
require('./routes')(app);

var port = process.env.PORT || 4080;

console.log('try to listen on port ' + port + ' ...');
app.listen(port);

console.log('Server listening on port', port);