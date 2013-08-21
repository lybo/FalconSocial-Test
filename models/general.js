module.exports = function(_) {

    var fs = require('fs'),
        path = require('path');
    
    this.uploadFile = function(req, res, next) {

        var formData = req.body,
            file = req.files.file,
            tempPath = file.path,
            fileExt = path.extname(file.name).toLowerCase(),
            imageName = req.imageName+fileExt,
            targetPath = path.resolve('./public/uploads/'+imageName)
        ;
     
        if ( _.indexOf(['.png', '.jpg', '.gif'], fileExt) !== -1 ) {
            fs.rename(tempPath, targetPath, function(err) {

                if (err) {
                    console.log('uploadFile: '+err);
                    next();
                } else {
                    req.file = {};
                    req.file.url = 'http://localhost:3000/uploads/'+imageName;
                    req.file.name = file.name;
                    req.file.type = 'photo';
                    next();
                }
                
            });
        } else {
            fs.unlink(tempPath, function (err) {
                if (err) { 
                    console.log('uploadFile: '+err);
                }
                next();
            });
        }
            
    };

    this.deleteFile = function(req, res, next) {

        
        if(req.fileName){

            
            var targetPath = path.resolve('./public/uploads/'+req.fileName);
            fs.unlink(targetPath, function (err) {
                if (err){ 
                    console.log("deleteFile"+err);
                    //req.error = "deleteFile";
                    next();
                } else {
                    next();
                }
                
            });

        } else {
            next();
        }
            
    };

   

};