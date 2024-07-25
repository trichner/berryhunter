package server

import (
	"context"
	"io"
	"net"
	"testing"
	"time"

	"github.com/trichner/berryhunter/pkg/chieftain/db"

	"github.com/alecthomas/assert/v2"
	"github.com/trichner/berryhunter/pkg/chieftain/client"
	"github.com/trichner/berryhunter/pkg/chieftain/dao"
	"golang.org/x/sync/errgroup"
)

//func xTestListenTls(t *testing.T) {
//	dataStore, err := dao.NewDataStore()
//	assert.NoError(t, err)
//
//	playerDao, err := dao.NewPlayerDao()
//	assert.NoError(t, err)
//
//	srv, err := NewServer(dataStore, playerDao)
//	go srv.ListenTls("127.0.0.1:3443", "server.crt", "server.key")
//}

func TestServer(t *testing.T) {
	clientConn, serverConn := net.Pipe()

	c, err := client.ConnectWithDialer(func() (client.Conn, error) {
		return clientConn, nil
	})
	assert.NoError(t, err)

	// mock dependencies
	dataStore, err := newMockDataStore(t)
	assert.NoError(t, err)
	// dataStore.On("Transact", mock.Anything, mock.Anything).Return(nil)

	playerDao := newMockPlayerDao()
	// playerDao.On("UpsertPlayer", mock.Anything, mock.AnythingOfType("dao.Player")).Return()

	// handle server connection
	wg := new(errgroup.Group)
	wg.Go(func() error {
		return HandleConn(dataStore, playerDao, serverConn)
	})

	// send some data to the server
	s := generateScoreboard()
	c.Write(s)
	c.Write(s)

	c.Close()

	// wait for the server to receive the messages
	// and ACK the connection close
	err = wg.Wait()
	assert.Equal(t, err, io.EOF)
}

func newMockDataStore(t *testing.T) (dao.DataStore, error) {
	return db.New(t.TempDir() + "/test.db")
}

func newMockPlayerDao() dao.PlayerDao {
	return &mockPlayerDao{
		scoreboard: generateScoreboard(),
	}
}

type mockPlayerDao struct {
	scoreboard *client.Scoreboard
}

func (pd *mockPlayerDao) FindTopPlayers(ctx context.Context, limit int) ([]dao.Player, error) {
	// TODO implement me
	panic("implement me")
}

func (pd *mockPlayerDao) FindTopPlayersInPeriod(ctx context.Context, limit int, period dao.RollingPeriod) ([]dao.Player, error) {
	// TODO implement me
	panic("implement me")
}

func (pd *mockPlayerDao) FindPlayerByUuid(ctx context.Context, uuid string) (*dao.Player, error) {
	return &dao.Player{
		Uuid:    uuid,
		Id:      1,
		Name:    "Tobi",
		Score:   1345,
		Updated: time.Now().Unix(),
	}, nil
}

func (pd *mockPlayerDao) UpsertPlayer(ctx context.Context, p dao.Player) error {
	return nil
}

func (pd *mockPlayerDao) FindPlayers(ctx context.Context) ([]dao.Player, error) {
	panic("implement me")
}

func generateScoreboard() *client.Scoreboard {
	return &client.Scoreboard{
		client.Player{
			Uuid:  "123412341234",
			Name:  "TestPlayer",
			Score: 9001,
		},
		client.Player{
			Uuid:  "kaskdkdkksksk",
			Name:  "AnotherPlayer",
			Score: 101,
		},
	}
}
