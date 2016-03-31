var app = angular.module('mapsApp', ['uiGmapgoogle-maps']);

app.service("APIService", function(){
    this.stores = function() {
        return current_stores;
    }
    this.current_user = function() {
        return current_user;
    }
});

app.service("MarkerService", function (APIService) {
    var display = true;
    var stores = APIService.stores();
    this.visible = function() {
        return display;
    }
    this.visibleMarkers = function() {
        if(display) {
            return stores;
        } else {
            return [];
        }
    }
    this.toggleMarkers = function() {
        display = !display;
    }
    this.hideMarkers = function() {
        display = false;
    }
    this.showMarkers = function() {
        display = true;
    }
});

app.service("DrawingService", function () {
    var polygons = [];
    var drawingManager = null;
    this.options = {
        drawingMode: google.maps.drawing.OverlayType.POLYGON,
        drawingControl: false,
        drawingControlOptions: {
          position: google.maps.ControlPosition.TOP_CENTER,
            drawingModes: [
              google.maps.drawing.OverlayType.POLYGON
            ]
        },
        polygonOptions: {
            clickable: false,
            editable: true,
            zIndex: 1
        }
    };
    this.control = {};
    this.getDrawingManager = function() {
        if(!this.control.getDrawingManager) {
            return false;
        } else {
            drawingManager = this.control.getDrawingManager();
            return drawingManager;
        }
    }
    this.addListener = function() {
        if(!this.getDrawingManager()) {return;}
        google.maps.event.addListener(drawingManager, 'polygoncomplete', function (polygon) {
            polygons.push(polygon);
            drawingManager.setDrawingMode(null)
        });
    };
    this.clear = function (){
        if(!this.getDrawingManager()) {return;}
        angular.forEach(polygons, function(polygon){
            polygon.setMap(null);
        });
        polygons = [];
        drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
    };
});

app.controller('mapCtrl', function($scope, MarkerService, DrawingService, uiGmapIsReady) {
    $scope.map = {
        center: { latitude: 45, longitude: -73 },
        zoom: 3,
        options: {
            streetViewControl: false
        }
    };

    $scope.drawingManagerOptions = DrawingService.options;
    $scope.drawingManagerControl = DrawingService.control;

    uiGmapIsReady.promise(1).then(function(instances) {
        DrawingService.addListener();
    });

    $scope.$watch(function() { return MarkerService.visible(); },
        function(newValue, oldValue) {
            $scope.markers = MarkerService.visibleMarkers();
        }
    );
});

app.controller('markerCtrl', function ($scope, MarkerService, $rootScope) {
    this.text = 'Toggle Markers';
    $scope.display = true;
    $scope.controlClick = function () {
        return MarkerService.toggleMarkers();
    };
    $rootScope.$on('hideAll', function(event, args) {
        MarkerService.hideMarkers();
        $scope.display = false;
    });
    $rootScope.$on('showAll', function(event, args) {
        MarkerService.showMarkers();
        $scope.display = true;
    });
});

app.controller('territoryCtrl', function ($scope, MarkerService, DrawingService, $rootScope) {
    this.text = 'Clear Territory';
    $scope.display = true;
    $scope.controlClick = function (event) {
        return DrawingService.clear();
    };
    // $rootScope.$on('hideAll', function(event, args) {
    //     $scope.display = false;
    // });
    // $rootScope.$on('showAll', function(event, args) {
    //     $scope.display = true;
    // });
});

app.controller('userCtrl', function ($scope, APIService) {
    var user = APIService.current_user();
    this.name = user.name;
    this.ar = user.ar;
    $scope.date = new Date();
});

app.controller('printCtrl', function ($scope, $rootScope) {
    this.text = 'Print!';
    // $scope.controlClick = function(event){
    //     $rootScope.$emit('hideAll');
    // };
});
