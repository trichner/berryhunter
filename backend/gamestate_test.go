package main

import (
	"testing"
	"encoding/json"
	"fmt"
)

type AabbTest struct {
	//LowerX *float32 `json:"LowerX,omitempty"`
	//LowerY *float32 `json:"LowerY,omitempty"`
	UpperX *float32 `json:"UpperX,omitempty"`
	UpperY *float32 `json:"UpperY,omitempty"`
}

func TestMarshall_AabbDTO(t *testing.T) {

	aabb := &AabbTest{
		//LowerX: &(&floatwrapper{1}).f,
		//LowerY: &(&floatwrapper{2}).f,
		UpperX: &(&floatwrapper{6}).f,
		UpperY: &(&floatwrapper{4}).f,
	}
	bytes, err := json.Marshal(aabb)
	if err != nil {
		t.Fatal(err)
	}
	fmt.Printf("%s", bytes)
}
