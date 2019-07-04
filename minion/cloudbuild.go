package main

/*
{
	"id": "e8b17589-d112-40c8-819d-288369fe1744",
	"projectId": "berryhunter-io",
	"status": "FAILURE",
	"source": {
		"repoSource": {
			"projectId": "berryhunter-io",
			"repoName": "github_trichner_berryhunter",
			"branchName": "master"
		}
	},
	"steps": [{
		"name": "gcr.io/cloud-builders/docker",
		"args": ["-c", "docker build \\\n  -t gcr.io/berryhunter-io/berryhunterd:rev-b467ab9 \\\n  -t gcr.io/berryhunter-io/berryhunterd:latest \\\n  -f Dockerfile.berryhunterd .\n"],
		"id": "build_berryhunterd",
		"waitFor": ["-"],
		"entrypoint": "bash",
		"timing": {
			"startTime": "2019-06-30T15:48:05.387431283Z",
			"endTime": "2019-06-30T15:51:05.540223294Z"
		},
		"pullTiming": {
			"startTime": "2019-06-30T15:48:05.387431283Z",
			"endTime": "2019-06-30T15:48:05.836678066Z"
		},
		"status": "FAILURE"
	}, {
		"name": "gcr.io/cloud-builders/docker",
		"args": ["-c", "docker build \\\n  -t gcr.io/berryhunter-io/chieftaind:rev-b467ab9 \\\n  -t gcr.io/berryhunter-io/chieftaind:latest \\\n  -f Dockerfile.chieftaind .\n"],
		"id": "build_chieftaind",
		"waitFor": ["-"],
		"entrypoint": "bash",
		"timing": {
			"startTime": "2019-06-30T15:48:05.390514471Z",
			"endTime": "2019-06-30T15:51:05.606479762Z"
		},
		"pullTiming": {
			"startTime": "2019-06-30T15:48:05.390514471Z",
			"endTime": "2019-06-30T15:48:05.835352605Z"
		},
		"status": "CANCELLED"
	}, {
		"name": "gcr.io/cloud-builders/docker",
		"args": ["-c", "docker build \\\n  -t gcr.io/berryhunter-io/berryhunter-edge:rev-b467ab9 \\\n  -t gcr.io/berryhunter-io/berryhunter-edge:latest \\\n  -f Dockerfile.berryhunter-edge .   \n"],
		"id": "build_berryhunter_edge",
		"waitFor": ["-"],
		"entrypoint": "bash",
		"timing": {
			"startTime": "2019-06-30T15:48:05.391994880Z",
			"endTime": "2019-06-30T15:48:50.032820063Z"
		},
		"pullTiming": {
			"startTime": "2019-06-30T15:48:05.391994880Z",
			"endTime": "2019-06-30T15:48:05.841583690Z"
		},
		"status": "SUCCESS"
	}, {
		"name": "gcr.io/cloud-builders/docker",
		"args": ["-c", "docker build \\\n  -t gcr.io/berryhunter-io/berryhunter-web:rev-b467ab9 \\\n  -t gcr.io/berryhunter-io/berryhunter-web:latest \\\n  -f Dockerfile.berryhunter-web . \n"],
		"id": "build_berryhunter_web",
		"waitFor": ["-"],
		"entrypoint": "bash",
		"timing": {
			"startTime": "2019-06-30T15:48:05.387178074Z",
			"endTime": "2019-06-30T15:51:05.606378091Z"
		},
		"pullTiming": {
			"startTime": "2019-06-30T15:48:05.387178074Z",
			"endTime": "2019-06-30T15:48:05.798750987Z"
		},
		"status": "CANCELLED"
	}],
	"results": {
		"buildStepImages": ["sha256:c7862ac0894c07b22a807c5af6f990f80917801c6c9296370adf74696aac129b", "sha256:c7862ac0894c07b22a807c5af6f990f80917801c6c9296370adf74696aac129b", "sha256:c7862ac0894c07b22a807c5af6f990f80917801c6c9296370adf74696aac129b", "sha256:c7862ac0894c07b22a807c5af6f990f80917801c6c9296370adf74696aac129b"],
		"buildStepOutputs": []
	},
	"createTime": "2019-06-30T15:47:49.082538670Z",
	"startTime": "2019-06-30T15:47:51.236082019Z",
	"finishTime": "2019-06-30T15:51:08.792143094Z",
	"timeout": "600s",
	"images": ["gcr.io/berryhunter-io/berryhunterd:rev-b467ab9", "gcr.io/berryhunter-io/berryhunterd:latest", "gcr.io/berryhunter-io/chieftaind:rev-b467ab9", "gcr.io/berryhunter-io/chieftaind:latest", "gcr.io/berryhunter-io/berryhunter-edge:rev-b467ab9", "gcr.io/berryhunter-io/berryhunter-edge:latest", "gcr.io/berryhunter-io/berryhunter-web:rev-b467ab9", "gcr.io/berryhunter-io/berryhunter-web:latest"],
	"artifacts": {
		"images": ["gcr.io/berryhunter-io/berryhunterd:rev-b467ab9", "gcr.io/berryhunter-io/berryhunterd:latest", "gcr.io/berryhunter-io/chieftaind:rev-b467ab9", "gcr.io/berryhunter-io/chieftaind:latest", "gcr.io/berryhunter-io/berryhunter-edge:rev-b467ab9", "gcr.io/berryhunter-io/berryhunter-edge:latest", "gcr.io/berryhunter-io/berryhunter-web:rev-b467ab9", "gcr.io/berryhunter-io/berryhunter-web:latest"]
	},
	"logsBucket": "gs://301038428004.cloudbuild-logs.googleusercontent.com",
	"sourceProvenance": {
		"resolvedRepoSource": {
			"projectId": "berryhunter-io",
			"repoName": "github_trichner_berryhunter",
			"commitSha": "b467ab9ee07f69995c681b2942f7f91f48c7b482"
		}
	},
	"buildTriggerId": "46e56f82-260a-43ba-8d92-cc336099cd99",
	"options": {
		"substitutionOption": "ALLOW_LOOSE",
		"logging": "LEGACY"
	},
	"logUrl": "https://console.cloud.google.com/gcr/builds/e8b17589-d112-40c8-819d-288369fe1744?project=301038428004",
	"tags": ["event-9b3c085f-0005-497d-9901-9368b16bffca", "trigger-46e56f82-260a-43ba-8d92-cc336099cd99"],
	"timing": {
		"BUILD": {
			"startTime": "2019-06-30T15:48:05.387129250Z",
			"endTime": "2019-06-30T15:51:06.633399982Z"
		},
		"FETCHSOURCE": {
			"startTime": "2019-06-30T15:47:56.495407894Z",
			"endTime": "2019-06-30T15:48:05.294094283Z"
		}
	}
}
 */
/*

	"id": "e8b17589-d112-40c8-819d-288369fe1744",
	"projectId": "berryhunter-io",
	"status": "FAILURE",
	"source": {
		"repoSource": {
			"projectId": "berryhunter-io",
			"repoName": "github_trichner_berryhunter",
			"branchName": "master"
		}
	},
 */

type CloudBuildStatus string
const STATUS_QUEUED CloudBuildStatus = "QUEUED"
const STATUS_WORKING CloudBuildStatus = "WORKING"
const STATUS_SUCCESS CloudBuildStatus = "SUCCESS"
const STATUS_FAILURE CloudBuildStatus = "FAILURE"


type CloudBuildStatusMessage struct {
	BuildId string `json:"id"`
	ProjectId string `json:"projectId"`
	Status  CloudBuildStatus `json:"status"`
	Images []string `json:"images"`
	BuildTriggerId string `json:"buildTriggerId"`
}
