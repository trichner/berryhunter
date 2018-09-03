package main

// sudo docker run --rm --name mariadb -it -p 127.0.0.1:3306:3306 -e MYSQL_ROOT_PASSWORD=root mariadb:latest
import (
	uuid2 "github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	_ "github.com/mattn/go-sqlite3"
)
import _ "github.com/jinzhu/gorm/dialects/sqlite"

type Player struct {
	Uuid string `db:"uuid"`
	Id uint `db:"id"`

	Name string `db:"name"`
	Score uint `db:"score"`
}

type PlayerDao interface {
	UpdatePlayer(p Player) error

	FindPlayers() ([]Player, error)
	Close() error
}

// CREATE SCHEMA `test` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ;
const schema = `
CREATE TABLE IF NOT EXISTS player (
  id INTEGER PRIMARY KEY, -- no AUTO_INCREMENT necessary in sqlite3
  uuid VARCHAR(64) NOT NULL UNIQUE,
  name VARCHAR(1024) NOT NULL DEFAULT '',
  score BIGINT(64) NOT NULL DEFAULT 0
  -- UNIQUE KEY (uuid)
)`

type playerDao struct {
	db *sqlx.DB
}

func NewPlayerDao() (PlayerDao, error) {

	db, err := sqlx.Connect("sqlite3", "./test.db")
	if err != nil {
		return nil, err
	}

	// exec the schema or fail; multi-statement Exec behavior varies between
	// database drivers;  pq will exec them all, sqlite3 won't, ymmv
	db.MustExec(schema)

	uid := uuid2.New().String()
	db.MustExec("INSERT INTO player (uuid, name, score) VALUES ('" + uid + "', 'Hans Jakobli', 939)")

	return &playerDao{
		db:db,
	}, nil
}

func (p *playerDao) FindPlayers() ([]Player, error){
	players := []Player{}
	err := p.db.Select(&players, "SELECT * FROM player ORDER BY score DESC")

	return players, err
}

func (p *playerDao) UpdatePlayer(pl Player) error {

	return nil
}

func (p *playerDao) Close() error {

	return p.db.Close()
}
