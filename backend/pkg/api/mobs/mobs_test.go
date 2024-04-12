package mobs

import (
	"io/fs"
	"testing"

	"github.com/trichner/berryhunter/pkg/be"
)

func TestLsMobs(t *testing.T) {
	entries, err := fs.ReadDir(Mobs, ".")
	be.NoError(t, err)
	be.True(t, len(entries) > 0)
}
