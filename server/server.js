const next = require('next');
const express = require('express');

const port = process.env.PORT || 3000;
const app = next({ dev: false });   // dev: false for production on cPanel
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = express();
    server.all('*', (req, res) => handle(req, res));
    server.listen(port, err => { if (err) throw err; });
});
