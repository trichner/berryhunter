package codec

const points2px = 120.0

func f32ToPx(f float32) float32 {
	return f * points2px
}

func f32ToU16Px(f float32) uint16 {
	return uint16(f * points2px)
}
