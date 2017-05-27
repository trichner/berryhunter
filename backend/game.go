package main

import (
	"engo.io/ecs"
	"fmt"
	"github.com/trichner/death-io/backend/conf"
	"github.com/vova616/chipmunk"
	"net/http"
	"sync/atomic"
	"time"
	"github.com/trichner/death-io/backend/net"
	"flag"
	"log"
	"os"
)

type Game struct {
	ecs.World
	space *chipmunk.Space
	tick  uint64
	conf  *conf.Config
}

type wsHandler struct{}

func (h *wsHandler) OnConnected(c *net.Client) {

}

func (h *wsHandler) OnDisconnected(c *net.Client) {

}

func (h *wsHandler) OnMessage(c *net.Client, msg []byte) {

}

func (g *Game) Init(conf *conf.Config) {

	g.conf = conf

	//---- setup systems
	p := newPhysicsSystem(g, 100, 100)
	g.AddSystem(p)

	n := NewNetSystem(g)
	g.AddSystem(n)

	i := NewInputSystem(g)
	g.AddSystem(i)
}

func (g *Game) Run() {

	//TODO move into main
	var dev, help bool
	flag.BoolVar(&dev, "dev", false, "Serve frontend directly")
	flag.BoolVar(&help, "help", false, "Show usage help")
	flag.Parse()
	if help {
		flag.Usage()
		os.Exit(1)
	}

	handleFunc := net.NewHandleFunc(func(c *net.Client) {
		player := NewPlayer(c)
		g.addPlayer(player)
	})

	addr := fmt.Sprintf(":%d", g.conf.Port)
	http.HandleFunc(g.conf.Path, handleFunc)

	if dev {
		log.Print("Using development server.")
		http.Handle("/", http.FileServer(http.Dir("./../frontend")))
	}

	go http.ListenAndServe(addr, nil)
}

func (g *Game) addEntity(e *entity) {
	// Loop over all Systems
	for _, system := range g.Systems() {

		// Use a type-switch to figure out which System is which
		switch sys := system.(type) {

		// Create a case for each System you want to use
		case *PhysicsSystem:
			sys.AddBody(&e.BasicEntity, e.body)
		case *NetSystem:
			sys.AddEntity(e)
		}
	}
}

func (g *Game) addPlayer(p *player) {
	// Loop over all Systems
	for _, system := range g.Systems() {

		// Use a type-switch to figure out which System is which
		switch sys := system.(type) {

		// Create a case for each System you want to use
		case *PhysicsSystem:
			sys.AddPlayer(p)
		case *NetSystem:
			sys.AddPlayer(p)
			// Create a case for each System you want to use
		case *InputSystem:
			sys.AddPlayer(p)
		}
	}
}

const step = float32(33.0 / 1000.0)

func (g *Game) Update() {

	// fixed 33ms steps
	beforeMillis := time.Now().UnixNano() / 1000000

	g.World.Update(step)

	nowMillis := time.Now().UnixNano() / 1000000
	dtMillis := nowMillis - beforeMillis
	fmt.Printf("%10d @ %5d\n", g.tick, dtMillis)

	// needs to be atomic to prevent race conditions
	atomic.AddUint64(&g.tick, 1)
}
