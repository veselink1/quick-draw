package entity

import (
    "time"
    "encoding/json"
    "database/sql"
)

type NullString struct {
    sql.NullString
}

func (ns NullString) MarshalJSON() ([]byte, error) {
    if !ns.Valid {
        return []byte("null"), nil
    }
    return json.Marshal(ns.String)
}

func (ns *NullString) UnmarshalJSON(b []byte) error {
    err := json.Unmarshal(b, &ns.String)
    ns.Valid = (err == nil)
    return err
}

// Room represents a game room.
type Room struct {
    ID  string `json:"id"`
    Frozen bool `json:"frozen"`
    OwnerID string `json:"owner_id"`
    TurnPlayerID NullString `json:"turn_player_id"`
    Players []Player `json:"players"`
    CreatedAt time.Time `json:"created_at"`
    UpdatedAt time.Time `json:"updated_at"`
    State map[string]interface{} `json:"state"`
}

// Player for a room
type Player struct {
    RoomID string `json:"-"`
    User
    State map[string]interface{} `json:"state"`
}
