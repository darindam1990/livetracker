/**
 * This class maintains the state of the orders in system
 */

const Data = (function () {
    let instance;
    let _dataMap = {};
    let _dispatchQueue = {};
    const _deliveredQueue = [];

    createInstance = () => {
        const obj = new Object();

        obj.fetchData = () => {
            const url = 'data';
            fetch(url)
                .then((results) => results.json())
                .then((results) => {
                    Data.getInstance().processData(results);
                    Process.getInstance().poll();
                })
                .catch(err => {
                    console.error('There was a problem fetching data!');
                })
        };

        obj.processData = (data) => {
            // Used for quick testing
            // data = data.slice(0, 10);
            data.forEach(order => {
                const dispatchTime = order.dispatchTime;
                if (_dispatchQueue.hasOwnProperty(dispatchTime)) {
                    _dispatchQueue[dispatchTime] = _dispatchQueue[dispatchTime].concat(order.id);
                } else {
                    _dispatchQueue[dispatchTime] = [order.id];
                }
            });
            _dataMap = data.reduce((a, c) => {
                const id = c.id;
                a[id] = c;
                return a;
            }, _dataMap);
        };

        obj.getOrderById = (id) => _dataMap[id];

        obj.getOrdersByTime = (dispatchTime) => _dispatchQueue[dispatchTime];

        obj.removeFromDispatchQ = (dispatchTime) => delete _dispatchQueue[dispatchTime];

        obj.getRemainingOrdersCount = () => Object.values(_dispatchQueue).reduce((a, c) => a + c.length, 0);

        obj.getTotalOrdersCount = () => Object.keys(_dataMap).length;

        obj.addToDeliveredQueue = (orderId) => _deliveredQueue.push(orderId);

        obj.getDeliveredCount = () => _deliveredQueue.length;

        obj.getLastDeliveredOrderId = () => _deliveredQueue.slice(-1)[0];

        obj.resetData = () => {
            _dataMap = {};
            _dispatchQueue = {};
        };

        return obj;
    }

    return {
        getInstance: () => {
            if (typeof instance === 'undefined') {
                instance = createInstance();
            }
            return instance;
        }
    };
}());

Data.getInstance().fetchData();