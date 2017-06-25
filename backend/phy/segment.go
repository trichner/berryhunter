package phy

type Segment struct {
	origin, direction Vec2f
}

func Project() {
	p := Vec2f{}
	s := Segment{Vec2f{}, Vec2f{1, 1}}

	// a points now from s.origin to the original p
	a := p.Sub(s.origin)
	b := s.direction

	// project a onto b
	dot := a.Dot(b)
	m := dot / b.Abs()

	// find the hitpoint on b where a is projected to
	hp := b.Normalize().Mult(m)

	// calculate the hitvector
	hv := hp.Sub(p)

	// calculate the direction and magnitude of the force to apply
	magnitude := hv.Abs()
	direction := hv.Div(magnitude)

	r := float32(5.0)
	fMagnitude := r - magnitude

	f := direction.Mult(fMagnitude)

	_ = f
}
