var flapperNewsApp = angular.module('flapperNews', ['ui.router']);

flapperNewsApp.factory('auth', ['$http', '$window', function($http, $window){
	var auth = {};

	auth.saveToken = function (token){
		$window.localStorage['flapper-news-token'] = token;
	};

	auth.getToken = function (){
		return $window.localStorage['flapper-news-token'];
	}

	auth.isLoggedIn = function(){
		var token = auth.getToken();

		if(token){
			var payload = JSON.parse($window.atob(token.split('.')[1]));

			return payload.exp > Date.now() / 1000;
		} else {
			return false;
		}
	};

	auth.currentUser = function(){
		if(auth.isLoggedIn()){
			var token = auth.getToken();
			var payload = JSON.parse($window.atob(token.split('.')[1]));

			return payload.username;
		}
	};

	auth.register = function(user){
		return $http.post('/register', user).then(function(data){
			auth.saveToken(data.token);
		});
	};

	auth.logIn = function(user){
		return $http.post('/login', user).then(function(data){
			auth.saveToken(data.token);
		});
	};

	auth.logOut = function(){
		$window.localStorage.removeItem('flapper-news-token');
	};
	return auth;
}])

flapperNewsApp.factory('posts', ['$http', 'auth', function($http, auth){
  // service body
  var o = {
  	posts : [] 
  };
  
  o.getAll = function() {
  	return $http.get('/posts').then(function(data){
  		console.log("data : ");
  		console.log(angular.copy(data.data));
  		return data;
  	});
  };

  o.create = function(post) {
  	return $http.post('/posts', post, {
    headers: {Authorization: 'Bearer '+auth.getToken()}
  }).then(function(data){
  		o.posts.push(data);
  	});
  };
  o.update = function(post) {
  	return $http.put('/posts/'+post._id+'/upvote', null, {
    headers: {Authorization: 'Bearer '+auth.getToken()}
  }).then(function(data){
  		o.posts.push(data);
  	});
  };
  o.get = function(id) {
  	return $http.get('/posts/' + id).then(function(res){
  		return res.data;
  	});
  }
  o.addComment = function(id, comment) {
  	return $http.post('/posts/' + id + '/comments', comment, {
    headers: {Authorization: 'Bearer '+auth.getToken()}
  });
  };
  o.upvoteComment = function(post, comment) {
  return $http.put('/posts/' + post._id + '/comments/'+ comment._id + '/upvote', null, {
    headers: {Authorization: 'Bearer '+auth.getToken()}
  }).success(function(data){
    comment.upvotes += 1;
  });
};

  return o;
}])
flapperNewsApp.controller('MainCtrl',  [
	'$scope', '$http', 'posts', 'auth',
	function($scope, $http, posts, auth){
		$scope.test = 'Hello';
		$scope.isLoggedIn = auth.isLoggedIn;
		posts.getAll().then(function(response) {
			$scope.posts = angular.copy(response.data);
		});
		

	/*	$scope.addPost = function(){
			if(!$scope.title || $scope.title === '') { return; }
			addPosts = {
				title: $scope.title,
				link: $scope.link,
				upvotes: 0,
			  comments: [
			    {author: 'Joe', body: 'Cool post!', upvotes: 0},
			    {author: 'Bob', body: 'Great idea but everything is wrong!', upvotes: 0}
			  ]
			};

			$http.post('/posts').then(function(data){
      console.log("data");
      console.log(angular.copy(data.data));
       angular.copy(data.data);
    });
			$scope.title = '';
			$scope.link = '';
		}*/

		$scope.addPost = function(){
			if(!$scope.title || $scope.title === '') { return; }
			posts.create({
				title: $scope.title,
				link: $scope.link,
			});
			posts.getAll().then(function(response) {
				$scope.posts = angular.copy(response.data);
			});
			$scope.title = '';
			$scope.link = '';
		};
		$scope.incrementUpvotes = function(post) {
			posts.update(post);
			post.upvotes += 1;
			
		};
	}]);
flapperNewsApp.controller('PostsCtrl', [
	'$scope',
	'$stateParams',
	'posts',
	'post',
	'auth',
	function($scope, $stateParams, posts, post, auth){
		console.log(post);
		$scope.post = post;
		//$scope.post = posts.posts[$stateParams.id];
		$scope.addComment = function(){
			if($scope.body === '') { return; }
			$scope.post.comments.push({
				body: $scope.body,
				author: 'user',
				upvotes: 0
			});
			$scope.body = '';
		};
		$scope.addComment = function(){
			if($scope.body === '') { return; }
			posts.addComment(post._id, {
				body: $scope.body,
				author: 'user',
			}).then(function(comment) {
				console.log(comment.data);
				$scope.post.comments.push(comment.data);
			});
			$scope.body = '';
		};

	}]);
flapperNewsApp.controller('AuthCtrl', [
	'$scope',
	'$state',
	'auth',
	function($scope, $state, auth){
		$scope.user = {};

		$scope.register = function(){
			auth.register($scope.user).then(function(error){
				//$scope.error = error;
				$state.go('home');
			}).then(function(){
				$state.go('home');
			});
		};

		$scope.logIn = function(){
			auth.logIn($scope.user).then(function(error){
				//$scope.error = error;
				$state.go('home');
			}).then(function(){
				$state.go('home');
			});
		};
	}])

flapperNewsApp.controller('NavCtrl', [
'$scope',
'auth',
function($scope, auth){
  $scope.isLoggedIn = auth.isLoggedIn;
  $scope.currentUser = auth.currentUser;
  $scope.logOut = auth.logOut;
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
		.state('login', {
			url: '/login',
			templateUrl: '/login.html',
			controller: 'AuthCtrl',
			onEnter: ['$state', 'auth', function($state, auth){
				if(auth.isLoggedIn()){
					$state.go('home');
				}
			}]
		})
		.state('register', {
			url: '/register',
			templateUrl: '/register.html',
			controller: 'AuthCtrl',
			onEnter: ['$state', 'auth', function($state, auth){
				if(auth.isLoggedIn()){
					$state.go('home');
				}
			}]
		})
		.state('posts', {
			url: '/posts/{id}',
			templateUrl: '/posts.html',
			controller: 'PostsCtrl',
			resolve: {
				post: ['$stateParams', 'posts', function($stateParams, posts) {
					return posts.get($stateParams.id);
				}]
			}
		});

		$urlRouterProvider.otherwise('home');
	}]);

