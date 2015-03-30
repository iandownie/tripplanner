var dayRouter = require('express').Router();
var models = require('../models');
var async = require('async');
var bluebird = require('bluebird');
var attractionRouter= require('express').Router({mergeParams:true});

// GET /days
dayRouter.get('/', function (req, res, next) {
	models.Day.find({}).populate('hotel restaurants thingsToDo').exec(function(err, thedays){
		// console.log(thedays)
		if(err) throw err;

		if (thedays.length===0){
			var day=new models.Day()
			day.number=1;
			res.json({days: [day]})
			day.save()
		}else{
			res.json({
	    	days:thedays
	    	})
		}	
	})
    
});
// POST /days
dayRouter.post('/', function (req, res, next) {
	var day=new models.Day()
	models.Day.count({}, function(err, count){
		day.number=count+1
		// console.log("there are %d days", count+1)
		res.json(day)
		day.save()
	})
	
});


// 	    console.log(req.body)
// 	var number=req.body.number
// 	models.Day.findOrCreate({number})
//     var day=new models.Day()
//     var type= req.body.type
//     var name=req.body.text
// console.log(type)
// 	if(type==="hotel"){
//             models.Hotel.findOne({name: name}, function(err, hotel){
//             	day.hotel=hotel._id
//             	console.log(day.hotel)
//             })
//          }else if(type==="restaurant"){
//             models.Restaurant.findOne({name: name}, function(err, restaurant){
//             	day.restaurants.push(restaurant._id)
//             	console.log("Day restaurant:", day.restaurants[0])
//             })
//          } else{
//             models.ThingToDo.findOne({name: name}, function(err, thing){
//             	day.thingsToDo.push(thing._id)
//             	console.log("Day Thing:", day.thingsToDo[0])
//             })
//          }
         
//          console.log(name)



// GET /days/:id
dayRouter.get('/:id', function (req, res, next) {
    models.Day.findOne({number: Number(req.params.id)}, function(err, data){
    	res.json(data)
    })
});
// DELETE /days/:id
dayRouter.delete('/:id', function (req, res, next) {

models.Day.find({number: req.params.id}).remove(function(err, data){
	// console.log(data)
	res.sendStatus(200).end()
})
    
});

dayRouter.use('/:id', attractionRouter)
    	// 
attractionRouter.post('/hotel', function (req, res, next) {

	var name=req.body.text
	// console.log(req.params.id)
    models.Day.findOne({number: req.params.id}, function(err, day){
    	models.Hotel.findOne({name: name}, function(err, hotel){		
            day.hotel=hotel._id
            res.json(day)
            day.save();
        })
    })
});

// DELETE /days/:id/hotel
attractionRouter.delete('/hotel', function (req, res, next) {
	models.Day.findOne({number: req.params.id}, function(err, data){
		data.hotel=null;
		data.save();
		res.sendStatus(200).end()
	})
});
// // POST /days/:id/restaurants
attractionRouter.post('/restaurants', function (req, res, next) {
	var name=req.body.text
    models.Day.findOne({number: req.params.id}, function(err, day){
    	models.Restaurant.findOne({name: name}, function(err, restaurant){		
            day.restaurants=restaurant._id
            res.json(day)
            day.save();
        })
    })
});
// // DELETE /days/:dayId/restaurants/:restId
attractionRouter.delete('/restaurant/:restId', function (req, res, next) {
	models.Day.findOne({number: req.params.id}, function(err, data){
		var restList=data.restaurants
		data.restaurants=restList.filter(function(rest){
			return rest._id!==req.params.restId
		})

		data.save();
		res.sendStatus(200).end()
	})
});
// // POST /days/:id/thingsToDo
attractionRouter.post('/thingsToDo', function (req, res, next) {
	var name=req.body.text
    models.Day.findOne({number: req.params.id}, function(err, day){
    	models.ThingToDo.findOne({name: name}, function(err, thingsToDo){		
            day.thingsToDo=thingsToDo._id
            res.json(day)
            day.save();
        })
    })
});
// DELETE /days/:dayId/thingsToDo/:thingId
attractionRouter.delete('/thingsToDo/:thingid', function (req, res, next) {
    models.Day.findOne({number: req.params.id}, function(err, data){
    	var thingsList=data.thingsToDo
    	data.thingsToDo=thingsList.filter(function(things){
    		return things._id!==req.params.thingId
    	})

    	data.save();
    	res.sendStatus(200).end()
    })
});

module.exports = dayRouter;