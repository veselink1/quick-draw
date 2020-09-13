package room

import (
    "context"
    "database/sql"
    "veselink1/quick-draw/internal/entity"
    "veselink1/quick-draw/internal/test"
    "veselink1/quick-draw/pkg/log"
    "github.com/stretchr/testify/assert"
    "testing"
    "time"
)

func TestRepository(t *testing.T) {
    logger, _ := log.NewForTest()
    db := test.DB(t)
    test.ResetTables(t, db, "room")
    repo := NewRepository(db, logger)

    ctx := context.Background()

    // initial count
    count, err := repo.Count(ctx)
    assert.Nil(t, err)

    // create
    err = repo.Create(ctx, entity.Room{
        ID: "XIASD",
        Owner: entity.Player{ User: entity.User{ ID: "1", Name: "Veselin" } },
        Players: []entity.Player{},
        CreatedAt: time.Now(),
        UpdatedAt: time.Now(),
    })
    assert.Nil(t, err)
    count2, _ := repo.Count(ctx)
    assert.Equal(t, 1, count2-count)
}
