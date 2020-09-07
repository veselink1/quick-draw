package healthcheck

import (
    "veselink1/quick-draw/internal/test"
    "veselink1/quick-draw/pkg/log"
    "net/http"
    "testing"
)

func TestAPI(t *testing.T) {
    logger, _ := log.NewForTest()
    router := test.MockRouter(logger)
    RegisterHandlers(router, "0.9.0")
    test.Endpoint(t, router, test.APITestCase{
        "ok", "GET", "/healthcheck", "", nil, http.StatusOK, `"OK 0.9.0"`,
    })
}
