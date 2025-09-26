// FIXED: Send DTMF button key - improved version for call center navigation with multi-session support
function guiSendDTMF(key) {
    console.log(`DS: guiSendDTMF() attempting to send tone: ${key}`);
    
    // Get current active session
    var activeSession = getCurrentSession();
    if (!activeSession) {
        console.warn('No active call session to send DTMF.');
        return;
    }

    console.log('Sending DTMF for session:', userCallState.activeSessionId);

    // Send DTMF based on call state
    if (activeSession.isEstablished()) {
        // Call is established, send DTMF immediately
        sendDTMFTone(key, activeSession);
    } else if (activeSession.isInProgress()) {
        // Call is in progress but not yet established, wait for confirmation
        console.log('Call in progress, waiting for establishment before sending DTMF');
        
        // Remove any existing confirmed listeners to avoid duplicates
        activeSession.removeAllListeners('confirmed');
        
        // Add one-time listener for when call gets established
        activeSession.once('confirmed', function() {
            console.log('Call confirmed, now sending DTMF tone:', key);
            // Add delay to ensure call center system is ready
            setTimeout(function() {
                sendDTMFTone(key, activeSession);
            }, 500);
        });
    } else {
        console.warn('Cannot send DTMF: call is not in progress or established');
        return;
    }

    // Play local audio feedback AFTER attempting to send
    setTimeout(function() {
        try {
            audioPlayer.play(Object.assign({ 'name': key }, SoundConfig.play.dtmf));
        } catch (e) {
            console.warn('Could not play DTMF tone locally:', e);
        }
    }, 100);
}

// Helper function to actually send the DTMF tone with session parameter
function sendDTMFTone(key, session) {
    if (!session || !session.isEstablished()) {
        console.warn('Cannot send DTMF: session not established');
        return;
    }

    console.log('Sending DTMF tone:', key, 'for session:', userCallState.activeSessionId);

    // Try multiple methods for better compatibility
    var methods = [
        { type: 'RFC2833', duration: 250, gap: 70 },
        { type: 'INFO', duration: 250, gap: 70 },
        { type: 'RFC2833', duration: 160, gap: 50 },
        { type: 'INFO', duration: 300, gap: 100 }
    ];

    function tryMethod(methodIndex) {
        if (methodIndex >= methods.length) {
            console.error('All DTMF methods failed for tone:', key);
            notifyError('Could not send DTMF tone: ' + key + '. Please check your SIP server configuration.');
            return;
        }

        var method = methods[methodIndex];
        console.log(`Trying DTMF method ${methodIndex + 1}: ${method.type} (duration: ${method.duration}ms, gap: ${method.gap}ms)`);
        
        try {
            // Create options for DTMF
            var dtmfOptions = {
                duration: method.duration,
                interToneGap: method.gap,
                transportType: method.type
            };

            // Add event handlers for DTMF feedback
            var dtmfSender = session.sendDTMF(key, dtmfOptions);
            
            // Set timeout to try next method if no response
            var fallbackTimer = setTimeout(function() {
                console.log(`DTMF method ${methodIndex + 1} timeout, trying next...`);
                tryMethod(methodIndex + 1);
            }, 1000);

            // If DTMF has success callback support
            if (dtmfSender && typeof dtmfSender.then === 'function') {
                dtmfSender.then(function() {
                    clearTimeout(fallbackTimer);
                    console.log(`DTMF tone ${key} sent successfully via ${method.type} for session:`, userCallState.activeSessionId);
                }).catch(function(error) {
                    clearTimeout(fallbackTimer);
                    console.error(`DTMF ${method.type} failed:`, error);
                    tryMethod(methodIndex + 1);
                });
            } else {
                // For older implementations without promise support
                console.log(`DTMF tone ${key} sent via ${method.type} (no feedback available) for session:`, userCallState.activeSessionId);
                clearTimeout(fallbackTimer);
            }
            
        } catch (error) {
            console.error(`Error sending DTMF via ${method.type}:`, error);
            tryMethod(methodIndex + 1);
        }
    }

    // Start with first method
    tryMethod(0);
}

// Additional function to send DTMF with SIP INFO method (legacy compatibility)
function sendDTMFViaInfo(key) {
    var activeSession = getCurrentSession();
    if (!activeSession || !activeSession.isEstablished()) {
        return false;
    }

    try {
        // Manual SIP INFO method for problematic servers
        var extraHeaders = ['Content-Type: application/dtmf-relay'];
        var body = 'Signal=' + key + '\r\nDuration=250';
        
        if (activeSession.sendInfo) {
            activeSession.sendInfo('application/dtmf-relay', body, {
                extraHeaders: extraHeaders
            });
            console.log(`DTMF ${key} sent via manual SIP INFO for session:`, userCallState.activeSessionId);
            return true;
        }
    } catch (error) {
        console.error('Manual SIP INFO DTMF failed:', error);
    }
    return false;
}

