angular.module('ngFias', ['ngResource'])

    .controller("TreeController", function ($scope) {
        $scope.sHouse = {test:true};
    })
    .controller("MapController", function ($scope) {

        /* настройки отображения полей
         * Обязательные поля:
         *   > show: (Boolean) показывать поле
         *   > alias: (String) Подпись поля
         *   > controlType: ('text', 'textarea', 'num', 'select', 'checkbox') тип поля
         *   > nullable: (Boolean) пустая строка
         *   > editable: (Boolean) редактирование значения
         *   > order: (Integer) порядок отображения
         * Необязательные поля:
         *   > length: (Integer) макс. допустимое кол-во символов
         *   > rows: (Integer) (используется в 'textarea') кол-во строк
         *   > trueValue: 'True' (любое значение) (используется в 'checkbox') значение в true состоянии
         *   > falseValue: 'False' (любое значение) (используется в 'checkbox') значение в false состоянии
         */
        $scope.formDefinition = {
            'OBJECTID': {
                alias: 'OBJECTID',
                show: false,
                controlType: 'text',
                nullable: false,
                editable: false,
                order: 0
            },
            'STREET': {
                alias: 'Улица',
                show: true,
                controlType: 'text',
                length: 10,
                nullable: false,
                editable: true,
                order: 1
            },
            'HOUSE': {
                alias: 'Дом',
                show: true,
                controlType: 'num',
                nullable: false,
                editable: true,
                order: 2
            },
            'SYMTYPE': {
                domain: {
                    "name": "PTANNOTYPE",
                    "type": "codedValue",
                    "codedValues": [
                        { "name": "Прочее", "code": 0 },
                        { "name": "Устаревшие данные", "code": 1 },
                        { "name": "Отсутствует объект", "code": 2 },
                        { "name": "К сведению", "code": 3 }
                    ]
                },
                alias: 'Тип2',
                show: true,
                controlType: 'select',
                nullable: true,
                editable: true,
                order: 3
            },
            'ANNO': {
                alias: 'Примечание',
                show: true,
                controlType: 'textarea',
                length: 40,
                rows: 2,
                nullable: false,
                editable: true,
                order: 4
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
                order: 5
            }
        };

        $scope.featureAttrs = {
            OBJECTID: 1,
            STREET: "Ленина",
            HOUSE: 13,
            ANNO: 'Информация по улице',
            SYMTYPE: 1,
            CHECK: "False"
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
    });
