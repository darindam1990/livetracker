/**
 * This class is responsible for all things 'map'.
 */

const MapEl = (function () {
    let instance;
    let _map;

    const accessToken = 'pk.eyJ1IjoiYWRhczE5OTAiLCJhIjoiY2puNWhtOTg2MDR4cTNxcGpvZTZra3gzYiJ9.aUR46GSSwIPqwkfcG9EfOw';
    const facilityCoords = [-118.461536, 34.009392]; // hardcoded for simplicity
    const apiPrefix = 'https://api.mapbox.com/geocoding/v5/mapbox.places/';

    createInstance = () => {
        const obj = new Object();

        obj.getDestinationLngLat = (order) => {
            const address = order.destination;
            const proximity = '-118.2437,34.0522';
            const url = `${apiPrefix}${address}.json?types=address&limit=1&proximity=${proximity}&access_token=${accessToken}`;
            fetch(url)
                .then((results) => results.json())
                .then((results) => {
                    // This check ensures with the proximity bias enforced above,
                    // we bail out when MapBox returns an empty result set.
                    // We should ideally retry with a lax filter or sanitize addresses
                    if (results && results.features && results.features.length > 0) {
                        const destCoords = results.features[0].geometry.coordinates;
                        MapEl.getInstance().addMarker(destCoords);
                        MapEl.getInstance().drawRoute(order.id, order, destCoords);
                    }
                });
        };

        obj.initMap = () => {
            mapboxgl.accessToken = accessToken;
            _map = new mapboxgl.Map({
                container: 'map',
                style: 'mapbox://styles/mapbox/dark-v9',
                center: facilityCoords,
                zoom: 11
            });
        };

        obj.getMapRef = () => _map;

        obj.addMarker = (coords = facilityCoords) => {
            var el = document.createElement('div');
            el.className = 'marker';

            if (coords === facilityCoords) {
                // mark facility differently
                el.className += ' facility';
            }

            const marker = new mapboxgl.Marker(el);
            marker.setLngLat(coords);
            marker.addTo(_map);
        };

        obj.drawRoute = (id, order, destCoords) => {

            const getRouteUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${facilityCoords.join(',')};${destCoords.join(',')}.json?access_token=${accessToken}&overview=full&geometries=geojson`;
            fetch(getRouteUrl)
                .then((results) => results.json())
                .then((results) => {
                    if (results.routes && Array.isArray(results.routes) && results.routes.length) {
                        const steps = results.routes[0].geometry.coordinates;
                        const route = {
                            'type': 'FeatureCollection',
                            'features': [{
                                'type': 'Feature',
                                'geometry': {
                                    'type': 'LineString',
                                    'coordinates': [
                                        facilityCoords,
                                        destCoords
                                    ]
                                }
                            }]
                        };

                        const point = {
                            'type': 'FeatureCollection',
                            'features': [{
                                'type': 'Feature',
                                'properties': {},
                                'geometry': {
                                    'type': 'Point',
                                    'coordinates': facilityCoords
                                }
                            }]
                        };

                        route.features[0].geometry.coordinates = steps;
                        _map.addSource(`route-${id}`, {
                            'type': 'geojson',
                            'data': route
                        });

                        _map.addLayer({
                            'id': `route-${id}`,
                            'source': `route-${id}`,
                            'type': 'line',
                            'paint': {
                                'line-width': 1,
                                'line-color': '#007cbf'
                            }
                        });

                        _map.addSource(`delivery-${id}`, {
                            "type": "geojson",
                            "data": point
                        });

                        _map.addLayer({
                            'id': `delivery-${id}`,
                            'source': `delivery-${id}`,
                            'type': 'symbol',
                            'layout': {
                                'icon-image': 'car-15',
                                'icon-rotate': ['get', 'bearing'],
                                'icon-rotation-alignment': 'map',
                                'icon-allow-overlap': false,
                                'icon-ignore-placement': true
                            }
                        });

                        const popup = new mapboxgl.Popup({
                            closeOnClick: false,
                            closeButton: false,
                            className: 'order-popup'
                        });
                        popup.setHTML(`<span>${order.name}</span>`);
                        popup.addTo(_map);

                        const interval = results.routes[0].duration / results.routes[0].geometry.coordinates.length;
                        MapEl
                            .getInstance()
                            .animate(
                                id,
                                popup,
                                point,
                                route.features[0].geometry.coordinates,
                                `delivery-${id}`,
                                interval * 1000
                            );

                    }
                });
        };

        obj.animate = (
            orderId,
            popup,
            point,
            steps,
            deliveryPtId,
            interval,
            counter = 0,
            timerId = null
        ) => {

            if (timerId) { clearTimeout(timerId); }

            if (counter === steps.length) {
                Data.getInstance().addToDeliveredQueue(orderId);
                DOM.getInstance().updateDeliveredCounter(Data.getInstance().getDeliveredCount());
            } else {
                point.features[0].geometry.coordinates = steps[counter];
                if (deliveryPtId) {
                    _map.getSource(deliveryPtId).setData(point);
                }
                popup.setLngLat(steps[counter]);
                const timerId = setTimeout(() => MapEl.getInstance().animate(
                    orderId,
                    popup,
                    point,
                    steps,
                    deliveryPtId,
                    interval,
                    counter + 1,
                    timerId
                ), interval);
            }
        }
        return obj;
    };

    return {
        getInstance: () => {
            if (typeof instance === 'undefined') {
                instance = createInstance();
            }
            return instance;
        }
    };
})();

MapEl.getInstance();

