package server

import (
	"fmt"
	"github.com/stretchr/testify/assert"
	"github.com/trichner/berryhunter/chieftaind/client"
	"github.com/trichner/berryhunter/chieftaind/dao"
	"net"
	"testing"
)

func xTestListenTls(t *testing.T) {
	dataStore, err := dao.NewDataStore()
	assert.NoError(t, err)

	playerDao, err := dao.NewPlayerDao()
	assert.NoError(t, err)

	srv, err := NewServer(dataStore, playerDao)
	go srv.ListenTls("127.0.0.1:3443", "server.crt", "server.key")

}

func TestServer(t *testing.T) {

	fmt.Println("begin test")

	fmt.Println("open pipe")
	clientConn, serverConn := net.Pipe()

	fmt.Println("")
	c, err := client.ConnectWithDialer(func() (client.Conn, error) {
		return clientConn, nil
	})
	assert.NoError(t, err)

	dataStore, err := dao.NewDataStore()
	assert.NoError(t, err)

	playerDao, err := dao.NewPlayerDao()
	assert.NoError(t, err)

	go func() {
		err := HandleConn(dataStore, playerDao, serverConn)
		assert.NoError(t, err)
	}()


	c.Write(generateScoreboard())

	c.Write(generateScoreboard())

}

func generateScoreboard() *client.Scoreboard {
	return &client.Scoreboard{
		client.Player{
			Uuid:"123412341234",
			Name:"TestPlayer",
			Score:9001,
		},
		client.Player{
			Uuid:"kaskdkdkksksk",
			Name:"AnotherPlayer",
			Score:101,
		},
	}
}
