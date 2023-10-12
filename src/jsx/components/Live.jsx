import React, { /* useState, */useEffect } from 'react';
import PropTypes from 'prop-types';

import '../../styles/styles.less';

// Load helpers.
// import formatNr from './helpers/FormatNr.js';
// import roundNr from './helpers/RoundNr.js';

// const appID = '#app-root-2023-muuttolinnut';

// https://www.npmjs.com/package/uuid
// import { v4 as uuidv4 } from 'uuid';

function Live({ activeBird }) {
  // Data states.
  // const [data, setData] = useState(false);

  useEffect(() => {
    // const data_file = (window.location.href.includes('unctad.org')) ? '/sites/default/files/data-file/2023-muuttolinnut.json' : './assets/data/data.json';
    try {
      // fetch(data_file)
      //   .then((response) => {
      //     if (!response.ok) {
      //       throw Error(response.statusText);
      //     }
      //     return response.text();
      //   })
      //   .then(body => setData(JSON.parse(body)));
    } catch (error) {
      console.error(error);
    }
  }, []);

  return (
    <div className="app">
      <div className="container">
        <h2>
          Lintu lintunen
          {' '}
          {activeBird}
        </h2>
        <div className="map_container">
          <img src="https://dummyimage.com/600x4:3/f1f1f1/000&text=päivittyvä kartta" alt="Kuvausteksti" />
          <p>Tiedot päivitetty: xx.xx.xxxx</p>
        </div>
        <div className="live_feed">
          <div className="live_feed_content">
            <h4 className="date">3.4.2024</h4>
            <h3 className="title">Lintu ohittaa toisen sähköjohdon</h3>
            <p>Salli on ohittanut Mosulin ja jatkaa matkaansa Turkin halki kohti Mustaamerta. Aavikot jäävät taakse. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
            <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
            <div className="image_container">
              <img src="https://dummyimage.com/600x16:9/f1f1f1/000&text=valokuva" alt="Kuvausteksti" />
            </div>
          </div>
          <div className="live_feed_content">
            <h4 className="date">23.3.2024</h4>
            <h3 className="title">Lintu ohittaa sähköjohdon</h3>
            <p>Salli on ohittanut Mosulin ja jatkaa matkaansa Turkin halki kohti Mustaamerta. Aavikot jäävät taakse. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
            <div className="image_container">
              <img src="https://dummyimage.com/600x16:9/f1f1f1/000&text=valokuva" alt="Kuvausteksti" />
            </div>
          </div>
        </div>
      </div>
      <noscript>Your browser does not support JavaScript!</noscript>
    </div>
  );
}

Live.propTypes = {
  activeBird: PropTypes.string.isRequired,
};

Live.defaultProps = {
};

export default Live;
