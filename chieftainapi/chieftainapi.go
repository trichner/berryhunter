package chieftainapi

import (
	"context"
	"encoding/json"
	"github.com/trichner/berryhunter/chieftaind/dao"
	"github.com/trichner/berryhunter/chieftaind/service"
	"log"
	"net/http"
	"time"
)

var dataStore = initDatastore()
var playerDao = initPlayerDao(dataStore)
var scoreService = initScoreSerivce()
var mux = newMux(scoreService)

// CloudFunction entrypoint
func Mux(w http.ResponseWriter, r *http.Request) {
		err := dataStore.Transact(r.Context(), func(ctx context.Context) error {
			r = r.WithContext(ctx)
			mux.ServeHTTP(w, r)
			return nil
		})
		if err != nil {
			log.Printf("cannot handle: %s\n", err)
			w.WriteHeader(500)
		}
}

func newMux(service service.ScoreService) *http.ServeMux {
	mux := http.NewServeMux()
	mux.HandleFunc("/highscores", GetHighScoresHandler(service))
	mux.HandleFunc("/scoreboard", GetScoreboardHandler(service))

	return mux
}

func initScoreSerivce() service.ScoreService {

	dataStore := initDatastore()
	playerDao := initPlayerDao(dataStore)

	service, err := service.NewScoreService(playerDao)
	if err != nil {
		log.Fatalf("cannot init scoreService: %s", err)
	}

	return service
}

func initDatastore() dao.DataStore {

	log.Println("initialising datastore")
	dataStore, err := dao.NewCloudDataStore()
	if err != nil {
		log.Fatalf("cannot init cloudStore: %s", err)
	}

	return dataStore
}

func initPlayerDao(store dao.DataStore) dao.PlayerDao {

	log.Println("initialising playerdao")
	playerStore, err := dao.NewPlayerDao(store)
	if err != nil {
		log.Fatalf("cannot init playerDao: %s", err)
	}
	return playerStore
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
