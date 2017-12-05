/*eslint-disable no-console */

import Client from './client/client';

const client = new Client();
const allowedOrigin = 'https://mose4:8917';
const version = '20171130';

class NotifyMattersPlugin {
    initialize(registerComponents, store) {
        console.log('XXX initializing notifymatters plugin ...', store);
        this.version = 1;

        registerComponents({}, {});
    }
}

class NotificationDelegate {
    static permission = 'default';

    static requestPermission(cb) {
        console.log('request permission', cb);

        client.withConfig().then((response) => {
            console.log('xxx', response);
        }).then(() => {
            if (cb) {
                cb('granted');
            }
        });
    }

    constructor(title, options) {
        console.log('notification deletegate new', this, title, options);
    }

    close() {
        console.log('notification delegate close', this);
    }
}

if (window !== window.parent) {
    console.log('notifymatters detected frame, enabling postMessage API.');

    window.addEventListener('message', (event) => {
        if (event.origin !== allowedOrigin) {
            // NOTE(longsleep): Check event.origin and ignore if unknown.
            return;
        }

        console.log('xxx notifymatters received postMessage event', event);
        if (!event.data || !event.data.type || event.data.notifymatters > version) {
            // Ignore unknown stuff.
            return;
        }

        // Initialize stuff.
        NotificationDelegate.Notification = global.window.Notification;
        global.window.Notification = NotificationDelegate;

        switch (event.data.type) {
        case 'notifymatters.enable':
            // Initialize stuff.
            event.source.postMessage({
                type: 'notifymatters.ok',
                notifymatters: event.data.notifymatters,
                state: event.data.state || null
            }, event.origin);
            break;

        default:
            console.warn('notifymatters received unknown message type', event.data.type);
            break;
        }
    }, false);
}

global.window.plugins['notifymatters'] = new NotifyMattersPlugin();
