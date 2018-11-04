#!/bin/bash



GCLOUD_PROJECT=trichner-212015
GCLOUD_KEYRING=berryhunter

function encrypt(){
    local KEY="$1"
    local PLAINTEXT_FILE="$2"
    
    gcloud kms encrypt \
        --project "$GCLOUD_PROJECT" \
        --location=global  \
        --keyring="$GCLOUD_KEYRING" \
        --key="$KEY" \
        --plaintext-file="$PLAINTEXT_FILE" \
        --ciphertext-file=- | base64
}

encrypt github-credentials $1
