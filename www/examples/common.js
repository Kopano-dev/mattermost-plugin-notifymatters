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

function parseParams(s) {
    if (!s) {
        return {};
    }
    let pieces = s.split('&');
    let data = {};
    let parts;
    for (let i = 0; i < pieces.length; i++) {
        parts = pieces[i].split('=');
        if (parts.length < 2) {
            parts.push('');
        }
        data[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
    }

    return data;
}
