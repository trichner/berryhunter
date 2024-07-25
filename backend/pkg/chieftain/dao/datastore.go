package dao

import (
	"context"

	"github.com/jmoiron/sqlx"
	_ "github.com/mattn/go-sqlite3"
)

type DataStore interface {
	Transact(ctx context.Context, t func(ctx context.Context) error) error
	Tx(ctx context.Context) (*sqlx.Tx, error)
	Close() error
}
