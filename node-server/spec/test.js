const expect = chai.expect;

describe('Data', function () {
    describe('#processData()', function () {
        it('should set _dataMap and _dispatchQueue with correct values', function () {
            const fakeData = [{
                "id": "tHgCD7",
                "dispatchTime": 1,
                "name": "Chicken Nuggets",
                "destination": "80 Windward Ave, Venice, CA 90291"
            }, {
                "id": "jYbwMo",
                "dispatchTime": 1,
                "name": "Strawberries",
                "destination": "500 World Way Terminal 5, Los Angeles, CA 90045"
            }, {
                "id": "p4PYwE",
                "dispatchTime": 4,
                "name": "Pressed Juice",
                "destination": "12565 Washington Blvd, Los Angeles, CA 90066"
            }, {
                "id": "JzUxmX",
                "dispatchTime": 4,
                "name": "Onion Rings",
                "destination": "311 Washington Blvd, Marina Del Rey, CA 90292"
            }, {
                "id": "Zqotpo",
                "dispatchTime": 9,
                "name": "Pressed Juice",
                "destination": "12565 Washington Blvd, Los Angeles, CA 90066"
            }];
            const DataIns = Data.getInstance();
            DataIns.resetData();
            DataIns.processData(fakeData);

            expect(DataIns.getTotalOrdersCount()).to.equal(fakeData.length);
            expect(DataIns.getRemainingOrdersCount()).to.equal(fakeData.length);
        });
    });
    describe('#removeFromDispatchQ()', function () {
        it('should remove all orders with given dispatch time from _dispatchQueue', function () {

            const DataIns = Data.getInstance();
            const dispatchTime = 1;
            DataIns.removeFromDispatchQ(dispatchTime);

            expect(DataIns.getOrdersByTime(dispatchTime)).to.equal(undefined);
            expect(DataIns.getRemainingOrdersCount()).to.equal(3);
        });
    });
    describe('#addToDeliveredQueue()', function () {
        it('should add given order to _dispatchQueue', function () {

            const DataIns = Data.getInstance();
            const orderId = 'Zqotpo';
            DataIns.addToDeliveredQueue(orderId);

            expect(DataIns.getDeliveredCount()).to.equal(1);
            expect(DataIns.getLastDeliveredOrderId()).to.equal(orderId);
        });
    });
});

describe('Process', function () {
    describe('#processOrder()', function () {
        it('should keep _dispatchQueue ulaltered when no orderIds are passed', function () {

            const ProcessIns = Process.getInstance();
            const DataIns = Data.getInstance();

            const beforeRemainingCount = DataIns.getRemainingOrdersCount();

            ProcessIns.processOrder();
            ProcessIns.processOrder(undefined);

            const afterRemainingCount = DataIns.getRemainingOrdersCount();
            expect(beforeRemainingCount).to.equal(afterRemainingCount);

        });
    });

    describe('#processOrder()', function () {
        it('should update _dispatchQueue with passed order ids', function () {

            const ProcessIns = Process.getInstance();
            const DataIns = Data.getInstance();

            const beforeRemainingCount = DataIns.getRemainingOrdersCount();
            ProcessIns.processOrder(DataIns.getOrdersByTime(4), 4);

            const afterRemainingCount = DataIns.getRemainingOrdersCount();
            expect(beforeRemainingCount - afterRemainingCount).to.equal(2);

        });
    });
});

describe('DOM', function () {
    describe('#updateRemainingCounter()', function () {
        it('should update remainingOrdersCounter div content to the passed value', function () {

            const DOMIns = DOM.getInstance();
            DOMIns.updateRemainingCounter(2)

            const el = document.getElementById('remainingOrdersCounter');
            expect(Number(el.innerHTML)).to.equal(2);

        });
    });
    describe('#updateDeliveredCounter()', function () {
        it('should update deliveredOrdersCounter div content to the passed value', function () {

            const DOMIns = DOM.getInstance();
            DOMIns.updateDeliveredCounter(10)

            const el = document.getElementById('deliveredOrdersCounter');
            expect(Number(el.innerHTML)).to.equal(10);

        });
    });
});

describe('Map', function () {
    describe('#addMarker()', function () {
        it('should add a marker element to the DOM', function () {
            const MapIns = MapEl.getInstance();
            const beforeMarkerList = document.querySelectorAll('.marker');

            MapIns.addMarker([122, 22]);
            const afterMarkerList = document.querySelectorAll('.marker');

            expect(afterMarkerList.length - beforeMarkerList.length).to.equal(1);
        });

        it('should add a marker element with facility class name when no input is passed', function () {
            const MapIns = MapEl.getInstance();
            const beforeMarkerList = document.querySelectorAll('.marker.facility');

            MapIns.addMarker();
            const afterMarkerList = document.querySelectorAll('.marker.facility');

            expect(afterMarkerList.length - beforeMarkerList.length).to.equal(1);
        });
    });
    describe('#animate()', function () {
        this.timeout(4000);
        it('should update popup and marker lnglat to last step coordinates after interval', function (done) {
            const MapIns = MapEl.getInstance();
            const DataIns = Data.getInstance();
            const facilityCoords = [-118.461536, 34.009392];
            const order = DataIns.getOrderById('p4PYwE');
            const _map = MapIns.getMapRef();
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
            const popup = new mapboxgl.Popup({
                closeOnClick: false,
                closeButton: false,
                className: 'order-popup'
            });
            popup.setHTML(`<span>${order.name}</span>`);
            popup.addTo(_map);
            const steps = [
                [-118.461601, 34.009470],
                [-118.460213, 34.010271],
                [-118.458527, 34.011247],
                [-118.458188, 34.010843],
                [-118.457853, 34.010441],
                [-118.457494, 34.010020],
                [-118.457351, 34.009848]
            ];
            const interval = 300;

            MapIns.animate(
                order.id,
                popup,
                point,
                steps,
                null,
                interval
            );
            setTimeout(() => {
                const pointFinalCoords = point.features[0].geometry.coordinates;
                expect(pointFinalCoords).to.equal(steps.slice(-1)[0]);
                const {lng, lat} = popup.getLngLat();
                expect([lng, lat].join(',')).to.equal(steps.slice(-1)[0].join(','));
                done();
            }, interval * steps.length);
        });

        it('should add orderId to deliveredQueue', function (done) {
            const MapIns = MapEl.getInstance();
            const DataIns = Data.getInstance();
            const facilityCoords = [-118.461536, 34.009392];
            const order = DataIns.getOrderById('p4PYwE');
            const _map = MapIns.getMapRef();
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
            const popup = new mapboxgl.Popup({
                closeOnClick: false,
                closeButton: false,
                className: 'order-popup'
            });
            popup.setHTML(`<span>${order.name}</span>`);
            popup.addTo(_map);
            const steps = [
                [-118.461601, 34.009470],
                [-118.460213, 34.010271],
                [-118.458527, 34.011247],
                [-118.458188, 34.010843],
                [-118.457853, 34.010441],
                [-118.457494, 34.010020],
                [-118.457351, 34.009848]
            ];
            const interval = 300;
            const beforeDeliveredCount = DataIns.getDeliveredCount();
            MapIns.animate(
                order.id,
                popup,
                point,
                steps,
                null,
                interval
            );
            setTimeout(() => {
                const afterDeliveredCount = DataIns.getDeliveredCount();
                expect(afterDeliveredCount - beforeDeliveredCount).to.equal(1);
                expect(DataIns.getLastDeliveredOrderId()).to.equal(order.id);
                done();
            }, interval * steps.length);
        });
    });
});