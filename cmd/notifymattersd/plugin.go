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

package main

import (
	"encoding/json"
	"net/http"

	"github.com/mattermost/mattermost-server/plugin"
)

// Plugin defines the Mattermost plugin interface.
type Plugin struct {
	plugin.MattermostPlugin

	// Configuration parameters
	TrustedOrigin string
}

// OnActivate implements the Mattermost plugin interface.
func (p *Plugin) OnActivate() error {
	// TODO: Add configuration validation

	return nil
}

func (p *Plugin) ServeHTTP(c *plugin.Context, rw http.ResponseWriter, req *http.Request) {
	// TODO: Add configuration validation

	switch path := req.URL.Path; path {
	case "/api/v1/config":
		p.handleConfig(rw, req)

	default:
		http.NotFound(rw, req)
	}
}

func (p *Plugin) handleConfig(rw http.ResponseWriter, req *http.Request) {
	userID := req.Header.Get("Mattermost-User-Id")

	if userID == "" {
		http.Error(rw, "", http.StatusUnauthorized)
		return
	}

	config := Configuration{p.TrustedOrigin}

	rw.Header().Set("Content-Type", "application/json")
	rw.WriteHeader(http.StatusOK)

	enc := json.NewEncoder(rw)
	enc.SetIndent("", "  ")

	enc.Encode(config)
}
