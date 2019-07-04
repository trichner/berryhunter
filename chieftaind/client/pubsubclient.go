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
	topic *pubsub.Topic
}

func NewPubSubClient(projectId string, topicId string) (ScoreboardUpdateClient, error) {

	ctx := context.Background()
	client, err := pubsub.NewClient(ctx, projectId)
	if err != nil {
		return nil, err
	}

	log.Printf("getting topic %s", topicId)
	topic := client.TopicInProject(topicId, projectId)

	return &pubSubClient{
		topic: topic,
	}, nil
}

func (c *pubSubClient) Write(s *Scoreboard) {
	pubsubMessage := &pubsub.Message{
		Data:ScoreBoardMarshal(s),
	}
	c.topic.Publish(context.Background(), pubsubMessage)
}

// Close closes the connection, may panic if already closed!
func (c *pubSubClient) Close() error {
	c.topic.Stop()
	return nil
}
