'use strict'

function isMobile(){
	var check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
}
function toRadians(degree){
	return degree * Math.PI/180;
}
function defer(){
	var deferred = {
		promise: null,
		resolve: null,
		reject: null
	};
	deferred.promise = new Promise(function(resolve, reject){
		deferred.resolve = resolve;
		deferred.reject = reject;
	});
	return deferred;
}
/* EasyWebSocket */
function EasyWebSocket(endpoint, options){
	this.endpoint = endpoint;
	this.ws = undefined;
	this.$ready = null;

	this.event_handlers = {};

	this.connect();
}
EasyWebSocket.prototype.connect = function(){
	var self = this;
	var deferred = defer();
	self.$ready = deferred.promise;
	
	/* Initialize Websocket */
	self.ws = new WebSocket(self.endpoint);
	
	self.ws.onopen = function(){
		console.log("WebSocket to "+self.endpoint+" opened");
		deferred.resolve(true);
		if ('open' in self.event_handlers){
			self.event_handlers['open'].map(function(callback){
				callback();
			});
		}
	}
	self.ws.onclose = function(){
		console.log("WebSocket to "+self.endpoint+" closed");
		deferred.reject(false);
		if ('close' in self.event_handlers){
			self.event_handlers['close'].map(function(callback){
				callback();
			});
		}
		if (!self.noRetryOnClose){
			setTimeout(function(){
				self.connect();
			}, 5000);
		}
	};
	self.ws.onerror = function(){
		console.log("ERROR on WebSocket to "+self.endpoint+", retrying in 5 seconds");
		if ('error' in self.event_handlers){
			self.event_handlers['error'].map(function(callback){
				callback();
			});
		}
	};
	self.ws.onmessage = function(event){
		var data = JSON.parse(event.data);
		if ('message' in self.event_handlers){
			self.event_handlers['message'].map(function(callback){
				callback(data);
			});
		}
	};
	return deferred.promise;
}
EasyWebSocket.prototype.on = function(eventName, handler){
	if (!this.event_handlers[eventName]) this.event_handlers[eventName] = [];
	this.event_handlers[eventName].push(handler);
}
EasyWebSocket.prototype.send = function(data){
	this.ws.send(JSON.stringify(data));
}
EasyWebSocket.prototype.close = function(){
	this.ws.close();
}

