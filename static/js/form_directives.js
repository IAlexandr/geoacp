angular.module('ngFias')
    .directive("editForm", function () {
        return {
            templateUrl: "views/templates/form/edit_form.html",
            scope: {
                model: '=gwModel',
                formDefinition: '=formDefinition'
            },
            link: function ($scope, element, attr) {
            }
        }
    })
    .directive("editFieldText", function () {
        return {
            templateUrl: "views/templates/form/edit_field_text.html",
            scope: {
                model: '=gwModel',
                fd: '=fdObj'
            },
            link: function ($scope, element) {

            }
        }
    })
    .directive("editFieldNum", function () {
        return {
            templateUrl: "views/templates/form/edit_field_num.html",
            scope: {
                model: '=gwModel',
                fd: '=fdObj'
            },
            link: function ($scope, element) {
                // только числа
                $scope.numRegEx = /^\d+\.?\d+$/;
            }
        }
    })
    .directive("editFieldTextarea", function () {
        return {
            scope: {
                model: '=gwModel',
                fd: '=fdObj'
            },
            templateUrl: "views/templates/form/edit_field_textarea.html",
            link: function ($scope, element, attr) {

            }
        }
    })
    .directive("editFieldSelect", function () {
        return {
            scope: {
                model: '=gwModel',
                fd: '=fdObj'
            },
            templateUrl: "views/templates/form/edit_field_select.html",
            link: function ($scope, element, attr) {

            }
        }
    })
    .directive("editFieldCheckbox", function () {
        return {
            scope: {
                model: '=gwModel',
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
