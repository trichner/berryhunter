package codec

const Points2px = 120.0

func f32ToPx(f float32) float32 {
	return f * Points2px
}

func f32ToU16Px(f float32) uint16 {
	return uint16(f * Points2px)
}

func intToF32Px(i int) float32 {
	return float32(i * Points2px)
}
