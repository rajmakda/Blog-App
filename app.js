var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    methodOverride = require("method-override"),
    expressSanitizer = require("express-sanitizer");

//App config
var dburl = process.env.DATABASEURL || "mongodb://localhost/blogApp";
mongoose.connect(dburl);
//mongoose.connect("mongodb://localhost/blogApp");
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(expressSanitizer());

//Mongoose/Model config
var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: { type: Date, default: Date.now }
});
var Blog = mongoose.model("Blog", blogSchema);

// Blog.create({
//     title: "Test blog",
//     image: "http://lajmi.net/wp-content/uploads/2018/01/dddddd.png",
//     body: "This is a test blog"
// });

//Restful routes
app.get("/", function(req, res) {
    res.redirect("/blogs");
});

//index route
app.get("/blogs", function(req, res) {
    Blog.find({}, function(err, blogs) {
        if (err) {
            console.log(err);
        }
        else {
            res.render("index", { blogs: blogs });
        }
    })
});

//new route
app.get("/blogs/new", function(req, res) {
    res.render("new");
});

//create route
app.post("/blogs", function(req, res) {
     req.body.blog.body = req.sanitize(req.body.blog.body);
    //create blog
    Blog.create(req.body.blog, function(err, newBlog) {
        if (err) {
            res.render("new");
        }
        else {
            //redirect to /blogs
            res.redirect("/blogs");
        }
    });
});

//show route
app.get("/blogs/:id", function(req, res) {
    Blog.findById(req.params.id, function(err, foundBlog) {
        if (err) {
            res.redirect("/blogs");
        }
        else {
            res.render("show", { blog: foundBlog });
        }
    });
});

//edit route
app.get("/blogs/:id/edit", function(req, res) {
    Blog.findById(req.params.id, function(err, foundBlog) {
        if (err) {
            res.redirect("/blogs");
        }
        else {
            res.render("edit", { blog: foundBlog });
        }
    });
});

//update route
app.put("/blogs/:id", function(req, res) {
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog) {
        if (err) {
            res.redirect("/blogs");
        }
        else {
            res.redirect("/blogs/" + req.params.id);
        }
    });
});

//Destroy route
app.delete("/blogs/:id", function(req, res) {
    //destroy blog
    Blog.findByIdAndRemove(req.params.id, function(err) {
        if (err) {
            res.redirect("/blogs");
        }
        else {
            res.redirect("/blogs");
        }
    });
    //redirect to index
});

app.listen(process.env.PORT, process.env.IP, function() {
    console.log("blog server running");
});
