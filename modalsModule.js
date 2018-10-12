var modalsModule = (function () {
    var modal = document.getElementById('modal');
    var modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    var modalHeader = document.createElement('h4');
    modalContent.append(modalHeader);
    modal.append(modalContent);
    var collection = document.createElement('ul');
    collection.className = 'collection';
    modal.append(collection);
    var instance = M.Modal.init(modal);

    instance.options.onCloseStart = function () {
        collection.innerText = '';
    }
    return {
        setHeaderPointsInCluster: function (numberOfPointsInCluster) {
            modalHeader.innerText = `Cluster has: ${numberOfPointsInCluster} features`;
        },
        setFeatures: function (aFeatures) {
            aFeatures.reduce((prev, curr) => {
                let ul = document.createElement("ul");
                ul.className = 'collection-item';
                ul.innerText = `${curr.type} - ${curr.properties.id}`;
                return collection.append(ul)
            }, collection);
        },
        showModal: function () {
            instance.open();
        }
    };
})();