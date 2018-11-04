package api

import (
	"context"
	"encoding/json"
	"github.com/gorilla/mux"
	"github.com/trichner/berryhunter/chieftaind/service"
	"github.com/trichner/berryhunter/chieftaind/dao"
	"log"
	"net/http"
	"time"
)

func NewRouter(ds dao.DataStore, p dao.PlayerDao) http.Handler {
	router := mux.NewRouter()
	router.HandleFunc("/highscores", GetHighScoresHandler(p)).Methods("GET")
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

func GetHighScoresHandler(pdao dao.PlayerDao) http.HandlerFunc {

	return func(w http.ResponseWriter, r *http.Request) {
		scores, err := service.GetScoresPerPeriod(r.Context(), pdao, 1);
		if err != nil {
			w.WriteHeader(500)
			return
		}

		je := json.NewEncoder(w)
		je.Encode(mapScoresToDto(scores))
	}
}

func GetScoreboardHandler(pdao dao.PlayerDao) http.HandlerFunc {

	return func(w http.ResponseWriter, r *http.Request) {
		scores, err := service.GetScoresPerPeriod(r.Context(), pdao, 10);
		if err != nil {
			w.WriteHeader(500)
			return
		}

		je := json.NewEncoder(w)
		je.Encode(mapScoresToDto(scores))
	}
}

func mapScoresToDto(scores service.Scores) scoresDto {
	jsonScores := scoresDto{}

	jsonScores.Daily = mapPlayersToDto(scores.Daily)
	jsonScores.Weekly = mapPlayersToDto(scores.Weekly)
	jsonScores.Monthly = mapPlayersToDto(scores.Monthly)
	jsonScores.Alltime = mapPlayersToDto(scores.Alltime)

	return jsonScores
}

func mapPlayersToDto(players []dao.Player) []playerDto {
	jsonPlayers := make([]playerDto, 0, len(players))
	for _, p := range players {

		t := time.Unix(p.Updated, 0).UTC().Format(time.RFC3339)
		jsonPlayers = append(jsonPlayers, playerDto{
			Uuid:    p.Uuid,
			Name:    p.Name,
			Score:   p.Score,
			Updated: t,
		})
	}
	return jsonPlayers
}

type scoresDto struct {
	Daily	[]playerDto `json:"daily"`
	Weekly	[]playerDto `json:"weekly"`
	Monthly	[]playerDto `json:"monthly"`
	Alltime	[]playerDto `json:"alltime"`
}

type playerDto struct {
	Uuid    string `json:"uuid"`
	Name    string `json:"name"`
	Score   uint   `json:"score"`
	Updated string `json:"updated"`
}
