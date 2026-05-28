import React from 'react';
import './sidebar.css';

function parseDate(dateStr) {
  if (!dateStr) return Infinity;
  const year = parseInt(dateStr.match(/\d{3,4}/)?.[0]);
  return isNaN(year) ? Infinity : year;
}

function BattleView({ battle, onBack, onClose, showBack }) {
  const types = typeof battle.types === 'string'
    ? JSON.parse(battle.types)
    : battle.types ?? [];

  const title = decodeURIComponent(battle.title ?? '').replace(/_/g, ' ');

  return (
    <>
      <div className='sidebar-toolbar'>
        {showBack && <button onClick={onBack}>← Back</button>}
        <button onClick={onClose}>✕</button>
      </div>
      <div className='sidebar-header'>
        <h1>{title}</h1>
        <div className='type-tags'>
          {types.map(t => <span key={t} className={`tag tag-${t}`}>{t.replace('_', ' ')}</span>)}
        </div>
      </div>
      <hr />
      <div className='sidebar-content'>
        <p><strong>Date:</strong> {battle.date ?? 'Unknown'}</p>
        <hr />
        {battle.wikipedia_url && (
          <a href={battle.wikipedia_url} target='_blank' rel='noreferrer'>
            Wikipedia →
          </a>
        )}
      </div>
    </>
  );
}

function ClusterView({ battles, onBattleSelect, onClose }) {
  const sorted = [...battles].sort((a, b) => parseDate(a.date) - parseDate(b.date));

  return (
    <>
      <div className='sidebar-toolbar'>
        <span>{battles.length} Battles</span>
        <button onClick={onClose}>✕</button>
      </div>
      <div className='sidebar-header'>
        <h1>Battles at this location</h1>
      </div>
      <hr />
      <ul className='battle-list'>
        {sorted.map((battle, i) => {
          const title = decodeURIComponent(battle.title ?? '').replace(/_/g, ' ');
          return (
            <li key={i} onClick={() => onBattleSelect(battle)} className='battle-list-item'>
              <span className='battle-list-title'>{title}</span>
              <span className='battle-list-date'>{battle.date ?? 'Unknown'}</span>
            </li>
          );
        })}
      </ul>
    </>
  );
}

export default function Sidebar({ state, onBattleSelect, onClose }) {
  if (!state) return null;

  return (
    <div className='sidebar'>
      {state.mode === 'battle' && (
        <BattleView
          battle={state.battle}
          showBack={state.fromCluster}
          onBack={() => onBattleSelect(null)} 
          onClose={onClose}
        />
      )}
      {state.mode === 'cluster' && (
        <ClusterView
          battles={state.battles}
          onBattleSelect={(battle) => onBattleSelect({ ...battle, fromCluster: true })}
          onClose={onClose}
        />
      )}
    </div>
  );
}