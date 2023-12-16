import requests

def send_update(model_id, key, value):
    url = 'https://app-haven-run.onrender.com/api/hooks/update'
    headers = {
        'x-secret': 'SECRET',
        'Content-Type': 'application/json'
    }
    data = {
        'id': model_id,
        'key': key,
        'value': value
    }

    print("sending request", dict(
        url=url,
        headers=headers,
        data=data
    ))

    response = requests.post(url, headers=headers, json=data)

    print("response code", response.status_code)

    return response




