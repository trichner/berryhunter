package mob

import (
	"github.com/trichner/berryhunter/backend/phy"
	"github.com/trichner/berryhunter/backend/model"
)

var _ = model.MobEntity(&aMob{})

type aMob struct {
	health   int
	velocity phy.Vec2f
}
