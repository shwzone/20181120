var express = require('express');
var multer = require('multer');
var app = express();
var ejs = require('ejs');
var Board2 = require('./models/board2');
var Board1 = require('./models/board1')


var _storage = multer.diskStorage({
  destination: function(req, file, cb){
    cb(null, 'src/upload/')
  },
  filename: function(req, file, cb){
    cb(null, file.originalname)
  }
})
var upload = multer({storage: _storage});

app.set('views', __dirname + '/public');


app.use(express.static(__dirname + '/src'));

var bodyParser = require('body-parser')
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

const mongoose = require('mongoose');
mongoose.connect('mongodb://munheejo:heejo0520@ds141623.mlab.com:41623/munheejo', { useNewUrlParser: true });

var session = require('express-session')
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'tired',
  resave: false,
  saveUninitialized: true,
}));

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log("success");
});

var Gallery = require('./models/gallery');
var Visit = require('./models/visit');
var User = require('./models/user');
var Board= require('./models/board');
var Notice= require('./models/Notice');

app.get("/", function(req,res){
  Visit.findOne({_id:"5be59edb1f88964c2ce689a5"}, function(err, visit){
    var today = new Date();
    var dd = today.getDate().toString();
    console.log(dd);
    if(visit.current != dd){
      visit.today=0;
      visit.current=dd;
    }
    visit.today++;
    visit.total++;
    visit.save(function(err){
      res.render('mainpage.ejs', {visit: visit});
    })
  })
  });

  app.get('/login', function(req, res){
    res.render('login.ejs')
  })

  app.post('/login', function(req, res){
    User.findOne({id:req.body.id}, function(err, user){
      if(!user){
        console.log('wrong id!')
        res.redirect('/login')
      }else{
        if(!user.validateHash(req.body.password)){
          console.log('wrong pw!')
          res.redirect('/')
        }else{
          req.session.user = user.id;
          res.redirect('/')
        }
      }
    })
  })

  app.post('/signUp', function(req, res){
    User.find({id:req.body.id}, function(err, user){
      if(err) throw err;
      if(user.length > 0){
        //아이디 존재한다.
      }else{
        var user = new User({
          name: req.body.name,
          id: req.body.id,
          email: req.body.email,
          phone: req.body.phone,
          pw: req.body.password
        })
        user.pw = user.generateHash(user.pw);//암호화
        user.save(function(err){
          if(err) throw err;
          res.redirect('/login')//맨 처음 홈페이지로
        })
      }
    })
  })

  app.get("/about", function(req,res){
    res.render('about.ejs');
  });

  app.get("/date", function(req,res){
    res.render('component-datepicker.ejs');
  });

  app.get("/counter", function(req,res){
    res.render('counters.ejs');
  });

  app.post('/logout', function(req,res){
    req.session.destroy(function(err){
      res.redirect('/login')
    })
  })

app.get('/upload', function(req,res){
  res.render('test.ejs');
})

app.post('/upload', upload.single('userfile'), function(req, res){
  var gallery = new Gallery({
    title: req.body.title,
    content: req.body.content,
    created_at: new Date(),
    modified_at: new Date(),
    imagelink : '/upload/' + req.file.originalname
  });
  gallery.save(function (err) {
    if (err) return console.error(err);

  });
  res.redirect('/gallery');
})

app.post('/destroy/:id', function (req, res) {
  Gallery.remove({ _id: req.params.id }, function (err) {
    res.redirect('/gallery');
  });
});

app.post('/destroys/:id', function (req, res) {
  Board.remove({ _id: req.params.id }, function (err) {
    res.redirect('/');
  });
});

app.get('/rewrite/:id', function (req, res) {
  Gallery.findOne({ _id: req.params.id }, function (err, result) {
    res.render('rewrite.ejs', { result: result });
  })
});

app.post('/rewrite/:id', function (req, res) {
  Gallery.findOne({ _id: req.params.id }, function (err, result) {
    result.content = req.body.inputContent;
    result.created_at = new Date().toISOString();
    result.save(function (err) {
      res.redirect('/pictureinfo/' + result.id);
    });
  });
});

app.get("/schedule", function(req,res){
    res.render('schedule.ejs');
  });

  app.get("/gallery", function(req,res){
    Gallery.find({}, function(err, result){
        if (err) throw err;
        res.render('gallery2.ejs',{pictures : result})
  })
});

