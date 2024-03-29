$(document).ready(function(){
(function () {
        var video = document.querySelector('#player');
        initApp();

        function initApp() {
            shaka.polyfill.installAll();
            if (shaka.Player.isBrowserSupported()) {
                initPlayer();
            } else {
                console.error('Browser not supported!');
            }
        }
        
        function initPlayer() {
            var video = document.querySelector('#player');
            var player = new shaka.Player(video);
            player.addEventListener('error', onErrorEvent);

            player.configure({
                drm: {
                    clearKeys: {
                        '4c467a737445684c4974426f556c7579': '4547737a78565152376f4e3861636541',
                    }
                }
            });

            player.load(window.atob(data.widevine))
                .then(function () {

                    var variantTracks = player.getVariantTracks();
                    var bitrates = [];
                    variantTracks.sort(function (a, b) {
                        return a.bandwidth - b.bandwidth;
                    });
                    var groupAudios = [];
                    for (var i = 0; i <= variantTracks.length - 1; i++) {
                        if (groupAudios.includes(variantTracks[i].audioId)) {
                            break;
                        }
                        groupAudios.push(variantTracks[i].audioId);
                    }
                    for (var i = groupAudios.length - 1; i <= variantTracks.length - 1; i += groupAudios.length) {
                        bitrates.push(variantTracks[i]);
                    }
                    
                    new Plyr(video, {
                        controls: ["play-large", "pause-large", "play", "mute", "volume", "live", "settings", "pip", "fullscreen"],
                        settings: ['quality', 'speed', 'loop'],
                        speed: {
                                    selected: 1,
                                    options: [0.5, 0.75, 1]
                                },
                        quality: {
                            options: bitrates.map(j => j.height),
                            forced: true,
                            onChange: function (newQuality) {
                                player.configure({
                                    abr: {
                                        enabled: false
                                    }
                                })
                                
                                var tracks = player.getVariantTracks().filter(tk => tk.height === newQuality)
                                player.selectVariantTrack(tracks[0], true);
                            }
                        }
                    });
                    player.speed = 1;
                });
        }

        function onErrorEvent(event) {
            console.error(event.detail);
        }
})();
});
