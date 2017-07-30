angular.module('changeProfilController', ['authServices','userServices']) //utiliser module userServices entre [] de app.js
//ajouter nouveau module crée (userControllers) entre [] de app.js pour pouvoir l'utiliser dans d'autres modules
  .controller('changeProfilCtrl', function($location, User, Auth, $route, $scope) {   //add factory User !!!! pour utiliser ce factory du module  userservices


    Auth.getUser().then(function(data){
        User.getUserByUsername({username: data.data.username}) //get user from database
        .then(function(data){
            if (data.data.success) {
                $scope.user = data.data.user;
            } else {
                console.log(data.data.message);
            }
        });
    });

    $scope.saveChange = function(user) {
      User.changeMyProfil({username: data.data.username})
      .then(function(data){
          if (data.data.success) {  // rediriger vers la page de profil en cas de succes
              $location.path('/myProfil');
          } else {
              console.log(data.data.message);
          }
      });
    }

  });
