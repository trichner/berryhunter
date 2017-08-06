package codec

import (
	"testing"
	"github.com/google/flatbuffers/go"
	"github.com/trichner/berryhunter/api/schema/BerryhunterApi"
	"github.com/stretchr/testify/assert"
	"github.com/trichner/berryhunter/backend/model"
	"github.com/trichner/berryhunter/backend/items"
	"github.com/trichner/berryhunter/backend/phy"
	"github.com/trichner/berryhunter/backend/net"
)

func TestWelcomeServerMessage(t *testing.T) {

	name := "Test123"
	size := float32(1024.0)

	builder := flatbuffers.NewBuilder(64)
	builder.Finish(WelcomeMessageFlatbufMarshal(builder, name, size))
	bytes := builder.FinishedBytes()

	size = f32ToPx(size)
	msg := BerryhunterApi.GetRootAsServerMessage(bytes, 0)

	msgType := byte(BerryhunterApi.ServerMessageBodyWelcome)
	assert.Equal(t, msgType, msg.BodyType(), "Type matches.")

	unionTable := new(flatbuffers.Table)
	if msg.Body(unionTable) {
		w := &BerryhunterApi.Welcome{}
		w.Init(unionTable.Bytes, unionTable.Pos)

		assert.Equal(t, size, w.MapSize(nil).X(), "Size matches.")
		assert.Equal(t, size, w.MapSize(nil).Y(), "Size matches.")
		assert.Equal(t, name, string(w.ServerName()), "Name matches.")
	}
}

type mockPlayer struct {
	model.BaseEntity
}

func newMockPlayer() model.PlayerEntity {
	p := &mockPlayer{}
	p.BaseEntity = model.NewBaseEntity(nil, BerryhunterApi.EntityTypeCharacter)
	return p
}

func (*mockPlayer) Name() string {
	return "Flint Stone"
}

func (*mockPlayer) Equipped() []items.Item {
	return []items.Item{}
}

func (p *mockPlayer) VitalSigns() *model.PlayerVitalSigns {
	return &model.PlayerVitalSigns{
		Health:          100,
		BodyTemperature: 70,

	}
}

func (mockPlayer) Inventory() *items.Inventory {
	i := items.NewInventory()
	return &i
}

func (mockPlayer) Viewport() phy.DynamicCollider {
	panic("implement me")
}

func (mockPlayer) Client() *net.Client {
	panic("implement me")
}

func (mockPlayer) Update(dt float32) {
	panic("implement me")
}

func (mockPlayer) UpdateInput(next, last *model.PlayerInput) {
	panic("implement me")
}

func (mockPlayer) Position() phy.Vec2f {
	return phy.VEC2F_ZERO
}

func (mockPlayer) AABB() model.AABB {
	return model.AABB{}
}

func (mockPlayer) Radius() float32 {
	return 0.5
}

func TestGameStateServerMessage(t *testing.T) {

	g := GameState{}

	p0 := newMockPlayer()
	p1 := newMockPlayer()

	g.Player = p0
	g.Tick = 17
	g.Entities = []model.Entity{p1}

	builder := flatbuffers.NewBuilder(64)
	builder.Finish(GameStateMessageMarshalFlatbuf(builder, &g))
	bytes := builder.FinishedBytes()

	// decode
	msg := BerryhunterApi.GetRootAsServerMessage(bytes, 0)

	msgType := byte(BerryhunterApi.ServerMessageBodyGameState)
	assert.Equal(t, msgType, msg.BodyType(), "Type matches.")

	unionTable := new(flatbuffers.Table)
	if msg.Body(unionTable) {
		g := &BerryhunterApi.GameState{}
		g.Init(unionTable.Bytes, unionTable.Pos)

		d0 := g.Player(nil)
		assert.Equal(t, p0.Name(), string(d0.Name()), "Name matches.")
		assert.Equal(t, p0.Type(), model.EntityType(d0.EntityType()), "EntityType matches.")
	}
}
