import React, {
  useEffect, useCallback, useRef, useState
} from 'react';
// import PropTypes from 'prop-types';

import '../../styles/styles.less';

// https://www.npmjs.com/package/mapbox-gl
import mapboxgl from 'mapbox-gl';
// https://turfjs.org/getting-started/
import * as turf from '@turf/turf';

mapboxgl.accessToken = 'pk.eyJ1IjoieWxlaXNyYWRpbyIsImEiOiJjam90cTB4N3gxMGxjM3dsaDVsendub3N1In0.wL_Mc8cux0MxxhuUZWewJg';

// https://docs.mapbox.com/mapbox-gl-js/guides/
// https://docs.mapbox.com/mapbox-gl-js/example/globe/
// https://docs.mapbox.com/mapbox-gl-js/api/properties/
// https://docs.mapbox.com/mapbox-gl-js/example/free-camera-path/

// Load helpers.
// import formatNr from './helpers/FormatNr.js';
// import roundNr from './helpers/RoundNr.js';

function Map() {
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

  // Fetch data
  const fetchExternalData = () => {
    const baseURL = (window.location.href.includes('yle')) ? 'https://lusi-dataviz.ylestatic.fi/2023_muuttolinnut/' : './';
    let values;
    try {
      values = Promise.all([
        fetch(`${baseURL}assets/data/info.json`),
        // fetch(`${baseURL}assets/data/route.json`)
        fetch(`${baseURL}assets/data/partial_route.json`)
      ]).then(results => Promise.all(results.map(result => result.json())));
    } catch (error) {
      console.error(error);
    }
    return values;
  };

  const animationDuration = 18000;
  const pitch = 82;
  let start_time;
  const smoothCamera = (oldInt, newInt) => {
    const brng = ((-oldInt - (-newInt)) / 80) + oldInt;
    return brng;
  };

  const hideControls = () => {
    document.querySelector('.controls_container').style.display = 'none';
  };
  const showMeta = () => {
    document.querySelector('.info_text_container').style.display = 'block';
    document.querySelector('.odometer').style.display = 'block';
  };
  const hideMeta = () => {
    document.querySelector('.info_text_container').style.display = 'none';
    document.querySelector('.odometer').style.display = 'block';
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

  const updateMap = (time) => {
    // get the overall distance of each route so we can interpolate along them
    const routeDistance = turf.lineDistance(curvedLineDataPoint.current);
    const cameraRouteDistance = turf.lineDistance(curvedLineDataPoint.current);
    const infoTexts = data[0];
    if (phase.current === 0) {
      console.log('on se nolla');
    }
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

      const alongCamera = turf.along(
        curvedCameraDataPoint.current, // line
        cameraRouteDistance * phase.current // distance
      ).geometry.coordinates;

      if (infoTextIdx.current < infoTexts.info.length) {
        if (alongRoute[1] >= infoTexts.info[infoTextIdx.current].lat) {
          isRunning.current = false;
          setPhasePrevious(phase.current);
          setInfoText(infoTexts.info[infoTextIdx.current].text);
          setInfoTitle(infoTexts.info[infoTextIdx.current].title);
          showMeta();
          infoTextIdx.current++;
        }
      }

      // UPDATE SMALL MAP'S LINE
      tracedata.current.features[0].geometry.coordinates.push(alongRoute);
      map1.current.getSource('trace').setData(tracedata.current);
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
      setInfoTitle('Täällä tänne asti on päästy');
      setInfoText(['Matka päättyi']);
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
      result_data[0].markers.forEach((feature) => {
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
    });
  }, []);

  const cleanFlightData = useCallback((result) => {
    const cameraDataPoint = [];
    const lineDataPoint = [];
    result[1]['JX.1023262'].forEach((map_point) => {
      const pointDate = new Date(map_point.d);

      if (pointDate.getFullYear() === 2022 && pointDate.getMonth() < 6) {
        // const pointDataPoint = { type: 'Feature', properties: { time: data['JX.1023262'][i].d }, geometry: { type: 'Point', coordinates: [data['JX.1023262'][i].y, data['JX.1023262'][i].x] } };
        // geojsonData.features.push(pointDataPoint);
        lineDataPoint.push([map_point.y, map_point.x]);
        // THIS IS LINE FOR CAMERA  DIRECTION. PROPABLY BETTER WAYS TO DO IT (e.g. turf.along in animation function)
        cameraDataPoint.push([map_point.y, map_point.x]);
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
  }, [createMap]);

  useEffect(() => {
    fetchExternalData().then(result => {
      setData(result);
      cleanFlightData(result);
    }).catch(console.error);
  }, [cleanFlightData]);

  const startJourney = () => {
    hideControls();
    isRunning.current = true;
    window.requestAnimationFrame((t) => updateMap(t));
  };

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
    <div className="map_wrapper">
      <div className="controls_container">
        <div className="content_container">
          <h3>Matkakartta</h3>
          <div className="button_container">
            <button type="button" className="" data-value="0" onClick={() => startJourney()}>Näytä tähän astinen matka</button>
          </div>
          <div className="button_container">
            <button type="button" className="" data-value="0" onClick={() => hideControls()}>Selaa karttaa</button>
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
                <button type="button" onClick={() => play(closeButtonText)}>{closeButtonText}</button>
                {infoText.map((text) => <p key={text}>{text}</p>)}
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
        <div ref={map1Container} className="main_map" />
        <div className="secondary_map" ref={map2Container} />
      </div>
      <noscript>Your browser does not support JavaScript!</noscript>
    </div>
  );
}

export default Map;
