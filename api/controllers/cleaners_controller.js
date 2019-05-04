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

var Cleaners = require('./Cleaners');

/*
 Once you 'require' a module you can reference the things that it exports.  These are defined in module.exports.

 For a controller in a127 (which this is) you should export the functions referenced in your Swagger document by name.

 Either:
  - The HTTP Verb of the corresponding operation (get, put, post, delete, etc)
  - Or the operationId associated with the operation in your Swagger document

  In the starter/skeleton project the 'get' operation on the '/hello' path has an operationId named 'hello'.  Here,
  we specify that in the exports of this module that 'hello' maps to the function named 'hello'
 */
module.exports = {
    getcleaners: getcleaners,
    getcleaner: getcleaner,
    insertcleaner: insertcleaner,
    updatecleaner: updatecleaner,
    deletecleaner: deletecleaner,
};

/*
  Functions in a127 controllers used for operations should take two parameters:

  Param 1: a handle to the request object
  Param 2: a handle to the response object
 */
function getcleaners(req, res) {
    Cleaners.find(function (err, cleaners) {
        if (err) res.send(err);
        res.status(200).json({
            success: true,
            size: cleaners.length,
            cleaners: cleaners
        })
    });
}

function getcleaner(req, res) {
    var id = req.swagger.params.id.value;
    Cleaners.findById(id, function(err, cleaner) {
        if(err) {
            if(err.kind === "ObjectId") {
                res.status(404).json({
                    success: false,
                    message: `No cleaner with id: ${id} in the database!`
                }).send();
            } else {
                res.send(err);
            }
        } else {
            if(cleaner === null){
                res.status(404).json({
                    success: false,
                    message: `No cleaner with id: ${id} in the database!`
                });
            } else {
                let cleaners = [cleaner];
                res.status(200).json({
                    success: true,
                    size: 1,
                    cleaners: cleaners
                });
            }
        }
    });
}

function insertcleaner(req, res) {
    var cleaner = new Cleaners();
    cleaner.name = req.swagger.params.cleaner.value.name;
    cleaner.email = req.swagger.params.cleaner.value.email;
    cleaner.phone = req.swagger.params.cleaner.value.phone;

    cleaner.save(function (err) {
        if(err) {
            if(err.code === 11000) {
                return res.status(409).json({success: false, message: 'A cleaner with that id already exists'}).send()
            } else {
                return res.send(err);
            }
        }

        res.status(200).json({
            success: true,
            message: `${cleaner.name} added!`
        });
    });
}

function updatecleaner(req, res) {
    var id = req.swagger.params.id.value;
    Cleaners.findById(id, function(err, cleaner) {
        if (err) {
            if (err.kind === "ObjectId") {
                res.status(404).json({
                    success: false,
                    message: `No cleaner with id: ${id} in the database!`
                }).send();
            } else {
                res.send(err);
            }
        } else if(cleaner) {
            // update the property info only if it is new
            if (req.swagger.params.cleaner.value.name) cleaner.name = req.swagger.params.cleaner.value.name;
            if (req.swagger.params.cleaner.value.email) cleaner.email = req.swagger.params.cleaner.value.email;
            if (req.swagger.params.cleaner.value.phone) cleaner.phone = req.swagger.params.cleaner.value.phone;

            cleaner.save(function (err) {
                if (err) res.send(err);

                res.status(200).json({
                    success: true,
                    message: 'Cleaner details updated!'
                });
            });
        }
    })
}

function deletecleaner(req, res) {
    var id = req.swagger.params.id.value;
    Cleaners.deleteOne({_id: id}, function(err, cleaner) {
        if (err) {
            if (err.kind === "ObjectId") {
                res.status(404).json({
                    success: false,
                    message: `No cleaner with id: ${id} in the database!`
                }).send();
            } else {
                res.send(err);
            }
        } else {
            res.status(200).json({
                success: true,
                message: 'Successfully deleted'
            })
        }
    });
}