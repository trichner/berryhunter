package main

import (
	"encoding/binary"
	"fmt"
	"io"
)

const megaByte = 1000 * 1000
const prefixBytes = 4

type Framer interface {
	WriteMessage(message []byte) error

	ReadMessage() ([]byte, error)
}

func NewFramer(rw io.ReadWriter) (Framer, error) {

	if rw == nil {
		return nil, fmt.Errorf("reader/writer missing")
	}

	return &framer{rw: rw}, nil
}

type framer struct {
	rw io.ReadWriter
}

func (f *framer) WriteMessage(message []byte) error {

	return writeMessage(f.rw, message)
}

func (f *framer) ReadMessage() ([]byte, error) {

	return readMessage(f.rw)
}

func writeMessage(w io.Writer, message []byte) error {
	// create the length prefix
	prefix := make([]byte, prefixBytes)
	binary.BigEndian.PutUint32(prefix, uint32(len(message)))

	// write the prefix and the data to the stream (checking errors)
	_, err := w.Write(prefix)
	if err != nil {
		return err
	}
	_, err = w.Write(message)
	return err
}

func readMessage(r io.Reader) ([]byte, error) {
	// read the length prefix
	prefix := make([]byte, prefixBytes)
	_, err := io.ReadFull(r, prefix)
	if err != nil {
		return nil, err
	}

	length := binary.BigEndian.Uint32(prefix)

	if length > megaByte {
		return nil, fmt.Errorf("message too long: %d", length)
	}

	msg := make([]byte, int(length))
	_, err = io.ReadFull(r, msg)
	return msg, err
}