app.get("/pictureinfo/:id", function(req,res){
  Gallery.findOne({_id:req.params.id}, function(err, result){
    if (err) throw err;
    res.render('pictureinfo.ejs',{info : result})
  })
})
app.get("/faqs", function(req,res){
  Board.find({}, function(err,results){
    if (err) throw err;
    res.render('faqs.ejs',{boards: results});
  });
});  

  app.get('/canvas-writing', function (req, res) {
    res.render('canvas-writing.ejs')
  })
  
  app.post('/canvas-writing', function (req, res) {
    var board = new Board({
      title: req.body.title,
      content: req.body.content
    });
    board.save(function (err) {
      if (err) return console.error(err);
  
    });
    res.redirect('/faqs');
  });
  
  app.get("/canvas-show/:id", function (req, res) {
    Board.findOne({ _id: req.params.id }, function (err, board) {
      board.hits++;
      board.save(function(err){
        res.render("canvas-show.ejs", { result: board })
      })
    })
  })

  app.get("/like/:id", function (req, res) {
    Notice.findOne({ _id: req.params.id }, function (err, notice) {
      notice.like++;
      notice.save(function(err){
        res.redirect('/notice-show/'+req.params.id);
      })
    })
  })

app.get('/canvas-rewriting/:id', function (req, res) {
  Board.findOne({ _id: req.params.id }, function (err, board) {
    res.render('canvas-rewriting.ejs', { result: board });
  })
});

app.post('/canvas-rewriting/:id', function (req, res) {
  Board.findOne({ _id: req.params.id }, function (err, board) {
    board.content = req.body.inputContent;
    board.created_at = new Date().toLocaleString().replace(/-/g,'.');
    board.save(function (err) {
      res.redirect('/canvas-show/' + board._id);
    });
  });
});

app.get("/notice", function(req,res){
  Notice.find({}, function(err,results){
    if (err) throw err;
    res.render('notice.ejs',{notice: results});
  });
});

app.get('/notice-writing', function (req, res) {
  res.render('notice-writing.ejs')
})

app.post('/notice-writing', function (req, res) {
  var notice = new Notice({
    ntitle: req.body.ntitle,
    ncontent: req.body.ncontent
  });
  notice.save(function (err) {
    if (err) return console.error(err);

  });
  res.redirect('/notice');
});

app.get("/notice-show/:id", function (req, res) {
  Notice.findOne({ _id: req.params.id }, function (err, notice) {
    notice.nhits++;
    notice.save(function(err){
      res.render("notice-show.ejs", { result: notice })
    })
  })
})
app.get('/Announce', function (req, res) {
  Board2.find({}, function (err, results) {
    if (err) throw err;
    
    res.render('Announce.ejs', { boards2: results });
  });
});

app.get('/Health', function (req, res) {
  Board1.find({}, function (err, results1) {
    if (err) throw err;
    
    res.render('Health.ejs', { boards1: results1 });
  });
});





//announce
app.get("/announce-writing", function (req, res) {
  res.render('announce-writing.ejs');
});

app.post('/announce-writing', upload.single('userfile'), function (req, res) {
    var board2 = new Board2({
    
    title: req.body.title,
    content: req.body.content,
    
    userfile: (req.file !=undefined ? 'upload/'+ req.file.originalname : null)

   
    
  });
  board2.save(function (err) {
   
    if (err) return console.error(err);

  });
  res.redirect('/Announce');
});

app.post('/destroya/:id', function(req,res){
  Board2.deleteOne({_id: req.params.id}, function(err){
    res.redirect("/Announce");
  });
});

  
app.get('/announce-rewrite/:id', function (req, res) {
  Board2.findOne({_id:req.params.id}, function (err, board2) {
    res.render("announce-rewrite.ejs", {result:board2 });
  })
    
  
});

app.post('/announce-rewrite/:id', function (req, res) {
  Board2.findOne({ _id: req.params.id }, function (err, board2) {
    console.log('일단됨')
    board2.content = req.body.inputContent;
   
    board2.save(function (err) {
      res.redirect('/Announce');
    });
  });
  
});
//announce end

//health
app.get("/health-writing", function (req, res) {
  res.render('health-writing.ejs');
});

app.post('/health-writing', upload.single('userfile'), function (req, res) {
    var board1 = new Board1({
    
    title: req.body.title,
    content: req.body.content,
    
    userfile: (req.file !=undefined ? 'upload/'+ req.file.originalname : null)

   
    
  });
  board1.save(function (err) {
   
    if (err) return console.error(err);

  });
  res.redirect('/Health');
});

app.post('/destroyb/:id', function(req,res){
  Board1.deleteOne({_id: req.params.id}, function(err){
    res.redirect("/Health");
  });
});

  
app.get('/health-rewrite/:id', function (req, res) {
  Board1.findOne({_id:req.params.id}, function (err, board1) {
    res.render("health-rewrite.ejs", {result:board1 });
  })
    
  
});

app.post('/health-rewrite/:id', function (req, res) {
  Board1.findOne({ _id: req.params.id }, function (err, board1) {
    console.log('일단됨')
    board1.content = req.body.inputContent;
   
    board1.save(function (err) {
      res.redirect('/Health');
    });
  });
  
});
//health end

app.listen(3000);
