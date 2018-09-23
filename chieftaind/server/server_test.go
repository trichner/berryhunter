package server

import (
	"context"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/trichner/berryhunter/chieftaind/client"
	"github.com/trichner/berryhunter/chieftaind/dao"
	"io"
	"net"
	"sync"
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

	clientConn, serverConn := net.Pipe()

	c, err := client.ConnectWithDialer(func() (client.Conn, error) {
		return clientConn, nil
	})
	assert.NoError(t, err)

	// mock dependencies
	dataStore, err := newMockDataStore()
	assert.NoError(t, err)
	dataStore.On("Transact", mock.Anything, mock.Anything).Return(nil)

	playerDao := newMockPlayerDao()
	playerDao.On("UpsertPlayer", mock.Anything, mock.AnythingOfType("dao.Player")).Return()

	// handle server connection
	var wg sync.WaitGroup
	wg.Add(1)
	go func() {
		err := HandleConn(dataStore, playerDao, serverConn)
		assert.Equal(t, err, io.EOF)
		wg.Done()
	}()

	// send some data to the server
	s := generateScoreboard()
	c.Write(s)
	c.Write(s)

	c.Close()

	// wait for the server to receive the messages
	// and ACK the connection close
	wg.Wait()

	playerDao.AssertNumberOfCalls(t, "UpsertPlayer", len(*s)*2)
}

func newMockDataStore() (*mockDataStore, error) {

	ds, err := dao.NewDataStore()
	if err != nil {
		return nil, err
	}

	return &mockDataStore{
		real: ds,
	}, nil
}

type mockDataStore struct {
	mock.Mock
	real dao.DataStore
}

func (ds *mockDataStore) Transact(ctx context.Context, t dao.TransactifiedFunc) error {
	ds.Called(ctx, t)
	t(ctx)
	return nil
}

func (ds *mockDataStore) Close() error {
	ds.Called()
	return ds.real.Close()
}

func newMockPlayerDao() *mockPlayerDao {
	return &mockPlayerDao{}
}

type mockPlayerDao struct {
	mock.Mock
}

func (pd *mockPlayerDao) UpsertPlayer(ctx context.Context, p dao.Player) error {
	pd.Called(ctx, p)
	return nil
}

func (pd *mockPlayerDao) FindPlayers(ctx context.Context) ([]dao.Player, error) {
	pd.Called(ctx)
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
