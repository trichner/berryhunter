package items

import (
	"io/fs"
	"testing"

	"github.com/trichner/berryhunter/pkg/be"
)

func TestLsItems(t *testing.T) {
	entries, err := fs.ReadDir(Items, ".")
	be.NoError(t, err)
	be.True(t, len(entries) > 0)
}
