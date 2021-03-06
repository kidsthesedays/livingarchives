var app = Argon.init();

app.reality.request(Argon.resolveURL('/panorama.html'));

// Start listening for connections to a reality
app.reality.connectEvent.addEventListener(function (session) {
    // Set body background to transparent
    document.body.style.background = "transparent";
    // If the protocol is supported invoke the showPanorama method and pass it our panorama
    if (session.supportsProtocol('single.panorama')) {
        session.request('single.panorama.showPanorama', window.panorama);
    }
});
