package chat

import (
	"engo.io/ecs"
	"github.com/trichner/berryhunter/backend/model"
	"log"
	"github.com/trichner/berryhunter/backend/codec"
	"github.com/google/flatbuffers/go"
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

	for v := range p.Viewport().Collisions() {
		usr := v.Shape().UserData
		if usr == nil {
			log.Printf("Missing UserData!")
			continue
		}

		listener, ok := usr.(model.PlayerEntity)
		if !ok {
			log.Printf("Non conformant UserData: %T", usr)
			continue
		}
		builder := flatbuffers.NewBuilder(32)
		entityMessage := codec.EntityMessageFlatbufMarshal(builder, p.Basic().ID(), string(*msg))
		builder.Finish(entityMessage)
		listener.Client().SendMessage(builder.FinishedBytes())
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
		//e := p.players[delete]
		p.players = append(p.players[:delete], p.players[delete+1:]...)
	}
}
