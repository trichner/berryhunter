package sys

import (
	"encoding/binary"
	"encoding/hex"
	"fmt"
	"io"
	"log"
	"time"

	flatbuffers "github.com/google/flatbuffers/go"
	"github.com/trichner/berryhunter/pkg/berryhunter/codec"
	"github.com/trichner/berryhunter/pkg/chieftain/client"

	"github.com/EngoEngine/ecs"
	"github.com/trichner/berryhunter/pkg/berryhunter/minions"
	"github.com/trichner/berryhunter/pkg/berryhunter/model"
)

type ScoreboardUpdateClient interface {
	Write(s *client.Scoreboard)
	io.Closer
}

type ScoreboardSystem struct {
	players   []model.PlayerEntity
	clients   []model.ClientEntity
	g         model.Game
	chieftain ScoreboardUpdateClient
}

func NewScoreboardSystem(g model.Game) *ScoreboardSystem {
	ccfg := g.Config().ChieftainConfig
	var c ScoreboardUpdateClient

	if ccfg != nil && ccfg.Addr != "" {
		var err error
		c, err = client.Connect(&client.Config{
			Addr:           ccfg.Addr,
			CACertFile:     ccfg.CaCertFile,
			ClientCertFile: ccfg.ClientCertFile,
			ClientKeyFile:  ccfg.ClientKeyFile,
		})
		if err != nil {
			log.Printf("cannot reach chieftain at %s: %s\n", ccfg.Addr, err)
		} else {
			log.Println("🏆 connected to chieftain via Socket")
		}
	} else {
		log.Println("no chieftain configuration, skipping")
	}

	return &ScoreboardSystem{g: g, chieftain: c}
}

func (*ScoreboardSystem) Priority() int {
	return -101
}

func (d *ScoreboardSystem) AddPlayer(e model.PlayerEntity) {
	d.players = append(d.players, e)
	d.clients = append(d.clients, e)
}

func (d *ScoreboardSystem) AddSpectator(e model.Spectator) {
	d.clients = append(d.clients, e)
}

func (d *ScoreboardSystem) Update(dt float32) {
	// only send every 10s
	if d.g.Ticks()%300 != 0 {
		return
	}

	scoreboard := model.Scoreboard{
		Players: d.players,
		Tick:    d.g.Ticks(),
	}
	builder := flatbuffers.NewBuilder(32)
	msg := codec.ScoreboardFlatbufMarshal(builder, scoreboard)
	builder.Finish(msg)

	for _, c := range d.clients {
		c.Client().SendMessage(builder.FinishedBytes())
	}

	d.updateChieftain()
}

func (d *ScoreboardSystem) updateChieftain() {
	if d.chieftain == nil {
		return
	}
	if len(d.players) == 0 {
		return
	}

	players := make([]client.Player, len(d.players))
	for i, p := range d.players {
		players[i] = client.Player{
			Name:  p.Name(),
			Uuid:  p.Client().UUID().String(),
			Score: d.g.Ticks() - p.Stats().BirthTick, // TODO will overflow
		}
	}

	s := &client.Scoreboard{
		Players: players,
	}
	d.chieftain.Write(s)
}

// var uuidNs = uuid.Must(uuid.NewRandom())
var serverId = time.Now().UnixNano()

func id2uuid(id uint64) string {
	idBytes := make([]byte, 8)
	binary.LittleEndian.PutUint64(idBytes, id)

	serverBytes := make([]byte, 8)
	binary.LittleEndian.PutUint64(serverBytes, uint64(serverId))

	idStr := hex.EncodeToString(idBytes)
	serverStr := hex.EncodeToString(serverBytes)

	return fmt.Sprintf("1v%s%s", serverStr, idStr)
}

func (d *ScoreboardSystem) Remove(e ecs.BasicEntity) {
	idx := minions.FindBasic(func(i int) model.BasicEntity { return d.players[i] }, len(d.players), e)
	if idx >= 0 {
		// e := p.players[idx]
		d.players = append(d.players[:idx], d.players[idx+1:]...)
	}

	idx = minions.FindBasic(func(i int) model.BasicEntity { return d.clients[i] }, len(d.clients), e)
	if idx >= 0 {
		// e := p.players[idx]
		d.clients = append(d.clients[:idx], d.clients[idx+1:]...)
	}
}

func (d *ScoreboardSystem) Close() error {
	err := d.chieftain.Close()
	d.g = nil
	d.players = nil
	return err
}
