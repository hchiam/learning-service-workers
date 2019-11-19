const express = require('express');
const app = express();

app.use(express.static('public'));

const port = process.env.PORT || 8000;
const listener = app.listen(port, function() {
  console.log('Server running on port ' + listener.address().port);
});
