package ai

type hopping struct {
	// wandering
	hopDistance  float32
	turnRate     float32
	turnDuration float32

	jump   Behaviour
	rotate Behaviour
}

type HoppingCfg struct {
	TurnRate float32
	DeltaPhi float32
	Speed    float32
}

func NewHopping(cfg *HoppingCfg) *hopping {

	return &hopping{
	}
}

func (w *hopping) Next(s *State) *State {

	return s
}

