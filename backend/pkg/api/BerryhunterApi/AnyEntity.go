// Code generated by the FlatBuffers compiler. DO NOT EDIT.

package BerryhunterApi

import "strconv"

type AnyEntity byte

const (
	AnyEntityNONE      AnyEntity = 0
	AnyEntityCharacter AnyEntity = 1
	AnyEntityMob       AnyEntity = 2
	AnyEntityResource  AnyEntity = 3
	AnyEntityPlaceable AnyEntity = 4
)

var EnumNamesAnyEntity = map[AnyEntity]string{
	AnyEntityNONE:      "NONE",
	AnyEntityCharacter: "Character",
	AnyEntityMob:       "Mob",
	AnyEntityResource:  "Resource",
	AnyEntityPlaceable: "Placeable",
}

var EnumValuesAnyEntity = map[string]AnyEntity{
	"NONE":      AnyEntityNONE,
	"Character": AnyEntityCharacter,
	"Mob":       AnyEntityMob,
	"Resource":  AnyEntityResource,
	"Placeable": AnyEntityPlaceable,
}

func (v AnyEntity) String() string {
	if s, ok := EnumNamesAnyEntity[v]; ok {
		return s
	}
	return "AnyEntity(" + strconv.FormatInt(int64(v), 10) + ")"
}