// Diagnostic function to test DTMF capability
function testDTMFCapability() {
    console.log('=== DTMF Capability Test ===');
    
    var activeSession = getCurrentSession();
    if (!activeSession) {
        console.log('❌ No active session');
        return false;
    }
    
    console.log('✓ Active session:', userCallState.activeSessionId);
    console.log('✓ Session exists:', activeSession.isEstablished() ? 'Established' : 'Not established');
    
    if (activeSession.connection) {
        var pc = activeSession.connection;
        console.log('✓ RTC Connection state:', pc.connectionState);
        console.log('✓ ICE Connection state:', pc.iceConnectionState);
        
        // Check DTMF senders
        if (pc.getSenders) {
            var senders = pc.getSenders();
            console.log('✓ RTC Senders count:', senders.length);
            
            senders.forEach(function(sender, index) {
                if (sender.track && sender.track.kind === 'audio') {
                    console.log(`✓ Audio sender ${index}:`, sender.track.enabled ? 'Enabled' : 'Disabled');
                    if (sender.dtmf) {
                        console.log(`  - DTMF support:`, sender.dtmf.canInsertDTMF);
                        console.log(`  - DTMF buffer:`, sender.dtmf.toneBuffer);
                    } else {
                        console.log(`  - No DTMF object`);
                    }
                }
            });
        }
    }
    
    // Test JsSIP DTMF method
    if (activeSession.sendDTMF) {
        console.log('✓ JsSIP sendDTMF method available');
    } else {
        console.log('❌ JsSIP sendDTMF method not available');
    }
    
    console.log('=== End DTMF Test ===');
    return true;
}

// Force DTMF via native WebRTC API (as last resort)
function forceWebRTCDTMF(key) {
    var activeSession = getCurrentSession();
    if (!activeSession || !activeSession.connection) {
        console.error('No RTC connection for native DTMF');
        return false;
    }
    
    try {
        var pc = activeSession.connection;
        var senders = pc.getSenders ? pc.getSenders() : [];
        
        for (var i = 0; i < senders.length; i++) {
            var sender = senders[i];
            if (sender.track && sender.track.kind === 'audio' && sender.dtmf) {
                if (sender.dtmf.canInsertDTMF) {
                    console.log('Using native WebRTC DTMF for key:', key, 'session:', userCallState.activeSessionId);
                    sender.dtmf.insertDTMF(key, 250, 70); // duration, inter-tone gap
                    
                    // Add event listeners for feedback
                    sender.dtmf.ontonechange = function(event) {
                        console.log('DTMF tone change for session', userCallState.activeSessionId, ':', event.tone);
                    };
                    
                    return true;
                }
            }
        }
        console.error('No DTMF-capable audio sender found');
        return false;
    } catch (error) {
        console.error('Native WebRTC DTMF failed:', error);
        return false;
    }
}

// Enhanced hangup function with multi-session support
function hangup() {
    try {
        var activeSession = getCurrentSession();
        if (activeSession) {
            activeSession.terminate();
            console.log('Terminated active session:', userCallState.activeSessionId);
        }
        
        // Clean up session data
        if (userCallState.activeSessionId && sessions.has(userCallState.activeSessionId)) {
            sessions.delete(userCallState.activeSessionId);
        }
        
        // Reset state
        currentSession = null;
        userCallState.activeSessionId = null;
        userCallState.isInCall = false;
        isInCall = false; // Keep for backward compatibility
        stopTimer();
        stopRemoteAudio();
    } catch (e) {
        console.error('Hangup error', e);
    }
}

