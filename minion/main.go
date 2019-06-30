package main

import (
	"cloud.google.com/go/pubsub"
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"os/exec"
)

const PROJECT_ID = "berryhunter-io"
const SUBSCRIPTION = "deployer"
const TOPIC = "cloud-builds"

const SYSTEMD_SERVICE = "berryhunter"
const DOCKER_IMAGE_TAG = "latest"

func main() {

	dockerImageTag := *flag.String("tag", DOCKER_IMAGE_TAG, "the docker tag to look out for, e.g. 'latest'")
	subscriptionId := *flag.String("subscription", SUBSCRIPTION, "the subscription to use")

	log.Printf("initializing client in project %s\n", PROJECT_ID)
	ctx := context.Background()
	client, err := pubsub.NewClient(ctx, PROJECT_ID)
	if err != nil {
		panic(fmt.Errorf("cannot init pubsub client: %s", err))
	}

	log.Printf("getting subscription %s", subscriptionId)
	sub := client.SubscriptionInProject(subscriptionId, PROJECT_ID)

	log.Printf("listening to messages from %s", sub.ID())
	err = sub.Receive(ctx, func(ctx context.Context, m *pubsub.Message) {
		log.Printf("[%s]: rx message published at %s", m.ID, m.PublishTime)
		var message CloudBuildStatusMessage
		err := json.Unmarshal(m.Data, &message)
		if err != nil {
			log.Printf("[%s]: cannot read message", m.ID)
			m.Nack()
		}

		// do magic if its our tag
		needle := "gcr.io/berryhunter-io/berryhunterd:" + dockerImageTag
		if message.Status == STATUS_SUCCESS && contains(message.Images, needle) {
			log.Printf("[%s] pulling new images", m.ID)
			err = dockerComposePull()
			if err != nil {
				fmt.Printf("cannot pull fresh images: %s", err)
			}

			log.Printf("[%s] restarting systemd service '%s'", m.ID, SYSTEMD_SERVICE)
			err = systemctlRestart(SYSTEMD_SERVICE)
			if err != nil {
				fmt.Printf("cannot restart systemd service '%s': %s", SYSTEMD_SERVICE, err)
			}
		}
		m.Ack()
	})
	if err != nil {
		panic(fmt.Errorf("cannot receive messages: %s", err))
	}
}

func contains(haystack []string, needle string) bool {
	for _, a := range haystack {
		if a == needle {
			return true
		}
	}
	return false
}

func dockerComposePull() error {

	_, err := exec.Command("docker-compose", "pull").Output()
	return err
}

func systemctlRestart(service string) error {

	_, err := exec.Command("systemctl", "restart", service).Output()
	return err
}
