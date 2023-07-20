from posthog import Posthog
import os

posthog = Posthog('phc_JS6XFROuNbhJtVCEdTSYk6gl5ArRrTNMpCcguAXlSPs',
                  host='https://app.posthog.com')


def capture_event(event_name, event_properties):
    if os.environ.get('EVENT_CAPTURE') == "disable":
        posthog.capture("not_distinct", event_name, event_properties)