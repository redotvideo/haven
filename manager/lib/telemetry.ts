import { PostHog } from 'posthog-node';
import {config} from "./config";


const client = new PostHog(
    'phc_YpKoFD7smPe4SXRtVyMW766uP9AjUwnuRJ8hh2EJcVv',
    { host: 'https://app.posthog.com' }
)

const clientId = config.gcloud.clientId;
const telemetryOkay = config.telemetryOkay;


export async function sendEvent(eventName: string, eventProperties: object) {
    if (telemetryOkay){
        client.capture({
            distinctId: clientId,
            event: eventName,
            properties: eventProperties,
        })
    }
}