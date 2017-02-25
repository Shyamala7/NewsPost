var flapperNewsApp = angular.module('flapperNews', ['ui.router']);

flapperNewsApp.factory('posts', [function(){
  // service body
  var o = {
  	posts: [
  	{"title":"post 1", "upvotes":1},
  	{"title":"post 2", "upvotes":10},
  	{"title":"post 3", "upvotes":6},
  	{"title":"post 4", "upvotes":7},
  	{"title":"post 5", "upvotes":9},
  	{"title":"post 6", "upvotes":15}
  	]
  };
  return o;
}])
flapperNewsApp.controller('MainCtrl',  [
	'$scope','posts',
	function($scope, posts){
		$scope.test = 'Hello';
		
		$scope.posts = posts.posts;

		$scope.addPost = function(){
			if(!$scope.title || $scope.title === '') { return; }
			$scope.posts.push({
				title: $scope.title,
				link: $scope.link,
				upvotes: 0,
			  comments: [
			    {author: 'Joe', body: 'Cool post!', upvotes: 0},
			    {author: 'Bob', body: 'Great idea but everything is wrong!', upvotes: 0}
			  ]
			});
			$scope.title = '';
			$scope.link = '';
		}
		$scope.incrementUpvotes = function(post) {
			post.upvotes += 1;
		};
	}]);
flapperNewsApp.controller('PostsCtrl', [
	'$scope',
	'$stateParams',
	'posts',
	function($scope, $stateParams, posts){
		$scope.post = posts.posts[$stateParams.id];
		$scope.addComment = function(){
		  if($scope.body === '') { return; }
		  $scope.post.comments.push({
		    body: $scope.body,
		    author: 'user',
		    upvotes: 0
		  });
		  $scope.body = '';
		};
	}]);

flapperNewsApp.config([
	'$stateProvider',
	'$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {

		$stateProvider
		.state('home', {
			url: '/home',
			templateUrl: '/home.html',
			controller: 'MainCtrl'
		})
		.state('posts', {
			url: '/posts/{id}',
			templateUrl: '/posts.html',
			controller: 'PostsCtrl'
		});

		$urlRouterProvider.otherwise('home');
	}]);