//go:build ignore

package main

import (
	"archive/zip"
	"bytes"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"slices"
	"strings"
)

func main() {

	fileGlob := os.Args[1]

	pwd, _ := os.Getwd()
	slog.Info("running", slog.String("prog", os.Args[0]), slog.String("pwd", pwd))

	version := "v24.3.25"

	platform := ""
	switch runtime.GOOS {
	case "windows":
		platform = "Windows"
	case "darwin":
		platform = "Mac"
	default:
		slog.Error("unsupported OS for flatbuffer compilation", slog.String("os", runtime.GOOS))
	}

	compilerPath := fmt.Sprintf("./flatc_%s_%s", platform, strings.ReplaceAll(version, ".", "_"))
	err := downloadCompilerTo(compilerPath, version, platform)
	if err != nil {
		panic(err)
	}

	files, err := filepath.Glob(fileGlob)

	err = compileGoFlatbuffers(compilerPath, files)
	if err != nil {
		panic(err)
	}

}

func downloadCompilerTo(path, version, platform string) error {

	var buf bytes.Buffer

	downloadUrl := fmt.Sprintf("https://github.com/google/flatbuffers/releases/download/%s/%s.flatc.binary.zip", version, platform)

	slog.Info("downloading flatc", slog.String("url", downloadUrl), slog.String("platform", platform), slog.String("version", version))

	res, err := http.Get(downloadUrl)
	if err != nil || res.StatusCode != 200 {
		return err
	}

	if _, err := io.Copy(&buf, res.Body); err != nil {
		return err
	}

	r := bytes.NewReader(buf.Bytes())
	zr, err := zip.NewReader(r, int64(r.Len()))
	if err != nil {
		return err
	}

	i := slices.IndexFunc(zr.File, func(f *zip.File) bool {
		return f.Name == "flatc"
	})
	if i < 0 {
		return errors.New("'flatc' not found in archive")
	}

	flatcFile := zr.File[i]

	compressed, err := flatcFile.Open()
	if err != nil {
		return err
	}

	dst, err := os.OpenFile(path, os.O_CREATE|os.O_TRUNC|os.O_RDWR, 0o755)
	if err != nil {
		return err
	}
	written, err := io.Copy(dst, compressed)
	if err != nil {
		return err
	}
	slog.Info("extracted flatc", slog.String("path", path), slog.Int64("written", written))

	return nil
}

func compileGoFlatbuffers(compilerPath string, files []string) error {

	slog.Info("compiling flatbuffers", slog.String("files", strings.Join(files, ",")))
	// flatc --go *.fbs

	args := []string{"--go"}
	args = append(args, files...)

	return run(compilerPath, args...)

}

func run(prog string, args ...string) error {

	cmd := exec.Command(prog, args...)
	cmd.Stderr = os.Stderr

	out, err := cmd.Output()
	slog.Debug("command executed", slog.String("name", prog), slog.String("out", string(out)))

	return err
}
