var express = require('express');
var router = express.Router();
var Page = require('../models/pages');
var fs = require('fs-extra');
var Product = require('../models/product');
var Categories = require('../models/categories');

router.get('/', function (req, res){
	// res.send('hello word');
// 	res.render('index', {
// 		h1 : 'baba jhancok'
// 	});
	Page.findOne({link:'home'}, function(err, page){
		if (err) {
			console.log(err);
		}else{
			Product.find(function(err, product){
				if (err) {
					console.log(err);
				}
				res.render('index', {
					title:page.title,
					content : page.content,
					product : product
					
				});
			});
		
		}	
	});
});

router.get('/:link', function(req,res){
	var link= req.params.link;

	Page.findOne({link:link}, function(err, page){
		if (err) {
			console.log(err);
		}
		if (!page) {
			if (link== "products") {
			Product.find(function(err, product){
				if (err) {
					console.log(err);
				}
				res.render('all_product',{
					title: 'All Product',
					product: product
				});
			});
				
			}else{
				res.redirect('/');
			}
			
		}else{
			res.render('index', {
				title:page.title,
				content : page.content
			});
		}
	});
});


router.get('/product', function(req, res){
	// res.send('hello word');
	res.render('index',{
		h1 : 'product ter keren'
	});
});


module.exports = router;