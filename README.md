# TinyApp

TinyApp is a URL shortener.

This is a learning project for week 3 of Lighthouse Labs full-stack web development bootcamp.

The focus is to learn about:

* HTTP requests and routing
* Building a web server
* Setting cookies to track login state, and reading those cookies when determining if user has permissions to access a resource or perform an action
* Encrypting and securely storing passwords 

See project requirements [here](/REQS.md).

## Tech Stack & Dependencies

* Server: [Node.js](https://nodejs.org/en/), [Express JS](https://expressjs.com/)
* Templating: [EJS](https://ejs.co/)

#### General Dependencies

* [ejs](https://www.npmjs.com/package/ejs) — Embedded Javascript templates
* [express](https://www.npmjs.com/package/express) — minimalist web framework
* [cookie-parser](https://www.npmjs.com/package/cookie-parser) — cookie parsing middleware
* [body-parser](https://www.npmjs.com/package/body-parser) — body parsing middleware
* [bcryptjs](https://www.npmjs.com/package/bcryptjs) — Library for hashing passwords, optimized for Javascript

#### Dev Dependencies

* [nodemon](https://www.npmjs.com/package/nodemon) — monitor script to automatically restart node app when file changes are detected

### Future Directions / Personal Stretch Goals

* implement a web-friendly color palette
* add footer with link to GitHub project page
* write JSON objects to file and read from them on server start so that urlDatbase and users database can persist
* write a Node.js client using `axios` to perform all necessary tests
* 