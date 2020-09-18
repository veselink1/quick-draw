package auth

import (
    routing "github.com/go-ozzo/ozzo-routing/v2"
    "net/http"
    "net/url"
    "encoding/json"
    "strings"
    "io/ioutil"
    "veselink1/quick-draw/internal/errors"
    "veselink1/quick-draw/internal/entity"
    "veselink1/quick-draw/pkg/log"
)

// RegisterHandlers registers handlers for different HTTP requests.
func RegisterHandlers(rg *routing.RouteGroup, service Service, authHandler routing.Handler, logger log.Logger) {
    rg.Post("/login", login(service, logger))
    rg.Post("/oauth2/github", authenticateGitHub(service))

    rg.Use(authHandler)
    rg.Get("/verify_token", verifyToken(logger))
}

func verifyToken(logger log.Logger) routing.Handler {
    return func(c *routing.Context) error {
        return c.Write(struct {
            Message string `json:"message"`
        }{"Success"})
    }
}

// login returns a handler that handles user login request.
func login(service Service, logger log.Logger) routing.Handler {
    return func(c *routing.Context) error {
        var req struct {
            Username string `json:"username"`
            Password string `json:"password"`
        }

        if err := c.Read(&req); err != nil {
            logger.With(c.Request.Context()).Errorf("invalid request: %v", err)
            return errors.BadRequest("")
        }

        token, err := service.Login(c.Request.Context(), req.Username, req.Password)
        if err != nil {
            return err
        }

        return c.Write(struct {
            Token string `json:"token"`
        }{token})
    }
}

func authenticateGitHub(service Service) routing.Handler {
    return func(c *routing.Context) error {
        var req struct {
            Code string `json:"code"`
        }

        if err := c.Read(&req); err != nil {
            return errors.BadRequest("")
        }

        if len(req.Code) == 0 {
            return errors.BadRequest("code")
        }

        oauth2token, err := getGitHubOAuth2Token(c, req.Code, "")
        if err != nil {
            return err
        }

        user, err := getGitHubUser(c, oauth2token)
        if err != nil {
            return err
        }

        token, err := service.LoginWithIdentity(c.Request.Context(), user)
        if err != nil {
            return err
        }
        return c.Write(struct {
            ID string `json:"id"`
            Name string `json:"name"`
            Token string `json:"token"`
        }{user.ID, user.Name, token})
    }
}

func getGitHubOAuth2Token(c *routing.Context, code string, state string) (string, error) {
    query := url.Values{
        "client_id": []string{"cdb4c174d97d1f1a639c"},
        "client_secret": []string{"2f03dc07f056b481cdfaefd0b393d54f40028e06"},
        "code": []string{code},
        "state": []string{state},
    }

    req, err := http.NewRequestWithContext(
        c.Request.Context(),
        "POST",
        "https://github.com/login/oauth/access_token?" + query.Encode(),
        strings.NewReader(""),
    )
    if err != nil {
        return "", err
    }
    req.Header.Set("Accept", "application/json")

    res, err := http.DefaultClient.Do(req)
    if err != nil {
        return "", err
    }

    var response struct {
        AccessToken string `json:"access_token"`
        TokenType string `json:"token_type"`
        Scope string `json:"scope"`
        Error string `json:"error"`
    }

    bytes,_  := ioutil.ReadAll(res.Body)
    body := string(bytes)

    if err = json.NewDecoder(strings.NewReader(body)).Decode(&response); err != nil {
        return "", err
    }
    res.Body.Close()

    if len(response.AccessToken) == 0 {
        return "", errors.Unauthorized(response.Error)
    }

    return response.AccessToken, nil
}

func getGitHubUser(c *routing.Context, token string) (entity.User, error) {
    req, err := http.NewRequestWithContext(
        c.Request.Context(),
        "GET",
        "https://api.github.com/user",
        strings.NewReader(""),
    )
    if err != nil {
        return entity.User{}, err
    }
    req.Header.Set("Accept", "application/json")
    req.Header.Set("Authorization", "token " + token)

    res, err := http.DefaultClient.Do(req)
    if err != nil {
        return entity.User{}, err
    }

    var response struct {
        Login string `json:"login"`
        Name string `json:"name"`
        Error string `json:"error"`
        // Other fields left out
    }

    if err = json.NewDecoder(res.Body).Decode(&response); err != nil {
        return entity.User{}, err
    }
    res.Body.Close()

    if len(response.Login) == 0 {
        return entity.User{}, errors.Unauthorized(response.Error)
    }

    return entity.User{ ID: response.Login, Name: response.Name }, nil
}
