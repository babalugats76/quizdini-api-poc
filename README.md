# QUIZDINI API
RESTful API to be used by the Quizdini client

## NOTES
- Node.js project initially created using [Express application generator](https://expressjs.com/en/starter/generator.html)

## TO DO 
- Figure out how, and where best to, accomplish flag to boolean conversion in the user and other models
- Update user model to return HTTP status code 409 when unique/primary key violation occurs on POST
- Lock down CORS, limiting to appropriate domains; see [cors](https://expressjs.com/en/resources/middleware/cors.html)
- Enable session and cookie functionality
- Gut unneeded Jade views, etc.
