export class TriggerIntervalMap{
    lastTriggeredMap: Map<string, { lastTriggered: number; interval: number }> = new Map();

    canTrigger(triggerName: string): boolean {
        const currentTime = Date.now();
        const soundData = this.lastTriggeredMap.get(triggerName);

        if (!soundData || currentTime - soundData.lastTriggered >= soundData.interval) {
            return true;
        }

        return false;
    }

    trigger(triggerName: string, interval: number) {
        if (!this.canTrigger(triggerName)) {
            return false;
        }
        this.lastTriggeredMap.set(triggerName, { lastTriggered: Date.now(), interval: interval });
        return true;
    }
}