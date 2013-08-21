module.exports = function(){

    
    // get Channels  
    this.getChannels = function(req, res, next) {

    	req.channels = [
            {"name":"Konfirmanden","id":433104606739910},
            {"name":"Dolorem","id":433104606739911},
            {"name":"Neque","id":433104606739912},
            {"name":"Ipsum","id":433104606739913},
            {"name":"Lorem","id":433104606739914},
            {"name":"Consectetur","id":433104606739915},
            {"name":"Adipisci","id":433104606739916}
        ];

        next();
    };
 
};