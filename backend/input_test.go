package main

import (
	"testing"
	"log"
	"encoding/json"
)

func TestInputUnmarshal(t *testing.T) {
	msg := []byte(`{"movement":{"x":7,"y":2},"rotation":1.7457586080629652,"action":{"item":"fist","alt":false},"tick":296}`)

	var input InputDTO
	log.Printf("RX Msg: %s", string(msg))
	_ = input
	err := json.Unmarshal(msg, &input)
	if err != nil {
		log.Printf("Marshalling Error: %s", err)
	} else {
		log.Printf("Obj:\t %+v", input)
		log.Printf("Action:\t %+v", input.Action)
		log.Printf("Movement:\t %+v", input.Movement)
	}
}
