'use strict';

/* Controllers */

angular
		.module('myApp.controllers', [ 'firebase', 'firebase.utils' ])
		.controller(
				'HomeCtrl',
				[
						'$scope',
						'fbutil',
						'user',
						'FBURL',
						function($scope, fbutil, user, FBURL) {
							$scope.syncedValue = fbutil
									.syncObject('syncedValue');
							$scope.user = user;
							$scope.FBURL = FBURL;
						} ])

		.controller('ChatCtrl',
				[ '$scope', 'messageList', function($scope, messageList) {
					$scope.messages = messageList;
					$scope.addMessage = function(newMessage) {
						if (newMessage) {
							$scope.messages.$add({
								text : newMessage
							});
						}
					};
				} ])

		.controller(
				'TroopsCtrl',
				[
						'$scope',
						'$log',
						'syncData',
						'fbutil',
						'user',
						function($scope, $log, syncData, fbutil, user,
								$location, troopList) {

							$scope.troops = syncData('troops', 10).$asArray()

						} ])
		.controller(
				'CustomersCtrl',
				[
						'$scope',
						'$log',
						'$http',
						'$q',
						'syncData',
						'fbutil',
						'user',
						'$location',
						'$routeParams',
						'GOOGLE_API_KEY',
						'FBURL',

						function($scope, $log, $http, $q, syncData, fbutil,
								user, $location, $routeParams, GOOGLE_API_KEY, FBURL) {
							if (user) {
								var profile = fbutil.syncObject([ 'users',
										user.uid ]);
								profile.$bindTo($scope, 'profile');
								$scope.user = user;
								$log.info('user is ' + user.uid)
							} else {
								$log.info("no user is logged in")
								$scope.user = null

							}
							// $scope.FBURL = FBURL;
							/*
							 * BJO TODO -externalize these into DB
							 */
							if ($routeParams.troopId){
								$scope.filterUnit = {}
								$scope.filterUnit.name = $routeParams.troopId
								
								$scope.troopId = $routeParams.troopId
							}
							if ($routeParams.pickupDate){
								
								$scope.filterDate = $routeParams.pickupDate
								
							}
							$scope.pickupDates = [ {
								name : "12/27/2014",
								id : "12/27/2014"
							}, {
								name : "01/03/2015",
								id : "01/03/2015"
							}, {
								name : "01/10/2015",
								id : "01/10/2015"
							} ];
							$scope.cities = [ {
								name : "Fairfield",
								city : "Fairfield"
							}, {
								name : "Suisun",
								city : "Suisun"
							} ];

							$scope.mapCenter = [ 38.273623, -122.025803 ];
							$scope.resetNewCustomer = function() {
								var newCustomer = {};
								newCustomer.name = "";
								newCustomer.address = "";
								newCustomer.pickupdate = $scope.pickupDates[1];
								newCustomer.city = $scope.cities[0];
								newCustomer.email = ""
								newCustomer.phone = ""
								newCustomer.coords = $scope.mapCenter
								newCustomer.lat = '0.0'
								newCustomer.lng = '0.0'
								newCustomer.unit = ""
								$scope.newCustomer = newCustomer
								$scope.newCustomerMapHide = "true"
							}
							$scope.resetNewCustomer();

							$scope.selectedCity = "Fairfield"

							$scope.settings = syncData('settings', 2000)
									.$asObject()

							$scope.territories = syncData('territories', 2000)
									.$asArray();

							$scope.units = syncData('units', 100).$asArray();

							$scope.testCoords = ""

							$scope.googleApiKey = GOOGLE_API_KEY;
							$log.info("api key is " + $scope.googleApiKey)
							$scope.selectedPickupDate = $scope.pickupDates[1]
							$scope.selectedCity = $scope.cities[0]
							$log.info("selected pickup date is: "
									+ $scope.selectedPickupDate.name)
							$scope.customers = syncData('customers', 1000)
									.$asArray()
							$scope.collectionSites = syncData(
									'collection_sites', 2000).$asArray()

							$scope.encodedAddress = "un"

							$scope.assignUnit = function() {
								$scope.territories.forEach(function(entry) {

									var coords = entry.coords
									var paths = new Array();
									var len = 0;
									coords.forEach(function(coord) {

										var gcoord = new google.maps.LatLng(
												coord[0], coord[1]);
										paths[len] = gcoord
										len = len + 1
									});

									var territoryMap = new google.maps.Polygon(
											{
												paths : paths
											});
									var latLng = new google.maps.LatLng(
											$scope.newCustomer.coords[0],
											$scope.newCustomer.coords[1]);

									if (google.maps.geometry.poly
											.containsLocation(latLng,
													territoryMap)) {
										$log.info("found it!:" + entry.name
												+ ", unit is: " + entry.unit)

										$scope.newCustomer.unit = entry.unit
										$log.info(google.maps.geometry.poly
												.containsLocation(latLng,
														territoryMap));
									}

								});
							}
							$scope.generateRoutes = function() {
								$scope.generatedRoutes = []
								$scope.routeChunks = []
								$scope.currentChunk = []
								var chunkCt = 0
								var routeCt = 0
								var totalCustomers = 0
								$log.info("generated routes are: " + $scope.generatedRoutes[0] )
								$scope.generatedRouteCount= 0
								$log.info("generating lists for" + $scope.filterUnit.name + " on: " + $scope.filterDate.name);
								var unitName =   $scope.filterUnit.name
								var dateFilter = $scope.filterDate.name
								$scope.customers.forEach(function(customer) {
									if (customer.unit == unitName ){
										if (customer.pickupdate == dateFilter){
											totalCustomers = totalCustomers + 1
											$log.info("found it!")
											$scope.generatedRoutes[$scope.generatedRouteCount] = customer
											$scope.generatedRouteCount = $scope.generatedRouteCount +1
											if (routeCt <= 5){
												$log.info("adding address")
												$scope.currentChunk[routeCt] = customer.address
												
											}
											else{
												$scope.routeChunks[chunkCt] = 	$scope.currentChunk.join('/').split(' ').join('+')
												$log.info("chunked: " + $scope.routeChunks[chunkCt])
												chunkCt = chunkCt+1 
												$scope.currentChunk = []
												routeCt = 0
												$scope.currentChunk[routeCt] = customer.address
												
											}
											routeCt = routeCt +1
										}
										else{
											$log.info("no date match")
										}
									}
									
								});
								
								//add in last chunk, if any
								$log.info("last, current chunk is: " +  $scope.currentChunk.length)
								if ( $scope.currentChunk.length > 0){
									$log.info("adding last chunk: " + 	$scope.currentChunk)
									$scope.routeChunks[chunkCt] = $scope.currentChunk.join('/').split(' ').join('+')
									$log.info("adding last chunk: " + 	$scope.routeChunks[chunkCt])
									chunkCt = chunkCt+1 
									$scope.currentChunk = []
									routeCt = 0
								}
								$log.info("process total: " + totalCustomers)
							
							}
							$scope.assignUnits2Customers = function() {
								$scope.messages = ""
								var count = 0
								$scope.customers
										.forEach(function(customer) {
											var assigned = false
											$scope.territories
													.forEach(function(territory) {
														// $log.info('looking at
														// territory: ' +
														// territory.name )
														var coords = territory.coords
														var paths = new Array();
														var len = 0;
														coords
																.forEach(function(
																		coord) {

																	var gcoord = new google.maps.LatLng(
																			coord[0],
																			coord[1]);
																	paths[len] = gcoord
																	len = len + 1
																});

														var territoryMap = new google.maps.Polygon(
																{
																	paths : paths
																});
														var latLng = new google.maps.LatLng(
																customer.coords[0],
																customer.coords[1]);

														if (google.maps.geometry.poly
																.containsLocation(
																		latLng,
																		territoryMap)) {
															if (territory.unit == 'Unassigned') {
																$log
																		.info("customer address is: "
																				+ customer.address
																				+ " is not owned by anyone: "
																				+ territory.unit
																				+ " in territory"
																				+ territory.name)
															} else {
																assigned = true
																//$log.info("customer: " + customer.address)
																
																if (territory.$id == "6" ){
																	$log.info("found one in area 6")
																}
																if (territory.$id == "21" ){
																	$log.info("found one in area 21")
																}
																if (territory.$id == "22" ){
																	$log.info("found one in area 22")
																}
																customer.territory = territory.$id
															//	$log.info("customer territory is: " + customer.territory)
																customer.unit = territory.unit
																if (customer.pickupdate){
																	if (customer.pickupdate.name){
																	customer.pickupdate = customer.pickupdate.name
																	$log.info("customer pickupdate is now:  " + customer.pickupdate)
																	}
																}else{
																	$log.info("no pickup date on: " + customer.name)
																}
																count = count + 1
																$scope.customers.$save(customer)

															}

														}else{
															//$log.info("could not find customer:" + customer.name + " in a territory")
														}
													});
											if (assigned == false){
												$log.info("could not assign: " + customer.address, "which is assigned to " + customer.unit)
											}
										});
								  
									$scope.messages = "assigned: " + count + " customers"
							}

							$scope.geocode = function(customer) {

								if (typeof customer == 'undefined')
									return 'no coordinates';
								$log.info("gecoding" + customer.address)
								if (typeof customer.coordinates != 'undefined') {
									$log.info(customer.address
											+ " is already encoded at: "
											+ customer.coordinates)
									return;
								}
								var url = 'https://maps.googleapis.com/maps/api/geocode/json?address='
										+ customer.address
										+ '&key='
										+ $scope.googleApiKey
								$log.info("getting address:" + customer.address
										+ " with url: " + url)

								$http
										.get(url)
										.

										success(
												function(data, status, headers,
														config) {
													// $scope.posts = data;
													$log
															.info('got data: '
																	+ data.results[0].geometry.location.lat
																	+ ","
																	+ data.results[0].geometry.location.lng)
													customer.lat = data.results[0].geometry.location.lat
													customer.lng = data.results[0].geometry.location.lng
													customer.coords = [
															data.results[0].geometry.location.lat,
															data.results[0].geometry.location.lng ]

													return data;
												}).error(
												function(data, status, headers,
														config) {
													// log error
													$log.info('got error')
												});
							}
							$scope.currentAddresses = new Array();
							$scope.customersForTroop = function(troop,
									customers) {
								var len = 0;
								$scope.currentTroop = troop
								customers
										.forEach(function(customer) {
											$log.info("troop is: " + troop)

											if (customer.unit) {
												if (customer.unit.name == troop) {
													$scope.currentAddresses[len] = customer.address
													len = len + 1
												}
											}

										});
							}
							$scope.showCurrentAdresses = function() {
								$log.info("showing addresses for troop: "
										+ $scope.currentTroop)
								$scope.currentAddresses.forEach(function(
										customer) {
									$log.info("Customer: " + customer);
								});
								$scope.addresses = $scope.currentAddresses
										.join('|').split(' ').join('+')
								$log.info("addresses are:" + $scope.addresses)
							}

							$scope.encodedAddress = "unknown"

							$scope.geocodeString = function(address, city) {
								$log.info("looking up address")
								if (typeof address == 'undefined') {
									$log
											.info("address is undefined, doing nothing")
									return 

									

								}

								if (address == 'undefined') {
									$log.info("address is not processable:"
											+ address)
									return

									

								}
								if (address.trim() == '') {
									$log.info("address is blank")
								}

								$log.info("customer lat")
								$log.info("gecoding raw address" + address
										+ "," + city)
								var humanAddress = address + "," + city + ",CA"
								var url = 'https://maps.googleapis.com/maps/api/geocode/json?address='
										+ humanAddress
										+ '&key='
										+ $scope.googleApiKey
								$log.info("getting address:" + humanAddress
										+ " with url: " + url)

								$http
										.get(url)
										.

										success(
												function(data, status, headers,
														config) {
													$log
															.info('got data: '
																	+ data.results[0].geometry.location.lat
																	+ ","
																	+ data.results[0].geometry.location.lng)

													$scope.newCustomer.coords = [
															data.results[0].geometry.location.lat,
															data.results[0].geometry.location.lng ]
													$scope.newCustomerMapHide = "false"
													return data;
												}).error(
												function(data, status, headers,
														config) {
													// log error
													$log.info('got error')
												});
								$scope.assignUnit();
							}
							$scope.addCustomer = function() {
								if ($scope.newCustomer != '') {
									$log
											.info('Customer pickup date is'
													+ $scope.newCustomer.pickupdate.name)
									var newCust = $scope.newCustomer
									newCust.pickupdate = $scope.newCustomer.pickupdate.name
									//newCust.unit = $scope.newCustomer.unit
									newCust.address = newCust.address + " ,"
											+ newCust.city.name + ", CA"

									$log.info('new date is '
											+ newCust.pickupdate)
									var customer = $scope.customers
											.$add(newCust);
									$log
											.info('saved customer: '
													+ newCust.name)
									$scope.resetNewCustomer();
								}
							}

						} ])

		.controller(
				'LoginCtrl',
				[
						'$scope',
						'simpleLogin',
						'$location',
						function($scope, simpleLogin, $location) {
							$scope.email = null;
							$scope.pass = null;
							$scope.confirm = null;
							$scope.createMode = false;
							var myRef = new Firebase(
									"https://bsatrees.firebaseio.com");
							$scope.authClient = new FirebaseSimpleLogin(
									myRef,
									function(error, user) {
										if (error) {
											// an error occurred while
											// attempting login
											console.log(error);
										} else if (user) {
											// user authenticated with Firebase
											console.log("User ID: " + user.uid
													+ ", Provider: "
													+ user.provider);
										} else {
											console
													.log("user is not logged in")
										}
									});
							$scope.login = function(email, pass) {
								$scope.authClient.login('password', {
									email : email,
									password : pass
								});
								$location.path('/');
								$scope.username = ""
								/*
								 * $scope.err = null; console.log("logging in")
								 * simpleLogin.login(email, pass).then(
								 * function() { $location.path('/'); },
								 * function(err) { $scope.err = errMessage(err);
								 * });
								 */
								$location.path('/');
							};
							$scope.logout = function() {
								$scope.authClient.logout();
								$location.path('/');
							};

							$scope.createAccount = function() {
								$scope.err = null;
								if (assertValidAccountProps()) {
									simpleLogin.createAccount($scope.email,
											$scope.pass).then(
											function(/* user */) {
												$location.path('/account');
											}, function(err) {
												$scope.err = errMessage(err);
											});
								}
							};

							function assertValidAccountProps() {
								if (!$scope.email) {
									$scope.err = 'Please enter an email address';
								} else if (!$scope.pass || !$scope.confirm) {
									$scope.err = 'Please enter a password';
								} else if ($scope.createMode
										&& $scope.pass !== $scope.confirm) {
									$scope.err = 'Passwords do not match';
								}
								return !$scope.err;
							}

							function errMessage(err) {
								return angular.isObject(err) && err.code ? err.code
										: err + '';
							}
						} ])

		.controller(
				'AccountCtrl',
				[
						'$scope',
						'simpleLogin',
						'fbutil',
						'user',
						'$location',
						function($scope, simpleLogin, fbutil, user, $location) {
							// create a 3-way binding with the user profile
							// object in Firebase
							// var authClient = new FirebaseSimpleLogin(myRef,
							// function(error, user) { });
							var myRef = new Firebase(
									"https://bsatrees.firebaseio.com");
							$scope.authClient = new FirebaseSimpleLogin(myRef,
									function(error, user) {
										if (error) {
											// an error occurred while
											// attempting login
											console.log(error);
										} else if (user) {
											// user authenticated with Firebase
											console.log("User ID: " + user.uid
													+ ", Provider: "
													+ user.provider);
										} else {
											// user is logged out
										}
									});

							var profile = fbutil
									.syncObject([ 'users', user.uid ]);
							profile.$bindTo($scope, 'profile');

							// expose logout function to scope
							$scope.logout = function() {
								console.log("logging out")
								profile.$destroy();
								simpleLogin.logout();
								$location.path('/login');
							};

							$scope.changePassword = function(pass, confirm,
									newPass) {
								resetMessages();
								if (!pass || !confirm || !newPass) {
									$scope.err = 'Please fill in all password fields';
								} else if (newPass !== confirm) {
									$scope.err = 'New pass and confirm do not match';
								} else {
									simpleLogin.changePassword(profile.email,
											pass, newPass).then(function() {
										$scope.msg = 'Password changed';
									}, function(err) {
										$scope.err = err;
									})
								}
							};

							$scope.clear = resetMessages;

							$scope.changeEmail = function(pass, newEmail) {
								resetMessages();
								profile.$destroy();
								simpleLogin.changeEmail(pass, newEmail).then(
										function(user) {
											profile = fbutil.syncObject([
													'users', user.uid ]);
											profile.$bindTo($scope, 'profile');
											$scope.emailmsg = 'Email changed';
										}, function(err) {
											$scope.emailerr = err;
										});
							};

							function resetMessages() {
								$scope.err = null;
								$scope.msg = null;
								$scope.emailerr = null;
								$scope.emailmsg = null;
							}
						} ]);