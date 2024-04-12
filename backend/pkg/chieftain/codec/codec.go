package codec

import (
	"fmt"

	"github.com/trichner/berryhunter/api/schema/ChieftainApi"
)

func HandleMessage(bytes []byte) error {
	msg := ChieftainApi.GetRootAsClientMessage(bytes, 0)
	switch msg.BodyType() {
	case ChieftainApi.ClientMessageBodyScoreboard:
		// TODO
	default:
		return fmt.Errorf("unknown ClientMessage type: %s", msg.BodyType())
	}
	return nil
}
