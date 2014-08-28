angular.module('ngFias')
/*
*  http://si-sdiis/geoacp
*   - /addrobj
*   - /find
*   - ?expression={"ACTSTATUS":"1"}
*   &skip=10
*   &limit=20
*   &sort={"FORMALNAME":1}
*/

    .factory('rFactory', function ($resource) {
        return $resource('/:collection/:action', {collection:'@collection', action:'@action'}, {
            get: {method: 'GET', headers: [
                {'Content-Type': 'application/json'},
                {'Accept': 'application/json'}
            ]},
            getArray: {method: 'GET', isArray: true, headers: [
                {'Content-Type': 'application/json'},
                {'Accept': 'application/json'}
            ]},
            update: {method: 'PUT', headers: [
                {'Content-Type': 'application/json'},
                {'Accept': 'application/json'}
            ]},
            create: {method: 'POST', headers: [
                {'Content-Type': 'application/json'},
                {'Accept': 'application/json'}
            ]},
            delete: {method: 'DELETE', headers: [
                {'Content-Type': 'application/json'},
                {'Accept': 'application/json'}
            ]}
        });
    });