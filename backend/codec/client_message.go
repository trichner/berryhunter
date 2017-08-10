package codec

import (
	"github.com/trichner/berryhunter/api/schema/BerryhunterApi"
	"github.com/google/flatbuffers/go"
	"github.com/trichner/berryhunter/backend/model"
	"github.com/trichner/berryhunter/backend/phy"
	"github.com/trichner/berryhunter/backend/items"
	"log"
)

func unwrapInput(msg *BerryhunterApi.ClientMessage) *BerryhunterApi.Input {

	unionTable := new(flatbuffers.Table)
	if msg.Body(unionTable) {
		i := &BerryhunterApi.Input{}
		i.Init(unionTable.Bytes, unionTable.Pos)
		return i
	}
	return nil
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
			Item: items.ItemEnum(a.Item()),
			Type: model.ActionType(a.ActionType()),
		}
	}
	return i
}

func ClientMessageFlatbufferUnmarshal(bytes []byte) *model.PlayerInput {

	msg := BerryhunterApi.GetRootAsClientMessage(bytes, 0)

	if msg.BodyType() == BerryhunterApi.ClientMessageBodyInput {
		return unmarshalInput(unwrapInput(msg))
	}

	log.Printf("Unhandled client message: %s (%d)", BerryhunterApi.EnumNamesClientMessageBody[int(msg.BodyType())], msg.BodyType())

	return nil
}
