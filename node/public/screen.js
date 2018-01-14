'use strict'

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

var jbApp = angular.module('nwHacks', ['ui.router'])
.config(['$locationProvider', '$stateProvider', '$urlRouterProvider', function($locationProvider, $stateProvider, $urlRouterProvider){
	$locationProvider.html5Mode(true);
	$stateProvider
		.state('screen', {
			url: '/',
			templateUrl: 'views/screen.html'
		})
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