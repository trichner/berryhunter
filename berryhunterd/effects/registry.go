package effects

import (
	"fmt"
	"io/ioutil"
	"os"
)

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
	return nil, fmt.Errorf("Effect '%s' not found.", name)
}

func (r *registry) Effects() []*Effect {
	var effects []*Effect
	for _, m := range r.effects {
		effects = append(effects, m)
	}
	return effects
}

func (r *registry) add(m *Effect) {
	r.effects[m.ID] = m
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
		// TODO how to read single file
		info, err := os.Lstat(path)
		if err != nil {
			return nil, fmt.Errorf("Cannot read '%s': %s", path, err)
		}

		if !info.Mode().IsRegular() {
			continue
		}

		data, err := ioutil.ReadFile(path)
		if err != nil {
			return nil, fmt.Errorf("Cannot read '%s': %s", path, err)
		}
		effectsParsed, err := parseEffectDefinitions(data)
		if err != nil {
			return nil, fmt.Errorf("Cannot parse '%s': %s", path, err)
		}

		for _, effectParsed := range *effectsParsed {
			effect, err := effectParsed.mapToEffectDefinition()
			if err != nil {
				return nil, fmt.Errorf("Cannot map '%s': %s\n", path, err)
			}
			effects.add(effect)
		}
	}

	return effects, nil
}
