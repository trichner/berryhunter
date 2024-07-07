package db

import (
	"context"
	"fmt"
	"github.com/jmoiron/sqlx"
	_ "github.com/mattn/go-sqlite3"
)

const schema = `
CREATE TABLE IF NOT EXISTS player (
  id INTEGER PRIMARY KEY, -- no AUTO_INCREMENT necessary in db
  uuid VARCHAR(64) NOT NULL UNIQUE,
  name VARCHAR(1024) NOT NULL DEFAULT '',
  score BIGINT(64) NOT NULL DEFAULT 0,
  updated INTEGER NOT NULL DEFAULT 0
)`

type ctxKey int

const txKey = ctxKey(0)

type DB struct {
	db *sqlx.DB
}

func New(dbfile string) (*DB, error) {
	db, err := sqlx.Connect("sqlite3", dbfile)
	if err != nil {
		return nil, err
	}

	// exec the schema or fail; multi-statement Exec behavior varies between
	// database drivers;  pq will exec them all, sqlite3 won't, ymmv
	db.MustExec(schema)

	return &DB{
		db: db,
	}, nil
}

func (d *DB) Transact(ctx context.Context, t func(ctx context.Context) error) (err error) {
	tx, err := d.db.BeginTxx(ctx, nil)
	if err != nil {
		return
	}
	ctx = context.WithValue(ctx, txKey, tx)
	defer func() {
		if p := recover(); p != nil {
			tx.Rollback()
			panic(p) // re-throw panic after Rollback
		} else if err != nil {
			tx.Rollback() // err is non-nil; don't change it
		} else {
			err = tx.Commit() // err is nil; if Commit returns error update err
		}
	}()
	err = t(ctx)
	return
}

func (d *DB) Tx(ctx context.Context) (*sqlx.Tx, error) {
	tx, ok := ctx.Value(txKey).(*sqlx.Tx)
	if !ok {
		return nil, fmt.Errorf("no transaction found")
	}
	return tx, nil
}

func (d *DB) Close() error {
	return d.db.Close()
}
