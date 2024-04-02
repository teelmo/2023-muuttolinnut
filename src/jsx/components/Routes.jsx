import React, { /* useState, useEffect */} from 'react';
import '../../styles/styles.less';

function Routes() {
  return (
    <>
      <div className="container">
        <div className="map_container">
          <img src="https://dummyimage.com/600x4:3/f1f1f1/000&text=ei päivittyvä kartta" alt="Kuvausteksti" />
          <p>Valitsemalla kartalta saat tietoja yleisistä muuttoreiteistä</p>
        </div>
      </div>
      <noscript>Your browser does not support JavaScript!</noscript>
    </>
  );
}

export default Routes;
