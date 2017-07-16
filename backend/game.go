package main

import (
	"engo.io/ecs"
	"fmt"
	"net/http"
	"sync/atomic"
	"time"
	"flag"
	"log"
	"os"
	"github.com/trichner/berryhunter/backend/conf"
	"github.com/trichner/berryhunter/backend/phy"
	"github.com/trichner/berryhunter/backend/net"
	"github.com/trichner/berryhunter/backend/items"
	"github.com/trichner/berryhunter/backend/model"
)

type Game struct {
	ecs.World
	space *phy.Space
	tick  uint64
	conf  *conf.Config
	items items.Registry
}

type wsHandler struct{}

func (h *wsHandler) OnConnected(c *net.Client) {

}

func (h *wsHandler) OnDisconnected(c *net.Client) {

}

func (h *wsHandler) OnMessage(c *net.Client, msg []byte) {

}

func (g *Game) Init(conf *conf.Config, items items.Registry) {
	

	g.conf = conf
	g.items = items

	//---- setup systems
	p := newPhysicsSystem(g, 100, 100)
	g.AddSystem(p)

	n := NewNetSystem(g)
	g.AddSystem(n)

	i := NewInputSystem(g)
	g.AddSystem(i)

	m := NewMobSystem(g)
	g.AddSystem(m)
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
		player := NewPlayer(g.items, c)
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

func (g *Game) AddMobEntity(e model.MobEntity) {

	// Loop over all Systems
	for _, system := range g.Systems() {

		// Use a type-switch to figure out which System is which
		switch sys := system.(type) {

		// Create a case for each System you want to use
		case *PhysicsSystem:
			sys.AddEntity(e)
		case *NetSystem:
			sys.AddEntity(e)
		case *MobSystem:
			sys.AddEntity(e)
		}
	}
}

func (g *Game) AddResourceEntity(e *resourceEntity) {
	// Loop over all Systems
	for _, system := range g.Systems() {

		// Use a type-switch to figure out which System is which
		switch sys := system.(type) {

		// Create a case for each System you want to use
		case *PhysicsSystem:
			sys.AddStaticBody(e.BasicEntity, e.Body)
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
			sys.AddEntity(p)
		case *NetSystem:
			sys.AddPlayer(p)
			// Create a case for each System you want to use
		case *InputSystem:
			sys.AddPlayer(p)
		}
	}
}

const stepMillis = 33.0
const step = float32(stepMillis / 1000.0)

func (g *Game) Update() {

	// fixed 33ms steps
	beforeMillis := time.Now().UnixNano() / 1000000

	g.World.Update(step)

	nowMillis := time.Now().UnixNano() / 1000000
	dtMillis := nowMillis - beforeMillis
	if dtMillis > stepMillis {
		load := dtMillis / stepMillis * 100
		fmt.Printf("Overload! Systems at: %d%%\n", load)
	}

	// needs to be atomic to prevent race conditions
	atomic.AddUint64(&g.tick, 1)
}
