var util = require('util'),
    brokerNames = require('./constants/eventBrokerNames.js'),
    _ = require('underscore'),
    pubSub = require('pub-sub'),
    eventBroker = function () {
        var eventBroker,
            totallyLameArray = [],
            init = function () {
                eventBroker = pubSub.getEventBroker(brokerNames.PhotoCopy);
            },
            safeSubscribe = function (eventInfo) {
                try {
                    totallyLameArray.push(eventInfo);
                    eventBroker.subscribe(eventInfo);
                } catch (error) {
                    console.log('How does this happen? Error:' + error.message);
                }
            },
            safePublish = function (eventInfo) {
                try {
                    eventBroker.publish(eventInfo);
                } catch (error) {
                    console.log('In event handler <' + eventInfo.getName() + '> Error: ' + error.message);
                }
            },
            unsubscribeAll = function () {
                _.each(totallyLameArray, function (eventInfo) {
                    console.log('Unsubscribing from ' + util.inspect(eventInfo, {depth: 2, colors: true}));
                    eventBroker.unsubscribe(eventInfo);
                });

                totallyLameArray = [];
            };

        init();

        return {
            subscribe: safeSubscribe,
            unsubscribe: eventBroker.unsubscribe,
            unsubscribeAll: unsubscribeAll,
            publish: safePublish,
            createEventInfo: pubSub.createEvent
        };
    };

module.exports = eventBroker();