// FIXED: Call function with proper multi-session support
function call() {
    guiEnableSound();

    var number = getVal(ids.txtNumber).trim();
    if (!number) { return; }
    // Guard: prevent overlapping calls
    if (userCallState.isInCall || currentSession) {
        notifyError('There is an ongoing call. Please end the current call first.');
        return;
    }

    if (!validateConfig()) { return; }

    // Ensure SIP transport and registration are ready before trying
    ensureUA();
    waitUntilRegistered(3000).then(function(){
        // Preflight mic check to surface clearer errors (e.g., mic in use/denied)
    try {
        var gum = (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) ? navigator.mediaDevices.getUserMedia({ audio: true }) : Promise.reject('Unsupported');
        gum.then(function (stream) {
            try { (stream.getTracks() || []).forEach(function(t){ t.stop(); }); } catch(_) {}

            var uaInstance = ensureUA();
            if (!uaInstance) return;

            var eventHandlers = {
                progress: function () { setStatus('Ringing...'); },
                failed: function (e) {
                    var cause = (e && e.cause) ? (' (' + e.cause + ')') : '';
                    setStatus('Failed'); enableButtons(true); stopTimer();
                    stopRemoteAudio();
                    notifyError('Call failed' + cause + '. Please verify SIP Settings and network connectivity.');
                    softReset();
                },
                ended: function () {
                    setStatus('Ended');
                    enableButtons(true);
                    stopTimer();
                    stopRemoteAudio();
                    fetchLatestCdr();
                    softReset();
                },
                confirmed: function () {
                    userCallState.isInCall = true;
                    isInCall = true; // Keep for backward compatibility
                    setStatus('In call');
                    enableButtons(false);
                    startTimer();
                    // Start duration tracking
                    setVal(ids.txtstart, formatDate(new Date()));
                    setVal(ids.txtstarttime, formatTime(new Date()));
                }
            };

            var options = {
                eventHandlers: eventHandlers,
                mediaConstraints: { audio: true, video: false }
            };

            try {
                // Create outgoing call
                var session = uaInstance.call(number, options);
                
                // Generate session ID for multi-session support
                var sessionId = generateSessionId(session);
                
                // Store outgoing session in sessions map
                sessions.set(sessionId, {
                    session: session,
                    direction: 'outgoing',
                    startTime: Date.now(),
                    number: number
                });
                
                // FIXED: Set as active session - this was missing!
                setActiveSession(sessionId);
                
                // Set up session event handlers
                setupSessionEventHandlers(session, sessionId);
                
                console.log('Outgoing call created with session ID:', sessionId);
                
                var pc = session.connection;
                session.on('addstream', function (e) {
                    // Play remote audio
                    attachAudio(e.stream);
                });

                // modern API
                if (pc && pc.addEventListener) {
                    pc.addEventListener('track', function (ev) {
                        var stream2 = ev.streams && ev.streams[0];
                        if (stream2) attachAudio(stream2);
                    });
                }
            } catch (e1) {
                console.error('Call error', e1);
                setStatus('Error');
                stopRemoteAudio();
                softReset();
            }
        }).catch(function (err) {
            var msg = 'Microphone access error.';
            try {
                if (err && err.name === 'NotAllowedError') msg = 'Microphone permission denied by user or browser.';
                else if (err && err.name === 'NotReadableError') msg = 'Microphone is busy or in use by another application.';
                else if (err && err.name === 'NotFoundError') msg = 'No microphone device found.';
            } catch(_) {}
            notifyError(msg);
        });
    } catch (ex) {
        console.error(ex);
        notifyError('Unexpected error while preparing call.');
    }
    }).catch(function(){
        updateCallAvailability();
        // no popup, only indicator
        setStatus('SIP not ready');
    });
}

// Setup session event handlers for multi-session support
function setupSessionEventHandlers(session, sessionId) {
    session.on('progress', function() {
        console.log('Session progress:', sessionId);
        setStatus('Ringing...');
    });
    
    session.on('confirmed', function() {
        console.log('Session confirmed:', sessionId);
        userCallState.isInCall = true;
        isInCall = true; // Keep for backward compatibility
        setStatus('In call');
        enableButtons(false);
        startTimer();
        setVal(ids.txtstart, formatDate(new Date()));
        setVal(ids.txtstarttime, formatTime(new Date()));
    });
    
    session.on('ended', function() {
        console.log('Session ended:', sessionId);
        setStatus('Ended');
        enableButtons(true);
        stopTimer();
        stopRemoteAudio();
        fetchLatestCdr();
        softReset();
    });
    
    session.on('failed', function(e) {
        console.log('Session failed:', sessionId, e);
        var cause = (e && e.cause) ? (' (' + e.cause + ')') : '';
        setStatus('Failed');
        enableButtons(true);
        stopTimer();
        stopRemoteAudio();
        notifyError('Call failed' + cause + '. Please verify SIP Settings and network connectivity.');
        softReset();
    });
}

// Expose test functions globally for debugging (with session awareness)
window.testDTMF = testDTMFCapability;
window.forceDTMF = forceWebRTCDTMF;
window.listSessions = function() {
    console.log('=== Active Sessions ===');
    console.log('Current active session:', userCallState.activeSessionId);
    console.log('Total sessions:', sessions.size);
    sessions.forEach(function(sessionData, sessionId) {
        console.log(`Session ${sessionId}:`, {
            direction: sessionData.direction,
            number: sessionData.number,
            startTime: new Date(sessionData.startTime).toISOString(),
            established: sessionData.session.isEstablished()
        });
    });
    console.log('=== End Sessions ===');
};