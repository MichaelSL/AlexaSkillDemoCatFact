// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require('ask-sdk-core');

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = GAME_SOUND1 + WELCOME_MESSAGE;
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(HELP_REPROMPT)
            .getResponse();
    }
};

const GameHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && 
        request.intent.name === 'GameIntent'&&
            request.dialogState !== 'COMPLETED';
    },
    handle(handlerInput) {
        
        const request = handlerInput.requestEnvelope.request;
        const filledSlots = request.intent.slots;
        const answer = filledSlots.answerA.value;
        
        let currentQuestionCounter = 0;
        let speechOutput = questionArray[currentQuestionCounter].question;
        let correctAnswer = questionArray[currentQuestionCounter].answer;
        
        // if exists in session, we get currentQuestionCounter and previousAnswer
        let currentIntent = handlerInput.requestEnvelope.request.intent;
        const {attributesManager,responseBuilder} = handlerInput;
        const sessionAttributes = attributesManager.getSessionAttributes();
        if (sessionAttributes[currentIntent.name]) {
        currentQuestionCounter = sessionAttributes[currentIntent.name].currentQuestionCounter;
        correctAnswer =sessionAttributes[currentIntent.name].previousAnswer;
        speechOutput = questionArray[currentQuestionCounter].question;
        console.log("currentQuestionCounter" + currentQuestionCounter);
        }
        if (answer){
        if (answer.toLowerCase() === correctAnswer) {
            speechOutput = CORRECT_ANSWER;
            if (currentQuestionCounter < questionArray.length-1){
            speechOutput = speechOutput + NEXT_QUESTION_MESSAGE + questionArray[currentQuestionCounter+1].question;
            correctAnswer = questionArray[currentQuestionCounter+1].answer;
            }else{
                speechOutput = speechOutput + CONGRATS_MESSAGE;
            }
            currentQuestionCounter++;
            }
            else {
            speechOutput = INCORRECT_ANSWER +" "+ speechOutput;
            }
        }
        // Saving correctAnswer and counter into session
        let previousAnswer = correctAnswer;
        sessionAttributes[currentIntent.name] = {currentQuestionCounter,previousAnswer};
        attributesManager.setSessionAttributes(sessionAttributes);
        
        var response =  handlerInput.responseBuilder
        .speak(speechOutput)
        .reprompt(speechOutput)
        .addElicitSlotDirective("answerA")
        .getResponse();
        return response;
    },
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'You can say hello to me! How can I help?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.stack}`);
        const speakOutput = `Sorry, I had trouble doing what you asked. Please try again.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        GameHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        //IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    )
    .addErrorHandlers(
        ErrorHandler,
    )
    .lambda();

const SKILL_NAME = "Cat Fact";
const WELCOME_MESSAGE = ` Welcome to Cat Fact!. You can start a game, saying "Start Cat Fact game".`;
const GAME_SOUND1 = "<audio src='soundbank://soundlibrary/ui/gameshow/amzn_ui_sfx_gameshow_player1_01'/>";
const HELP_MESSAGE = `You can start a game, saying "Start Cat Fact game"... ¿How can I help?`;
const HELP_REPROMPT = "How can I help?";
const CORRECT_ANSWER = "Correct!";
const INCORRECT_ANSWER = "Incorrect!";
const NEXT_QUESTION_MESSAGE = "Next!";
const CONGRATS_MESSAGE = "Congratulations, the trivia has ended!";
const STOP_MESSAGE = "<say-as interpret-as='interjection'>okey dokey</say-as><s> see you later </s>";

const questionArray = [
    { question: 'Cats are believed to be the only mammals who don’t taste sweetness.', answer: "true" },
    { question: 'Cats don\'t like dogs.', answer: "false" },
    { question: 'Cats are supposed to have 18 toes (five toes on each front paw; four toes on each back paw).', answer: "true" },
    { question: 'Which century was the first Cat Video created?', answer: "19" },
    { question: 'Cats have 230 bones, while humans only have 206.', answer: "true" },
    { question: 'Cat of uncommon color was born in Denmark in 1995. What was the color?', answer: "green" },
    { question: 'Despite popular belief, many cats are actually lactose intolerant.', answer: "true" },
    { question: 'Cats find it threatening when you make direct eye contact with them.', answer: "true" },
    { question: 'Meowing is a behavior that cats developed exclusively to communicate with people.', answer: "true" },
    { question: 'Cats don\'t like to sleep.', answer: "false" }
];