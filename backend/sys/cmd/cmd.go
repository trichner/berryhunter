package cmd

import (
	"engo.io/ecs"
	"fmt"
	"github.com/trichner/berryhunter/backend/items"
	"github.com/trichner/berryhunter/backend/model"
	"log"
	"strconv"
	"strings"
	"github.com/trichner/berryhunter/backend/phy"
	"github.com/trichner/berryhunter/backend/codec"
)

var commands = map[string]Command{
	"GIVE": func(g model.Game, p model.PlayerEntity, arg *string) error {
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
		item, err := g.Items().GetByName(argv[0])
		if err != nil {
			return err
		}

		stack := items.NewItemStack(item, count)
		p.Inventory().AddItem(stack)

		return nil
	},
	"PING": func(g model.Game, p model.PlayerEntity, arg *string) error {

		msg := "PONG"
		if arg != nil && len(*arg) > 0 {
			msg += " " + *arg
		}

		log.Println(msg)

		return nil
	},
	"KILL": func(g model.Game, p model.PlayerEntity, arg *string) error {

		target := p
		if arg != nil && len(*arg) > 0 {
			id, err := strconv.ParseUint(*arg, 10, 64)
			if err != nil {
				return err
			}
			other, err := g.GetEntity(id)
			if err != nil {
				return err
			}
			player, ok := other.(model.PlayerEntity)
			if !ok {
				return fmt.Errorf("Entity %d is not a player.", id)
			}
			target = player
		}

		target.VitalSigns().Health = 0

		return nil
	},
	"WARP": func(g model.Game, p model.PlayerEntity, arg *string) error {

		if arg == nil {
			return fmt.Errorf("No arguments. Usage: 'WARP <X> <Y>'")
		}

		argv := strings.Split(*arg, " ")
		if len(argv) != 2 {
			return fmt.Errorf("To many or too few arguments, expected 2 and got %d", len(argv))
		}

		x, err := strconv.ParseInt(argv[0], 10, 64)
		if err != nil {
			return fmt.Errorf("Cannot parse argument X: %s", err)
		}

		y, err := strconv.ParseInt(argv[1], 10, 64)
		if err != nil {
			return fmt.Errorf("Cannot parse argument Y: %s", err)
		}

		xf := float32(x / codec.Points2px)
		yf := float32(y / codec.Points2px)
		p.SetPosition(phy.Vec2f{xf, yf})

		return nil
	},
}

type CommandSystem struct {
	players  []model.PlayerEntity
	tokens   []string
	commands map[string]Command
	g        model.Game
}

func NewCommandSystem(g model.Game, tokens []string) *CommandSystem {
	return &CommandSystem{tokens: tokens, g: g}
}

func (*CommandSystem) New(w *ecs.World) {

	log.Println("CommandSystem nominal")
}

func (*CommandSystem) Priority() int {
	return -50
}

func (c *CommandSystem) AddPlayer(p model.PlayerEntity) {
	c.players = append(c.players, p)
}

func (c *CommandSystem) Update(dt float32) {

	// handle cheat commands
	for _, player := range c.players {
		cheat := player.Client().NextCheat()
		if cheat == nil {
			continue
		}

		if !c.validateToken(cheat.Token) {
			log.Printf("⛔️ Invalid Cheat Token: %s", cheat.Token)
			continue
		}

		argv := strings.SplitN(cheat.Command, " ", 2)
		if len(argv) < 1 {
			continue
		}
		cmd := strings.ToUpper(argv[0])
		action, ok := commands[cmd]
		if action == nil || !ok {
			log.Printf("⁉️ Invalid Action.")
			continue
		}

		var actionArg *string = nil
		if len(argv) > 1 {
			actionArg = &argv[1]
		}
		err := action(c.g, player, actionArg)
		if err != nil {
			log.Printf("😰 Action '%s' failed.", cmd)
			continue
		}

		log.Printf("😎 Cheated '%s'.", cmd)
	}
}

func (c *CommandSystem) validateToken(token string) bool {

	// TODO authentication!
	return true

	for _, t := range c.tokens {
		if t == token {
			return true
		}
	}
	return false
}

func (c *CommandSystem) Remove(e ecs.BasicEntity) {
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

type Command func(g model.Game, p model.PlayerEntity, arg *string) error
