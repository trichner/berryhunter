package items

type ItemContainer interface {
	Inventory() *Inventory
}

type Crafter interface {
	Craft(r *Recipe) bool
}
