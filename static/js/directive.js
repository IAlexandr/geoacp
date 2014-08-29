angular.module('ngFias')
    .constant('aolevels', {
        "1": "Уровень региона",
        "2": "Уровень автономного округа",
        "3": "Уровень района",
        "4": "Уровень города",
        "5": "Уровень внутригородской территории",
        "6": "Уровень населенного пункта",
        "7": "Уровень улицы",
        "90": "Уровень дополнительных территорий",
        "91": "Уровень подчиненных дополнительным территориям объектов"
    })
    .directive('house', function (rFactory) {
        return {
            restrict: "E",
            scope: {},
            templateUrl: "views/templates/house.html",
            link: function ($scope, element, attr) {
                var todayString = (new Date()).toISOString().slice(0, 10);

                rFactory.getArray({collection: 'house21', action: 'find', expression: JSON.stringify({AOGUID: attr.aoguid, ENDDATE: { $gt: todayString }}), limit: 1000, sort: {'HOUSENUM': 1}}, function (res) {
                    $scope.houses = res;

                    if ($scope.houses.length == 0) {
                        $scope.message = 'Дома не найдены.';
                    } else {
                        $scope.message = 'Дом:';
                        var fMatcher = function (objs) {
                            return function findMatches(q, cb) {
                                var matches, substrRegex;
                                matches = [];
                                substrRegex = new RegExp(q, 'i');
                                $.each(objs, function (i, obj) {
                                    if (substrRegex.test(obj.HOUSENUM)) {
                                        // the typeahead jQuery plugin expects suggestions to a
                                        // JavaScript object, refer to typeahead docs for more info
                                        matches.push(obj);
                                    }
                                });
                                cb(matches);
                            }
                        };
                        $('#' + $scope.$id).typeahead({
                                hint: true,
                                highlight: true,
                                minLength: 0
                            },
                            {
                                name: 'houses',
                                displayKey: 'HOUSENUM',
                                source: fMatcher($scope.houses)
                            });
                        $('#' + $scope.$id).on('typeahead:selected', function (evt, data) {
                            $scope.house = data;
                            $scope.$apply();
                        });
                    }
                });
            }
        }
    })
    .directive("tree", function (rFactory, $compile, aolevels) {
        return {
            restrict: "E",
            scope: {},
            templateUrl: "views/templates/tree.html",
            link: function ($scope, element, attr) {
                rFactory.getArray({collection: 'addrobj', action: 'find', expression: {"PARENTGUID": attr.aoguid}, limit: 1000, sort: {'SHORTNAME': 1, 'FORMALNAME': 1}}, function (res) {
                    $scope.objs = res;

                    if ($scope.objs.length == 0) {
                        element.append("<house aoguid='" + attr.aoguid + "'/>");
                        $compile(element.contents())($scope);
                    }

                    var argArr = [
                        {
                            hint: true,
                            highlight: true,
                            minLength: 0
                        }
                    ];

                    var fMatcherGroupByAOLEVEL = function (objs, lvl) {
                        return function findMatches(q, cb) {
                            var matches, substrRegex;
                            matches = [];
                            substrRegex = new RegExp(q, 'i');
                            $.each(objs, function (i, obj) {
                                if (substrRegex.test(obj.FORMALNAME)) {
                                    // the typeahead jQuery plugin expects suggestions to a
                                    // JavaScript object, refer to typeahead docs for more info
                                    if (obj.AOLEVEL === lvl) {
                                        matches.push(obj);
                                    }

                                }
                            });
                            cb(matches);
                        }
                    };

                    var createDataSet = function (objs, lvl) {
                        argArr.push({
                            name: 'lvl' + lvl,
                            displayKey: function (obj) {
                                return obj.FORMALNAME + ' ' + obj.SHORTNAME;
                            },
                            source: fMatcherGroupByAOLEVEL($scope.objs, lvl),
                            templates: {
                                header: '<h4 class="level-name">' + aolevels[lvl] + "</h4>",
                                suggestion: function (obj) {
                                    return obj.FORMALNAME + ' <span class="addrobj_shortname">' +
                                        obj.SHORTNAME + '</span>';
                                }
                            }
                        });
                    };

                    var existsLvls = _.pluck($scope.objs, 'AOLEVEL');
                    var uniqLvls = _.uniq(existsLvls);

                    angular.forEach(aolevels, function (val, key) {
                        if (_.contains(uniqLvls, key)) {
                            createDataSet($scope.objs, key);
                        }
                    });

                    var typeaheadElem = angular.element(element[0].children[0].children[1]);

                    typeaheadElem.typeahead.apply(typeaheadElem, argArr);

                    typeaheadElem.on('typeahead:selected', function (evt, data) {
                        //todo удалять дочерний typeahead
                        if (element[0].children[1]) {
                            element[0].children[1].remove();
                        }
                        element.append("<tree aoguid='" + data.AOGUID + "'/>");
                        $compile(element.contents())($scope);
                    });
                });

            }
        };
    })
    .directive("map", function () {
        return {
            restrict: "E",
            scope: {},
            templateUrl: "views/templates/map.html",
            link: function ($scope, element, attr) {
                $scope.message = 'map';

                require([
                    "esri/map",
                    "esri/dijit/HomeButton",
                    'esri/layers/ArcGISDynamicMapServiceLayer',
                    'esri/tasks/IdentifyTask',
                    'esri/tasks/IdentifyParameters',
                    "dojo/domReady!"
                ], function(
                    Map,
                    HomeButton,
                    ArcGISDynamicMapServiceLayer,
                    IdentifyTask,
                    IdentifyParameters
                    )  {

                    var map = new Map("map", {
                        center: [47.076416, 55.465329],
                        zoom: 8,
                        basemap: "streets"
                    });

                    var home = new HomeButton({
                        map: map
                    }, "HomeButton");
                    home.startup();

                    var lr = new ArcGISDynamicMapServiceLayer('http://si-sdiis/arcgis/rest/services/ai/acp_ulic_doma_granic_np/MapServer');
                    map.addLayer(lr);

                    map.on('click', function (e) {
                        var task = new IdentifyTask('http://si-sdiis/arcgis/rest/services/ai/acp_ulic_doma_granic_np/MapServer');
                        var params = new IdentifyParameters();
                        params.tolerance = 2;
                        params.returnGeometry = true;
                        params.mapExtent = map.extent;
                        //params.layerIds = item.view.mapLayer.visibleLayers;
                        params.geometry = e.mapPoint;
                        params.layerOption = IdentifyParameters.LAYER_OPTION_VISIBLE;
                        task.execute(params, function (res) {
                            if (res.length > 0) {
                                console.log(res.length);
                            }
                        });
                    })
                });
            }
        }
    });
