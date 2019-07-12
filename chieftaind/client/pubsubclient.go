package client

import (
	"cloud.google.com/go/pubsub"
	"context"
	"io"
	"log"
)

type ScoreboardUpdateClient interface {
	Write(s *Scoreboard)
	io.Closer
}

type pubSubClient struct {
	topic   *pubsub.Topic
	results chan *pubsub.PublishResult
	done    chan struct{}
}

func NewPubSubClient(projectId string, topicId string) (ScoreboardUpdateClient, error) {

	ctx := context.Background()
	client, err := pubsub.NewClient(ctx, projectId)
	if err != nil {
		return nil, err
	}

	log.Printf("getting topic %s", topicId)
	topic := client.TopicInProject(topicId, projectId)

	c := &pubSubClient{
		topic:   topic,
		results: make(chan *pubsub.PublishResult, 128),
		done:    make(chan struct{}),
	}

	go func() {

		// write pump
		for {
			r, ok := <-c.results
			if !ok {
				break
			}
			id, err := r.Get(context.Background())
			log.Printf("sent pubsub scoreboard with id '%s'", id)
			if err != nil {
				log.Printf("failed to send pubsub message: %s", err)
			}
		}

		close(c.done)
	}()

	return c, nil
}

func (c *pubSubClient) Write(s *Scoreboard) {
	pubsubMessage := &pubsub.Message{
		Data: ScoreBoardMarshal(s),
	}
	c.results <- c.topic.Publish(context.Background(), pubsubMessage)
}

// Close closes the connection, may panic if already closed!
func (c *pubSubClient) Close() error {
	c.topic.Stop()
	close(c.results)
	<- c.done
	return nil
}
