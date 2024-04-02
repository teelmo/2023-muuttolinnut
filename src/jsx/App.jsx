import React, {
  useState, useEffect, /* useCallback, useMemo */
} from 'react';
import '../styles/styles.less';

// Load components.
import Live from './components/Live.jsx';
import Routes from './components/Routes.jsx';
import Bird from './components/Bird.jsx';

function App() {
  // Data states.
  const [activeTab, setActiveTab] = useState('tab1');
  const [activeBird, setActiveBird] = useState('1');
  const [data, setData] = useState(false);

  const fetchExternalData = () => {
    const baseURL = (window.location.href.includes('yle')) ? 'https://lusi-dataviz.ylestatic.fi/2023-muuttolinnut/' : './';
    const dataURL = (window.location.href.includes('yle')) ? 'https://lusi-dataviz.ylestatic.fi/2023_lintureitti/js/vesku_aws_2024.json' : `${baseURL}assets/data/partial_route.json`;
    let values;
    try {
      values = Promise.all([
        fetch(`${baseURL}assets/data/info.json`),
        // fetch(`${baseURL}assets/data/route.json`)
        // fetch(`${baseURL}assets/data/partial_route.json`)
        fetch(`${dataURL}`)
      ]).then(results => Promise.all(results.map(result => result.json())));
    } catch (error) {
      console.error(error);
    }
    return values;
  };

  useEffect(() => {
    setActiveBird('Vesku');
    fetchExternalData().then(result => {
      setData(result);
    }).catch(console.error);
  }, []);

  const changeTab = (event, tab) => {
    document.querySelectorAll('.tab').forEach(tab_el => tab_el.classList.remove('tab_selected'));
    document.querySelector(`.${tab}`).classList.add('tab_selected');
    setActiveTab(tab);
  };

  return (
    <div className="app">
      <div className="container">
        <ul className="tabs_container">
          <li className="tab tab1 tab_selected"><button type="button" onClick={(event) => changeTab(event, 'tab1')}>Live</button></li>
          <li className="tab tab2"><button type="button" onClick={(event) => changeTab(event, 'tab2')}>Kartta</button></li>
          <li className="tab tab3"><button type="button" onClick={(event) => changeTab(event, 'tab3')}>Kuka on Vesku</button></li>
          {/* <li className="tab tab4"><button type="button" onClick={(event) => changeTab(event, 'tab4')}>Chat</button></li> */}
        </ul>
        <div className="content">
          {(activeTab === 'tab1' && data) && <Live data={data} activeBird={activeBird} />}
          {activeTab === 'tab2' && <Routes activeBird={activeBird} />}
          {activeTab === 'tab3' && <Bird activeBird={activeBird} />}
        </div>
      </div>
      <noscript>Your browser does not support JavaScript!</noscript>
    </div>
  );
}

export default App;