var jbApp = angular.module('nwHacks', ['ui.router']);
jbApp.constant('Config', {
	aws: 'https://3v5mhdfdne.execute-api.us-west-2.amazonaws.com/prod',
	leapMotion: { 
					// host: 'localhost',
					host: '206.87.146.117',
					port: 6437
				}
})
.config(['$locationProvider', '$stateProvider', '$urlRouterProvider', function($locationProvider, $stateProvider, $urlRouterProvider){
	$locationProvider.html5Mode(true);
	$stateProvider
		// .state('init', {
		// 	url: '',
		// 	abstract: true,
		// 	controller: ['$scope', function($scope){
		// 		var self = this;
		// 		self.today = new Date();
		// 	}],
		// 	controllerAs: '$global',
		// 	templateUrl: 'views/init.html',
		// })
		// .state('main', {
		// 	parent: 'init',
		// 	url: '/',
		// 	controller: ['$scope', function($scope){
				
		// 	}],
		// 	controllerAs: '$view',
		// 	templateUrl: 'views/main.html'
		// })
		.state('vr', {
			// parent: 'init',
			url: '/',
			controller: ['$scope', function($scope){
			}],
			controllerAs: '$view',
			templateUrl: 'views/vr.html'
		})
		// .state('screen', {
		// 	url: '/screen',
		// 	templateUrl: 'views/screen.html'
		// })
		
	$urlRouterProvider.otherwise('/');
}])
.directive('vrScreenShare', function(){
	return {
		restrict: 'E',
		scope: {
		},
		template: '<img ng-src="{{frame}}"/>',
		link: function(scope, element, attrs){
			scope.frame = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
			var socket = new EasyWebSocket('ws://'+window.location.hostname+':'+window.location.port+'/ws');
			socket.on('message', function(msg){
				if (msg.action === 'newFrame'){
					scope.frame = msg.frame;
					scope.$apply();
				}
			})
		}
	}
})
// .directive('vrViewport', ['$timeout', 'LeapService', function($timeout, LeapService){
.directive('vrViewport', ['$timeout', '$interval', '$http', 'AwsIotService', 'Config', function($timeout, $interval, $http, AwsIotService, Config){
	return {
		restrict: 'E',
		controller: function($scope, $element, $window){
			// Screen sharing
			var socket = new EasyWebSocket('ws://'+window.location.hostname+':'+window.location.port+'/ws');
			socket.on('open', function(){
				socket.send({ action: 'setKind', kind: 'streamer' });
			});

			var ledStatus = '0';
			// var ledHold = false;
			function toggleLed(){
				// if (!ledHold){
				// 	ledHold = true;
					$http.put(Config.aws+'/setstatus/led', { 'status': ((ledStatus === '0') ? '1': '0') })
						.then(function(result){
							console.log(result);
							ledStatus = ((ledStatus === '0') ? '1': '0');
						}, function(err){
							console.log(err);
						});
					// $timeout(function(){
					// 	ledHold = false;
					// }, 1000);
				// }
				// var xhttp = new XMLHttpRequest();
				// 	xhttp.open("PUT", endpoint + "/setstatus/led");

				// 	xhttp.onload = function(e) {
				// 		console.log(xhttp.response);
				// 	}

					// var newStatus = ledStatus == "1" ? "0" : "1";

					// // Record time published to calculate delay later
					// ledPublishTime = Date.now();
				// xhttp.send(JSON.stringify({ "status": '1' }));
			}

			var self = this;
				var $device = {
					width: window.innerWidth,
					height: window.innerHeight
				};
				var divViewport = $('.viewport', $element)[0];
			
				var mouseX = 0, mouseY = 0;

				var renderer = undefined;
				var scene = undefined;
				
				var light = undefined;
				var ambientLight = undefined;
				// self.axis = undefined;
				
				var head = undefined;
				var leftEye = undefined;
				var rightEye = undefined;
				var head_directionY = 1;
				
				var gyro = { alpha: 0, beta: 0, gamma: 0};
				var gyro_offset = { alpha: 0, beta: 0, gamma: -90 };

				/* LeapMotion*/
				var leapController = new Leap.Controller(Config.leapMotion);
				// var leapFingerPosition = undefined;
				// self.leapControls = undefined;
				var lastCanvasFrame = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
				
// var imageLoader = new THREE.ImageLoader();
				var tLoader = new THREE.TextureLoader();
				var fLoader = new THREE.FontLoader();
				var font = undefined;
				
// console.log(divViewport);
				var world = { };
				var img = new THREE.MeshBasicMaterial({ // CHANGED to
														// MeshBasicMaterial
			        map : tLoader.load('https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Official_Portrait_of_President_Donald_Trump.jpg/473px-Official_Portrait_of_President_Donald_Trump.jpg')
			    });
			    img.map.needsUpdate = true; // ADDED
		    // photo
			    world.photo = new THREE.Mesh(new THREE.PlaneGeometry(960, 720), img);
			    world.photo.overdraw = true;
			    var textMesh = undefined;
			
			self.displayText = function(text){
				$("#hud_text").text(text);
			}
				
			self.goFullScreen = function(){
				// alert("Going fullscreen");
				if (divViewport.requestFullscreen) {
					divViewport.requestFullscreen();
				} else if (divViewport.msRequestFullscreen) {
					divViewport.msRequestFullscreen();
				} else if (divViewport.mozRequestFullScreen) {
					divViewport.mozRequestFullScreen();
				} else if (divViewport.webkitRequestFullscreen) {
					divViewport.webkitRequestFullscreen();
				}
				screen.orientation.lock('landscape-primary');
			}
			
			function onDocumentMouseMove( event ) {

				mouseX = ( event.clientX - $device.width / 2 );
				mouseY = ( event.clientY - $device.height / 2 );

			}

			self.createObject = function(){
				var radius = 80;
				var faceIndices = [ 'a', 'b', 'c' ];
				var geometry  = new THREE.IcosahedronGeometry( radius, 1 );
				// for ( var i = 0; i < geometry.faces.length; i ++ ) {
				// 	var f  = geometry.faces[ i ];
				// 	for( var j = 0; j < 3; j++ ) {
				// 		var vertexIndex = f[ faceIndices[ j ] ];
				// 		var p = geometry.vertices[ vertexIndex ];
				// 		var color = new THREE.Color( 0xffff00 );
				// 		// color.setHSL( ( p.y / radius + 1 ) / 2, 1.0, 0.5 );
				// 		f.vertexColors[ j ] = color;
				// 	}
				// }
				var materials = [
					new THREE.MeshPhongMaterial( { color: 0xffffff, flatShading: true, vertexColors: THREE.VertexColors, shininess: 0 } ),
					new THREE.MeshBasicMaterial( { color: 0x000000, flatShading: true, wireframe: true, transparent: true } )
				];
				var obj = THREE.SceneUtils.createMultiMaterialObject( geometry, materials );
					obj.position.x = 600;
					obj.position.y = 0;
					obj.position.z = 600;
					obj.castShadow = true;
					obj.receiveShadow = false;
				return obj;
			}
			world['ball'] = self.createObject();
			
			var init = function init() {
				// place head
				head = new THREE.Object3D();
				head.position.set(0, 0, 0);
				head.up.set(0, 1, 0);
				head.rotation.order = 'YZX';

				// place left eye in head
				leftEye = new THREE.PerspectiveCamera( 60, $device.width / $device.height, 1, 10000 );
				leftEye.position.set(-10, 0, -1);
				leftEye.up.set(0, 1, 0);
				head.add( leftEye );
				
				// place right eye in head
				rightEye = new THREE.PerspectiveCamera( 60, $device.width / $device.height, 1, 10000 );
				rightEye.position.set(10, 0, -1);
				rightEye.up.set(0, 1, 0);
				head.add( rightEye );

				// Add LeapMotion Controls
				// self.leapControls = new THREE.TrackballControls(rightEye);

				// init scene
				scene = new THREE.Scene();

				// place axisHelper
				// self.axis = new THREE.AxisHelper(40);
				// scene.add( self.axis );
				
				// add head
				scene.add( head );
				
				// init ambient light
				ambientLight = new THREE.AmbientLight( 0x808080 );
				scene.add( ambientLight );

				// init main light
				light = new THREE.DirectionalLight( 0xffffff );
				light.position.set( 0, 2000, 0 );
				light.castShadow = true;	
				// light.shadowDarkness = 0.8;
				scene.add( light );
				
				// objects in the world
				var room_geom = new THREE.BoxGeometry( 5000, 5000, 5000, 8, 8, 8 );
				var room_mats = [
				                 new THREE.MeshLambertMaterial( { color: 0xcccccc, flatShading: true, overdraw: 0.2, side: THREE.DoubleSide } ),
				                 new THREE.MeshLambertMaterial( { color: 0x333333, flatShading: true, overdraw: 0.2, side: THREE.DoubleSide } )
				                 ];
				// var room_mat = new THREE.MeshLambertMaterial( { color:
				// 0xcccccc, shading: THREE.FlatShading, overdraw: 0.2 } );
					// room_mat.side = THREE.BackSide;
				var tc = room_geom.faces.length / 2;
				console.log(tc);
				for (var t = 0; t < tc; t++){
					room_geom.faces[t*2].materialIndex = ((t + Math.floor(t/8)) % 2);
					room_geom.faces[t*2+1].materialIndex = ((t + Math.floor(t/8)) % 2);
				}
				
				var room = new THREE.Mesh( room_geom, room_mats );
				room.position.set(0, 0, 0);
				room.receiveShadow = true;
				scene.add(room);
				
				// // place photo
			 //    scene.add(world.photo);
			 //    world.photo.position.set( 0, 0, -1000 );
			 //    world.photo.rotateX( 0 );
			 //    world.photo.rotateY( 0 );
			 //    world.photo.rotateZ( 0 );
				
// imageLoader.load(
// 'http://colorvisiontesting.com/images/plate%20with%205.jpg',
// function ( image ) {
// // like drawing a part of it on a canvas
// var canvas = document.createElement( 'canvas' );
// var context = canvas.getContext( '2d' );
// context.drawImage( image, 100, 100 );
// },
// function ( xhr ) {
// console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
// },
// function ( xhr ) { console.log( 'An error happened' ); }
// );
				// end world objects
				
				// init renderer and add to DOM
				// renderer = new THREE.WebGLRenderer( { antialias: true, preserveDrawingBuffer: true } );
				renderer = new THREE.WebGLRenderer( { antialias: true } );
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( $device.width, $device.height );
				renderer.shadowMap.enabled = true;
				renderer.shadowMap.type = THREE.PCFSoftShadowMap;
				$(divViewport).append( renderer.domElement );
				
				// add event listeners
				if (isMobile()){
					if (window.DeviceOrientationEvent){
						// alert("Has DeviceOrientationEvent");
						window.addEventListener("deviceorientation", function(e){
// alert(e.alpha);
							var str = "DeviceOrientationEvent : "+Math.round(e.alpha * 10) / 10+", "+Math.round(e.beta * 10) / 10+", "+Math.round(e.gamma * 10) / 10;
					        self.displayText(str);
					        gyro.alpha = e.alpha;
					        gyro.beta = e.beta;
					        gyro.gamma = e.gamma;
						}, false);
					}
					else if (window.DeviceMotionEvent){
						alert("Has DeviceMotionEvent");
					}
					else {
						alert("Might have MozOrientation");
					}
					
// if (window.DeviceOrientationEvent) {
// window.addEventListener("deviceorientation", function (e) {
// var str = "DeviceOrientationEvent : "+Math.round(e.alpha * 10) / 10+",
// "+Math.round(e.beta * 10) / 10+", "+Math.round(e.gamma * 10) / 10;
// displayText(str);
// gyro.alpha = e.alpha;
// gyro.beta = e.beta;
// gyro.gamma = e.gamma;
// }, false);
// } else if (window.DeviceMotionEvent) {
// window.addEventListener('devicemotion', function (e) {
// var str = "DeviceMotionEvent : "+Math.round(e.acceleration.x, 1)+",
// "+Math.round(e.acceleration.y, 1);
// displayText(str);
// }, false);
// } else {
// window.addEventListener("MozOrientation", function (e) {
// var str = "MozOrientationEvent : "+Math.round(e.orientation.x, 1)+",
// "+Math.round(e.orientation.y, 1);
// displayText(str);
// }, false);
// }
					
				}
				else {
					document.addEventListener( 'mousemove', onDocumentMouseMove, false );	
				}
				
				self.updateSize();
			};
			// end of init
			
			self.addObject = function(object, position, rotation){
				// place photo
			    scene.add(object);
			    if (position){
			    	object.position.set( position[0], position[1], position[2] );	
			    }
			    if (rotation){
				    object.rotateX( rotation[0] );
				    object.rotateY( rotation[1] );
				    object.rotateZ( rotation[2] );	
			    }
			};
			var textMaterial = new THREE.MeshPhongMaterial( { color: 0xff0000, shading: THREE.FlatShading, vertexColors: THREE.VertexColors, shininess: 0 } );
			self.addText = function(text, position, rotation){
				var textGeom = new THREE.TextGeometry(text, {
						font: font,
						size: 30,
						height: 5 });
					textGeom.computeBoundingBox();
				var dw = (textGeom.boundingBox.max.x - textGeom.boundingBox.min.x) / 2;
				textMesh = new THREE.Mesh(textGeom, textMaterial);
				textMesh.position.x = -150;
				textMesh.position.y = -100;
				textMesh.position.z = -450;
					// textMesh.position.x = pos.x - dw * Math.cos(toRadians(45 * (k % 8)));
					// textMesh.position.y = pos.y + 300;
					// textMesh.position.z = pos.z - dw * Math.sin(toRadians(45 * (k % 8)));
					// textMesh.rotation.y = -toRadians(45 * (k % 8));
					scene.add(textMesh);
					console.log("Added TEXT");
					textMesh.visible = false;
			}

			self.updateSize = function() {

				if ( $device.width != window.innerWidth || $device.height != window.innerHeight ) {
					$device.width  = window.innerWidth;
					$device.height = window.innerHeight;

					renderer.setSize ( $device.width, $device.height );

				}

			}
			
			self.applyControls = function(){
				if (isMobile()){
					head.rotation.x = Math.round( toRadians(gyro.gamma - gyro_offset.gamma) * 1000 ) / -1000;
					head.rotation.y = Math.round( toRadians(gyro.alpha - gyro_offset.alpha) * 1000 ) / 1000;
					head.rotation.z = Math.round( toRadians(gyro.beta - gyro_offset.beta) * 1000 ) / -1000;
				}
				else {
					var qt = new THREE.Quaternion().setFromAxisAngle( new THREE.Vector3(0,1,0), mouseX * -0.0001 );
					// head.rotation = new THREE.Euler().setFromQuaternion(qt);
					head.quaternion.premultiply( qt );
					// head.rotateOnAxis( new THREE.Vector3(0,1,0), mouseX *
					// -0.0001 );
					head.rotateX( mouseY * -0.0001 );
				}
			}
			var fCount = 0;
			var animate = function animate() {

				render();
				if (fCount % 20 === 0){
					lastCanvasFrame = renderer.domElement.toDataURL('image/webp', 0.5);
					fCount = 0;
					// renderer.domElement.toBlob(function(blob){
					// 	lastCanvasFrame = blob;
					// }, 'image/webp', 0.5);
				}
				fCount ++;
				requestAnimationFrame( animate );
			}

			var render = function render() {

				self.updateSize();
				self.applyControls();
				
				// move head up and down
// if (Math.abs(head.position.y) >= 1500) head_directionY *= -1;
// head.position.y += 2 * head_directionY;
// world.photo.rotateZ(0.01);
				
				$('#head_rotation').text("Head Rotation = ("+Math.round(head.rotation.x * 1000) / 1000+", "+Math.round( head.rotation.y * 1000) / 1000+", "+Math.round( head.rotation.z * 1000) / 1000+")");
				$('#mouse_xy').text("Mouse Coordinates = ("+mouseX+", "+mouseY+")");
				
				$('#left_eye').text("Left Eye: position = ("+Math.round(leftEye.position.x *1000)/1000+", "+Math.round(leftEye.position.y *1000)/1000+", "+Math.round(leftEye.position.z *1000)/1000+")   rotation = ("+Math.round(leftEye.rotation.x *1000)/1000+", "+Math.round(leftEye.rotation.y *1000)/1000+", "+Math.round(leftEye.rotation.z *1000)/1000+")");
				$('#right_eye').text("Right Eye: position = ("+Math.round(rightEye.position.x *1000)/1000+", "+Math.round(rightEye.position.y *1000)/1000+", "+Math.round(rightEye.position.z *1000)/1000+")   rotation = ("+Math.round(rightEye.rotation.x *1000)/1000+", "+Math.round(rightEye.rotation.y *1000)/1000+", "+Math.round(rightEye.rotation.z *1000)/1000+")");
				
				renderer.setViewport(0.0, 0.0, $device.width / 2, $device.height);
				renderer.setScissor(0.0, 0.0, $device.width / 2, $device.height);
				renderer.setScissorTest( true );
				renderer.setClearColor( new THREE.Color().setRGB( 0.5, 0.5, 0.5 ) );
				
				leftEye.aspect = ($device.width / 2) / $device.height;
				leftEye.updateProjectionMatrix();
				
				renderer.render( scene, leftEye );
				
				renderer.setViewport($device.width / 2, 0.0, $device.width / 2, $device.height);
				renderer.setScissor($device.width / 2, 0.0, $device.width / 2, $device.height);
				renderer.setScissorTest( true );
				renderer.setClearColor( new THREE.Color().setRGB( 0.5, 0.5, 0.5 ) );
				
				rightEye.aspect = ($device.width / 2) / $device.height;
				rightEye.updateProjectionMatrix();
				
				renderer.render( scene, rightEye );

			}
			
			// initialize
			init();
			animate();
			self.addObject(world.ball, [0, -400, -400]);
			fLoader.load( 'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (response) {
				font = response;
				self.addText("Motion Detected");
			});

			/* Leap Motion Code */
			leapController
				.use('handHold')
				.use('transform', {
					vr: true,
				    position: new THREE.Vector3(0, 0, 0),
				    scale: 1000,
				    effectiveParent: rightEye
				  })
				.use('handEntry')
				.use('screenPosition')
				.use('riggedHand', {
			    parent: scene,
			    renderer: renderer,
			    // scale: 1000,
			    positionScale: 1.2,
			    // scale: getParam('scale'),
			    // positionScale: getParam('positionScale'),
			    // helper: true,
			    // offset: new THREE.Vector3(0, 0, 0),
			    renderFn: function() {
			      // renderer.render(scene, camera);
			      // renderer.render(scene, rightEye);
			      // render();
			      // return self.leapControls.update();
			      return null;
			    },
			    // materialOptions: {
			    //   wireframe: getParam('wireframe')
			    // },
			    // dotsMode: getParam('dots'),
			    // stats: stats,
			    // camera: camera,
			    camera: rightEye,
			    boneLabels: function(boneMesh, leapHand) {
			      if (boneMesh.name.indexOf('Finger_03') === 0) {
			        return leapHand.pinchStrength;
			      }
			    },
			    boneColors: function(boneMesh, leapHand) {
			      if ((boneMesh.name.indexOf('Finger_0') === 0) || (boneMesh.name.indexOf('Finger_1') === 0)) {
			        return {
			          hue: 0.6,
			          saturation: leapHand.pinchStrength
			        };
			      }
			    },
			    // checkWebGL: true
			  }).connect();

			// var collisionEntered = false;
			var collisionEntered = {
				left: false,
				right: false
			};
			leapController.on('frame', function(frame){
				// console.log(frame.hands);
				if (frame.hands.length > 0){
					for (var i=0; i < frame.hands.length; i++){
						// var handMesh = hand.data('riggedHand.mesh');
						var leapFingerPosition = frame.hands[i].indexFinger.tipPosition;
						// console.log(fingerPos);
						/* Collision Detection */
						var distance = Math.sqrt(Math.pow(leapFingerPosition[0], 2)+Math.pow(leapFingerPosition[1]+400, 2)+Math.pow(leapFingerPosition[2]+400, 2));
						// console.log(distance, leapFingerPosition);
						if (distance < 150){
							console.log("Collision detected");
							if (!collisionEntered[frame.hands[i].type]) collisionEntered[frame.hands[i].type] = true;
						}
						else {
							if (collisionEntered[frame.hands[i].type]){
								console.log("button pressed");
								toggleLed();
								collisionEntered[frame.hands[i].type] = false;
							}

						}

					}
				}

				// var hand = frame.hands[0];
				// if (hand){
				// 	var handMesh = hand.data('riggedHand.mesh');
				// 	leapFingerPosition = hand.indexFinger.tipPosition;
				// 	// leapFingerPosition = handMesh.scenePosition(hand.indexFinger.tipPosition, world.ball.position);
				// 	// console.log(fingerPos);

				// 	/* Collision Detection */
				// 	var distance = Math.sqrt(Math.pow(leapFingerPosition[0], 2)+Math.pow(leapFingerPosition[1]+400, 2)+Math.pow(leapFingerPosition[2]+400, 2));
				// 	// console.log(distance, leapFingerPosition);
				// 	if (distance < 150){
				// 		console.log("Collision detected");
				// 		if (!collisionEntered) collisionEntered = true;
				// 	}
				// 	else {
				// 		if (collisionEntered){
				// 			console.log("button pressed");
				// 			toggleLed();
				// 			collisionEntered = false;
				// 		}

				// 	}
				// }
			})

			AwsIotService.onEvent('LedChange', function(payload){
				ledStatus = payload.status;
				if (ledStatus === '0'){
					// console.log(world.ball);
					world.ball.children[0].material.color.setHex('0x404040');
					world.ball.children[1].material.color.setHex('0x404040');
					// world.ball.geometry.material.color.setHex('0x000000');
					ledStatus = '1';
				}
				else {
					world.ball.children[0].material.color.setHex('0xffff00');
					world.ball.children[1].material.color.setHex('0xffff00');
					// world.ball.geometry.material.color.setHex('0xffff00');
					ledStatus = '0';
				}
			});
			AwsIotService.onEvent('NewImage', function(payload){
				// console.log(img.map.image.src);
				img.map.image.src = 'data:image/png;base64,'+payload.image;
			});
			AwsIotService.onEvent('MotionDetected', function(payload){
				// console.log('motion detected', payload);
				if (payload.status === '1'){
					textMesh.visible = true;	
				}
				else {
					textMesh.visible = false;
				}
				
			})

			//   var riggedHand = leapController.plugins.riggedHand;
			//     leapController.use('boneHand', {
			//       renderer: riggedHand.renderer,
			//       scene: riggedHand.parent,
			//       camera: riggedHand.camera,
			//       render: function() {}
			//     });
			/* End Leap Motion Code */

			$timeout(function(){
				self.addObject(world.photo, [0, 0, -1000], [0, 0, 0]);
				// toggleLed();
			}, 5000);

			$interval(function(){
				// var imageData = renderer.domElement.toDataURL('image/png');
				socket.send({ action: 'newFrame', frame: lastCanvasFrame });
				// console.log(imageData);
			}, 500);

			// LeapService.onData(function(obj){
			// 	$('#leap_data').text("Leap Motion = "+JSON.stringify(obj.hands));
			// });
			
		},
		controllerAs: '$jb',
		templateUrl: 'directives/vr-viewport.html',
		link: function(scope, element, attrs, ctrl){
			
		}
	}
}])
.factory('AwsIotService', function(){
	var handlers = {};

	var mqttClientConnectHandler = function() {
		console.log('connect');
		mqttClient.subscribe("sensor/camera/image");
		mqttClient.subscribe("sensor/led/payload");
		mqttClient.subscribe("sensor/motion/payload");
		// mqttClient.subscribe("sensor/light/payload");
	};

	var mqttClientMessageHandler = function(topic, payload) {
		var message = 'message: ' + topic + ':' + payload.toString();
		// console.log(message);
		var payloadObj = JSON.parse(payload);
		// console.log(payloadObj)

		// If new camera image, display it
		if (topic == "sensor/camera/image") {
			if ('NewImage' in handlers){
				handlers['NewImage'].map(function(callback){
					callback(payloadObj);
				})
			}
		}
		// If sensor status changes, add to graph, and update current status
		else if (topic == "sensor/led/payload") {
			if ('LedChange' in handlers){
				handlers['LedChange'].map(function(callback){
					callback(payloadObj);
				})
			}
		}
		else if (topic == "sensor/motion/payload") {
			if ('MotionDetected' in handlers){
				handlers['MotionDetected'].map(function(callback){
					callback(payloadObj);
				})
			}
		}
	};
	mqttClient.on('connect', mqttClientConnectHandler);
	mqttClient.on('message', mqttClientMessageHandler);
	
	return {
		onEvent: function(event, callback){
			if (!(handlers[event])){
				handlers[event] = [];
			}
			handlers[event].push(callback);
		}
	}
})
.factory('LeapService', function(){
	var onDataListeners = [];
	// Create and open the socket
	var  ws = new WebSocket("ws://localhost:6437/v6.json");//use latest

	  // On successful connection
	  ws.onopen = function(event) {
	    var enableMessage = JSON.stringify({enableGestures: true});
	    ws.send(enableMessage); // Enable gestures
	    ws.send(JSON.stringify({focused: true})); // claim focus
	    
	    // focusListener = window.addEventListener('focus', function(e) {
	    //     ws.send(JSON.stringify({focused: true})); // claim focus
	    //  });

	    // blurListener = window.addEventListener('blur', function(e) {
	    //      ws.send(JSON.stringify({focused: false})); // relinquish focus
	    //  });
	     
	    // document.getElementById("main").style.visibility = "visible";
	    // document.getElementById("connection").innerHTML = "WebSocket connection open!";
	  };

	  // On message received
	  ws.onmessage = function(event) {
	    // if (!paused) {
	      var obj = JSON.parse(event.data);
	      var str = JSON.stringify(obj, undefined, 2);
	      if(!obj.id){
	          // document.getElementById("eventoutput").innerHTML = '<pre>' + str + '</pre>';
	          console.log(str);
	      } else {
	          // document.getElementById("frameoutput").innerHTML = '<pre>' + str + '</pre>';
	      }
	      onDataListeners.map(function(callback){
	      	callback(obj);
	      })
	      // if (pauseOnGesture && obj.gestures.length > 0) {
	      //   togglePause();
	      // }
	    // }
	  };

	  // On socket close
	  ws.onclose = function(event) {
	    ws = null;
	    // window.removeListener("focus", focusListener);
	    // window.removeListener("blur", blurListener);
	    // document.getElementById("main").style.visibility = "hidden";
	    // document.getElementById("connection").innerHTML = "WebSocket connection closed";
	  }

	  // On socket error
	  ws.onerror = function(event) {
	    alert("Received error");
	  };

	return {
		onData: function(callback){
			onDataListeners.push(callback);
		}
	}
})