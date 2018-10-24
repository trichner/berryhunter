package sys

import (
	"encoding/binary"
	"encoding/hex"
	"engo.io/ecs"
	"fmt"
	"github.com/google/flatbuffers/go"
	"github.com/trichner/berryhunter/berryhunterd/codec"
	"github.com/trichner/berryhunter/berryhunterd/minions"
	"github.com/trichner/berryhunter/berryhunterd/model"
	"github.com/trichner/berryhunter/chieftaind/client"
	"log"
)

type ScoreboardSystem struct {
	players   []model.PlayerEntity
	clients   []model.ClientEntity
	g         model.Game
	chieftain *client.Client
}

func NewScoreboardSystem(g model.Game) *ScoreboardSystem {

	ccfg := g.Config().ChieftainConfig
	var c *client.Client

	if ccfg != nil {
		var err error
		if c, err = client.Connect(ccfg.Addr); err != nil {
			log.Printf("cannot reach chieftain: %s\n", err)
		}
		log.Println("🏆 connected to chieftain")
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
	players := make([]client.Player, 0, len(d.players))

	for _, p := range d.players {
		players = append(players, client.Player{
			Name:  p.Name(),
			Uuid:  id2uuid(p.Basic().ID()),
			Score: uint(p.Stats().BirthTick), //TODO will overflow
		})
	}

	s := client.Scoreboard(players)
	d.chieftain.Write(&s)
}

//var uuidNs = uuid.Must(uuid.NewRandom())

func id2uuid(id uint64) string {

	idBytes := make([]byte, 8)
	binary.BigEndian.PutUint64(idBytes, id)

	idStr := ""
	idStr = hex.EncodeToString(idBytes[:6])
//	return uuid.NewSHA1(uuidNs, idBytes).String()
	return fmt.Sprintf("c3fea9f7-26b9-4719-b585-%s", idStr)
}

func (d *ScoreboardSystem) Remove(e ecs.BasicEntity) {
	idx := minions.FindBasic(func(i int) model.BasicEntity { return d.players[i] }, len(d.players), e)
	if idx >= 0 {
		//e := p.players[idx]
		d.players = append(d.players[:idx], d.players[idx+1:]...)
	}

	idx = minions.FindBasic(func(i int) model.BasicEntity { return d.clients[i] }, len(d.clients), e)
	if idx >= 0 {
		//e := p.players[idx]
		d.clients = append(d.clients[:idx], d.clients[idx+1:]...)
	}
}
func (d *ScoreboardSystem) Close() error {
	err := d.chieftain.Close()
	d.g = nil
	d.players = nil
	return err
}
