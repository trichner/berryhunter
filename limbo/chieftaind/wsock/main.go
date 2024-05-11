package wsock

// Copyright 2013 The Gorilla WebSocket Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import (
	"github.com/gorilla/websocket"
	"log"
	"net/http"
)

// serveWs handles websocket requests from the peer.
func serveWs(h func(*Client), upgrader *websocket.Upgrader, w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}

	client := UpgradeClient(conn)

	client.WriteMessage([]byte("Hello World!"))
}

// WsHandleFunc returns a http.HandleFunc that accepts new ws clients and registers them
// with the hub.
func NewHandleFunc(h func(*Client)) http.HandlerFunc {

	upgrader := &websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
		CheckOrigin: func(r *http.Request) bool {
			return true
		},
	}
	return func(w http.ResponseWriter, r *http.Request) {
		serveWs(h, upgrader, w, r)
	}
}
