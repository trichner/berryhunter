package main

import (
	"github.com/trichner/berryhunter/backend/model"
	"engo.io/ecs"
	"log"
	"strings"
	"fmt"
	"strconv"
	"github.com/trichner/berryhunter/backend/items"
)

var commands = map[string]CheatCommand{
	"GIVE": func(g *Game, p model.PlayerEntity, arg *string) error {
		argv := strings.Split(*arg, " ")
		args := len(argv)
		if args < 1 {
			return fmt.Errorf("No arguments provided.")
		}

		var err error
		count := 1
		if len(argv) >= 2 {
			i, err := strconv.ParseInt(argv[1], 10, 32)
			if err != nil {
				return err
			}
			count = int(i)
		}
		item, err := g.items.GetByName(argv[0])
		if err != nil {
			return err
		}

		stack := items.NewItemStack(item, count)
		p.Inventory().AddItem(stack)

		return nil
	},
}

type CheatSystem struct {
	players  []model.PlayerEntity
	tokens   []string
	commands map[string]CheatCommand
	g        *Game
}

func NewCheatSystem(g *Game, tokens []string) *CheatSystem {
	return &CheatSystem{tokens: tokens, g: g}
}

func (*CheatSystem) Priority() int {
	return -50
}

func (c *CheatSystem) AddPlayer(p model.PlayerEntity) {
	c.players = append(c.players, p)
}

func (c *CheatSystem) Update(dt float32) {

	// handle cheat commands
	for _, player := range c.players {
		cheat := player.Client().NextCheat()
		if !c.validateToken(cheat.Token) {
			log.Printf("⛔️ Invalid Cheat Token: %s", cheat.Token)
			continue
		}

		argv := strings.SplitN(cheat.Command, " ", 2)
		if len(argv) < 1 {
			continue
		}
		cmd := strings.ToUpper(argv[0])
		action := commands[cmd]
		if action == nil {
			log.Printf("⁉️ Invalid Action: %s", action)
		}
		var actionArg *string = nil
		if len(argv) > 1 {
			actionArg = &argv[1]
		}
		err := action(c.g, player, actionArg)
		if err != nil {
			log.Printf("😰 Action '%s' failed.", cmd)
		}
		log.Printf("😎 Cheated '%s'.", cmd)
	}
}

func (c *CheatSystem) validateToken(token string) bool {

	// TODO authentication!
	return true

	for _, t := range c.tokens {
		if t == token {
			return true
		}
	}
	return false
}

func (c *CheatSystem) Remove(e ecs.BasicEntity) {
	var delete int = -1
	for index, entity := range c.players {
		if entity.Basic().ID() == e.ID() {
			delete = index
			break
		}
	}
	if delete >= 0 {
		//e := p.players[delete]
		c.players = append(c.players[:delete], c.players[delete+1:]...)
	}
}

type CheatCommand func(g *Game, p model.PlayerEntity, arg *string) error
