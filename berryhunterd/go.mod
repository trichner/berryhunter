module github.com/trichner/berryhunter/berryhunterd

go 1.12

require (
	github.com/EngoEngine/ecs v1.0.3
	github.com/google/flatbuffers v1.11.0
	github.com/google/uuid v1.1.1
	github.com/gorilla/websocket v1.4.0
	github.com/trichner/berryhunter/api/schema/BerryhunterApi v0.0.0-00010101000000-000000000000
	github.com/trichner/berryhunter/chieftaind v0.0.0-00010101000000-000000000000
	github.com/trichner/berryhunter/common/fbutil v0.0.0-00010101000000-000000000000
)

replace github.com/trichner/berryhunter/api/schema/BerryhunterApi => ../api/schema/BerryhunterApi

replace github.com/trichner/berryhunter/api/schema/ChieftainApi => ../api/schema/ChieftainApi

replace github.com/trichner/berryhunter/chieftaind => ../chieftaind

replace github.com/trichner/berryhunter/common/fbutil => ../common/fbutil
