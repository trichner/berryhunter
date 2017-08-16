package mobs

import (
	"path/filepath"
	"os"
	"fmt"
	"io/ioutil"
	"github.com/trichner/berryhunter/backend/items"
)

type mobMap map[MobID]*MobDefinition

type registry struct {
	mobs mobMap
}

func (r *registry) Get(i MobID) (*MobDefinition, error) {
	mob, ok := r.mobs[i]
	if !ok {
		return nil, fmt.Errorf("MobDefinition '%d' not found.", i)
	}
	return mob, nil
}

func (r *registry) GetByName(name string) (*MobDefinition, error) {
	for _, m := range r.mobs {
		if m.Name == name {
			return m, nil
		}
	}
	return nil, fmt.Errorf("MobDefinition '%s' not found.", name)
}

func (r *registry) Mobs() []*MobDefinition {
	mobs := []*MobDefinition{}
	for _, m := range r.mobs {
		mobs = append(mobs, m)
	}
	return mobs
}

func (r *registry) add(m *MobDefinition) {
	r.mobs[m.ID] = m
}

func newRegistry() *registry {
	return &registry{mobs: make(mobMap)}
}

type Registry interface {
	Get(i MobID) (*MobDefinition, error)
	GetByName(name string) (*MobDefinition, error)
	Mobs() []*MobDefinition
}

func RegistryFromPaths(r items.Registry, f ...string) (*registry, error) {

	mobs := newRegistry()

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
			mobParsed, err := parseMobDefinition(data)
			if err != nil {
				return fmt.Errorf("Cannot parse '%s': %s", path, err)
			}

			mob, err := mobParsed.mapToMobDefinition(r)
			if err != nil {
				return fmt.Errorf("Cannot map '%s': %s\n", path, err)
			}
			mobs.add(mob)
			return nil
		})

		// bail if there was an error
		if err != nil {
			return nil, err
		}
	}

	return mobs, nil
}
