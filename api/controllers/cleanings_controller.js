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
const ical = require('ical');
var Cleaning = require('./Cleanings');
var Property = require('./Properties');
const ObjectId = require('mongoose').mongo.ObjectId;


const DEFAULT_WINDOW = 7;

Date.prototype.addDays = function(days){
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
};

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
    updatecleanings: updatecleanings, // Load cleanings for all properties
    updatecleaning: updatecleaning,  // Mark cleaning completed
    updatepropertycleanings: updatepropertycleanings, // Load cleanings for single property by id
    getcleanercleanings: getcleanercleanings, // Get list of all cleanings for a cleaner
    getpropertycleanings: getpropertycleanings, // Get list of all cleanings for a property
};

function updatecleaning(req, res) {
    var id = req.swagger.params.id.value;
    Cleaning.findById(id, function(err, cleaning) {
        if(err) {
            if(err.kind === "ObjectId") {
                res.status(404).json({
                    success: false,
                    message: `No cleaning with id: ${id} in the database!`
                }).send();
            } else {
                res.send(err);
            }
        } else {
            if(!req.swagger.params.done.value){
                res.status(400).json({
                    success: false,
                    message: `Pass Boolean argument 'done' in query string.`
                }).send();
            } else{
                cleaning.cleaned = req.swagger.params.done.value;
                cleaning.save(function (err){
                    if(err) res.send(err)

                    res.status(200).json({
                        success: true,
                        message: "Completion status updated.",
                        size: 1,
                        cleaning: [cleaning]
                    });
                });
            }
        }
    });
}

function updatecleanings(req, res){
    Property.find(function (err, properties) {
       if(err) res.send(err);
       for(let i in properties){
           let property = properties[i];

           let events = [];
           ical.fromURL(property.calendar, {}, function(err, data){
               for(let k in data){
                   // Get a list of all events for this property
                   if (data.hasOwnProperty(k)) {
                       let ev = data[k];
                       if(data[k].type === 'VEVENT') {
                           events.push(ev);
                       }
                   }
               }
               // Now create a cleaning from each pair of events
               let cleanings = [];
               for(let i = 0; i < events.length; i++){
                   // Get an event which is to say get a stay at the bnb
                   let event = events[i];
                   // Get the next event (stay at the bnb)
                   let nextEvent = events[i+1];
                   let start = event.end;
                   let end = nextEvent === undefined ? new Date(event.end).addDays(DEFAULT_WINDOW) : nextEvent.start;

                   let cleaning = new Cleaning();
                   cleaning.start = new Date(start).toISOString();
                   cleaning.end = new Date(end).toISOString();
                   cleaning.property = ObjectId(property._id);
                   cleaning.cleaner = ObjectId(property.cleaner);

                   //console.log(cleaning);
                   if(start.toISOString() >= new Date(Date.now()).toISOString()) {
                       cleanings.push(cleaning);
                   }
               }
               // Now remove all cleanings in database for this property past today's date
               let propid  = ObjectId(property._id);
               Cleaning.deleteMany({'property': ObjectId(property._id).toHexString(), 'start': {$gte: new Date(Date.now()).toISOString()}}, function(err, doc){
                   if(err) console.log(err);
                   if(doc) {
                       console.log('Deleting documents ');
                       //console.log(doc)
                   }
                   Cleaning.insertMany(cleanings , function(err, docs){
                       console.log('Updating Future documents');
                       console.log(docs);
                   });
               });
           });
       }
       res.status(200).json({
           message: "Updated cleanings"
       });
    });
}

