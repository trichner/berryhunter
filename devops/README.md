# Quickstart Running Berryhunter Standalone

```shell
# optional: update the Cloud Ops Agent config to log into Cloud Logging
cp ./cloud-ops-agent.yaml /etc/google-cloud-ops-agent/config.yaml
systemctl restart google-cloud-ops-agent.service

# setup the binaries & frontend
mkdir -p /opt/berryhunterd
cd /opt/berryhunterd
cp ~/<yourconfig>/conf.json ./conf.json
cp ~/<yourbackend>/berryhunterd ./berryhunterd
cp -R ~/<yourfrontend>/dist ./frontend

# add systemd unit, contents see ./berryhunterd.service
systemctl edit --force --full berryhunterd

# enable & start it
systemctl enable --now berryhunterd

# follow the logs
journalct -f -u berryhunterd
```
