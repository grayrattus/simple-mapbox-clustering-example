var mapModule = (function () {
    var initialized = false;
    mapboxgl.accessToken = 'pk.eyJ1IjoibXl0b3Vyc2FwcCIsImEiOiJDRUVsckI0In0.-eKUxQLVBgTtyoyhxyFyYQ';

    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v9',
        center: [0, 51.5],
        zoom: 8
    });
    var mapColors = {
        "single-feature-color" : 'orange',
        "less-than-color" : '#51bbd6',
        "between-color" : '#f1f075',
        "more-than-color" : '#f28cb1'
    }

    var clustersLayer = {
        "id": "clusters",
        "type": "circle",
        "source": "points",
        filter: ["has", "point_count"],
        paint: {
            "circle-color": [
                "step",
                ["get", "point_count"],
                mapColors['less-than-color'],
                100,
                mapColors['between-color'],
                750,
                mapColors['more-than-color'],
            ],
            "circle-radius": [
                "step",
                ["get", "point_count"],
                25,
                100,
                35,
                750,
                40
            ]
        }
    };

    var pointsLayer = {
        id: "cluster-count",
        type: "symbol",
        source: "points",
        filter: ["has", "point_count"],

        layout: {
            "text-field": "{point_count_abbreviated}",
            "text-font": [
                "DIN Offc Pro Medium",
                "Arial Unicode MS Bold"
            ],
            "text-size": 12
        }

    }
    var unclusteredPointsLayer = {
        id: "unclustered-point",
        type: "circle",
        source: "points",
        filter: ["!", ["has", "point_count"]],
        paint: {
            "circle-color": "orange",
            "circle-radius": 20,
            "circle-stroke-width": 1,
            "circle-stroke-color": "#fff"
        }

    }

    return {
        initialize: function (sourceHref) {
            for (const colorId in mapColors) {
                document.getElementById(colorId).style = `background-color: ${mapColors[colorId]};`;
            }
            fetch(sourceHref)
                .then(response => response.json())
                .then(data => {
                    map.on('load', function () {
                        map.addSource('points', {
                            type: "geojson",
                            cluster: true,
                            clusterMaxZoom: 14,
                            clusterRadius: 50,
                            data: data
                        });

                        map.addLayer(clustersLayer);
                        map.addLayer(pointsLayer);
                        map.addLayer(unclusteredPointsLayer);

                        map.on('click', 'clusters', function (e) {
                            var features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
                            var clusterId = features[0].properties.cluster_id;
                            let cordinates = features[0].geometry.coordinates.slice();

                            let clusterSource = map.getSource('points');
                            let pointCount = features[0].properties.point_count;
                            modalsModule.setHeaderPointsInCluster(pointCount);

                            clusterSource.getClusterLeaves(clusterId, pointCount, 0, function (err, aFeatures) {
                                modalsModule.setFeatures(aFeatures);
                            })
                            modalsModule.showModal();
                        });
                        map.on('click', 'unclustered-point', function (e) {
                            const coordinates = e.features[0].geometry.coordinates.slice();
                            const properties = e.features[0].properties;

                            let popup = new mapboxgl.Popup().setLngLat(coordinates);
                            let propertiesSummarized = '';
                            for (const key in properties) {
                                propertiesSummarized+= `<p>${key} : ${properties[key]}</p>`;
                            }

                            popup.setHTML(propertiesSummarized).addTo(map);
                        });
                    });
                    initialized = true;
                });
        },
        update: function (sourceHref) {
            if (!initialized) {
                throw "mapModule was not initialized";
            }
            fetch(sourceHref)
                .then(response => response.json())
                .then(data => {
                    map.getSource('points').setData(data);
                });
        }
    };
})();