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
var Cleanings = require('./Cleanings');
var Properties = require('./Properties');
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
    //updatecleaning: updatecleaning,  // Mark cleaning completed
    //updatepropertycleanings: updatepropertycleanings, // Load cleanings for single property by id
    //getcleanercleanings: getcleanercleanings, // Get list of all cleanings for a cleaner
    //getpropertycleanings: getpropertycleanings, // Get list of all cleanings for a property
};

function updatecleanings(req, res){
    Properties.find(function (err, properties) {
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

                   let cleaning = new Cleanings();
                   cleaning.start = start;
                   cleaning.end = end;
                   cleaning.property = ObjectId(property._id);
                   cleaning.cleaner = ObjectId(property.cleaner);

                   if(i === events.length - 1){
                       console.log("FINAL EVENT!");
                   }
                   console.log(cleaning);
                   if(new Date(start) >= new Date(Date.now())) {
                       cleanings.push(cleaning);
                   }
               }
               // Now remove all cleanings in database for this property past today's date
               let propid  = ObjectId(property._id);
               Cleanings.deleteMany({'property': ObjectId(property._id).toHexString(), 'start': {$gte: new Date(Date.now())}}, function(err, doc){
                   if(err) console.log(err);
                   if(doc) {
                       console.log('Deleting documents ');
                       console.log(doc)
                   }
                   Cleanings.insertMany(cleanings , function(err, docs){
                       console.log(docs);
                   });
                   res.status(200).json({
                       message: "Updated cleanings"
                   });
               });
           });
       }
    });
}