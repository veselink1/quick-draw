package room

import (
    "context"
    "veselink1/quick-draw/internal/entity"
    "veselink1/quick-draw/internal/errors"
    "veselink1/quick-draw/pkg/dbcontext"
    "veselink1/quick-draw/pkg/log"
    dbx "github.com/go-ozzo/ozzo-dbx"
    "database/sql"
    "encoding/json"
)

// Repository encapsulates the logic to access room from the data source.
type Repository interface {
    // Get returns the room with the specified album ID.
    Get(ctx context.Context, id string) (entity.Room, error)
    // Count returns the number of room.
    Count(ctx context.Context) (int, error)
    // Finds the room the user is currently assigned to
    FindByUser(ctx context.Context, userID string) (entity.Room, bool, error)
    // Query returns the list of rooms with the given offset and limit.
    Query(ctx context.Context, offset, limit int) ([]entity.Room, error)
    // Create saves a new room in the storage.
    Create(ctx context.Context, room entity.Room, owner entity.Player) error
    // Update updates the room with given ID in the storage.
    Update(ctx context.Context, room entity.Room) error
    // Delete removes the room with given ID from the storage.
    Delete(ctx context.Context, id string) error
    // Add the user to the room.
    AddPlayer(ctx context.Context, roomID string, player entity.Player) error
    // Remove the user from the room.
    RemovePlayer(ctx context.Context, roomID string, userID string) error
}

// repository persists rooms in database
type repository struct {
    db     *dbcontext.DB
    logger log.Logger
}

// NewRepository creates a new room repository
func NewRepository(db *dbcontext.DB, logger log.Logger) Repository {
    return repository{db, logger}
}

func scanRoomAndPlayers(rows *dbx.Rows) (entity.Room, error) {
    room := &entity.Room{}
    stateJSON := []byte{}

    var nullPlayerID sql.NullString
    var nullPlayerName sql.NullString
    err := rows.Scan(
        &room.ID,
        &room.OwnerID,
        &room.TurnPlayerID,
        &room.Frozen,
        &room.CreatedAt,
        &room.UpdatedAt,
        &stateJSON,
        &nullPlayerID,
        &nullPlayerName,
    )
    if err != nil {
        return entity.Room{}, err
    }

    // The rooms has players
    if nullPlayerID.Valid {
        playerID, _ := nullPlayerID.Value()
        playerName, _ := nullPlayerName.Value()
        player := entity.Player{ User: entity.User{ ID: playerID.(string), Name: playerName.(string) } }
        room.Players = append(room.Players, player)
    }

    err = json.Unmarshal(stateJSON, &room.State)
    if err != nil {
        return *room, err
    }
    return *room, nil
}

func scanRoomNoPlayersNoState(rows *dbx.Rows) (entity.Room, error) {
    room := &entity.Room{}

    var nullPlayerID sql.NullString
    var nullPlayerName sql.NullString
    err := rows.Scan(
        &room.ID,
        &room.OwnerID,
        &room.Frozen,
        &room.CreatedAt,
        &room.UpdatedAt,
        &nullPlayerID,
        &nullPlayerName,
    )
    if err != nil {
        return entity.Room{}, err
    }

    // The rooms has players
    if nullPlayerID.Valid {
        playerID, _ := nullPlayerID.Value()
        if playerID == room.OwnerID {
            playerName, _ := nullPlayerName.Value()
            player := entity.Player{ User: entity.User{ ID: playerID.(string), Name: playerName.(string) } }
            room.Players = append(room.Players, player)
        }
    }

    return *room, nil
}

// Get reads the room with the specified ID from the database.
func (r repository) Get(ctx context.Context, id string) (entity.Room, error) {
    db := r.db.With(ctx)
    query := db.NewQuery(`
        SELECT r.id, r.owner_id, r.turn_player_id, r.frozen, r.created_at, r.updated_at, r.state, p.id, p.name
        FROM room as r
        LEFT JOIN player as p ON r.id = p.room_id
        WHERE r.id = {:id} LIMIT 1
    `)
    query.Bind(dbx.Params{ "id": id })

    rows, err := query.Rows()
    if err != nil {
        return entity.Room{}, err
    }
    if !rows.Next() {
        return entity.Room{}, errors.NotFound("room")
    }

    room, err := scanRoomAndPlayers(rows)
    return room, err
}

// Find the room the user is currently assigned to.
func (r repository) FindByUser(ctx context.Context, userID string) (entity.Room, bool, error) {
    db := r.db.With(ctx)
    query := db.NewQuery(`
        SELECT r.id, r.owner_id, r.turn_player_id, r.frozen, r.created_at, r.updated_at, r.state, p.id, p.name
        FROM room as r
        LEFT JOIN player as p ON r.id = p.room_id
        WHERE p.id = {:id} LIMIT 1
    `)
    query.Bind(dbx.Params{ "id": userID })

    rows, err := query.Rows()
    if err != nil {
        return entity.Room{}, false, err
    }
    if !rows.Next() {
        return entity.Room{}, false, nil
    }

    room, err := scanRoomAndPlayers(rows)
    return room, true, err
}

