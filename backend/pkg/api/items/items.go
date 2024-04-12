package items

import "embed"

//go:embed *.json **/*.json
var Items embed.FS
