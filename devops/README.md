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

# make binary executable
chmod +x berryhunterd

# create empty tokens file - the service with DynamicUser option will not be able to do so
touch tokens.list

# add systemd unit, contents see ./berryhunterd.service
systemctl edit --force --full berryhunterd

# enable & start it
systemctl enable --now berryhunterd

# follow the logs
journalctl -f -u berryhunterd
```
