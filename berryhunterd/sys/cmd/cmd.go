package cmd

import (
	"engo.io/ecs"
	"fmt"
	"github.com/google/flatbuffers/go"
	"github.com/trichner/berryhunter/berryhunterd/codec"
	"github.com/trichner/berryhunter/berryhunterd/items"
	"github.com/trichner/berryhunter/berryhunterd/minions"
	"github.com/trichner/berryhunter/berryhunterd/model"
	"github.com/trichner/berryhunter/berryhunterd/phy"
	"log"
	"strconv"
	"strings"
)

var commands = map[string]Command{
	"GIVE": func(g model.Game, p model.PlayerEntity, arg *string) error {
		argv := strings.Split(*arg, " ")
		args := len(argv)
		if args < 1 {
			return fmt.Errorf("no arguments provided")
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


		builder := flatbuffers.NewBuilder(32)
		acceptMsg := codec.PongMessageFlatbufMarshal(builder)
		builder.Finish(acceptMsg)
		p.Client().SendMessage(builder.FinishedBytes())

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
				return fmt.Errorf("entity %d is not a player", id)
			}
			target = player
		}

		target.VitalSigns().Health = 0

		return nil
	},
	"WARP": func(g model.Game, p model.PlayerEntity, arg *string) error {

		if arg == nil {
			return fmt.Errorf("no arguments, usage: 'WARP <X> <Y>'")
		}

		argv := strings.Split(*arg, " ")
		if len(argv) != 2 {
			return fmt.Errorf("to many or too few arguments, expected 2 and got %d", len(argv))
		}

		x, err := strconv.ParseInt(argv[0], 10, 64)
		if err != nil {
			return fmt.Errorf("cannot parse argument X: %s", err)
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
	"GOD": func(g model.Game, p model.PlayerEntity, arg *string) error {

		if arg != nil && *arg == "off" {
			p.SetGodmode(false)
		}else{
			p.SetGodmode(true)
		}

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
			log.Printf("😡 Player '%s' presented invalid token '%s'", player.Name(), cheat.Token)
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
			log.Printf("😰 Action '%s' failed: %s", cmd, err)
			continue
		}

		log.Printf("😎 Executed '%s'.", cmd)
	}
}

func (c *CommandSystem) validateToken(token string) bool {

	for _, t := range c.tokens {
		if t == token {
			return true
		}
	}

	return false
}

func (c *CommandSystem) Remove(e ecs.BasicEntity) {

	i := minions.FindBasic(func(idx int) model.BasicEntity {
		return c.players[idx]
	}, len(c.players), e)

	if i >= 0 {
		c.players = append(c.players[:i], c.players[i+1:]...)
	}
}

type Command func(g model.Game, p model.PlayerEntity, arg *string) error
