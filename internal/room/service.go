package room

import (
    "context"
    validation "github.com/go-ozzo/ozzo-validation/v4"
    "veselink1/quick-draw/internal/entity"
    "veselink1/quick-draw/internal/auth"
    "veselink1/quick-draw/internal/errors"
    "veselink1/quick-draw/pkg/log"
    "veselink1/quick-draw/pkg/rand"
    "database/sql"
    "time"
)

// Service encapsulates usecase logic for rooms.
type Service interface {
    Get(ctx context.Context, id string) (Room, error)
    Query(ctx context.Context, offset, limit int) ([]Room, error)
    Count(ctx context.Context) (int, error)
    Create(ctx context.Context, input CreateRoomRequest) (Room, error)
    Join(ctx context.Context, input JoinRoomRequest) (Room, error)
    Freeze(ctx context.Context, id string) (Room, error)
    SetState(ctx context.Context, id string, input SetStateRequest) (Room, error)
    ChangeTurn(ctx context.Context, id string, input ChangeTurnRequest) (Room, error)
    LeaveRoom(ctx context.Context, id string) (Room, error)
    LeaveAllRooms(ctx context.Context) error
}

// Room represents the data about a room
type Room struct {
    entity.Room
}

// CreateRoomRequest is used when creating a room
type CreateRoomRequest struct {
    Passcode string `json:"passcode"`
}

func (m CreateRoomRequest) Validate() error {
    return validation.ValidateStruct(&m,
        validation.Field(&m.Passcode, validation.NotNil, validation.Length(4, 16)),
    )
}

// JoinRoomRequest is used when joining a room
type JoinRoomRequest struct {
    RoomID string `json:"room"`
    Passcode string `json:"passcode"`
}

func (m JoinRoomRequest) Validate() error {
    return validation.ValidateStruct(&m,
        validation.Field(&m.RoomID, validation.Required, validation.Length(4, 16)),
        validation.Field(&m.Passcode, validation.NotNil, validation.Length(4, 16)),
    )
}

// SetStateRequest is used when changing a room's state
type SetStateRequest struct {
    State map[string]interface{} `json:"state"`
}

func (m SetStateRequest) Validate() error {
    if m.State == nil {
        return errors.BadRequest("state cannot be null")
    }
    return nil
}

// ChangeTurnRequest is used when chaning the turn
type ChangeTurnRequest struct {
    TurnPlayerID string `json:"turn_player_id"`
}

func (m ChangeTurnRequest) Validate() error {
    return validation.ValidateStruct(&m,
        validation.Field(&m.TurnPlayerID, validation.NotNil),
    )
}

type service struct {
    repo Repository
    logger log.Logger
}

// Creates a new room service.
func NewService(repo Repository, logger log.Logger) Service {
    return service{repo, logger}
}

// Finds a room by its ID.
func (s service) Get(ctx context.Context, id string) (Room, error) {
    room, err := s.repo.Get(ctx, id)
    if err != nil {
        return Room{}, err
    }
    return Room{room}, nil
}

// Creates a room.
func (s service) Create(ctx context.Context, req CreateRoomRequest) (Room, error) {
    if err := req.Validate(); err != nil {
        return Room{}, err
    }

    user := auth.CurrentUser(ctx)
    if user == nil {
        return Room{}, errors.Unauthorized("")
    }

    otherRoom, valid, err := s.repo.FindByUser(ctx, user.GetID())
    if err != nil {
        return Room{}, err
    }
    if valid {
        return Room{}, errors.BadRequest("cannot create multiple rooms, previous room ID: " + otherRoom.ID)
    }

    id := rand.String(5, "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")
    now := time.Now()
    err = s.repo.Create(ctx, entity.Room{
        ID: id,
        OwnerID: user.GetID(),
        CreatedAt: now,
        UpdatedAt: now,
    }, entity.Player{ User: entity.User{ ID: user.GetID(), Name: user.GetName() } })
    if err != nil {
        return Room{}, err
    }
    return s.Get(ctx, id)
}

// Joins a non-frozen room.
func (s service) Join(ctx context.Context, req JoinRoomRequest) (Room, error) {
    if err := req.Validate(); err != nil {
        return Room{}, err
    }

    user := auth.CurrentUser(ctx)
    if user == nil {
        return Room{}, errors.Unauthorized("")
    }

    room, err := s.Get(ctx, req.RoomID)
    if err != nil {
        return room, err
    }

    for _, v := range room.Room.Players {
        if v.GetID() == user.GetID() {
            return room, errors.BadRequest("Already joined")
        }
    }

    player := entity.Player{ User: entity.User{ ID: user.GetID(), Name: user.GetName() } }
    if err = s.repo.AddPlayer(ctx, req.RoomID, player); err != nil {
        return room, err
    }
    return room, nil
}

