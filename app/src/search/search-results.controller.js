/**
 * @name SearchResultsController
 * @desc Controller for the search-result view
 */

(function() {
    'use strict';

    angular.module('cometApp')
           .controller('SearchResultsController', SearchResultsController);

        SearchResultsController.$inject = ['$rootScope',
                                           '$state',
                                           '$stateParams',
                                           'ngToast',
                                           'searchService',
                                           'channels',
                                           'project',
                                           'lodash',
                                           'moment'];

        function SearchResultsController ($rootScope,
                                          $state,
                                          $stateParams,
                                          ngToast,
                                          searchService,
                                          channels,
                                          project,
                                          lodash,
                                          moment) {

          var vm = this;
          vm.criterioBusqueda = $stateParams.criterio;
          vm.channels = channels;
          vm.project = project;
          vm.isEmpty = true;
          vm.cantidadResultados = 0;
          vm.projectId = $stateParams.id;
          vm.channelId = $stateParams.channelId;
          vm.validationErrors = null;
          vm.resultUsers = [];
          vm.messagesInProjectDirectChannels = [];
          vm.messagesInProjectCommonChannels = [];
          vm.messagesInChannel = [];
          vm.limit = $stateParams.limit;
          vm.last_id = null;
          vm.getMember = getMember;
          vm.getChannelById = getChannelById;

          // ngEmbed options
          vm.options = {
              linkTarget: '_blank',
              basicVideo: false,
              code: {
                  highlight: false,
                  lineNumbers: true
              },
              gdevAuth: 'AIzaSyAQONTdSSaKwqB1X8i6dHgn9r_PtusDhq0',
              video: {
                  embed: true,
                  width: 800,
                  ytTheme: 'light',
                  details: true
              },
              tweetEmbed       : true,
              tweetOptions     : {
                  lang      : 'es'
              },
              image: {
                  embed: true
              }
          };

          vm.formatMessageDate = formatMessageDate;

          activate();

          /**
           * @name activate
           * @desc controller activation logic
          */
          function activate () {
            // mientras mostrar un gif de loading

            searchService.searchUserInProject(vm.projectId, vm.criterioBusqueda).error(searchError)
            .then(function (users_search_result) {
              vm.resultUsers = users_search_result.data.users;
              if(vm.channelId){
                //buscar solamente en el canal provisto
                searchService.searchMessageInChannel(vm.projectId, vm.channelId, vm.criterioBusqueda, vm.limit, vm.last_id).error(searchError).then(
                  function (project_search_result) {
                    if(project_search_result.data.project.channels.direct){
                      vm.messagesInProjectDirectChannels = project_search_result.data.project.channels.direct;
                    }

                    if(project_search_result.data.project.channels.common){
                      vm.messagesInProjectCommonChannels = project_search_result.data.project.channels.common;
                    }

                    // SETEAR LAST ID, PARA SIGUIENTE BUSQUEDA (VER MAS)
                  }
                ).then(searchResult);
              } else {
                //Buscar en todos los canales comunes del proyecto.
                searchService.searchMessageInProject(vm.projectId, vm.criterioBusqueda, false, vm.limit, vm.last_id).error(searchError).then(
                  function (project_common_search_result) {
                    vm.messagesInProjectCommonChannels = project_common_search_result.data.project.channels.common;

                    // SETEAR LAST ID, PARA SIGUIENTE BUSQUEDA (VER MAS)
                  }
                ).then(function(){
                  //Buscar en todos los canales directos a los que pertenece el usuario.
                  searchService.searchMessageInProject(vm.projectId, vm.criterioBusqueda, true, vm.limit, vm.last_id).error(searchError).then(
                    function (project_direct_search_result) {
                      vm.messagesInProjectDirectChannels = project_direct_search_result.data.project.channels.direct;

                      // SETEAR LAST ID, PARA SIGUIENTE BUSQUEDA (VER MAS)
                    }
                  ).then(searchResult);
                });
              }
            });
          }

          /**
           * @name searchResult
           * @desc shows search operation result
          */
          function searchResult () {
            if(vm.resultUsers.length !== 0 ||
                vm.messagesInProjectDirectChannels.length !== 0 ||
                vm.messagesInProjectCommonChannels.length !== 0 ||
                  vm.messagesInChannel.length !== 0){
                    vm.isEmpty = false;

                    vm.cantidadResultados = vm.resultUsers.length +
                                            vm.messagesInProjectDirectChannels.length +
                                            vm.messagesInProjectCommonChannels.length +
                                            vm.messagesInChannel.length;
            }
          }

          /**
           * @name searchError
           * @desc shows a dialog indicating an error on search operation
          */
          function searchError (data) {
              vm.validationErrors = $rootScope.helpers.loadServerErrors(data);
              if (vm.validationErrors === null){
                ngToast.danger('Ocurrió un error al consultar al servidor.');
              }
          }

          /**
           * @name getChannelById
           * @desc returns a channel object by id
          */
          function getChannelById(channelId){
            if(isNaN(channelId)){
              //Direct Channel
              var user_ids = channelId.split("_");

              var user_1 = lodash.find(vm.project.members, 'id', parseInt(user_ids[1]));
              var user_2 = lodash.find(vm.project.members, 'id', parseInt(user_ids[2]));

              user_1 = user_1.firstName + ' ' + user_1.lastName;
              user_2 = user_2.firstName + ' ' + user_2.lastName;

              return { name : 'Canal Directo entre ' + user_1 + ' y ' + user_2 };
            }

            //Common Channel
            return lodash.find(vm.channels, 'id', channelId);
          }

          /**
           * @name getMember
           * @desc returns a member object by id
          */
          function getMember(userId) {
                return lodash.find(vm.project.members, 'id', userId);
          }

          /**
           * @name formatMessageDate
           * @desc returns the message timestamp in a readable format
          */
          function formatMessageDate (msgDate) {
            return moment(msgDate).calendar(null, {
              lastDay : '[ayer] LT',
              lastWeek : 'dddd L LT',
              sameDay : 'LT',
              sameElse : 'dddd L LT'
            });
          }
        }

})();
