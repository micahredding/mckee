var app = angular.module('mapsApp', ['uiGmapgoogle-maps']);

app.service("PolygonService", function () {
    var polygons = [];
    this.pushPolygon = function(polygon){
        polygons.push(polygon);
    }
    this.getPolygons = function(){
        return polygons;
    }
    this.clearPolygons = function(){
        angular.forEach(polygons, function(polygon){
            polygon.setMap(null);
        });
        polygons = [];
    }
});

app.service("MarkerService", function () {
    var visibleMarkers = true;
    var cities = [
        {
            id : 1,
            city : 'Toronto',
            desc : 'This is the best city in the world!',
            latitude : 43.7000,
            longitude : -79.4000
        },
        {
            id : 2,
            city : 'New York',
            desc : 'This city is aiiiiite!',
            latitude : 40.6700,
            longitude : -73.9400
        },
        {
            id : 3,
            city : 'Chicago',
            desc : 'This is the second best city in the world!',
            latitude : 41.8819,
            longitude : -87.6278
        },
        {
            id : 4,
            city : 'Los Angeles',
            desc : 'This city is live!',
            latitude : 34.0500,
            longitude : -118.2500
        },
        {
            id : 5,
            city : 'Las Vegas',
            desc : 'Sin City...\'nuff said!',
            latitude : 36.0800,
            longitude : -115.1522
        }
    ];
    this.markers = function() {
        return cities;
    }
    this.visible = function() {
        return visibleMarkers;
    }
    this.toggleMarkers = function() {
        visibleMarkers = !visibleMarkers;
    }
    this.hideMarkers = function() {
        visibleMarkers = false;
    }
});

app.controller('mapCtrl', function($scope, MarkerService, PolygonService, uiGmapIsReady) {

    $scope.map = {
        center: { latitude: 45, longitude: -73 },
        zoom: 3,
        options: {
            streetViewControl: false
        }
    };

    $scope.drawingManagerOptions = {
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
    $scope.drawingManagerControl = {};

    uiGmapIsReady.promise(1).then(function(instances) {
        var drawingManager = $scope.drawingManagerControl.getDrawingManager();
        google.maps.event.addListener(drawingManager, 'polygoncomplete', function (polygon) {
            PolygonService.pushPolygon(polygon);
            drawingManager.setDrawingMode(null)
        });
    });

    $scope.$watch(function(){ return PolygonService.getPolygons(); },
        function(newValue, oldValue) {
            if($scope.drawingManagerControl && $scope.drawingManagerControl.getDrawingManager) {
                if(newValue.length < 1) {
                    var drawingManager = $scope.drawingManagerControl.getDrawingManager();
                    drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON)
                }
            }
        }
    );

    $scope.$watch(function() { return MarkerService.visible(); },
        function(newValue, oldValue) {
            if(newValue) {
                $scope.markers = MarkerService.markers();
            } else {
                $scope.markers = [];
            }
        }
    );
});

app.controller('controlMarkers', function ($scope, MarkerService, $rootScope) {
    this.text = 'Toggle Markers';
    $scope.display = true;
    $scope.controlClick = function () {
        return MarkerService.toggleMarkers();
    };
    $rootScope.$on('hideAll', function(event, args) {
        MarkerService.hideMarkers();
        $scope.display = false;
    });
});

app.controller('controlTerritories', function ($scope, MarkerService, PolygonService, $rootScope) {
    this.text = 'Clear Territory';
    $scope.display = true;
    $scope.controlClick = function (event) {
        return PolygonService.clearPolygons();
    };
    $rootScope.$on('hideAll', function(event, args) {
        $scope.display = false;
    });
});

app.controller('userCtrl', function ($scope) {
    this.name = 'John Kelsey';
    this.ar = "AR1212";
});

app.controller('printCtrl', function ($scope, $rootScope) {
    this.text = 'Print!';
    $scope.controlClick = function(event){
        $rootScope.$emit('hideAll');
    };
});
