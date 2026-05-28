import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './map.css'



export default function Map({ onSelectedBattleClick, onSelectedClusterClick, yearRange }) {
  const fullData = useRef(null);
  const mapContainer = useRef(null);
  const map = useRef(null);
  const lng = 0.0;
  const lat = 50;
  const zoom = 6;
  const API_KEY = import.meta.env.MAPTILER_KEY

  const mapLoaded = useRef(false);

  // Load full dataset into memory once
  useEffect(() => {
    fetch('/battles.geojson')
      .then(r => r.json())
      .then(data => {
        fullData.current = data;
        // If map already loaded by the time data arrives, set it immediately
        if (mapLoaded.current) {
          applyFilter(data, yearRange);
        }
      });
  }, []);

  // Initialize map once
  useEffect(() => {
    if (map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${API_KEY}`,
      center: [lng, lat],
      zoom: zoom
    });

    map.current.on('load', () => {
      map.current.addSource('battlemarker-data', {
        'type': 'geojson',
        'data': { type: 'FeatureCollection', features: [] },
        'cluster': true,
        'clusterMaxZoom': 30,
        'clusterRadius': 15,
      });

      map.current.addLayer({
        'id': 'clusters',
        'type': 'circle',
        'source': 'battlemarker-data',
        'filter': ['has', 'point_count'],
        'paint': {
          'circle-color': '#ff4d4d',
          'circle-radius': [
            'step', ['get', 'point_count'],
            15,
            10, 20,
            50, 25
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#000000',
          'circle-opacity': 0.85
        }
      });

      map.current.addLayer({
        'id': 'cluster-count',
        'type': 'symbol',
        'source': 'battlemarker-data',
        'filter': ['has', 'point_count'],
        'layout': {
          'text-field': '{point_count_abbreviated}',
          'text-size': 12,
          'text-font': ['Open Sans Bold']
        },
        'paint': {
          'text-color': '#ffffff'
        }
      });

      map.current.addLayer({
        'id': 'battlemarkers',
        'source': 'battlemarker-data',
        'type': 'circle',
        'filter': ['!', ['has', 'point_count']],
        'paint': {
          'circle-color': [
            'case',
            ['in', 'naval_battle', ['get', 'types']], '#2E5A88',
            ['in', 'siege', ['get', 'types']], '#707070',
            ['in', 'battle', ['get', 'types']], '#9AF764',
            '#ff4d4d'
          ],
          'circle-stroke-width': 2,
          'circle-radius': 6,
          'circle-stroke-color': '#000000',
          'circle-opacity': 1.0
        }
      });

      map.current.on('click', 'clusters', async (e) => {
        const features = map.current.queryRenderedFeatures(e.point, { layers: ['clusters'] });
        const clusterId = features[0].properties.cluster_id;
        const source = map.current.getSource('battlemarker-data');
        try {
          const leaves = await source.getClusterLeaves(clusterId, Infinity, 0);
          const battles = leaves.map(f => f.properties);
          onSelectedClusterClick(battles);
        } catch (err) {
          console.log("getClusterLeaves error:", err);
        }
      });

      mapLoaded.current = true;
      // If data already fetched by the time map loads, set it immediately
      if (fullData.current) {
        applyFilter(fullData.current, yearRange);
      }

      map.current.on('click', 'battlemarkers', (e) => onSelectedBattleClick(e.features[0].properties));

      map.current.on('mouseenter', 'clusters', () => map.current.getCanvas().style.cursor = 'pointer');
      map.current.on('mouseleave', 'clusters', () => map.current.getCanvas().style.cursor = '');
      map.current.on('mouseenter', 'battlemarkers', () => map.current.getCanvas().style.cursor = 'pointer');
      map.current.on('mouseleave', 'battlemarkers', () => map.current.getCanvas().style.cursor = '');
    });
  }, [API_KEY, lng, lat, zoom]);

  // Filter source data whenever yearRange changes
  useEffect(() => {
    if (!map.current || !fullData.current || !mapLoaded.current) return;
    applyFilter(fullData.current, yearRange);
  }, [yearRange]);

  const applyFilter = (data, range) => {
    const source = map.current?.getSource('battlemarker-data');
    if (!source) return;
    const [start, end] = range;
    source.setData({
      ...data,
      features: data.features.filter(f => {
        const year = f.properties.year;
        if (year === null) return false;
        return year >= start && year <= end;
      })
    });
  };

  return (
    <div className="map-wrap">
      <div ref={mapContainer} className="map" />
    </div>
  );
}