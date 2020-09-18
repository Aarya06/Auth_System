const express = require("express"),
	  mongoose = require("mongoose"),
	  passport = require("passport"),
	  User = require("./models/user"),
	  bodyParser = require("body-parser"),
	  expressSession = require("express-session"),
	  localStrategy = require("passport-local"),
	  flash = require("connect-flash"),
	  passportLocalMongoose = require("passport-local-mongoose"),
	  app = express();

app.use(expressSession({
	secret: "This is secret data",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect("mongodb://localhost/auth_demo");
app.use(flash());

app.use(function(req,res, next){
	res.locals.currentUser = req.user;
	res.locals.session = req.session;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});


app.get("/", function(req, res){
	res.render("home");
});

app.get("/register", function(req, res){
	res.render("register");
});

app.post("/register", function(req, res){
	User.register(new User({username: req.body.username, type:req.body.type}), req.body.password, function(err, user){
		if(err){
			console.log(err);
			return res.render("/register");
		}
		passport.authenticate("local")(req, res, function(){
			req.flash("success", "Welcome");
			res.redirect("/");
		});
		res.redirect("/login");
	});
});


app.get("/login", function(req, res){
	res.render("login");
});

app.post("/login", passport.authenticate("local", {
	successRedirect : "/",
	failureFlash: true, 
	failureRedirect : "/register"
}), function(req, res){
	
});

app.get("/logout", function(req, res){
	 req.logout();
	res.redirect("/");
});

function isLoggedIn (req, res, next){
	 if(req.isAuthenticated()){
		 return next();
	 }
	res.redirect("/login");
}


app.listen(3000, function(){
	console.log("Server has been started");
});
