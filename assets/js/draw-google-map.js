/**
 * Small custom google maps library functions
 * @author dimabresky
 */

(function (window, gm) {

    'use strict'

    if (typeof window.GoogleMapDataContainer === 'undefined' && typeof gm !== 'undefined') {

        window.GoogleMapDataContainer = {

            // markers options
            _markersOptions: [],

            // need reinitialize markers
            reinitMarkers: false,

            // initialized markers
            _markers: [],

            // google map object
            _map: null,
            
            // default market icon
            _icon: null

        };
        
        // set default marker icon
        window.GoogleMapDataContainer.setIcon = function (icon) {
            window.GoogleMapDataContainer._icon = icon;
            return window.GoogleMapDataContainer;
        };
        
        // init google map
        window.GoogleMapDataContainer.createGoogleMap = function (idSelector, options) {
            window.GoogleMapDataContainer._map = new gm.Map(document.getElementById(idSelector), options);
            return window.GoogleMapDataContainer;
        };

        // create markers options before to add them on map
        // markersInfo must be array with elements like {lat: , lng: , title: , infoWindow: } (infoWindow - html content)
        window.GoogleMapDataContainer.createMarkersOptions = function (markersInfo) {

            window.GoogleMapDataContainer._markersOptions = [];

            var k;
            for (k in markersInfo) {
                window.GoogleMapDataContainer._markersOptions.push({
                    position: window.GoogleMapDataContainer.LatLng(markersInfo[k].lat, markersInfo[k].lng),
                    map: window.GoogleMapDataContainer._map,
                    title: markersInfo[k].title,
                    infoWindow: markersInfo[k].infoWindow,
                    icon: markersInfo[k].icon
                });
            }

            return window.GoogleMapDataContainer;

        };

        // add single marker on map
        window.GoogleMapDataContainer._addMarker = function (marker) {
            var infowindow = new gm.InfoWindow({
                content: marker.infoWindow
            });


            var Marker = new gm.Marker(marker);
            //marker.setMap(window.GoogleMapDataContainer._map);

            window.GoogleMapDataContainer._markers.push(Marker);

            Marker.addListener('click', function () {
                infowindow.open(window.GoogleMapDataContainer._map, Marker);
            });
        };

        // add markers on map
        window.GoogleMapDataContainer.drawMarkers = function () {

            if (window.GoogleMapDataContainer._map == null || window.GoogleMapDataContainer._markersOptions.length <= 0) {
                return;
            }

            var k, m_o = window.GoogleMapDataContainer._markersOptions, infowindow, marker, bounds = new gm.LatLngBounds();

            for (k in m_o) {
                bounds.extend(m_o[k].position);
                window.GoogleMapDataContainer._addMarker(m_o[k]);
            }

            window.GoogleMapDataContainer._map.setCenter(bounds.getCenter(), window.GoogleMapDataContainer._map.fitBounds(bounds));
            return window.GoogleMapDataContainer;
        };

        // remove markers from map
        window.GoogleMapDataContainer.deleteMarkers = function () {
            var k;
            for (k in window.GoogleMapDataContainer._markers) {
                window.GoogleMapDataContainer._markers[k].setMap(null);
            }
            window.GoogleMapDataContainer._markers = [];

            return window.GoogleMapDataContainer;
        };

        // latlng google object creater
        window.GoogleMapDataContainer.LatLng = function (lat, lng) {
            return new gm.LatLng(lat, lng);
        };

        // draw route
        // markersInfo must be array with elements like {lat: , lng: , title: , infoWindow: } (infoWindow - html content)
        window.GoogleMapDataContainer.drawRoute = function (markersInfo) {

            if (window.GoogleMapDataContainer._map == null) {
                return;
            }

            var dirDisplay = new gm.DirectionsRenderer(),
                    dirSrvice = new gm.DirectionsService(),
                    cnt, startPoint, endPoint, arMarkersInfo = [], wayPoints = [], k;

            window.GoogleMapDataContainer.createMarkersOptions(markersInfo);

            arMarkersInfo = window.GoogleMapDataContainer._markersOptions;

            cnt = arMarkersInfo.length;

            if (cnt <= 0)
                return;

            dirDisplay.setMap(window.GoogleMapDataContainer._map);
            dirDisplay.setOptions({suppressMarkers: true, suppressInfoWindows: true});

            window.GoogleMapDataContainer.drawMarkers();

            startPoint = arMarkersInfo[0].position;
            endPoint = arMarkersInfo[cnt - 1].position;

            delete arMarkersInfo[0];
            delete arMarkersInfo[cnt - 1];

            for (k = 1; k <= (cnt - 2); k++) {
                wayPoints.push({location: arMarkersInfo[k].position});
            }

            dirSrvice.route({
                origin: startPoint,
                waypoints: wayPoints,
                destination: endPoint,
                travelMode: gm.TravelMode.DRIVING,
                unitSystem: gm.UnitSystem.METRIC,
                provideRouteAlternatives: true,
                avoidHighways: false,
                avoidTolls: true
            },
                    function (result, status) {
                        if (status == gm.DirectionsStatus.OK) {
                            dirDisplay.setDirections(result);
                        }
                    });

        }

    }

})(window, google.maps);