package server

import (
	"context"
	"encoding/json"
	"github.com/gorilla/mux"
	"github.com/trichner/berryhunter/chieftaind/dao"
	"github.com/trichner/berryhunter/chieftaind/service"
	"log"
	"net/http"
	"time"
)

func NewRouter(ds dao.DataStore, s service.ScoreService) http.Handler {
	router := mux.NewRouter()
	router.HandleFunc("/scoreboard", GetScoreboardHandler(s)).Methods("POST")

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

func PostScoreBoardHandler(scoreService service.ScoreService) http.HandlerFunc {

	return func(w http.ResponseWriter, r *http.Request) {

		jd := json.NewDecoder(r.Body)

		var scoreBoard scoresDto
		if err := jd.Decode(&scoreBoard); err != nil {
			w.WriteHeader(400)
			return
		}

		scoreService.U

	}
}

type scoresDto struct {
	players	[]playerDto `json:"players"`
}

type playerDto struct {
	Uuid    string `json:"uuid"`
	Name    string `json:"name"`
	Score   uint   `json:"score"`
}

func mapPlayerDtoToPlayer(dto playerDto) dao.Player {
	return dao.Player{
		Uuid:dto.Uuid,
		Name:dto.Name,
		Score:dto.Score,
		Updated: time.Now().Unix(),
	}
}