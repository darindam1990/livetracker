/**
 * This class is responsible for DOM access/manipulation
 */

const DOM = (function () {
    let instance;

    createInstance = () => {
        const obj = new Object();

        obj.getMapEl = () => document.getElementById('map');

        obj.getRemainingCounterEl = () => document.getElementById('remainingOrdersCounter');

        obj.getDeliveredCounterEl = () => document.getElementById('deliveredOrdersCounter');

        obj.updateRemainingCounter = (count) => {
            const el = obj.getRemainingCounterEl();
            if (el) {
                el.innerHTML = count;
            }
        };

        obj.updateDeliveredCounter = (count) => {
            const el = obj.getDeliveredCounterEl();
            if (el) {
                el.innerHTML = count;
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

DOM.getInstance();

document.addEventListener('DOMContentLoaded', (event) => {
    if (DOM.getInstance().getMapEl('map')) {
        MapEl.getInstance().initMap();
        MapEl.getInstance().addMarker();
    }
});

