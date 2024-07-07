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

const flatcVersion = "v24.3.25"

func main() {
	fileGlob := os.Args[1]

	pwd, _ := os.Getwd()
	slog.Info("running", slog.String("prog", os.Args[0]), slog.String("pwd", pwd))

	version := flatcVersion

	platform := ""
	artifactName := ""
	switch runtime.GOOS {
	case "windows":
		platform = "Windows"
		artifactName = "Windows.flatc.binary.zip"
	case "darwin":
		platform = "Mac"
		artifactName = "Mac.flatc.binary.zip"
	case "linux":
		platform = "Linux"
		artifactName = "Linux.flatc.binary.clang++-15.zip"
	default:
		err := fmt.Errorf("unsupported OS %s for flatbuffer compilation, add support in `flatcgen.go`", runtime.GOOS)
		slog.Error("failed to determine flatc compiler", slog.Any("error", err))
		panic(err)
	}

	// https://github.com/google/flatbuffers/releases/download/v24.3.25/Linux.flatc.binary.clang++-15.zip
	// https://github.com/google/flatbuffers/releases/download/v24.3.25/Mac.flatc.binary.zip
	// https://github.com/google/flatbuffers/releases/download/v24.3.25/Windows.flatc.binary.zip

	compilerPath := fmt.Sprintf("./flatc_%s_%s", platform, strings.ReplaceAll(version, ".", "_"))
	err := downloadCompilerTo(compilerPath, version, artifactName)
	if err != nil {
		slog.Error("failed to download flatc compiler", slog.String("version", version), slog.Any("error", err))
		panic(err)
	}

	files, err := filepath.Glob(fileGlob)

	err = compileGoFlatbuffers(compilerPath, files)
	if err != nil {
		slog.Error("failed to compile flatbuffers", slog.String("compiler", compilerPath), slog.String("version", version), slog.Any("error", err))
		panic(err)
	}
}

func downloadCompilerTo(path, version, artifactName string) error {
	var buf bytes.Buffer

	downloadUrl := fmt.Sprintf("https://github.com/google/flatbuffers/releases/download/%s/%s", version, artifactName)

	slog.Info("downloading flatc", slog.String("url", downloadUrl), slog.String("artifact", artifactName), slog.String("flatcVersion", version))

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
	defer compressed.Close()

	dst, err := os.OpenFile(path, os.O_CREATE|os.O_TRUNC|os.O_RDWR, 0o755)
	if err != nil {
		return err
	}
	defer dst.Close()

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

	err := run(compilerPath, args...)
	if err != nil {
		return fmt.Errorf("compiling flatbuffers failed: %w", err)
	}
	return nil
}

func run(prog string, args ...string) error {
	cmd := exec.Command(prog, args...)
	cmd.Stderr = os.Stderr

	out, err := cmd.Output()
	slog.Debug("command executed", slog.String("name", prog), slog.String("out", string(out)))

	if err != nil {
		return fmt.Errorf("command %q failed %s: %w", append([]string{prog}, args...), out, err)
	}

	return nil
}
