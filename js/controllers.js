app.controller('mapCtrl', function($scope, MarkerService, DrawingService, uiGmapIsReady) {
    $scope.map = {
        center:  { latitude: 45, longitude: -73 },
        zoom: 3,
        options: { streetViewControl: false }
    };
    $scope.drawingManagerOptions = DrawingService.options;
    $scope.drawingManagerControl = DrawingService.control;

    uiGmapIsReady.promise(1).then(function(instances) {
        myMap = instances[0];
        MarkerService.getMarkers(function(markers, bounds) {
            $scope.markers = markers;
            myMap.map.fitBounds(bounds);
        });
        DrawingService.addListener();
    });
});

app.controller('userCtrl', function ($scope, UserService) {
    UserService.getUser(function(response){
        $scope.name = response.name;
        $scope.ar = response.ar;
    });
    $scope.date = new Date();
});


app.controller('territoryToolCtrl', function ($scope, MarkerService, DrawingService, $rootScope) {
    $scope.text = 'Territory Tool';
    $scope.controlClick = function (event) {
        return DrawingService.setDrawingModePolygon();
    };
    // $scope.$watch(
    //     function(){return DrawingService.getPolygonCount();},
    //     function(newValue, oldValue) {
    //         console.log(newValue);
    //         if(newValue > 0) {
    //             DrawingService.setDrawingModeHand();
    //             $scope.activeClass = null;
    //             $scope.disabledClass = 'disabled';
    //         } else {
    //             $scope.disabledClass = null;
    //         }
    //     }
    // );
    $scope.$watch(
        function(){return DrawingService.getDrawingMode();},
        function(newValue, oldValue) {
            if(newValue == google.maps.drawing.OverlayType.POLYGON) {
                $scope.activeClass = 'active';
            } else {
                $scope.activeClass = null;
            }
        }
    );
});
app.controller('storeToolCtrl', function ($scope, MarkerService, DrawingService, $rootScope) {
    $scope.text = 'Store Tool';
    $scope.controlClick = function (event) {
        return DrawingService.setDrawingModeHand();
    };
    $scope.$watch(
        function(){return DrawingService.getDrawingMode();},
        function(newValue, oldValue) {
            if(newValue) {
                $scope.activeClass = null;
            } else {
                $scope.activeClass = 'active';
            }
        }
    );
});
app.controller('handToolCtrl', function ($scope, MarkerService, DrawingService, $rootScope) {
    $scope.text = 'Hand Tool';
    $scope.controlClick = function (event) {
        return DrawingService.clear();
    };
});


app.controller('territoryCtrl', function ($scope, MarkerService, DrawingService, $rootScope) {
    $scope.text = 'Clear Territory';
    $scope.controlClick = function (event) {
        DrawingService.clear();
        DrawingService.setDrawingModePolygon();
    };
});

app.controller('markerCtrl', function ($scope, MarkerService, $rootScope) {
    $scope.text = 'Hide Markers';
    $scope.controlClick = function() {
        MarkerService.toggleMarkers();
    };
    $scope.$watch(
        function(){return MarkerService.visible();},
        function(newValue, oldValue) {
            if(newValue) {
                $scope.text = 'Hide Markers';
            } else {
                $scope.text = 'Show Markers';
            }
        }
    );
});

app.controller('printCtrl', function ($scope, $rootScope, MarkerService) {
    $scope.text = 'Print!';
    $scope.controlClick = function(event){
        MarkerService.hideMarkers();
        setTimeout(function(){
            window.print();
        }, 1000);
    };
});
