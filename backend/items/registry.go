package items

import (
	"os"
	"path/filepath"
	"io/ioutil"
	"log"
)

type Registry struct {
	items map[ItemEnum]*ItemDefinition
}

func RegistryFromFiles(f ...string) *Registry {

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

	return r
}

func NewRegistry() *Registry {
	return &Registry{items: make(map[ItemEnum]*ItemDefinition)}
}

func (r *Registry) Add(i *ItemDefinition) {
	r.items[i.ID] = i
}

func (r *Registry) Get(i ItemEnum) (Item, bool) {
	def, ok := r.items[i]
	return Item{def}, ok
}

func (r *Registry) Items() []*ItemDefinition {
	v := make([]*ItemDefinition, 0, len(r.items))
	for _, value := range r.items {
		v = append(v, value)
	}
	return v
}
