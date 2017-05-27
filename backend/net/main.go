package net

// Copyright 2013 The Gorilla WebSocket Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import (
	"net/http"
	"log"
	"github.com/gorilla/websocket"
)

// serveWs handles websocket requests from the peer.
func serveWs(h func(*Client), upgrader *websocket.Upgrader, w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}
	client := &Client{
		conn:               conn,
		onConnectedHandler: h,
		send:               make(chan []byte, 256),
		receive:            make(chan []byte, 256),
		quit:               make(chan struct{}, 1),
	}
	client.Run()
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
