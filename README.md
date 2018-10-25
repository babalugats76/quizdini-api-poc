# QUIZDINI API
RESTful API to be used by the Quizdini client

## NOTES
- Node.js project initially created using [Express application generator](https://expressjs.com/en/starter/generator.html)

## TO DO 
- Figure out how, and where best to, accomplish flag to boolean conversion in the user and other models
- Lock down CORS, limiting to appropriate domains; see [cors](https://expressjs.com/en/resources/middleware/cors.html)
- Enable session and cookie functionality
- Enhance CONFIG functionality
  - Begin with moving dotenv back into server and passing in config object(s) via () on app?
- Continue to build unit testing  [jest](https://jestjs.io/docs/en/getting-started), including:
   - User create success (200)
   - User UK/PK violation (409) 
   - Create schema validation error (400)
   - Insufficient password complexity (400)
   - Passwords don't match (400)
- Finish PUT methods in controller and model; develop test cases
- Finish DELETE methods in controller and model; develop test cases

