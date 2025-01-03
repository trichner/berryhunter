package minions

import (
	"github.com/EngoEngine/ecs"
	"github.com/trichner/berryhunter/pkg/berryhunter/model"
	"github.com/trichner/berryhunter/pkg/berryhunter/phy"
)

func NewCircleEntity(r float32) model.BaseEntity {
	aEntity := model.BaseEntity{BasicEntity: ecs.NewBasic()}
	circle := phy.NewCircle(phy.VEC2F_ZERO, r)

	circle.Shape().UserData = aEntity
	aEntity.Body = circle
	return aEntity
}

func FindBasic(haystack func(i int) model.BasicEntity, n int, needle ecs.BasicEntity) int {
	for i := 0; i < n; i++ {
		if haystack(i).Basic().ID() == needle.ID() {
			return i
		}
	}
	return -1
}
