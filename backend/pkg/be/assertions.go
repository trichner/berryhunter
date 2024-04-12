package be

import "testing"

func True(t testing.TB, truthy bool) {
	if !truthy {
		t.Fatalf("not true!")
	}
}

func Equal[e comparable](t testing.TB, actual, expected e) {
	if actual != expected {
		t.Fatalf("not equal: %+v != %+v", actual, expected)
	}
}

func NoError(t testing.TB, err error) {
	if err != nil {
		t.Fatalf("expected no error, got: %+v", err)
	}
}

func AnError(t testing.TB, err error) {
	if err == nil {
		t.Fatalf("expected an error, got nil")
	}
}
