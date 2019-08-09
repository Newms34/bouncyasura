var express = require('express');
var router = express.Router();
var path = require('path');

router.get('/',function(req,res,next){
	res.sendFile(path.join(__dirname, '../views', 'index.html'));
});
router.get('/admin',function(req,res,next){
	res.sendFile(path.join(__dirname, '../views', 'admin.html'));
});

// res.sendFile(path.join(__dirname, '../public', 'index1.html'));
module.exports=router;