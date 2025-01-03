package chat

import (
	"log"

	"github.com/EngoEngine/ecs"
	"github.com/google/flatbuffers/go"
	"github.com/trichner/berryhunter/pkg/berryhunter/codec"
	"github.com/trichner/berryhunter/pkg/berryhunter/model"
)

type ChatSystem struct {
	players []model.PlayerEntity
}

func New() *ChatSystem {
	return &ChatSystem{}
}

func (*ChatSystem) New(w *ecs.World) {
	log.Println("ChatSystem nominal")
}

func (*ChatSystem) Priority() int {
	return 0
}

func (p *ChatSystem) AddPlayer(player model.PlayerEntity) {
	p.players = append(p.players, player)
}

func (p *ChatSystem) Update(dt float32) {
	for _, player := range p.players {
		updatePlayer(player)
	}
}

func updatePlayer(p model.PlayerEntity) {
	msg := p.Client().NextChatMessage()
	if msg == nil {
		return
	}
	strMsg := string(*msg)
	if len(strMsg) == 0 {
		return
	}
	// cap chat messages to 120 characters
	if len(strMsg) > 120 {
		strMsg = strMsg[:120]
	}
	log.Printf("New message: %s", strMsg)

	builder := flatbuffers.NewBuilder(32)
	entityMessage := codec.EntityMessageFlatbufMarshal(builder, p.Basic().ID(), strMsg)
	builder.Finish(entityMessage)
	bytes := builder.FinishedBytes()

	for v := range p.Viewport().Collisions() {
		usr := v.Shape().UserData
		if usr == nil {
			log.Printf("Missing UserData!")
			continue
		}

		listener, ok := usr.(model.PlayerEntity)
		if !ok {
			continue
		}
		listener.Client().SendMessage(bytes)
	}
}

func (p *ChatSystem) Remove(e ecs.BasicEntity) {
	var delete int = -1
	for index, entity := range p.players {
		if entity.Basic().ID() == e.ID() {
			delete = index
			break
		}
	}
	if delete >= 0 {
		// e := p.players[delete]
		p.players = append(p.players[:delete], p.players[delete+1:]...)
	}
}
