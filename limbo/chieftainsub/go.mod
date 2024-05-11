module github.com/trichner/berryhunter/chieftainsub

require (
	github.com/trichner/berryhunter/api/schema/ChieftainApi v0.0.0-00010101000000-000000000000
	github.com/trichner/berryhunter/chieftaind v0.0.0-00010101000000-000000000000
	github.com/trichner/berryhunter/common/fbutil v0.0.0-00010101000000-000000000000
)

replace github.com/trichner/berryhunter/api/schema/ChieftainApi => ../api/schema/ChieftainApi

replace github.com/trichner/berryhunter/common/fbutil => ../common/fbutil

replace github.com/trichner/berryhunter/chieftaind => ../chieftaind

go 1.12
