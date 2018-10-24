testController("State1Controllers", controllers.state1Controllers, [{
    topic: "mobile_notification",
    handler: controllers.state1Controllers.toState10
}, {
    topic: "mobile_app_settings",
    handler: controllers.state1Controllers.toState11
}], "CC")();

testController("State2Controllers", controllers.state2Controllers, [{
    topic: "driver_auth",
    handler: controllers.state2Controllers.toState20
}, {
    topic: "passenger_auth",
    handler: controllers.state2Controllers.toState21
}, {
    topic: "item_checklist",
    handler: controllers.state2Controllers.toState22
}, {
    topic: "missing_item_beacon",
    handler: controllers.state2Controllers.toState23
}, {
    topic: "missing_item_beacon_map",
    handler: controllers.state2Controllers.toState24
}], "CC")();

testController("State3Controllers", controllers.state3Controllers, [{
    topic: "navigation",
    handler: controllers.state3Controllers.toState30
}, {
    topic: "shared_media",
    handler: controllers.state3Controllers.toState31
}, {
    topic: "shared_media_2",
    handler: controllers.state3Controllers.toState32
}], "CC")();


testController("State4Controllers", controllers.state4Controllers, [{
    topic: "privacy_media_settings",
    handler: controllers.state4Controllers.toState40
}], "CC")();

testController("State5Controllers", controllers.state5Controllers, [{
    topic: "reroute",
    handler: controllers.state5Controllers.toState50
}], "CC")();

testController("State6Controllers", controllers.state6Controllers, [{
    topic: "notification_and_media_mute",
    handler: controllers.state6Controllers.toState60
}, {
    topic: "safe_road_exit_plan",
    handler: controllers.state6Controllers.toState61
}], "CC")();

testController("State7Controllers", controllers.state7Controllers, [{
    topic: "incoming_call",
    handler: controllers.state7Controllers.toState70
}, {
    topic: "calendar_recommendation",
    handler: controllers.state7Controllers.toState71
}, {
    topic: "confirmation",
    handler: controllers.state7Controllers.toState72
}], "CC")();

testController("State8Controllers", controllers.state8Controllers, [{
    topic: "attendee_location_info",
    handler: controllers.state8Controllers.toState80
}, {
    topic: "push_to_smartphone",
    handler: controllers.state8Controllers.toState81
}], "CC")();

testController("State9Controllers", controllers.state9Controllers, [{
    topic: "mobile_attendee_location_info",
    handler: controllers.state9Controllers.toState90
}], "CC")();
