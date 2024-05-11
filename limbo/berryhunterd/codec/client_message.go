package codec

import (
	"github.com/trichner/berryhunter/api/schema/BerryhunterApi"
	"github.com/trichner/berryhunter/berryhunterd/items"
	"github.com/trichner/berryhunter/berryhunterd/model"
	"github.com/trichner/berryhunter/berryhunterd/phy"
	"github.com/trichner/berryhunter/common/fbutil"
)

func unwrapInput(msg *BerryhunterApi.ClientMessage) *BerryhunterApi.Input {

	i := &BerryhunterApi.Input{}
	err := fbutil.UnwrapUnion(msg, i)
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
	err := fbutil.UnwrapUnion(msg, i)
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
	err := fbutil.UnwrapUnion(msg, i)
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
	err := fbutil.UnwrapUnion(msg, i)
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

func InputMessageFlatbufferUnmarshal(msg *BerryhunterApi.ClientMessage) *model.PlayerInput {

	fbutil.AssertBodyType(msg, BerryhunterApi.ClientMessageBodyInput)
	return unmarshalInput(unwrapInput(msg))
}

func JoinMessageFlatbufferUnmarshal(msg *BerryhunterApi.ClientMessage) *model.Join {

	fbutil.AssertBodyType(msg, BerryhunterApi.ClientMessageBodyJoin)
	return unmarshalJoin(unwrapJoin(msg))
}

func CheatMessageFlatbufferUnmarshal(msg *BerryhunterApi.ClientMessage) *model.Cheat {

	fbutil.AssertBodyType(msg, BerryhunterApi.ClientMessageBodyCheat)
	return unmarshalCheat(unwrapCheat(msg))
}

func ChatMessageFlatbufferUnmarshal(msg *BerryhunterApi.ClientMessage) *model.ChatMessage {

	fbutil.AssertBodyType(msg, BerryhunterApi.ClientMessageBodyChatMessage)
	return unmarshalChatMessage(unwrapChatMessage(msg))
}

func ClientMessageFlatbufferUnmarshal(bytes []byte) *BerryhunterApi.ClientMessage {

	return BerryhunterApi.GetRootAsClientMessage(bytes, 0)
}
