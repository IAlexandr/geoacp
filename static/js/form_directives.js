angular.module('ngFias')
    .directive("editForm", function ($compile) {
        return {
            restrict: "E",
            templateUrl: "views/templates/form/edit_form.html",
            link: function ($scope, element, attr) {

                // тестовый объект
                $scope.oldObj = {
                    OBJECTID: 1,
                    STREET: "Ленина",
                    ANNO: 'Информация по улице',
                    SYMTYPE: 1,
                    CHECK: "False"
                };
                // объект для изменения
                $scope.res = angular.copy($scope.oldObj);

                // настройки отображения полей
                $scope.formDefinition = {
                    'OBJECTID': {
                        show: false
                    },
                    'STREET': {
                        alias: 'Улица',
                        show: true,
                        controlType: 'text',
                        length: 10,
                        nullable: false,
                        editable: true,
                        order: 4
                    },
                    'SYMTYPE': {
                        domain: true,
                        alias: 'Тип2',
                        show: true,
                        controlType: 'select',
                        nullable: true,
                        editable: true,
                        order: 2
                    },
                    'ANNO': {
                        alias: 'Примечание',
                        show: true,
                        controlType: 'textarea',
                        length: 400,
                        rows: 2,
                        nullable: true,
                        editable: true,
                        order: 1
                    },
                    'CHECK': {
                        alias: 'Проверен',
                        show: true,
                        controlType: 'checkbox',
                        length: 1,
                        trueValue: 'True',
                        falseValue: 'False',
                        nullable: false,
                        editable: true,
                        order: 1
                    }
                };

                // поля
                $scope.fields = [
                    {
                        "name": "OBJECTID",
                        "type": "esriFieldTypeOID",
                        "alias": "OBJECTID",
                        "editable": false,
                        "nullable": false
                    },
                    {
                        "name": "STREET",
                        "type": "esriFieldTypeString",
                        "alias": "Улица",
                        "length": 10,
                        "editable": true,
                        "nullable": true
                    },
                    {
                        "name": "SYMTYPE",
                        "type": "esriFieldTypeInteger",
                        "alias": "Тип",
                        "editable": true,
                        "nullable": true,
                        "domain": {
                            "name": "PTANNOTYPE",
                            "type": "codedValue",
                            "codedValues": [
                                { "name": "Прочее", "code": 0 },
                                { "name": "Устаревшие данные", "code": 1 },
                                { "name": "Отсутствует объект", "code": 2 },
                                { "name": "К сведению", "code": 3 }
                            ]
                        }
                    },
                    {
                        "name": "ANNO",
                        "type": "esriFieldTypeString",
                        "alias": "Примечание",
                        "length": 1000,
                        "editable": true,
                        "nullable": true
                    },
                    {
                        "name": "CHECK",
                        "type": "esriFieldTypeInteger",
                        "alias": "Проверен",
                        "length": 1,
                        "editable": true,
                        "nullable": false
                    }
                ];


                $scope.applyEdits = function () {
                    $scope.oldObj = angular.copy($scope.res);
                };
                $scope.reset = function () {
                    $scope.res = angular.copy($scope.oldObj);
                };

                $scope.equalsCheck = function () {
                    return angular.equals($scope.res, $scope.oldObj);
                }
            }
        }
    })
    .directive("editFieldText", function ($compile) {
        return {
            restrict: "E",
            templateUrl: "views/templates/form/edit_field_text.html",
            scope: {
                res: '=resObj',
                fd: '=fdObj'
            },
            link: function ($scope, element) {

            }
        }
    })
    .directive("editFieldTextarea", function () {
        return {
            restrict: "E",
            scope: {
                res: '=resObj',
                fd: '=fdObj'
            },
            templateUrl: "views/templates/form/edit_field_textarea.html",
            link: function ($scope, element, attr) {

            }
        }
    })
    .directive("editFieldSelect", function () {
        return {
            restrict: "E",
            scope: {
                fieldsTest: '=fieldsTest',
                res: '=resObj',
                fd: '=fdObj'
            },
            templateUrl: "views/templates/form/edit_field_select.html",
            link: function ($scope, element, attr) {
                if ($scope.fd.domain) {

                    var field = _.where($scope.fieldsTest, {name: $scope.fd.formDefinitionKey});
                    if (field.length > 0 && field[0].domain.codedValues) {
                        $scope.values = field[0].domain.codedValues;
                    } else {
                        //todo
                    }
                }
            }
        }
    })
    .directive("editFieldCheckbox", function () {
        return {
            restrict: "E",
            scope: {
                res: '=resObj',
                fd: '=fdObj'
            },
            templateUrl: "views/templates/form/edit_field_checkbox.html",
            link: function ($scope, element, attr) {
            }
        }
    })
    .filter('orderObjectBy', function () {
        return function (items, field, reverse) {
            var filtered = [];
            angular.forEach(items, function (item, b) {
                item.formDefinitionKey = b;
                filtered.push(item);
            });
            filtered.sort(function (a, b) {
                return (a[field] > b[field] ? 1 : -1);
            });
            if (reverse) filtered.reverse();
            return filtered;
        };
    });