// Freezes a room so that no other players can join.
func (s service) Freeze(ctx context.Context, id string) (Room, error) {
    user := auth.CurrentUser(ctx)
    if user == nil {
        return Room{}, errors.Unauthorized("")
    }

    room, err := s.Get(ctx, id)
    if err != nil {
        return room, err
    }

    if room.Room.OwnerID != user.GetID() {
        return room, errors.Unauthorized("Not room host")
    }

    room.Room.Frozen = true
    room.TurnPlayerID = entity.NullString{ sql.NullString{ room.Room.OwnerID, true } }
    if err := s.repo.Update(ctx, room.Room); err != nil {
        return room, err
    }

    return room, nil
}

// Updates the state of the room.
func (s service) SetState(ctx context.Context, id string, req SetStateRequest) (Room, error) {
    if err := req.Validate(); err != nil {
        return Room{}, err
    }

    user := auth.CurrentUser(ctx)
    if user == nil {
        return Room{}, errors.Unauthorized("")
    }

    room, err := s.Get(ctx, id)
    if err != nil {
        return room, err
    }

    if room.Room.OwnerID != user.GetID() {
        return room, errors.Unauthorized("Not room host")
    }

    room.Room.State = req.State
    if err := s.repo.Update(ctx, room.Room); err != nil {
        return room, err
    }

    return room, nil
}

// Changes the turn player of the room.
func (s service) ChangeTurn(ctx context.Context, id string, req ChangeTurnRequest) (Room, error) {
    if err := req.Validate(); err != nil {
        return Room{}, err
    }

    user := auth.CurrentUser(ctx)
    if user == nil {
        return Room{}, errors.Unauthorized("")
    }

    room, err := s.Get(ctx, id)
    if err != nil {
        return room, err
    }

    if room.Room.OwnerID != user.GetID() {
        return room, errors.Unauthorized("Not room host")
    }

    if room.TurnPlayerID.Valid && room.TurnPlayerID.String == req.TurnPlayerID {
        return room, errors.BadRequest("cannot change turn to current player")
    }

    isValidPlayer := false
    for _, p := range room.Room.Players {
        if p.ID == req.TurnPlayerID {
            isValidPlayer = true
            break
        }
    }

    if !isValidPlayer {
        return room, errors.NotFound("no such player in room")
    }

    room.TurnPlayerID = entity.NullString{ sql.NullString{ req.TurnPlayerID, true } }
    if err := s.repo.Update(ctx, room.Room); err != nil {
        return room, err
    }

    return room, nil
}

// Count returns the number of rooms.
func (s service) Count(ctx context.Context) (int, error) {
    return s.repo.Count(ctx)
}

// Query returns the rooms with the specified offset and limit.
func (s service) Query(ctx context.Context, offset, limit int) ([]Room, error) {
    items, err := s.repo.Query(ctx, offset, limit)
    if err != nil {
        return nil, err
    }
    result := []Room{}
    for _, item := range items {
        result = append(result, Room{item})
    }
    return result, nil
}

// Delete deletes the room with the specified ID.
func (s service) LeaveRoom(ctx context.Context, id string) (Room, error) {
    room, err := s.Get(ctx, id)
    if err != nil {
        return Room{}, err
    }

    user := auth.CurrentUser(ctx)
    if user == nil {
        return Room{}, errors.Unauthorized("")
    }

    if user.GetID() == room.OwnerID {
        if err = s.repo.Delete(ctx, id); err != nil {
            return Room{}, err
        }
    } else {
        if err = s.repo.RemovePlayer(ctx, id, user.GetID()); err != nil {
            return Room{}, err
        }
    }

    return room, nil
}

// Delete deletes the room with the specified ID.
func (s service) LeaveAllRooms(ctx context.Context) error {
    user := auth.CurrentUser(ctx)
    if user == nil {
        return errors.Unauthorized("")
    }

    room, valid, err := s.repo.FindByUser(ctx, user.GetID())
    if err != nil {
        return err
    }

    if valid {
        _, err = s.LeaveRoom(ctx, room.ID)
        if err != nil {
            return err
        }
    }

    return nil
}
