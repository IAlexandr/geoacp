angular.module('ngFias')
    .directive('house', function (rFactory) {
        return {
            restrict: "E",
            scope: {},
            templateUrl: "views/templates/house.html",
            link: function ($scope, element, attr) {
                rFactory.getArray({collection: 'house21', action: 'find', expression: {AOGUID: attr.aoguid}, limit:1000}, function (res) {
                    if (res.length == 0) {
                        $scope.message = 'Дома не найдены.';
                    }
                    $scope.houses = res;
                });
            }
        }
    })
    .directive("tree", function (RecursionHelper, rFactory, $compile) {
        return {
            restrict: "E",
            scope: {},
            templateUrl: "views/templates/tree.html",
            link: function ($scope, element, attr) {
                $scope.spc = ". ";
                rFactory.getArray({collection: 'addrobj', action: 'find', expression: {"PARENTGUID": attr.aoguid}, limit: 1000}, function (res) {
                    $scope.objs = res;

                    if ($scope.objs.length == 0) {
                        $scope.message = 'Дом:';
                        element.append("<house aoguid='" + attr.aoguid + "'/>");
                        $compile(element.contents())($scope);
                    }
                });

                $scope.$watch("obj", function (o) {
                    if (o) {
                        if (element[0].children[1]) {
                            element[0].children[1].remove();
                        }
                        if ($scope.objs.length > 0) {
                            element.append("<tree aoguid='" + o.AOGUID + "'/>");
                            $compile(element.contents())($scope);
                        }
                    }
                });
            }/*,
             compile: function (element) {
             return RecursionHelper.compile(element, function (scope, iElement, iAttrs, controller, transcludeFn) {
             // Define your normal link function here.
             // Alternative: instead of passing a function,
             // you can also pass an object with
             // a 'pre'- and 'post'-link function.
             });
             }*/
        };
    });