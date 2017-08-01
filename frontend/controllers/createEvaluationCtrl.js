angular.module('createEvaluationController', ['evaluationService','authServices']) //utiliser module userServices entre [] de app.js
//ajouter nouveau module crée (userControllers) entre [] de app.js pour pouvoir l'utiliser dans d'autres modules
    .controller('createEvaluationCtrl', function($location, Evaluation, Auth, $route, $scope) {   //add factory User !!!! pour utiliser ce factory du module  userservices

        $scope.createEval = function() {
          Auth.getUser().then(function(data){
            var username = data.data.username;
            Evaluation.create({username: $scope.evaluationData.username, eval: $scope.evaluationData.eval,
                          commentary: $scope.evaluationData.commentary, author: data.data.username})
                          .then(function(data){
                if (data.data.success) {  // rediriger vers la page de login en cas de succes
                    $location.path('/home');
                } else {
                    console.log(data.data.message);
                }
            });
          });
        };

        Auth.getUser().then(function(data){
            Evaluation.getEvaluationByAuthor({author: data.data.author}) //get all evaluations from user from database
            .then(function(data){
                if (data.data.success) {
                    $scope.evaluations = data.data.evaluations;
                } else {
                    console.log(data.data.message);
                }
            });
        });

        $scope.deleteEvaluation = function(evaluation) {
            Evaluation.removeEvaluation({evaluationId: $scope.evaluations[ $scope.evaluations.indexOf(evaluation) ]._id})
            .then(function(data){
                $scope.evaluation.splice($scope.evaluation.indexOf(evaluation),1);
                if (!data.data.success) {
                    console.log(data.data.message);
                }
            });
        }
    });
