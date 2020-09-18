package room

import (
	"time"
    "github.com/go-ozzo/ozzo-routing/v2"
    "veselink1/quick-draw/internal/errors"
    "veselink1/quick-draw/pkg/log"
    "veselink1/quick-draw/pkg/pagination"
    "net/http"
    "strconv"
)

// RegisterHandlers sets up the routing of the HTTP handlers.
func RegisterHandlers(r *routing.RouteGroup, service Service, authHandler routing.Handler, logger log.Logger) {
    res := resource{service, logger}

    r.Use(authHandler)

    r.Get("/rooms/<id>", res.get)
    r.Get("/rooms", res.query)

    // the following endpoints require a valid JWT
    r.Post("/rooms", res.create)
    r.Delete("/rooms/<id>", res.delete)
    r.Delete("/rooms", res.deleteAll)
    r.Put("/rooms/<id>", res.putRoom)
    r.Put("/rooms/<id>/freeze", res.putFreeze)
    r.Put("/rooms/<id>/state", res.putState)
    r.Put("/rooms/<id>/player", res.putPlayerState)
    r.Put("/rooms/<id>/turn", res.putTurn)
}

type resource struct {
    service Service
    logger  log.Logger
}

func (r resource) get(c *routing.Context) error {
    var input GetRoomRequest
    lastRefreshAt, err := strconv.ParseInt(c.Query("last_refresh_at", "0"), 10, 64)
    if (err != nil) {
        lastRefreshAt = 0
    }
    input.LastRefreshAt = time.Unix(lastRefreshAt, 0)

    room, err := r.service.Get(c.Request.Context(), c.Param("id"), input)
    if err != nil {
        return err
    }

    return c.Write(room)
}

func (r resource) query(c *routing.Context) error {
    ctx := c.Request.Context()
    count, err := r.service.Count(ctx)
    if err != nil {
        return err
    }
    pages := pagination.NewFromRequest(c.Request, count)
    rooms, err := r.service.Query(ctx, pages.Offset(), pages.Limit())
    if err != nil {
        return err
    }
    pages.Items = rooms
    return c.Write(pages)
}

func (r resource) create(c *routing.Context) error {
    var input CreateRoomRequest
    if err := c.Read(&input); err != nil {
        r.logger.With(c.Request.Context()).Info(err)
        return errors.BadRequest("")
    }
    room, err := r.service.Create(c.Request.Context(), input)
    if err != nil {
        return err
    }

    return c.WriteWithStatus(room, http.StatusCreated)
}

func (r resource) delete(c *routing.Context) error {
    _, err := r.service.LeaveRoom(c.Request.Context(), c.Param("id"))
    if err != nil {
        return err
    }

    return c.Write(map[string]string{})
}

func (r resource) deleteAll(c *routing.Context) error {
    err := r.service.LeaveAllRooms(c.Request.Context())
    if err != nil {
        return err
    }

    return c.Write(map[string]string{})
}

func (r resource) putRoom(c *routing.Context) error {
    var input JoinRoomRequest
    if err := c.Read(&input); err != nil {
        r.logger.With(c.Request.Context()).Info(err)
        return errors.BadRequest("")
    }

    _, err := r.service.Join(c.Request.Context(), c.Param("id"), input)
    if err != nil {
        return err
    }

    return c.Write(map[string]string{})
}

func (r resource) putFreeze(c *routing.Context) error {
    _, err := r.service.Freeze(c.Request.Context(), c.Param("id"))
    if err != nil {
        return err
    }

    return c.Write(map[string]string{})
}

func (r resource) putState(c *routing.Context) error {
    var input SetStateRequest
    if err := c.Read(&input); err != nil {
        r.logger.With(c.Request.Context()).Info(err)
        return errors.BadRequest("")
    }
    _, err := r.service.SetState(c.Request.Context(), c.Param("id"), input)
    if err != nil {
        return err
    }

    return c.Write(map[string]string{})
}

func (r resource) putPlayerState(c *routing.Context) error {
    var input SetPlayerStateRequest
    if err := c.Read(&input); err != nil {
        r.logger.With(c.Request.Context()).Info(err)
        return errors.BadRequest("")
    }
    err := r.service.SetPlayerState(c.Request.Context(), c.Param("id"), input)
    if err != nil {
        return err
    }

    return c.Write(map[string]string{})
}

func (r resource) putTurn(c *routing.Context) error {
    var input ChangeTurnRequest
    if err := c.Read(&input); err != nil {
        r.logger.With(c.Request.Context()).Info(err)
        return errors.BadRequest("")
    }
    _, err := r.service.ChangeTurn(c.Request.Context(), c.Param("id"), input)
    if err != nil {
        return err
    }

    return c.Write(map[string]string{})
}
