module github.com/trichner/berryhunter/chieftainapi

go 1.12

require github.com/trichner/berryhunter/chieftaind v0.0.0-00010101000000-000000000000

replace github.com/trichner/berryhunter/chieftaind => ../chieftaind

replace github.com/trichner/berryhunter/api/schema/ChieftainApi => ../api/schema/ChieftainApi

replace github.com/trichner/berryhunter/common/fbutil => ../common/fbutil
