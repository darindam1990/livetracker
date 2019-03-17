/**
 * This class processes incoming orders using a polling technique
 */

const Process = (function () {
    let instance;

    createInstance = () => {
        let timeSinceStart = 0;
        let timerId = null;
        const obj = new Object();

        obj.poll = () => {
            // we keep polling indefinitely
            timerId = window.setInterval(() => {
                timeSinceStart++;
                const orderIds = Data.getInstance().getOrdersByTime(timeSinceStart);
                Process.getInstance().processOrder(orderIds, timeSinceStart);
            }, 1000);
        };

        obj.processOrder = (orderIds, timeSinceStart) => {
            if (typeof orderIds !== 'undefined') {
                const orders = orderIds.map(id => Data.getInstance().getOrderById(id));

                for (const order of orders) {
                    MapEl.getInstance().getDestinationLngLat(order);
                }

                Data.getInstance().removeFromDispatchQ(timeSinceStart);
                DOM.getInstance().updateRemainingCounter(Data.getInstance().getRemainingOrdersCount());
            }
        };

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

Process.getInstance();