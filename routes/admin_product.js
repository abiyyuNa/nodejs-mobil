var express = require('express');
var router = express.Router();
var Product = require('../models/product');
var Categories = require('../models/categories')
var mkdirp = require('mkdirp');
var fs = require('fs-extra');
var resizeImg =require('resize-img');


router.get('/', function (req, res){
	var count;
	Product.count(function(err, c){
		count = c;
	});

	Product.find(function(err, product){
		res.render('admin/product', {
			product : product,
			count: count
		});
	});
});

router.get('/add-product', function(req, res){
	var title = "";
	var desc = "";
	var price ="";

	Categories.find(function(err, categoriess){
		res.render('admin/add_product',{
			title : title,
			desc : desc,
			categories : categoriess,
			price : price
		});
	});
});

router.post('/add-product', function(req,res){

	var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";

	req.checkBody('title', 'Title harus di isi!').notEmpty();
	req.checkBody('desc', 'Desc harus di isi!').notEmpty();
	req.checkBody('categories', 'Categories harus di isi!').notEmpty();
	req.checkBody('price', 'Price harus di isi!').isDecimal();
	req.checkBody('image', 'Kamu harus Upload Gambar!').isImage(imageFile);

	// Finds the validation errors in this request and wraps them in an object with handy functions
	var errors = req.validationErrors();
	var title = req.body.title;
	var link = req.body.title.replace(/\s+/g, '-').toLowerCase();
	var desc = req.body.desc;
	var price = req.body.price;
	var categories = req.body.categories;
	
	if (errors) {
		Categories.find(function(err, categoriess){
			res.render('admin/add_product',{
				errors:errors,
				title:title,
				desc:desc,
				categories:categoriess,
				price:price
			});
		
		});
	}else{
		Product.findOne({link:link}, function(err, product){
			if(product){
				req.flash('danger', 'Page ini sudah ada, silahkan gunakan nama lain');
				Categories.find(function(err, categoriess){
					res.render('admin/add_product', {
					
						title:title,
						desc:desc,
						categories:categoriess,
						price:price
	
					});
				});
			}else{
				var product = new Product({
					title:title,
					link:link,
					desc:desc,
					price:price,
					categories:categories,
					image: imageFile
				});
  
				product.save(function(err){
					if(err){
						return console.log(err);
						};
						mkdirp('public/product_images/' + product._id, function(err){
							return console.log(err);
						});
						if(imageFile != ""){
							var productImage =req.files.image;
							var path = 'public/product_images/' + product._id +'/' + imageFile;

							productImage.mv(path, function(err){
								return console.log(err);
							});
						}
  
						  req.flash('success', 'product berhasil di tambahkan');
						  res.redirect('/admin/product');
					
				});
			};
		});
	};
  
  });
  
  router.get('/edit-product/:id', function(req, res){

	Categories.find(function(err, categories){

		Product.findById(req.params.id, function(err, product){
			if(err){
				return console.log(err);
				res.redirect('/admin/product');
			}else{
	
			res.render('admin/edit_product',{
				title : product.title,
				desc : product.desc,
				categories : categories,
				category : product.categories,
				price : product.price,
				image : product.image,
				id:product._id
			});
		};
	
	});
});
});
	
router.get('/delete-page/:id', function(req, res){
	Page.findByIdAndRemove(req.params.id, function(err){
		if (err) {
			return console.log(err);

		}
		Page.find({}).sort({sorting:1}).exec(function(err, pages){
			if (err) {
				return console.log(err);						
			}else{
				req.app.locals.pages = pages;
			}
		});
			req.flash('success', 'page berhasil di hapus');
			res.redirect('/admin/pages');
	});
});

router.post('/edit-product/', function(req,res){

	if(req.body.noimage == ""){
		var imageFile= "";

	}else{
		var imageFile = req.files.image.name;
	}

	req.checkBody('title', 'Title harus di isi!').notEmpty();
	req.checkBody('desc', 'Desc harus di isi!').notEmpty();

	req.checkBody('price', 'Price harus di isi!').isDecimal();
	req.checkBody('image', 'Kamu harus Upload Gambar!').isImage(imageFile);

	// Finds the validation errors in this request and wraps them in an object with handy functions
	var errors = req.validationErrors();
	var title = req.body.title;
	var link = req.body.title.replace(/\s+/g, '-').toLowerCase();
	var desc = req.body.desc;
	var price = req.body.price;
	var categories = req.body.categories;
	var piimage = req.body.piimage;
	var id = req.body.id;
	if (errors) {
			res.redirect('/admin/product/edit-product/' +id);
		
	}else{
		Product.findOne({link:link, _id:{'$ne':id}}, function(err, product){
			if (err){
				console.log(err);
			}
			if(product){
				req.flash('danger', 'Page ini sudah ada, silahkan gunakan nama lain');
				res.redirect('/admin/product/edit-product/' +id);
			}else{
				Product.findById(id, function(err, p){
					if (err) {
						console.log(err);
					}
					p.title = title;
					p.link = link;
					p.desc = desc;
					p.price = price;
					p.categories = categories;
					if (imageFile != "") {
						p.image = imageFile;
					}
					p.save(function(err){
						if (err) {
							console.log(err);
						};
						if (imageFile != "") {
							if (piimage != "") {
								fs.remove('public/product_images/' + id + '/' + piimage, function(err){
									if (err) {
										console.log(err);
									}
								});
							}
							var productImage = req.files.image;
							var path = 'public/product_images/' + id + '/' + imageFile;

							productImage.mv(path, function(err){
								return console.log(err);
							});
							req.flash('success', 'product berhasil di ubah');
						  res.redirect('/admin/product/edit-product/'+ id);
						};
					});
				})
			};	
		});
	};
  });
  



module.exports = router;