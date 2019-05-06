'use strict';
/*
 'use strict' is not required but helpful for turning syntactical errors into true errors in the program flow
 http://www.w3schools.com/js/js_strict.asp
*/

/*
 Modules make it possible to import JavaScript files into your application.  Modules are imported
 using 'require' statements that give you a reference to the module.

  It is a good idea to list the modules that your application depends on in the package.json in the project root
 */
var util = require('util');
var Cleanings = require('./Cleanings');

/*
 Once you 'require' a module you can reference the things that it exports.  These are defined in module.exports.

 For a controller in a127 (which this is) you should export the functions referenced in your Swagger document by name.

 Either:
  - The HTTP Verb of the corresponding operation (get, put, post, delete, etc)
  - Or the operationId associated with the operation in your Swagger document

  In the starter/skeleton project the 'get' operation on the '/hello' path has an operationId named 'hello'.  Here,
  we specify that in the exports of this module that 'hello' maps to the function named 'hello'
 */
<<<<<<< HEAD
// module.exports = {
//     updatecleanings: updatecleanings, // Load cleanings for all properties
//     updatecleaning: updatecleaning,  // Mark cleaning completed
//     updatepropertycleanings: updatepropertycleanings, // Load cleanings for single property by id
//     getcleanercleanings: getcleanercleanings, // Get list of all cleanings for a cleaner
//     getpropertycleanings: getpropertycleanings, // Get list of all cleanings for a property
// };

=======
module.exports = {
    //updatecleanings: updatecleanings, // Load cleanings for all properties
    //updatecleaning: updatecleaning,  // Mark cleaning completed
    //updatepropertycleanings: updatepropertycleanings, // Load cleanings for single property by id
    //getcleanercleanings: getcleanercleanings, // Get list of all cleanings for a cleaner
    //getpropertycleanings: getpropertycleanings, // Get list of all cleanings for a property
};
>>>>>>> 375bbfc42bd983b640b03ebe184f2870d01217e2
