# TinyApp

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (similar to bit.ly)

## Final Product

![screenshot of URLs page](https://github.com/johnbxu/tinyURL/blob/master/docs/TinyApp.png)
![screenshot of single URL page](https://github.com/johnbxu/tinyURL/blob/master/docs/Shortened%20URL.png)
![screenshot of login page](https://github.com/johnbxu/tinyURL/blob/master/docs/Login.png)

## Dependencies

* Node.js
* Express
* EJS
* Bcrypt
* Body-parser
* Cookie-session
* Cookie-parser
* Method-override
* Nodemon (Dev dependency)

## Getting Started

1. Install all dependencies (using `npm install`)
2. Run the development web server using `node express_server.js` or `npm start` if using nodemon
  * you will have to add `"start": "./node_modules/.bin/nodemon -L express_server.js"` to the `"scripts"` section of package.json