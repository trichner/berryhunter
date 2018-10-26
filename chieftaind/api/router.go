package api

import (
	"context"
	"encoding/json"
	"github.com/gorilla/mux"
	"github.com/trichner/berryhunter/chieftaind/dao"
	"log"
	"net/http"
)

func NewRouter(ds dao.DataStore, p dao.PlayerDao) http.Handler {
	router := mux.NewRouter()
	router.HandleFunc("/scoreboard", GetScoreboardHandler(p)).Methods("GET")

	router.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

			err := ds.Transact(r.Context(), func(ctx context.Context) error {
				r = r.WithContext(ctx)
				next.ServeHTTP(w, r)
				return nil
			})
			if err != nil {
				log.Printf("cannot handle: %s\n", err)
				w.WriteHeader(500)
			}
		})
	})

	return router
}

func GetScoreboardHandler(pdao dao.PlayerDao) http.HandlerFunc {

	return func(w http.ResponseWriter, r *http.Request) {

		p, err := pdao.FindTopPlayers(r.Context(), 100)
		if err != nil {
			w.WriteHeader(500)
			return
		}
		jsonPlayers := mapPlayersToDto(p)

		je := json.NewEncoder(w)
		je.Encode(jsonPlayers)
	}
}

func mapPlayersToDto(players []dao.Player) []playerDto {
	jsonPlayers := make([]playerDto, 0, len(players))
	for _, p := range players {
		jsonPlayers = append(jsonPlayers, playerDto{
			Uuid:  p.Uuid,
			Name:  p.Name,
			Score: p.Score,
		})
	}
	return jsonPlayers
}

type playerDto struct {
	Uuid  string `json:"uuid"`
	Name  string `json:"name"`
	Score uint   `json:"score"`
}
