'use strict';

const path    = require('path');
const async   = require('async');
const debug   = require('debug');
const raven   = require('raven');

raven.config('https://c1e3b55e6a1a4723b9cae2eb9ce56f2e:57e853a74f0e4db98e69a9cf034edcdd@sentry.io/265540').install();

let server     = require(path.resolve(__dirname, '../../server/server'));
let database   = server.datasources.recipeDS;

let helper     = require(path.resolve(__dirname, '../helper'));
// console.log(helper);
// //include middleware
// @todo make it auto-icludable from folder

let Ingredients  = require(path.resolve(__dirname, 'ingredients'));

let Groceries    = require(path.resolve(__dirname, 'grocery'));

let Departments  = require(path.resolve(__dirname, 'departments'));

let Users        = require(path.resolve(__dirname, 'users'));


let options = {
	server: server,
	database: database,
	raven: raven
}

async.parallel({

	departments : async.apply(helper.create, options, Departments),
	groceries   : async.apply(helper.create, options, Groceries),
	users       : async.apply(helper.create, options, Users),


	// ingredients  : async.apply(Ingredients.init,    server, Raven),


	}, function(err, results){
		if( err ) {
			raven.captureException(err);
			throw err;
		}



    if( !results || !results.departments || !results.groceries || !results.users) {
					raven.captureException("not imported well");
		}
		// cause we need data related to departments (ids only)
		options.push(results.departments);

		// user stuff
		Users.assignAdmin(results.users[2].id);

		Users.attachGroceryToAdmin(results.users[2], results.groceries[0]);



		Ingredients.init( options, function(err, data){
			// console.log('loggggggggg');
			// console.log(data);
		});
    // let ingredients = Ingredients.init( results.departments, options.push(results.departments) );
    // console.log(ingredients);


   // console.log(results.ingredients);
	 // console.log(results);
		// console.log(results.departments);
		// console.log(results.groceries);

		// Users.assignAdmin(results.users[2]);
		// Users.attachGroceryToAdmin(results.users[2], results.groceries[0]);
    //
		// Ingredients.createIngredients(
		// 	results.departments, function(err, ingredients){
    //
		// 		// console.log(ingredients);
    //
		// 		Ingredients.attachIngredientsToGroceries(
		// 				ingredients, results.groceries
		// 	 	);
		// 		console.log('import finished');
		// 	});

console.log('import finished');

		process.on('exit', function(code) {
    	return console.log(`About to exit with code ${code}`);
		});
		process.exit(22);



	}
);
