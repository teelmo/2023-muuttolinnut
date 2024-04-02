import React, { useState /* , useEffect */, useRef } from 'react';
import PropTypes from 'prop-types';

import '../../styles/styles.less';

// https://www.npmjs.com/package/uuid4
import uuid4 from 'uuid4';

// Load components.
import Map from './Map.jsx';

function Live({ activeBird, data }) {
  const [view, setView] = useState('no_fly');
  const [update, setUpdate] = useState(false);

  const fly = useRef();
  const no_fly = useRef();

  const changeView = () => {
    fly.current = document.querySelector('.fly');
    no_fly.current = document.querySelector('.no_fly');

    setUpdate(true);
    if (view === 'no_fly') {
      setView('fly');
      fly.current.classList.remove('secondary_map');
      fly.current.classList.add('main_map');
      no_fly.current.classList.remove('main_map');
      no_fly.current.classList.add('secondary_map');
    } else {
      setView('no_fly');
      fly.current.classList.remove('main_map');
      fly.current.classList.add('secondary_map');
      no_fly.current.classList.remove('secondary_map');
      no_fly.current.classList.add('main_map');
    }
  };
  const refreshPage = () => {
    window.location.replace(window.location.href);
  };
  return (
    <>
      <div className="container">
        <h2>
          {activeBird}
        </h2>
        <div className="map_container">
          <div className="change_view_container">
            <button type="button" onClick={() => refreshPage()} className="change_view">Lataa uudelleen</button>
            <button type="button" onClick={() => changeView()} className="change_view">Vaihda näkymää</button>
          </div>
          <Map values={data} view={view} update={update} />
        </div>
        <div className="live_feed">
          {
            data && data[0].map_feed.map(el => (
              <div className="live_feed_content" key={uuid4()}>
                <h4 className="date">{el.date}</h4>
                <h3 className="title">{el.title}</h3>
                {
                  el.text.map(text => <p key={uuid4()}>{text}</p>)
                }
                <div className="image_container">
                  <img src={el.img} alt={el.img_alt} />
                </div>
              </div>
            ))
          }
        </div>
      </div>
      <noscript>Your browser does not support JavaScript!</noscript>
    </>
  );
}

Live.propTypes = {
  activeBird: PropTypes.string.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  data: PropTypes.array.isRequired
};

Live.defaultProps = {
};

export default Live;
