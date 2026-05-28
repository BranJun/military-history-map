import React from 'react';
import './modal.css';

const LEGEND = [
  { color: '#9AF764', label: 'Battle' },
  { color: '#2E5A88', label: 'Naval Battle' },
  { color: '#707070', label: 'Siege' },
  { color: '#ff4d4d', label: 'Multiple Battles' },
];

export default function WelcomeModal({ onClose }) {
  return (
    <div className='modal-overlay'>
      <div className='modal'>
        <h1 className='modal-title'>Military Engagements Atlas</h1>
        <p className='modal-description'>
          An interactive map of over 10,000 military conflicts spanning from antiquity
          to the present day. Data sourced from Wikidata and Wikipedia, covering battles,
          naval engagements, and sieges across the globe.
        </p>
        <hr className='modal-divider' />
        <div className='modal-legend'>
          {LEGEND.map(({ color, label }) => (
            <div key={label} className='modal-legend-item'>
              <span className='modal-legend-dot' style={{ background: color }} />
              <span className='modal-legend-label'>{label}</span>
            </div>
          ))}
        </div>
        <hr className='modal-divider' />
        <p className='modal-attribution'>
          Map data © <a href='https://www.maptiler.com/' target='_blank' rel='noreferrer'>MapTiler</a>
          {' · '}
          Battle data © <a href='https://www.wikidata.org/' target='_blank' rel='noreferrer'>Wikidata</a>
          {' · '}
          Built with <a href='https://maplibre.org/' target='_blank' rel='noreferrer'>MapLibre GL JS</a>
        </p>
        <button className='modal-button' onClick={onClose}>
          Start Exploring →
        </button>
      </div>
    </div>
  );
}