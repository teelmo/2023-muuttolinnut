import React, { /* useState, */useEffect } from 'react';
import '../../styles/styles.less';

function BirdSelection() {
  const changeBird = (event, bird) => {
    document.querySelectorAll('.bird_selection li img').forEach(img => img.classList.remove('selected'));
    event.currentTarget.querySelector('img').classList.add('selected');
    setActiveBird(bird);
  };

  return (
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
  );
}

export default BirdSelection;
