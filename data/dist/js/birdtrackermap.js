var baseUrl;
const pitch = 82;
const animationDuration = 180000;
const cameraAltitude = 10000;
var maailmanBounds = [-80, -50, 120, 80];
const paddings = [130, 50, 70, 50];
var oldBearing = 0
var map;
var smallmap;
let curvedLine;
var popupContent;
let cameraDataPoint = [];
let lineDataPoint = []
let tracedata = { "type": "FeatureCollection", "features": [{ "type": "Feature", "properties": {}, "geometry": { "type": "LineString", "coordinates": [] } }] };
let geojsonData = { "type": "FeatureCollection", "features": [] };

document.addEventListener("DOMContentLoaded", function (event) {

    if (window.location.href.substring(0, 12) === "http://local") {
        baseUrl = "";
    } else {
        baseUrl = "https://lusi-dataviz.ylestatic.fi/2023_lento/";
    }
    mapboxgl.accessToken = 'pk.eyJ1IjoieWxlaXNyYWRpbyIsImEiOiJjam90cTB4N3gxMGxjM3dsaDVsendub3N1In0.wL_Mc8cux0MxxhuUZWewJg';
    
    const fetchExternalData = () => {
        return Promise.all([
            fetch("js/infot.json"),
            fetch("js/reitti.json")
        ]).then(results => {
            return Promise.all(results.map(result => result.json()));
        });
    };

    fetchExternalData()
        .then(result => {
    
            let datat = result[1];
            for (var z = 0; z < datat['JX.1023262'].length; z++) {
                var pointDate = new Date(datat['JX.1023262'][z].d);

                if (pointDate.getFullYear() == 2022 && pointDate.getMonth() < 6) {
                    const pointDataPoint = { "type": "Feature", "properties": { "time": datat['JX.1023262'][z].d }, "geometry": { "type": "Point", "coordinates": [datat['JX.1023262'][z].y, datat['JX.1023262'][z].x] } };
                    geojsonData.features.push(pointDataPoint);
                    lineDataPoint.push([datat['JX.1023262'][z].y, datat['JX.1023262'][z].x]);
                    // THIS IS LINE FOR CAMERA  DIRECTION. PROPABLY BETTER WAYS TO DO IT (e.g. turf.along in animation function) 
                    cameraDataPoint.push([datat['JX.1023262'][z + 1].y, datat['JX.1023262'][z + 1].x]);
                }

            };

            var curvedLineDataPoint = turf.bezierSpline(turf.lineString(lineDataPoint), {
                sharpness: 0,
                resolution: 60000
            });

            var curvedCameraDataPoint = [...curvedLineDataPoint.geometry.coordinates];
            curvedCameraDataPoint.shift();
            curvedCameraDataPoint = turf.lineString(curvedCameraDataPoint)

            const targetRoute = cameraDataPoint;

            // this is the path the camera will move along
            const cameraRoute = cameraDataPoint;

            map = new mapboxgl.Map({
                container: 'birdmap',
                style: 'mapbox://styles/mapbox/satellite-v9',
                projection: 'globe',
                center: [26.8, 65.3],
                bounds: maailmanBounds,
                minZoom: 1,
                pitch: 0,
                bearing: 180
            });

            const nav = new mapboxgl.NavigationControl({
                visualizePitch: true,
                showZoom: true
            });
            map.addControl(nav, 'bottom-right');

            map.on('style.load', () => {
                map.addSource('mapbox-dem', {
                    'type': 'raster-dem',
                    'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
                    'tileSize': 512,
                    'maxzoom': 14
                });
                map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });

                map.on('load', () => {
                    map.setFog({
                        'horizon-blend': 0.1 // Exaggerate atmosphere (default is .1)
                    });
                });

                map.on('load', () => {
                    map.addSource('LineString', {
                        'type': 'geojson',
                        'data': {
                            'type': 'Feature',
                            'properties': {},
                            'geometry': {
                                'type': 'LineString',
                                'coordinates': curvedLineDataPoint.geometry.coordinates
                            }
                        }
                    });

                    map.addLayer({
                        'id': 'LineS',
                        'type': 'line',
                        'source': 'LineString',
                        'layout': {
                            'line-join': 'round',
                            'line-cap': 'round'
                        },
                        'paint': {
                            'line-color': 'white',
                            'line-width': 5
                        }
                    });
                });
            });

            smallmap = new mapboxgl.Map({
                container: 'smallmap', // container ID
                // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
                style: 'mapbox://styles/mapbox/satellite-streets-v11', // style URL
                center: lineDataPoint[0], // starting position [lng, lat]
                zoom: 4, // starting zoom
                language: 'fi'
            });

            smallmap.on('load', () => {
                smallmap.addSource('LineString', {
                    'type': 'geojson',
                    'data': {
                        'type': 'Feature',
                        'properties': {},
                        'geometry': {
                            'type': 'LineString',
                            'coordinates': curvedLineDataPoint.geometry.coordinates
                        }
                    }
                });

                smallmap.addLayer({
                    'id': 'LineS_small',
                    'type': 'line',
                    'source': 'LineString',
                    'layout': {
                        'line-join': 'round',
                        'line-cap': 'round'
                    },
                    'paint': {
                        'line-color': 'white',
                        'line-width': 5
                    }
                });

                // https://docs.mapbox.com/mapbox-gl-js/example/live-update-feature/
                // start by showing just the first coordinate
                tracedata.features[0].geometry.coordinates = [curvedLineDataPoint.geometry.coordinates[0]];
                // add it to the map
                smallmap.addSource('trace', { type: 'geojson', data: tracedata });
                smallmap.addLayer({
                    'id': 'trace',
                    'type': 'line',
                    'source': 'trace',
                    'layout': {
                        'line-join': 'round',
                        'line-cap': 'round'
                    },
                    'paint': {
                        'line-color': 'MediumSeaGreen',
                        'line-opacity': 1,
                        'line-width': 6
                    }
                });
            });

            map.on('load', () => {
                // get the overall distance of each route so we can interpolate along them
                const routeDistance = turf.lineDistance(curvedLineDataPoint);
                const cameraRouteDistance = turf.lineDistance(curvedLineDataPoint);
                let start;
                let infotekstit = result[0]
                let apuri = 0;
                let phase = 0;

                function frame(time) {
                    if (phase < 1) {
                        if (!start) start = time;
                        // phase determines how far through the animation we are
                        phase = (time - start) / animationDuration;
                        kms = routeDistance * phase
                        $("#odometer").html(Math.round(routeDistance * phase) + " km")

                        // phase is normalized between 0 and 1
                        // use the phase to get a point that is the appropriate distance along the route
                        // this approach syncs the camera and route positions ensuring they move
                        // at roughly equal rates even if they don't contain the same number of points
                       
                        const alongRoute = turf.along(
                            curvedLineDataPoint,
                            routeDistance * phase
                        ).geometry.coordinates;

                        const cameraTarget = turf.along(
                            curvedCameraDataPoint, //line
                            cameraRouteDistance * phase // distance
                        ).geometry.coordinates;

                        if (phase == 0) {
                            console.log(curvedLineDataPoint)
                            console.log(cameraTarget[0])
                            console.log(alongRoute[0])
                        }

                        if (apuri < infotekstit.info.length) {
                            if (alongRoute[1] >= infotekstit.info[apuri].lat) {
                                $("#infotext").html(infotekstit.info[apuri].teksti)
                                console.log(apuri, infotekstit.info[apuri].teksti)
                                apuri++;
                            }
                        }

                        // UPDATE SMALL MAP'S LINE
                        tracedata.features[0].geometry.coordinates.push(alongRoute);
                        smallmap.getSource('trace').setData(tracedata);
                        smallmap.setCenter(alongRoute)
                        const camera = map.getFreeCameraOptions();

                        // set the position and altitude of the camera
                        camera.position = mapboxgl.MercatorCoordinate.fromLngLat(
                            {
                                lng: alongRoute[0],
                                lat: alongRoute[1]
                            },
                            cameraAltitude
                        );

                        var point1 = turf.point([alongRoute[0], alongRoute[1]]);
                        var point2 = turf.point([cameraTarget[0], cameraTarget[1]]);

                        // SMOOTH CAMERA MOVEMENT GRADUALLY
                        var bearingGoal = turf.bearing(point1.geometry.coordinates, point2.geometry.coordinates);
                        camera.setPitchBearing(pitch, smoothCamera(oldBearing, bearingGoal))
                        oldBearing = smoothCamera(oldBearing, bearingGoal);

                        map.setFreeCameraOptions(camera);
                        window.requestAnimationFrame(frame);
                    }
                    else {
                        console.log("======= "+routeDistance * phase+" ===========")
                        console.log("======= MATKA LOPPUI ===========")
                    }
                }

                
                $(".buttonWrapper .button").on('click', function () {
                    // GET DATA-VALUE FROM BUTTON TO SET STARTING LATITUDE (IF MULTIPLE STARTING POINTS&BUTTONS)
                    klikattu = $(this).data('value');
                    window.requestAnimationFrame(frame);
                });
            });
        })
        .catch(console.error);

    function smoothCamera(oldInt, newInt) {
        var brng = ((-oldInt - (-newInt)) / 80) + oldInt;
        return brng;
    }
});
