package codec

import (
	"github.com/trichner/berryhunter/api/schema/BerryhunterApi"
	"github.com/google/flatbuffers/go"
	"github.com/trichner/berryhunter/backend/model"
	"github.com/trichner/berryhunter/backend/phy"
	"github.com/trichner/berryhunter/backend/items"
	"log"
	"fmt"
)

type tableInitializer interface {
	Init(buf []byte, i flatbuffers.UOffsetT)
}

func unwrapUnion(msg *BerryhunterApi.ClientMessage, b tableInitializer) error {

	unionTable := new(flatbuffers.Table)
	if msg.Body(unionTable) {
		b.Init(unionTable.Bytes, unionTable.Pos)
		return nil
	}

	return fmt.Errorf("Cannot unwrap union.")
}

func unwrapInput(msg *BerryhunterApi.ClientMessage) *BerryhunterApi.Input {

	i := &BerryhunterApi.Input{}
	err := unwrapUnion(msg, i)
	if err != nil {
		return nil
	}
	return i
}

func unmarshalInput(fbInput *BerryhunterApi.Input) *model.PlayerInput {
	if fbInput == nil {
		return nil
	}

	i := &model.PlayerInput{}

	// umarshal simple scalars
	i.Tick = fbInput.Tick()
	i.Rotation = fbInput.Rotation()

	// parse Movement if existing
	m := fbInput.Movement(nil)
	if m != nil {
		i.Movement = &phy.Vec2f{
			X: m.X(),
			Y: m.Y(),
		}
	}

	// parse Action if existent
	a := fbInput.Action(nil)
	if a != nil {
		i.Action = &model.Action{
			Item: items.ItemID(a.Item()),
			Type: model.ActionType(a.ActionType()),
		}
	}
	return i
}

func unwrapJoin(msg *BerryhunterApi.ClientMessage) *BerryhunterApi.Join {

	i := &BerryhunterApi.Join{}
	err := unwrapUnion(msg, i)
	if err != nil {
		return nil
	}
	return i
}

func unmarshalJoin(j *BerryhunterApi.Join) *model.Join {
	if j == nil {
		return nil
	}

	join := &model.Join{string(j.PlayerName())}
	return join
}

func unwrapCheat(msg *BerryhunterApi.ClientMessage) *BerryhunterApi.Cheat {

	i := &BerryhunterApi.Cheat{}
	err := unwrapUnion(msg, i)
	if err != nil {
		return nil
	}
	return i
}

func unmarshalCheat(c *BerryhunterApi.Cheat) *model.Cheat {
	if c == nil {
		return nil
	}

	cheat := &model.Cheat{string(c.Token()), string(c.Command())}
	return cheat
}

func unwrapChatMessage(msg *BerryhunterApi.ClientMessage) *BerryhunterApi.ChatMessage {

	i := &BerryhunterApi.ChatMessage{}
	err := unwrapUnion(msg, i)
	if err != nil {
		return nil
	}
	return i
}

func unmarshalChatMessage(c *BerryhunterApi.ChatMessage) *model.ChatMessage {
	if c == nil {
		return nil
	}

	cheat := model.ChatMessage(string(c.Message()))
	return &cheat
}

func assertBodyType(msg *BerryhunterApi.ClientMessage, expected byte) {

	bodyType := msg.BodyType()
	if bodyType != expected {
		log.Fatalf("Illegal client message: %s (%d)", BerryhunterApi.EnumNamesClientMessageBody[int(bodyType)], bodyType)
	}
}

func InputMessageFlatbufferUnmarshal(msg *BerryhunterApi.ClientMessage) *model.PlayerInput {

	assertBodyType(msg, BerryhunterApi.ClientMessageBodyInput)
	return unmarshalInput(unwrapInput(msg))
}

func JoinMessageFlatbufferUnmarshal(msg *BerryhunterApi.ClientMessage) *model.Join {

	assertBodyType(msg, BerryhunterApi.ClientMessageBodyJoin)
	return unmarshalJoin(unwrapJoin(msg))
}

func CheatMessageFlatbufferUnmarshal(msg *BerryhunterApi.ClientMessage) *model.Cheat {

	assertBodyType(msg, BerryhunterApi.ClientMessageBodyCheat)
	return unmarshalCheat(unwrapCheat(msg))
}

func ChatMessageFlatbufferUnmarshal(msg *BerryhunterApi.ClientMessage) *model.ChatMessage {

	assertBodyType(msg, BerryhunterApi.ClientMessageBodyChatMessage)
	return unmarshalChatMessage(unwrapChatMessage(msg))
}

func ClientMessageFlatbufferUnmarshal(bytes []byte) *BerryhunterApi.ClientMessage {

	return BerryhunterApi.GetRootAsClientMessage(bytes, 0)
}
