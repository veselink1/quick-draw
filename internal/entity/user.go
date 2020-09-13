package entity

// User represents a user.
type User struct {
    ID   string `json:"id"`
    Name string `json:"name"`
}

// GetID returns the user ID.
func (u User) GetID() string {
    return u.ID
}

// GetName returns the user name.
func (u User) GetName() string {
    return u.Name
}
