FROM golang:1.8.5 AS go_builder

ENV GOPATH=/go
WORKDIR /go/src/github.com/trichner/berryhunter/

COPY backend/ backend/
COPY api/ api/

WORKDIR /go/src/github.com/trichner/berryhunter/backend/
RUN go get -d -v
RUN CGO_ENABLED=0 GOOS=linux go build -a -o berryhunterd .

# ---- actual image
FROM alpine:latest

ARG CONF=backend/conf.default.json

WORKDIR /root/

# copy api definitions
COPY api/items/ api/items/
COPY api/mobs/ api/mobs/

# copy frontend files together
COPY frontend/ frontend/
COPY api/items/ frontend/js/item-definitions/
COPY api/schema/js/ frontend/js/schema/

# copy backend together
WORKDIR /root/berryhunter/
COPY --from=go_builder /go/src/github.com/trichner/berryhunter/backend/berryhunterd .
COPY $CONF conf.json


EXPOSE 2000
CMD ["./berryhunterd", "--dev"]