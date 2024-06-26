import React, {
  useEffect, useCallback, useRef, useState
} from 'react';
import PropTypes from 'prop-types';

import '../../styles/styles.less';

// https://www.npmjs.com/package/mapbox-gl
import mapboxgl from 'mapbox-gl';
// https://turfjs.org/getting-started/
import * as turf from '@turf/turf';

// https://docs.mapbox.com/mapbox-gl-js/guides/
// https://docs.mapbox.com/mapbox-gl-js/example/globe/
// https://docs.mapbox.com/mapbox-gl-js/api/properties/
// https://docs.mapbox.com/mapbox-gl-js/example/free-camera-path/
mapboxgl.accessToken = 'pk.eyJ1IjoieWxlaXNyYWRpbyIsImEiOiJjam90cTB4N3gxMGxjM3dsaDVsendub3N1In0.wL_Mc8cux0MxxhuUZWewJg';

function Map({ update, values, view }) {
  const [data, setData] = useState(false);
  const [infoText, setInfoText] = useState(false);
  const [infoTitle, setInfoTitle] = useState(false);
  const [odometer, setOdometer] = useState(0);

  // eslint-disable-next-line
  const tracedata = useRef({ 'type': 'FeatureCollection', 'features': [{ 'type': 'Feature', 'properties': {}, 'geometry': { 'type': 'LineString', 'coordinates': [] } }] });
  const curvedLineDataPoint = useRef([]);
  const curvedCameraDataPoint = useRef([]);
  const map1 = useRef(false);
  const map2 = useRef(false);
  const map2Container = useRef(null);
  const map1Container = useRef(null);
  const phase = useRef(0);
  const [phasePrevious, setPhasePrevious] = useState(0);
  const oldBearing = useRef(0);
  const infoTextIdx = useRef(0);
  const isRunning = useRef(false);
  const [closeButtonText, setCloseButtonText] = useState('Jatka');

  const animationDuration = 18000;
  const pitch = 82;
  let start_time;
  let prevAlongRoute = [0, 0];
  const smoothCamera = (oldInt, newInt) => {
    const brng = ((-oldInt - (-newInt)) / 80) + oldInt;
    return brng;
  };

  const hideControls = () => {
    document.querySelector('.controls_container').style.display = 'none';
  };
  const showMeta = () => {
    document.querySelector('.info_text_container').style.display = 'none';
    document.querySelector('.odometer').style.display = 'block';
  };
  const hideMeta = () => {
    document.querySelector('.info_text_container').style.display = 'none';
    document.querySelector('.odometer').style.display = 'none';
  };
  const hideMarkers = () => {
    document.querySelectorAll('.marker').forEach((marker) => {
      marker.style.display = 'none';
    });
  };
  const showMarkers = () => {
    document.querySelectorAll('.marker').forEach((marker) => {
      marker.style.display = 'block';
    });
  };

  const calculateBearing = (start, end) => {
    const coordinates1 = start;
    const coordinates2 = end;
    const lon1 = turf.degreesToRadians(coordinates1[0]);
    const lon2 = turf.degreesToRadians(coordinates2[0]);
    const lat1 = turf.degreesToRadians(coordinates1[1]);
    const lat2 = turf.degreesToRadians(coordinates2[1]);
    const a = Math.sin(lon2 - lon1) * Math.cos(lat2);
    const b = Math.cos(lat1) * Math.sin(lat2)
            - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);

    return turf.radiansToDegrees(Math.atan2(a, b));
  };

  const updateMap = (time) => {
    // get the overall distance of each route so we can interpolate along them
    const routeDistance = turf.lineDistance(curvedLineDataPoint.current);
    const cameraRouteDistance = turf.lineDistance(curvedLineDataPoint.current);
    const infoTexts = data[0];
    // Animation ongoing.
    if (phase.current < 1 && isRunning.current === true) {
      // Animation start
      if (phase.current === 0) {
        hideMarkers();
        showMeta();
      }
      if (!start_time) start_time = time;
      // phase determines how far through the animation we are
      phase.current = (time - start_time) / animationDuration + phasePrevious;
      // kms = routeDistance * phase;
      setOdometer(Math.round(routeDistance * phase.current));
      const alongRoute = turf.along(
        curvedLineDataPoint.current,
        routeDistance * phase.current
      ).geometry.coordinates;

      map1.current.setLayoutProperty('bird', 'icon-rotate', calculateBearing(prevAlongRoute, alongRoute));
      // map2.current.setLayoutProperty('bird', 'icon-rotate', calculateBearing(prevAlongRoute, alongRoute));
      const lastData = {
        geometry: {
          coordinates: alongRoute,
          type: 'Point'
        },
        properties: {},
        type: 'Feature'
      };
      map1.current.getSource('last').setData(lastData);
      // map2.current.getSource('last').setData(lastData);

      prevAlongRoute = [...alongRoute];

      const alongCamera = turf.along(
        curvedCameraDataPoint.current, // line
        cameraRouteDistance * phase.current // distance
      ).geometry.coordinates;

      if (infoTextIdx.current < infoTexts.map_feed.length && infoTextIdx.current === false) {
        if (alongRoute[1] >= infoTexts.map_feed[infoTextIdx.current].lat) {
          isRunning.current = false;
          setPhasePrevious(phase.current);
          setInfoText(infoTexts.map_feed[infoTextIdx.current].text);
          setInfoTitle(infoTexts.map_feed[infoTextIdx.current].title);
          showMeta();
          infoTextIdx.current++;
        }
      }

      // UPDATE SMALL MAP'S LINE
      tracedata.current.features[0].geometry.coordinates.push(alongRoute);
      // map1.current.getSource('trace').setData(tracedata.current);
      map1.current.setCenter(alongRoute);

      const camera = map2.current.getFreeCameraOptions();
      // set the position and altitude of the camera
      camera.position = mapboxgl.MercatorCoordinate.fromLngLat({
        lng: alongRoute[0],
        lat: alongRoute[1]
      }, 100000);
      const point1 = turf.point([alongRoute[0], alongRoute[1]]);
      const point2 = turf.point([alongCamera[0], alongCamera[1]]);
      // SMOOTH CAMERA MOVEMENT GRADUALLY
      const bearingGoal = turf.bearing(point1.geometry.coordinates, point2.geometry.coordinates);
      camera.setPitchBearing(pitch, smoothCamera(oldBearing.current, bearingGoal));
      oldBearing.current = smoothCamera(oldBearing.current, bearingGoal);

      map2.current.setFreeCameraOptions(camera);
      window.requestAnimationFrame((t) => updateMap(t));
    } else if (phase.current >= 1) { // Animation end
      isRunning.current = false;
      showMarkers();
      setInfoTitle('Tässä matka tähän asti');
      setInfoText(['Lue lisää Veskusta alta']);
      setCloseButtonText('Sulje');
      showMeta();
    }
  };

  const createMap = useCallback((lineDataPoint, result_data) => {
    const worldBounds = [-80, -50, 120, 80];

    map1.current = new mapboxgl.Map({
      center: lineDataPoint[0], // starting position [lng, lat]
      container: map1Container.current, // container ID
      language: 'fi',
      style: 'mapbox://styles/mapbox/satellite-streets-v11', // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
      zoom: 4 // starting zoom
    });
    map1.current.on('load', () => {
      map1.current.addSource('LineString', {
        data: {
          geometry: {
            coordinates: curvedLineDataPoint.current.geometry.coordinates,
            type: 'LineString'
          },
          properties: {},
          type: 'Feature'
        },
        type: 'geojson'
      });

      map1.current.addLayer({
        id: 'LineS_small',
        layout: {
          'line-cap': 'round',
          'line-join': 'round'
        },
        paint: {
          'line-color': 'rgba(87, 229, 222, 0.7)',
          'line-width': 7
        },
        source: 'LineString',
        type: 'line'
      });

      map1.current.addSource('last', {
        data: {
          geometry: {
            coordinates: lineDataPoint[0],
            type: 'Point'
          },
          properties: {},
          type: 'Feature'
        },
        type: 'geojson'
      });

      map1.current.loadImage(`${(window.location.href.includes('yle')) ? 'https://lusi-dataviz.ylestatic.fi/2023-muuttolinnut/' : './'}assets/img/bird2.png`, (error, image) => {
        if (error) throw error;
        // add image to the active style and make it SDF-enabled
        map1.current.addImage('bird', image, { sdf: true });
      });

      map1.current.addLayer(
        {
          id: 'bird',
          layout: {
            'icon-allow-overlap': true,
            'icon-image': 'bird',
            'icon-size': ['interpolate', ['linear'], ['zoom'], 4, 0.1, 8, 0.2],
            'icon-rotate': calculateBearing(lineDataPoint[0], lineDataPoint[1])
          },
          paint: {
            'icon-color': '#fff'
          },
          source: 'last',
          type: 'symbol'
        }
      );

      // https://docs.mapbox.com/mapbox-gl-js/example/live-update-feature/
      // start by showing just the first coordinate
      tracedata.current = { type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [] } }] };
      tracedata.current.features[0].geometry.coordinates = [curvedLineDataPoint.current.geometry.coordinates[0]];
      // // add it to the map
      map1.current.addSource('trace', { type: 'geojson', data: tracedata.current });
      map1.current.addLayer({
        id: 'trace',
        type: 'line',
        source: 'trace',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#00b4ff',
          'line-opacity': 1,
          'line-width': 7
        }
      });
      // https://docs.mapbox.com/help/tutorials/custom-markers-gl-js/
      result_data[0].map_markers.forEach((feature) => {
        const el = document.createElement('div');
        el.className = 'marker';

        new mapboxgl.Marker(el)
          .setLngLat(feature.geometry.coordinates)
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<h3>${feature.properties.title}</h3><p>${feature.properties.description}</p>`
          )).addTo(map1.current);
      });
    });

    map2.current = new mapboxgl.Map({
      bearing: 180,
      bounds: worldBounds,
      center: [26.8, 65.3],
      container: map2Container.current,
      minZoom: 0,
      pitch: 0,
      projection: 'globe',
      style: 'mapbox://styles/mapbox/satellite-v9'
    });

    const nav = new mapboxgl.NavigationControl({
      showZoom: false,
      visualizePitch: true
    });
    map2.current.addControl(nav, 'bottom-right');
    map2.current.on('style.load', () => {
      map2.current.addSource('mapbox-dem', {
        maxzoom: 12,
        tileSize: 512,
        type: 'raster-dem',
        url: 'mapbox://mapbox.mapbox-terrain-dem-v1'
      });
      map2.current.setTerrain({ source: 'mapbox-dem', exaggeration: 0.5 });

      map2.current.on('load', () => {
        map2.current.setFog({
          'horizon-blend': 0.02 // Exaggerate atmosphere (default is .1)
        });
      });

      map2.current.addSource('LineString', {
        data: {
          geometry: {
            coordinates: curvedLineDataPoint.current.geometry.coordinates,
            type: 'LineString'
          },
          properties: {},
          type: 'Feature'
        },
        type: 'geojson'
      });

      map2.current.addLayer({
        id: 'LineS',
        layout: {
          'line-cap': 'round',
          'line-join': 'round'
        },
        paint: {
          'line-color': '#57e5de',
          'line-width': 4
        },
        source: 'LineString',
        type: 'line'
      });
      // map2.current.addSource('last', {
      //   data: {
      //     geometry: {
      //       coordinates: lineDataPoint[0],
      //       type: 'Point'
      //     },
      //     properties: {},
      //     type: 'Feature'
      //   },
      //   type: 'geojson'
      // });

      // map2.current.loadImage(`${(window.location.href.includes('yle')) ? 'https://lusi-dataviz.ylestatic.fi/2023-muuttolinnut/' : './'}assets/img/bird2.png`, (error, image) => {
      //   if (error) throw error;
      //   // add image to the active style and make it SDF-enabled
      //   map2.current.addImage('bird', image, { sdf: true });
      // });

      // map2.current.addLayer(
      //   {
      //     id: 'bird',
      //     layout: {
      //       'icon-allow-overlap': true,
      //       'icon-image': 'bird',
      //       'icon-size': ['interpolate', ['linear'], ['zoom'], 4, 0.1, 8, 1],
      //       'icon-rotate': calculateBearing(lineDataPoint[0], lineDataPoint[1])
      //     },
      //     paint: {
      //       'icon-color': '#fff'
      //     },
      //     source: 'last',
      //     type: 'symbol'
      //   }
      // );
    });
  }, []);

  const cleanFlightData = useCallback((result) => {
    // const cameraDataPoint = [];
    const lineDataPoint = [];
    result[1]['JX.1442466'].forEach((map_point) => {
      const pointDate = new Date(map_point.d);

      if (pointDate.getFullYear() > 2023 && pointDate.getMonth() > 1) {
        // const pointDataPoint = { type: 'Feature', properties: { time: data['JX.1442466'][i].d }, geometry: { type: 'Point', coordinates: [data['JX.1442466'][i].y, data['JX.1442466'][i].x] } };
        // geojsonData.features.push(pointDataPoint);
        lineDataPoint.push([map_point.y, map_point.x]);
        // THIS IS LINE FOR CAMERA  DIRECTION. PROPABLY BETTER WAYS TO DO IT (e.g. turf.along in animation function)
        // cameraDataPoint.push([map_point.y, map_point.x]);
      }
    });
    curvedLineDataPoint.current = turf.bezierSpline(turf.lineString(lineDataPoint), {
      sharpness: 0,
      resolution: 60000
    });

    const tmp = [...curvedLineDataPoint.current.geometry.coordinates];
    tmp.shift();
    curvedCameraDataPoint.current = turf.lineString(tmp);

    createMap(lineDataPoint, result);
    return lineDataPoint;
  }, [createMap]);

  useEffect(() => {
    setData(values);
    // cleanFlightData(values);
  }, [values]);

  const startJourney = () => {
    map1.current.on('load', () => {
      hideControls();
      isRunning.current = true;
      window.requestAnimationFrame((t) => updateMap(t));
    });
  };

  const loadMap = (journey) => {
    const lineDataPoint = cleanFlightData(data);
    if (journey === true) {
      startJourney();
    } else {
      const lastData = {
        geometry: {
          coordinates: lineDataPoint[lineDataPoint.length - 1],
          type: 'Point'
        },
        properties: {},
        type: 'Feature'
      };
      map1.current.on('load', () => {
        map1.current.setLayoutProperty('bird', 'icon-rotate', calculateBearing(lineDataPoint[lineDataPoint.length - 2], lineDataPoint[lineDataPoint.length - 1]));
        map1.current.getSource('last').setData(lastData);
      });
      map2.current.on('load', () => {
      //   map2.current.setLayoutProperty('bird', 'icon-rotate', calculateBearing(lineDataPoint[lineDataPoint.length - 2], lineDataPoint[lineDataPoint.length - 1]));
      //   map2.current.getSource('last').setData(lastData);

        const camera = map2.current.getFreeCameraOptions();
        //   // set the position and altitude of the camera
        camera.position = mapboxgl.MercatorCoordinate.fromLngLat({
          lat: lineDataPoint[lineDataPoint.length - 1][1],
          lng: lineDataPoint[lineDataPoint.length - 1][0]
        }, 100000);
        const point1 = turf.point([lineDataPoint[lineDataPoint.length - 1][0], lineDataPoint[lineDataPoint.length - 1][1]]);
        const point2 = turf.point([lineDataPoint[lineDataPoint.length - 2][0], lineDataPoint[lineDataPoint.length - 2][1]]);
        const bearingGoal = turf.bearing(point1.geometry.coordinates, point2.geometry.coordinates);
        camera.setPitchBearing(pitch, bearingGoal);

        map2.current.setFreeCameraOptions(camera);
      });

      hideControls();
    }
  };

  useEffect(() => {
    if (update === true) {
      if (map1.current) map1.current.resize();
      if (map1.current) map2.current.resize();
    }
  }, [update, view]);

  const play = (action) => {
    if (action === 'Jatka') {
      isRunning.current = true;
      hideMeta();
      window.requestAnimationFrame((t) => updateMap(t));
    } else {
      hideMeta();
    }
  };

  return (
    <div className={(view === 'fly') ? 'map_wrapper alt_view' : 'map_wrapper'}>
      <div className="controls_container">
        <div className="content_container">
          <h3>Matkakartta</h3>
          <div className="button_container">
            <button type="button" className="" data-value="0" onClick={() => loadMap(true)}>Lennä Veskun reitti</button>
          </div>
          <div className="button_container">
            <button type="button" className="" data-value="0" onClick={() => loadMap(false)}>Veskun reitti kartalla</button>
          </div>
        </div>
      </div>
      <div className="maps_container">
        <div className="info_text_container">
          <div className="content_container">
            {
              infoText && (
              <div className="info_text">
                <h3>{infoTitle}</h3>
                {infoText.map((text) => <p key={text}>{text}</p>)}
                <button type="button" className="continue" onClick={() => play(closeButtonText)}>{closeButtonText}</button>
              </div>
              )
            }
          </div>
        </div>
        <div className="odometer">
          {odometer}
          {' '}
          km
        </div>
        <div ref={map1Container} className="no_fly main_map" />
        <div className="fly secondary_map" ref={map2Container} />
      </div>
      <p className="updated_info">
        Tiedot päivitetty:
        {' '}
        {`${(new Date(values[1].updated)).getDate()}.${(new Date(values[1].updated)).getMonth() + 1}.${(new Date(values[1].updated)).getFullYear()}`}
      </p>
      <noscript>Your browser does not support JavaScript!</noscript>
    </div>
  );
}

Map.propTypes = {
  update: PropTypes.bool.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  values: PropTypes.array.isRequired,
  view: PropTypes.string.isRequired
};

Map.defaultProps = {
};

export default Map;
