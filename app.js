var express = require('express');
var path = require('path');

var mongoose = require('mongoose');
var mysql = require('mysql');
var config = require('./config/database');
var bodyParser = require('body-parser');
var session = require('express-session');
var fileUpload = require('express-fileupload');
var validation = require('express-validator');



//mongodb
mongoose.connect(config.database);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connected to Mongodb');
});

// mysql
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "chupu_shop"

});
con.connect(function(err){
  if(err) throw err;
  console.log('connneting.......');
  
});


var app = express();
//body parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

//Expres session
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}))
//massage

app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// express-validator
app.use(validation({
  customValidators: {
    isImage:function(value, filename){
      var extension = (path.extname(filename)).toLowerCase();
      switch (extension){
        case '.jpg':
          return '.jpg';
        case '.jpeg':
          return '.jpeg';
        case '.png':
          return '.png';
        case '':
         return '.jpg';
        default:
          return false;
      }
    }
  }
}));



// express-fileupload
app.use(fileUpload());


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));

// set global error variable
app.locals.errors = null;


app.get('*', function(req, res, next){
	res.locals.cart = req.session.cart;
	res.locals.user = req.user || null;
	var cart = req.session.cart;
	var qty = 0;
	if (typeof cart == "undefined") {
		qty = 0;
	}else{
		for(var i = 0; i < cart.length; i++){
			qty = qty + cart[i].qty;
		}
	}

	res.locals.qtyheader = qty;
	next();
});


var Page = require('./models/pages');
var Category = require('./models/categories');
var pages = require('./routes/pages.js');
var cart = require('./routes/cart.js');
var productuser = require('./routes/product.js');
var pagesadmin = require('./routes/admin_pages.js');
var catadmin = require('./routes/admin_categories.js');
var productadmin = require('./routes/admin_product.js');

app.use('/', pages);
app.use('/admin/pages', pagesadmin);
app.use('/admin/categories', catadmin);
app.use('/admin/product', productadmin);
app.use('/products', productuser);
app.use('/cart', cart);

// get all page to heade.ejs
Page.find({}).sort({sorting:1}).exec(function(err, pages){
  if(err){
    console.log(err);
  }else{
    app.locals.pages = pages;
  }
});

// get all kategori
Category.find(function(err, categories){
  if(err){
    console.log(err);
  }else{
    app.locals.categories = categories;
  }
});

var port = 3000;
app.listen(port, function(){
	console.log('server berjalan dengan port' + port);
})