package items

import (
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
)

type registry struct {
	items map[ItemID]*ItemDefinition
}

type Registry interface {
	Get(i ItemID) (Item, error)
	GetByName(name string) (Item, error)
	Items() []*ItemDefinition
}

func RegistryFromFS(fileSystem fs.FS) (*registry, error) {
	r := NewRegistry()

	err := fs.WalkDir(fileSystem, ".", func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return fmt.Errorf("Cannot read '%s': %s", path, err)
		}

		if d.IsDir() {
			return nil
		}

		data, err := fs.ReadFile(fileSystem, path)
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
	if err != nil {
		return nil, err
	}

	r.resolveShallowItems()

	return r, nil
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

			data, err := os.ReadFile(path)
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

	r.resolveShallowItems()

	return r, nil
}

func (r *registry) resolveShallowItems() {
	for _, itemDef := range r.items {
		r.decorateMaterials(itemDef)
		r.decorateReferencedResources(itemDef)
	}
}

func (r *registry) decorateMaterials(itemDef *ItemDefinition) {
	if itemDef.Recipe == nil {
		return
	}

	decoratedMaterials := make([]*ItemStack, 0)
	for _, m := range itemDef.Recipe.Materials {
		item, err := r.GetByName(m.Item.Name)
		if err != nil {
			panic(err)
		}

		decoratedMaterials = append(decoratedMaterials, &ItemStack{item, m.Count})
	}
	itemDef.Recipe.Materials = decoratedMaterials
}

func (r *registry) decorateReferencedResources(itemDef *ItemDefinition) {
	if itemDef.Resource == nil {
		return
	}

	res, err := r.GetByName(itemDef.Resource.Name)
	if err != nil {
		panic(err)
	}

	itemDef.Resource = &res
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
	return &registry{items: make(map[ItemID]*ItemDefinition)}
}

func (r *registry) Add(i *ItemDefinition) error {
	_, ok := r.items[i.ID]
	if ok {
		return fmt.Errorf("Duplicate item ID: %d", i.ID)
	}
	r.items[i.ID] = i
	return nil
}

func (r *registry) Get(i ItemID) (Item, error) {
	def, ok := r.items[i]
	if !ok {
		return Item{}, fmt.Errorf("Cannot find ItemID '%d'", i)
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
