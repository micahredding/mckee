var app = angular.module('mapsApp', ['uiGmapgoogle-maps']);

app.service("APIService", function(){
    this.current_user = function() {
        return current_user;
    }
});

app.service("MarkerService", function (APIService) {
    var display = true;
    var bounds = new google.maps.LatLngBounds();
    var internal_stores = [];

    this.stores_into_markers = function(data) {
        $.each(data, function(key, item) {
            internal_stores.push({
                id:        key,
                name:      item['NameWithNumber'],
                latitude:  item['Latitude'],
                longitude: item['Longitude'],
                options: {
                    visible: true,
                }
            });
        });
    }
    this.update_marker_visibility = function(value) {
        for (var i=0, l=internal_stores.length; i<l; i++){
            internal_stores[i].options.visible = value;
        }
    }

    this.markers = function() {
        if(!$.isEmptyObject(internal_stores)){
            return internal_stores;
        }
        this.stores_into_markers(current_stores);
        return internal_stores;
        // var url = 'https://gist.githubusercontent.com/micahredding/7f65f07df3825d5e11504e2da158824f/raw/ecf408b9288caec21fa2c168f5c73a37c6c7fa9d/stores.json';
        // $.getJSON(url, function(data){
        //     this.stores_into_markers(data);
        // }).done(function(){
        //     console.log( "second success" );
        //     console.log(internal_stores);
        //     return internal_stores;
        // }).fail(function() {
        //     console.log( "error" );
        //     return [];
        // });
    }
    this.visibleBounds = function() {
        angular.forEach(this.markers(), function(value, key){
            var myLatLng = new google.maps.LatLng(value.latitude, value.longitude);
            bounds.extend(myLatLng);
        });
        return bounds;
    }
    this.toggleMarkers = function() {
        display = !display;
        this.update_marker_visibility(display);
    }
    this.hideMarkers = function() {
        display = false;
        this.update_marker_visibility(display);
    }
    this.showMarkers = function() {
        display = true;
        this.update_marker_visibility(display);
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
    $scope.markers               = MarkerService.markers();
    uiGmapIsReady.promise(1).then(function(instances) {
        instances[0].map.fitBounds(MarkerService.visibleBounds());
        DrawingService.addListener();
    });
});

app.controller('userCtrl', function ($scope, APIService) {
    var user = APIService.current_user();
    this.name = user.name;
    this.ar = user.ar;
    $scope.date = new Date();
});

app.controller('territoryCtrl', function ($scope, MarkerService, DrawingService, $rootScope) {
    this.text = 'Clear Territory';
    $scope.display = true;
    $scope.controlClick = function (event) {
        return DrawingService.clear();
    };
});

app.controller('markerCtrl', function ($scope, MarkerService, $rootScope) {
    this.text = 'Toggle Markers';
    $scope.display = true;
    $scope.controlClick = function () {
        return MarkerService.toggleMarkers();
    };
});

app.controller('printCtrl', function ($scope, $rootScope, MarkerService) {
    this.text = 'Print!';
    $scope.controlClick = function(event){
        MarkerService.hideMarkers()
        setTimeout(function(){
            window.print();
        }, 1000);
    };
});
