const express = require('express'),
    router = express.Router(),
    path = require('path'),
    fs = require('fs');

router.get('/',(req,res,next)=>{
	res.sendFile(path.join(__dirname, '../views', 'index.html'));
});
router.get('/admin',(req,res,next)=>{
	res.sendFile(path.join(__dirname, '../views', 'admin.html'));
});
router.get('/stats',(req,res,next)=>{
    const file = JSON.parse(fs.readFileSync('./bounceRecord.json','utf-8'));
    res.send(file);
})

// res.sendFile(path.join(__dirname, '../public', 'index1.html'));
module.exports=router;