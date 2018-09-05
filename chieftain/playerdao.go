package main

// sudo docker run --rm --name mariadb -it -p 127.0.0.1:3306:3306 -e MYSQL_ROOT_PASSWORD=root mariadb:latest
import (
	"context"
	"github.com/jmoiron/sqlx"
	_ "github.com/mattn/go-sqlite3"
)
import _ "github.com/jinzhu/gorm/dialects/sqlite"

type Player struct {
	Uuid string `db:"uuid"`
	Id   uint   `db:"id"`

	Name  string `db:"name"`
	Score uint   `db:"score"`
}

type PlayerDao interface {
	UpsertPlayer(ctx context.Context, p Player) error
	FindPlayers(ctx context.Context) ([]Player, error)
}

type playerDao struct {
}

func NewPlayerDao() (PlayerDao, error) {

	return &playerDao{}, nil
}

func (p *playerDao) FindPlayers(ctx context.Context) ([]Player, error) {
	tx := mustTx(ctx)
	players := []Player{}
	err := tx.Select(&players, "SELECT * FROM player ORDER BY score DESC")
	return players, err
}

func (p *playerDao) UpsertPlayer(ctx context.Context, pl Player) error {
	tx := mustTx(ctx)

	//uid := uuid.New().String()
	_, err := tx.ExecContext(ctx,`
			INSERT INTO player (uuid, name, score) VALUES ($1, $2, $3)
			ON CONFLICT(uuid) DO UPDATE SET name=$2, score=$3
			`, pl.Uuid, pl.Name, pl.Score)
	return err
}

func mustTx(ctx context.Context) *sqlx.Tx {
	tx, ok := ctx.Value(txKey).(*sqlx.Tx)
	if !ok {
		panic("no transaction found")
	}
	return tx
}
