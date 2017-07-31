var User = require('../models/user');
var Offer = require('../models/offer');

var jwt = require('jsonwebtoken');
var secret = 'valarmorghulis';

// Export routes to the main server.js file
module.exports = function(router) {
    router.post('/profile', function(req, res) { //enregistrer un profil
        if (req.body.username == null || req.body.username == ''
         || req.body.password == null || req.body.password == ''
         || req.body.age == null || req.body.age == ''
         || req.body.phoneNumber == null|| req.body.phoneNumber == ''
         || req.body.country == null || req.body.country == ''
         || req.body.city == null || req.body.city == '') {
            res.json({ success: false, message: 'données ne sont pas complètes' });
        }
        else {
            var user = new User();
            user.username = req.body.username;
            user.setPassword(req.body.password);
            user.age = req.body.age;
            user.phoneNumber = req.body.phoneNumber;
            user.country = req.body.country;
            user.city = req.body.city;
            user.save(function(err) { //sauver dans la base de données
                if (err) {
                    res.json({ success: false, message: 'Cet identifiant existe déja ou faute de format d entrée' });
                } else {
                    res.json({ success: true, message: 'user created!' }); //utilisateur a été sauvé, renvoyer réponse
                }
            });
        }
    });

    router.post('/getProfile', function(req, res) { //retourne les details d'un profil
        User.findOne({ username: req.body.username})
        .select('username age phoneNumber country city').exec(function(err,user){
            if(err){
                throw err;
            }
            if(!user){
                res.json({success: false, message: 'aucun utilisateur existe avec cet identifiant' });
            }
            else if(user){            //= mot de passe soumis
                res.json({ success: true, message: 'utilisateur trouvé, envoi des infos' , user: user});
            }
        });
    });

    router.post('/changeProfile', function(req, res) { //change les details d'un profil
        var user = User.findOne({ username: req.body.username}).select('username age phoneNumber country city').exec(function(err,user){
            if(err){
                throw err;
            }
            else {
              if (req.body.age == null || req.body.age == ''
               || req.body.phoneNumber == null|| req.body.phoneNumber == ''
               || req.body.country == null || req.body.country == ''
               || req.body.city == null || req.body.city == '') {
                  res.json({ success: false, message: 'données ne sont pas complètes' });
              }
              else{
                user.age=req.body.age;
                user.phoneNumber=req.body.phoneNumber;
                user.country=req.body.country;
                user.city=req.body.city;
                res.json({ success: true, message: 'modifications de lutilisateur effectuée'});
              }
            }
        });
    });

    router.post('/login', function(req, res) { //login d'un utilisateur
        if (req.body.username == null || req.body.username == '' || req.body.password == null || req.body.password == ''){
            res.json({ success: false, message: 'Identifiant et/ou mot de passe doivent être spécifiés' });
        }
        else{                                                   //attributs qu'on veut avoir dans variable user
            User.findOne({ username: req.body.username}).select('username hash salt age phoneNumber country city').exec(function(err,user){
                if(err){
                    throw err;
                }
                if(!user){
                    res.json({success: false, message: 'authentication impossible, pas utilisateur avec cet identifiant dans la base de données' });
                }
                else if(user){            //= mot de passe soumis
                    if(user.checkPassword(req.body.password)){  //user est connecté
                        var token = jwt.sign({username: user.username, age: user.age,
                                           phoneNumber: user.phoneNumber, country: user.country, city: user.city }, secret, {expiresIn: '1h'});
                        res.json({ success: true, message: 'user loggs in' , token: token});
                    }
                    else{
                        res.json({ success: false, message: 'wrong password' });
                    }
                }
            });
        }
    });

    router.use(function(req, res, next){ //middleware pour /getInfo
        var token = req.body.token || req.body.query || req.headers['x-access-token']; //récuperer le token de la requete
        if(token){ //si il y a un token
            jwt.verify(token, secret, function(err, decoded){
                if(err){
                    res.json({ success: false, message: 'token non valide' });
                }
                else{
                    req.decoded = decoded;    //maintenant accessible dans req de /getInfo
                    next(); // prochain route
                }
            });
        }
        else{
            res.json({ success: false, message: 'pas de token présent' });
        }
    });

    router.post('/getInfo', function(req, res){ //decrypte le token en utilisant middleware et renvoie au client
        res.send(req.decoded);
    });

    router.post('/offer', function(req, res) { //enregistrer une offre de louage
        if (req.body.username == null || req.body.username == ''
         || req.body.brand == null || req.body.brand == ''
         || req.body.model == null || req.body.model == ''
         || req.body.price == null|| req.body.price == '' ) {
            res.json({ success: false, message: 'données ne sont pas complètes' });
        }
        else {
            var offer = new Offer();
            offer.username = req.body.username;
            offer.brand = req.body.brand;
            offer.model = req.body.model;
            offer.price = req.body.price;
            offer.save(function(err) { //sauver dans la base de données
                if (err) {
                    res.json({ success: false, message: 'Faute de format d entrée' });
                } else {
                    res.json({ success: true, message: 'offre crée!' }); //utilisateur a été sauvé, renvoyer réponse
                }
            });
        }
    });

    router.post('/myOffers', function(req, res) { //envoie liste des offres de louage l'utilisateur
        Offer.find({ username: req.body.username})
        .select('brand model price').exec(function(err,offers){
            if(err){
                throw err;
            }
            else{
                res.json({ success: true, message: 'offer sent back to user' , offers: offers});
            }
        });
    });


    router.post('/removeOffer', function(req, res) { //envoie liste des offres de louage l'utilisateur
        Offer.remove({ _id: req.body.offerId})
        .exec(function(err,offers){
            if(err){
                res.json({ success: false, message: 'impossible de supprimer cette offre' });
            }
            else{
                res.json({ success: true, message: 'offre supprimée' });
            }
        });
    });


    router.post('/searchOffer', function(req, res) { //envoie liste des offres de location d'autres utilisateurs
        console.log(req.body);
        Offer.find(req.body)
        .select('username brand model price').exec(function(err,offers){
            if(err){
                console.log(err);
                res.json({ success: false, message: 'impossible de chercher des offres' });
            }
            else{
                res.json({ success: true, message: 'existing offers sent to user' , offers: offers});
            }
        });
    });


    return router; // Retourne le router vers le serveur
}
