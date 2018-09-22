package main

// Read here: https://github.com/denji/golang-tls

import (
	"context"
	"crypto/tls"
	"github.com/trichner/berryhunter/chieftain/framer"
	"log"
	"net"
)

type FrameHandler func(ctx context.Context, f framer.Framer) error

func ListenTls(laddr, certFile, keyFile string, fh FrameHandler) error {

	cer, err := tls.LoadX509KeyPair(certFile, keyFile)
	if err != nil {
		return err
	}

	config := &tls.Config{Certificates: []tls.Certificate{cer}}
	ln, err := tls.Listen("tcp", laddr, config)
	if err != nil {
		return err
	}
	defer ln.Close()

	for {
		conn, err := ln.Accept()
		if err != nil {
			log.Println(err)
			continue
		}
		go func() {
			defer func() {
				if r := recover(); r != nil {
					log.Println(r)
				}
				conn.Close()
			}()
			if err := handleConnection(conn, fh); err != nil {
				log.Println(err)
			}
		}()
	}
}

func handleConnection(conn net.Conn, fh FrameHandler) error {

	framer, err := framer.NewFramer(conn)
	if err != nil {
		return err
	}

	return fh(context.Background(), framer)
}
