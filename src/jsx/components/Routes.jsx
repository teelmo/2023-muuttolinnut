import React, { /* useState, */useEffect } from 'react';
import '../../styles/styles.less';

// Load helpers.
// import formatNr from './helpers/FormatNr.js';
// import roundNr from './helpers/RoundNr.js';

// const appID = '#app-root-2023-muuttolinnut';

// https://www.npmjs.com/package/uuid
// import { v4 as uuidv4 } from 'uuid';

function Routes() {
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
        <div className="map_container">
          <img src="https://dummyimage.com/600x4:3/f1f1f1/000&text=ei päivittyvä kartta" alt="Kuvausteksti" />
          <p>Valitsemalla kartalta saat tietoja yleisistä muuttoreiteistä</p>
        </div>
      </div>
      <noscript>Your browser does not support JavaScript!</noscript>
    </div>
  );
}

export default Routes;
