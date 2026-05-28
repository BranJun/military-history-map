import React, { useRef } from 'react';
import './timeline-slider.css';

const MIN_YEAR = -700;
const MAX_YEAR = 2024;

function yearToLabel(year) {
  if (year < 0) return `${Math.abs(year)} BC`;
  return `${year} AD`;
}

export default function TimelineSlider({ yearRange, onRangeChange }) {
  const trackRef = useRef(null);

  const [start, end] = yearRange;

  const toPercent = (year) => ((year - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 100;

  const handleStartChange = (e) => {
    const val = Math.min(Number(e.target.value), end - 1);
    onRangeChange([val, end]);
  };

  const handleEndChange = (e) => {
    const val = Math.max(Number(e.target.value), start + 1);
    onRangeChange([start, val]);
  };

  return (
    <div className='timeline-container'>
      <div className='timeline-labels'>
        <span>{yearToLabel(start)}</span>
        <span>{yearToLabel(end)}</span>
      </div>
      <div className='timeline-track' ref={trackRef}>
        {/* Highlighted range between thumbs */}
        <div
          className='timeline-range'
          style={{
            left: `${toPercent(start)}%`,
            width: `${toPercent(end) - toPercent(start)}%`
          }}
        />
        <input
          type='range'
          min={MIN_YEAR}
          max={MAX_YEAR}
          value={start}
          onChange={handleStartChange}
          className='timeline-thumb timeline-thumb-left'
        />
        <input
          type='range'
          min={MIN_YEAR}
          max={MAX_YEAR}
          value={end}
          onChange={handleEndChange}
          className='timeline-thumb timeline-thumb-right'
        />
      </div>
    </div>
  );
}