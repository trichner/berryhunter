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
	tx   chan *Scoreboard
	done chan struct{}
	topic *pubsub.Topic
}

func NewPubSubClient(projectId string, topicId string) (ScoreboardUpdateClient, error) {

	//TODO
	ctx := context.Background()
	client, err := pubsub.NewClient(ctx, projectId)
	if err != nil {
		return nil, err
	}

	log.Printf("getting topic %s", topicId)
	topic := client.TopicInProject(topicId, projectId)

	return &pubSubClient{
		tx:   make(chan *Scoreboard, 128),
		done: make(chan struct{}),
		topic: topic,
	}, nil
}

func (c *pubSubClient) start() {
	go func() {

		// write pump
		for {
			msg, ok := <-c.tx
			if !ok {
				break
			}

			//TODO write message to pubsub
			_ = msg
			err := c.publishMessage(msg)
			if err != nil {
				log.Println(err)
				break
			}

		}

		close(c.done)
	}()
}

func (c *pubSubClient) Write(s *Scoreboard) {
	c.tx <- s
}

// Close closes the connection, may panic if already closed!
func (c *pubSubClient) Close() error {
	close(c.tx)
	<-c.done
	return nil
}

func (c *pubSubClient) publishMessage(msg *Scoreboard) error {

	//TODO
	//c.topic.Publish(msg)

	return nil
}