function updatepropertycleanings(req, res) {
    var id = req.swagger.params.id.value;
    Property.findById(id, function (err, property) {
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
            if (property === null) {
                res.status(404).json({
                    success: false,
                    message: `No property with id: ${id} in the database!`
                });
            } else {
                let events = [];
                ical.fromURL(property.calendar, {}, function (err, data) {
                    for (let k in data) {
                        // Get a list of all events for this property
                        if (data.hasOwnProperty(k)) {
                            let ev = data[k];
                            if (data[k].type === 'VEVENT') {
                                events.push(ev);
                            }
                        }
                    }
                    // Now create a cleaning from each pair of events
                    let cleanings = [];
                    for (let i = 0; i < events.length; i++) {
                        // Get an event which is to say get a stay at the bnb
                        let event = events[i];
                        // Get the next event (stay at the bnb)
                        let nextEvent = events[i + 1];
                        let start = event.end;
                        let end = nextEvent === undefined ? new Date(event.end).addDays(DEFAULT_WINDOW) : nextEvent.start;

                        let cleaning = new Cleaning();
                        cleaning.start = new Date(start).toISOString();
                        cleaning.end = new Date(end).toISOString();
                        cleaning.property = ObjectId(property._id);
                        cleaning.cleaner = ObjectId(property.cleaner);

                        //console.log(cleaning);
                        if (start.toISOString() >= new Date(Date.now()).toISOString()) {
                            cleanings.push(cleaning);
                        }
                    }
                    // Now remove all cleanings in database for this property past today's date
                    let propid = ObjectId(property._id);
                    Cleaning.deleteMany({
                        'property': ObjectId(property._id).toHexString(),
                        'start': {$gte: new Date(Date.now()).toISOString()}
                    }, function (err, doc) {
                        if (err) console.log(err);
                        if (doc) {
                            console.log('Deleting documents for this property');
                            //console.log(doc)
                        }
                        Cleaning.insertMany(cleanings, function (err, docs) {
                            console.log('Updating Future documents');
                            console.log(docs);
                        });
                        res.status(200).json({
                            message: "Updated cleanings"
                        });
                    });
                });
            }
        }
    });
}

function getcleanercleanings (req, res) {
    var id = req.swagger.params.id.value;
    var start = undefined, end = undefined;
    if (req.swagger.params.start.value !== undefined)
        start = req.swagger.params.start.value;
    if (req.swagger.params.end.value !== undefined)
        end = req.swagger.params.end.value;
    if (start !== undefined && end !== undefined) {
        Cleaning.aggregate([
            {
                '$match': {
                    'cleaner': ObjectId(id),
                    'start': {
                        $gte: start,
                        $lt: end
                    }
                }
            },
            {
                '$sort': {
                    'start': 1
                }
            }
        ], function (err, cleanings) {
            if (err) {
                res.status(404).json({
                    success: false,
                    message: `Error encountered while trying to find cleanings assigned to Cleaner id: ${id}!`
                }).send();
            } else if (cleanings == []){
                res.status(200).json({
                    success: true,
                    message: `No cleanings for Cleaner id: ${id} within the date range specified.`,
                    cleanings: []
                }).send();
            } else {
                res.status(200).json({
                    success: true,
                    size: cleanings.length,
                    cleanings: cleanings
                });
            }
        });
    } else if (start === undefined && end !== undefined) {
        Cleaning.aggregate([
            {
                '$match': {
                    'cleaner': ObjectId(id),
                    'start': {
                        $lt: end
                    }
                }
            },
            {
                '$sort': {
                    'start': 1
                }
            }
        ], function (err, cleanings) {
            if (err) {
                res.status(404).json({
                    success: false,
                    message: `Error encountered while trying to find cleanings assigned to Cleaner id: ${id}!`
                }).send();
            } else if (cleanings == []){
                res.status(200).json({
                    success: true,
                    message: `No cleanings for Cleaner id: ${id} within the date range specified.`,
                    cleanings: []
                }).send();
            } else {
                console.log(cleanings);
                res.status(200).json({
                    success: true,
                    size: cleanings.length,
                    cleanings: cleanings
                });
            }
        });
    } else if (start !== undefined && end === undefined) {
        Cleaning.aggregate([
            {
                '$match': {
                    'cleaner': ObjectId(id),
                    'start': {
                        $gte: start
                    }
                }
            },
            {
                '$sort': {
                    'start': 1
                }
            }
        ], function (err, cleanings) {
            if (err) {
                res.status(404).json({
                    success: false,
                    message: `Error encountered while trying to find cleanings assigned to Cleaner id: ${id}!`
                }).send();
            } else if (cleanings == []){
                res.status(200).json({
                    success: true,
                    message: `No cleanings for Cleaner id: ${id} within the date range specified.`,
                    cleanings: []
                }).send();
            } else {
                res.status(200).json({
                    success: true,
                    size: cleanings.length,
                    cleanings: cleanings
                });
            }
        });
    } else {
        Cleaning.find({cleaner: ObjectId(id).toHexString()}, function (err, cleanings) {
            if (err) {
                res.status(404).json({
                    success: false,
                    message: `Error encountered while trying to find cleanings assigned to Cleaner id: ${id}!`
                }).send();
            } else if (!cleanings.length) {
                res.status(200).json({
                    success: true,
                    message: `No cleanings found for Cleaner id: ${id}!`,
                    cleanings: []
                }).send();
            } else {
                console.log(cleanings);
                res.status(200).json({
                    success: true,
                    size: cleanings.length,
                    cleanings: cleanings
                });
            }
        });
    }
}

