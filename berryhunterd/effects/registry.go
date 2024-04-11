package effects

import (
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
)

type ByID []*Effect

func (a ByID) Len() int           { return len(a) }
func (a ByID) Swap(i, j int)      { a[i], a[j] = a[j], a[i] }
func (a ByID) Less(i, j int) bool { return a[i].ID < a[j].ID }

type effectMap map[EffectID]*Effect

type registry struct {
	effects effectMap
}

func (r *registry) Get(id EffectID) (*Effect, error) {
	mob, ok := r.effects[id]
	if !ok {
		return nil, fmt.Errorf("effect '%d' not found", id)
	}
	return mob, nil
}

func (r *registry) GetByName(name string) (*Effect, error) {
	for _, m := range r.effects {
		if m.Name == name {
			return m, nil
		}
	}
	return nil, fmt.Errorf("effect '%s' not found", name)
}

func (r *registry) Effects() []*Effect {
	var effects []*Effect
	for _, m := range r.effects {
		effects = append(effects, m)
	}
	return effects
}

func (r *registry) add(e *Effect) error {
	_, ok := r.effects[e.ID]
	if ok {
		return fmt.Errorf("duplicate effect ID: %d", e.ID)
	}
	r.effects[e.ID] = e
	return nil
}

func newRegistry() *registry {
	return &registry{effects: make(effectMap)}
}

type Registry interface {
	Get(i EffectID) (*Effect, error)
	GetByName(name string) (*Effect, error)
	Effects() []*Effect
}

func RegistryFromPaths(f ...string) (*registry, error) {

	effects := newRegistry()

	for _, path := range f {
		err := filepath.Walk(path, func(path string, info os.FileInfo, err error) error {
			if err != nil {
				return fmt.Errorf("cannot read '%s': %s", path, err)
			}

			if !info.Mode().IsRegular() {
				return nil
			}

			data, err := ioutil.ReadFile(path)
			if err != nil {
				return fmt.Errorf("cannot read '%s': %s", path, err)
			}
			effectParsed, err := parseEffectDefinition(data)
			if err != nil {
				return fmt.Errorf("cannot parse '%s': %s", path, err)
			}
			effect, err := effectParsed.mapToEffectDefinition()
			if err != nil {
				return fmt.Errorf("Cannot map '%s': %s\n", path, err)
			}
			err = effects.add(effect)
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

	return effects, nil
}
