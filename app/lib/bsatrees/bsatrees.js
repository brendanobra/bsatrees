/**
 * 
 */
var app = angular.module("bsatrees", [ "firebase","uiGmapgoogle-maps" ])
.config(['uiGmapGoogleMapApiProvider', function (GoogleMapApi) {
	  GoogleMapApi.configure({
	    key: 'AIzaSyBg1glI6wrkC32xuaZSaYrHGmv4-0WiarQ',
	    v: '3.17',
	    libraries: 'weather,geometry,visualization'
	  });
	}]);

var baseUrl = "https://bsatrees.firebaseio.com/2014"


	
app.controller("bsatreesCtrl", ['$scope', 'simpleLogin', 'fbutil', 'user', '$location',
                                function($scope, simpleLogin, fbutil, user, $location, $firebase,uiGmapGoogleMapApi) {
  //var ref = new Firebase(baseUrl);
  //var sync = $firebase(ref);
  //$scope.auth = Auth;
  //$scope.user = $scope.auth.$getAuth();

  // download the data into a local object
  //var syncObject = sync.$asObject();
  
  //var profile = fbutil.syncObject(['users', user.uid]);
  //profile.$bindTo($scope, 'profile');

  // synchronize the object with a three-way data binding
  // click on `index.html` above to see it used in the DOM!
  //syncObject.$bindTo($scope, "rootdb");

  uiGmapGoogleMapApi.then(function(maps) {
	$scope.map = { center: { latitude: 45, longitude: -73 }, zoom: 8 };
    $scope.googleVersion = maps.version;
    maps.visualRefresh = true;
    //$log.info('$scope.map.rectangle.bounds set');
    //$scope.map.rectangle.bounds = new maps.LatLngBounds(
     // new maps.LatLng(55,-100),
    // new maps.LatLng(49,-78)
    //)
  });
  

}])