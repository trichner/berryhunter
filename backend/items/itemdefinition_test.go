package items

import (
	"testing"
	"io/ioutil"
	"github.com/stretchr/testify/assert"
	"fmt"
)

func TestParseRecipe(t *testing.T) {

	data, err := ioutil.ReadFile("test-item.json")
	assert.NoError(t, err, "Should read file just fine.")

	recipe, err := parseItemDefinition(data)
	assert.NoError(t, err, "Should parse recipe just fine.")

	fmt.Printf("%+v", recipe)
}

func TestMapRecipe(t *testing.T) {

	data, err := ioutil.ReadFile("test-item.json")
	assert.NoError(t, err, "Should read file just fine.")

	recipe, err := parseItemDefinition(data)
	assert.NoError(t, err, "Should parse recipe just fine.")

	vo, err := recipe.mapToItemDefinition()
	assert.NoError(t, err, "Should parse recipe just fine.")

	fmt.Printf("%+v", vo)
}

func TestCreateRegistry(t *testing.T) {

	r := RegistryFromFiles("../../api/items/")
	assert.NotNil(t, r, "registry should be defined")
	assert.NotEmpty(t, r.Items(), "Should have some items.")

	fmt.Printf("%+v", r)
}
