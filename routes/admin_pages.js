var express = require('express');
var router = express.Router();
var Page = require('../models/pages');


router.get('/', function (req, res){
	Page.find({}).sort({sorting:1}).exec(function(err, pages){
		res.render('admin/pages', {
			pages : pages
		});
	});
});


router.get('/add-page', function(req, res){
	var title = "";
	var link = "";
	var content = "";

	res.render('admin/add-page',{
		title : title,
		link : link,
		content : content
	});
});

router.post('/add-page', function(req,res){

	req.checkBody('title', 'Title harus di isi!').notEmpty();
	req.checkBody('content', 'Content harus di isi!').notEmpty();
  // Finds the validation errors in this request and wraps them in an object with handy functions
  var title = req.body.title;
  var link = req.body.link.replace(/\s+/g, '-').toLowerCase();
  if (link=="") {
	  link = req.body.title.replace(/\s+/g, '-').toLowerCase();
  }
  var content = req.body.content;
  var error = req.validationErrors();


  if (error) {
	res.render('admin/add_page',{
		errors:errors,
		title:title,
		link:link,
		content:content
	});
  }else{
  	Page.findOne({link:link}, function(err, page){
  		if(page){
  			req.flash('danger', 'Page ini sudah ada, silahkan gunakan nama lain');
  			res.render('admin/add-page', {
  				title:title,
  				link:link,
  				content:content
  			});
  		}else{
  			var page = new Page({
  				title:title,
  				link:link,
  				content:content,
  				sorting: 0
  			});

  			page.save(function(err){
  				if(err){
  					return console.log(err);
  					};
						Page.find({}).sort({sorting: 1}).exec(function(err,pages){
							if(err){
								console.log(err);
							}else{
								req.app.locals.pages = pages;
							}
						});

						req.flash('success', 'page berhasil di tambahkan');
						res.redirect('/admin/pages');
  				
  			});
  		};
  	});
  }

});


function sortPages(ids, callback){
var count = 0;

for (var i = 0; i < ids.length; i++) {
	var id = ids[i];

	count++;

	(function(count){
		Page.findById(id, function(err, page){
			page.sorting = count;
			page.save(function(err){
				if(err){
					return console.log(err);
				}
				++count;
				if(count >= ids.length){
					callback();
				}
			})
		})
	})(count);
}
}


router.post('/reorder-pages', function(req, res){
	var ids = req.body['id[]'];

	sortPages(ids, function(){
		
		Page.find({}).sort({sorting:1}).exec(function(err,pages){
			if(err){
			console.log(err);
			}else{
			req.app.locals.pages = pages;
			}
		});
	});
});

router.get('/edit-page/:id', function(req, res){

	Page.findById(req.params.id, function(err, page){
		if(err){
			return console.log(err);
		}

		res.render('admin/edit-page',{
			title : page.title,
			link : page.link,
			content : page.content,
			id: page._id
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


module.exports = router;