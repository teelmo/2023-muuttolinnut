import React, {
  useState, /* useEffect,  useCallback, useMemo */
} from 'react';
import '../styles/styles.less';

// Load components.
import Live from './components/Live.jsx';
import Routes from './components/Routes.jsx';
import Bird from './components/Bird.jsx';

// Load helpers.
// import formatNr from './helpers/FormatNr.js';
// import roundNr from './helpers/RoundNr.js';

function App() {
  // Data states.
  const [activeTab, setActiveTab] = useState('tab1');
  const [activeBird, setActiveBird] = useState('1');

  const changeTab = (event, tab) => {
    document.querySelectorAll('.tab').forEach(tab_el => tab_el.classList.remove('tab_selected'));
    document.querySelector(`.${tab}`).classList.add('tab_selected');
    setActiveTab(tab);
  };
  const changeBird = (event, bird) => {
    document.querySelectorAll('.bird_selection li img').forEach(img => img.classList.remove('selected'));
    event.currentTarget.querySelector('img').classList.add('selected');
    setActiveBird(bird);
  };

  return (
    <div className="app">
      <div className="container">
        <ul className="bird_selection">
          <li className="title">Valitse lintu</li>
          <li>
            <button type="button" onClick={(event) => changeBird(event, '1')}>
              <img src="https://dummyimage.com/100x1:1/f1f1f1/000&text=&nbsp;" alt="Kuvausteksti" className="selected" />
              <div className="bird_name">Lintu 1</div>
            </button>
          </li>
          <li>
            <button type="button" onClick={(event) => changeBird(event, '2')}>
              <img src="https://dummyimage.com/100x1:1/f1f1f1/000&text=&nbsp;" alt="Kuvausteksti" />
              <div className="bird_name">Lintu 2</div>
            </button>

          </li>
        </ul>
        <ul className="tabs_container">
          <li className="tab tab1 tab_selected"><button type="button" onClick={(event) => changeTab(event, 'tab1')}>Live</button></li>
          <li className="tab tab2"><button type="button" onClick={(event) => changeTab(event, 'tab2')}>Reitit</button></li>
          <li className="tab tab3"><button type="button" onClick={(event) => changeTab(event, 'tab3')}>Lintu</button></li>
          <li className="tab tab4"><button type="button" onClick={(event) => changeTab(event, 'tab4')}>Chat</button></li>
        </ul>
        <div className="content">
          {activeTab === 'tab1' && <Live activeBird={activeBird} />}
          {activeTab === 'tab2' && <Routes activeBird={activeBird} />}
          {activeTab === 'tab3' && <Bird activeBird={activeBird} />}
        </div>
      </div>
      <noscript>Your browser does not support JavaScript!</noscript>
    </div>
  );
}

export default App;
