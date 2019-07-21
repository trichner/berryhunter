package dao

// sudo docker run --rm --name mariadb -it -p 127.0.0.1:3306:3306 -e MYSQL_ROOT_PASSWORD=root mariadb:latest
import (
	"context"
	"database/sql"
	"fmt"
	"github.com/jmoiron/sqlx"
	_ "github.com/mattn/go-sqlite3"
	"log"
	"time"
)

type Player struct {
	Uuid string `db:"uuid"`
	Id   uint   `db:"id"`

	Name  string `db:"name"`
	Score uint   `db:"score"`

	Updated int64 `db:"updated"`
}

type RollingPeriod int

const (
	OneDay RollingPeriod = iota
	OneWeek
	OneMonth
)

type PlayerDao interface {
	UpsertPlayer(ctx context.Context, p Player) error
	FindPlayers(ctx context.Context) ([]Player, error)
	FindTopPlayers(ctx context.Context, limit int) ([]Player, error)
	FindTopPlayersInPeriod(ctx context.Context, limit int, period RollingPeriod) ([]Player, error)
	FindPlayerByUuid(ctx context.Context, uuid string) (*Player, error)
}

type playerDao struct {
	store DataStore
}

func NewPlayerDao(store DataStore) (PlayerDao, error) {

	return &playerDao{store:store}, nil
}

func ConvertTime(t time.Time) int64 {
	return t.Unix()
}

func (p *playerDao) FindPlayers(ctx context.Context) ([]Player, error) {
	tx := p.mustTx(ctx)
	players := []Player{}
	err := tx.Select(&players, "SELECT * FROM player ORDER BY score DESC")
	return players, err
}

func (p *playerDao) FindPlayerByUuid(ctx context.Context, uuid string) (*Player, error) {
	tx := p.mustTx(ctx)
	player := Player{}

	err := tx.Get(&player, "SELECT * FROM player WHERE uuid = ?", uuid)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &player, err
}

func (p *playerDao) FindTopPlayers(ctx context.Context, limit int) ([]Player, error) {
	tx := p.mustTx(ctx)
	players := []Player{}
	err := tx.Select(&players, "SELECT * FROM player ORDER BY score DESC LIMIT ?", limit)
	return players, err
}

func (p *playerDao) FindTopPlayersInPeriod(ctx context.Context, limit int, period RollingPeriod) ([]Player, error) {
	tx := p.mustTx(ctx)
	players := []Player{}

	now := time.Now()
	switch period {
	case OneDay:
		now = now.AddDate(0,0,-1)
		break;
	case OneWeek:
		now = now.AddDate(0,0,-7)
		break;
	case OneMonth:
		now = now.AddDate(0,0,-30)
	}

	sinceDate := ConvertTime(now)
	err := tx.Select(&players,
		`SELECT * 
				FROM player 
				WHERE updated >= ? 
				ORDER BY score DESC 
				LIMIT ?`,
				sinceDate, limit)
	return players, err
}

func (p *playerDao) UpsertPlayer(ctx context.Context, pl Player) error {
	tx := p.mustTx(ctx)

	if len(pl.Uuid) <= 0 {
		return fmt.Errorf("invalid player UUID: " + pl.Uuid)
	}

	_, err := tx.ExecContext(ctx, `
			INSERT INTO player (uuid, name, score, updated) VALUES (?, ?, ?, ?)
			ON DUPLICATE KEY UPDATE name=?, score=?, updated=?
			`, pl.Uuid, pl.Name, pl.Score, pl.Updated, pl.Name, pl.Score, pl.Updated)
	return err
}

func (p *playerDao) mustTx(ctx context.Context) *sqlx.Tx {
	tx, err :=  p.store.Tx(ctx)
	if err != nil {
		log.Fatalf("no transaction found: %s", err)
	}
	return tx
}
