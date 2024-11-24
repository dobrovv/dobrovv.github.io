const http = require('http');
const fs = require('fs');
const path = require('path');

const hostname = 'localhost';
const port = 80;

const mimeTypes = {
  ".js" : "text/javascript",
  ".mjs" : "text/javascript",
  "md" : "text/javascript"
}

const server = http.createServer((req, res) => {
    console.log('Request for ' + req.url + ' by method ' + req.method);

    if (req.method == 'GET') {
        var fileUrl;
        if (req.url == '/') fileUrl = '/index.html';
        else fileUrl = req.url;

        var filePath = path.resolve('.' + fileUrl); //path.resolve('./public' + fileUrl);
        const fileExt = path.extname(filePath);

        fs.exists(filePath, (exists) => {
          if (!exists) {
            filePath = path.resolve('./public/404.html');
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/html');
            fs.createReadStream(filePath).pipe(res);
            return;
          }

          res.statusCode = 200;
          // Sets content type, required for modules
          if (mimeTypes[fileExt])
            res.setHeader('Content-Type', mimeTypes[fileExt] );
          fs.createReadStream(filePath).pipe(res);
        });
    }
  });

    //     if (fileExt == '.html') {
    //         fs.exists(filePath, (exists) => {
    //             if (!exists) {
    //                 filePath = path.resolve('./public/404.html');
    //                 res.statusCode = 404;
    //                 res.setHeader('Content-Type', 'text/html');
    //                 fs.createReadStream(filePath).pipe(res);
    //                 return;
    //             }
    //             res.statusCode = 200;
    //             res.setHeader('Content-Type', 'text/html');
    //             fs.createReadStream(filePath).pipe(res);
    //         });
    //     }
    //     else if (fileExt == '.css') {
    //         res.statusCode = 200;
    //         res.setHeader('Content-Type', 'text/css');
    //         fs.createReadStream(filePath).pipe(res);
    //     }
    //     else if (fileExt == '.jpg' || fileExt == ".jpeg") {
    //       res.statusCode = 200;
    //       res.setHeader('Content-Type', 'image/jpeg');
    //       fs.createReadStream(filePath).pipe(res);
    //     } else if (fileExt == '.png') {
    //       res.statusCode = 200;
    //       //res.setHeader('Content-Type', 'image/png');
    //       fs.createReadStream(filePath).pipe(res);
    //     }
    //     else {
    //         filePath = path.resolve('./public/404.html');
    //         res.statusCode = 404;
    //         res.setHeader('Content-Type', 'text/html');
    //         fs.createReadStream(filePath).pipe(res);
    //     }
    // }
    // else {
    //     filePath = path.resolve('./public/404.html');
    //     res.statusCode = 404;
    //     res.setHeader('Content-Type', 'text/html');
    //     fs.createReadStream(filePath).pipe(res);
    // }
 //});


server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});