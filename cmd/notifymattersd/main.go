package main

import (
	"fmt"
	"net/http"

	"github.com/mattermost/mattermost-server/plugin"
	"github.com/mattermost/mattermost-server/plugin/rpcplugin"
)

type HelloUserPlugin struct {
	api plugin.API
}

func (p *HelloUserPlugin) OnActivate(api plugin.API) error {
	// Just save api for later when we need to look up users.
	fmt.Println("XXX activate plugin", api)
	p.api = api

	return nil
}

func (p *HelloUserPlugin) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if userID := r.Header.Get("Mattermost-User-ID"); userID == "" {
		// Our visitor is unauthenticated.
		fmt.Fprintf(w, "Hello, stranger!")
	} else if user, err := p.api.GetUser(userID); err == nil {
		// Greet the user by name!
		fmt.Fprintf(w, "Welcome back, %v!", user.Username)
	} else {
		// This won't happen in normal circumstances, but let's just be safe.
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func main() {
	fmt.Println("XXX starting plugin ...")
	rpcplugin.Main(&HelloUserPlugin{})
}
