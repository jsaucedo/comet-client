/**
 * @name VideoIndexController
 * @desc Controller for the video-index view
 */

(function() {
    'use strict';

    angular.module('cometApp')
           .controller('CallIndexController', CallIndexController);

        CallIndexController.$inject = [ '$log',
                                         '$rootScope',
                                         '$scope',
                                         '$sce',
                                         '$state',
                                         '$stateParams',
                                         '$window',
                                         '$compile',
                                         'ngToast',
                                         'constraints',
                                         'lodash',
                                         'moment',
                                         'SimpleWebRTC',
                                         'dashboardServiceModel',
                                         'callService',
                                         'channelService',
                                         'project',
                                         'channel'];

        function CallIndexController ($log,
                                      $rootScope,
                                      $scope,
                                      $sce,
                                      $state,
                                      $stateParams,
                                      $window,
                                      $compile,
                                      ngToast,
                                      constraints,
                                      lodash,
                                      moment,
                                      SimpleWebRTC,
                                      dashboardServiceModel,
                                      callService,
                                      channelService,
                                      project,
                                      channel) {

          var vm = this,
              room = $stateParams.room,
              channelId = $stateParams.channelId,
              callId = $stateParams.callId,
              user = dashboardServiceModel.getCurrentUser(),
              localNickname = user.alias,
              webrtc = null,
              totalPeers = 0,
              $remotes = document.getElementById('remotes');

          vm.showChat = false;
          vm.sendMessage = sendMessage;
          vm.formatMessageDate = formatMessageDate;
          vm.getMessageClass = getMessageClass;
          vm.messages = [];
          vm.peers = {};
          vm.roomIsFull = false;
          vm.isMember = false;

          activate();

          /**
           * @name activate
           * @desc controller activation logic
          */
          function activate () {

            validateMember();

            if (!vm.isMember) {
              return;
            }

            addCallMember();
            initializeRTC();

            // close the connection on exit
            $window.onunload = function(  ) {
              if (webrtc !== null) {
                webrtc.leaveRoom();
                webrtc.disconnect();
              }
            };
          }

          function validateMember() {
            console.log('channel validate', channel);
            if (channel !== null) {
              if (lodash.find(channel.members, 'id', user.id) !== undefined) {
                vm.isMember = true;
              }
            }
            else {
              // for private channels
              vm.isMember = true;
            }
          }

          /**
           * @name addCallMember
           * @desc set the current logged in user as a member
          */
          function addCallMember () {
            callService.updateMembers(project.id, channelId, callId);
          }

          /**
           * @name initializeRTC
           * @desc SimpleWebRTC plugin configuration
          */
          function initializeRTC() {

            var signalingServer = 'https://' + location.hostname + ':8888';

            // create our webrtc connection
            webrtc = new SimpleWebRTC({
                // the id/element dom element that will hold "our" video
                //localVideoEl: 'peer-main',
                localVideoEl: 'localVideo',
                // the id/element dom element that will hold remote videos
                remoteVideosEl: '',
                // nickname
                nick: localNickname,
                // immediately ask for camera access
                autoRequestMedia: false,
                debug: false,
                detectSpeakingEvents: true,
                autoAdjustMic: true,
                url:  signalingServer     // comentar esta linea para usar el server en la nube
            });

            // for access in the overlay directive
            window.webrtc = webrtc;

            // starts the local video camera
            webrtc.startLocalVideo();

            // when it's ready, join if we got a room from the URL
            webrtc.on('readyToCall', function () {
              $log.info('webrtc::readyToCall - joining:' + room);
              webrtc.joinRoom(room);
            });

            // we got access to the camera
            webrtc.on('localStream', function (stream) {

              var videoTracks = stream.getVideoTracks();
              if (videoTracks.length) {
                var first = videoTracks[0];
                $log.info('local video track label', first.label);
              }

              var localStreamUrl = $window.URL.createObjectURL(stream),
                  video = document.createElement('video');

              video.id = 'localVideo';
              video.src = localStreamUrl;
              video.autoplay = true;
              video.volume = 0;
              video.style= 'transform: scaleX(-1);';

              var localPeer = {
                id: 'localVideo',
                name: localNickname,
                domId: 'localVideo',
                isLocal: true,
                muted: false,
                noVideo: false,
                mouseIn: false
              };

              addPeer(localPeer, video);
            });

            // we did not get access to the camera
            webrtc.on('localMediaError', function (err) {
              $log.log('webrtc::localMediaError', err);
              ngToast.danger('Ocurrió un error al iniciar el video.');
            });

            // a peer video has been added
            webrtc.on('videoAdded', function (video, rtcPeer) {
                $log.log('webrtc::video added', rtcPeer, video);

                var newPeer = {
                  id: rtcPeer.id,
                  name: rtcPeer.nick,
                  domId: webrtc.getDomId(rtcPeer),
                  muted: false,
                  noVideo: false,
                  mouseIn: false,
                  rtcPeer: rtcPeer
                };

                addPeer(newPeer, video);
            });

            // a peer was removed
            webrtc.on('videoRemoved', function (video, rtcPeer) {
                $log.info('webrtc::video removed ', rtcPeer);
                removePeer(rtcPeer);
            });

            // chat - message received
            webrtc.connection.on('message', function (data) {
              if (data.type === 'chat') {
                vm.messages.push(data.payload);
              }
            });

            webrtc.on('error', function (err) {
              $log.log('webrtc::error', err);
              if (err === 'full') {
                // room full - validated by the signaling server
                vm.roomIsFull = true;
              }
            });
          }

          /**
           * @name addPeer
           * @desc adds a new peer to the current peers list and updates the view
          */
          function addPeer(newPeer, video) {

            insertVideoBlock(newPeer, video);
            vm.peers[newPeer.id] = newPeer;

            totalPeers++;
            updateLayout();
            $log.log('totalPeers', totalPeers);

            if (totalPeers === 4) {
              angular.element('<br />').insertBefore('.video-wrapper:nth-child(3)');
            }
          }

          /**
           * @name insertVideoBlock
           * @desc inserts a video-wrapper div that contains the overlay
           *       and video elements
          */
          function insertVideoBlock(peer, video) {

            var containerClass = 'video-wrapper',
                wrapper = document.createElement('div'),
                overlay = $compile('<video-overlay peer-id="' + peer.id + '" />')($scope);

            wrapper.className = containerClass;
            wrapper.id = 'wrapper_' + peer.domId;
            wrapper.appendChild(overlay[0]);
            wrapper.appendChild(video);
            $remotes.appendChild(wrapper);
          }

          /**
           * @name removePeer
           * @desc delete the peer from the list and updates the view
          */
          function removePeer (rtcPeer) {
            // delete the parent node
            angular.element(rtcPeer.videoEl).parent('.video-wrapper').remove();
            totalPeers--;
            updateLayout();
          }

          /**
           * @name updateLayout
           * @desc updates the container div's
          */
          function updateLayout () {
            angular.element('#remotes')
                   .removeClass('peers-1 peers-2 peers-3 peers-4')
                   .addClass('peers-' + (totalPeers));

          }

          /**
           * @name sendMessage
           * @desc sends a chat messsage using the rtc datachannel
          */
          function sendMessage(text) {
            var message = {
              content: text,
              author: localNickname,
              date: new Date()
            };

            if (webrtc) {
              webrtc.sendToAll('chat', message);
              vm.messages.push(message);
              vm.message = '';
            }
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

          /**
           * @name messageIsFromUser
           * @desc returns if the message author is the logged in user
          */
          function messageIsFromUser(message) {
            return (message.author === localNickname);
          }

          /**
           * @name getMessageClass
           * @desc returns the css class to use in the message container div
          */
          function getMessageClass(message) {
            var cssClass = '';
            // messages from the current logged in user
            cssClass += messageIsFromUser(message) ? 'mine' : '';

            return cssClass;
          }
      }
})();
