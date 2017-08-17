package sys

import (
	"github.com/trichner/berryhunter/backend/model"
	"engo.io/ecs"
	"github.com/trichner/berryhunter/backend/phy"
)

func newCircleEntity(r float32) model.BaseEntity {

	aEntity := model.BaseEntity{BasicEntity: ecs.NewBasic()}
	circle := phy.NewCircle(phy.VEC2F_ZERO, r)

	circle.Shape().UserData = aEntity
	aEntity.Body = circle
	return aEntity
}
