exports.handler = (event, context, callback) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    let slots;
    if (event.sessionState && event.sessionState.intent && event.sessionState.intent.slots) {
        slots = event.sessionState.intent.slots;
    } else {
        const response = {
            sessionState: {
                dialogAction: {
                    type: "Close",
                    fulfillmentState: "Failed"
                },
                intent: event.sessionState ? event.sessionState.intent : null
            },
            messages: [
                {
                    contentType: "PlainText",
                    content: "I'm sorry, I couldn't understand your request. Please try again."
                }
            ]
        };
        console.log('Response:', JSON.stringify(response, null, 2));
        callback(null, response);
        return;
    }

    var distance = parseInt(slots.Distance.value.interpretedValue);                                                                 // distance determines type of disc
    var direction = slots.Direction.value.interpretedValue;                                                                         // direction of pin determines type/angle of shot
    var obstructionConfirmation = slots.Obstruction.value.interpretedValue;
    var obstruction = slots.ObstructionYes ? slots.ObstructionYes.value.interpretedValue : null;
    var disc;
    var angle;
    var message;
    
    if (distance <= 100) {                                                                                                          // Determine disc variable based on distance
        disc = "Putter";
    } else if (distance <= 250) {
        disc = "Mid Range";
    } else if (distance <= 350) {
        disc = "Fairway Driver";
    } else {
        disc = "Distance Driver";
    }
    
    if (direction === "left" || direction === "dogleg left") {                                                                      // Determine angle variable based on direction
        angle = "on a Backhand Hyzer";
    } else if (direction === "right" || direction === "dogleg right") {
        angle = "using a standard Forehand or Backhand turn over if you are feeling fancy";
    } else if (direction === "straight") {
        angle = "Directly at the pin with either a backhand straight shot or forehand flex shot";
    }
    
    if (obstructionConfirmation === "no") {                                                                                         // Determine message based on obstructions
        message = `Based on your current scenario, since you are currently ${distance} feet from the basket, I think that you should go with a ${disc}. You should probably throw your disc ${angle}. Luckily you have no obstructions! That makes your shot a lot easier!`;
    } else {
        message = `Based on your current scenario, since you are currently ${distance} feet from the basket, I think that you should go with a ${disc}. Since you have a ${obstruction} in your way, you should probably throw your ${disc} on a ${angle}.`;
    }
    
    const closingResponses = {                                                          //custom closing response messages to appear after the fulfillment message
        "DiscSelector": "I hope this helped you! :)",
        "DiscSelector": "I hope this helped in your disc selection! :)",
        "DiscSelector": "I hope you nailed that shot!",
    };
    
    const closingMessage = closingResponses[event.sessionState.intent.name] || "Thank you!"

    const response = {
        sessionState: {
            dialogAction: {
                type: "Close",
                fulfillmentState: "Fulfilled"
            },
            intent: {
                name: event.sessionState.intent.name,
                slots: event.sessionState.intent.slots,
                state: "Fulfilled"
            }
        },
        messages: [
            {
                contentType: "PlainText",
                content: message
            },
            {
                contentType: "PlainText",
                content: closingMessage
            }
        ]
    };

    console.log('Response:', JSON.stringify(response, null, 2));        //Troubleshooting log response
    callback(null, response);
};
