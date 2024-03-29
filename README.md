# QUIZDINI API
RESTful API to be used by the Quizdini client

## NOTES
- Node.js project initially created using [Express application generator](https://expressjs.com/en/starter/generator.html)

## TO DO 
- Figure out how, and where best to, accomplish flag to boolean conversion in the user and other models
- Lock down CORS, limiting to appropriate domains; see [cors](https://expressjs.com/en/resources/middleware/cors.html)
- Install [Passport](http://www.passportjs.org/) and integrate JWT solution referring to [this article](https://devdactic.com/restful-api-user-authentication-1/)
- Enhance CONFIG functionality
  - Extend to feature multiple objects as config data increases
- Continue to build unit testing  [jest](https://jestjs.io/docs/en/getting-started), including:
   - USER POST
     - User create success (200)
     - User UK/PK violation (409)
     - Find by username (200)
     - Create schema validation error (400)
     - Insufficient password complexity (400)
     - Passwords don't match (400)
- Finish PUT methods in controller and model; develop test cases
- Finish DELETE methods in controller and model; develop test cases
- Investigate environment-dependent logging [refer to this](https://stackoverflow.com/questions/14531232/using-winston-in-several-modules)
- Investigate Lint
