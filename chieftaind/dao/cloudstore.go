package dao

import (
	"context"
	"fmt"
	_ "github.com/go-sql-driver/mysql"
	"github.com/jmoiron/sqlx"
	"log"
	"os"
)

const mysqlSchema = `
CREATE TABLE IF NOT EXISTS player (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  uuid VARCHAR(64) NOT NULL UNIQUE,
  name VARCHAR(1024) NOT NULL DEFAULT '',
  score BIGINT(64) NOT NULL DEFAULT 0,
  updated INTEGER NOT NULL DEFAULT 0
)`

type ctxKeyCloudStore int
const txKeyCloudStore = ctxKeyCloudStore(0)

type cloudDataStore struct {
	db *sqlx.DB
}

func (d *cloudDataStore) Transact(ctx context.Context, t TransactifiedFunc) (err error) {
	tx, err := d.db.BeginTxx(ctx, nil)
	if err != nil {
		return
	}
	ctx = context.WithValue(ctx, txKeyCloudStore, tx)
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

func (d *cloudDataStore) Tx(ctx context.Context) (*sqlx.Tx, error) {

	tx, ok := ctx.Value(txKeyCloudStore).(*sqlx.Tx)
	if !ok {
		return nil, fmt.Errorf("no transaction found")
	}
	return tx, nil
}

func (d *cloudDataStore) Close() error {
	return d.db.Close()
}

func NewCloudDataStore() (DataStore, error) {

	var (
		db *sqlx.DB

		connectionName = os.Getenv("MYSQL_INSTANCE_CONNECTION_NAME")
		dbUser         = os.Getenv("MYSQL_USER")
		dbPassword     = os.Getenv("MYSQL_PASSWORD")
		dbSchema       = os.Getenv("MYSQL_SCHEMA")
		dsn            = fmt.Sprintf("%s:%s@unix(/cloudsql/%s)/%s", dbUser, dbPassword, connectionName, dbSchema)
	)

	var err error
	db, err = sqlx.Open("mysql", dsn)
	if err != nil {
		log.Fatalf("Could not open db: %v", err)
	}

	// Only allow 1 connection to the database to avoid overloading it.
	db.SetMaxIdleConns(1)
	db.SetMaxOpenConns(1)

	// exec the schema or fail; multi-statement Exec behavior varies between
	// database drivers;  pq will exec them all, sqlite3 won't, ymmv
	db.MustExec(mysqlSchema)

	return &cloudDataStore{
		db: db,
	}, nil
}
