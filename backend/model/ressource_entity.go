package model

import "github.com/trichner/berryhunter/backend/items"

type ResourceEntity struct {
	BaseEntity
	Resource items.Item
}
