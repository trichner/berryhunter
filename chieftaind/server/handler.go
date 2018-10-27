package server

import (
	"context"
	"fmt"
	"github.com/trichner/berryhunter/api/schema/ChieftainApi"
	"github.com/trichner/berryhunter/chieftaind/dao"
	"github.com/trichner/berryhunter/chieftaind/framer"
	"github.com/trichner/berryhunter/common/fbutil"
	"log"
	"net"
	"time"
)

type ConnHandler struct {
	store     dao.DataStore
	playerDao dao.PlayerDao
}

func HandleConn(store dao.DataStore, playerDao dao.PlayerDao, conn net.Conn) error {
	ch := &ConnHandler{
		store:     store,
		playerDao: playerDao,
	}
	return ch.handleConn(conn)
}

func (c *ConnHandler) handleConn(conn net.Conn) (err error) {

	// close connections and handle all errors and panics
	defer func() {
		if r := recover(); r != nil {
			e1 := fmt.Errorf("panic: %v", r)
			if err == nil {
				err = e1
			}
		}
		e2 := conn.Close()
		if err == nil {
			err = e2
		}
	}()

	f, err := framer.NewFramer(conn)
	if err != nil {
		return err
	}

	err = c.handleFrames(context.Background(), f)
	if err != nil {
		return err
	}
	return nil
}

func (c *ConnHandler) handleFrames(ctx context.Context, f framer.Framer) error {

	for {
		msg, err := f.ReadMessage()
		if err != nil {
			return err
		}

		// init message scoped transaction
		err = c.store.Transact(ctx, func(ctx context.Context) error {
			return c.handleMessage(ctx, msg)
		})
		if err != nil {
			return err
		}
	}

	return nil
}

func (c *ConnHandler) handleMessage(ctx context.Context, bytes []byte) error {

	log.Printf("rx message")
	msg := ChieftainApi.GetRootAsClientMessage(bytes, 0)
	switch msg.BodyType() {
	case ChieftainApi.ClientMessageBodyScoreboard:
		s := &ChieftainApi.Scoreboard{}
		if err := fbutil.UnwrapUnion(msg, s); err != nil {
			return err
		}
		return c.handleScoreboard(ctx, s)
	}

	return fmt.Errorf("unknown ClientMessage type: %d", msg.BodyType())
}

func (c *ConnHandler) handleScoreboard(ctx context.Context, s *ChieftainApi.Scoreboard) error {

	player := &ChieftainApi.ScoreboardPlayer{}
	for i := 0; i < s.PlayersLength(); i++ {
		s.Players(player, i)
		c.playerDao.UpsertPlayer(ctx, dao.Player{
			Uuid:    string(player.Uuid()),
			Name:    string(player.Name()),
			Score:   uint(player.Score()),
			Updated: time.Now().Unix(),
		})
	}

	return nil
}
