const express = require('express');
const cors = require('cors');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const Hipku = require('hipku');

const dev = process.env.NODE_ENV !== 'production';
const port = process.env.PORT || 5001;

// Multi-process to utilize all CPU cores.
if (!dev && cluster.isMaster) {
  console.error(`Node cluster master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.error(`Node cluster worker ${worker.process.pid} exited: code ${code}, signal ${signal}`);
  });

} else {
  const app = express();
  app.use(cors());

  if (!dev) {
    app.enable('trust proxy', 'uniquelocal');
  }

  // Answer API requests.
  app.post('/hipku/:ipAddress', function (req, res) {
    console.log(`Hipku for ${req.params.ipAddress}`)
    res.json({ hipku: Hipku.encode(req.params.ipAddress) });
  });

  app.listen(port, function () {
    console.error(`Node worker ${process.pid}: listening on port ${port}`);
  });
}