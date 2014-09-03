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

                rFactory.getArray({collection: 'house21', action: 'find', expression: JSON.stringify({
                        AOGUID: attr.aoguid, ENDDATE: { $gt: todayString }}), limit: 1000, sort: {'HOUSENUM': 1}},
                    function (res) {
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
                rFactory.getArray({collection: 'addrobj', action: 'find', expression: {"PARENTGUID": attr.aoguid},
                    limit: 1000, sort: {'SHORTNAME': 1, 'FORMALNAME': 1}}, function (res) {
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
    .directive("map", function ($compile) {
        return {
            restrict: "E",
            templateUrl: "views/templates/map.html",
            link: function ($scope, element) {

                require([
                    "esri/map",
                    "esri/config",
                    "esri/dijit/HomeButton",
                    'esri/layers/ArcGISDynamicMapServiceLayer',
                    'esri/tasks/IdentifyTask',
                    'esri/tasks/IdentifyParameters',
                    "agsjs/layers/GoogleMapsLayer",
                    "esri/layers/FeatureLayer",
                    "esri/tasks/GeometryService",
                    "dojo/domReady!"
                ], function (Map, Config, HomeButton, ArcGISDynamicMapServiceLayer, IdentifyTask, IdentifyParameters, GoogleMapsLayer, FeatureLayer, GeometryService) {


                    Config.defaults.io.proxyUrl = "http://sdi.cap.ru/geoworks/proxy/proxy.ashx";
                    var map = new Map("map", {
                        // center: [47.076416, 55.465329], // Чувашия
                        // zoom: 8,
                        center: [-83.244, 42.581],
                        zoom: 15,
                        logo: false,
                        geometryService: new GeometryService("http://sdi.cap.ru/ArcGIS/rest/services/Geometry/GeometryServer"),
                        basemap: "streets"
                    });

                    /* var googleLayer;
                     googleLayer = new GoogleMapsLayer({
                     apiOptions: {
                     libraries: 'weather,panoramio'
                     },
                     mapOptions: {  // options passed to google.maps.Map contrustor
                     streetViewControl: false // whether to display street view control. Default is true.
                     }
                     });
                     map.addLayer(googleLayer);
                     googleLayer.setMapTypeId(agsjs.layers.GoogleMapsLayer.MAP_TYPE_HYBRID);*/

                    var home = new HomeButton({
                        map: map
                    }, "HomeButton");
                    home.startup();
                    var editLayerPlsUrl = "http://sdi.cap.ru/arcgis/rest/services/GeoWorks/gwannopts";
                    var plsLr = new ArcGISDynamicMapServiceLayer(editLayerPlsUrl + '/MapServer');
                    map.addLayer(plsLr);
                    $scope.findObjs = [];
                    map.on('click', function (e) {
                        var task = new IdentifyTask(editLayerPlsUrl + "/MapServer");
                        var params = new IdentifyParameters();
                        params.tolerance = 2;
                        params.returnGeometry = true;
                        params.mapExtent = map.extent;
                        //params.layerIds = item.view.mapLayer.visibleLayers;
                        params.geometry = e.mapPoint;
                        params.layerOption = IdentifyParameters.LAYER_OPTION_VISIBLE;
                        task.execute(params, function (res) {
                            if (res.length > 0) {
                                if (element[0].children[1]) {
                                    element[0].children[1].remove();
                                }
                                $scope.$apply();
                                element.append('<editor objectid="' + res[0].feature.attributes.OBJECTID + '"/>');
                                $compile(element.contents())($scope);
                            }
                        });
                    });
                });
            }
        }
    })
    .directive("editor", function () {
        return {
            restrict: "E",
            templateUrl: "views/templates/editor.html",
            link: function ($scope, element, attr) {
                require([
                    "esri/layers/FeatureLayer",
                    "esri/tasks/query",
                    "esri/graphic"
                ], function (FeatureLayer, Query, Graphic) {
                    $scope.featureLayer = new FeatureLayer('http://sdi.cap.ru/arcgis/rest/services/GeoWorks/gwannopts/' +
                        'FeatureServer/0', {
                        outFields: ["*"]
                    });

                    var query = new Query();
                    $scope.newAttrs = {};

                    query.objectIds = [attr.objectid];
                    $scope.feature = {};
                    $scope.featureLayer.queryFeatures(query, function (featureSet) {
                        if (featureSet.features.length > 0) {
                            $scope.fields = $scope.featureLayer.fields;
                            $scope.feature = featureSet.features[0];
                            $scope.newAttrs = angular.copy($scope.feature.attributes);
                            $scope.$apply();
                        } else {
                            $scope.message = "Объект не найден.";
                        }
                    });

                    $scope.getAlias = function (att) {
                        var alias = att;
                        var tt = _.where($scope.alias, {name: att});
                        if (tt.length > 0) {
                            alias = tt[0].alias;
                        }
                        return alias;
                    };

                    $scope.applyEdits = function () {
                        $scope.feature.attributes = $scope.newAttrs;

                        var graph = new Graphic(null, null, $scope.feature.attributes, null);
                        $scope.featureLayer.applyEdits([], [graph], [],
                            function (adds, upds, dels) {
                                if (upds[0].success) {
                                    $scope.close();
                                } else {
                                    console.log('error:', upds[0].error);
                                }
                            }, function (err) {
                                if (err.message === "Cannot read property 'attributes' of undefined") {
                                    //будем считать что данныые сохранены.
                                    $scope.close();
                                }
                            }
                        );
                    };
                    $scope.reset = function () {
                        $scope.newAttrs = angular.copy($scope.feature.attributes);
                    };
                    $scope.close = function () {
                        element.remove();
                    };

                    $scope.equalsCheck = function () {
                        return angular.equals($scope.newAttrs, $scope.feature.attributes);
                    }
                });
            }
        }
    })
    .directive("editorField", function ($compile) {
        return {
            restrict: "E",
            templateUrl: "views/templates/editor_field.html",
            link: function ($scope, element, attr) {
                var template = "";
                if ($scope.field.domain) {
                    if ($scope.field.domain.type === "codedValue") {
                        template = '<select ng-model="newAttrs[field.name]" ng-options="codeValue.code as ' +
                            'codeValue.name for codeValue in field.domain.codedValues" ng-disabled="!field.editable"/>';
                    }
                } else {
                    var ngMaxLength = 10;
                     if ($scope.field.length) {
                     ngMaxLength = $scope.field.length;
                     }
                    var opts = "";
                    if (!$scope.field.editable) {
                        opts = 'ng-disabled="!field.editable" ';
                    } else {
                        if (!$scope.field.nullable) {
                            opts += " required ";
                        }
                        opts += ' ng-maxlength="' + ngMaxLength + '" ';
                    }

                    template = '<input type="text" ng-model="newAttrs[field.name]" name="' + $scope.field.name + '"' +
                        opts + '"/>' +
                        '<span ng-show="attrForm.' + $scope.field.name + '.$error.required">Обязательное поле для заполнения</span>' +
                        '<div class="error" ng-show="attrForm.' + $scope.field.name + '.$error.maxlength">' +
                        'Слишком длинное значение! (макс. кол-во символов:' + ngMaxLength + ')</div><br><div ng-show="attrForm..$invalid">err</div>';
                }


                element.append(template);
                $compile(element.contents())($scope);
            }
        }
    })
    .filter('fieldsFilter', function () {
        return function (items, cond) {
            var filtered = {};
            if (items != undefined) {
                angular.forEach(items, function (val, key) {
                    var t = _.indexOf(cond, key);
                    if (t === -1) {
                        filtered[key] = val;
                    }
                });
                return filtered;
            } else {
                return items;
            }
        }
    });