// Create saves a new room record in the database.
// It returns the ID of the newly inserted room record.
func (r repository) Create(ctx context.Context, room entity.Room, player entity.Player) error {
    if len(room.Players) != 0 {
        return errors.BadRequest("cannot set players for new room")
    }
    err := r.db.Transactional(ctx, func(ctx context.Context) error {
        _, err := r.db.With(ctx).Insert("room", dbx.Params{
            "id": room.ID,
            "owner_id": room.OwnerID,
            "frozen": room.Frozen,
            "created_at": room.CreatedAt,
            "updated_at": room.UpdatedAt,
        }).Execute()
        if err != nil {
            return err
        }

        _, err = r.db.With(ctx).Insert("player", dbx.Params{
            "id": player.ID,
            "name": player.Name,
            "room_id": room.ID,
        }).Execute()
        if err != nil {
            return err
        }

        return nil
    })
    return err
}

// Update saves the changes to a room in the database.
func (r repository) Update(ctx context.Context, room entity.Room) error {
    // query := r.db.With(ctx).NewQuery(`
    //     SELECT r.state
    //     FROM room as r
    //     WHERE r.id = {:id}
    // `)
    // query.Bind(dbx.Params{ "id": room.ID })

    // var mergedState map[string]interface{}
    // query.Row(&mergedState)
    // for k, v := range room.State {
    //     mergedState[k] = v
    // }

    updateRoom := r.db.With(ctx).NewQuery(`
        UPDATE room
        SET created_at = {:created_at}, frozen = {:frozen},
            owner_id = {:owner_id}, state = {:state},
            turn_player_id = {:turn_player_id}, updated_at = {:updated_at}
        WHERE room.id = {:id}
    `)

    stateJSON, err := json.Marshal(room.State)
    if err != nil {
        return err
    }
    updateRoom.Bind(dbx.Params{
        "id": room.ID,
        "created_at": room.CreatedAt,
        "frozen": room.Frozen,
        "owner_id": room.OwnerID,
        "state": stateJSON,
        "updated_at": room.UpdatedAt,
        "turn_player_id": room.TurnPlayerID,
    })
    _, err = updateRoom.Execute()
    return err
}

// Delete deletes a room with the specified ID from the database.
func (r repository) Delete(ctx context.Context, id string) error {
    room, err := r.Get(ctx, id)
    if err != nil {
        return err
    }
    return r.db.With(ctx).Model(&room).Delete()
}

// Count returns the number of the room records in the database.
func (r repository) Count(ctx context.Context) (int, error) {
    var count int
    err := r.db.With(ctx).Select("COUNT(*)").From("room").Row(&count)
    return count, err
}

// Query retrieves the room records with the specified offset and limit from the database.
func (r repository) Query(ctx context.Context, offset, limit int) ([]entity.Room, error) {
    var rooms []entity.Room
    query := r.db.With(ctx).NewQuery(`
        SELECT r.id, r.owner_id, r.frozen, r.created_at, r.updated_at, p.id, p.name
        FROM room as r
        LEFT JOIN player as p ON r.id = p.room_id
        ORDER BY r.id LIMIT {:limit} OFFSET {:offset}
    `)
    query.Bind(dbx.Params{ "limit": limit, "offset": offset })
    rows, err := query.Rows()
    if err != nil {
        return []entity.Room{}, err
    }

    for rows.Next() {
        room, err := scanRoomNoPlayersNoState(rows)
        if err != nil {
            return rooms, err
        }
        rooms = append(rooms, room)
    }

    return rooms, nil
}

// Add the user to the room.
func (r repository) AddPlayer(ctx context.Context, roomID string, player entity.Player) error {
    room, err := r.Get(ctx, roomID)
    if err != nil {
        return err
    }

    if room.Frozen {
        return errors.Forbidden("")
    }

    _, err = r.db.With(ctx).Insert("player", dbx.Params{
        "id": player.ID,
        "name": player.Name,
        "room_id": roomID,
    }).Execute()

    if err != nil {
        return err
    }
    return nil
}

// Remove the user from the room.
func (r repository) RemovePlayer(ctx context.Context, roomID string, userID string) error {
    room, err := r.Get(ctx, roomID)
    if err != nil {
        return err
    }

    if room.Frozen {
        return errors.Forbidden("")
    }

    _, err = r.db.With(ctx).Delete(
        "player",
        dbx.NewExp("id={:id}", dbx.Params{"id": userID}),
    ).Execute()

    if err != nil {
        return err
    }
    return nil
}
