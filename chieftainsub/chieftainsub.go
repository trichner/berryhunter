// Package p contains a Pub/Sub Cloud Function.
package chieftainsub

import (
	"context"
	"fmt"
	"github.com/trichner/berryhunter/api/schema/ChieftainApi"
	"github.com/trichner/berryhunter/chieftaind/dao"
	"github.com/trichner/berryhunter/common/fbutil"
	"log"
	"time"
)

// PubSubMessage is the payload of a Pub/Sub event. Please refer to the docs for
// additional information regarding Pub/Sub events.
type PubSubMessage struct {
	Data []byte `json:"data"`
}

var cloudDataStore DataStore
var playerDao dao.PlayerDao

// called once by GoogleCloudFunction runtime
func init() {

	log.Println("initialising...")
	cloudDataStore = initDatastore()
	playerDao = initPlayerDao(cloudDataStore)
}

func UpdateScoreboardSubscriber(ctx context.Context, m PubSubMessage) error {

	bytes := m.Data

	log.Printf("rx message with length: %d", len(m.Data))
	log.Printf("rx message with string: %s", string(m.Data))

	err := cloudDataStore.Transact(ctx, func(ctx context.Context) error {
		log.Printf("rx message")
		msg := ChieftainApi.GetRootAsClientMessage(bytes, 0)
		switch msg.BodyType() {
		case ChieftainApi.ClientMessageBodyScoreboard:
			s := &ChieftainApi.Scoreboard{}
			if err := fbutil.UnwrapUnion(msg, s); err != nil {
				return err
			}
			return handleScoreboard(ctx, s)
		}

		return fmt.Errorf("unknown ClientMessage type: %d", msg.BodyType())
	})

	return err
}

func handleScoreboard(ctx context.Context, s *ChieftainApi.Scoreboard) error {

	player := &ChieftainApi.ScoreboardPlayer{}
	for i := 0; i < s.PlayersLength(); i++ {
		s.Players(player, i)

		// Logic
		// 1. find entry with uuid
		p, err := playerDao.FindPlayerByUuid(ctx, string(player.Uuid()))

		if err != nil {
			return err
		}

		// 2. player exists and already has a higher score in the db
		if p != nil && p.Score >= uint(player.Score()) {
			// nothing to do here
			continue
		}

		// 3. store new score
		err = playerDao.UpsertPlayer(ctx, dao.Player{
			Uuid:    string(player.Uuid()),
			Name:    string(player.Name()),
			Score:   uint(player.Score()),
			Updated: time.Now().Unix(),
		})
		if err != nil {
			return err
		}
	}

	return nil
}

func initDatastore() DataStore {

	log.Println("initialising datastore")
	dataStore, err := NewCloudDataStore()
	if err != nil {
		log.Fatalf("cannot init cloudStore: %s", err)
	}

	return dataStore
}

func initPlayerDao(store DataStore) dao.PlayerDao {

	log.Println("initialising playerdao")
	playerStore, err := dao.NewPlayerDao(store)
	if err != nil {
		log.Fatalf("cannot init playerDao: %s", err)
	}
	return playerStore
}
