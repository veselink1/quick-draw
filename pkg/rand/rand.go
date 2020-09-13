package rand

import (
    "math/rand"
    "time"
)

var globalRand *rand.Rand = rand.New(
    rand.NewSource(time.Now().UnixNano()))

func String(length int, charset string) string {
    b := make([]byte, length)
    for i := range b {
        b[i] = charset[globalRand.Intn(len(charset))]
    }
    return string(b)
}
