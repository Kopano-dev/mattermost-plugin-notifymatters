/*
 * Copyright 2017 Kopano and its licensors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License, version 3,
 * as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

/*global Vue, parseParams*/
/*eslint-disable no-console */

'use strict';

window.app = new Vue({
    el: '#app',
    data: {
        url: '',
        version: '20171130',
        enabling: null,
        error: null,
        target: null,
        notifications: {}
    },
    created: function() {
        console.info('welcome to mattermost-iframe.js');

        const queryValues = parseParams(location.search.substr(1));
        console.log('URL query values on load', queryValues);

        if (queryValues.url) {
            this.$nextTick(() => {
                this.start(queryValues.url);
            });
        }
    },
    watch: {
    },
    methods: {
        start: async function(url) {
            console.log('start triggered', url);
            this.url = url;
        },
        load: function(event) {
            const target = event.target;
            console.log('load triggered', target, target.getAttribute('src'));
            if (this.enabling !== null) {
                clearTimeout(this.enabling);
                this.enabling = null;
            }
            setTimeout(() => {
                // XXX(longsleep): Timeout is crap.
                this.init(target);
            }, 100);
        },
        init: function(target) {
            console.log('init triggered', target);
            this.target = target;
            window.addEventListener('message', this.receiveMessage, false);

            this.enable();
        },
        enable: function(retry=true) {
            if (retry) {
                this.enabling = setTimeout(() => {
                    console.warn('retrying to enable notifymatters');
                    this.enable(false);
                }, 1000);
            }

            this.sendMessage('enable', Notification.permission);
        },
        sendMessage(cmd, data, ref=null) {
            const {target, version, url} = this;
            const payload = {
                type: 'notifymatters.' + cmd,
                data,
                ref,
                notifymatters: version
            };

            target.contentWindow.postMessage(payload, url);
        },
        receiveMessage(event) {
            console.log('receive message', event, this.enabling);
            if (this.url.indexOf(event.origin) !== 0) {
                // NOTE(longsleep): Check event.origin and ignore if unknown.
                console.warn('received message from invalid origin', event.origin, this.url);
                return;
            }
            if (!event.data || !event.data.type || event.data.notifymatters !== this.version) {
                // Ignore unknown stuff.
                console.warn('received message with unknown content', event.data);
                return;
            }

            switch (event.data.type) {
                case 'notifymatters.ok':
                    if (this.enabling !== null) {
                        clearTimeout(this.enabling);
                        this.enabling = null;
                    }
                    console.info('notifymatters initialized - awesome!');
                    break;

                case 'notifymatters.notification.requestPermission':
                    window.Notification.requestPermission((result) => {
                        this.sendMessage('ref.resolve', result, event.data.ref);
                    });
                    break;

                case 'notifymatters.notification.new': {
                    const notification = new Notification(event.data.data.title, event.data.data.options);
                    this.notifications[event.data.data.id] = notification;
                    notification.onclick = () => {
                        this.sendMessage('notification.onclick', null, event.data.data.id);
                    };
                    notification.onclose = () => {
                        delete this.notifications[event.data.data.id];
                        this.sendMessage('notification.onclose', null, event.data.data.id);
                    };
                    break;
                }

                case 'notifymatters.notification.close': {
                    const notification = this.notifications[event.data.data.id];
                    if (!notification) {
                        return;
                    }
                    notification.close();
                    break;
                }

                default:
                    console.warn('received unknown notifymatters message type', event.data.type);
                    break;
            }
        }
    }
});
