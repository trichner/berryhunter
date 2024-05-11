package framer

import (
	"bytes"
	"encoding/hex"
	"fmt"
	"github.com/stretchr/testify/assert"
	"testing"
)

func TestFramer_ReadMessage(t *testing.T) {
	buf := bytes.NewBuffer(make([]byte,0, 128))

	framer, err := NewFramer(buf)

	assert.NoError(t, err)

	msg1 := []byte("Hello World!")
	msg2 := []byte("Sup? Alright?")

	err = framer.WriteMessage(msg1)
	assert.NoError(t, err)

	err = framer.WriteMessage(msg2)
	assert.NoError(t, err)

	fmt.Println("buf:")
	fmt.Println(hex.Dump(buf.Bytes()))

	var rx []byte
	rx, err = framer.ReadMessage()
	assert.NoError(t, err)
	assert.Equal(t, msg1, rx)

	rx, err = framer.ReadMessage()
	assert.NoError(t, err)
	assert.Equal(t, msg2, rx)
}

