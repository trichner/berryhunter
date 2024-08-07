package vitals

import (
	"github.com/trichner/berryhunter/pkg/berryhunter/model/constant"
)

const Max = ^VitalSign(0)

type VitalSign uint32

func FractionToAbsPerTick(fractionPerS float32) uint32 {
	return uint32(fractionPerS / constant.TicksPerSecond * float32(Max))
}

func (v VitalSign) Fraction() float32 {
	return float32(float32(v) / float32(Max))
}

func (v VitalSign) AddFraction(n float32) VitalSign {
	if n == 0 {
		return v
	}

	if n >= 1 {
		return v.Add(uint32(Max))
	}

	if n > 0 {
		add := uint32(float32(Max) * n)
		return v.Add(add)
	}

	if n <= -1 {
		return v.Sub(uint32(Max))
	}

	sub := uint32(float32(Max) * -n)
	return v.Sub(sub)
}

func (v VitalSign) SubFraction(n float32) VitalSign {
	return v.AddFraction(-n)
}

func (v VitalSign) AddInt(n int) VitalSign {
	if n == 0 {
		return v
	}

	if n > 0 {
		return v.Add(uint32(n))
	}

	return v.Sub(uint32(-n))
}

func (v VitalSign) Add(n uint32) VitalSign {
	d := Max - v
	add := VitalSign(n)
	if d > add {
		return v + add
	}
	return Max
}

func (v VitalSign) Sub(n uint32) VitalSign {
	sub := VitalSign(n)
	if v < sub {
		return 0
	}
	return v - sub
}

func (v VitalSign) UInt32() uint32 {
	return uint32(v)
}
