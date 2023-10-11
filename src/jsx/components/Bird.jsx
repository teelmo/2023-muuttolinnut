import React, { /* useState, */useEffect } from 'react';
import PropTypes from 'prop-types';

import '../../styles/styles.less';

// Load helpers.
// import formatNr from './helpers/FormatNr.js';
// import roundNr from './helpers/RoundNr.js';

// const appID = '#app-root-2023-muuttolinnut';

// https://www.npmjs.com/package/uuid
// import { v4 as uuidv4 } from 'uuid';

function Bird({ activeBird }) {
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
        <div className="content">
          <div className="image_container">
            <img src="https://dummyimage.com/600x4:3/f1f1f1/000&text=linnun kuva" alt="Kuvausteksti" />
          </div>
          <div className="bird_info_container">
            <h3 className="bird_name">
              Lintu lintunen
              {' '}
              {activeBird}
            </h3>
            <h4 className="bird_species">Kanahaukka</h4>
            <ul className="bird_info">
              <li>
                <span className="label">Ikä:</span>
                {' '}
                <span className="value">39</span>
              </li>
              <li>
                <span className="label">Uskonto:</span>
                {' '}
                <span className="value">Arabi</span>
              </li>
              <li>
                <span className="label">Korkeus:</span>
                {' '}
                <span className="value">150cm</span>
              </li>
              <li>
                <span className="label">Siipien kärkiväli:</span>
                {' '}
                <span className="value">51cm</span>
              </li>
              <li>
                <span className="label">Väri:</span>
                {' '}
                <span className="value">mustavalkoinen</span>
              </li>
            </ul>
            <p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
            <p>Aliquet bibendum enim facilisis gravida neque. Habitant morbi tristique senectus et netus et malesuada fames ac. Parturient montes nascetur ridiculus mus mauris vitae ultricies leo integer. Laoreet sit amet cursus sit amet dictum sit. Iaculis at erat pellentesque adipiscing commodo elit. Velit scelerisque in dictum non consectetur. Tincidunt nunc pulvinar sapien et ligula ullamcorper.</p>
            <p>Nulla facilisi etiam dignissim diam quis enim. Lacus suspendisse faucibus interdum posuere. Est ante in nibh mauris cursus mattis molestie a. Pellentesque pulvinar pellentesque habitant morbi tristique senectus et netus.</p>
          </div>
        </div>
      </div>
      <noscript>Your browser does not support JavaScript!</noscript>
    </div>
  );
}

Bird.propTypes = {
  activeBird: PropTypes.string.isRequired,
};

Bird.defaultProps = {
};

export default Bird;
