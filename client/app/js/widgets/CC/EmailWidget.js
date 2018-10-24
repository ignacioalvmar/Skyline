var EmailReportWidget = function(broker) {
    var EmailWidget = function(socket, consoleName) {
        socket.emit('subscribe', { console: consoleName, name: "displayEmail" });
        socket.emit('subscribe', { console: consoleName, name: "removeEmail" });

        var emailDisplayed;
        var hiddenDivs = null;
        var initialized = false;
        var parent = null;
        var widgetDiv = null;
        var hideAtSpeed;
        var emailAudio;
        var emailBGImage;
        var emailQuadrant;
        var displayNow;


        socket.on("displayEmail", function(data) {
            setMemberVars(data);
            console.log("test");
            console.log(data);
            var emailContents = $("<div class='email-contents'></div>");
            var emailForm = $("<div class='email-form'></div>");
            var emailBody = $("<div class='email-body'>" + data.body + "</div>");

            if (data.isMeeting){
                emailForm.append(appendMeetingButtons());
                }

            widgetDiv.append("<h1 class='from'>" + data.from + "</div>");
            emailContents.append("<div class='date'>" + data.sentDate + "</div>");
            emailContents.append("<div class='subject'>" + data.subject + "</div>");
            
            if(data.attachmentIcon) {
                emailForm.append("<div class='attachment-icon'><img src='" + data.attachmentIcon + "' alt='image'/></div>");
            }

            if (!data.isMeeting && !data.attachmentIcon) {
                emailBody.css("width", "680px");
            }
            emailForm.append(emailBody);
            emailContents.append(emailForm);
            widgetDiv.append(emailContents);
            parent.append(widgetDiv);

           if(!initialized){
                initTelemetryHandler();
                initialized = true;
           }
        });

        function setMemberVars(data){
            parent = $("#" + data.quadrant);
            widgetDiv = $("<div class='email'></div>");
            displayNow = data.displayNow;
            hideAtSpeed = data.hideAtMph/1;
            emailAudio = data.audioFile;
            emailBGImage = data.backgroundImage;
            emailQuadrant = data.quadrant;
            console.log("set");
        }

        socket.on("removeEmail", function(data) { saveEmail(); });

        function appendMeetingButtons() {
            var emailButtons = $("<div class='email-btns'></div>");
            var buttonYes = $("<button id='meetingYes' class='form-button small primary pad-left' type='button'>YES</button>");
            var buttonMaybe = $("<button id='meetingMaybe' class='form-button small default pad-left pad-top' type='button'>MAYBE</button>");
            var buttonNo = $("<button id='meetingNo' class='form-button small danger pad-left pad-top' type='button'>NO</button>");
            emailButtons.append(buttonYes);
            emailButtons.append(buttonMaybe);
            emailButtons.append(buttonNo);

            buttonYes.bind("touchstart click", function() {
                socket.emit("consoleEvent", { eventName: "email_meetingAccepted" });
            });

            buttonMaybe.bind("touchstart click", function() {
                socket.emit("consoleEvent", { eventName: "email_meetingMaybe" });
            });

            buttonNo.bind("touchstart click", function() {
                socket.emit("consoleEvent", { eventName: "email_meetingNotAccepted" });
            });

            return emailButtons;
        }

        function saveEmail() {
            if(!emailDisplayed) {
                return;
            }
            
            emailDisplayed = false; //prevent further processing

            var overlay = $("<div class='form-overlay'></div>");
            var overlayText = $("<div class='overlay-text'>saving...</div>");

            overlay.css("width", parent.width());
            overlay.css("height", parent.height());
            overlayText.css("padding-top", (parent.height() / 2) - 25);
            overlayText.css("padding-left", (parent.width() / 2) - 80);

            overlay.append(overlayText);
            parent.append(overlay);
            $(overlay).fadeToggle("slow");

            setTimeout(function(){
                overlay.remove();
                removeEmail();
            }, 4000);
        }

        function removeEmail() {
            if(widgetDiv) {
                widgetDiv.empty();
            }

            widgetDiv = null;

            if (emailBGImage) {
                parent.css("background-image", "none");
            }else {
                parent.removeClass("form-background");
            }

            hiddenDivs.removeClass('hidden');
        }

        function displayEmailWidget() {
            if (hiddenDivs) {
                hiddenDivs.removeClass('hidden');
            }

            //hide all the children
            hiddenDivs = parent.children().not('.hidden');
            hiddenDivs.addClass('hidden');

            if (emailBGImage) {
                parent.css("background-image", "url('/images/" + emailBGImage + ".png')");
            }else {
                parent.addClass("form-background");
            }

            parent.append(widgetDiv);
            if(emailAudio) {
                document.getElementById(emailAudio).play();
            }
            emailDisplayed = true;
        }


        function initTelemetryHandler(){
            socket.emit('subscribe', { name: 'car/telemetry' });

            socket.on('car/telemetry', function(message) {
                if(!widgetDiv) {
                    return;
                }
                //if we are stopped and we are at a red light or displayNow is true
                if (!emailDisplayed && (displayNow === 'true' ||  message.mph/1 < 5)) {
                    displayEmailWidget();
                }

                if (emailDisplayed && message.mph/1 >= hideAtSpeed) {
                    console.log('hiding email due to acceleration: ' + message.mph);
                    saveEmail();
                    //keep this from updating again
                }
            });
        }
    };

    new EmailWidget(broker.getSocket(), broker.getChannel());
};

widgets.push({fn: EmailReportWidget, channel: "CC"});