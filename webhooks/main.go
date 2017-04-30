package main

import (
	"time"
	"io/ioutil"
	"encoding/json"
	"log"
	"os/exec"
	"github.com/trichner/hookserve/hookserve"
)

const configFilename = "./conf.json"

type Config struct {
	Port     int `json:"port"`
	Secret   string `json:"secret"`
	Path     string `json:"path"`
	Branches []string `json:"branches"`
	Command  string `json:"command"`
}

func handleEvent(conf *Config, event *hookserve.Event) {

	log.Printf("Processing %.7s on branch %s from %s/%s", event.Commit, event.Branch, event.Owner, event.Repo)

	if contains(conf.Branches, event.Branch) {
		log.Println("Branch matches! Doing magic.")
		cmd := conf.Command
		out, err := exec.Command(cmd).CombinedOutput()
		if err != nil {
			log.Printf("Command '%s' failed: %v", conf.Command, err)
			log.Println(string(out))
		} else {
			log.Printf("Successfully executed '%s'", cmd)
		}
	}
}

func main() {

	conf, err := readConfig(configFilename)
	if err != nil {
		log.Panicf("Cannot read config file '%s'. Error: %v\n", configFilename, err)
	}

	server := hookserve.NewServer()

	server.Port = conf.Port
	server.Path = conf.Path
	server.Secret = conf.Secret

	server.GoListenAndServe()
	log.Printf("Server listening on :%d%s", server.Port, server.Path)
	log.Printf("Filtering for %d branches:", len(conf.Branches))
	for _, b := range conf.Branches {
		log.Printf("> " + b)
	}
	log.Println(" ---- ")

	for {
		select {
		case event := <-server.Events:
			handleEvent(conf, &event)
		default:
			time.Sleep(time.Millisecond * 100)
		}
	}
}

// reads the config from file
func readConfig(filename string) (*Config, error) {

	var err error
	// read file
	dat, err := ioutil.ReadFile(filename)
	if err != nil {
		return nil, err
	}

	// parse config
	conf := &Config{}
	err = json.Unmarshal(dat, conf)
	return conf, err
}

func contains(haystack []string, needle string) bool {
	for _, s := range haystack {
		if s == needle {
			return true
		}
	}
	return false
}
