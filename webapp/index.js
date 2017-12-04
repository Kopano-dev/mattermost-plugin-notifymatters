class NotifyMattersPlugin {
    initialize(registerComponents, store) {
        registerComponents({}, {});
    }
}

global.window.plugins['notifymatters'] = new NotifyMattersPlugin();
