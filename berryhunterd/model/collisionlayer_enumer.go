// Code generated by "enumer -type=CollisionLayer"; DO NOT EDIT

package model

import (
	"fmt"
)

const (
	_CollisionLayerName_0 = "LayerNoneCollisionLayerPlayerStaticCollisionLayerActionCollision"
	_CollisionLayerName_1 = "LayerWeaponCollision"
	_CollisionLayerName_2 = "LayerRessourceCollision"
	_CollisionLayerName_3 = "LayerHeatCollision"
	_CollisionLayerName_4 = "LayerBorderCollision"
	_CollisionLayerName_5 = "LayerViewportCollision"
	_CollisionLayerName_6 = "LayerMobStaticCollision"
	_CollisionLayerName_7 = "LayerPlayerCollision"
)

var (
	_CollisionLayerIndex_0 = [...]uint8{0, 18, 44, 64}
	_CollisionLayerIndex_1 = [...]uint8{0, 20}
	_CollisionLayerIndex_2 = [...]uint8{0, 23}
	_CollisionLayerIndex_3 = [...]uint8{0, 18}
	_CollisionLayerIndex_4 = [...]uint8{0, 20}
	_CollisionLayerIndex_5 = [...]uint8{0, 22}
	_CollisionLayerIndex_6 = [...]uint8{0, 23}
	_CollisionLayerIndex_7 = [...]uint8{0, 20}
)

func (i CollisionLayer) String() string {
	switch {
	case 0 <= i && i <= 2:
		return _CollisionLayerName_0[_CollisionLayerIndex_0[i]:_CollisionLayerIndex_0[i+1]]
	case i == 4:
		return _CollisionLayerName_1
	case i == 8:
		return _CollisionLayerName_2
	case i == 16:
		return _CollisionLayerName_3
	case i == 32:
		return _CollisionLayerName_4
	case i == 64:
		return _CollisionLayerName_5
	case i == 128:
		return _CollisionLayerName_6
	case i == 256:
		return _CollisionLayerName_7
	default:
		return fmt.Sprintf("CollisionLayer(%d)", i)
	}
}

var _CollisionLayerValues = []CollisionLayer{0, 1, 2, 4, 8, 16, 32, 64, 128, 256}

var _CollisionLayerNameToValueMap = map[string]CollisionLayer{
	_CollisionLayerName_0[0:18]:  0,
	_CollisionLayerName_0[18:44]: 1,
	_CollisionLayerName_0[44:64]: 2,
	_CollisionLayerName_1[0:20]:  4,
	_CollisionLayerName_2[0:23]:  8,
	_CollisionLayerName_3[0:18]:  16,
	_CollisionLayerName_4[0:20]:  32,
	_CollisionLayerName_5[0:22]:  64,
	_CollisionLayerName_6[0:23]:  128,
	_CollisionLayerName_7[0:20]:  256,
}

// CollisionLayerString retrieves an enum value from the enum constants string name.
// Throws an error if the param is not part of the enum.
func CollisionLayerString(s string) (CollisionLayer, error) {
	if val, ok := _CollisionLayerNameToValueMap[s]; ok {
		return val, nil
	}
	return 0, fmt.Errorf("%s does not belong to CollisionLayer values", s)
}

// CollisionLayerValues returns all values of the enum
func CollisionLayerValues() []CollisionLayer {
	return _CollisionLayerValues
}

// IsACollisionLayer returns "true" if the value is listed in the enum definition. "false" otherwise
func (i CollisionLayer) IsACollisionLayer() bool {
	for _, v := range _CollisionLayerValues {
		if i == v {
			return true
		}
	}
	return false
}