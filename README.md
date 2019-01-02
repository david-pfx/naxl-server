# Naxl-Server

This project is the server for Naxl.
It has been created as a fork of [Evolutility-server-node](https://github.com/evoluteur/evolutility-server-node/).
Naxl is a Personal Database Manager for no-coders. Not Another eXceL.

The aim is to produce a web-based tool that anyone can use to create and manage databases (sets of tables) for their own use.
The target user is someone with a degree of technical skill but no specific programming ability. 
Anyone who can create and edit an Excel spreadsheet should qualify.

The focus is on the ability to store and retrieve personally useful data from a variety of sources in a variety of relevant formats. 
It is not about transactional updates, detailed validation or multi-user access.

The technology used should be state of the art, hence the choice of JavaScript, React, Express, JSON and NoSQL.

## Installation

Follow the instructions much as for Evolutility-Server-Node. 
 - Download or clone the repo from GitHub.
 - `npm install` to install dependencies.
 - `npm run setup-nedb` to create the sample database.
 - `npm run smoke` or `npm run test` to run some tests.
 - `npm start` to run the server.

Then download, install and start the [Naxl-UI](https://github.com/david-pfx/naxl-ui) project, or there won't be much to see.

## Modifications

 - Host name and port configurable at start up.
 - REST API reimplemented using NEDB local noSQL database (and various renamings).
 - Contains no models. All models are stored in the database, as set up initially, and loaded dynamically.
 - The `table` model is a 'table of tables', directly usable by the UI.
 - Remove CORS headers - not needed.
 - Added some tests, more to come.

## Todo

- Upload new database tables from CSV, XLS or JSON.
- Edit model (table, field and panel attributes).

## License

MIT.
