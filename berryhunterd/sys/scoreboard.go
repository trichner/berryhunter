package sys

import (
	"encoding/binary"
	"encoding/hex"
	"fmt"
	"github.com/EngoEngine/ecs"
	"github.com/google/flatbuffers/go"
	"github.com/trichner/berryhunter/berryhunterd/codec"
	"github.com/trichner/berryhunter/berryhunterd/minions"
	"github.com/trichner/berryhunter/berryhunterd/model"
	"github.com/trichner/berryhunter/chieftaind/client"
	"log"
	"time"
)

type ScoreboardSystem struct {
	players   []model.PlayerEntity
	clients   []model.ClientEntity
	g         model.Game
	chieftain client.ScoreboardUpdateClient
}

func NewScoreboardSystem(g model.Game) *ScoreboardSystem {

	ccfg := g.Config().ChieftainConfig
	var c client.ScoreboardUpdateClient

	if ccfg != nil && ccfg.Addr != nil {
		var err error
		addr := *ccfg.Addr
		c, err = client.Connect(addr)
		if err != nil {
			log.Printf("cannot reach chieftain at %s: %s\n", addr, err)
		} else {
			log.Println("🏆 connected to chieftain via Socket")
		}
	} else if ccfg != nil && ccfg.PubSubConfig != nil {
		ps := ccfg.PubSubConfig
		var err error
		c, err = client.NewPubSubClient(ps.ProjectId, ps.TopicId);
		if err != nil {
			log.Printf("cannot reach chieftain: %s\n", err)
		} else {
			log.Println("🏆 connected to chieftain via PubSub")
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

	//d.updateChieftain()
}

func (d *ScoreboardSystem) updateChieftain() {
	if d.chieftain == nil {
		return
	}
	players := make([]client.Player, 0, len(d.players))

	for _, p := range d.players {
		players = append(players, client.Player{
			Name:  p.Name(),
			Uuid:  p.Client().UUID().String(),
			Score: uint64(d.g.Ticks() - p.Stats().BirthTick), //TODO will overflow
		})
	}

	s := client.Scoreboard(players)
	d.chieftain.Write(&s)
}

//var uuidNs = uuid.Must(uuid.NewRandom())

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
