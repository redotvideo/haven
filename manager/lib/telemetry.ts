import { PostHog } from 'posthog-node';
import {config} from "./config";


const client = new PostHog(
    'phc_YpKoFD7smPe4SXRtVyMW766uP9AjUwnuRJ8hh2EJcVv',
    { host: 'https://app.posthog.com' } // You can omit this line if using PostHog Cloud
)

const clientId = config.gcloud.clientId;


export async function sendEvent(eventName: string, eventProperties: object) {
    client.capture({
        distinctId: clientId,
        event: eventName,
        properties: eventProperties,
    })
}