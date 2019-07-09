package chieftainapi

import (
	"encoding/json"
	"fmt"
	"github.com/trichner/berryhunter/chieftaind/dao"
	"github.com/trichner/berryhunter/chieftaind/service"
	"log"
	"net/http"
	"time"
)

var mux = newMux()
var scoreBoardService =

// HelloGet is an HTTP Cloud Function.
func HelloGet(w http.ResponseWriter, r *http.Request) {
	mux.ServeHTTP(w, r)
}

func newMux() *http.ServeMux {
	mux := http.NewServeMux()
	mux.HandleFunc("/highscores", GetHighScoresHandler(s))
	mux.HandleFunc("/scoreboard", GetScoreboardHandler(s))

	return mux
}

func initScoreSerivce() {

}

func GetHighScoresHandler(s service.ScoreService) http.HandlerFunc {

	return func(w http.ResponseWriter, r *http.Request) {
		scores, err := s.ScoresPerPeriod(r.Context(), 1);
		if err != nil {
			log.Printf("Error while serving high scores: %s\n", err)
			w.WriteHeader(500)
			return
		}

		je := json.NewEncoder(w)
		je.Encode(mapScoresToDto(scores))
	}
}

func GetScoreboardHandler(s service.ScoreService) http.HandlerFunc {

	return func(w http.ResponseWriter, r *http.Request) {
		scores, err := s.ScoresPerPeriod(r.Context(), 10);
		if err != nil {
			log.Printf("Error while serving scoreboard: %s\n", err)
			w.WriteHeader(500)
			return
		}

		je := json.NewEncoder(w)
		je.Encode(mapScoresToDto(scores))
	}
}

func mapScoresToDto(scores *service.Scores) scoresDto {
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
