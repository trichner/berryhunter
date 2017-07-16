package items

import (
	"os"
	"path/filepath"
	"io/ioutil"
	"log"
	"fmt"
)

type registry struct {
	items map[ItemEnum]*ItemDefinition
}

type Registry interface {
	Get(i ItemEnum) (Item, error)
	Items() []*ItemDefinition
}

func RegistryFromPaths(f ...string) *registry {

	r := NewRegistry()

	for _, path := range f {
		filepath.Walk(path, func(path string, info os.FileInfo, err error) error {
			if !info.Mode().IsRegular() {
				return nil
			}

			data, err := ioutil.ReadFile(path)
			if err != nil {
				log.Printf("Cannot read '%s': %s\n", path, err)
				return nil
			}
			itemParsed, err := parseItemDefinition(data)
			if err != nil {
				log.Printf("Cannot parse '%s': %s\n", path, err)
				return nil
			}
			item, err := itemParsed.mapToItemDefinition()
			if err != nil {
				log.Printf("Cannot map '%s': %s\n", path, err)
				return nil
			}
			r.Add(item)
			return nil
		})
	}

	r.decorateMaterials()

	return r
}

func (r *registry) decorateMaterials() {
	for _, itemDef := range r.items {
		decoratedMaterials := make([]Material, 0)
		for _, m := range itemDef.Recipe.Materials {
			item, err := r.Get(m.Item.ID)
			if err != nil {
				panic(err)
			}

			decoratedMaterials = append(decoratedMaterials, Material{item, m.Count})
		}
		itemDef.Recipe.Materials = decoratedMaterials
	}
}

func NewRegistry() *registry {
	return &registry{items: make(map[ItemEnum]*ItemDefinition)}
}

func (r *registry) Add(i *ItemDefinition) {
	r.items[i.ID] = i
}

func (r *registry) Get(i ItemEnum) (Item, error) {
	def, ok := r.items[i]
	if !ok {
		return Item{}, fmt.Errorf("Cannot find ItemEnum '%d'", i)
	}
	return Item{def}, nil
}

func (r *registry) Items() []*ItemDefinition {
	v := make([]*ItemDefinition, 0, len(r.items))
	for _, value := range r.items {
		v = append(v, value)
	}
	return v
}
