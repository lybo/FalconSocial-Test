module.exports = function(_){
    //var _ = require('underscore');
		var connection = require('./connection')();
    var utilize = require('./utilize');

    this.getUser = function(req, res, next) {
         console.log('======user id: '+req.userId);
         //console.log(req);
         var sql = "SELECT * FROM users WHERE id = ? ";
         console.log(sql);
         connection.query( sql, [
              req.userId
            ], function(err, rows, fields) {
            if (err) throw err;
            if (rows[0]) {
              req.user = rows[0];
              next();
            } else {
              next(new Error("No user found"));
            }
          });
    };

    this.getLoggedInUser = function(req, res, next) {

          var currentUser = null;

          if(req.is_logged) {
            console.log('user id: '+req.session.user.id);
            var sql = "SELECT * FROM users WHERE id='" + req.session.user.id + "'";

            connection.query( sql, function(err, rows, fields) {
             if (err) throw err;
             if (rows[0]) {
                req.currentUser = rows[0];
                next();
              } else {
                next(new Error("No user found"));
              }
            });
          } else {
            next();
          }
    };

    this.getUsers = function(req, res, next) {


        var sqlWhere = '',
            sqlWhere_and = new Array(),
            sqlWhere_or = new Array()
        ;

        if(req.query.user_ids) {
          req.user_ids = req.query.user_ids.split(',');
        }

        if( req.user_ids && req.user_ids.length ) {
          var user_ids = req.user_ids.join(',');
          sqlWhere_and.push(' id IN (' + user_ids + ') ');
          console.log(user_ids);
          console.log(sqlWhere_and);
        }


        if( sqlWhere_and.length ) {
          sqlWhere = 'WHERE ' + sqlWhere_and.join('AND');
        }

        var sql = "SELECT * FROM users "+sqlWhere;
        console.log('getUsers: "' + sql + '"');

        req.users = new Array();

        connection.query( sql, function(err, rows, fields) {
           if (err) throw err;
           if (rows.length) {
              req.users = rows;
              next();
            } else {
              next();
            }
        });
    };

    this.getUsersSubscribed = function(req, res, next) {

        req.users = new Array();

        var sqlWhere = '',
            sqlWhere_and = new Array(),
            sqlWhere_or = new Array()
        ;

        if(req.query.user_ids) {
          req.user_ids = req.query.user_ids.split(',');
        }

        
        req.user_id = req.query.user_id ? req.query.user_id : 0 ;
        

        if( (req.user_ids && req.user_ids.length) || req.user_id) {

          if(req.user_ids && req.user_ids.length) {
            var user_ids = req.user_ids.join(',');
            sqlWhere_and.push(' id IN (' + user_ids + ') ');
            console.log(user_ids);
            console.log(sqlWhere_and);
          }

          if(req.user_id) {
            sqlWhere_and.push(' id IN (' + req.user_id + ') ');
          }

          if( sqlWhere_and.length ) {
            sqlWhere = 'WHERE ' + sqlWhere_and.join('AND');
          }

          var sql = "SELECT * FROM users "+sqlWhere;
          console.log('getUsers: "' + sql + '"');

          connection.query( sql, function(err, rows, fields) {
             if (err) throw err;
             if (rows.length) {
                req.users = rows;
                next();
              } else {
                next();
              }
          });

        } else {
          next();
        }


        
    };

    this.checkUserExist = function(req, res, next) {
         console.log('user email: '+req.body.signUpemail);
         var sql = "SELECT COUNT(*) AS userCount FROM users WHERE email='" + req.body.signUpemail + "' LIMIT 1";
         connection.query( sql, function(err, rows, fields) {
           if (err) throw err;
           if (rows[0]) {
              console.log('email exist'+rows[0].userCount);
              req.userExist = rows[0].userCount;
              next();
            } else {
              next();
            }
          });
    };

    this.getPassword = function(req, res, next) {
         console.log('user email: '+req.body.remindMeEmail);
         var sql = "SELECT password  FROM users WHERE email='" + req.body.remindMeEmail + "' AND is_publish='1' LIMIT 1";

         req.user = {};
         req.user.email = req.body.remindMeEmail;

         connection.query( sql, function(err, rows, fields) {
           if (err) throw err;
           if (rows[0]) {
              console.log('password: '+rows[0].password);
              req.user.password  = rows[0].password;
              next();
            } else {
              next();
            }
          });
    };

    this.verifyUserAccount = function(req, res, next) {
          console.log('req.user.is_publish == req.hashCode: ' + req.user.is_publish +'=='+ req.hashCode);
          


          req.userHasActivated = 0;

          if( req.user && req.user.is_publish == '1' ) { 
              console.log(req.user.is_publish);
              req.userHasAllreadyActivated = 1;
              next();

          } else {

            req.userHasAllreadyActivated = 0;

            if(req.user && req.user.is_publish == req.hashCode) {
                  var sql = "UPDATE users SET " 
                            + "is_publish = 1 "
                            + "WHERE id = ?"
                  ;
                  connection.query( sql, [
                        req.userId, 
                      ], 
                      function(err, result) {
                      if (err) throw err;
                      if ( result.affectedRows ) {
                        req.userHasActivated = 1;
                      } 
                      next();
                      
                  });
              } else {
                  next();
              }
          }
    };

    this.insertUser = function(req, res, next) {

          if(!req.userExist) {

            req.hash = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

            for( var i=0; i < 80; i++ ) {
              req.hash += possible.charAt(Math.floor(Math.random() * possible.length));
            }

            req.user = {};

            var sql = "INSERT INTO users (id, email, password, lat_lng, lang_id, is_publish, date_in) VALUES (null, ?, ?, ?, ?, ?, UNIX_TIMESTAMP() )";
              
            connection.query( sql, [
                  req.body.signUpemail, 
                  req.body.signUppassword, 
                  req.body.lat_lng ? req.body.lat_lng : '', 
                  req.body.signUpLanguage, 
                  req.hash
                ],
                function(err, result) {

                if (err) throw err;
                console.log(result);
                if ( result.insertId ) {
                  req.user.email = req.body.signUpemail;
                  req.user.id = result.insertId;
                  next();
                } else {
                  next();
                }
            });

          } else {
            next();
          }

    };

    this.sendEmailVerification = function(req, res, next) {

          if( req.user ) {
              var nodemailer = require("nodemailer");

              // create reusable transport method (opens pool of SMTP connections)
              var smtpTransport = nodemailer.createTransport("SMTP",{
                  service: "Gmail",
                  auth: {
                      user: "vocabulary.gr@gmail.com",
                      pass: "6944798259lybogmail"
                  }
              });

              // setup e-mail data with unicode symbols
              var mailOptions = {
                  from: "vocabulary.gr <do.not.reply@vocabulary.gr>", // sender address
                  to: req.user.email, // list of receivers
                  subject: "Welcome to vocabulary.gr", // Subject line
                  html: 'Welcome to vocabulary.gr<br/><br/>'+
                        '<a href="http://localhost:3000/verify/'+req.user.id+'/'+req.hash+'" target="_blank">Please verify your account</a>'
              }

              // send mail with defined transport object
              smtpTransport.sendMail(mailOptions, function(error, response){

                  if(error){
                      console.log(error);
                      next();
                  }else{
                      console.log("Message sent: " + response.message);
                      next();
                  }
                  //smtpTransport.close();
              });
          } else {
            next();
          }

    };

    this.sendEmailRemindMe = function(req, res, next) {

        if(req.user.password) {
            var nodemailer = require("nodemailer");

            // create reusable transport method (opens pool of SMTP connections)
            var smtpTransport = nodemailer.createTransport("SMTP",{
                service: "Gmail",
                auth: {
                    user: "vocabulary.gr@gmail.com",
                    pass: "6944798259lybogmail"
                }
            });

            // setup e-mail data with unicode symbols
            var mailOptions = {
                from: "vocabulary.gr <do.not.reply@vocabulary.gr>", // sender address
                to: req.user.email, // list of receivers
                subject: "vocabulary.gr[remindme]", // Subject line
                html: 'vocabulary.gr reminds you your password:<br/><br/>'+
                      '<strong>'+req.user.password+'</strong>'
            }

            // send mail with defined transport object
            smtpTransport.sendMail(mailOptions, function(error, response){

                if(error){
                    console.log(error);
                    next();
                }else{
                    console.log("Message sent: " + response.message);
                    next();
                }
                //smtpTransport.close();
            });
        } else {
          next();
        }

    };

    this.getUserLastActivities = function(req, res, next) {
          
          req.userLastActivities = new Array();

          if( req.is_logged ) {

            console.log('user id: '+req.session.user.id);

            var sqlWhere = '',
              sqlWhere_and = new Array(),
              sqlWhere_or = new Array()
            ;

            if( req.lastActivityTopic ) {
              
              sqlWhere_and.push('  topic = ' + req.lastActivityTopic + ') ');
            }

            if( sqlWhere_and.length ) {
              sqlWhere = 'AND ' + sqlWhere_and.join('AND')
            }

            var sql = "SELECT * FROM user_last_activities WHERE user_id = ? "+sqlWhere+' GROUP BY action_type, topic, topic_id  ORDER BY date_in DESC LIMIT 0, 10  ';
            console.log(sql);
            connection.query( sql, [
                  req.session.user.id
                ], function(err, rows, fields) {
                if (err) throw err;
                if (rows.length) {
                  //console.log('rows.length:'+rows.length);
                  req.userLastActivities = rows;
                  next();
                } else {
                  //console.log('rows.length');
                  next();
                }
            });
          } else {
            next();
          }
    };

    this.insertUserLastActivity = function(req, res, next) {


        console.log('lastActivity: '+req.lastActivity);
        if( req.is_logged && req.lastActivity ) {

          var sql = "INSERT INTO user_last_activities (id, user_id, topic, topic_id, action_type, html, date_in) VALUES (null, ?, ?, ?, ?, ?, UNIX_TIMESTAMP() )";
          
          connection.query( sql, [
              req.session.user.id,
              req.lastActivity.Topic, 
              req.lastActivity.TopicId, 
              req.lastActivity.ActionType,
              req.lastActivity.html
            ],
            function(err, result) {

            if (err) throw err;
            console.log(result);
            if ( result.insertId ) {
              
              next();
            } else {
              next();
              //next(new Error("No vocabularies found"));
            }

          });

        } else {
          next();
        }
    };

    this.getUserLibrary = function(req, res, next) {
      var sql = "SELECT * FROM user_library WHERE user_id = ? ORDER BY date_in DESC";
        console.log('getUsers: "' + sql + '"');

        req.userLibrary = new Array();
        connection.query( sql, [
              req.session.user.id
            ], function(err, rows, fields) {
            if (err) throw err;
            if (rows.length) {
              req.userLibrary = rows;
              req.vocabulary_ids = _.uniq( _.pluck(req.userLibrary, 'vocabulary_id') );
              next();
            } else {
              next();
            }
        });
    };

    this.checkExistVocabularyInLibrary = function(req, res, next) {

          req.vocabularyLibrary = null;
          if(req.vocabularyId){
            var sql = "SELECT * FROM user_library WHERE user_id = ? AND vocabulary_id = ? LIMIT 1";
              console.log('checkExistVocabularyInLibrary: "' + sql + '"');

              connection.query( sql, [
                    req.session.user.id,
                    req.vocabularyId
                  ], function(err, rows, fields) {
                  if (err) throw err;
                  if (rows[0]) {
                    req.vocabularyLibrary = rows[0];
                    next();
                  } else {
                    next();
                  }
              });
          } else {
            next();
          }
    };

    this.insertLibrary = function(req, res, next) {


        console.log('vocabulary_id: '+req.body.vocabulary_id);
        req.success = 1;
        if( req.is_logged && req.body.vocabulary_id ) {

          var sql = "INSERT INTO user_library (id, user_id, vocabulary_id, date_visit, date_in) VALUES (null, ?, ?, UNIX_TIMESTAMP(), UNIX_TIMESTAMP() )";
          
          connection.query( sql, [
              req.session.user.id,
              req.body.vocabulary_id
            ],
            function(err, result) {

            if (err) throw err;
            console.log(result);
            if ( result.insertId ) {
              req.libraryId = result.insertId;
              next();
            } else {
              req.success = 0;
              next();
              //next(new Error("No vocabularies found"));
            }

          });

        } else {
          req.success = 0;
          next();
        }
    };

    this.deleteUserLibrary = function(req, res, next) {

          var sql = "DELETE FROM user_library WHERE id = ?";
          
          req.success = 1;
          connection.query( sql, [
              req.libraryId
            ],
            function(err, result) {

            if (err) throw err;
            console.log(result);
            if ( result.affectedRows ) {
              next();
            } else {
              req.success = 0;
              next(new Error("No deleteUserLibrary found"));
            }

          });
    };

    this.getSubscribe = function(req, res, next) {

        var sql = "SELECT * FROM user_subscribes WHERE id = ?";
        console.log('getSubscribe: "' + sql + '", '+req.userSubscribeId);

        req.userSubscribe = null;
        connection.query( sql, [
              req.userSubscribeId
            ], function(err, rows, fields) {

            if (err) throw err;
            if (rows[0]) {
              console.log('rows[0]');
              console.log(rows[0]);
              req.userSubscribe = rows[0];
              req.userId = parseInt(rows[0].subscribe_user_id);
              next();
            } else {
              next(new Error("No user_subscribes found"));
            }
        });
    };

    this.getUserSubscribes = function(req, res, next) {

        var sql = "SELECT * FROM user_subscribes WHERE user_id = ? ORDER BY id DESC";
        console.log('getUsers: "' + sql + '"');

        req.userSubscribes = new Array();
        connection.query( sql, [
              req.session.user.id
            ], function(err, rows, fields) {
            if (err) throw err;
            if (rows.length) {
              req.userSubscribes = rows;
              next();
            } else {
              next();
            }
        });
    };

    this.checkUserSubscribe = function(req, res, next) {
          req.userSubscribeExist = 0;
          if(req.body.subscribe_user_id  && req.is_logged){

            var sql = "SELECT COUNT(*) AS userSubscribeCount FROM user_subscribes WHERE user_id = ? AND subscribe_user_id = ? LIMIT 1";
            connection.query( sql, [
                req.session.user.id, 
                req.body.subscribe_user_id
              ], function(err, rows, fields) {
              if (err) throw err;
              if (rows[0]) {
                console.log('email exist'+rows[0].userSubscribeCount);
                req.userSubscribeExist = rows[0].userSubscribeCount;
                next();
              } else {
                next();
              }
            });

          } else {
            next();
          }

          
    };

    this.insertUserSubscribe = function(req, res, next) {

          req.subscribe = null;
          if(!req.userSubscribeExist){

            var sql = "INSERT INTO user_subscribes (id, user_id, subscribe_user_id, date_in) VALUES (null, ?, ?, UNIX_TIMESTAMP() )";
            console.log(sql+req.body.subscribe_user_id);  
            connection.query( sql, [
                  req.session.user.id, 
                  req.body.subscribe_user_id
                ],
                function(err, result) {

                if (err) throw err;
                console.log(result);
                if ( result.insertId ) {
                  req.subscribe = { 
                    id: result.insertId,
                    user_id: req.session.user.id,
                    subscribe_user_id: parseInt(req.body.subscribe_user_id)
                  };
                  req.userId = req.body.subscribe_user_id;
                  req.num_subscribes_action = 'insert';
                  next();
                } else {
                  next();
                }
            });

          } else{
            next();
          }

    };

    this.deleteUserSubscribe = function(req, res, next) {


          var sql = "DELETE FROM user_subscribes WHERE id = ?";
          console.log(sql);

          connection.query( sql, [
              req.userSubscribeId
            ],
            function(err, result) {

            if (err) throw err;
            if ( result.affectedRows ) {
              req.num_subscribes_action = 'delete';
              next();
            } else {
              next();
            }

          });
    };

    this.updateUserNum = function(req, res, next) {
        var sql = "UPDATE users SET " 
                  + "num_subscribes = ? "
                  + "WHERE id = ?"
        ;

        if(req.num_subscribes_action == 'insert'){
          req.user.num_subscribes++;
        } else if(req.num_subscribes_action == 'delete') {
          req.user.num_subscribes--;
          req.user.num_subscribes = (req.user.num_subscribes>=0) ? req.user.num_subscribes : 0;
        }

        connection.query( sql, [
              req.user.num_subscribes,
              req.userId
            ], 
            function(err, result) {
            if (err) throw err;
            if ( result.affectedRows ) {
              
              next();
            } else {
              next(new Error("No updateUserNum found"));
            }
        });
    };
    

};
