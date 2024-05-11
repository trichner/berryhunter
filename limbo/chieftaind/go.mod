module github.com/trichner/berryhunter/chieftaind

go 1.21

require (
	cloud.google.com/go v0.40.0
	github.com/google/flatbuffers v1.11.0
	github.com/gorilla/mux v1.7.3
	github.com/jmoiron/sqlx v1.2.0
	github.com/mattn/go-sqlite3 v1.10.0
	github.com/trichner/berryhunter/api/schema/ChieftainApi v0.0.0-00010101000000-000000000000
	github.com/trichner/berryhunter/common/fbutil v0.0.0-00010101000000-000000000000
)

replace github.com/trichner/berryhunter/api/schema/ChieftainApi => ../api/schema/ChieftainApi

replace github.com/trichner/berryhunter/common/fbutil => ../common/fbutil