function getpropertycleanings (req, res) {
    let id = req.swagger.params.id.value;
    var start = undefined, end = undefined;
    if (req.swagger.params.start.value !== undefined)
        start = req.swagger.params.start.value;
    if (req.swagger.params.end.value !== undefined)
        end = req.swagger.params.end.value;
    if (start !== undefined && end !== undefined) {
        Cleaning.aggregate([
            {
                '$match': {
                    'property': ObjectId(id),
                    'start': {
                        $gte: start,
                        $lt: end
                    }
                }
            },
            {
                '$sort': {
                    'start': 1
                }
            }
        ], function (err, cleanings) {
            if (err) {
                res.status(404).json({
                    success: false,
                    message: `Error encountered while trying to find cleanings assigned to property id: ${id}!`
                }).send();
            } else if (cleanings == []){
                res.status(200).json({
                    success: true,
                    message: `No cleanings for property id: ${id} within the date range specified.`,
                    cleanings: []
                }).send();
            } else {
                res.status(200).json({
                    success: true,
                    size: cleanings.length,
                    cleanings: cleanings
                });
            }
        });
    } else if (start === undefined && end !== undefined) {
        Cleaning.aggregate([
            {
                '$match': {
                    'property': ObjectId(id),
                    'start': {
                        $lt: end
                    }
                }
            },
            {
                '$sort': {
                    'start': 1
                }
            }
        ], function (err, cleanings) {
            if (err) {
                res.status(404).json({
                    success: false,
                    message: `Error encountered while trying to find cleanings assigned to property id: ${id}!`
                }).send();
            } else if (cleanings == []){
                res.status(200).json({
                    success: true,
                    message: `No cleanings for property id: ${id} within the date range specified.`,
                    cleanings: []
                }).send();
            } else {
                res.status(200).json({
                    success: true,
                    size: cleanings.length,
                    cleanings: cleanings
                });
            }
        });
    } else if (start !== undefined && end === undefined) {
        Cleaning.aggregate([
            {
                '$match': {
                    'property': ObjectId(id),
                    'start': {
                        $gte: start
                    }
                }
            },
            {
                '$sort': {
                    'start': 1
                }
            }
        ], function (err, cleanings) {
            if (err) {
                res.status(404).json({
                    success: false,
                    message: `Error encountered while trying to find cleanings assigned to property id: ${id}!`
                }).send();
            } else if (cleanings == []){
                res.status(200).json({
                    success: true,
                    message: `No cleanings for property id: ${id} within the date range specified.`,
                    cleanings: []
                }).send();
            } else {
                res.status(200).json({
                    success: true,
                    size: cleanings.length,
                    cleanings: cleanings
                });
            }
        });
    } else {
        Cleaning.find({property: ObjectId(id).toHexString()}, function (err, cleanings) {
            if (err) {
                res.status(404).json({
                    success: false,
                    message: `Error encountered while trying to find cleanings assigned to property id: ${id}!`
                }).send();
            } else if (cleanings == []) {
                res.status(200).json({
                    success: true,
                    message: `No cleanings found for property id: ${id}!`,
                    cleanings: []
                }).send();
            } else {
                res.status(200).json({
                    success: true,
                    size: cleanings.length,
                    cleanings: cleanings
                });
            }
        });
    }
}