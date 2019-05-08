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

var Property = require('./Properties');

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
    getproperties: getproperties,
    getproperty: getproperty,
    insertproperty: insertproperty,
    updateproperty: updateproperty,
    deleteproperty: deleteproperty,
};

/*
  Functions in a127 controllers used for operations should take two parameters:

  Param 1: a handle to the request object
  Param 2: a handle to the response object
 */
function getproperty(req, res) {
    var id = req.swagger.params.id.value;
    Property.findById(id, function(err, property) {
        if(err) {
            if(err.kind === "ObjectId") {
                res.status(404).json({
                    success: false,
                    message: `No property with id: ${id} in the database!`
                }).send();
            } else {
                res.send(err);
            }
        } else {
            if(property === null){
                res.status(404).json({
                    success: false,
                    message: `No property with id: ${id} in the database!`
                });
            } else{
                let properties = [property];
                res.status(200).json({
                    success: true,
                    size: 1,
                    properties: properties
                });
            }
        }
    });
}

function getproperties(req, res) {
    if (req.swagger.params.cleanings.value === true) {
        Property.aggregate([
            {
                $lookup: {
                    from: 'cleanings',
                    localField: '_id',
                    foreignField: 'property',
                    as: 'cleanings'
                }
            }], function (err, properties) {
            if (err) {
                res.status(404).json({
                    success: false,
                    message: `Error encountered while trying to find cleanings assigned to properties!`
                }).send();
            } else {
                res.status(200).json({
                    success: true,
                    size: properties.length,
                    properties: properties
                }); 
            }
        });
    } else {
        Property.find(function (err, properties) {
            if (err) res.send(err);
            res.status(200).json({
                success: true,
                size: properties.length,
                properties: properties
            })
        });
    }
}

function insertproperty(req, res) {
    var property = new Property();
    property.name = req.swagger.params.property.value.name;
    property.address = req.swagger.params.property.value.address;
    property.city = req.swagger.params.property.value.city;
    property.state = req.swagger.params.property.value.state;
    property.zip = req.swagger.params.property.value.zip;
    property.cleaner = req.swagger.params.property.value.cleaner;
    property.calendar = req.swagger.params.property.value.calendar;

    property.save(function (err, property) {
        if(err) {
            if(err.code === 11000) {
                return res.status(409).json({success: false, message: 'A property with that id already exists'}).send()
            } else {
                return res.send(err);
            }
        }

        res.status(200).json({
            success: true,
            message: `${property.name} added!`,
            property
        });
    });
}

function updateproperty(req, res) {
    var id = req.swagger.params.id.value;
    Property.findById(id, function(err, property) {
        if (err) {
            if (err.kind === "ObjectId") {
                res.status(404).json({
                    success: false,
                    message: `No property with id: ${id} in the database!`
                }).send();
            } else {
                res.send(err);
            }
        } else if(property) {
            // update the property info only if it is new
            if (req.swagger.params.property.value.name) property.name = req.swagger.params.property.value.name;
            if (req.swagger.params.property.value.address) property.address = req.swagger.params.property.value.address;
            if (req.swagger.params.property.value.city) property.city = req.swagger.params.property.value.city;
            if (req.swagger.params.property.value.state) property.state = req.swagger.params.property.value.state;
            if (req.swagger.params.property.value.zip) property.zip = req.swagger.params.property.value.zip;
            if (req.swagger.params.property.value.cleaner) property.cleaner = req.swagger.params.property.value.cleaner;
            if (req.swagger.params.property.value.calendar) property.calendar = req.swagger.params.property.value.calendar;

            property.save(function (err) {
                if (err) res.send(err);

                res.status(200).json({
                    success: true,
                    message: 'Property updated!'
                });
            });
        }
    })
}

function deleteproperty(req, res) {
    var id = req.swagger.params.id.value;
    Property.remove({_id: id}, function(err, property) {
        if (err) {
            if (err.kind === "ObjectId") {
                res.status(404).json({
                    success: false,
                    message: `No property with id: ${id} in the database!`
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