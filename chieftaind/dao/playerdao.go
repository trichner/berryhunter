package dao

// sudo docker run --rm --name mariadb -it -p 127.0.0.1:3306:3306 -e MYSQL_ROOT_PASSWORD=root mariadb:latest
import (
	"context"
	"database/sql"
	"fmt"
	"github.com/jmoiron/sqlx"
	_ "github.com/mattn/go-sqlite3"
	"log"
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
	var modifier string
	switch period {
	case OneDay:
		modifier = "-24 hours"
		break;
	case OneWeek:
		modifier = "-7 days"
		break;
	case OneMonth:
		modifier = "-30 days"
	}
	err := tx.Select(&players,
		`SELECT * 
				FROM player 
				WHERE datetime(updated, 'unixepoch') >= datetime('now', ?) 
				ORDER BY score DESC 
				LIMIT ?`,
				modifier, limit)
	return players, err
}

func (p *playerDao) UpsertPlayer(ctx context.Context, pl Player) error {
	tx := p.mustTx(ctx)

	if len(pl.Uuid) <= 0 {
		return fmt.Errorf("invalid player UUID: " + pl.Uuid)
	}

	_, err := tx.ExecContext(ctx, `
			INSERT INTO player (uuid, name, score, updated) VALUES ($1, $2, $3, $4)
			ON DUPLICATE KEY UPDATE name=$2, score=$3, updated=$4
			`, pl.Uuid, pl.Name, pl.Score, pl.Updated)
	return err
}

func (p *playerDao) mustTx(ctx context.Context) *sqlx.Tx {
	tx, err :=  p.store.Tx(ctx)
	if err != nil {
		log.Fatalf("no transaction found: %s", err)
	}
	return tx
}
