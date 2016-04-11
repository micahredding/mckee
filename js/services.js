app.service("UserService", function($http){
    var user = {};
    this.getUser = function(callback) {
        var url = 'https://gist.githubusercontent.com/micahredding/bbf0326b33962fcbed503535a5e4e476/raw/a1042fe5ab9bb831a08f7599ad5a33626d92ce15/current_user.json';
        $http({
            method: 'GET',
            url: url,
         }).success(function(data){
            user["name"] = data["Name"];
            user["ar"]   = data["DistributorID"];
            callback(user);
        }).error(function(){
            console.log("error");
        });
    }
});

app.service("MarkerService", function ($http) {
    var display = true;
    var bounds = new google.maps.LatLngBounds();
    var internal_stores = [];

    this.visible = function() {
        return display;
    }

    this.update_marker_visibility = function(value) {
        for (var i=0, l=internal_stores.length; i<l; i++){
            internal_stores[i].options.visible = value;
        }
    }

    this.getMarkers = function(callback) {
        var url = 'https://gist.githubusercontent.com/micahredding/7f65f07df3825d5e11504e2da158824f/raw/ecf408b9288caec21fa2c168f5c73a37c6c7fa9d/stores.json';
        $http({
            method: 'GET',
            url: url,
         }).success(function(data){
            $.each(data, function(key, item) {
                internal_stores.push({
                    id:        key,
                    name:      item['NameWithNumber'],
                    latitude:  item['Latitude'],
                    longitude: item['Longitude'],
                    options: {
                        visible: true,
                        labelContent: item['NameWithNumber']
                    }
                });
                var myLatLng = new google.maps.LatLng(item['Latitude'], item['Longitude']);
                bounds.extend(myLatLng);
            });
            callback(internal_stores, bounds);
        }).error(function(){
            console.log("error");
        });
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
    var options = {
        drawingMode: google.maps.drawing.OverlayType.POLYGON,
        drawingControl: false,
        polygonOptions: {
            clickable: false,
            editable: true,
            zIndex: 100
        }
    };
    this.options = options;
    this.control = {};
    this.getDrawingManager = function() {
        if(!this.control.getDrawingManager) {
            return false;
        } else {
            drawingManager = this.control.getDrawingManager();
            return drawingManager;
        }
    }
    this.setDrawingMode = function(mode) {
        options['drawingMode'] = mode;
    }
    this.setDrawingModePolygon = function() {
        this.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
    }
    this.setDrawingModeHand = function() {
        this.setDrawingMode(null);
    }
    this.getDrawingMode = function(){
        return options['drawingMode'];
    }
    this.getPolygonCount = function(){
        return polygons.length;
    }
    this.clear = function (){
        if(!this.getDrawingManager()) {return;}
        angular.forEach(polygons, function(polygon){
            polygon.setMap(null);
        });
        polygons = [];
    };
    this.addListener = function() {
        if(!this.getDrawingManager()) {return;}
        google.maps.event.addListener(drawingManager, 'polygoncomplete', function (polygon) {
            polygons.push(polygon);
            this.setDrawingMode(null);
        });
    };
});
