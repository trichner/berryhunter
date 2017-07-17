package items

import (
	"os"
	"path/filepath"
	"io/ioutil"
	"fmt"
)

type registry struct {
	items map[ItemEnum]*ItemDefinition
}

type Registry interface {
	Get(i ItemEnum) (Item, error)
	GetByName(name string) (Item, error)
	Items() []*ItemDefinition
}

func RegistryFromPaths(f ...string) (*registry, error) {

	r := NewRegistry()

	for _, path := range f {
		err := filepath.Walk(path, func(path string, info os.FileInfo, err error) error {
			if err != nil {
				return fmt.Errorf("Cannot read '%s': %s", path, err)
			}

			if !info.Mode().IsRegular() {
				return nil
			}

			data, err := ioutil.ReadFile(path)
			if err != nil {
				return fmt.Errorf("Cannot read '%s': %s", path, err)
			}
			itemParsed, err := parseItemDefinition(data)
			if err != nil {
				return fmt.Errorf("Cannot parse '%s': %s", path, err)
			}
			item, err := itemParsed.mapToItemDefinition()
			if err != nil {
				return fmt.Errorf("Cannot map '%s': %s\n", path, err)
			}
			err = r.Add(item)
			if err != nil {
				return fmt.Errorf("Cannot add '%s': %s\n", path, err)
			}
			return nil
		})

		// bail if there was an error
		if err != nil {
			return nil, err
		}
	}

	r.decorateMaterials()

	return r, nil
}

func (r *registry) decorateMaterials() {
	for _, itemDef := range r.items {
		decoratedMaterials := make([]Material, 0)
		for _, m := range itemDef.Recipe.Materials {
			item, err := r.GetByName(m.Item.Name)
			if err != nil {
				panic(err)
			}

			decoratedMaterials = append(decoratedMaterials, Material{item, m.Count})
		}
		itemDef.Recipe.Materials = decoratedMaterials
	}
}

func (r *registry) GetByName(name string) (Item, error) {
	for _, i := range r.items {
		if i.Name == name {
			return Item{i}, nil
		}
	}
	return Item{}, fmt.Errorf("Cannot find item: %s", name)
}

func NewRegistry() *registry {
	return &registry{items: make(map[ItemEnum]*ItemDefinition)}
}

func (r *registry) Add(i *ItemDefinition) error {

	_, ok := r.items[i.ID]
	if ok {
		return fmt.Errorf("Duplicate item ID: %d", i.ID)
	}
	r.items[i.ID] = i
	return nil
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
